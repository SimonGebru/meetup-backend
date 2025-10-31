import { Router } from "express";
import mongoose from "mongoose";
import Meetup from "../models/Meetup.js";
import User from "../models/User.js";
import { authMiddleware } from "../middleware/auth.js";
import { CATEGORY_OPTIONS } from "../models/Meetup.js";

const router = Router();


// get all meetups sorterat med date
router.get("/", async (req, res) => {
  try {
    const meetups = await Meetup.find({ date: { $gte: new Date() } })
      .sort({ date: 1 })
      .lean();

    res.json(meetups);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch meetups" });
  }
});


// get specifik meetup genom id
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid meetup id" });
    }

    const meetup = await Meetup.findById(id)
      .populate("participants", "_id name email")
      .lean();

    if (!meetup) return res.status(404).json({ message: "Meetup not found" });
    res.json(meetup);
  } catch (err) {
    console.error("GET /meetups/:id error", err);
    res.status(500).json({ message: "Failed to fetch meetup" });
  }
});


//skapa en meetup, frontend måste skicka med allt som står nedan including host
router.post("/", authMiddleware, async (req, res) => {
  try {
    const {
      title,
      description = "",
      date,
      location = "",
      host,
      maxParticipants = 20,
      categories = [], 
    } = req.body;

    if (!title || !date || !host) {
      return res.status(400).json({ message: "title, date, and host are required" });
    }

    const when = new Date(date);
    if (Number.isNaN(when.getTime())) {
      return res.status(400).json({ message: "Invalid date format" });
    }
    if (maxParticipants <= 0) {
      return res.status(400).json({ message: "maxParticipants must be greater than 0" });
    }

    
    if (!Array.isArray(categories)) {
      return res.status(400).json({ message: "categories must be an array of strings" });
    }
    const invalid = categories.filter(c => !CATEGORY_OPTIONS.includes(c));
    if (invalid.length) {
      return res.status(400).json({
        message: "Invalid categories",
        invalid,
        allowed: CATEGORY_OPTIONS,
      });
    }
    const uniqueCategories = [...new Set(categories)];

    const meetup = await Meetup.create({
      title,
      description,
      date: when,
      location,
      host,
      maxParticipants,
      categories: uniqueCategories,
    });

    res.status(201).json(meetup);
  } catch (err) {
    console.error("POST /meetups error:", err);
    res.status(500).json({ message: "Failed to create meetup" });
  }
});


// joina en meetup, kräver token. respekterar också kapacitet och ser till att man inte redan joinat
router.post("/:id/join", authMiddleware, async (req, res) => {
  try {
    const meetupId = req.params.id;
    const userId = req.userId;

    if (!mongoose.isValidObjectId(meetupId)) {
      return res.status(400).json({ message: "Invalid meetup id" });
    }

    const updatedMeetup = await Meetup.findOneAndUpdate(
      {
        _id: meetupId,
        participants: { $ne: userId },
        $expr: { $lt: [{ $size: "$participants" }, "$maxParticipants"] },
      },
      { $addToSet: { participants: userId } },
      { new: true }
    );

    if (!updatedMeetup) {
      const current = await Meetup.findById(meetupId).lean();
      if (!current) return res.status(404).json({ message: "Meetup not found" });

      const already = current.participants?.some(
        p => p.toString() === userId
      );
      if (already) return res.status(409).json({ message: "Already joined" });

      const full = (current.participants?.length || 0) >= current.maxParticipants;
      if (full) return res.status(409).json({ message: "Meetup is full" });

      return res.status(400).json({ message: "Could not join meetup" });
    }

    // lägg till på user att den joinat det mötet
    await User.findByIdAndUpdate(userId, { $addToSet: { meetups: meetupId } });

    res.json({ message: "Joined", meetup: updatedMeetup });
  } catch (err) {
    console.error("POST /meetups/:id/join error", err);
    res.status(500).json({ message: "Failed to join meetup" });
  }
});

// avregga sig själv från ett möte
router.delete("/:id/join", authMiddleware, async (req, res) => {
  try {
    const meetupId = req.params.id;
    const userId = req.userId;

    if (!mongoose.isValidObjectId(meetupId)) {
      return res.status(400).json({ message: "Invalid meetup id" });
    }

    const meetup = await Meetup.findByIdAndUpdate(
      meetupId,
      { $pull: { participants: userId } },
      { new: true }
    );
    if (!meetup) return res.status(404).json({ message: "Meetup not found" });

    await User.findByIdAndUpdate(userId, { $pull: { meetups: meetupId } });

    res.json({ message: "Unregistered", meetup });
  } catch (err) {
    console.error("DELETE /meetups/:id/join error", err);
    res.status(500).json({ message: "Failed to unregister" });
  }
});

//ta bort en meetup, kräver auth
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid meetup id" });
    }

    const deleted = await Meetup.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: "Meetup not found" });

    
    await User.updateMany({}, { $pull: { meetups: id } });

    res.json({ message: "Meetup deleted" });
  } catch (err) {
    console.error("DELETE /meetups/:id error:", err);
    res.status(500).json({ message: "Failed to delete meetup" });
  }
});

export default router;
