 const mongoose = require("mongoose");
const Order = require("../../Models/Order");
const Organization = require("../../Models/Organization");
const handleError = require("../../Utils/HandleError");

const PAYMENT_METHODS = ["COD", "UPI", "Card"];


// POST /api/orders   (auth, isVerified)
// Placed by a user: an individual customer, or a member of a Buyer organization.
const createOrder = async (req, res) => {
  try {
    const { vendorId, items, deliveryAddress, paymentMethod, notes, weatherCondition } = req.body;

    if (!mongoose.isValidObjectId(vendorId)) {
      return res.status(400).json({ error: "A valid vendorId is required" });
    }
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "An order needs at least one item" });
    }

    // copy only the allowed fields; totals, fees and status are never taken from the client
    const cleanItems = items.map((i) => ({
      productId: i.productId || null,
      name: i.name,
      size: i.size,
      image: i.image,
      quantity: Number(i.quantity),
      unitPrice: Number(i.unitPrice),
    }));
    const badItem = cleanItems.find(
      (i) => !i.name || !Number.isInteger(i.quantity) || i.quantity < 1 || !(i.unitPrice >= 0)
    );
    if (badItem) {
      return res.status(400).json({ error: "Each item needs a name, a whole quantity of 1 or more, and a valid unitPrice" });
    }

    const method = paymentMethod || "COD";
    if (!PAYMENT_METHODS.includes(method)) {
      return res.status(400).json({ error: `Payment method must be one of: ${PAYMENT_METHODS.join(", ")}` });
    }

    const vendor = await Organization.findById(vendorId);
    if (!vendor || vendor.organiationType !== "Vendor" || vendor.isBanned) {
      return res.status(404).json({ error: "Vendor not found" });
    }

    // a member of an organization orders on its behalf, but only a Buyer organization may order
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

    // default to the user's own profile address when none is sent
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
      items: cleanItems,
      deliveryAddress: address,
      payment: { method },
      notes,
      weatherCondition,
    });

    return res.status(201).json({ message: "Order placed.", order });
  } catch (error) {
    return handleError(res, error);
  }
};

module.exports = createOrder;