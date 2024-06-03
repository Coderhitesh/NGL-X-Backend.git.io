const banner = require('../models/BannerModel');
const tags = require('../models/TagModel');
const Category = require('../models/Categorey'); // Corrected typo in 'Category'
const cloudinary = require("cloudinary").v2;
const path = require('path')
const fs = require('fs')

exports.createBanner = async (req, res) => {
    try {
        const { title, active } = req.body;
        if (!title || active === undefined) { // Checking if active is defined
            return res.status(400).json({
                success: false,
                msg: "Please provide all required fields"
            });
        }
     
        const file = req.files[0];
        const tempFilePath = path.join(__dirname, `temp_${file.originalname}`);

        // Writing the file to a temporary location
        await fs.promises.writeFile(tempFilePath, file.buffer); // Using fs.promises to avoid the need for a callback

        // Uploading the banner image to Cloudinary
        const forBannerImage = await cloudinary.uploader.upload(tempFilePath);
        //console.log(forBannerImage);

        // Creating the banner object
        const newBanner = new banner({
            title: title,
            active: active,
            image: forBannerImage.secure_url // Assuming Cloudinary returns secure_url
            // Add other banner details here if applicable
        });

        // Saving the banner to the database
        await newBanner.save();

        // Deleting the temporary file
        await fs.promises.unlink(tempFilePath);

        return res.status(201).json({
            success: true,
            msg: "Banner created successfully",
            data: newBanner
        });
    } catch (error) {
        //console.log(error);
        return res.status(500).json({
            success: false,
            msg: "Internal Server Error"
        });
    }
};
exports.getAllBanners = async (req, res) => {
    try {
        const banners = await banner.find();
        return res.status(200).json({
            success: true,
            data: banners
        });
    } catch (error) {
        //console.log(error);
        return res.status(500).json({
            success: false,
            msg: "Internal Server Error"
        });
    }
};
exports.updateBanner = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, active } = req.body;
        
        const updatedBanner = await banner.findByIdAndUpdate(id, { title, active }, { new: true });

        if (!updatedBanner) {
            return res.status(404).json({
                success: false,
                msg: "Banner not found"
            });
        }

        return res.status(200).json({
            success: true,
            data: updatedBanner
        });
    } catch (error) {
        //console.log(error);
        return res.status(500).json({
            success: false,
            msg: "Internal Server Error"
        });
    }
};

exports.deleteBanner = async (req, res) => {
    try {
        const { id } = req.params;

        const deletedBanner = await banner.findByIdAndDelete(id);

        if (!deletedBanner) {
            return res.status(404).json({
                success: false,
                msg: "Banner not found"
            });
        }

        return res.status(200).json({
            success: true,
            msg: "Banner deleted successfully"
        });
    } catch (error) {
        //console.log(error);
        return res.status(500).json({
            success: false,
            msg: "Internal Server Error"
        });
    }
};

exports.createCategory = async (req, res) => {
    try {
        const { MainCategory,title } = req.body;
        //console.log(req.body)
        if (!title) { // Checking if active is defined
            return res.status(400).json({
                success: false,
                msg: "Please provide all required fields"
            });
        }
     
        const file = req.files[0];
        const tempFilePath = path.join(__dirname, `temp_${file.originalname}`);

        // Writing the file to a temporary location
        await fs.promises.writeFile(tempFilePath, file.buffer); // Using fs.promises to avoid the need for a callback

        // Uploading the banner image to Cloudinary
        const forBannerImage = await cloudinary.uploader.upload(tempFilePath);
        //console.log(forBannerImage);

        // Creating the banner object
        const newCategory = new Category({
            title: title,
            MainCategory:MainCategory,
            CatImg: forBannerImage.secure_url // Assuming Cloudinary returns secure_url
            // Add other banner details here if applicable
        });

        // Saving the banner to the database
        await newCategory.save()

        // Deleting the temporary file
        await fs.promises.unlink(tempFilePath);

        return res.status(201).json({
            success: true,
            msg: "Category created successfully",
            data: newCategory
        });
    } catch (error) {
        //console.log(error);
        return res.status(500).json({
            success: false,
            msg: "Internal Server Error"
        });
    }
};

