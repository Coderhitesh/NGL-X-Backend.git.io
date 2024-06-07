const Product = require("../models/ProductModel");
const cloudinary = require("cloudinary").v2;
const multer = require('multer');
const path = require('path');
const fs = require('fs/promises');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage }).array('images', 5);
// Config Of Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Create Product 
exports.createProducts = async (req, res) => {
    upload(req, res, async (err) => {
        if (err) {
            return res.status(400).json({
                success: false,
                error: "File upload failed",
                details: err.message
            });
        }

        try {
            const files = req.files;
            // console.log(files)
            if (!files || files.length === 0) {
                return res.status(400).json({
                    success: false,
                    error: "No files uploaded"
                });
            }

            const { productName, afterdiscount, mainPrice, description, availability, categories, tags, stockQuantity } = req.body;

            const emptyFields = [];
            if (!productName) emptyFields.push('productName');
            if (!description) emptyFields.push('description');
            // if (availability === undefined) emptyFields.push('availability');
            if (!categories) emptyFields.push('categories');
            if (!stockQuantity) emptyFields.push('stockQuantity');

            if (emptyFields.length > 0) {
                return res.status(400).json({
                    success: false,
                    error: "Please provide all required fields",
                    missingFields: emptyFields
                });
            }

            const uploadedImages = [];
            for (let index = 0; index < files.length; index++) {
                const file = files[index];
                const tempFilePath = path.join(__dirname, `temp_${file.originalname}`);
                await fs.writeFile(tempFilePath, file.buffer);

                const uploadResult = await cloudinary.uploader.upload(tempFilePath, {
                    folder: 'Cosmetics',
                    public_id: file.originalname
                });

                uploadedImages.push(uploadResult.secure_url);
                await fs.unlink(tempFilePath);
            }

            const newProduct = new Product({
                img: uploadedImages[0],
                productName,
                secondImage: uploadedImages[1] || uploadedImages[0],
                thirdImage: uploadedImages[2] || uploadedImages[0],
                fourthImage: uploadedImages[3] || uploadedImages[0],
                fifthImage: uploadedImages[4] || uploadedImages[0],
                afterdiscount,
                mainPrice,
                description,
                availability,
                categories,
                tags,
                stockQuantity
            });

            await newProduct.save();
            res.status(200).json({
                success: true,
                msg: "Product created successfully",
                data: newProduct
            });
        } catch (error) {
            console.log(error);
            res.status(500).json({
                success: false,
                error: "Internal server error"
            });
        }
    });
};

// Get All Products
exports.getAllProducts = async (req, res) => {
    try {
        const products = await Product.find();
        res.status(200).json({
            success: true,
            data: products
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: "Internal server error"
        });
    }
};

// Delete Product by ID
exports.deleteProductById = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedProduct = await Product.findByIdAndDelete(id);
        if (!deletedProduct) {
            return res.status(404).json({
                success: false,
                error: "Product not found"
            });
        }
        res.status(200).json({
            success: true,
            data: deletedProduct
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: "Internal server error"
        });
    }
};

// Get Single Product by Product Name
exports.getProductByName = async (req, res) => {
    try {
        const { productName, id } = req.params;
        let product;
        if (id) {
            product = await Product.findById(id);
        } else if (productName) {
            product = await Product.findOne({ productName });
        } else {
            return res.status(400).json({
                success: false,
                error: "Please provide either product name or ID"
            });
        }

        if (!product) {
            return res.status(404).json({
                success: false,
                error: "Product not found"
            });
        }

        res.status(200).json({
            success: true,
            data: product
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: "Internal server error"
        });
    }
};

// Filter Products According to Tags
exports.filterProductsByTags = async (req, res) => {
    try {
        const { tags } = req.query;
        const filteredProducts = await Product.find({ tags: { $in: tags } });
        res.status(200).json({
            success: true,
            data: filteredProducts
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: "Internal server error"
        });
    }
};

// Update Product
exports.makeUpdate = async (req,res)=>{
    try {
        console.log(req.body)
        res.status(201).json({
            success: true,
            data: req.body
        });
    } catch (error) {
        res.status(501).json({
            success: false,
            error: "Product not found"
        });
    }
}
exports.updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        console.log(req.body)
        const updateFields = {};

        const {
            productName,
            afterdiscount,
            mainPrice,
            description,
            availability,
            categories,
            tags,
        } = req.body;

        if (productName) updateFields.productName = productName;
        if (afterdiscount) updateFields.afterdiscount = afterdiscount;
        if (mainPrice) updateFields.mainPrice = mainPrice;
        if (description) updateFields.description = description;
        if (availability !== undefined) updateFields.availability = availability;
        if (categories) updateFields.categories = categories;
        if (tags) updateFields.tags = tags;

        const updatedProduct = await Product.findByIdAndUpdate(id, { $set: updateFields }, { new: true });

        if (!updatedProduct) {
            return res.status(404).json({
                success: false,
                error: "Product not found"
            });
        }


        res.status(200).json({
            success: true,
            data: updatedProduct
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: "Internal server error"
        });
    }
};

// Get Products by Category
exports.getProductsByCategory = async (req, res) => {
    try {
        const category = req.params.category;
        const products = await Product.find({ categories: category });
        if (products.length === 0) {
            return res.status(404).json({
                success: false,
                msg: "No Product Found"
            });
        }
        res.status(200).json({
            success: true,
            msg: "Found Successfully",
            data: products
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            msg: "Internal Server Error"
        });
    }
};
