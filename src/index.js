import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";

import authRouter from "./routes/auth.js";
import userRouter from "./routes/user.js"
import meetupRouter from "./routes/meetups.js";

const app = express();


const allowedOrigins = [
  "http://localhost:5173", 
  "http://meetup-frontend-12345.s3-website.eu-north-1.amazonaws.com",
  "https://meetup-frontend-12345.s3.eu-north-1.amazonaws.com", 
];


app.use((req, res, next) => {
  const origin = req.headers.origin;
  console.log("🌐 CORS request from:", origin);

  if (allowedOrigins.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
  } else {
    console.warn("Origin not in allowed list:", origin);
    
    res.header("Access-Control-Allow-Origin", "*");
  }

  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-Requested-With"
  );
  res.header("Access-Control-Allow-Credentials", "true");

  
  if (req.method === "OPTIONS") {
    console.log("✅ Preflight request handled");
    return res.sendStatus(204);
  }

  next();
});

app.use(express.json());

app.use("/api/auth", authRouter);
app.use("/api/me", userRouter)
app.use("/api/meetups", meetupRouter);

app.get("/", (req, res) => {
  res.send("✅ Meetup backend is running! " + new Date().toISOString());
});


app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "❌ Route not found: " + req.originalUrl,
  });
});


const PORT = process.env.PORT || 8080;
const MONGO_URI = process.env.MONGO_URI;

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log(" MongoDB connected");
    app.listen(PORT, () =>
      console.log(`🚀 Server running at http://localhost:${PORT}`)
    );
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });
