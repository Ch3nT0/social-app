const express = require('express');
const router = express.Router();
const controller = require("../../controllers/client/auth.controller");

router.post('/register', controller.registerUser);
router.post('/login', controller.loginUser);
router.post('/password/forgot', controller.forgotPassword);
router.post('/password/reset', controller.resetPassword);
router.post('/password/otp', controller.verifyOtp);

module.exports = router;