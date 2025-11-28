import mongoose from "mongoose";

const MeetingSchema = new mongoose.Schema({
  user_id: {
    type: String,
    required: true,
  },
  meetingId: {
    type: String,
    required: true,
    unique: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

const Meeting = mongoose.model("Meeting", MeetingSchema);

export default Meeting;
