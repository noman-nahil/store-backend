const bcrypt = require("bcrypt");
const User = require("../models/userModel");
const {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} = require("../utils/jwt");

const COOKIE_NAME = "refreshToken";
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  // domain: process.env.COOKIE_DOMAIN, // optional in production
  maxAge: 7 * 24 * 60 * 60 * 1000, // default 7 days, overwritten by token expiry
};

exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: "Email and password required" });

    const existing = await User.findOne({ email });
    if (existing)
      return res.status(400).json({ error: "Email already in use" });

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = new User({
      name,
      email,
      passwordHash,
      role: role || "customer",
    });

    await user.save();

    // don't return passwordHash
    const userSafe = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    res.status(201).json({ user: userSafe });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: "Email and password required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "Invalid credentials" });
    if (!user.isActive)
      return res.status(403).json({ error: "Account inactive" });

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) return res.status(400).json({ error: "Invalid credentials" });

    const payload = {
      sub: user._id.toString(),
      role: user.role,
      email: user.email,
    };

    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    // store refresh token in DB (so we can revoke)
    user.refreshTokens.push(refreshToken);
    if (user.refreshTokens.length > 3) {
      user.refreshTokens = user.refreshTokens.slice(-3);
    }
    await user.save();

    // set httpOnly cookie for refresh token
    res.cookie(COOKIE_NAME, refreshToken, COOKIE_OPTIONS);

    res.json({
      accessToken,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.refresh = async (req, res) => {
  try {
    const token = req.cookies && req.cookies[COOKIE_NAME];
    if (!token) return res.status(401).json({ error: "No refresh token" });

    let payload;
    try {
      payload = verifyRefreshToken(token);
    } catch (e) {
      return res.status(401).json({ error: "Invalid refresh token" });
    }

    const user = await User.findById(payload.sub);
    if (!user) return res.status(401).json({ error: "Invalid token user" });

    // ensure token is one we issued
    if (!user.refreshTokens.includes(token)) {
      // possible reuse/revoked
      user.refreshTokens = []; // revoke all refresh tokens for safety
      await user.save();
      return res.status(401).json({ error: "Refresh token revoked" });
    }

    // issue new tokens
    const newPayload = {
      sub: user._id.toString(),
      role: user.role,
      email: user.email,
    };
    const accessToken = signAccessToken(newPayload);
    const refreshToken = signRefreshToken(newPayload);

    // replace refresh token in DB (rotate)
    user.refreshTokens = user.refreshTokens.filter((t) => t !== token);
    user.refreshTokens.push(refreshToken);
    await user.save();

    // set cookie
    res.cookie(COOKIE_NAME, refreshToken, COOKIE_OPTIONS);

    res.json({ accessToken });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.logout = async (req, res) => {
  try {
    const token = req.cookies && req.cookies[COOKIE_NAME];
    if (token) {
      // remove token from db
      const payload = (() => {
        try {
          return verifyRefreshToken(token);
        } catch (e) {
          return null;
        }
      })();

      if (payload) {
        const user = await User.findById(payload.sub);
        if (user) {
          user.refreshTokens = user.refreshTokens.filter((t) => t !== token);
          await user.save();
        }
      }
    }

    // clear cookie
    res.clearCookie(COOKIE_NAME);
    return res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.me = async (req, res) => {
  try {
    // authMiddleware will set req.user
    if (!req.user) return res.status(401).json({ error: "Not authenticated" });
    const u = await User.findById(req.user.sub).select(
      "-passwordHash -refreshTokens"
    );
    res.json(u);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};
