import mongoose from "mongoose";


const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  message: {
    type: String,
    required: [true, 'A message must have content'],
  },
  timestamp: {
    type: Date,
    default: Date.now() + 3e10,
    // 3e5, // 5p
  },
});

export default mongoose.model("Message", messageSchema);