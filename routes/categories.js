const router = require("express").Router();
const controller = require("../controllers/categoryController");
const {
  authMiddleware,
  roleMiddleware,
} = require("../middleware/authMiddleware");

//public
router.get("/active", controller.listActive);
router.get("/", controller.list);
router.get("/:id", controller.getById);

//admin and manager
router.post(
  "/",
  authMiddleware,
  roleMiddleware(["admin", "manager"]),
  controller.create
);
router.put(
  "/:id",
  authMiddleware,
  roleMiddleware(["admin", "manager"]),
  controller.update
);

// DELETE SAFETY NOTE
// Products may still be linked to this category/subcategory.
// Deleting it now can cause invalid product data.
// In future, implement one of the following:
// 1) Block delete if related products exist
// 2) Soft-delete (isDeleted = true)
// 3) Auto-reassign products to a fallback category (optional)
router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware("admin"),
  controller.remove
);

module.exports = router;
