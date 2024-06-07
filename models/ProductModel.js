const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    img: {
        type: String
    },
    productName: {
        type: String,
        required: true
    },
    secondImage: {
        type: String
    },
    thirdImage: {
        type: String
    },
    fourthImage: {
        type: String
    },
    fifthImage: {
        type: String
    },
    afterdiscount: {
        type: String,
    },
    mainPrice: {
        type: String
    },
    description: {
        type: String,
        required: true
    },
    availability: {
        type: Boolean,
        default: true
    },
    categories: {
        type: String,
    },
    tags: {
        type: String
    },
    stockQuantity : {
        type : Number
    },
    Isavailable : {
        type : Boolean
    }
}, { timestamps: true });

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
