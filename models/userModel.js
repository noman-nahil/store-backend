const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: { type: String },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String }, // hashed password
  role: {
    type: String,
    enum: ["admin", "manager", "customer"],
    default: "customer",
  },
  isActive: { type: Boolean, default: true },
  refreshTokens: { type: [String], default: [] }, // store refresh tokens (optional but helpful)
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("User", UserSchema);
