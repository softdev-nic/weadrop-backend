const Razorpay = require("razorpay");
const crypto = require("crypto");
require("dotenv").config();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const toPaise = (rupees) => Math.round(Number(rupees) * 100);

const isValidSignature = (data, signature, secret) => {
  if (!signature || !secret) return false;
  const expected = crypto.createHmac("sha256", secret).update(data).digest("hex");
  const a = Buffer.from(expected);
  const b = Buffer.from(String(signature));
  return a.length === b.length && crypto.timingSafeEqual(a, b);
};

module.exports = { razorpay, toPaise, isValidSignature };