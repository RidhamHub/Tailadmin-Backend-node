const express = require("express");
const router = express.Router();

const { addProduct, getAllProducts, deleteProduct, fetchProductForUpdate, updateData } = require("../controller/product");
const roleMiddleware = require("../middleware/roleMiddleware");
const authMiddleware = require("../middleware/authmiddleware");


router.get("/", getAllProducts);
router.post("/create", authMiddleware, addProduct);
router.post("/del/:id", authMiddleware, roleMiddleware,  deleteProduct);
router.put("/edit/:id", authMiddleware, updateData);
router.get("/edit/:id", authMiddleware, fetchProductForUpdate);


module.exports = router;

