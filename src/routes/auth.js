import express from "express";
import User from "../models/User.js";
import { generateToken } from "../utils/jwt.js";
const router = express.Router();

// Skapa användare
router.post("/signup", async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if ((!email, !password, !name)) {
      return res.status(401).json({ message: "All fields are required" });
    }

    const existingMail = await User.findOne({ email: email.toLowerCase() });
    if (existingMail) {
      return res.status(400).json({
        message: "This user already exists",
      });
    }

    const user = await User.create({
      email,
      password,
      name
    });

    const token = generateToken(user._id);

    res.status(201).json({
      message: "User created",
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("Reg error", error);
    res.status(500).json({
      error: "Failed to create user",
    });
  }
});

// Logga in
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if ((!email, !password)) {
      return res
        .status(400)
        .json({ error: "Email and password are required" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(400).json({ error: "Invalid email" });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(400).json({ error: "Invalid password" });
    }

    const token = generateToken(user._id);

    res.json({
      message: "Logged in!",
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("Login error", error)
  }
});

export default router;