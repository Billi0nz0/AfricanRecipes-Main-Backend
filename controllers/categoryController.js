const categoryModel = require("../models/categoryModel");

exports.createCategory = async (req, res) => {
    try {
        const { image, name, description } = req.body;

        if (!name && !description) {
            return res.status(400).json({ message: "Empty fields" });
        }

        const category = await categoryModel.create({
            image,
            name,
            description
        });

        res.status(201).json({
            message: "Category created successfully",
            category
        });

    } catch (error) {
        console.error("Create Category Error", error.message);
        res.status(500).json({ message: "Server error" });
    }
};

exports.getCategories = async (req, res) => {
    try {
        const categories = await categoryModel.find();
        res.status(200).json({
            message: "Categories retrieved successfully",
            categories
        });
    } catch (error) {
        console.error("Get Categories Error", error.message);
        res.status(500).json({ message: "Server error" });
    }
};

exports.getCategoryById = async (req, res) => {
    try {
        const { _id } = req.params;
        const category = await categoryModel.findById(_id);

        if (!category) {
            return res.status(404).json({ message: "Category not found" });
        }

        res.status(200).json({
            message: "Category retrieved successfully",
            category
        });
    } catch (error) {
        console.error("Get Category by ID Error", error.message);
        res.status(500).json({ message: "Server error" });
    }
};

exports.updateCategory = async (req, res) => {
    try {
        const { _id } = req.params;
        const { image, name, description } = req.body;

        const category = await categoryModel.findByIdAndUpdate(_id, {
            image,
            name,
            description
        }, { new: true });

        if (!name && !description) {
            return res.status(400).json({ message: "Empty fields" });
        }

        if (!category) {
            return res.status(404).json({ message: "Category not found" });
        }

        res.status(200).json({
            message: "Category updated successfully",
            category
        });
    } catch (error) {
        console.error("Update Category Error", error.message);
        res.status(500).json({ message: "Server error" });
    }
};

exports.deleteCategory = async (req, res) => {
    try {
        const { _id } = req.params;

        const category = await categoryModel.findByIdAndDelete(_id);

        if (!category) {
            return res.status(404).json({ message: "Category not found" });
        }

        res.status(200).json({
            message: "Category deleted successfully",
            category
        });
    } catch (error) {
        console.error("Delete Category Error", error.message);
        res.status(500).json({ message: "Server error" });
    }
};