const Order = require("../../Models/Order");
const handleError = require("../../Utils/HandleError");
const { isValidSignature } = require("../../Utils/Integrations/RazorPay");
const { markOrderPaid } = require("./markOrderPaid");

const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ error: "Missing payment details" });
    }

    const order = await Order.findOne({ "payment.razorpayOrderId": razorpay_order_id });
    if (!order || !order.placedBy.equals(req.user._id)) {
      return res.status(404).json({ error: "Order not found" });
    }

    const valid = isValidSignature(
      `${razorpay_order_id}|${razorpay_payment_id}`,
      razorpay_signature,
      process.env.RAZORPAY_KEY_SECRET
    );
    if (!valid) {
      return res.status(400).json({ error: "Payment could not be verified" });
    }

    const paid = await markOrderPaid({
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
    });

    return res.status(200).json({
      message: "Payment successful",
      orderNumber: paid.orderNumber,
      paymentStatus: paid.payment.status,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

module.exports = verifyPayment;