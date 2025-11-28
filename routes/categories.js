const router = require("express").Router();
const controller = require("../controllers/categoryController");

//public
router.get("/active", controller.listActive);

//admin and manager
router.post("/", controller.create);
router.get("/", controller.list);
router.get("/:id", controller.getById);
router.put("/:id", controller.update);

// DELETE SAFETY NOTE
// Products may still be linked to this category/subcategory.
// Deleting it now can cause invalid product data.
// In future, implement one of the following:
// 1) Block delete if related products exist
// 2) Soft-delete (isDeleted = true)
// 3) Auto-reassign products to a fallback category (optional)
router.delete("/:id", controller.remove);

module.exports = router;
