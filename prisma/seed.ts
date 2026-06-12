import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // ─── Users ───────────────────────────────────────────────────────────────
  const adminPassword = await bcrypt.hash("Admin@123", 12);
  const customerPassword = await bcrypt.hash("Test@1234", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@nueclothing.com" },
    update: {},
    create: {
      name: "NUE Admin",
      email: "admin@nueclothing.com",
      password: adminPassword,
      role: "ADMIN",
      emailVerified: new Date(),
    },
  });

  const customer = await prisma.user.upsert({
    where: { email: "priya@example.com" },
    update: {},
    create: {
      name: "Priya Sharma",
      email: "priya@example.com",
      password: customerPassword,
      role: "CUSTOMER",
      emailVerified: new Date(),
    },
  });

  console.log(`Created users: ${admin.email}, ${customer.email}`);

  // ─── Categories ──────────────────────────────────────────────────────────
  const women = await prisma.category.upsert({
    where: { slug: "women" },
    update: {},
    create: {
      name: "Women",
      slug: "women",
      description: "Explore our curated women's collection.",
      isActive: true,
    },
  });

  const men = await prisma.category.upsert({
    where: { slug: "men" },
    update: {},
    create: {
      name: "Men",
      slug: "men",
      description: "Refined essentials for the modern man.",
      isActive: true,
    },
  });

  const accessories = await prisma.category.upsert({
    where: { slug: "accessories" },
    update: {},
    create: {
      name: "Accessories",
      slug: "accessories",
      description: "The finishing touches that complete every look.",
      isActive: true,
    },
  });

  // Women sub-categories
  const womenTops = await prisma.category.upsert({
    where: { slug: "women-tops" },
    update: {},
    create: {
      name: "Tops",
      slug: "women-tops",
      description: "Effortless tops for every occasion.",
      parentId: women.id,
      isActive: true,
    },
  });

  const womenDresses = await prisma.category.upsert({
    where: { slug: "women-dresses" },
    update: {},
    create: {
      name: "Dresses",
      slug: "women-dresses",
      description: "From casual day dresses to elegant evening wear.",
      parentId: women.id,
      isActive: true,
    },
  });

  const womenBottoms = await prisma.category.upsert({
    where: { slug: "women-bottoms" },
    update: {},
    create: {
      name: "Bottoms",
      slug: "women-bottoms",
      description: "Trousers, skirts, and shorts for every style.",
      parentId: women.id,
      isActive: true,
    },
  });

  const womenOuterwear = await prisma.category.upsert({
    where: { slug: "women-outerwear" },
    update: {},
    create: {
      name: "Outerwear",
      slug: "women-outerwear",
      description: "Coats and jackets that make a statement.",
      parentId: women.id,
      isActive: true,
    },
  });

  // Men sub-categories
  const menShirts = await prisma.category.upsert({
    where: { slug: "men-shirts" },
    update: {},
    create: {
      name: "Shirts",
      slug: "men-shirts",
      description: "Crisp, tailored shirts for work and weekend.",
      parentId: men.id,
      isActive: true,
    },
  });

  const menTShirts = await prisma.category.upsert({
    where: { slug: "men-tshirts" },
    update: {},
    create: {
      name: "T-Shirts",
      slug: "men-tshirts",
      description: "Premium cotton tees with a perfect fit.",
      parentId: men.id,
      isActive: true,
    },
  });

  const menTrousers = await prisma.category.upsert({
    where: { slug: "men-trousers" },
    update: {},
    create: {
      name: "Trousers",
      slug: "men-trousers",
      description: "Tailored trousers that move with you.",
      parentId: men.id,
      isActive: true,
    },
  });

  const menOuterwear = await prisma.category.upsert({
    where: { slug: "men-outerwear" },
    update: {},
    create: {
      name: "Outerwear",
      slug: "men-outerwear",
      description: "Jackets and overcoats built for the season.",
      parentId: men.id,
      isActive: true,
    },
  });

  // Accessories sub-categories
  const bags = await prisma.category.upsert({
    where: { slug: "bags" },
    update: {},
    create: {
      name: "Bags",
      slug: "bags",
      description: "Totes, clutches, and crossbodies for every day.",
      parentId: accessories.id,
      isActive: true,
    },
  });

  const scarves = await prisma.category.upsert({
    where: { slug: "scarves" },
    update: {},
    create: {
      name: "Scarves",
      slug: "scarves",
      description: "Lightweight and luxurious scarves.",
      parentId: accessories.id,
      isActive: true,
    },
  });

  const jewellery = await prisma.category.upsert({
    where: { slug: "jewellery" },
    update: {},
    create: {
      name: "Jewellery",
      slug: "jewellery",
      description: "Minimal gold and silver pieces.",
      parentId: accessories.id,
      isActive: true,
    },
  });

  console.log("Categories created.");

  // Suppress unused-variable warnings — categories are used above via parentId
  void womenTops;
  void womenBottoms;
  void womenOuterwear;
  void menShirts;
  void menTShirts;
  void menTrousers;
  void menOuterwear;
  void bags;
  void scarves;
  void jewellery;

  // ─── Products ────────────────────────────────────────────────────────────
  const products = [
    {
      name: "Women's Linen Slip Dress",
      slug: "womens-linen-slip-dress",
      description:
        "A beautifully draped slip dress crafted from 100% European linen. The relaxed silhouette and delicate adjustable straps make it effortlessly versatile — wear it to brunch, the beach, or an evening out. Available in soft seasonal tones.",
      price: 3499,
      comparePrice: 4500,
      categoryId: womenDresses.id,
      material: "100% European Linen",
      careInstructions: "Hand wash cold or dry clean. Iron on low heat.",
      tags: ["linen", "slip dress", "summer", "women"],
      isFeatured: true,
      isNewArrival: true,
      isBestSeller: false,
      images: [
        "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&q=80",
        "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=800&q=80",
      ],
      variants: [
        { size: "XS", color: "Ivory", stock: 8, sku: "NUE-WLD-XS-IVY" },
        { size: "S", color: "Ivory", stock: 15, sku: "NUE-WLD-S-IVY" },
        { size: "M", color: "Ivory", stock: 12, sku: "NUE-WLD-M-IVY" },
        { size: "L", color: "Ivory", stock: 10, sku: "NUE-WLD-L-IVY" },
        { size: "S", color: "Sage", stock: 7, sku: "NUE-WLD-S-SGE" },
        { size: "M", color: "Sage", stock: 9, sku: "NUE-WLD-M-SGE" },
      ],
    },
    {
      name: "Women's Oversized Blazer",
      slug: "womens-oversized-blazer",
      description:
        "Tailored in a premium wool-blend fabric, this oversized blazer brings instant polish to any outfit. A relaxed fit with structured shoulders allows you to style it over everything from jeans to slip dresses. Features two front pockets and a single-button fastening.",
      price: 5999,
      comparePrice: 7500,
      categoryId: womenOuterwear.id,
      material: "60% Wool, 40% Polyester",
      careInstructions: "Dry clean only. Store on a padded hanger.",
      tags: ["blazer", "wool", "outerwear", "women", "office"],
      isFeatured: true,
      isNewArrival: false,
      isBestSeller: true,
      images: [
        "https://images.unsplash.com/photo-1591369822096-ffd140ec948f?w=800&q=80",
        "https://images.unsplash.com/photo-1548624313-0396c75e4b1a?w=800&q=80",
      ],
      variants: [
        { size: "XS", color: "Camel", stock: 5, sku: "NUE-WOB-XS-CAM" },
        { size: "S", color: "Camel", stock: 12, sku: "NUE-WOB-S-CAM" },
        { size: "M", color: "Camel", stock: 14, sku: "NUE-WOB-M-CAM" },
        { size: "L", color: "Camel", stock: 8, sku: "NUE-WOB-L-CAM" },
        { size: "S", color: "Charcoal", stock: 6, sku: "NUE-WOB-S-CHR" },
        { size: "M", color: "Charcoal", stock: 10, sku: "NUE-WOB-M-CHR" },
      ],
    },
    {
      name: "Men's Premium Cotton Shirt",
      slug: "mens-premium-cotton-shirt",
      description:
        "Cut from a fine two-ply cotton poplin, this shirt delivers a crisp appearance with all-day comfort. The slim collar and single-button cuffs keep it timeless, while the relaxed-slim fit flatters without restricting movement. Dress it up for the boardroom or roll the sleeves for the weekend.",
      price: 2499,
      comparePrice: 3200,
      categoryId: menShirts.id,
      material: "100% Two-Ply Cotton Poplin",
      careInstructions: "Machine wash 30°C. Tumble dry low. Iron on medium heat.",
      tags: ["shirt", "cotton", "men", "formal", "office"],
      isFeatured: false,
      isNewArrival: true,
      isBestSeller: true,
      images: [
        "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800&q=80",
        "https://images.unsplash.com/photo-1621072156002-e2fccdc0b176?w=800&q=80",
      ],
      variants: [
        { size: "S", color: "White", stock: 20, sku: "NUE-MCS-S-WHT" },
        { size: "M", color: "White", stock: 18, sku: "NUE-MCS-M-WHT" },
        { size: "L", color: "White", stock: 15, sku: "NUE-MCS-L-WHT" },
        { size: "XL", color: "White", stock: 10, sku: "NUE-MCS-XL-WHT" },
        { size: "S", color: "Sky Blue", stock: 12, sku: "NUE-MCS-S-SKY" },
        { size: "M", color: "Sky Blue", stock: 14, sku: "NUE-MCS-M-SKY" },
      ],
    },
    {
      name: "Women's Ribbed Crop Top",
      slug: "womens-ribbed-crop-top",
      description:
        "A wardrobe essential crafted from a fine ribbed cotton-modal blend for a second-skin feel. The subtle crop length and fitted silhouette pair perfectly with high-waisted bottoms. Available in a range of neutral and seasonal shades.",
      price: 1599,
      comparePrice: null,
      categoryId: womenTops.id,
      material: "70% Cotton, 30% Modal",
      careInstructions: "Machine wash cold. Do not tumble dry. Lay flat to dry.",
      tags: ["crop top", "ribbed", "women", "casual", "summer"],
      isFeatured: false,
      isNewArrival: true,
      isBestSeller: false,
      images: [
        "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800&q=80",
        "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&q=80",
      ],
      variants: [
        { size: "XS", color: "Black", stock: 14, sku: "NUE-WRT-XS-BLK" },
        { size: "S", color: "Black", stock: 18, sku: "NUE-WRT-S-BLK" },
        { size: "M", color: "Black", stock: 16, sku: "NUE-WRT-M-BLK" },
        { size: "L", color: "Black", stock: 9, sku: "NUE-WRT-L-BLK" },
        { size: "S", color: "Cream", stock: 11, sku: "NUE-WRT-S-CRM" },
        { size: "M", color: "Cream", stock: 13, sku: "NUE-WRT-M-CRM" },
      ],
    },
    {
      name: "Men's Slim Chino Trousers",
      slug: "mens-slim-chino-trousers",
      description:
        "These slim-fit chinos are constructed from a stretch-cotton twill for a clean, refined look with comfortable mobility. A mid-rise waist and tapered leg create a modern silhouette that transitions seamlessly from the office to a casual evening out.",
      price: 2999,
      comparePrice: 3800,
      categoryId: menTrousers.id,
      material: "97% Cotton, 3% Elastane",
      careInstructions: "Machine wash 40°C. Iron on medium. Do not bleach.",
      tags: ["chinos", "trousers", "men", "slim-fit", "office"],
      isFeatured: true,
      isNewArrival: false,
      isBestSeller: true,
      images: [
        "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=800&q=80",
        "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800&q=80",
      ],
      variants: [
        { size: "S", color: "Khaki", stock: 10, sku: "NUE-MSC-S-KHK" },
        { size: "M", color: "Khaki", stock: 15, sku: "NUE-MSC-M-KHK" },
        { size: "L", color: "Khaki", stock: 12, sku: "NUE-MSC-L-KHK" },
        { size: "XL", color: "Khaki", stock: 7, sku: "NUE-MSC-XL-KHK" },
        { size: "M", color: "Navy", stock: 9, sku: "NUE-MSC-M-NVY" },
        { size: "L", color: "Navy", stock: 8, sku: "NUE-MSC-L-NVY" },
      ],
    },
    {
      name: "Women's Wrap Midi Skirt",
      slug: "womens-wrap-midi-skirt",
      description:
        "A flowing wrap skirt in a lightweight crepe fabric that moves beautifully with every step. The adjustable tie waist ensures a flattering fit across sizes, while the midi length strikes the perfect balance between modest and chic. An easy piece to dress up or down.",
      price: 2199,
      comparePrice: 2800,
      categoryId: womenBottoms.id,
      material: "100% Viscose Crepe",
      careInstructions: "Hand wash cold or machine wash on delicate cycle. Do not wring.",
      tags: ["skirt", "midi", "wrap", "women", "summer"],
      isFeatured: false,
      isNewArrival: true,
      isBestSeller: false,
      images: [
        "https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=800&q=80",
        "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800&q=80",
      ],
      variants: [
        { size: "XS", color: "Terracotta", stock: 6, sku: "NUE-WWS-XS-TER" },
        { size: "S", color: "Terracotta", stock: 12, sku: "NUE-WWS-S-TER" },
        { size: "M", color: "Terracotta", stock: 10, sku: "NUE-WWS-M-TER" },
        { size: "L", color: "Terracotta", stock: 7, sku: "NUE-WWS-L-TER" },
        { size: "S", color: "Midnight Blue", stock: 8, sku: "NUE-WWS-S-MDB" },
        { size: "M", color: "Midnight Blue", stock: 9, sku: "NUE-WWS-M-MDB" },
      ],
    },
    {
      name: "Men's Essential Crew Neck Tee",
      slug: "mens-essential-crew-neck-tee",
      description:
        "The perfect everyday T-shirt, made from a heavyweight 220gsm organic cotton jersey that holds its shape wash after wash. A classic crew neck, drop-shoulder fit, and clean, minimal finish make this the most versatile piece in any wardrobe.",
      price: 1299,
      comparePrice: null,
      categoryId: menTShirts.id,
      material: "100% Organic Cotton (220gsm)",
      careInstructions: "Machine wash 30°C. Tumble dry low. Do not iron directly on print.",
      tags: ["t-shirt", "crew neck", "men", "basics", "organic cotton"],
      isFeatured: false,
      isNewArrival: false,
      isBestSeller: true,
      images: [
        "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80",
        "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&q=80",
      ],
      variants: [
        { size: "S", color: "White", stock: 20, sku: "NUE-MCT-S-WHT" },
        { size: "M", color: "White", stock: 20, sku: "NUE-MCT-M-WHT" },
        { size: "L", color: "White", stock: 18, sku: "NUE-MCT-L-WHT" },
        { size: "XL", color: "White", stock: 12, sku: "NUE-MCT-XL-WHT" },
        { size: "M", color: "Washed Black", stock: 15, sku: "NUE-MCT-M-WBK" },
        { size: "L", color: "Washed Black", stock: 14, sku: "NUE-MCT-L-WBK" },
      ],
    },
    {
      name: "Women's Trench Coat",
      slug: "womens-trench-coat",
      description:
        "A modern take on the timeless trench — this coat is cut in a premium gabardine weave with a water-repellent finish. The double-breasted front, belted waist, and storm flap detail keep it impeccably classic, while the slightly relaxed silhouette feels thoroughly contemporary.",
      price: 7999,
      comparePrice: 9500,
      categoryId: womenOuterwear.id,
      material: "65% Polyester, 35% Cotton Gabardine",
      careInstructions: "Dry clean only. Re-proof with spray after cleaning.",
      tags: ["trench coat", "outerwear", "women", "classic", "autumn"],
      isFeatured: true,
      isNewArrival: false,
      isBestSeller: true,
      images: [
        "https://images.unsplash.com/photo-1548624313-0396c75e4b1a?w=800&q=80",
        "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=800&q=80",
      ],
      variants: [
        { size: "XS", color: "Camel", stock: 5, sku: "NUE-WTC-XS-CAM" },
        { size: "S", color: "Camel", stock: 8, sku: "NUE-WTC-S-CAM" },
        { size: "M", color: "Camel", stock: 10, sku: "NUE-WTC-M-CAM" },
        { size: "L", color: "Camel", stock: 6, sku: "NUE-WTC-L-CAM" },
        { size: "S", color: "Ecru", stock: 4, sku: "NUE-WTC-S-ECR" },
        { size: "M", color: "Ecru", stock: 5, sku: "NUE-WTC-M-ECR" },
      ],
    },
    {
      name: "Leather Tote Bag",
      slug: "leather-tote-bag",
      description:
        "Handcrafted from full-grain vegetable-tanned leather, this structured tote improves with age, developing a rich patina over time. Spacious enough for a 13-inch laptop with room to spare, it features an internal zip pocket and two slip pockets for organisation.",
      price: 5499,
      comparePrice: 6500,
      categoryId: bags.id,
      material: "Full-Grain Vegetable-Tanned Leather",
      careInstructions: "Wipe clean with a damp cloth. Condition with leather balm every 3 months.",
      tags: ["tote", "leather", "bag", "accessories", "work"],
      isFeatured: true,
      isNewArrival: true,
      isBestSeller: false,
      images: [
        "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&q=80",
        "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800&q=80",
      ],
      variants: [
        { size: "One Size", color: "Tan", stock: 10, sku: "NUE-LTB-OS-TAN" },
        { size: "One Size", color: "Black", stock: 8, sku: "NUE-LTB-OS-BLK" },
        { size: "One Size", color: "Cognac", stock: 6, sku: "NUE-LTB-OS-COG" },
      ],
    },
    {
      name: "Cashmere Blend Scarf",
      slug: "cashmere-blend-scarf",
      description:
        "Woven from a sumptuous cashmere-wool blend, this large-format scarf wraps you in effortless warmth. The subtle herringbone weave and hand-rolled fringe edges give it a refined, artisanal quality. A thoughtful gift or a personal indulgence.",
      price: 3299,
      comparePrice: 4000,
      categoryId: scarves.id,
      material: "70% Cashmere, 30% Merino Wool",
      careInstructions: "Hand wash cold with specialist detergent. Dry flat in shade.",
      tags: ["scarf", "cashmere", "accessories", "winter", "gift"],
      isFeatured: false,
      isNewArrival: true,
      isBestSeller: false,
      images: [
        "https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?w=800&q=80",
        "https://images.unsplash.com/photo-1607345366928-199ea26cfe3e?w=800&q=80",
      ],
      variants: [
        { size: "One Size", color: "Oatmeal", stock: 12, sku: "NUE-CBS-OS-OAT" },
        { size: "One Size", color: "Dusty Rose", stock: 10, sku: "NUE-CBS-OS-DSR" },
        { size: "One Size", color: "Midnight", stock: 8, sku: "NUE-CBS-OS-MDN" },
      ],
    },
    {
      name: "Gold Vermeil Hoop Earrings",
      slug: "gold-vermeil-hoop-earrings",
      description:
        "Crafted from sterling silver with an 18k gold vermeil finish, these classic hoops are designed to be worn every day. The lightweight construction and secure click-closure make them comfortable for all-day wear. Hypoallergenic and tarnish-resistant.",
      price: 2299,
      comparePrice: null,
      categoryId: jewellery.id,
      material: "925 Sterling Silver with 18k Gold Vermeil",
      careInstructions: "Avoid contact with water, perfume, and lotions. Store in the pouch provided.",
      tags: ["earrings", "hoops", "gold", "jewellery", "accessories"],
      isFeatured: false,
      isNewArrival: false,
      isBestSeller: true,
      images: [
        "https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=800&q=80",
        "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&q=80",
      ],
      variants: [
        { size: "Small (20mm)", color: "Gold", stock: 15, sku: "NUE-GHE-SM-GLD" },
        { size: "Medium (30mm)", color: "Gold", stock: 18, sku: "NUE-GHE-MD-GLD" },
        { size: "Large (40mm)", color: "Gold", stock: 10, sku: "NUE-GHE-LG-GLD" },
      ],
    },
    {
      name: "Men's Wool Overcoat",
      slug: "mens-wool-overcoat",
      description:
        "A classic single-breasted overcoat in a heavyweight Italian wool blend — the kind of garment you keep for a decade. Featuring a peak lapel, two front pockets, and a fully lined interior, it drapes beautifully and offers genuine warmth without bulk.",
      price: 7499,
      comparePrice: 9000,
      categoryId: menOuterwear.id,
      material: "80% Italian Wool, 20% Polyamide",
      careInstructions: "Dry clean only. Use a clothes brush between wears. Store on a broad hanger.",
      tags: ["overcoat", "wool", "men", "outerwear", "winter", "formal"],
      isFeatured: true,
      isNewArrival: false,
      isBestSeller: false,
      images: [
        "https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=800&q=80",
        "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&q=80",
      ],
      variants: [
        { size: "S", color: "Charcoal", stock: 6, sku: "NUE-MWO-S-CHR" },
        { size: "M", color: "Charcoal", stock: 8, sku: "NUE-MWO-M-CHR" },
        { size: "L", color: "Charcoal", stock: 10, sku: "NUE-MWO-L-CHR" },
        { size: "XL", color: "Charcoal", stock: 5, sku: "NUE-MWO-XL-CHR" },
        { size: "M", color: "Camel", stock: 7, sku: "NUE-MWO-M-CAM" },
        { size: "L", color: "Camel", stock: 6, sku: "NUE-MWO-L-CAM" },
      ],
    },
  ];

  for (const productData of products) {
    const { images, variants, ...productFields } = productData;

    const product = await prisma.product.upsert({
      where: { slug: productFields.slug },
      update: {},
      create: {
        ...productFields,
        isActive: true,
        images: {
          create: images.map((url, index) => ({
            url,
            alt: `${productFields.name} — view ${index + 1}`,
            position: index,
            isPrimary: index === 0,
          })),
        },
        variants: {
          create: variants.map((v) => ({
            ...v,
            price: productFields.price,
            isActive: true,
          })),
        },
      },
    });

    console.log(`  Product created: ${product.name}`);
  }

  // ─── Coupons ─────────────────────────────────────────────────────────────
  await prisma.coupon.upsert({
    where: { code: "WELCOME10" },
    update: {},
    create: {
      code: "WELCOME10",
      type: "PERCENTAGE",
      value: 10,
      minOrderAmount: 500,
      maxUses: 1000,
      usedCount: 0,
      isActive: true,
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.coupon.upsert({
    where: { code: "SUMMER20" },
    update: {},
    create: {
      code: "SUMMER20",
      type: "PERCENTAGE",
      value: 20,
      maxDiscount: 500,
      maxUses: 500,
      usedCount: 0,
      isActive: true,
      expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.coupon.upsert({
    where: { code: "FREESHIP" },
    update: {},
    create: {
      code: "FREESHIP",
      type: "FIXED",
      value: 99,
      maxUses: 2000,
      usedCount: 0,
      isActive: true,
      expiresAt: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
    },
  });

  console.log("Coupons created.");

  // ─── Hero Banner ─────────────────────────────────────────────────────────
  await prisma.banner.upsert({
    where: { id: "main-hero" },
    update: {},
    create: {
      id: "main-hero",
      title: "New Season Arrivals",
      subtitle: "Discover our latest collection — timeless pieces crafted for the modern wardrobe.",
      imageUrl:
        "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1600&q=90",
      linkUrl: "/shop",
      linkText: "Shop Now",
      isActive: true,
      position: 0,
    },
  });

  console.log("Hero banner created.");

  // ─── Newsletter Subscribers ───────────────────────────────────────────────
  const subscribers = [
    "meera.nair@gmail.com",
    "aarav.patel@outlook.com",
    "simran.k@yahoo.com",
    "rohan.dev@gmail.com",
    "ananya.sharma@hotmail.com",
  ];

  await prisma.newsletterSubscriber.createMany({
    data: subscribers.map((email) => ({
      email,
      isActive: true,
    })),
    skipDuplicates: true,
  });

  console.log("Newsletter subscribers created.");
  console.log("\nSeeding complete!");
}

main()
  .catch((e) => {
    console.error("Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
