import express from "express";
import { authMiddleware } from "../middleware/auth.js";
import Meetup from "../models/Meetup.js";
const router = express.Router();

// Hämtar upcoming och past meetups
router.get("/registrations", authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;

    const meetups = await Meetup.find({
      participants: userId,
    })
      .populate("participants", "name email")
      .sort({ date: 1 })
      .lean();

    const now = new Date();
    const upcoming = [];
    const past = [];

    for (const meetup of meetups) {
      const meetupData = {
        id: meetup._id,
        title: meetup.title,
        description: meetup.description,
        date: meetup.date,
        location: meetup.location,
        host: meetup.host,
        categories: meetup.categories,
        maxParticipants: meetup.maxParticipants,
        participantCount: meetup.participants?.length || 0,
        spotsLeft: meetup.maxParticipants - (meetup.participants?.length || 0),
        isFull: (meetup.participants?.length || 0) >= meetup.maxParticipants,
        participants: meetup.participants,
        createdAt: meetup.createdAt,
        updatedAt: meetup.updatedAt,
      };

      if (new Date(meetup.date) >= now) {
        upcoming.push(meetupData);
      } else {
        past.push(meetupData);
      }
    }

    res.json({
      upcoming,
      past,
    });
  } catch (error) {
    console.error("GET /registrations error", error);
    res.status(500).json({
      error: "Failed to fetch registrations",
    });
  }
});

export default router;
