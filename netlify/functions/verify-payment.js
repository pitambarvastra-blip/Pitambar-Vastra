// Confirms a payment is genuine (not faked by tampering with the browser)
// by recomputing Razorpay's signature using the private Key Secret.
const crypto = require("crypto");

exports.handler = async function (event) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = JSON.parse(event.body);
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    const expectedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    const valid = expectedSignature === razorpay_signature;

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ valid })
    };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message, valid: false }) };
  }
};
