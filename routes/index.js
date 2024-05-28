// routeIndex.js
const express = require("express");
const loginRoutes = require("./loginRoute");
const candidateRoutes = require("./candidateRoute");
const recruiterRoutes = require("./recruiterRoute");
const adminRoutes = require("./adminRoute");

const router = express.Router();

router.use(loginRoutes);
router.use(candidateRoutes);
router.use(recruiterRoutes);
router.use(adminRoutes);

module.exports = router;