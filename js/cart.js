// ============================================================
// STORE SETTINGS — edit these lines for your business
// ============================================================
const SELLER_WHATSAPP_NUMBER = "918810795244"; // country code + number, no + or spaces
const CURRENCY_SYMBOL = "₹";
const STORE_NAME = "Pitambar Vastra";
const RAZORPAY_KEY_ID = "rzp_live_TFMkT2zdtjR0cM"; // your Razorpay Key ID (safe to be public)
const SHIPPING_FEE = 29; // flat shipping charge added whenever the cart isn't empty

// ============================================================
// CART STATE (persisted in the browser via localStorage)
// ============================================================
let cart = JSON.parse(localStorage.getItem("cart") || "{}"); // { productId: quantity }

function saveCart() {
  localStorage.setItem("cart", JSON.stringify(cart));
}

function addToCart(productId, qty) {
  cart[productId] = (cart[productId] || 0) + (qty || 1);
  saveCart();
  renderCart();
  openCart();
}

function changeQuantity(productId, delta) {
  if (!cart[productId]) return;
  cart[productId] += delta;
  if (cart[productId] <= 0) delete cart[productId];
  saveCart();
  renderCart();
}

function removeFromCart(productId) {
  delete cart[productId];
  saveCart();
  renderCart();
}

function cartCount() {
  return Object.values(cart).reduce((sum, qty) => sum + qty, 0);
}

function cartSubtotal() {
  return Object.entries(cart).reduce((sum, [id, qty]) => {
    const product = PRODUCTS.find(p => p.id === id);
    return sum + (product ? product.price * qty : 0);
  }, 0);
}

function cartShipping() {
  return cartCount() > 0 ? SHIPPING_FEE : 0;
}

function cartTotal() {
  return cartSubtotal() + cartShipping();
}

// ============================================================
// SAVED DELIVERY DETAILS — optional, browser-only, no login/password
// ============================================================
const DETAILS_STORAGE_KEY = "customerDetails";

function loadSavedDetails() {
  const nameEl = document.getElementById("detail-name");
  if (!nameEl) return;
  const saved = JSON.parse(localStorage.getItem(DETAILS_STORAGE_KEY) || "null");
  if (saved) {
    document.getElementById("detail-name").value = saved.name || "";
    document.getElementById("detail-phone").value = saved.phone || "";
    document.getElementById("detail-address").value = saved.address || "";
  }
}

function getEnteredDetails() {
  return {
    name: document.getElementById("detail-name")?.value.trim() || "",
    phone: document.getElementById("detail-phone")?.value.trim() || "",
    address: document.getElementById("detail-address")?.value.trim() || ""
  };
}

function saveDetailsIfChecked() {
  const checkbox = document.getElementById("save-details-checkbox");
  if (checkbox && checkbox.checked) {
    localStorage.setItem(DETAILS_STORAGE_KEY, JSON.stringify(getEnteredDetails()));
  }
}

function clearSavedDetails() {
  localStorage.removeItem(DETAILS_STORAGE_KEY);
  document.getElementById("detail-name").value = "";
  document.getElementById("detail-phone").value = "";
  document.getElementById("detail-address").value = "";
}

// ============================================================
// WISHLIST (persisted in the browser via localStorage, no login)
// ============================================================
let wishlist = JSON.parse(localStorage.getItem("wishlist") || "[]"); // array of product ids

function saveWishlist() {
  localStorage.setItem("wishlist", JSON.stringify(wishlist));
}

function isWished(productId) {
  return wishlist.includes(productId);
}

function toggleWishlist(productId) {
  wishlist = isWished(productId) ? wishlist.filter(id => id !== productId) : [...wishlist, productId];
  saveWishlist();
  renderWishlist();
  updateWishlistButtons();
}

