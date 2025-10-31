import mongoose from "mongoose";

export const CATEGORY_OPTIONS = [
  "Tech",
  "Sport",
  "Art",
  "Food",
  "Music",
  "Business",
];

const meetupSchema = new mongoose.Schema(
  {
    title: { 
        type: String, 
        required: true, 
        trim: true 
    },

    description: { 
        type: String, 
        default: "" 
    },

    date: { 
        type: Date, 
        required: true, 
        index: true 
    },        

    location: { 
        type: String, 
        default: "" 
    },

    host: { 
        type: String, 
        required: true 
    },        
                 
    maxParticipants: { 
        type: Number, 
        default: 20, 
        min: 1 
    },

    participants: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User" 
    }],

    categories: [{ 
        type: String, 
        enum: CATEGORY_OPTIONS 
    }],               

  },
  { timestamps: true }
);


meetupSchema.virtual("isFull").get(function () {
  return this.participants?.length >= this.maxParticipants;
});

export default mongoose.model("Meetup", meetupSchema);
