const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
    image: {type: String, required: true},
    name: {type: String, required: true, unique: true},
    description: {type: String, required: true}
}, {timestamps: true});

const Category = mongoose.model("Category", categorySchema);

module.exports = Category;