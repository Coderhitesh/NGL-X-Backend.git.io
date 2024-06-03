const SalesBanner = require('../models/SalesBannerModel');
 // Corrected typo in 'Category'
const cloudinary = require("cloudinary").v2;
const path = require('path')
const fs = require('fs')

exports.createSalesBanner = async (req, res) => {
    try {
        const {  active,BtnTitle } = req.body;
        if ( active === undefined) { // Checking if active is defined
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
        // //console.log(forBannerImage);

        // Creating the banner object
        const newBanner = new SalesBanner({
      
            active: active,
          
            BtnTitle:BtnTitle,
            image: forBannerImage.secure_url 
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
exports.getAllSalesBanners = async (req, res) => {
    try {
        const banners = await SalesBanner.find();
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


exports.deleteSalesBanner = async (req, res) => {
    try {
        const { id } = req.params;

        const deletedBanner = await SalesBanner.findByIdAndDelete(id);

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