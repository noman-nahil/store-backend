const router = require("express").Router();

router.use("/products", require("./products"));
router.use("/categories", require("./categories"));
router.use("/subcategories", require("./subcategories"));
module.exports = router;
