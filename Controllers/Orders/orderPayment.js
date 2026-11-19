const mongoose = require("mongoose");
const Order = require("../../Models/Order")
const handleError = require("../../Utils/HandleError");
const { razorpay, toPaise } = require("../../Utils/Integrations/RazorPay/RazorPay");

const ONLINE_METHODS = ["UPI", "Card"];

const createPaymentOrder = async (req, res) => {
  try {
    const { orderId } = req.body;
    if (!mongoose.isValidObjectId(orderId)) {
      return res.status(400).json({ error: "A valid orderId is required" });
    }

    const order = await Order.findById(orderId);
    if (!order || !order.placedBy.equals(req.user._id)) {
      return res.status(404).json({ error: "Order not found" });
    }
    if (!ONLINE_METHODS.includes(order.payment.method)) {
      return res.status(400).json({ error: "This order is Cash on Delivery" });
    }
    if (order.payment.status === "Paid") {
      return res.status(400).json({ error: "This order is already paid" });
    }
    if (["Cancelled", "Rejected"].includes(order.status)) {
      return res.status(400).json({ error: `This order is ${order.status.toLowerCase()}` });
    }

    const amount = toPaise(order.total);
    if (amount < 100) {
      return res.status(400).json({ error: "Order total must be at least ₹1" });
    }

    if (!order.payment.razorpayOrderId || order.payment.amountPaise !== amount) {
      const rzpOrder = await razorpay.orders.create({
        amount,
        currency: "INR",
        receipt: order.orderNumber,
        notes: { weadropOrderId: String(order._id) },
      });
      order.payment.razorpayOrderId = rzpOrder.id;
      order.payment.amountPaise = amount;
      order.payment.status = "Pending";
      await order.save();
    }

    return res.status(200).json({
      keyId: process.env.RAZORPAY_KEY_ID,
      razorpayOrderId: order.payment.razorpayOrderId,
      amount,
      currency: "INR",
      orderNumber: order.orderNumber,
      prefill: {
        name: req.user.name,
        email: req.user.email,
        contact: req.user.mobileNumber,
      },
    });
  } catch (error) {
    if (error.statusCode && error.error) {

      console.error("Razorpay error:", error.error.description);
      return res.status(502).json({ error: "Payment provider error, please try again" });
    }
    return handleError(res, error);
  }
};

module.exports = createPaymentOrder;