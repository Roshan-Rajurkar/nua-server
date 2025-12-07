const express = require("express");
const {
  getAllUsers,
  login,
  register,
} = require("../controllers/auth.controller.js");
const { getUserId } = require("../middleware/authMiddleware.js");

const authRoutes = express.Router();

authRoutes.get("/users", getUserId, getAllUsers);
authRoutes.post("/register", register);
authRoutes.post("/login", login);

export default authRoutes;
