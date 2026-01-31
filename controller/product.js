const Product = require("../model/product");



async function addProduct(req, res) {


    const product = await Product.create(req.body);

    if (!product) {
        consolse.log("no product ");
    }

    return res.status(201).json({ msg: "product added successfully" });

}

async function getAllProducts(req, res) {


    const allProduct = await Product.find({ status: true });

    return res.status(200).json(allProduct);

}

async function deleteProduct(req, res) {

    try {

        const delProduct = await Product.findByIdAndUpdate(req.params.id, { status: false }, { new: true });


        if (!delProduct) {
            return res.status(404).json({
                message: "for DELETE operation no product found for given id "
            })
        }

        return res.json({
            msg: `Deletion done for given id: ${delProduct.productName}`,
        });
    } catch (error) {
        console.log("error for product deletion by id : ", error);
        return res.status(500).json({
            error: error.message,
        })
    }

}

async function fetchProductForUpdate(req, res) {

    try {

        const { id } = req.params;
        // console.log('id :>> ', id);
        const products = await Product.findById(id);

        return res.status(200).json({
            status: true,
            msg: "data fetch successfully",
            data: products
        })
    } catch (e) {
        console.log("error for product fetch to edit : ", error);
        return res.status(500).json({
            error: e.message,
        })
    }
}

async function updateData(req, res) {

    try {
        const { id } = req.params;

        const updatedData = req.body;

        const updatedProduct = await Product.findByIdAndUpdate(id, updatedData,
            { new: true }
        )

        if (!updatedProduct) {
            return res.status(200).json({
                message: "for UPDATE operation no product found for given id "
            })
        }

        return res.json({
            msg: `UPDATION done for given id: ${updatedProduct.productName}`,
            product: updatedProduct,
        });
    } catch (error) {
        console.log("error for product UPDATE by id : ", error);
        return res.status(500).json({
            error: error.message,
        })
    }
}



module.exports = {
    addProduct,
    getAllProducts,
    deleteProduct,
    fetchProductForUpdate,
    updateData
}