 const mongoose = require("mongoose");
const Order = require("../../Models/Order");
const Product = require("../../Models/Product");
const Organization = require("../../Models/Organization");
const handleError = require("../../Utils/HandleError");

const PAYMENT_METHODS = ["COD", "UPI", "Card"];
const MAX_QTY_PER_LINE = 20;

const mergeLines = (items) => {
  const lines = new Map();
  for (const i of items) {
    const key = `${i.productId}|${i.size}`;
    const prev = lines.get(key);
    lines.set(key, { productId: String(i.productId), size: i.size, quantity: (prev?.quantity || 0) + i.quantity });
  }
  return [...lines.values()];
};

const releaseStock = (reserved) =>
  Promise.all(
    reserved.map((r) =>
      Product.updateOne(
        { _id: r.productId, "variants.size": r.size },
        { $inc: { "variants.$.stock": r.quantity } }
      )
    )
  );

const createOrder = async (req, res) => {
  const reserved = [];
  try {
    const { items, deliveryAddress, paymentMethod, notes, weatherCondition } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "An order needs at least one item" });
    }

    const requested = items.map((i) => ({
      productId: i?.productId,
      size: typeof i?.size === "string" ? i.size.trim() : "",
      quantity: Number(i?.quantity),
    }));
    const bad = requested.find(
      (i) => !mongoose.isValidObjectId(i.productId) || !i.size || !Number.isInteger(i.quantity) || i.quantity < 1
    );
    if (bad) {
      return res.status(400).json({ error: "Each item needs a productId, a size and a whole quantity of 1 or more" });
    }

    const lines = mergeLines(requested);
    if (lines.some((l) => l.quantity > MAX_QTY_PER_LINE)) {
      return res.status(400).json({ error: `You can order at most ${MAX_QTY_PER_LINE} of one item` });
    }

    const method = paymentMethod || "COD";
    if (!PAYMENT_METHODS.includes(method)) {
      return res.status(400).json({ error: `Payment method must be one of: ${PAYMENT_METHODS.join(", ")}` });
    }

    const products = await Product.find({ _id: { $in: lines.map((l) => l.productId) }, isActive: true });
    const byId = new Map(products.map((p) => [String(p._id), p]));

    for (const l of lines) {
      const p = byId.get(l.productId);
      if (!p) return res.status(404).json({ error: "One of the products is no longer available" });
      if (!p.variants.some((v) => v.size === l.size)) {
        return res.status(400).json({ error: `${p.name} is not available in size ${l.size}` });
      }
    }

    const vendorIds = new Set(products.map((p) => String(p.vendor)));
    if (vendorIds.size !== 1) {
      return res.status(400).json({ error: "All items in one order must come from the same vendor" });
    }
    const vendorId = [...vendorIds][0];
    if (req.body.vendorId && String(req.body.vendorId) !== vendorId) {
      return res.status(400).json({ error: "Items do not belong to the selected vendor" });
    }

    const vendor = await Organization.findById(vendorId);
    if (!vendor || vendor.organiationType !== "Vendor" || vendor.isBanned) {
      return res.status(404).json({ error: "Vendor not found" });
    }

    let buyerOrganization = null;
    if (req.user.organizationId) {
      const buyerOrg = await Organization.findById(req.user.organizationId);
      if (!buyerOrg || buyerOrg.isBanned) {
        return res.status(403).json({ error: "Your organization is not available" });
      }
      if (buyerOrg.organiationType !== "Buyer") {
        return res.status(403).json({ error: "Only Buyer organizations or individual customers can place orders" });
      }
      buyerOrganization = buyerOrg._id;
    }

    for (const l of lines) {
      const updated = await Product.findOneAndUpdate(
        {
          _id: l.productId,
          isActive: true,
          variants: { $elemMatch: { size: l.size, stock: { $gte: l.quantity } } },
        },
        { $inc: { "variants.$.stock": -l.quantity } }
      );
      if (!updated) {
        await releaseStock(reserved);
        const p = byId.get(l.productId);
        return res.status(409).json({ error: `Not enough stock for ${p.name} (${l.size})` });
      }
      reserved.push(l);
    }

    const orderItems = lines.map((l) => {
      const p = byId.get(l.productId);
      return {
        productId: p._id,
        name: p.name,
        size: l.size,
        image: p.images?.[0],
        quantity: l.quantity,
        unitPrice: p.pricePaise / 100,
      };
    });

    const address = deliveryAddress || {
      name: req.user.name,
      mobileNumber: req.user.mobileNumber,
      addressLine1: req.user.addressLine1,
      addressLine2: req.user.addressLine2,
      city: req.user.city,
      state: req.user.state,
      postalCode: req.user.postalCode,
    };

    const order = await Order.create({
      placedBy: req.user._id,
      buyerOrganization,
      vendor: vendor._id,
      items: orderItems,
      deliveryAddress: address,
      payment: { method },
      notes,
      weatherCondition,
    });

    return res.status(201).json({ message: "Order placed.", order });
  } catch (error) {
    if (reserved.length) await releaseStock(reserved).catch(() => {});
    return handleError(res, error);
  }
};

module.exports = createOrder;