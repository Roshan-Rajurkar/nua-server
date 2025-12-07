const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();

const { connectDB } = require("./src/config/db.js");
const authRoutes = require("./src/route/auth.route.js");
const fileRoutes = require("./src/route/file.route.js");

const app = express();

app.use(cors());
app.use(express.json());

connectDB();

app.use("/api/auth", authRoutes);
app.use("/api/files", fileRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
