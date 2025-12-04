const jwt = require("jsonwebtoken");

// authMiddleware reads Authorization header: "Bearer <token>"
exports.authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token provided" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // set req.user with minimal payload
    req.user = { sub: decoded.sub, role: decoded.role, email: decoded.email };
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};

// roleMiddleware: pass allowed roles, e.g., roleMiddleware("admin") or roleMiddleware(["admin","manager"])
exports.roleMiddleware = (allowed) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ error: "Not authenticated" });

  const allowedRoles = Array.isArray(allowed) ? allowed : [allowed];
  if (!allowedRoles.includes(req.user.role)) {
    return res.status(403).json({ error: "Forbidden: insufficient role" });
  }
  next();
};