function updateWishlistButtons() {
  document.querySelectorAll(".wishlist-btn, .detail-wishlist-btn").forEach(btn => {
    const wished = isWished(btn.dataset.id);
    btn.textContent = btn.classList.contains("detail-wishlist-btn")
      ? (wished ? "♥ Saved" : "♡ Save")
      : (wished ? "♥" : "♡");
    btn.classList.toggle("active", wished);
  });
  const countEl = document.getElementById("wishlist-count");
  if (countEl) countEl.textContent = wishlist.length;
}

function renderWishlist() {
  const itemsEl = document.getElementById("wishlist-items");
  if (!itemsEl) return;

  if (wishlist.length === 0) {
    itemsEl.innerHTML = `<p class="cart-empty">Your wishlist is empty.</p>`;
    return;
  }

  itemsEl.innerHTML = wishlist.map(id => {
    const product = PRODUCTS.find(p => p.id === id);
    if (!product) return "";
    return `
      <div class="cart-item">
        <img src="${product.images[0]}" alt="${product.name}" class="cart-item-image">
        <div class="cart-item-info">
          <span class="cart-item-name">${product.name}</span>
          <span class="cart-item-price">${CURRENCY_SYMBOL}${product.price}</span>
          <div class="cart-item-controls">
            <button class="wishlist-move-btn" data-id="${id}">Move to Cart</button>
            <button class="remove-btn" data-id="${id}" data-wishlist-remove>Remove</button>
          </div>
        </div>
      </div>
    `;
  }).join("");

  itemsEl.querySelectorAll(".wishlist-move-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      addToCart(btn.dataset.id);
      toggleWishlist(btn.dataset.id);
      closeWishlist();
      openCart();
    });
  });
  itemsEl.querySelectorAll("[data-wishlist-remove]").forEach(btn => {
    btn.addEventListener("click", () => toggleWishlist(btn.dataset.id));
  });
}

function openWishlist() {
  closeCart();
  document.getElementById("wishlist-drawer").classList.add("open");
  document.getElementById("wishlist-overlay").classList.add("open");
}

function closeWishlist() {
  document.getElementById("wishlist-drawer").classList.remove("open");
  document.getElementById("wishlist-overlay").classList.remove("open");
}

// ============================================================
// SHARE — uses the phone's native share sheet (WhatsApp chat,
// WhatsApp Status, Instagram Stories, etc.), with a WhatsApp
// link as a fallback on browsers without share support
// ============================================================
function productUrl(product) {
  const base = window.location.href.split(/[?#]/)[0].replace(/[^/]*$/, "");
  return `${base}product.html?id=${product.id}`;
}

function shareProduct(product) {
  const text = `Check out ${product.name} — ${CURRENCY_SYMBOL}${product.price} at ${STORE_NAME}`;
  const url = productUrl(product);

  if (navigator.share) {
    navigator.share({ title: product.name, text, url }).catch(() => {});
  } else {
    const waUrl = `https://wa.me/?text=${encodeURIComponent(text + " " + url)}`;
    window.open(waUrl, "_blank");
  }
}

// ============================================================
// RENDERING — homepage product grid
// ============================================================
function renderProducts() {
  const grid = document.getElementById("product-grid");
  if (!grid) return;

  grid.innerHTML = PRODUCTS.map(p => `
    <article class="product-card">
      <a href="product.html?id=${p.id}" class="product-image-wrap">
        <img src="${p.images[0]}" alt="${p.name}" class="product-image" data-main-image>
      </a>
      <button class="wishlist-btn" data-id="${p.id}" aria-label="Save to wishlist">♡</button>
      ${p.images.length > 1 ? `
        <div class="product-thumbs">
          ${p.images.map((img, i) => `
            <img src="${img}" alt="${p.name} photo ${i + 1}" class="product-thumb ${i === 0 ? "active" : ""}" data-src="${img}">
          `).join("")}
        </div>
      ` : ""}
      <a href="product.html?id=${p.id}" class="product-name">${p.name}</a>
      <p class="product-description">${p.description}</p>
      <div class="product-actions-row">
        <span class="return-badge">🪷 3-day returns</span>
        <button class="share-btn" data-id="${p.id}">↗ Share</button>
      </div>
      <div class="product-footer">
        <span class="product-price">${CURRENCY_SYMBOL}${p.price}</span>
        <button class="add-to-cart-btn" data-id="${p.id}">Add to Cart</button>
      </div>
    </article>
  `).join("");

  grid.querySelectorAll(".add-to-cart-btn").forEach(btn => {
    btn.addEventListener("click", () => addToCart(btn.dataset.id));
  });

  grid.querySelectorAll(".product-thumb").forEach(thumb => {
    thumb.addEventListener("click", (e) => {
      e.preventDefault();
      const card = thumb.closest(".product-card");
      card.querySelector("[data-main-image]").src = thumb.dataset.src;
      card.querySelectorAll(".product-thumb").forEach(t => t.classList.remove("active"));
      thumb.classList.add("active");
    });
  });

  grid.querySelectorAll(".wishlist-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      toggleWishlist(btn.dataset.id);
    });
  });

  grid.querySelectorAll(".share-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const product = PRODUCTS.find(p => p.id === btn.dataset.id);
      if (product) shareProduct(product);
    });
  });

  updateWishlistButtons();
}

// ============================================================
// RENDERING — individual product detail page (product.html)
// ============================================================
function renderProductDetail() {
  const container = document.getElementById("product-detail");
  if (!container) return;

  const params = new URLSearchParams(window.location.search);
  const product = PRODUCTS.find(p => p.id === params.get("id"));

  if (!product) {
    container.innerHTML = `<p class="cart-empty">Sorry, we couldn't find that product. <a href="index.html">Back to shop</a></p>`;
    return;
  }

  document.title = `${product.name} — ${STORE_NAME}`;

  container.innerHTML = `
    <div class="detail-gallery">
      <img src="${product.images[0]}" alt="${product.name}" class="detail-gallery-main" data-detail-main-image>
      ${product.images.length > 1 ? `
        <div class="detail-thumbs">
          ${product.images.map((img, i) => `
            <img src="${img}" alt="${product.name} photo ${i + 1}" class="detail-thumb ${i === 0 ? "active" : ""}" data-src="${img}">
          `).join("")}
        </div>
      ` : ""}
    </div>
    <div class="detail-info">
      <p class="detail-breadcrumb"><a href="index.html">Shop</a> / ${product.name}</p>
      <h1 class="detail-name">${product.name}</h1>
      <div class="detail-price">${CURRENCY_SYMBOL}${product.price}</div>
      <p class="detail-description">${product.description}</p>

      <div class="detail-qty">
        <span>Quantity</span>
        <div class="detail-qty-controls">
          <button class="detail-qty-btn" id="detail-qty-minus">−</button>
          <span id="detail-qty-value">1</span>
          <button class="detail-qty-btn" id="detail-qty-plus">+</button>
        </div>
      </div>

      <button class="detail-add-btn" id="detail-add-btn">Add to Cart</button>

      <div class="detail-actions">
        <button class="detail-wishlist-btn" data-id="${product.id}">♡ Save</button>
        <button class="detail-share-btn">↗ Share</button>
      </div>

      <div class="detail-policies">
        <div class="detail-policy-item">🪷 <span><strong>3-Day Returns</strong> — full refund if unused and in original condition.</span></div>
        <div class="detail-policy-item">🚚 <span><strong>Shipping</strong> — flat ${CURRENCY_SYMBOL}${SHIPPING_FEE} on every order.</span></div>
        <div class="detail-policy-item">🔒 <span><strong>Secure Payment</strong> — checkout powered by Razorpay.</span></div>
      </div>
    </div>
  `;

  container.querySelectorAll(".detail-thumb").forEach(thumb => {
    thumb.addEventListener("click", () => {
      container.querySelector("[data-detail-main-image]").src = thumb.dataset.src;
      container.querySelectorAll(".detail-thumb").forEach(t => t.classList.remove("active"));
      thumb.classList.add("active");
    });
  });

  let qty = 1;
  const qtyValueEl = document.getElementById("detail-qty-value");
  document.getElementById("detail-qty-minus").addEventListener("click", () => {
    qty = Math.max(1, qty - 1);
    qtyValueEl.textContent = qty;
  });
  document.getElementById("detail-qty-plus").addEventListener("click", () => {
    qty += 1;
    qtyValueEl.textContent = qty;
  });
  document.getElementById("detail-add-btn").addEventListener("click", () => {
    addToCart(product.id, qty);
  });

  document.querySelector(".detail-wishlist-btn").addEventListener("click", () => {
    toggleWishlist(product.id);
  });
  document.querySelector(".detail-share-btn").addEventListener("click", () => {
    shareProduct(product);
  });

  updateWishlistButtons();
}

