const mongoose = require("mongoose");

module.exports = function dbConnect() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error("MONGO_URI not set in env");
    process.exit(1);
  }
  mongoose.set("strictQuery", false);
  mongoose
    .connect(uri, {})
    .then(() => console.log("MongoDB connected"))
    .catch((err) => {
      console.error("MongoDB connection error:", err);
      process.exit(1);
    });
};
