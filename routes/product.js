const express = require("express");
const router = express.Router();

// const { addProduct, getAllProducts, deleteProduct, fetchProductForUpdate, updateData } = require("../controller/product");
const roleMiddleware = require("../middleware/roleMiddleware");


// router.get("/", getAllProducts);
// router.post("/create", addProduct);
// router.post("/del/:id", roleMiddleware,  deleteProduct);
// router.put("/edit/:id", updateData);
// router.get("/edit/:id", fetchProductForUpdate);


module.exports = router;