// ============================================================
// RENDERING — cart drawer
// ============================================================
function renderCart() {
  const itemsEl = document.getElementById("cart-items");
  const entries = Object.entries(cart);

  if (entries.length === 0) {
    itemsEl.innerHTML = `<p class="cart-empty">Your cart is empty.</p>`;
  } else {
    itemsEl.innerHTML = entries.map(([id, qty]) => {
      const product = PRODUCTS.find(p => p.id === id);
      if (!product) return "";
      return `
        <div class="cart-item">
          <img src="${product.images[0]}" alt="${product.name}" class="cart-item-image">
          <div class="cart-item-info">
            <span class="cart-item-name">${product.name}</span>
            <span class="cart-item-price">${CURRENCY_SYMBOL}${product.price} x ${qty}</span>
            <div class="cart-item-controls">
              <button class="qty-btn" data-id="${id}" data-delta="-1">−</button>
              <span>${qty}</span>
              <button class="qty-btn" data-id="${id}" data-delta="1">+</button>
              <button class="remove-btn" data-id="${id}">Remove</button>
            </div>
          </div>
        </div>
      `;
    }).join("");

    itemsEl.querySelectorAll(".qty-btn").forEach(btn => {
      btn.addEventListener("click", () => changeQuantity(btn.dataset.id, Number(btn.dataset.delta)));
    });
    itemsEl.querySelectorAll(".remove-btn").forEach(btn => {
      btn.addEventListener("click", () => removeFromCart(btn.dataset.id));
    });
  }

  document.getElementById("cart-count").textContent = cartCount();
  document.getElementById("cart-subtotal").textContent = `${CURRENCY_SYMBOL}${cartSubtotal()}`;
  document.getElementById("cart-shipping").textContent = `${CURRENCY_SYMBOL}${cartShipping()}`;
  document.getElementById("cart-total").textContent = `${CURRENCY_SYMBOL}${cartTotal()}`;
}

// ============================================================
// CART DRAWER OPEN/CLOSE
// ============================================================
function openCart() {
  closeWishlist();
  document.getElementById("cart-drawer").classList.add("open");
  document.getElementById("cart-overlay").classList.add("open");
}

function closeCart() {
  document.getElementById("cart-drawer").classList.remove("open");
  document.getElementById("cart-overlay").classList.remove("open");
}

