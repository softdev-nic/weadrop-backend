 const Order = require("../../Models/Order");
const { isValidSignature } = require("../../Utils/Integrations/RazorPay/RazorPay");
const { markOrderPaid, markOrderFailed } = require("./markPaid");

const paymentWebhook = async (req, res) => {
  const valid = isValidSignature(
    req.body,
    req.headers["x-razorpay-signature"],
    process.env.RAZORPAY_WEBHOOK_SECRET
  );
  if (!valid) return res.status(400).json({ error: "Invalid signature" });

  try {
    const event = JSON.parse(req.body.toString("utf8"));
    const payment = event.payload?.payment?.entity;
    if (!payment?.order_id) return res.status(200).json({ status: "ignored" });

    if (event.event === "payment.captured") {
      const order = await Order.findOne({ "payment.razorpayOrderId": payment.order_id });

      if (order && payment.amount === order.payment.amountPaise) {
        await markOrderPaid({ razorpayOrderId: payment.order_id, razorpayPaymentId: payment.id });
      } else if (order) {
        console.error(`Amount mismatch on ${order.orderNumber}: got ${payment.amount}, expected ${order.payment.amountPaise}`);
      }
    } else if (event.event === "payment.failed") {
      await markOrderFailed({ razorpayOrderId: payment.order_id, reason: payment.error_description });
    }

    return res.status(200).json({ status: "ok" });
  } catch (error) {
    console.error("Webhook handling failed:", error.message);

    return res.status(500).json({ error: "Webhook processing failed" });
  }
};

module.exports = paymentWebhook;