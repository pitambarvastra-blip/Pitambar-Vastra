// ============================================================
// LANGUAGE (English / Hindi)
// - Static page text uses data-i18n="key" (textContent) and
//   data-i18n-placeholder="key" (input placeholder) attributes.
// - JS-rendered text (product cards, cart, reviews, etc.) calls t("key").
// - Preference is remembered in the browser via localStorage.
// ============================================================

const LANG_STORAGE_KEY = "siteLang";

const I18N = {
  en: {
    wishlist: "Wishlist",
    cart: "Cart",
    heroTitle: "Welcome to Pitambar Vastra",
    heroSubtitle: "Quality products, delivered to your door.",
    trustReturnsTitle: "3-Day Returns",
    trustReturnsBody: "Unused items, full refund",
    trustShippingTitle: "₹29 Shipping",
    trustShippingBody: "Flat rate, all orders",
    trustSecureTitle: "Secure Payment",
    trustSecureBody: "Powered by Razorpay",
    wishlistTitle: "Your Wishlist",
    wishlistEmpty: "Your wishlist is empty.",
    moveToCart: "Move to Cart",
    remove: "Remove",
    cartTitle: "Your Cart",
    cartEmpty: "Your cart is empty.",
    deliveryDetailsTitle: "Delivery Details",
    deliveryDetailsNote: "(required to place your order)",
    placeholderName: "Full name",
    placeholderPhone: "Phone number",
    placeholderAddress: "Delivery address",
    placeholderPincode: "Pincode (6 digits)",
    useLocation: "Use my current location",
    locationFetching: "Getting your location...",
    locationFilled: "Location filled in — please check it's correct.",
    locationFailed: "Could not detect address from location. Please type it in.",
    locationDenied: "Location permission denied. Please enter your address manually.",
    locationNotSupported: "Location isn't supported on this device. Please enter your address manually.",
    rememberDetails: "Remember my details for next time",
    clear: "Clear",
    customizationTitle: "Custom Design & Sizing Help",
    customizationNote: "(both optional)",
    customUploadLabel: "Want a custom design? Upload a reference photo (optional)",
    sizeHelpUploadLabel: "Don't know the size? Upload your Laddu Gopal's photo and we'll pick the right size (optional)",
    subtotal: "Subtotal",
    shipping: "Shipping",
    total: "Total",
    payOnline: "Pay Online",
    cashOnDelivery: "Cash on Delivery",
    payNow: "Pay Now",
    placeOrderCod: "Place Order (COD)",
    checkoutNoteOnline: "Secure payment powered by Razorpay. After payment, you'll be asked to share your delivery address on WhatsApp.",
    checkoutNoteCod: "Pay in cash when your order is delivered.",
    returnsNote: "🪷 3-day returns on unused items.",
    orderSuccessTitle: "Order Placed Successfully!",
    orderIdLabel: "Your order ID is",
    orderSuccessBody: "We've received your order and will contact you if needed. Thank you for shopping with us!",
    trackWhatsappLine: "You can track your order anytime — just message us on WhatsApp and we'll let you know where it is.",
    trackWhatsappBtn: "💬 Track My Order on WhatsApp",
    continueShopping: "Continue Shopping",
    footerReturnsLabel: "Returns:",
    footerReturnsBody: "Full refund within 3 days of delivery if you're not happy with your purchase, as long as the item is unused and in its original condition.",
    footerShippingLabel: "Shipping:",
    footerShippingBody: "Flat ₹29 on every order.",
    privacyPolicy: "Privacy Policy",
    termsConditions: "Terms & Conditions",
    messageWhatsapp: "Message us on WhatsApp",
    shop: "Shop",
    quantity: "Quantity",
    addToCart: "Add to Cart",
    saveWishlist: "Save",
    savedWishlist: "Saved",
    share: "Share",
    returnBadge: "🪷 3-day returns",
    selectSize: "Size",
    sizeLabel: "Size",
    sizeOther: "Other (write your own)",
    sizeOtherPlaceholder: "Enter your size",
    selectSizeRequired: "Please select a size before adding to cart.",
    enterSizeRequired: "Please enter your size.",
    detailReturnsTitle: "3-Day Returns",
    detailReturnsBody: "full refund if unused and in original condition.",
    detailShippingTitle: "Shipping",
    detailShippingBody: "flat {shipping} on every order.",
    detailSecureTitle: "Secure Payment",
    detailSecureBody: "checkout powered by Razorpay.",
    productNotFound: "Sorry, we couldn't find that product.",
    backToShop: "Back to shop",
    reviewsTitle: "Customer Reviews",
    reviewsEmpty: "No reviews yet — be the first to share your experience!",
    writeReview: "Write a Review",
    reviewProductLabel: "Which product?",
    reviewNamePlaceholder: "Your name",
    reviewTextPlaceholder: "Share your experience with this Poshak...",
    reviewPhotoLabel: "Add a photo (optional)",
    reviewVideoLabel: "Add a short video, under 8MB (optional)",
    reviewVideoLinkLabel: "Or paste a video link — YouTube, Instagram, Drive (optional)",
    reviewSubmit: "Submit Review",
    reviewSubmitting: "Submitting...",
    reviewThanks: "Thank you! Your review has been posted.",
    reviewVideoTooLarge: "That video is too large to upload directly (max 8MB). Please use the video link field instead.",
    reviewNeedsContent: "Please add some text, a photo, or a video/link so others can see your review.",
    reviewGeneric: "General"
  },
  hi: {
    wishlist: "विशलिस्ट",
    cart: "कार्ट",
    heroTitle: "पीताम्बर वस्त्र में आपका स्वागत है",
    heroSubtitle: "गुणवत्तापूर्ण उत्पाद, आपके द्वार तक पहुँचाए जाते हैं।",
    trustReturnsTitle: "3-दिन वापसी",
    trustReturnsBody: "अनुपयोगित वस्तुएं, पूरा रिफंड",
    trustShippingTitle: "₹29 शिपिंग",
    trustShippingBody: "सभी ऑर्डर पर एक समान दर",
    trustSecureTitle: "सुरक्षित भुगतान",
    trustSecureBody: "Razorpay द्वारा संचालित",
    wishlistTitle: "आपकी विशलिस्ट",
    wishlistEmpty: "आपकी विशलिस्ट खाली है।",
    moveToCart: "कार्ट में डालें",
    remove: "हटाएं",
    cartTitle: "आपका कार्ट",
    cartEmpty: "आपका कार्ट खाली है।",
    deliveryDetailsTitle: "डिलीवरी विवरण",
    deliveryDetailsNote: "(ऑर्डर देने के लिए आवश्यक)",
    placeholderName: "पूरा नाम",
    placeholderPhone: "फ़ोन नंबर",
    placeholderAddress: "डिलीवरी पता",
    placeholderPincode: "पिनकोड (6 अंक)",
    useLocation: "मेरी वर्तमान लोकेशन का उपयोग करें",
    locationFetching: "आपकी लोकेशन प्राप्त की जा रही है...",
    locationFilled: "लोकेशन भर दी गई है — कृपया जांच लें कि यह सही है।",
    locationFailed: "लोकेशन से पता नहीं मिल सका। कृपया इसे स्वयं लिखें।",
    locationDenied: "लोकेशन की अनुमति नहीं मिली। कृपया अपना पता स्वयं दर्ज करें।",
    locationNotSupported: "इस डिवाइस पर लोकेशन उपलब्ध नहीं है। कृपया अपना पता स्वयं दर्ज करें।",
    rememberDetails: "अगली बार के लिए मेरा विवरण याद रखें",
    clear: "साफ़ करें",
    customizationTitle: "कस्टम डिज़ाइन और साइज़ मदद",
    customizationNote: "(दोनों वैकल्पिक हैं)",
    customUploadLabel: "कस्टम डिज़ाइन चाहिए? एक फोटो अपलोड करें (वैकल्पिक)",
    sizeHelpUploadLabel: "साइज़ नहीं पता? अपने लड्डू गोपाल की फोटो अपलोड करें, हम सही साइज़ चुन लेंगे (वैकल्पिक)",
    subtotal: "उप-योग",
    shipping: "शिपिंग",
    total: "कुल",
    payOnline: "ऑनलाइन भुगतान करें",
    cashOnDelivery: "डिलीवरी पर नकद भुगतान",
    payNow: "अभी भुगतान करें",
    placeOrderCod: "ऑर्डर करें (COD)",
    checkoutNoteOnline: "Razorpay द्वारा सुरक्षित भुगतान। भुगतान के बाद, आपसे WhatsApp पर डिलीवरी पता माँगा जाएगा।",
    checkoutNoteCod: "डिलीवरी के समय नकद भुगतान करें।",
    returnsNote: "🪷 अनुपयोगित वस्तुओं पर 3-दिन की वापसी।",
    orderSuccessTitle: "ऑर्डर सफलतापूर्वक दिया गया!",
    orderIdLabel: "आपकी ऑर्डर आईडी है",
    orderSuccessBody: "हमें आपका ऑर्डर मिल गया है, ज़रूरत पड़ने पर हम आपसे संपर्क करेंगे। हमारे साथ खरीदारी करने के लिए धन्यवाद!",
    trackWhatsappLine: "आप कभी भी अपने ऑर्डर को ट्रैक कर सकते हैं — बस हमें WhatsApp पर मैसेज करें, हम आपको बता देंगे कि आपका ऑर्डर कहाँ है।",
    trackWhatsappBtn: "💬 WhatsApp पर मेरा ऑर्डर ट्रैक करें",
    continueShopping: "खरीदारी जारी रखें",
    footerReturnsLabel: "वापसी:",
    footerReturnsBody: "यदि आप अपनी खरीद से संतुष्ट नहीं हैं, तो डिलीवरी के 3 दिनों के भीतर पूरा रिफंड, बशर्ते वस्तु अप्रयुक्त हो और मूल स्थिति में हो।",
    footerShippingLabel: "शिपिंग:",
    footerShippingBody: "हर ऑर्डर पर ₹29 फ्लैट।",
    privacyPolicy: "प्राइवेसी पॉलिसी",
    termsConditions: "नियम व शर्तें",
    messageWhatsapp: "हमें WhatsApp पर मैसेज करें",
    shop: "शॉप",
    quantity: "मात्रा",
    addToCart: "कार्ट में डालें",
    saveWishlist: "सेव करें",
    savedWishlist: "सेव किया गया",
    share: "शेयर करें",
    returnBadge: "🪷 3-दिन वापसी",
    selectSize: "साइज़",
    sizeLabel: "साइज़",
    sizeOther: "अन्य (स्वयं लिखें)",
    sizeOtherPlaceholder: "अपना साइज़ दर्ज करें",
    selectSizeRequired: "कार्ट में जोड़ने से पहले कृपया एक साइज़ चुनें।",
    enterSizeRequired: "कृपया अपना साइज़ दर्ज करें।",
    detailReturnsTitle: "3-दिन वापसी",
    detailReturnsBody: "यदि अप्रयुक्त और मूल स्थिति में है तो पूरा रिफंड।",
    detailShippingTitle: "शिपिंग",
    detailShippingBody: "हर ऑर्डर पर फ्लैट {shipping}।",
    detailSecureTitle: "सुरक्षित भुगतान",
    detailSecureBody: "Razorpay द्वारा सुरक्षित चेकआउट।",
    productNotFound: "क्षमा करें, हमें वह उत्पाद नहीं मिला।",
    backToShop: "शॉप पर वापस जाएं",
    reviewsTitle: "ग्राहक समीक्षाएं",
    reviewsEmpty: "अभी तक कोई समीक्षा नहीं — अपना अनुभव साझा करने वाले पहले व्यक्ति बनें!",
    writeReview: "समीक्षा लिखें",
    reviewProductLabel: "कौन सा उत्पाद?",
    reviewNamePlaceholder: "आपका नाम",
    reviewTextPlaceholder: "इस पोशाक के साथ अपना अनुभव साझा करें...",
    reviewPhotoLabel: "एक फोटो जोड़ें (वैकल्पिक)",
    reviewVideoLabel: "एक छोटा वीडियो जोड़ें, 8MB से कम (वैकल्पिक)",
    reviewVideoLinkLabel: "या एक वीडियो लिंक पेस्ट करें — YouTube, Instagram, Drive (वैकल्पिक)",
    reviewSubmit: "समीक्षा सबमिट करें",
    reviewSubmitting: "सबमिट हो रहा है...",
    reviewThanks: "धन्यवाद! आपकी समीक्षा पोस्ट कर दी गई है।",
    reviewVideoTooLarge: "यह वीडियो सीधे अपलोड करने के लिए बहुत बड़ा है (अधिकतम 8MB)। कृपया वीडियो लिंक फ़ील्ड का उपयोग करें।",
    reviewNeedsContent: "कृपया कुछ टेक्स्ट, एक फोटो, या वीडियो/लिंक जोड़ें ताकि अन्य लोग आपकी समीक्षा देख सकें।",
    reviewGeneric: "सामान्य"
  }
};

