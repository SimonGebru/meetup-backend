import "dotenv/config";
import express from "express";
import authRouter from "./routes/auth.js";
import cors from "cors";
import mongoose from "mongoose";
const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRouter);

app.get("/", (req, res) => {
  res.send("Meetup backend!! " + new Date().toISOString());
});

const PORT = process.env.PORT || 8080;
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/meetup";

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(PORT, () => console.log(`Server running on port http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });
