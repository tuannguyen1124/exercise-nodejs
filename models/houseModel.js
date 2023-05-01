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
  imageCover: {
    type: String,
    required: [true, 'A house must have a cover image'],
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
    required: [true, "A house must have a description"],
  },
  areaFloor: Number,
  numOfFloor: Number,
  numOfBedroom: Number,
  numOfBathroom: Number,
  ratingAverage: {
    type: Number,
    default: 4.5,
    min: [1, 'Rating must be above 1.0'],
    max: [5, 'Rating must be below 5.0'],
    set: (val) => Math.round(val * 10) / 10,
  },
  ratingQuantity: {
    type: Number,
    default: 0
  }
});

const House = mongoose.model('House', houseSchema);

module.exports = House;