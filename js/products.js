// ============================================================
// PRODUCT CATALOG
// Edit this list to add/remove/change your products.
// - id: must be unique for each product (used by the cart)
// - price: in INR, whole rupees (no decimals needed)
// - images: a LIST of image paths in the images/ folder. You can
//   give one photo (e.g. ["images/photo.jpg"]) or several so
//   customers can click through them (e.g.
//   ["images/front.jpg", "images/back.jpg", "images/detail.jpg"])
// - features: short quality bullet points shown on the product page
// - nameHi / descriptionHi / featuresHi: Hindi versions shown when a
//   customer switches the site to Hindi (fall back to English if left out)
// ============================================================

const PRODUCTS = [
  {
    id: "p1",
    name: "Classic Cotton Yellow Poshak",
    nameHi: "क्लासिक कॉटन पीला पोशाक",
    price: 69,
    images: [
      "images/yellow-poshak1.jpg",
      "images/yellow-poshak2.jpg",
      "images/yellow-poshak3.jpg"
    ],
    description: "Soft, breathable cotton Poshak. Available in multiple sizes(0,1,2,3,4,5,6).",
    descriptionHi: "मुलायम, हवादार सूती पोशाक। कई साइज़ों में उपलब्ध (0,1,2,3,4,5,6)।",
    features: ["Pure cotton", "Soft & breathable", "Multiple sizes available"],
    featuresHi: ["शुद्ध सूती कपड़ा", "मुलायम व हवादार", "कई साइज़ उपलब्ध"]
  },
  {
    id: "p2",
    name: "Cotton Vibrant Yellow Vastra",
    nameHi: "कॉटन चमकीला पीला वस्त्र",
    price: 59,
    images: [
      "images/vibrant-yellow-vastra1.jpg",
      "images/vibrant-yellow-vastra2.jpg",
      "images/vibrant-yellow-vastra3.jpg"
    ],
    description: "Durable cotton Yellow Poshak, perfect for everyday use. Available in multiple sizes(0,1,2,3,4,5,6).",
    descriptionHi: "टिकाऊ सूती पीला पोशाक, रोज़ के उपयोग के लिए एकदम सही। कई साइज़ों में उपलब्ध (0,1,2,3,4,5,6)।",
    features: ["Pure cotton", "Durable everyday-wear fabric", "Multiple sizes available"],
    featuresHi: ["शुद्ध सूती कपड़ा", "टिकाऊ, रोज़ पहनने योग्य कपड़ा", "कई साइज़ उपलब्ध"]
  },
  {
    id: "p3",
    name: "White Cotton Vastra",
    nameHi: "सफेद सूती वस्त्र",
    price: 49,
    images: [
      "images/white-cotton-vastra1.jpg",
      "images/white-cotton-vastra2.jpg",
      "images/white-cotton-vastra3.jpg"
    ],
    description: "Breatheable Cloth, Pure Cotton. Available in multiple sizes(0,1,2,3,4,5,6).",
    descriptionHi: "हवादार कपड़ा, शुद्ध सूती। कई साइज़ों में उपलब्ध (0,1,2,3,4,5,6)।",
    features: ["Pure cotton", "Soft & breathable", "Multiple sizes available"],
    featuresHi: ["शुद्ध सूती कपड़ा", "मुलायम व हवादार", "कई साइज़ उपलब्ध"]
  },
  {
    id: "p4",
    name: "Pure Cotton Poshak",
    nameHi: "शुद्ध सूती पोशाक",
    price: 89,
    images: [
      "images/Pure%20cotton%20poshak1.jpeg",
      "images/Pure%20cotton%20poshak2.jpeg",
      "images/Pure%20cotton%20poshan3.jpeg"
    ],
    description: "Beautifully crafted pure cotton Poshak for your Laddu Gopal. Available in multiple sizes(0,1,2,3,4,5,6).",
    descriptionHi: "आपके लड्डू गोपाल के लिए खूबसूरती से बनाई गई शुद्ध सूती पोशाक। कई साइज़ों में उपलब्ध (0,1,2,3,4,5,6)।",
    features: ["100% pure cotton", "Durable, long-lasting fabric", "Free langot included"],
    featuresHi: ["100% शुद्ध सूती कपड़ा", "टिकाऊ, लंबे समय तक चलने वाला कपड़ा", "मुफ़्त लंगोट शामिल"]
  },
  {
    id: "p5",
    name: "Sawan Special Cotton Poshak",
    nameHi: "सावन स्पेशल सूती पोशाक",
    price: 79,
    images: [
      "images/Sawan%20special%20cotton%20blue%20poshak.jpeg",
      "images/Sawan%20special%20cotton%20blue%20poshak1.jpeg",
      "images/Sawan%20special%20cotton%20blue%20poshak2.jpeg"
    ],
    description: "Festive Sawan-special cotton Poshak in a lovely blue shade. Available in multiple sizes(0,1,2,3,4,5,6).",
    descriptionHi: "सुंदर नीले रंग में सावन-विशेष सूती पोशाक। कई साइज़ों में उपलब्ध (0,1,2,3,4,5,6)।",
    features: ["Pure cotton", "Durable, festive-ready fabric", "Free langot included"],
    featuresHi: ["शुद्ध सूती कपड़ा", "टिकाऊ, त्योहारों के लिए उपयुक्त कपड़ा", "मुफ़्त लंगोट शामिल"]
  },
  {
    id: "p6",
    name: "Yellow Poshak",
    nameHi: "पीला पोशाक",
    price: 79,
    images: [
      "images/Yellow%20Poshak.jpeg"
    ],
    description: "Vibrant yellow cotton Poshak for your Laddu Gopal. Available in multiple sizes(0,1,2,3,4,5,6).",
    descriptionHi: "आपके लड्डू गोपाल के लिए चमकीली पीली सूती पोशाक। कई साइज़ों में उपलब्ध (0,1,2,3,4,5,6)।",
    features: ["Pure cotton", "Durable cloth", "Free langot included"],
    featuresHi: ["शुद्ध सूती कपड़ा", "टिकाऊ कपड़ा", "मुफ़्त लंगोट शामिल"]
  }
];
