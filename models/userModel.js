const mongoose = require("mongoose");


const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, "A user must have a username"],
    trim: true,
    maxlength: [30, "Username must be have less or equal than 40 characters"],
    minlength: [3, "Username must be have less or equal than 40 characters"],
  },
  password: {
    type: String,
    required: [true, "Please provide your password"],
    minlength: [8, "A password must be have more or equal than 8 characters"],
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, "Please confirm your password"],
    validate: {
      validator: function (el) {
        return el === this.password;
      },
      message: "Password are not the same",
    },
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
  firstName: {
    type: String,
    required: [true, "A user must have a name"],
    trim: true,
    maxlength: [30, "Name must be have less or equal than 40 characters"],
    minlength: [3, "Name must be have less or equal than 40 characters"],
  },
  lastName: {
    type: String,
    required: [true, "A user must have a last name"],
    trim: true,
    maxlength: [30, "Last name must be have less or equal than 40 characters"],
    minlength: [3, "Last name must be have less or equal than 40 characters"],
  },

  gender: {
    type: Boolean,
    default: true,
    select: false,
  },
  email: {
    type: String,
    required: [true, 'Please provide your email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email']
  },
  role: {
    type: String,
    enum: ['user', 'householder', 'admin'],
    default: 'user'
  },
});
