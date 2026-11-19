const Order = require("../../Models/Order");

const markOrderPaid = async ({ razorpayOrderId, razorpayPaymentId }) => {
  const updated = await Order.findOneAndUpdate(
    { "payment.razorpayOrderId": razorpayOrderId, "payment.status": { $ne: "Paid" } },
    {
      $set: {
        "payment.status": "Paid",
        "payment.transactionId": razorpayPaymentId,
        "payment.paidAt": new Date(),
      },
    },
    { new: true }
  );

  return updated || Order.findOne({ "payment.razorpayOrderId": razorpayOrderId });
};

const markOrderFailed = async ({ razorpayOrderId, reason }) =>
  Order.findOneAndUpdate(
    { "payment.razorpayOrderId": razorpayOrderId, "payment.status": "Pending" },
    { $set: { "payment.status": "Failed", "payment.failureReason": reason || null } },
    { new: true }
  );

module.exports = { markOrderPaid, markOrderFailed };