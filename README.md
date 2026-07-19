# My Store

A free, no-backend online store: a product catalog + shopping cart that runs
entirely in the browser, with checkout handled over WhatsApp + a Razorpay
payment link.

## How it works

1. Customer browses products and adds items to their cart (saved in their browser).
2. At checkout, they tap "Checkout via WhatsApp" — this opens WhatsApp with a
   pre-filled message listing their order and total.
3. You receive the WhatsApp message, and reply with a Razorpay payment link for
   that exact amount.
4. Customer pays through Razorpay's secure hosted page (cards, UPI, netbanking, wallets).

This avoids needing a server, a database, or handling any card details yourself.

## 1. Customize your store

- **Products**: edit `js/products.js`. Each product needs a unique `id`, a
  `name`, a `price` (in rupees), a `description`, and an `image` path.
- **Product photos**: put your images in the `images/` folder and update the
  `image` path for each product in `products.js`. Replace `placeholder.svg`.
- **Your WhatsApp number**: open `js/cart.js` and set
  `SELLER_WHATSAPP_NUMBER` to your number in the format `91XXXXXXXXXX`
  (country code, no `+`, no spaces, no leading zero).
- **Store name / text**: edit `index.html` (the `<h1 class="logo">` and hero text).

## 2. Preview it locally

Just open `index.html` in your browser by double-clicking it. No install needed.

## 3. Set up Razorpay (free, pay-per-transaction only)

1. Go to razorpay.com and sign up (free).
2. Complete KYC (PAN, bank account details) — required before you can accept
   real payments; you can explore the dashboard in test mode before this is done.
3. Once approved, go to **Payment Links** in the dashboard.
4. When a customer messages you their order, create a new Payment Link for
   that exact total and send it to them on WhatsApp.
5. Razorpay deducts its fee automatically and settles the rest to your bank account.

Typical Razorpay fees are around 2% per transaction for cards/netbanking, and
UPI transactions are frequently fee-free or near-zero — check the current
rates on razorpay.com/pricing since they do change.

**Alternatives** if Razorpay's KYC doesn't work for you: Cashfree or
Instamojo, both free to sign up with similar pay-per-transaction pricing and
their own "Payment Links" feature.

## 4. Put it online for free

Pick one:

### Option A: GitHub Pages
1. Create a free GitHub account and a new repository.
2. Upload this whole `my-store` folder's contents to the repository.
3. In the repo, go to **Settings → Pages**, set the source branch to `main`,
   folder `/ (root)`.
4. Your site goes live at `https://<your-username>.github.io/<repo-name>/`.

### Option B: Netlify
1. Create a free Netlify account.
2. Drag and drop the `my-store` folder onto the Netlify dashboard ("Deploy manually").
3. Netlify gives you a free `https://your-site-name.netlify.app` URL instantly.

Both are free forever for a static site like this one — no credit card needed.

## 5. Optional next steps

- **Custom domain**: buy a `.com`/`.in` domain (~₹500–1000/year, not free) and
  point it at your GitHub Pages/Netlify site.
- **More automated checkout**: once you outgrow the WhatsApp flow, Razorpay
  also offers a JS checkout that can charge the cart total directly on your
  site — but that requires a small backend (e.g. a free Netlify Function) to
  create the order securely. Ask when you're ready for that step.
