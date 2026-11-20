const mongoose = require("mongoose");

const CATEGORIES = ["Raincoat", "Jacket", "Umbrella", "Sweater", "Footwear", "Thermal", "Cap & Hat", "Accessories", "Other"];
const WEATHER_TAGS = ["Rain", "Cold", "Heat", "Wind", "Snow"];

const VariantSchema = new mongoose.Schema(
  {
    size: { type: String, required: true, trim: true },
    stock: { type: Number, required: true, min: 0, default: 0 },
  },
  { _id: false }
);

const ProductSchema = new mongoose.Schema(
  {
    vendor: { type: mongoose.Schema.Types.ObjectId, ref: "Organiation", required: true, index: true },
    name: { type: String, required: [true, "Product name is required"], trim: true, maxlength: 100 },
    description: { type: String, trim: true, maxlength: 500 },
    category: { type: String, enum: CATEGORIES, required: [true, "Category is required"] },
    weatherTags: [{ type: String, enum: WEATHER_TAGS }],
    images: [{ type: String, trim: true }],
    pricePaise: {
      type: Number,
      required: [true, "Price is required"],
      min: [100, "Price must be at least ₹1"],
      validate: { validator: Number.isInteger, message: "Price must be in whole paise" },
    },
    variants: {
      type: [VariantSchema],
      validate: [
        { validator: (v) => Array.isArray(v) && v.length > 0, message: "Add at least one size" },
        {
          validator: (v) => new Set(v.map((x) => x.size.toLowerCase())).size === v.length,
          message: "Each size can be listed only once",
        },
      ],
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

ProductSchema.virtual("price").get(function () {
  return this.pricePaise / 100;
});

ProductSchema.virtual("totalStock").get(function () {
  return (this.variants || []).reduce((sum, v) => sum + v.stock, 0);
});

ProductSchema.index({ isActive: 1, category: 1 });
ProductSchema.index({ isActive: 1, weatherTags: 1 });

ProductSchema.statics.CATEGORIES = CATEGORIES;
ProductSchema.statics.WEATHER_TAGS = WEATHER_TAGS;

module.exports = mongoose.model("Product", ProductSchema);