// ============================================================
// CHECKOUT — opens Razorpay's live payment popup for the cart total
// ============================================================
function buildOrderMessage(paymentId) {
  const details = getEnteredDetails();

  let message = paymentId
    ? "Payment received! My order:\n\n"
    : "Hi! I'd like to order:\n\n";

  Object.entries(cart).forEach(([id, qty]) => {
    const product = PRODUCTS.find(p => p.id === id);
    if (product) {
      message += `- ${product.name} x${qty} = ${CURRENCY_SYMBOL}${product.price * qty}\n`;
    }
  });
  message += `\nSubtotal: ${CURRENCY_SYMBOL}${cartSubtotal()}`;
  message += `\nShipping: ${CURRENCY_SYMBOL}${cartShipping()}`;
  message += `\nTotal: ${CURRENCY_SYMBOL}${cartTotal()}`;

  if (paymentId) {
    message += `\nPayment ID: ${paymentId}`;
  }

  if (details.name || details.phone || details.address) {
    message += `\n\nDelivery details:`;
    if (details.name) message += `\nName: ${details.name}`;
    if (details.phone) message += `\nPhone: ${details.phone}`;
    if (details.address) message += `\nAddress: ${details.address}`;
  } else if (paymentId) {
    message += `\n\nPlease share my delivery address with you. Thank you!`;
  }

  if (!paymentId) {
    message += `\n\nPlease send me a payment link. Thank you!`;
  }

  return message;
}

function openWhatsAppWithOrder(paymentId) {
  const message = buildOrderMessage(paymentId);
  const url = `https://wa.me/${SELLER_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
  window.open(url, "_blank");
}

async function checkout() {
  const entries = Object.entries(cart);
  if (entries.length === 0) {
    alert("Your cart is empty.");
    return;
  }

  const checkoutBtn = document.getElementById("checkout-btn");
  const originalLabel = checkoutBtn.textContent;
  checkoutBtn.disabled = true;
  checkoutBtn.textContent = "Starting payment...";

  saveDetailsIfChecked();

  try {
    const orderRes = await fetch("/.netlify/functions/create-order", {
      method: "POST",
      body: JSON.stringify({ amount: cartTotal() })
    });

    if (!orderRes.ok) {
      throw new Error("Could not start payment. Please try again in a moment.");
    }

    const order = await orderRes.json();

    const rzp = new Razorpay({
      key: RAZORPAY_KEY_ID,
      amount: order.amount,
      currency: "INR",
      name: STORE_NAME,
      order_id: order.orderId,
      theme: { color: "#7a1f2b" },
      handler: async function (response) {
        const verifyRes = await fetch("/.netlify/functions/verify-payment", {
          method: "POST",
          body: JSON.stringify(response)
        });
        const verifyData = await verifyRes.json();

        if (verifyData.valid) {
          openWhatsAppWithOrder(response.razorpay_payment_id);
          cart = {};
          saveCart();
          renderCart();
          alert("Payment successful! Please send your delivery address on WhatsApp.");
        } else {
          alert(
            "We couldn't verify this payment automatically. Please contact us on WhatsApp with payment ID: " +
              response.razorpay_payment_id
          );
        }
      },
      modal: {
        ondismiss: function () {
          checkoutBtn.disabled = false;
          checkoutBtn.textContent = originalLabel;
        }
      }
    });

    rzp.on("payment.failed", function () {
      alert("Payment failed. Please try again, or contact us on WhatsApp.");
    });

    rzp.open();
  } catch (err) {
    alert(err.message);
  } finally {
    checkoutBtn.disabled = false;
    checkoutBtn.textContent = originalLabel;
  }
}

// ============================================================
// INIT
// ============================================================
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("year").textContent = new Date().getFullYear();
  renderProducts();
  renderProductDetail();
  renderCart();
  renderWishlist();
  loadSavedDetails();

  document.getElementById("cart-toggle").addEventListener("click", openCart);
  document.getElementById("cart-close").addEventListener("click", closeCart);
  document.getElementById("cart-overlay").addEventListener("click", closeCart);
  document.getElementById("checkout-btn").addEventListener("click", checkout);
  document.getElementById("clear-details-btn").addEventListener("click", clearSavedDetails);

  document.getElementById("wishlist-toggle").addEventListener("click", openWishlist);
  document.getElementById("wishlist-close").addEventListener("click", closeWishlist);
  document.getElementById("wishlist-overlay").addEventListener("click", closeWishlist);
});
