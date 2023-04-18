const mongoose = require('mongoose');

const houseSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  address: {
    type: String,
    require: [true, "A house for rent must be have address"],
  },
  price: {
    type: Number,
    require: [true, "A house for rent must be have price"],
  },
  status: {
    type: Boolean,
    default: false,
  },
  images: [String],
  createdAt: {
    type: Date,
    default: Date.now(),
    select: false,
  },
  description: {
    type: String,
    trim: true,
    required: [true, "A tour must have a description"],
  },
  areaFloor: Number,
  numOfFloor: Number,
  numOfBedroom: Number,
  numOfBathroom: Number,
  ratingAverage: Number,
  ratingQuantity: {
    type: Number,
    default: 0
  }
});

const House = mongoose.model('House', houseSchema);

module.exports = House;