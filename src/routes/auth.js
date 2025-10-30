import express from "express";
import User from "../models/User.js";
import { generateToken } from "../utils/jwt.js";
const router = express.Router();

// Skapa användare
router.post("/signup", async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if ((!email, !password, !name)) {
      return res.status(401).json({ message: "Alla fält behöver fyllas i" });
    }

    const existingMail = await User.findOne({ email: email.toLowerCase() });
    if (existingMail) {
      return res.status(400).json({
        message: "Denna användaren finns redan",
      });
    }

    const user = await User.create({
      email,
      password,
      name
    });

    const token = generateToken(user._id);

    res.status(201).json({
      message: "Användare skapad",
      token,
      user: {
        id: user._id,
        email: user.email,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("Reg error", error);
    res.status(500).json({
      error: "Failade att skapa en user",
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
        .json({ error: "Måste skriva in email och lösenord" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(400).json({ error: "Ogiltig email" });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(400).json({ error: "Fel lösenord" });
    }

    const token = generateToken(user._id);

    res.json({
      message: "Inloggad!",
      token,
      user: {
        id: user._id,
        email: user.email,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("Login error", error)
  }
});

export default router;