function getLang() {
  return localStorage.getItem(LANG_STORAGE_KEY) === "hi" ? "hi" : "en";
}

function setLang(lang) {
  localStorage.setItem(LANG_STORAGE_KEY, lang === "hi" ? "hi" : "en");
}

function t(key, vars) {
  const dict = I18N[getLang()] || I18N.en;
  let str = dict[key] !== undefined ? dict[key] : (I18N.en[key] !== undefined ? I18N.en[key] : key);
  if (vars) {
    Object.keys(vars).forEach(k => {
      str = str.replace(`{${k}}`, vars[k]);
    });
  }
  return str;
}

// Picks the Hindi field (e.g. product.nameHi) when Hindi is active,
// falling back to the English field if it's missing.
function tf(obj, fieldEn, fieldHi) {
  if (getLang() === "hi" && obj[fieldHi]) return obj[fieldHi];
  return obj[fieldEn];
}

function applyStaticTranslations() {
  document.querySelectorAll("[data-i18n]").forEach(el => {
    el.textContent = t(el.dataset.i18n);
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
    el.placeholder = t(el.dataset.i18nPlaceholder);
  });
  document.documentElement.lang = getLang();
  const toggleBtn = document.getElementById("lang-toggle");
  if (toggleBtn) toggleBtn.textContent = getLang() === "hi" ? "EN" : "हिं";
}
