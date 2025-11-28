import express from "express";
const router = express.Router();

import {
  registerUser,
  loginUser,
  getUserHistory,
  addToHistory,
} from "../controller/user.conroller.js";

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/get-all-history", getUserHistory);
router.post("/add-to-history", addToHistory);

export default router;
