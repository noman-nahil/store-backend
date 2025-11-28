const mongoose = require("mongoose");
const Category = require("../models/categoryModel");

exports.create = async (req, res) => {
  try {
    const category = new Category(req.body);
    await category.save();
    res.status(201).json(category);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.list = async (req, res) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 });
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

exports.listActive = async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true }).sort({
      createdAt: -1,
    });
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

exports.getById = async (req, res) => {
  try {
    const id = req.params.id;

    // 1️⃣ Validate ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        error: "Invalid category ID format",
        message: "The provided ID is not a valid MongoDB ObjectId.",
      });
    }

    // 2️⃣ Fetch category
    const category = await Category.findById(id);

    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }

    // 3️⃣ Return category
    res.json(category);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.update = async (req, res) => {
  try {
    const id = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid category ID format" });
    }

    const updated = await Category.findOneAndUpdate({ _id: id }, req.body, {
      new: true,
    });

    if (!updated) {
      return res.status(404).json({ error: "Category not found" });
    }

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

exports.remove = async (req, res) => {
  try {
    const id = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid category ID format" });
    }

    const deleted = await Category.findOneAndDelete({ _id: id });

    if (!deleted) {
      return res.status(404).json({ error: "Category not found" });
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};
