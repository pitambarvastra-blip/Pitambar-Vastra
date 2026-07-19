// Returns all saved orders — protected by ADMIN_PASSWORD so random
// visitors can't read your customers' names/phones/addresses.
const { getStore } = require("@netlify/blobs");

exports.handler = async function (event) {
  try {
    const { password } = JSON.parse(event.body || "{}");

    if (!process.env.ADMIN_PASSWORD || password !== process.env.ADMIN_PASSWORD) {
      return { statusCode: 401, body: JSON.stringify({ error: "Incorrect password" }) };
    }

    const store = getStore("orders");
    const { blobs } = await store.list();

    const orders = await Promise.all(
      blobs.map(async (b) => await store.get(b.key, { type: "json" }))
    );

    orders.sort((a, b) => new Date(b.placedAt) - new Date(a.placedAt));

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orders })
    };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
