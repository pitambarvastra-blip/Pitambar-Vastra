// Saves a placed order (COD or paid) into Netlify Blobs — a simple
// database built into Netlify, so no external service is needed.
const { getStore } = require("@netlify/blobs");

function ordersStore() {
  return getStore({
    name: "orders",
    siteID: process.env.NETLIFY_SITE_ID,
    token: process.env.NETLIFY_API_TOKEN
  });
}

exports.handler = async function (event) {
  try {
    const order = JSON.parse(event.body);

    if (!order.items || order.items.length === 0) {
      return { statusCode: 400, body: JSON.stringify({ error: "Order has no items" }) };
    }
    if (!order.customer || !order.customer.name || !order.customer.phone || !order.customer.address) {
      return { statusCode: 400, body: JSON.stringify({ error: "Missing delivery details" }) };
    }

    const orderId = "ORD-" + Date.now().toString(36).toUpperCase();
    const record = {
      orderId,
      placedAt: new Date().toISOString(),
      status: "New",
      items: order.items,
      subtotal: order.subtotal,
      shipping: order.shipping,
      total: order.total,
      paymentMethod: order.paymentMethod, // "online" or "cod"
      paymentId: order.paymentId || null,
      customer: order.customer
    };

    const store = ordersStore();
    await store.setJSON(orderId, record);

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ success: true, orderId })
    };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
