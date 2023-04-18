const mongoose = require('mongoose');


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

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;