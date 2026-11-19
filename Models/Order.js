 const mongoose = require("mongoose");

const ORG_MODEL = "Organiation";

const OrderItemSchema = new mongoose.Schema(
  {

    productId: { type: mongoose.Schema.Types.ObjectId, default: null },
    name: { type: String, required: true, trim: true },
    size: { type: String },
    image: { type: String },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const AddressSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    mobileNumber: { type: String, required: true },
    addressLine1: { type: String, required: true },
    addressLine2: { type: String },
    city: { type: String, required: true },
    state: { type: String, required: true },
    postalCode: { type: String, required: true },
    latitude: { type: Number },
    longitude: { type: Number },
  },
  { _id: false }
);

const ORDER_STATUSES = [
  "Placed",
  "Accepted",
  "Packed",
  "Out for Delivery",
  "Delivered",
  "Cancelled",
  "Rejected",
];

const OrderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      unique: true,
      default: () =>
        "WD" +
        Date.now().toString(36).toUpperCase() +
        Math.random().toString(36).slice(2, 6).toUpperCase(),
    },

    placedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    buyerOrganization: { type: mongoose.Schema.Types.ObjectId, ref: ORG_MODEL, default: null },
    vendor: { type: mongoose.Schema.Types.ObjectId, ref: ORG_MODEL, required: true },

    deliveryPartnerOrganization: { type: mongoose.Schema.Types.ObjectId, ref: ORG_MODEL, default: null },
    deliveryPartner: { type: mongoose.Schema.Types.ObjectId, ref: "DeliveryPartner", default: null },

    items: {
      type: [OrderItemSchema],
      validate: [(v) => v.length > 0, "An order needs at least one item"],
    },

    subtotal: { type: Number, default: 0, min: 0 },
    deliveryFee: { type: Number, default: 0, min: 0 },
    tax: { type: Number, default: 0, min: 0 },
    discount: { type: Number, default: 0, min: 0 },
    total: { type: Number, default: 0, min: 0 },

    deliveryAddress: { type: AddressSchema, required: true },

    status: { type: String, enum: ORDER_STATUSES, default: "Placed" },
    statusHistory: [
      {
        _id: false,
        status: { type: String, enum: ORDER_STATUSES },
        changedAt: { type: Date, default: Date.now },
      },
    ],
    cancelReason: { type: String },
    deliveredAt: { type: Date },

    payment: {
      method: { type: String, enum: ["COD", "UPI", "Card"], default: "COD" },
      status: { type: String, enum: ["Pending", "Paid", "Failed", "Refunded"], default: "Pending" },
      transactionId: { type: String },
      razorpayOrderId: { type: String, index: true },
      amountPaise: { type: Number, min: 0 },
      paidAt: { type: Date },
      failureReason: { type: String },
    },

    weatherCondition: { type: String },
    notes: { type: String, maxlength: 300 },
  },
  { timestamps: true }
);

OrderSchema.pre("validate", function () {
  this.subtotal = this.items.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0);
  this.total = Math.max(0, this.subtotal + this.deliveryFee + this.tax - this.discount);
});

OrderSchema.pre("save", function () {
  if (this.isNew || this.isModified("status")) {
    this.statusHistory.push({ status: this.status });
    if (this.status === "Delivered") this.deliveredAt = new Date();
  }
});

OrderSchema.index({ placedBy: 1, createdAt: -1 });
OrderSchema.index({ buyerOrganization: 1, createdAt: -1 });
OrderSchema.index({ vendor: 1, status: 1 });
OrderSchema.index({ deliveryPartner: 1, status: 1 });
OrderSchema.index({ deliveryPartnerOrganization: 1, status: 1 });

module.exports = mongoose.model("Order", OrderSchema);