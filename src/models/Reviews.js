import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    meetupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Meetup",
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      trim: true,
      default: "",
    },
  },
  { timestamps: true }
);

reviewSchema.index({ userId: 1, meetupId: 1 }, { unique: true });

const Review = mongoose.model("Review", reviewSchema);
export default Review;
