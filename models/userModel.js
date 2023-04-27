const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, "A user must have a username"],
    trim: true,
    unique: true,
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
  firstName: {
    type: String,
    trim: true,
    maxlength: [40, "Name must be have less or equal than 40 characters"],
    minlength: [1, "First name must be have more or equal than 1 characters"],
  },
  lastName: {
    type: String,
    trim: true,
    maxlength: [40, "Last name must be have less or equal than 40 characters"],
    minlength: [1, "Last name must be have more or equal than 1 characters"],
  },

  gender: {
    type: Boolean,
    default: true,
    select: false,
  },
  email: {
    type: String,
    required: [true, "Please provide your email"],
    unique: true,
    lowercase: true,
    // validate: [validator.isEmail, 'Please provide a valid email']
  },
  address: {
    type: String
  },
  photo: { type: String, default: 'default.jpg' },
  isVerified: {
    type: Boolean,
    default: false,
  },
  role: {
    type: String,
    enum: ["user", "householder", "admin"],
    default: "user",
  },
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);

  this.passwordConfirm = undefined;
  next();
});

userSchema.pre("save", function (next) {
  if (!this.isModified("password") || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;
  next();
});

userSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });
  next();
});

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    // console.log(changedTimestamp, JWTTimestamp);
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};



const User = mongoose.model("User", userSchema);

module.exports = User;
