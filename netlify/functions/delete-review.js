// Deletes one review by id — protected by ADMIN_PASSWORD (same env var
// get-orders.js uses) so only the store owner can moderate/remove reviews.
const { getStore } = require("@netlify/blobs");

function reviewsStore() {
  return getStore({
    name: "reviews",
    siteID: process.env.NETLIFY_SITE_ID,
    token: process.env.NETLIFY_API_TOKEN
  });
}

exports.handler = async function (event) {
  try {
    const { password, reviewId } = JSON.parse(event.body || "{}");

    if (!process.env.ADMIN_PASSWORD || password !== process.env.ADMIN_PASSWORD) {
      return { statusCode: 401, body: JSON.stringify({ error: "Incorrect password" }) };
    }

    if (!reviewId) {
      return { statusCode: 400, body: JSON.stringify({ error: "Missing reviewId" }) };
    }

    const store = reviewsStore();
    await store.delete(reviewId);

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ success: true })
    };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
