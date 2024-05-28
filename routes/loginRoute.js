const express = require("express")
const { sentOtp, login } = require("../controller/app/login")
const router = express.Router()

router.post("/auth/sent-otp", sentOtp);
router.post("/auth/login", login);

module.exports = router