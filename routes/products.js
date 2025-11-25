const router = require("express").Router();
const productController = require("../controllers/productController");

router.get("/", productController.list);
router.get("/:id", productController.getById);

// Protected
router.post("/", productController.create);
router.put("/:id", productController.update);
router.delete("/:id", productController.remove);

module.exports = router;
