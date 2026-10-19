const express = require("express");
const router = express.Router();
// controllers
const {
  listBookings,
  createBooking,
  checkOut,
  checkOutStatus,
} = require("../controllers/booking");
const { authCheck } = require("../middlewares/auth");

// @ENDPOINT http://localhost:5000/api/bookings
router.get("/bookings", authCheck, listBookings);

// @ENDPOINT http://localhost:5000/api/booking
router.post("/booking", authCheck, createBooking);

// @Patment
// @ENDPOINT http://localhost:5000/api/checkout
router.post("/checkout", authCheck, checkOut);

router.get("/checkout-status/:session_id", authCheck, checkOutStatus);

module.exports = router;
