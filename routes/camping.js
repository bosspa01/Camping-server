const express = require("express");
const router = express.Router();
const {
  listCamping,
  readCamping,
  createCamping,
  updateCamping,
  deleteCamping,

  actionFavorite,
  listFavorites,

  filterCamping,
} = require("../controllers/camping");

const {
  authCheck,
  requireProfile,
  requireRole,
} = require("../middlewares/auth");

// @ENDPOINT http://localhost:5000/api/camping
// @METHOD GET [ list camping ]
// @ACCESS PUBLIC
router.get("/campings/:id", listCamping);
// @ENDPOINT http://localhost:5000/api/camping/1
// @METHOD GET [ read camping ]
// @ACCESS PUBLIC
router.get("/camping/:id", readCamping);

// @ENDPOINT http://localhost:5000/api/camping
// @METHOD POST , [ create camping ]
// @ACCESS PRIVATE
router.post(
  "/camping",
  authCheck,
  requireProfile,
  requireRole("HOST"),
  createCamping,
);

// @ENDPOINT http://localhost:5000/api/camping/1
// @METHOD PUT , [ edit camping ]
// @ACCESS PRIVATE
router.put(
  "/camping/:id",
  authCheck,
  requireProfile,
  requireRole("HOST"),
  updateCamping,
);

// @ENDPOINT http://localhost:5000/api/camping/1
// @METHOD DELETE , [ Delete camping ]
// @ACCESS PRIVATE
router.delete(
  "/camping/:id",
  authCheck,
  requireProfile,
  requireRole("HOST"),
  deleteCamping,
);

// Favorite Routes
router.post("/favorite", authCheck, requireProfile, actionFavorite);
router.get("/favorites", authCheck, requireProfile, listFavorites);

// Filter
router.get("/filter-camping", filterCamping);

module.exports = router;
