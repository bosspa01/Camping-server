const express = require("express");
const router = express.Router();
// controllers
const {
  listStats,
  listReservations,
  listAllReservations,
  listMyCampings,
  listHostApplications,
  decideHostApplication,
} = require("../controllers/admin");
const {
  authCheck,
  requireProfile,
  requireRole,
} = require("../middlewares/auth");

// @ENDPOINT http://localhost:5000/api/stats
router.get(
  "/stats",
  authCheck,
  requireProfile,
  requireRole("ADMIN"),
  listStats,
);
router.get(
  "/reservations",
  authCheck,
  requireProfile,
  requireRole("HOST"),
  listReservations,
);
router.get(
  "/all-reservations",
  authCheck,
  requireProfile,
  requireRole("HOST"),
  listAllReservations,
);
router.get(
  "/my-campings",
  authCheck,
  requireProfile,
  requireRole("HOST"),
  listMyCampings,
);

router.get(
  "/host-applications",
  authCheck,
  requireProfile,
  requireRole("ADMIN"),
  listHostApplications,
);

router.patch(
  "/host-application/:profileId",
  authCheck,
  requireProfile,
  requireRole("ADMIN"),
  decideHostApplication,
);
module.exports = router;
