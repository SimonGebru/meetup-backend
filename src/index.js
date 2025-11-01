import "dotenv/config";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";

import authRouter from "./routes/auth.js";
import meetupRouter from "./routes/meetups.js";

const app = express();

/*CORS-konfiguration  */
const allowedOrigins = [
  "http://localhost:5173",
  "http://meetup-frontend-12345.s3-website.eu-north-1.amazonaws.com",
];

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
  }
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-Requested-With"
  );
  res.header("Access-Control-Allow-Credentials", "true");

 
  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  next();
});

app.use(express.json());

app.use("/api/auth", authRouter);
app.use("/api/meetups", meetupRouter);

app.get("/", (req, res) => {
  res.send("✅ Meetup backend is running! " + new Date().toISOString());
});

const PORT = process.env.PORT || 8080;
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/meetup";

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(PORT, () =>
      console.log(`🚀 Server running at http://localhost:${PORT}`)
    );
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });
