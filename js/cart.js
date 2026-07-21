// ============================================================
// STORE SETTINGS — edit these lines for your business
// ============================================================
const SELLER_WHATSAPP_NUMBER = "918810795244"; // country code + number, no + or spaces
const SELLER_EMAIL = "pitambarvastra@gmail.com";
const CURRENCY_SYMBOL = "₹";
const STORE_NAME = "Pitambar Vastra";
const RAZORPAY_KEY_ID = "rzp_live_TFMkT2zdtjR0cM"; // your Razorpay Key ID (safe to be public)
const WEB3FORMS_ACCESS_KEY = "0908b3e9-3d72-4e94-baff-3de1820d6107"; // free at web3forms.com, sends you an email per order
const SHIPPING_FEE = 29; // flat shipping charge added whenever the cart isn't empty
const MAX_REVIEW_VIDEO_BYTES = 8 * 1024 * 1024; // 8MB cap for direct video review uploads

// ============================================================
// CART STATE (persisted in the browser via localStorage)
// Cart is keyed by "productId|size" so the same product can be
// ordered in more than one size as separate lines. size is "" when
// the shopper didn't pick one (size is always optional).
// ============================================================
let cart = JSON.parse(localStorage.getItem("cart") || "{}"); // { "productId|size": quantity }

// Per-order (not per-item) optional uploads, set when the shopper
// picks a file in the cart drawer, cleared once the order is placed.
let customizationImageDataUrl = null;
let sizeHelpImageDataUrl = null;

// Cached reviews for the current page, loaded once and re-rendered
// locally on language switch without re-fetching.
let REVIEWS_CACHE = [];

function cartKey(productId, size) {
  return `${productId}|${size || ""}`;
}

function splitCartKey(key) {
  const idx = key.indexOf("|");
  return { id: key.slice(0, idx), size: key.slice(idx + 1) };
}

function saveCart() {
  localStorage.setItem("cart", JSON.stringify(cart));
}

function addToCart(productId, size, qty) {
  const key = cartKey(productId, size);
  cart[key] = (cart[key] || 0) + (qty || 1);
  saveCart();
  renderCart();
  openCart();
}

function changeQuantity(key, delta) {
  if (!cart[key]) return;
  cart[key] += delta;
  if (cart[key] <= 0) delete cart[key];
  saveCart();
  renderCart();
}

function removeFromCart(key) {
  delete cart[key];
  saveCart();
  renderCart();
}

function cartCount() {
  return Object.values(cart).reduce((sum, qty) => sum + qty, 0);
}

function cartSubtotal() {
  return Object.entries(cart).reduce((sum, [key, qty]) => {
    const { id } = splitCartKey(key);
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
    document.getElementById("detail-pincode").value = saved.pincode || "";
  }
}

function getEnteredDetails() {
  return {
    name: document.getElementById("detail-name")?.value.trim() || "",
    phone: document.getElementById("detail-phone")?.value.trim() || "",
    address: document.getElementById("detail-address")?.value.trim() || "",
    pincode: document.getElementById("detail-pincode")?.value.trim() || ""
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
  document.getElementById("detail-pincode").value = "";
}

// ============================================================
// USE CURRENT LOCATION — fills address + pincode from the browser's
// geolocation, reverse-geocoded via OpenStreetMap's free Nominatim API
// (no key/backend needed). Address is always editable afterwards.
// ============================================================
function useCurrentLocation() {
  const statusEl = document.getElementById("location-status");
  const setStatus = (msg) => { if (statusEl) statusEl.textContent = msg; };

  if (!navigator.geolocation) {
    setStatus(t("locationNotSupported"));
    return;
  }

  setStatus(t("locationFetching"));

  navigator.geolocation.getCurrentPosition(
    async (pos) => {
      const { latitude, longitude } = pos.coords;
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
        );
        if (!res.ok) throw new Error("reverse geocode failed");
        const data = await res.json();

        const addressEl = document.getElementById("detail-address");
        const pincodeEl = document.getElementById("detail-pincode");
        if (addressEl && data.display_name) addressEl.value = data.display_name;
        if (pincodeEl && data.address && data.address.postcode) pincodeEl.value = data.address.postcode;

        setStatus(t("locationFilled"));
      } catch (err) {
        setStatus(t("locationFailed"));
      }
    },
    () => setStatus(t("locationDenied")),
    { enableHighAccuracy: true, timeout: 10000 }
  );
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
      ? (wished ? `♥ ${t("savedWishlist")}` : `♡ ${t("saveWishlist")}`)
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
    itemsEl.innerHTML = `<p class="cart-empty">${t("wishlistEmpty")}</p>`;
    return;
  }

  itemsEl.innerHTML = wishlist.map(id => {
    const product = PRODUCTS.find(p => p.id === id);
    if (!product) return "";
    return `
      <div class="cart-item">
        <img src="${product.images[0]}" alt="${escapeHtml(tf(product, "name", "nameHi"))}" class="cart-item-image">
        <div class="cart-item-info">
          <span class="cart-item-name">${escapeHtml(tf(product, "name", "nameHi"))}</span>
          <span class="cart-item-price">${CURRENCY_SYMBOL}${product.price}</span>
          <div class="cart-item-controls">
            <button class="wishlist-move-btn" data-id="${id}">${t("moveToCart")}</button>
            <button class="remove-btn" data-id="${id}" data-wishlist-remove>${t("remove")}</button>
          </div>
        </div>
      </div>
    `;
  }).join("");

  itemsEl.querySelectorAll(".wishlist-move-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      addToCart(btn.dataset.id, "", 1);
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
  setBodyScrollLocked(true);
}

function closeWishlist() {
  document.getElementById("wishlist-drawer").classList.remove("open");
  document.getElementById("wishlist-overlay").classList.remove("open");
  setBodyScrollLocked(false);
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
  const name = tf(product, "name", "nameHi");
  const text = `Check out ${name} — ${CURRENCY_SYMBOL}${product.price} at ${STORE_NAME}`;
  const url = productUrl(product);

  if (navigator.share) {
    navigator.share({ title: name, text, url }).catch(() => {});
  } else {
    const waUrl = `https://wa.me/?text=${encodeURIComponent(text + " " + url)}`;
    window.open(waUrl, "_blank");
  }
}

// ============================================================
// SECURITY HELPER — escape user-controlled text before it's placed
// into innerHTML (product names/descriptions are store-owner data,
// but review name/text come from anonymous site visitors)
// ============================================================
function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str == null ? "" : String(str);
  return div.innerHTML;
}

// ============================================================
// IMAGE COMPRESSION — resizes/compresses a photo in the browser
// before upload, so customization/size-help/review photos stay
// small (fast to upload, small to store).
// ============================================================
function compressImageFile(file, maxDim = 1000, quality = 0.75) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Could not read that file."));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Could not read that image."));
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round(height * (maxDim / width));
            width = maxDim;
          } else {
            width = Math.round(width * (maxDim / height));
            height = maxDim;
          }
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        canvas.getContext("2d").drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Could not read that file."));
    reader.readAsDataURL(file);
  });
}

function setUploadPreview(elId, dataUrl) {
  const el = document.getElementById(elId);
  if (!el) return;
  if (dataUrl) {
    el.src = dataUrl;
    el.style.display = "block";
  } else {
    el.src = "";
    el.style.display = "none";
  }
}

function resetCustomizationUploads() {
  customizationImageDataUrl = null;
  sizeHelpImageDataUrl = null;
  const customInput = document.getElementById("custom-design-photo");
  if (customInput) customInput.value = "";
  const sizeHelpInput = document.getElementById("laddu-gopal-photo");
  if (sizeHelpInput) sizeHelpInput.value = "";
  setUploadPreview("custom-design-preview", null);
  setUploadPreview("laddu-gopal-preview", null);
}

// ============================================================
// RENDERING — homepage product grid
// ============================================================
function renderProducts() {
  const grid = document.getElementById("product-grid");
  if (!grid) return;

  grid.innerHTML = PRODUCTS.map(p => {
    const name = tf(p, "name", "nameHi");
    const features = tf(p, "features", "featuresHi") || [];
    return `
    <article class="product-card">
      <a href="product.html?id=${p.id}" class="product-image-wrap">
        <img src="${p.images[0]}" alt="${escapeHtml(name)}" class="product-image" data-main-image>
      </a>
      <button class="wishlist-btn" data-id="${p.id}" aria-label="Save to wishlist">♡</button>
      ${p.images.length > 1 ? `
        <div class="product-thumbs">
          ${p.images.map((img, i) => `
            <img src="${img}" alt="${escapeHtml(name)} photo ${i + 1}" class="product-thumb ${i === 0 ? "active" : ""}" data-src="${img}">
          `).join("")}
        </div>
      ` : ""}
      <a href="product.html?id=${p.id}" class="product-name">${escapeHtml(name)}</a>
      <p class="product-description">${escapeHtml(tf(p, "description", "descriptionHi"))}</p>
      ${features.length ? `
        <ul class="product-features">
          ${features.map(f => `<li>✓ ${escapeHtml(f)}</li>`).join("")}
        </ul>
      ` : ""}
      <div class="product-actions-row">
        <span class="return-badge">${t("returnBadge")}</span>
        <button class="share-btn" data-id="${p.id}">↗ ${t("share")}</button>
      </div>
      <div class="product-size-row">
        <select class="size-select" data-id="${p.id}" aria-label="${t("selectSize")}">
          <option value="">${t("selectSize")}</option>
          ${[1, 2, 3, 4, 5, 6, 7, 8, 9].map(s => `<option value="${s}">${s}</option>`).join("")}
          <option value="other">${t("sizeOther")}</option>
        </select>
        <input type="text" class="size-other-input" placeholder="${t("sizeOtherPlaceholder")}" style="display:none;">
      </div>
      <div class="product-footer">
        <span class="product-price">${CURRENCY_SYMBOL}${p.price}</span>
        <button class="add-to-cart-btn" data-id="${p.id}">${t("addToCart")}</button>
      </div>
    </article>
  `;
  }).join("");

  grid.querySelectorAll(".size-select").forEach(sel => {
    sel.addEventListener("change", () => {
      const card = sel.closest(".product-card");
      const otherInput = card ? card.querySelector(".size-other-input") : null;
      if (otherInput) otherInput.style.display = sel.value === "other" ? "block" : "none";
    });
  });

  grid.querySelectorAll(".add-to-cart-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const card = btn.closest(".product-card");
      const sizeSelect = card ? card.querySelector(".size-select") : null;
      const otherInput = card ? card.querySelector(".size-other-input") : null;

      let size = sizeSelect ? sizeSelect.value : "";
      if (!size) {
        alert(t("selectSizeRequired"));
        return;
      }
      if (size === "other") {
        size = otherInput ? otherInput.value.trim() : "";
        if (!size) {
          alert(t("enterSizeRequired"));
          if (otherInput) otherInput.focus();
          return;
        }
      }

      addToCart(btn.dataset.id, size, 1);
    });
  });

  grid.querySelectorAll(".product-thumb").forEach(thumb => {
    thumb.addEventListener("click", (e) => {
      e.preventDefault();
      const card = thumb.closest(".product-card");
      card.querySelector("[data-main-image]").src = thumb.dataset.src;
      card.querySelectorAll(".product-thumb").forEach(thumbEl => thumbEl.classList.remove("active"));
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
    container.innerHTML = `<p class="cart-empty">${t("productNotFound")} <a href="index.html">${t("backToShop")}</a></p>`;
    return;
  }

  const name = tf(product, "name", "nameHi");
  const features = tf(product, "features", "featuresHi") || [];
  document.title = `${name} — ${STORE_NAME}`;

  container.innerHTML = `
    <div class="detail-gallery">
      <img src="${product.images[0]}" alt="${escapeHtml(name)}" class="detail-gallery-main" data-detail-main-image>
      ${product.images.length > 1 ? `
        <div class="detail-thumbs">
          ${product.images.map((img, i) => `
            <img src="${img}" alt="${escapeHtml(name)} photo ${i + 1}" class="detail-thumb ${i === 0 ? "active" : ""}" data-src="${img}">
          `).join("")}
        </div>
      ` : ""}
    </div>
    <div class="detail-info">
      <p class="detail-breadcrumb"><a href="index.html">${t("shop")}</a> / ${escapeHtml(name)}</p>
      <h1 class="detail-name">${escapeHtml(name)}</h1>
      <div class="detail-price">${CURRENCY_SYMBOL}${product.price}</div>
      <p class="detail-description">${escapeHtml(tf(product, "description", "descriptionHi"))}</p>
      ${features.length ? `
        <ul class="detail-features">
          ${features.map(f => `<li>✓ ${escapeHtml(f)}</li>`).join("")}
        </ul>
      ` : ""}

      <div class="detail-size-row">
        <span>${t("selectSize")}</span>
        <select class="detail-size-select" id="detail-size-select">
          <option value="">--</option>
          ${[1, 2, 3, 4, 5, 6, 7, 8, 9].map(s => `<option value="${s}">${s}</option>`).join("")}
          <option value="other">${t("sizeOther")}</option>
        </select>
        <input type="text" class="size-other-input" id="detail-size-other-input" placeholder="${t("sizeOtherPlaceholder")}" style="display:none;">
      </div>

      <div class="detail-qty">
        <span>${t("quantity")}</span>
        <div class="detail-qty-controls">
          <button class="detail-qty-btn" id="detail-qty-minus">−</button>
          <span id="detail-qty-value">1</span>
          <button class="detail-qty-btn" id="detail-qty-plus">+</button>
        </div>
      </div>

      <button class="detail-add-btn" id="detail-add-btn">${t("addToCart")}</button>

      <div class="detail-actions">
        <button class="detail-wishlist-btn" data-id="${product.id}">♡ ${t("saveWishlist")}</button>
        <button class="detail-share-btn">↗ ${t("share")}</button>
      </div>

      <div class="detail-policies">
        <div class="detail-policy-item">🪷 <span><strong>${t("detailReturnsTitle")}</strong> — ${t("detailReturnsBody")}</span></div>
        <div class="detail-policy-item">🚚 <span><strong>${t("detailShippingTitle")}</strong> — ${t("detailShippingBody", { shipping: CURRENCY_SYMBOL + SHIPPING_FEE })}</span></div>
        <div class="detail-policy-item">🔒 <span><strong>${t("detailSecureTitle")}</strong> — ${t("detailSecureBody")}</span></div>
      </div>
    </div>
  `;

  container.querySelectorAll(".detail-thumb").forEach(thumb => {
    thumb.addEventListener("click", () => {
      container.querySelector("[data-detail-main-image]").src = thumb.dataset.src;
      container.querySelectorAll(".detail-thumb").forEach(thumbEl => thumbEl.classList.remove("active"));
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

  const detailSizeSelect = document.getElementById("detail-size-select");
  const detailSizeOtherInput = document.getElementById("detail-size-other-input");
  detailSizeSelect.addEventListener("change", () => {
    detailSizeOtherInput.style.display = detailSizeSelect.value === "other" ? "block" : "none";
  });

  document.getElementById("detail-add-btn").addEventListener("click", () => {
    let size = detailSizeSelect.value;
    if (!size) {
      alert(t("selectSizeRequired"));
      return;
    }
    if (size === "other") {
      size = detailSizeOtherInput.value.trim();
      if (!size) {
        alert(t("enterSizeRequired"));
        detailSizeOtherInput.focus();
        return;
      }
    }
    addToCart(product.id, size, qty);
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
  if (!itemsEl) return;
  const entries = Object.entries(cart);

  if (entries.length === 0) {
    itemsEl.innerHTML = `<p class="cart-empty">${t("cartEmpty")}</p>`;
  } else {
    itemsEl.innerHTML = entries.map(([key, qty]) => {
      const { id, size } = splitCartKey(key);
      const product = PRODUCTS.find(p => p.id === id);
      if (!product) return "";
      const name = tf(product, "name", "nameHi");
      return `
        <div class="cart-item">
          <img src="${product.images[0]}" alt="${escapeHtml(name)}" class="cart-item-image">
          <div class="cart-item-info">
            <span class="cart-item-name">${escapeHtml(name)}${size ? ` <span class="cart-item-size">(${t("sizeLabel")}: ${escapeHtml(size)})</span>` : ""}</span>
            <span class="cart-item-price">${CURRENCY_SYMBOL}${product.price} x ${qty}</span>
            <div class="cart-item-controls">
              <button class="qty-btn" data-key="${key}" data-delta="-1">−</button>
              <span>${qty}</span>
              <button class="qty-btn" data-key="${key}" data-delta="1">+</button>
              <button class="remove-btn" data-key="${key}">${t("remove")}</button>
            </div>
          </div>
        </div>
      `;
    }).join("");

    itemsEl.querySelectorAll(".qty-btn").forEach(btn => {
      btn.addEventListener("click", () => changeQuantity(btn.dataset.key, Number(btn.dataset.delta)));
    });
    itemsEl.querySelectorAll(".remove-btn").forEach(btn => {
      btn.addEventListener("click", () => removeFromCart(btn.dataset.key));
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
// Locks the underlying page while a drawer is open, so a touch-scroll
// that runs out of room inside the drawer doesn't fall through and
// scroll the store page behind it (the drawer itself scrolls instead).
function setBodyScrollLocked(locked) {
  document.body.style.overflow = locked ? "hidden" : "";
}

function openCart() {
  closeWishlist();
  document.getElementById("cart-drawer").classList.add("open");
  document.getElementById("cart-overlay").classList.add("open");
  setBodyScrollLocked(true);
}

function closeCart() {
  document.getElementById("cart-drawer").classList.remove("open");
  document.getElementById("cart-overlay").classList.remove("open");
  setBodyScrollLocked(false);
}

// ============================================================
// CHECKOUT — opens Razorpay's live payment popup for the cart total
// ============================================================
function getSelectedPaymentMethod() {
  const checked = document.querySelector('input[name="payment-method"]:checked');
  return checked ? checked.value : "online";
}

function updateCheckoutUI() {
  const method = getSelectedPaymentMethod();
  const btn = document.getElementById("checkout-btn");
  const note = document.getElementById("checkout-note");
  if (!btn || !note) return;

  if (method === "cod") {
    btn.textContent = t("placeOrderCod");
    note.innerHTML = `${t("checkoutNoteCod")}<br>${t("returnsNote")}`;
  } else {
    btn.textContent = t("payNow");
    note.innerHTML = `${t("checkoutNoteOnline")}<br>${t("returnsNote")}`;
  }
}

function validateDeliveryDetails() {
  const details = getEnteredDetails();
  if (!details.name || !details.phone || !details.address) {
    alert("Please fill in your name, phone, and delivery address so we can deliver your order.");
    return false;
  }
  if (!/^\d{6}$/.test(details.pincode)) {
    alert("Please enter a valid 6-digit pincode so we can deliver your order.");
    return false;
  }
  return true;
}

function buildOrderPayload(paymentMethod, paymentId) {
  return {
    items: Object.entries(cart).map(([key, qty]) => {
      const { id, size } = splitCartKey(key);
      const product = PRODUCTS.find(p => p.id === id);
      return {
        id,
        name: product ? product.name : id,
        size: size || null,
        price: product ? product.price : 0,
        qty
      };
    }),
    subtotal: cartSubtotal(),
    shipping: cartShipping(),
    total: cartTotal(),
    paymentMethod,
    paymentId: paymentId || null,
    customer: getEnteredDetails(),
    customizationImage: customizationImageDataUrl || null,
    sizeHelpImage: sizeHelpImageDataUrl || null
  };
}

async function saveOrderToServer(payload) {
  const res = await fetch("/.netlify/functions/save-order", {
    method: "POST",
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    throw new Error("Could not save your order. Please contact us on WhatsApp so we don't miss it.");
  }
  return await res.json(); // { success, orderId }
}

function notifySellerByEmail(orderId, payload) {
  if (!WEB3FORMS_ACCESS_KEY || WEB3FORMS_ACCESS_KEY === "YOUR_WEB3FORMS_ACCESS_KEY") return;

  const itemsText = payload.items
    .map(i => `${i.name}${i.size ? ` (Size ${i.size})` : ""} x${i.qty} = ${CURRENCY_SYMBOL}${i.price * i.qty}`)
    .join("\n");

  const extras = [];
  if (payload.customizationImage) extras.push("Customer uploaded a CUSTOM DESIGN reference photo — see the Orders page.");
  if (payload.sizeHelpImage) extras.push("Customer uploaded their LADDU GOPAL'S PHOTO for sizing help — see the Orders page.");

  const message =
    `New order ${orderId}\n\n${itemsText}\n\n` +
    `Subtotal: ${CURRENCY_SYMBOL}${payload.subtotal}\nShipping: ${CURRENCY_SYMBOL}${payload.shipping}\nTotal: ${CURRENCY_SYMBOL}${payload.total}\n\n` +
    `Payment: ${payload.paymentMethod === "cod" ? "Cash on Delivery" : "Paid Online (" + payload.paymentId + ")"}\n\n` +
    `Customer: ${payload.customer.name}\nPhone: ${payload.customer.phone}\nAddress: ${payload.customer.address}` +
    (extras.length ? `\n\n${extras.join("\n")}` : "");

  fetch("https://api.web3forms.com/submit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      access_key: WEB3FORMS_ACCESS_KEY,
      subject: `New order ${orderId} — ${STORE_NAME}`,
      from_name: STORE_NAME,
      email: SELLER_EMAIL,
      message
    })
  }).catch(() => {}); // best-effort — an email failure shouldn't block the order
}

function showOrderSuccess(orderId) {
  document.getElementById("order-success-id").textContent = orderId;

  const trackBtn = document.getElementById("order-track-whatsapp-btn");
  if (trackBtn) {
    trackBtn.onclick = () => {
      const msg = `Hi! I want to track my order ${orderId}.`;
      window.open(`https://wa.me/${SELLER_WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`, "_blank");
    };
  }

  document.getElementById("order-success-overlay").classList.add("open");
  document.getElementById("order-success-modal").classList.add("open");
}

function hideOrderSuccess() {
  document.getElementById("order-success-overlay").classList.remove("open");
  document.getElementById("order-success-modal").classList.remove("open");
}

function openWhatsAppContact() {
  const url = `https://wa.me/${SELLER_WHATSAPP_NUMBER}?text=${encodeURIComponent("Hi! I have a question.")}`;
  window.open(url, "_blank");
}

async function placeCodOrder() {
  const checkoutBtn = document.getElementById("checkout-btn");
  const originalLabel = checkoutBtn.textContent;
  checkoutBtn.disabled = true;
  checkoutBtn.textContent = "Placing order...";

  try {
    const payload = buildOrderPayload("cod", null);
    const result = await saveOrderToServer(payload);
    notifySellerByEmail(result.orderId, payload);
    cart = {};
    saveCart();
    renderCart();
    resetCustomizationUploads();
    showOrderSuccess(result.orderId);
  } catch (err) {
    alert(err.message);
  } finally {
    checkoutBtn.disabled = false;
    checkoutBtn.textContent = originalLabel;
  }
}

async function checkout() {
  const entries = Object.entries(cart);
  if (entries.length === 0) {
    alert("Your cart is empty.");
    return;
  }

  if (!validateDeliveryDetails()) return;

  saveDetailsIfChecked();

  if (getSelectedPaymentMethod() === "cod") {
    await placeCodOrder();
    return;
  }

  const checkoutBtn = document.getElementById("checkout-btn");
  const originalLabel = checkoutBtn.textContent;
  checkoutBtn.disabled = true;
  checkoutBtn.textContent = "Starting payment...";

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
          try {
            const payload = buildOrderPayload("online", response.razorpay_payment_id);
            const result = await saveOrderToServer(payload);
            notifySellerByEmail(result.orderId, payload);
            cart = {};
            saveCart();
            renderCart();
            resetCustomizationUploads();
            showOrderSuccess(result.orderId);
          } catch (err) {
            alert(
              "Payment succeeded, but we couldn't save your order automatically. Please contact us on WhatsApp with payment ID: " +
                response.razorpay_payment_id
            );
          }
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
// REVIEWS — text / photo / short video, public (no login needed)
// ============================================================
async function loadReviews() {
  try {
    const res = await fetch("/.netlify/functions/get-reviews");
    if (!res.ok) return [];
    const data = await res.json();
    return data.reviews || [];
  } catch (err) {
    return [];
  }
}

function renderReviewCard(r) {
  const product = PRODUCTS.find(p => p.id === r.productId);
  const productLabel = product ? tf(product, "name", "nameHi") : t("reviewGeneric");
  const stars = r.rating ? "★".repeat(r.rating) + "☆".repeat(5 - r.rating) : "";
  const safeVideoLink = r.videoLink && /^https?:\/\//i.test(r.videoLink) ? r.videoLink : null;

  return `
    <div class="review-card">
      <div class="review-card-top">
        <span class="review-name">${escapeHtml(r.name || "Anonymous")}</span>
        ${stars ? `<span class="review-stars">${stars}</span>` : ""}
      </div>
      <div class="review-product-tag">${escapeHtml(productLabel)}</div>
      ${r.text ? `<p class="review-text">${escapeHtml(r.text)}</p>` : ""}
      ${r.image && r.image.startsWith("data:image/") ? `<img src="${r.image}" class="review-media-image" alt="Review photo">` : ""}
      ${r.video && r.video.startsWith("data:video/") ? `<video src="${r.video}" class="review-media-video" controls></video>` : ""}
      ${safeVideoLink ? `<a href="${escapeHtml(safeVideoLink)}" target="_blank" rel="noopener noreferrer" class="review-video-link">▶ ${escapeHtml(safeVideoLink)}</a>` : ""}
    </div>
  `;
}

function renderReviewsSection(productIdFilter) {
  const container = document.getElementById("reviews-section");
  if (!container) return;

  const filtered = productIdFilter
    ? REVIEWS_CACHE.filter(r => r.productId === productIdFilter)
    : REVIEWS_CACHE;

  const listHtml = filtered.length
    ? filtered.map(renderReviewCard).join("")
    : `<p class="cart-empty">${t("reviewsEmpty")}</p>`;

  const productOptionsHtml = productIdFilter
    ? ""
    : `<label class="review-field-label">${t("reviewProductLabel")}
        <select class="review-product-select">
          ${PRODUCTS.map(p => `<option value="${p.id}">${escapeHtml(tf(p, "name", "nameHi"))}</option>`).join("")}
        </select>
      </label>`;

  container.innerHTML = `
    <h2 class="reviews-heading">${t("reviewsTitle")}</h2>
    <div class="reviews-list">${listHtml}</div>
    <form class="review-form">
      <h3 class="review-form-heading">${t("writeReview")}</h3>
      ${productOptionsHtml}
      <input type="text" class="review-name-input" placeholder="${t("reviewNamePlaceholder")}">
      <select class="review-rating-select">
        <option value="">★ ☆ ☆ ☆ ☆</option>
        <option value="5">★★★★★</option>
        <option value="4">★★★★☆</option>
        <option value="3">★★★☆☆</option>
        <option value="2">★★☆☆☆</option>
        <option value="1">★☆☆☆☆</option>
      </select>
      <textarea class="review-text-input" placeholder="${t("reviewTextPlaceholder")}" rows="3"></textarea>
      <label class="review-field-label">${t("reviewPhotoLabel")}
        <input type="file" accept="image/*" class="review-photo-input">
      </label>
      <label class="review-field-label">${t("reviewVideoLabel")}
        <input type="file" accept="video/*" class="review-video-input">
      </label>
      <input type="url" class="review-videolink-input" placeholder="${t("reviewVideoLinkLabel")}">
      <button type="submit" class="review-submit-btn checkout-btn">${t("reviewSubmit")}</button>
    </form>
  `;

  container.querySelector(".review-form").addEventListener("submit", (e) => handleReviewSubmit(e, productIdFilter));
}

async function handleReviewSubmit(e, fixedProductId) {
  e.preventDefault();
  const form = e.target;
  const nameEl = form.querySelector(".review-name-input");
  const productEl = form.querySelector(".review-product-select");
  const ratingEl = form.querySelector(".review-rating-select");
  const textEl = form.querySelector(".review-text-input");
  const photoEl = form.querySelector(".review-photo-input");
  const videoEl = form.querySelector(".review-video-input");
  const videoLinkEl = form.querySelector(".review-videolink-input");
  const submitBtn = form.querySelector(".review-submit-btn");

  const text = textEl.value.trim();
  const photoFile = photoEl.files[0];
  const videoFile = videoEl.files[0];
  const videoLink = videoLinkEl.value.trim();

  if (!text && !photoFile && !videoFile && !videoLink) {
    alert(t("reviewNeedsContent"));
    return;
  }

  if (videoFile && videoFile.size > MAX_REVIEW_VIDEO_BYTES) {
    alert(t("reviewVideoTooLarge"));
    return;
  }

  const originalLabel = submitBtn.textContent;
  submitBtn.disabled = true;
  submitBtn.textContent = t("reviewSubmitting");

  try {
    const payload = {
      productId: fixedProductId || productEl.value,
      name: nameEl.value.trim(),
      rating: ratingEl.value ? Number(ratingEl.value) : null,
      text,
      image: photoFile ? await compressImageFile(photoFile, 1000, 0.75) : null,
      video: videoFile ? await readFileAsDataUrl(videoFile) : null,
      videoLink: videoLink || null
    };

    const res = await fetch("/.netlify/functions/submit-review", {
      method: "POST",
      body: JSON.stringify(payload)
    });

    if (!res.ok) throw new Error("Could not submit review");

    REVIEWS_CACHE = await loadReviews();
    renderReviewsSection(fixedProductId || null);
    alert(t("reviewThanks"));
  } catch (err) {
    alert("Something went wrong submitting your review. Please try again.");
    submitBtn.disabled = false;
    submitBtn.textContent = originalLabel;
  }
}

function renderReviewsForCurrentPage() {
  if (document.getElementById("product-grid")) {
    renderReviewsSection(null);
  } else if (document.getElementById("product-detail")) {
    const params = new URLSearchParams(window.location.search);
    renderReviewsSection(params.get("id"));
  }
}

async function initReviews() {
  REVIEWS_CACHE = await loadReviews();
  renderReviewsForCurrentPage();
}

// ============================================================
// LANGUAGE TOGGLE
// ============================================================
function toggleLanguage() {
  setLang(getLang() === "hi" ? "en" : "hi");
  applyStaticTranslations();
  renderProducts();
  renderProductDetail();
  renderCart();
  renderWishlist();
  updateCheckoutUI();
  renderReviewsForCurrentPage();
}

// ============================================================
// INIT
// ============================================================
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("year").textContent = new Date().getFullYear();
  applyStaticTranslations();
  renderProducts();
  renderProductDetail();
  renderCart();
  renderWishlist();
  loadSavedDetails();
  updateCheckoutUI();
  initReviews();

  document.getElementById("cart-toggle").addEventListener("click", openCart);
  document.getElementById("cart-close").addEventListener("click", closeCart);
  document.getElementById("cart-overlay").addEventListener("click", closeCart);
  document.getElementById("checkout-btn").addEventListener("click", checkout);
  document.getElementById("clear-details-btn").addEventListener("click", clearSavedDetails);
  const useLocationBtn = document.getElementById("use-location-btn");
  if (useLocationBtn) useLocationBtn.addEventListener("click", useCurrentLocation);
  document.querySelectorAll('input[name="payment-method"]').forEach(radio => {
    radio.addEventListener("change", updateCheckoutUI);
  });

  document.getElementById("wishlist-toggle").addEventListener("click", openWishlist);
  document.getElementById("wishlist-close").addEventListener("click", closeWishlist);
  document.getElementById("wishlist-overlay").addEventListener("click", closeWishlist);

  const successCloseBtn = document.getElementById("order-success-close");
  if (successCloseBtn) successCloseBtn.addEventListener("click", hideOrderSuccess);
  const successOverlay = document.getElementById("order-success-overlay");
  if (successOverlay) successOverlay.addEventListener("click", hideOrderSuccess);

  const whatsappContactBtn = document.getElementById("whatsapp-contact-btn");
  if (whatsappContactBtn) whatsappContactBtn.addEventListener("click", openWhatsAppContact);

  const langToggleBtn = document.getElementById("lang-toggle");
  if (langToggleBtn) langToggleBtn.addEventListener("click", toggleLanguage);

  const customDesignInput = document.getElementById("custom-design-photo");
  if (customDesignInput) {
    customDesignInput.addEventListener("change", async (e) => {
      const file = e.target.files[0];
      if (!file) {
        customizationImageDataUrl = null;
        setUploadPreview("custom-design-preview", null);
        return;
      }
      try {
        customizationImageDataUrl = await compressImageFile(file);
        setUploadPreview("custom-design-preview", customizationImageDataUrl);
      } catch (err) {
        alert("Could not read that photo. Please try a different file.");
        e.target.value = "";
      }
    });
  }

  const sizeHelpInput = document.getElementById("laddu-gopal-photo");
  if (sizeHelpInput) {
    sizeHelpInput.addEventListener("change", async (e) => {
      const file = e.target.files[0];
      if (!file) {
        sizeHelpImageDataUrl = null;
        setUploadPreview("laddu-gopal-preview", null);
        return;
      }
      try {
        sizeHelpImageDataUrl = await compressImageFile(file);
        setUploadPreview("laddu-gopal-preview", sizeHelpImageDataUrl);
      } catch (err) {
        alert("Could not read that photo. Please try a different file.");
        e.target.value = "";
      }
    });
  }
});
