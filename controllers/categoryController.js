const mongoose = require("mongoose");
const categoryModel = require("../models/categoryModel");
const cache = require("../utils/cache");

const ALL_CATEGORIES_KEY = "categories";

exports.createCategory = async (req, res) => {
  try {
    const { image, name, description } = req.body;

    if (!name?.trim() || !description?.trim()) {
      return res.status(400).json({
        message: "Name and description are required.",
      });
    }

    const category = await categoryModel.create({
      image,
      name: name.trim(),
      description: description.trim(),
    });

    // Clear list cache
    cache.del(ALL_CATEGORIES_KEY);

    return res.status(201).json({
      message: "Category created successfully",
      category,
    });

  } catch (error) {
    console.error("Create Category Error:", error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

exports.getCategories = async (req, res) => {
  try {

    const cached = cache.get(ALL_CATEGORIES_KEY);

    if (cached) {
      return res.status(200).json(cached);
    }

    const categories = await categoryModel
      .find()
      .select("_id name image description")
      .sort({ name: 1 })
      .lean();

    const response = {
      message: "Categories retrieved successfully",
      categories,
    };

    cache.set(ALL_CATEGORIES_KEY, response);

    return res.status(200).json(response);

  } catch (error) {
    console.error("Get Categories Error:", error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

exports.getCategoryById = async (req, res) => {
  try {

    const { _id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(_id)) {
      return res.status(400).json({
        message: "Invalid category ID.",
      });
    }

    const CACHE_KEY = `category-${_id}`;

    const cached = cache.get(CACHE_KEY);

    if (cached) {
      return res.status(200).json(cached);
    }

    const category = await categoryModel
      .findById(_id)
      .select("_id name image description")
      .lean();

    if (!category) {
      return res.status(404).json({
        message: "Category not found.",
      });
    }

    const response = {
      message: "Category retrieved successfully",
      category,
    };

    cache.set(CACHE_KEY, response);

    return res.status(200).json(response);

  } catch (error) {
    console.error("Get Category Error:", error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

exports.updateCategory = async (req, res) => {
  try {

    const { _id } = req.params;
    const { image, name, description } = req.body;

    if (!mongoose.Types.ObjectId.isValid(_id)) {
      return res.status(400).json({
        message: "Invalid category ID.",
      });
    }

    if (!name?.trim() || !description?.trim()) {
      return res.status(400).json({
        message: "Name and description are required.",
      });
    }

    const category = await categoryModel.findByIdAndUpdate(
      _id,
      {
        image,
        name: name.trim(),
        description: description.trim(),
      },
      {
        new: true,
        runValidators: true,
      }
    ).lean();

    if (!category) {
      return res.status(404).json({
        message: "Category not found.",
      });
    }

    cache.del(ALL_CATEGORIES_KEY);
    cache.del(`category-${_id}`);

    return res.status(200).json({
      message: "Category updated successfully",
      category,
    });

  } catch (error) {
    console.error("Update Category Error:", error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

exports.deleteCategory = async (req, res) => {
  try {

    const { _id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(_id)) {
      return res.status(400).json({
        message: "Invalid category ID.",
      });
    }

    const category = await categoryModel.findByIdAndDelete(_id).lean();

    if (!category) {
      return res.status(404).json({
        message: "Category not found.",
      });
    }

    cache.del(ALL_CATEGORIES_KEY);
    cache.del(`category-${_id}`);

    return res.status(200).json({
      message: "Category deleted successfully",
    });

  } catch (error) {
    console.error("Delete Category Error:", error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};
