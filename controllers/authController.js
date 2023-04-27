const { promisify } = require("util");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("./../models/userModel");
const Otp = require("./../models/otpModel");
const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appError");
const Email = require("./../utils/email");


const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, req, res) => {
  const token = signToken(user._id);

  res.cookie("jwt", token, {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: req.secure || req.headers["x-forwarded-proto"] === "https",
  });

  // Remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
};

// const sendEmailVerify = catchAsync(async (req, res, next) => {
//   try {
//     if (!req.body.email) {
//       return next(new AppError("Missing email params", 502));
//     }

//     let user = await User.findOne({ email: req.body.email });
//     if (!user) {
//       return next(new AppError("Missing email params", 502));
//     }

//     let checkExists = await Otp.findOne({ userId: user._id });
//     let otp = checkExists
//       ? await Otp.findOneAndUpdate(
//           { userId: user._id },
//           {
//             expiredCode: Date.now() + 3e5,
//             code: Math.floor(Math.random() * 1e6),
//           },
//           { new: true }
//         )
//       : await Otp.create({ userId: user._id, email: req.body.email });
//     const mailOptions = {
//       from: "xuantuan1124@gmail.com",
//       to: req.body.email,
//       subject: "Verify account",
//       html: `<h3>Mã xác thực của bạn là: </h3><b>${otp.code}</b>`,
//     };
//     Email.sendMail(req, res, next, mailOptions);
//   } catch (error) {
//     next(error);
//   }
// });

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create(req.body);

  let otp = await Otp.create({ userId: newUser._id, email: req.body.email });

  const mailOptions = {
    from: "xuantuan1124@gmail.com",
    to: req.body.email,
    subject: "Verify account",
    html: `<h3>Mã xác thực của bạn là: </h3><b>${otp.code}</b>`,
  };

  Email.sendMail(req, res, next, mailOptions);

  createSendToken(newUser, 201, req, res);
});

exports.verifyEmail = catchAsync(async (req, res, next) => {
    try {
      if (!req.body.email) {
        throw new ErrorHandler(502, "Missing email params");
      }
      let user = await User.findOne({ email: req.body.email });
      if (!user) {
        return next(new AppError("Missing email params", 502));
      }
      let otp = await Otp.findOne({ userId: user._id });
      if (!otp) {
        return next(new AppError("No otp", 400));
      }
      if (req.body.code != otp.code) {
        return next(new AppError("invalid code", 400));
      }
      let currentTime = Date.now();
      if (currentTime >= otp.expiredCode) {
        return next(new AppError("expired code", 400));
      }
  
      await User.updateOne(
        { _id: user._id },
        { isVerified: true, email: req.query.email }
      );
      res.json({ message: "verify successful" });
    } catch (error) {
      next(error);
    }
  });
  



exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // 1) Check if email and password exist
  if (!email || !password) {
    return next(new AppError("Please provide email and password!", 400));
  }
  // 2) Check if user exists && password is correct
  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError("Incorrect email or password", 401));
  }
 
  if(user.isVerified == false) {
    return next(new AppError("This user have not verified", 401));
  }
  

  // 3) If everything ok, send token to client
  createSendToken(user, 200, req, res);
});

exports.logout = (req, res) => {
  res.cookie("jwt", "loggedout", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({ status: "success" });
};

exports.protect = catchAsync(async (req, res, next) => {
  // 1.Getting token and check of it's there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }
  console.log(token);

  if (!token) {
    return next(new AppError("You are not logged in", 401));
  }
  // 2.Verification token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  console.log(decoded);
  // 3.Check if user still exists
  const freshUser = await User.findById(decoded.id);
  // console.log(freshUser);
  if (!freshUser) {
    return next(new AppError("The user belonging does longer exist"));
  }

  // 4.Check if user changed password after the token was issued
  if (freshUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError("User recently changed password! Please log in again"),
      401
    );
  }

  req.user = freshUser;
  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // roles
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError("You do not have permission to perform this action", 403)
      );
    }

    next();
  };
};

exports.forgotPassword = async (req, res, next) => {
  try {
    if (!req.body.email) {
      return next(new AppError("Missing email params", 502));
    }

    let user = await User.findOne({ email: req.body.email });
    if (!user) {
      return next(new AppError("Missing email params", 502));
    }

    let checkExists = await Otp.findOne({ userId: user._id });
    let otp = checkExists
      ? await Otp.findOneAndUpdate(
          { userId: user._id },
          {
            expiredCode: Date.now() + 3e5,
            code: Math.floor(Math.random() * 1e6),
          },
          { new: true }
        )
      : await Otp.create({ userId: user._id, email: req.body.email });
    const mailOptions = {
      from: "xuantuan1124@gmail.com",
      to: req.body.email,
      subject: "Verify account",
      html: `<h3>Mã xác thực của bạn là: </h3><b>${otp.code}</b>`,
    };
    Email.sendMail(req, res, next, mailOptions);
  } catch (error) {
    next(error);
  }
};

// exports.verifyCode = catchAsync(async (req, res, next) => {
//   try {
//     if (!req.body.email) {
//       throw new ErrorHandler(502, "Missing email params");
//     }
//     let user = await User.findOne({ email: req.body.email });
//     let otp = await Otp.findOne({ userId: user._id });
//     if (!otp) {
//       return next(new AppError("No otp", 400));
//     }
//     if (req.body.code != otp.code) {
//       return next(new AppError("invalid code", 400));
//     }
//     let currentTime = Date.now();
//     if (currentTime >= otp.expiredCode) {
//       return next(new AppError("expired code", 400));
//     }

//     await User.updateOne(
//       { _id: user._id },
//       { isVerified: 1, email: req.query.email }
//     );
//     res.json({ message: "verify successful" });
//   } catch (error) {
//     next(error);
//   }
//   next();
// });

exports.resetPassword = catchAsync(async (req, res, next) => {
  if (!req.body.email) {
    throw new ErrorHandler(502, "Missing email params");
  }
  let user = await User.findOne({ email: req.body.email });
  // 2. If token has not expired, and there is user, set the new password
  if (!user) {
    return next(new AppError("There is no user with reset password", 404));
  }
  let otp = await Otp.findOne({ userId: user._id });
  if (!otp) {
    return next(new AppError("No otp", 400));
  }
  if (req.body.code != otp.code) {
    return next(new AppError("Invalid code", 400));
  }
  let currentTime = Date.now();
  if (currentTime >= otp.expiredCode) {
    return next(new AppError("Expired code", 400));
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();

 

  // Log in user in, send JWT
  createSendToken(user, 200, req, res);
});

// exports.updatePassword = catchAsync(async (req, res, next) => {
//   const user = await User.findById(req.user.id).select("+password");

//   if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
//     return next(new AppError("Your current password is wrong.", 401));
//   }
//   user.password = req.body.password;
//   user.passwordConfirm = req.body.passwordConfirm;

//   await user.save();

//   createSendToken(user, 200, req, res);
// });

exports.isLoggedIn = async (req, res, next) => {
  if (req.cookies.jwt) {
    try {
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET
      );
      const currentUser = await User.findById(decoded.id);
      // console.log(freshUser);
      if (!currentUser) {
        return next();
      }

      // 4.Check if user changed password after the token was issued
      if (currentUser.changedPasswordAfter(decoded.iat)) {
        return next();
      }

      res.locals.user = currentUser;
      return next();
    } catch (err) {
      return next();
    }
  }
  next();
};
