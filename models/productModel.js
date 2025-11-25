const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },

  images: { type: [String], default: [] },
  quantity: { type: Number, default: 0 },
  price: { type: Number, default: 0 },

  category: { type: String, required: true },
  subcategory: { type: String },

  // dynamic attributes: fully flexible
  attributes: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: {},
  },

  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Product", ProductSchema);
