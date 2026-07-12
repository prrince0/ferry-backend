const ferryController = require("../controllers/ferryController");
const express = require("express");
const router = express.Router();
const { protect, restrictTo } = require("../middleware/authmiddleware");

// Public routes
router.get("/", protect, ferryController.getAllFerries);


router.get(
  "/my-ferries",
  protect,
  restrictTo("admin"),
  ferryController.getMyFerries
);

router.get("/:id", protect, ferryController.getFerryById);

// Admin routes
router.post("/", protect, restrictTo("admin"), ferryController.createFerry);
router.put("/:id", protect, restrictTo("admin"), ferryController.updateFerry);
router.delete("/:id", protect, restrictTo("admin"), ferryController.deleteFerry);

module.exports = router;