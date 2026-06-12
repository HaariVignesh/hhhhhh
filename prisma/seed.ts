import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding NUE database...");

  // ─── Users ────────────────────────────────────────────────────────────────

  const adminPassword = await bcrypt.hash("Admin@1234", 12);
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

  const customerPassword = await bcrypt.hash("Test@1234", 12);
  const customer = await prisma.user.upsert({
    where: { email: "priya@example.com" },
    update: {},
    create: {
      name: "Priya Sharma",
      email: "priya@example.com",
      password: customerPassword,
      role: "CUSTOMER",
      emailVerified: new Date(),
      phone: "+919876543210",
    },
  });

  console.log(`Created users: ${admin.email}, ${customer.email}`);

  // ─── Parent Categories ────────────────────────────────────────────────────

  const catWomen = await prisma.category.upsert({
    where: { slug: "women" },
    update: {},
    create: { name: "Women", slug: "women", isActive: true, sortOrder: 0 },
  });

  const catMen = await prisma.category.upsert({
    where: { slug: "men" },
    update: {},
    create: { name: "Men", slug: "men", isActive: true, sortOrder: 1 },
  });

  const catAccessories = await prisma.category.upsert({
    where: { slug: "accessories" },
    update: {},
    create: {
      name: "Accessories",
      slug: "accessories",
      isActive: true,
      sortOrder: 2,
    },
  });

  // ─── Child Categories — Women ─────────────────────────────────────────────

  const catWomensTops = await prisma.category.upsert({
    where: { slug: "womens-tops" },
    update: {},
    create: {
      name: "Tops",
      slug: "womens-tops",
      parentId: catWomen.id,
      isActive: true,
      sortOrder: 0,
    },
  });

  const catWomensDresses = await prisma.category.upsert({
    where: { slug: "womens-dresses" },
    update: {},
    create: {
      name: "Dresses",
      slug: "womens-dresses",
      parentId: catWomen.id,
      isActive: true,
      sortOrder: 1,
    },
  });

  const catWomensBottoms = await prisma.category.upsert({
    where: { slug: "womens-bottoms" },
    update: {},
    create: {
      name: "Bottoms",
      slug: "womens-bottoms",
      parentId: catWomen.id,
      isActive: true,
      sortOrder: 2,
    },
  });

  const catWomensOuterwear = await prisma.category.upsert({
    where: { slug: "womens-outerwear" },
    update: {},
    create: {
      name: "Outerwear",
      slug: "womens-outerwear",
      parentId: catWomen.id,
      isActive: true,
      sortOrder: 3,
    },
  });

  // ─── Child Categories — Men ───────────────────────────────────────────────

  const catMensShirts = await prisma.category.upsert({
    where: { slug: "mens-shirts" },
    update: {},
    create: {
      name: "Shirts",
      slug: "mens-shirts",
      parentId: catMen.id,
      isActive: true,
      sortOrder: 0,
    },
  });

  const catMensTshirts = await prisma.category.upsert({
    where: { slug: "mens-tshirts" },
    update: {},
    create: {
      name: "T-Shirts",
      slug: "mens-tshirts",
      parentId: catMen.id,
      isActive: true,
      sortOrder: 1,
    },
  });

  const catMensTrousers = await prisma.category.upsert({
    where: { slug: "mens-trousers" },
    update: {},
    create: {
      name: "Trousers",
      slug: "mens-trousers",
      parentId: catMen.id,
      isActive: true,
      sortOrder: 2,
    },
  });

  const catMensOuterwear = await prisma.category.upsert({
    where: { slug: "mens-outerwear" },
    update: {},
    create: {
      name: "Outerwear",
      slug: "mens-outerwear",
      parentId: catMen.id,
      isActive: true,
      sortOrder: 3,
    },
  });

  // Suppress unused variable warning — referenced above via parentId
  void catMensOuterwear;

  // ─── Child Categories — Accessories ──────────────────────────────────────

  const catBags = await prisma.category.upsert({
    where: { slug: "bags" },
    update: {},
    create: {
      name: "Bags",
      slug: "bags",
      parentId: catAccessories.id,
      isActive: true,
      sortOrder: 0,
    },
  });

  const catScarves = await prisma.category.upsert({
    where: { slug: "scarves" },
    update: {},
    create: {
      name: "Scarves",
      slug: "scarves",
      parentId: catAccessories.id,
      isActive: true,
      sortOrder: 1,
    },
  });

  console.log("Created categories.");

  // ─── Helper ───────────────────────────────────────────────────────────────

  type VariantInput = { size: string; color?: string; stock: number };

  async function createProduct(data: {
    name: string;
    slug: string;
    description: string;
    price: number;
    comparePrice?: number;
    categoryId: string;
    isFeatured?: boolean;
    isNewArrival?: boolean;
    isBestSeller?: boolean;
    isTrending?: boolean;
    imageUrl: string;
    variants: VariantInput[];
  }) {
    const product = await prisma.product.upsert({
      where: { slug: data.slug },
      update: {},
      create: {
        name: data.name,
        slug: data.slug,
        description: data.description,
        price: data.price,
        comparePrice: data.comparePrice ?? null,
        categoryId: data.categoryId,
        isActive: true,
        isFeatured: data.isFeatured ?? false,
        isNewArrival: data.isNewArrival ?? false,
        isBestSeller: data.isBestSeller ?? false,
        isTrending: data.isTrending ?? false,
      },
    });

    // Primary image
    await prisma.productImage.upsert({
      where: {
        productId_isPrimary: { productId: product.id, isPrimary: true },
      },
      update: {},
      create: {
        productId: product.id,
        url: data.imageUrl,
        isPrimary: true,
        sortOrder: 0,
      },
    });

    // Variants
    for (const v of data.variants) {
      await prisma.productVariant.upsert({
        where: {
          productId_size_color: {
            productId: product.id,
            size: v.size,
            color: v.color ?? null,
          },
        },
        update: {},
        create: {
          productId: product.id,
          size: v.size,
          color: v.color ?? null,
          stock: v.stock,
          price: null,
        },
      });
    }

    return product;
  }

  // ─── Products ─────────────────────────────────────────────────────────────

  // 1. Linen Slip Dress
  await createProduct({
    name: "Linen Slip Dress",
    slug: "linen-slip-dress",
    description:
      "A minimalist linen slip dress that effortlessly transitions from day to night. Crafted from 100% breathable linen with a relaxed silhouette.",
    price: 3499,
    comparePrice: 4500,
    categoryId: catWomensDresses.id,
    isFeatured: true,
    isNewArrival: true,
    imageUrl:
      "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&q=80",
    variants: [
      { size: "S", stock: 10 },
      { size: "M", stock: 10 },
      { size: "L", stock: 10 },
      { size: "XL", stock: 10 },
    ],
  });

  // 2. Oversized Blazer
  await createProduct({
    name: "Oversized Blazer",
    slug: "oversized-blazer",
    description:
      "A structured yet relaxed oversized blazer in premium wool blend. The ultimate power piece.",
    price: 5999,
    categoryId: catWomensOuterwear.id,
    isBestSeller: true,
    imageUrl:
      "https://images.unsplash.com/photo-1591369822096-ffd140ec948f?w=800&q=80",
    variants: [
      { size: "XS", stock: 8 },
      { size: "S", stock: 8 },
      { size: "M", stock: 8 },
      { size: "L", stock: 8 },
    ],
  });

  // 3. Premium Cotton Shirt
  await createProduct({
    name: "Premium Cotton Shirt",
    slug: "premium-cotton-shirt",
    description:
      "Crafted from long-staple Egyptian cotton, this shirt offers an unparalleled softness and a clean, contemporary cut.",
    price: 2499,
    categoryId: catMensShirts.id,
    isFeatured: true,
    imageUrl:
      "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=800&q=80",
    variants: [
      { size: "S", color: "White", stock: 10 },
      { size: "M", color: "White", stock: 10 },
      { size: "L", color: "White", stock: 10 },
      { size: "XL", color: "White", stock: 10 },
      { size: "XXL", color: "White", stock: 10 },
      { size: "S", color: "Navy", stock: 10 },
      { size: "M", color: "Navy", stock: 10 },
      { size: "L", color: "Navy", stock: 10 },
      { size: "XL", color: "Navy", stock: 10 },
      { size: "XXL", color: "Navy", stock: 10 },
      { size: "S", color: "Cream", stock: 10 },
      { size: "M", color: "Cream", stock: 10 },
      { size: "L", color: "Cream", stock: 10 },
      { size: "XL", color: "Cream", stock: 10 },
      { size: "XXL", color: "Cream", stock: 10 },
    ],
  });

  // 4. Wide Leg Trousers
  await createProduct({
    name: "Wide Leg Trousers",
    slug: "wide-leg-trousers",
    description:
      "Elevated wide-leg trousers in a fluid crepe fabric. High-waisted with a gentle flare from the hip.",
    price: 3999,
    comparePrice: 4999,
    categoryId: catWomensBottoms.id,
    isTrending: true,
    imageUrl:
      "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&q=80",
    variants: [
      { size: "XS", stock: 10 },
      { size: "S", stock: 10 },
      { size: "M", stock: 10 },
      { size: "L", stock: 10 },
      { size: "XL", stock: 10 },
    ],
  });

  // 5. Minimalist Tote
  await createProduct({
    name: "Minimalist Tote",
    slug: "minimalist-tote",
    description:
      "A clean-lined tote crafted from premium vegan leather. Spacious interior with magnetic closure.",
    price: 2999,
    categoryId: catBags.id,
    isFeatured: true,
    imageUrl:
      "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&q=80",
    variants: [{ size: "ONE SIZE", stock: 25 }],
  });

  // 6. Silk Blend Scarf
  await createProduct({
    name: "Silk Blend Scarf",
    slug: "silk-blend-scarf",
    description:
      "A luxuriously soft silk blend scarf with a subtle sheen. Versatile enough to be worn as a headband, neck scarf, or bag accessory.",
    price: 1499,
    categoryId: catScarves.id,
    isNewArrival: true,
    imageUrl:
      "https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?w=800&q=80",
    variants: [{ size: "ONE SIZE", stock: 30 }],
  });

  // 7. Classic White Tee
  await createProduct({
    name: "Classic White Tee",
    slug: "classic-white-tee",
    description:
      "The foundation of every great wardrobe. Made from heavyweight 100% organic cotton with a perfect boxy fit.",
    price: 999,
    categoryId: catMensTshirts.id,
    isBestSeller: true,
    imageUrl:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80",
    variants: [
      { size: "S", stock: 20 },
      { size: "M", stock: 20 },
      { size: "L", stock: 20 },
      { size: "XL", stock: 20 },
      { size: "XXL", stock: 20 },
    ],
  });

  // 8. Wrap Midi Dress
  await createProduct({
    name: "Wrap Midi Dress",
    slug: "wrap-midi-dress",
    description:
      "A timeless wrap silhouette in a flowing midi length. Adjustable tie waist flatters every figure.",
    price: 4499,
    comparePrice: 5500,
    categoryId: catWomensDresses.id,
    isBestSeller: true,
    isTrending: true,
    imageUrl:
      "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800&q=80",
    variants: [
      { size: "XS", stock: 10 },
      { size: "S", stock: 10 },
      { size: "M", stock: 10 },
      { size: "L", stock: 10 },
      { size: "XL", stock: 10 },
    ],
  });

  // 9. Linen Trousers (Men)
  await createProduct({
    name: "Linen Trousers",
    slug: "mens-linen-trousers",
    description:
      "Relaxed-fit linen trousers with a drawstring waist. Lightweight and breathable for warm-weather dressing.",
    price: 2999,
    categoryId: catMensTrousers.id,
    isNewArrival: true,
    imageUrl:
      "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=800&q=80",
    variants: [
      { size: "S", stock: 12 },
      { size: "M", stock: 12 },
      { size: "L", stock: 12 },
      { size: "XL", stock: 12 },
    ],
  });

  // 10. Cashmere Blend Sweater
  await createProduct({
    name: "Cashmere Blend Sweater",
    slug: "cashmere-blend-sweater",
    description:
      "Indulgently soft cashmere blend sweater in a relaxed ribbed knit. An investment piece that only gets better with wear.",
    price: 6999,
    comparePrice: 8500,
    categoryId: catWomensTops.id,
    isFeatured: true,
    imageUrl:
      "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800&q=80",
    variants: [
      { size: "XS", color: "Black", stock: 8 },
      { size: "S", color: "Black", stock: 8 },
      { size: "M", color: "Black", stock: 8 },
      { size: "L", color: "Black", stock: 8 },
      { size: "XS", color: "Cream", stock: 8 },
      { size: "S", color: "Cream", stock: 8 },
      { size: "M", color: "Cream", stock: 8 },
      { size: "L", color: "Cream", stock: 8 },
      { size: "XS", color: "Sage", stock: 8 },
      { size: "S", color: "Sage", stock: 8 },
      { size: "M", color: "Sage", stock: 8 },
      { size: "L", color: "Sage", stock: 8 },
    ],
  });

  console.log("Created 10 products.");

  // ─── Coupons ──────────────────────────────────────────────────────────────

  await prisma.coupon.upsert({
    where: { code: "WELCOME10" },
    update: {},
    create: {
      code: "WELCOME10",
      type: "PERCENTAGE",
      value: 10,
      minOrderAmount: 500,
      isActive: true,
    },
  });

  await prisma.coupon.upsert({
    where: { code: "SUMMER20" },
    update: {},
    create: {
      code: "SUMMER20",
      type: "PERCENTAGE",
      value: 20,
      minOrderAmount: 1500,
      maxDiscount: 500,
      isActive: true,
    },
  });

  await prisma.coupon.upsert({
    where: { code: "FLAT99" },
    update: {},
    create: {
      code: "FLAT99",
      type: "FIXED",
      value: 99,
      minOrderAmount: 999,
      isActive: true,
    },
  });

  console.log("Created coupons.");

  // ─── Banner ───────────────────────────────────────────────────────────────

  await prisma.banner.upsert({
    where: { position_sortOrder: { position: "hero", sortOrder: 0 } },
    update: {},
    create: {
      title: "New Season Arrivals",
      subtitle: "Explore the latest in mindful fashion",
      imageUrl:
        "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1600&q=90",
      linkUrl: "/shop",
      linkText: "Shop Now",
      position: "hero",
      isActive: true,
      sortOrder: 0,
    },
  });

  console.log("Created banner.");

  // ─── Newsletter Subscribers ───────────────────────────────────────────────

  const subscribers = [
    "hello@example.com",
    "fashion@example.com",
    "minimal@example.com",
  ];

  for (const email of subscribers) {
    await prisma.newsletterSubscriber.upsert({
      where: { email },
      update: {},
      create: { email, isActive: true },
    });
  }

  console.log("Created newsletter subscribers.");
  console.log("NUE database seeded successfully.");
}

main().catch(console.error).finally(() => prisma.$disconnect());
