import express from "express";
import {
  getAllUsers,
  login,
  register,
} from "../controllers/auth.controller.js";
import { getUserId } from "../middleware/authMiddleware.js";

const authRoutes = express.Router();

authRoutes.get("/users", getUserId, getAllUsers);
authRoutes.post("/register", register);
authRoutes.post("/login", login);

export default authRoutes;
