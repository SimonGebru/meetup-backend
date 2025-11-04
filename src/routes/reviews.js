import express from "express";
import Review from "../models/Reviews.js";
import { authMiddleware } from "../middleware/auth.js";
import Meetup from "../models/Meetup.js";
import mongoose from "mongoose";

const router = express.Router();

// Skapa en review på ett meetup du deltagit i
router.post("/:id/reviews", authMiddleware, async (req, res) => {
  try {
    const meetupId = req.params.id;
    const userId = req.userId;
    const { rating, comment } = req.body;

    if (!mongoose.isValidObjectId(meetupId)) {
      return res.status(400).json({ message: "Invalid meetup ID" });
    }

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        message: "Rating must be between 1-5",
      });
    }

    // Kollar efter meetup
    const meetup = await Meetup.findById(meetupId);
    if (!meetup) {
      return res.status(404).json({
        message: "Meetup not found",
      });
    }

    // Kollar ifall man deltagit i mötet, annars ingen review
    const isParticipant = meetup.participants.some(
      (p) => p.toString() === userId
    );
    if (!isParticipant) {
      return res
        .status(403)
        .json({ message: "You must be registered to this meetup" });
    }

    // Kollar så meetup redan har varit
    const now = new Date();
    if (meetup.date > now) {
      return res.status(400).json({ message: "Can't review this meetup" });
    }

    // Skapar våran review
    const review = await Review.create({
      userId,
      meetupId,
      rating: parseInt(rating),
      comment: comment || "",
    });

    const populateReview = await Review.findById(review._id).populate(
      "userId",
      "name email"
    );
    res.status(201).json({ message: "Review created", review: populateReview });
  } catch (error) {
    console.error("POST id reviews error", error);
    res.status(500).json({ message: "Failed to create review" });
  }
});

// Hämta recensioner från meetup
router.get("/:id/reviews", async (req, res) => {
  try {
    const meetupId = req.params.id;

    if (!mongoose.isValidObjectId(meetupId)) {
      return res.status(400).json({ message: "Invalid meetup ID" });
    }

    const meetup = await Meetup.findById(meetupId);
    if (!meetup) {
      return res.status(400).json({ message: "Meetup not found" });
    }

    const reviews = await Review.find({ meetupId })
      .populate("userId", "name email")
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      reviews: reviews.map((review) => ({
        id: review._id,
        rating: review.rating,
        comment: review.comment,
        createdAt: review.createdAt,
        user: {
          id: review.userId._id,
          name: review.userId.name,
          email: review.userId.email,
        },
      })),
    });
  } catch (error) {
    console.error("GET id reviews error", error);
    res.status(500).json({ message: "Failed to fetch reviews" });
  }
});

export default router;
