const express = require("express");
const router = express.Router();
// controllers
const { createProfile, readProfile, applyHost } = require("../controllers/profile");
const { authCheck, requireProfile } = require("../middlewares/auth");


// @ENDPOINT http://localhost:5000/api/profile
router.post("/profile", authCheck, createProfile);
router.get("/profile", authCheck, readProfile);

router.post("/host-application", authCheck, requireProfile, applyHost);


module.exports = router;