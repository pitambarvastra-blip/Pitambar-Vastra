// Creates a Razorpay order for the cart total. Runs on Netlify's server,
// never in the customer's browser, so your Razorpay Key Secret stays private.
exports.handler = async function (event) {
  try {
    const { amount } = JSON.parse(event.body);

    if (!amount || amount <= 0) {
      return { statusCode: 400, body: JSON.stringify({ error: "Invalid amount" }) };
    }

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    const auth = Buffer.from(`${keyId}:${keySecret}`).toString("base64");

    const razorpayRes = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        amount: Math.round(amount * 100), // Razorpay expects paise
        currency: "INR",
        receipt: `order_${Date.now()}`
      })
    });

    const data = await razorpayRes.json();

    if (!razorpayRes.ok) {
      return { statusCode: 500, body: JSON.stringify({ error: data }) };
    }

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId: data.id, amount: data.amount })
    };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