exports.getAllCategories = async (req, res) => {
    try {
        const categories = await Category.find();
        return res.status(200).json({
            success: true,
            data: categories
        });
    } catch (error) {
        //console.log(error);
        return res.status(500).json({
            success: false,
            msg: "Internal Server Error"
        });
    }
}
exports.getOnlyMainCategory = async (req, res) => {
    try {
        const categories = await Category.distinct('MainCategory');
        return res.status(200).json({
            success: true,
            data: categories
        });
    } catch (error) {
        //console.log(error);
        return res.status(500).json({
            success: false,
            msg: "Internal Server Error"
        });
    }
};

exports.getTitleByMainCategory = async (req, res) => {
    try {
        const { MainCategory } = req.params; // Assuming MainCategory is passed as a URL parameter
        const categories = await Category.find({ MainCategory: MainCategory }, 'title');

        if (!categories || categories.length === 0) {
            return res.status(404).json({
                success: false,
                msg: "No titles found for the specified MainCategory"
            });
        }

        return res.status(200).json({
            success: true,
            data: categories.map(category => category.title)
        });
    } catch (error) {
        //console.log(error);
        return res.status(500).json({
            success: false,
            msg: "Internal Server Error"
        });
    }
};



exports.updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { title } = req.body;
        
        const updatedCategory = await Category.findByIdAndUpdate(id, { title }, { new: true });

        if (!updatedCategory) {
            return res.status(404).json({
                success: false,
                msg: "Category not found"
            });
        }

        return res.status(200).json({
            success: true,
            data: updatedCategory
        });
    } catch (error) {
        //console.log(error);
        return res.status(500).json({
            success: false,
            msg: "Internal Server Error"
        });
    }
};
exports.deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;

        const deletedCategory = await Category.findByIdAndDelete(id);

        if (!deletedCategory) {
            return res.status(404).json({
                success: false,
                msg: "Category not found"
            });
        }

        return res.status(200).json({
            success: true,
            msg: "Category deleted successfully"
        });
    } catch (error) {
        //console.log(error);
        return res.status(500).json({
            success: false,
            msg: "Internal Server Error"
        });
    }
};


// Tags CRUD functions
exports.getAllTags = async (req, res) => {
    try {
        const tagss = await tags.find();
        return res.status(200).json({
            success: true,
            data: tagss
        });
    } catch (error) {
        //console.log(error);
        return res.status(500).json({
            success: false,
            msg: "Internal Server Error"
        });
    }
};

exports.makeTag = async (req, res) => {
    try {
        const { title, TagColour } = req.body;

        if (!title || !TagColour) {
            return res.status(400).json({
                success: false,
                msg: "Please provide all required fields"
            });
        }

        const newTag = new tags({
            title: title,
            TagColour: TagColour
        });

        await newTag.save();

        return res.status(201).json({
            success: true,
            msg: "Tag created successfully",
            data: newTag
        });
    } catch (error) {
        //console.log(error);
        return res.status(500).json({
            success: false,
            msg: "Internal Server Error"
        });
    }
};

exports.updateTag = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, TagColour } = req.body;

        const updatedTag = await tags.findByIdAndUpdate(id, { title, TagColour }, { new: true });

        if (!updatedTag) {
            return res.status(404).json({
                success: false,
                msg: "Tag not found"
            });
        }

        return res.status(200).json({
            success: true,
            data: updatedTag
        });
    } catch (error) {
        //console.log(error);
        return res.status(500).json({
            success: false,
            msg: "Internal Server Error"
        });
    }
};

exports.deleteTag = async (req, res) => {
    try {
        const { id } = req.params;

        const deletedTag = await tags.findByIdAndDelete(id);

        if (!deletedTag) {
            return res.status(404).json({
                success: false,
                msg: "Tag not found"
            });
        }

        return res.status(200).json({
            success: true,
            msg: "Tag deleted successfully"
        });
    } catch (error) {
        //console.log(error);
        return res.status(500).json({
            success: false,
            msg: "Internal Server Error"
        });
    }
};
