const Product = require("../model/product");

const addProduct = async (req, res) => {
    try {
        const { imageUrl, productName, category, brand, price, stock } = req.body;

        if (!imageUrl || !productName || !category || !brand || !price || !stock) {
            return res.status(400).json({ msg: "All product fields are required." });
        }

        const product = await Product.create({
            imageUrl,
            productName,
            category,
            brand,
            price,
            stock,
        });

        res.status(201).json(product);
    } catch (error) {
        console.error("Error adding product:", error);
        res.status(500).json({ msg: "Failed to add product.", error: error.message });
    }
};

const getAllProducts = async (req, res) => {
    try {
        const products = await Product.find().sort({ createdAt: -1 });
        res.json(products);
    } catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).json({ msg: "Failed to fetch products.", error: error.message });
    }
};

const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;

        const deleted = await Product.findByIdAndDelete(id);
        if (!deleted) {
            return res.status(404).json({ msg: "Product not found." });
        }

        res.json({ msg: "Product deleted successfully." });
    } catch (error) {
        console.error("Error deleting product:", error);
        res.status(500).json({ msg: "Failed to delete product.", error: error.message });
    }
};

const fetchProductForUpdate = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await Product.findById(id);

        if (!product) {
            return res.status(404).json({ msg: "Product not found." });
        }

        res.json(product);
    } catch (error) {
        console.error("Error fetching product:", error);
        res.status(500).json({ msg: "Failed to fetch product.", error: error.message });
    }
};

const updateData = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const product = await Product.findByIdAndUpdate(id, updates, {
            new: true,
            runValidators: true,
        });

        if (!product) {
            return res.status(404).json({ msg: "Product not found." });
        }

        res.json(product);
    } catch (error) {
        console.error("Error updating product:", error);
        res.status(500).json({ msg: "Failed to update product.", error: error.message });
    }
};

module.exports = {
    addProduct,
    getAllProducts,
    deleteProduct,
    fetchProductForUpdate,
    updateData,
};
