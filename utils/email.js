
const nodemailer = require("nodemailer");
const dotenv = require('dotenv');

dotenv.config({ path: './config.env' });

const transporter = nodemailer.createTransport({
  service: "Gmail",
  host: "smtp.gmail.com",
  port: 465,
  auth: {
    user: process.env.USERNAME_EMAIL,
    pass: process.env.PASSWORD_EMAIL
  }
});

exports.sendMail = (_req, res, _next, mailOptions) => {
  transporter.sendMail(mailOptions, function(err, info) {
    if (err) {
      res.status(400).json({ statusCode: 400, message: err });
    } else {
      res.status(200).json({ statusCode: 200, message: info.response });
    }
  });
};