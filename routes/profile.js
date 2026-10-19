const express = require("express");
const router = express.Router();
// controllers
const { createProfile, readProfile } = require("../controllers/profile");
const { authCheck } = require("../middlewares/auth");


// @ENDPOINT http://localhost:5000/api/profile
router.post("/profile", authCheck, createProfile);
router.get("/profile", authCheck, readProfile);


module.exports = router;