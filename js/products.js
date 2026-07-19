// ============================================================
// PRODUCT CATALOG
// Edit this list to add/remove/change your products.
// - id: must be unique for each product (used by the cart)
// - price: in INR, whole rupees (no decimals needed)
// - images: a LIST of image paths in the images/ folder. You can
//   give one photo (e.g. ["images/photo.jpg"]) or several so
//   customers can click through them (e.g.
//   ["images/front.jpg", "images/back.jpg", "images/detail.jpg"])
// ============================================================

const PRODUCTS = [
  {
    id: "p1",
    name: "Classic Cotton Yellow Poshak",
    price: 69,
    images: [
      "images/yellow-poshak1.jpg",
      "images/yellow-poshak2.jpg",
      "images/yellow-poshak3.jpg"
    ],
    description: "Soft, breathable cotton Poshak. Available in multiple sizes(0,1,2,3,4,5,6)."
  },
  {
    id: "p2",
    name: "Cotton Vibrant Yellow Vastra",
    price: 59,
    images: [
      "images/vibrant-yellow-vastra1.jpg",
      "images/vibrant-yellow-vastra2.jpg",
      "images/vibrant-yellow-vastra3.jpg"
    ],
    description: "Durable cotton Yellow Poshak, perfect for everyday use. Available in multiple sizes(0,1,2,3,4,5,6)."
  },
  {
    id: "p3",
    name: "White Cotton Vastra",
    price: 49,
    images: [
      "images/white-cotton-vastra1.jpg",
      "images/white-cotton-vastra2.jpg",
      "images/white-cotton-vastra3.jpg"
    ],
    description: "Breatheable Cloth, Pure Cotton. Available in multiple sizes(0,1,2,3,4,5,6)."
  }
];
