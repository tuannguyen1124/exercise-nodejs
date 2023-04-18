const catchAsync = require('../utils/catchAsync');
const Email = require('../utils/email');
const Otp = require('./../models/otpModel');
const AppError = require('./../utils/appError');
const factory = require('./handlerFactory');

exports.sendEmailVerify = catchAsync(async (req, res, next) => {
    try {
      if (!req.query.email) {
        throw new ErrorHandler(502, "Missing email params");
      }
      let checkExists = await Otp.findOne({ userId: req.user._id });
      let otp = checkExists
        ? await Otp.findOneAndUpdate(
            { userId: req.user._id },
            {
              expiredCode: Date.now() + 3e5,
              code: Math.floor(Math.random() * 1e6)
            },
            { new: true }
          )
        : await Otp.create({ userId: req.user._id, email: req.query.email });
      const mailOptions = {
        from: "xuantuan1124@gmail.com",
        to: req.query.email,
        subject: "Verify account",
        html: `<h3>Mã xác thực của bạn là: </h3><b>${otp.code}</b>`
      };
      sendMail(req, res, next, mailOptions);
    } catch (error) {
      next(error);
    }
});

exports.verifyEmail = catchAsync(async (req, res, next) => {
    try {
      if (!req.query.email) {
        throw new ErrorHandler(502, "Missing email params");
      }
      let otp = await Otp.findOne({ userId: req.user._id });
      if (!otp) {
        throw new ErrorHandler(404, "No otp");
      }
      if (req.query.code != otp.code) {
        throw new ErrorHandler(400, "invalid code");
      }
      let currentTime = Date.now();
      if (currentTime >= otp.expiredCode) {
        throw new ErrorHandler(400, "expired code");
      }
  
      await User.updateOne(
        { _id: req.user._id },
        { isVerified: 1, email: req.query.email }
      );
      res.json({ message: "verify successful" });
    } catch (error) {
      next(error);
    }
  });