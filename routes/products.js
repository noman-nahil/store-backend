const router = require("express").Router();
const productController = require("../controllers/productController");
const {
  authMiddleware,
  roleMiddleware,
} = require("../middleware/authMiddleware");

// Public
router.get("/", productController.list);
router.get("/:id", productController.getById);

// Protected
router.post(
  "/",
  authMiddleware,
  roleMiddleware(["admin", "manager"]),
  productController.create
);
router.put(
  "/:id",
  authMiddleware,
  roleMiddleware(["admin", "manager"]),
  productController.update
);

// Admin only
router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware("admin"),
  productController.remove
);

module.exports = router;
