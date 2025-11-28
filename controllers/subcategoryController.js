const mongoose = require("mongoose");
const Subcategory = require("../models/subcategoryModel");
const Category = require("../models/categoryModel");

exports.create = async (req, res) => {
  try {
    const { name, parentCategory } = req.body;

    if (!mongoose.Types.ObjectId.isValid(parentCategory)) {
      return res.status(400).json({ error: "Invalid parent category ID" });
    }

    const categoryExists = await Category.findById(parentCategory);
    if (!categoryExists) {
      return res.status(404).json({ error: "Parent category not found" });
    }

    const sub = new Subcategory(req.body);
    await sub.save();
    res.status(201).json(sub);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.list = async (req, res) => {
  try {
    const filter = {};
    if (req.query.categoryId) {
      filter.parentCategory = req.query.categoryId;
    }

    const subs = await Subcategory.find(filter).populate("parentCategory");
    res.json(subs);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

exports.listActive = async (req, res) => {
  try {
    const subCategories = await Subcategory.find({ isActive: true })
      .populate("parentCategory")
      .sort({ createdAt: -1 });

    res.json(subCategories);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

exports.getById = async (req, res) => {
  try {
    const id = req.params.id;
    // fetch subcategory
    const sub = await Subcategory.findById(id).populate("parentCategory");

    if (!sub) {
      return res.status(404).json({ error: "Subcategory not found" });
    }

    res.json(sub);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

exports.update = async (req, res) => {
  try {
    const id = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid subcategory ID format" });
    }

    const updated = await Subcategory.findOneAndUpdate({ _id: id }, req.body, {
      new: true,
    });

    if (!updated) {
      return res.status(404).json({ error: "Subcategory not found" });
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
      return res.status(400).json({ error: "Invalid subcategory ID format" });
    }

    const deleted = await Subcategory.findOneAndDelete({ _id: id });

    if (!deleted) {
      return res.status(404).json({ error: "Subcategory not found" });
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};
