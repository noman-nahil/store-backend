const mongoose = require("mongoose");
const Product = require("../models/productModel");

exports.list = async (req, res) => {
  try {
    // Basic filtering: category, subcategory, and attributes via querystring
    const query = {};
    if (req.query.category) query.category = req.query.category;
    if (req.query.subcategory) query.subcategory = req.query.subcategory;

    // allow dynamic attributes filtering: ?attributes.color=Black
    Object.keys(req.query).forEach((k) => {
      if (k.startsWith("attributes.")) {
        query[k] = req.query[k];
      }
    });

    const products = await Product.find(query).limit(100);
    res.json({ data: products });
  } catch (err) {
    //console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.getById = async (req, res) => {
  try {
    const id = req.params.id;
    const p = await Product.findById(id);
    if (!p) {
      return res.status(404).json({ error: "Not found" });
    }
    return res.json(p);
  } catch (err) {
    //console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
};

exports.create = async (req, res) => {
  try {
    const payload = req.body;
    // expect attributes to be an object, images array etc
    const product = new Product(payload);
    await product.save();
    res.status(201).json(product);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const id = req.params.id;

    // 3️⃣ Update product
    const updated = await Product.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updated) {
      return res.status(404).json({ error: "Product not found" });
    }
    return res.json(updated);
  } catch (err) {
    // console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
};

exports.remove = async (req, res) => {
  try {
    const id = req.params.id;
    // 2️⃣ Delete and check result in ONE step
    const deleted = await Product.findOneAndDelete({ _id: id });

    if (!deleted) {
      return res.status(404).json({ error: "Product not found" });
    }
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: "Server error" });
  }
};
