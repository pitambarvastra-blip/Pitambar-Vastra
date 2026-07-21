// Saves a customer review (text / photo / short video / video link) into
// Netlify Blobs — same simple built-in database the orders already use.
// Reviews are public and shown immediately (no login needed to post),
// so this function validates and caps everything it stores.
const { getStore } = require("@netlify/blobs");

const MAX_VIDEO_BYTES = 8 * 1024 * 1024; // keep in sync with js/cart.js
const MAX_TEXT_LENGTH = 2000;
const MAX_NAME_LENGTH = 80;

function reviewsStore() {
  return getStore({
    name: "reviews",
    siteID: process.env.NETLIFY_SITE_ID,
    token: process.env.NETLIFY_API_TOKEN
  });
}

function base64ByteLength(dataUrl) {
  const commaIndex = dataUrl.indexOf(",");
  const base64 = commaIndex >= 0 ? dataUrl.slice(commaIndex + 1) : dataUrl;
  const padding = (base64.match(/=+$/) || [""])[0].length;
  return Math.floor((base64.length * 3) / 4) - padding;
}

exports.handler = async function (event) {
  try {
    if (!event.body || Buffer.byteLength(event.body) > 12 * 1024 * 1024) {
      return { statusCode: 413, body: JSON.stringify({ error: "Review is too large to submit." }) };
    }

    const review = JSON.parse(event.body);

    const name = (review.name || "").toString().trim().slice(0, MAX_NAME_LENGTH);
    const text = (review.text || "").toString().trim().slice(0, MAX_TEXT_LENGTH);
    const productId = (review.productId || "").toString().trim().slice(0, 40);

    let rating = null;
    if (review.rating !== null && review.rating !== undefined) {
      const n = Number(review.rating);
      if (Number.isInteger(n) && n >= 1 && n <= 5) rating = n;
    }

    let image = null;
    if (typeof review.image === "string" && /^data:image\/(jpeg|png|webp|jpg);base64,/.test(review.image)) {
      image = review.image;
    }

    let video = null;
    if (typeof review.video === "string" && /^data:video\/(mp4|webm|quicktime|3gpp);base64,/.test(review.video)) {
      if (base64ByteLength(review.video) <= MAX_VIDEO_BYTES) {
        video = review.video;
      } else {
        return { statusCode: 413, body: JSON.stringify({ error: "Video is too large (max 8MB). Please use the video link field instead." }) };
      }
    }

    let videoLink = null;
    if (typeof review.videoLink === "string" && /^https?:\/\//i.test(review.videoLink)) {
      videoLink = review.videoLink.trim().slice(0, 500);
    }

    if (!text && !image && !video && !videoLink) {
      return { statusCode: 400, body: JSON.stringify({ error: "Please add some text, a photo, or a video/link." }) };
    }

    const reviewId = "REV-" + Date.now().toString(36).toUpperCase();
    const record = {
      reviewId,
      productId,
      name: name || "Anonymous",
      rating,
      text,
      image,
      video,
      videoLink,
      createdAt: new Date().toISOString()
    };

    const store = reviewsStore();
    await store.setJSON(reviewId, record);

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ success: true, reviewId })
    };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
