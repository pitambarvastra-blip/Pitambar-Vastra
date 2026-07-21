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
    if (!event.body || Buffer.byteLength(event.body) > 12 * 1024 * 1024) {
      return { statusCode: 413, body: JSON.stringify({ error: "Order is too large to submit." }) };
    }

    const order = JSON.parse(event.body);

    if (!order.items || order.items.length === 0) {
      return { statusCode: 400, body: JSON.stringify({ error: "Order has no items" }) };
    }
    if (!order.customer || !order.customer.name || !order.customer.phone || !order.customer.address || !order.customer.pincode) {
      return { statusCode: 400, body: JSON.stringify({ error: "Missing delivery details" }) };
    }

    const orderId = "ORD-" + Date.now().toString(36).toUpperCase();
    const record = {
      orderId,
      placedAt: new Date().toISOString(),
      status: "New",
      items: order.items, // each item may include an optional "size"
      subtotal: order.subtotal,
      shipping: order.shipping,
      total: order.total,
      paymentMethod: order.paymentMethod, // "online" or "cod"
      paymentId: order.paymentId || null,
      customer: order.customer,
      // Optional customer uploads (compressed images as data URLs, client-side)
      customizationImage: typeof order.customizationImage === "string" && order.customizationImage.startsWith("data:image/")
        ? order.customizationImage
        : null,
      sizeHelpImage: typeof order.sizeHelpImage === "string" && order.sizeHelpImage.startsWith("data:image/")
        ? order.sizeHelpImage
        : null
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
