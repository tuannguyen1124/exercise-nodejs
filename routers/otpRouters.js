const express = require('express');
const otpController = require('./../controllers/otpController');


const routes = express.Router();

routes.post("/verify-email", otpController.sendEmailVerify);

routes.post("/verify", otpController.verifyEmail);

export default routes;