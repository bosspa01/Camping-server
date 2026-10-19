const express = require("express");
const router = express.Router();
// controllers
const {
  listBookings,
  createBooking,
  checkOut,
  checkOutStatus,
} = require("../controllers/booking");
const { authCheck, requireProfile } = require("../middlewares/auth");

// @ENDPOINT http://localhost:5000/api/bookings
router.get("/bookings", authCheck, requireProfile, listBookings);

// @ENDPOINT http://localhost:5000/api/booking
router.post("/booking", authCheck, requireProfile, createBooking);

// @Patment
// @ENDPOINT http://localhost:5000/api/checkout
router.post("/checkout", authCheck, requireProfile, checkOut);

router.get("/checkout-status/:session_id", authCheck, requireProfile, checkOutStatus);

module.exports = router;
