// Returns all customer reviews — public, no password, since reviews are
// meant to be shown to every visitor (unlike orders, which have private
// customer details and stay behind ADMIN_PASSWORD in get-orders.js).
const { getStore } = require("@netlify/blobs");

function reviewsStore() {
  return getStore({
    name: "reviews",
    siteID: process.env.NETLIFY_SITE_ID,
    token: process.env.NETLIFY_API_TOKEN
  });
}

exports.handler = async function () {
  try {
    const store = reviewsStore();
    const { blobs } = await store.list();

    const reviews = await Promise.all(
      blobs.map(async (b) => await store.get(b.key, { type: "json" }))
    );

    reviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reviews })
    };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
