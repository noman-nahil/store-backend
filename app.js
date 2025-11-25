require("dotenv").config();
const express = require("express");
const cors = require("cors");
const dbConnect = require("./utils/db");

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to DB
dbConnect();

app.use(cors());
app.use(express.json());

// routes
app.use("/api", require("./routes/index"));

// health
app.get("/health", (req, res) =>
  res.json({ status: "ok", time: new Date().toISOString() })
);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
