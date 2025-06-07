import { relations } from "drizzle-orm";
import {
  pgTable,
  text,
  timestamp,
  boolean,
  index,
  pgEnum,
  uniqueIndex,
  integer,
  numeric,
} from "drizzle-orm/pg-core";

// -------------------------------------------------------
// User Authentication Tables
// --------------------------------------------------------

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull(),
  image: text("image"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  normalizedEmail: text("normalized_email").unique(),
  role: text("role"),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at"),
  updatedAt: timestamp("updated_at"),
});

// -------------------------------------------------------
// Store Tables
// -------------------------------------------------------

export const productStatusEnum = pgEnum("product_status", [
  "ACTIVE",
  "INACTIVE",
]);

export const weightUnitEnum = pgEnum("weight_unit", [
  "GRAM",
  "KILOGRAM",
  "POUND",
  "OUNCE",
  "LITER",
]);

export const store = pgTable(
  "store",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    merchantId: text("merchant_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),

    template: text("template").notNull(),
    address: text("address").notNull(),
    phone: text("phone").notNull(),
    email: text("email").notNull(),
    description: text("description"),
  },
  (table) => [
    index("store_slug_idx").on(table.slug),
    index("store_merchant_id_idx").on(table.merchantId),
    index("store_name_idx").on(table.name),
  ]
);

export const customisations = pgTable("customisations", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  storeId: text("store_id")
    .notNull()
    .references(() => store.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const customisationsRelations = relations(customisations, ({ one }) => ({
  store: one(store, {
    fields: [customisations.storeId],
    references: [store.id],
  }),
}));

export const storeSocial = pgTable("store_social", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  storeId: text("store_id")
    .notNull()
    .references(() => store.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  link: text("link").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const storeSocialRelations = relations(storeSocial, ({ one }) => ({
  store: one(store, {
    fields: [storeSocial.storeId],
    references: [store.id],
  }),
}));

export const storeRelation = relations(store, ({ one, many }) => ({
  merchant: one(user, {
    fields: [store.merchantId],
    references: [user.id],
  }),
  categories: many(category),
  products: many(product),
  productSources: many(productSource),
  colors: many(color),
  sizes: many(size),
  banners: many(banner),
  bank: one(bank, {
    fields: [store.id],
    references: [bank.storeId],
  }),
  shippingZones: many(shippingZone),
  socials: many(storeSocial),
  customisations: one(customisations, {
    fields: [store.id],
    references: [customisations.storeId],
  }),
}));

export const bank = pgTable("bank", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  bankCode: text("bank_code").notNull(),
  bankName: text("bank_name").notNull(),
  accountName: text("account_name").notNull(),
  accountNumber: text("account_number").notNull(),
  country: text("country").notNull(),
  currency: text("currency").notNull(),
  businessName: text("business_name").notNull(),
  percentageCharge: numeric("percentage_charge").notNull(),
  subaccountCode: text("subaccount_code").notNull().unique(),
  storeId: text("store_id")
    .notNull()
    .references(() => store.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const bankRelations = relations(bank, ({ one }) => ({
  store: one(store, {
    fields: [bank.storeId],
    references: [store.id],
  }),
}));

export const category = pgTable(
  "category",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    imageUrl: text("image_url"),
    storeId: text("store_id")
      .notNull()
      .references(() => store.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("product_category_name_store_profile_id_idx").on(
      table.name,
      table.storeId
    ),
    index("product_category_store_profile_id_idx").on(table.storeId),
  ]
);
export const categoryRelations = relations(category, ({ one, many }) => ({
  store: one(store, {
    fields: [category.storeId],
    references: [store.id],
  }),
  products: many(product),
}));

export const product = pgTable("product", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  slug: text("slug").notNull(),
  description: text("description").notNull(),
  status: productStatusEnum("status").default("ACTIVE").notNull(),
  categoryId: text("category_id")
    .notNull()
    .references(() => category.id, { onDelete: "cascade" }),
  price: integer("price").notNull(), // Base price
  slashedFrom: integer("slashed_from"),
  trackQuantity: boolean("track_quantity").default(false).notNull(),
  inStock: integer("in_stock").notNull(), // Total stock across all variants
  productSourceId: text("product_source_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),

  metaTitle: text("meta_title"),
  metaDescription: text("meta_description"),
  metaKeywords: text("meta_keywords"),
  metaImage: text("meta_image"),

  storeId: text("store_profile_id")
    .notNull()
    .references(() => store.id, { onDelete: "cascade" }),
});

export const productWeight = pgTable(
  "product_weight",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    value: integer("value").notNull(), // Stores weight in smallest unit (e.g., grams) for precision
    unit: weightUnitEnum("unit").notNull(),
    displayValue: text("display_value").notNull(), // Formatted string for display (e.g., "2.5 kg")
    productId: text("product_id")
      .notNull()
      .unique() // One weight per product
      .references(() => product.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [index("product_weight_product_id_idx").on(table.productId)]
);

export const color = pgTable(
  "color",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    name: text("name").notNull(),
    value: text("value").notNull(), // hex/rgb value
    storeId: text("store_profile_id")
      .notNull()
      .references(() => store.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    // Ensure color names are unique within a store
    uniqueIndex("color_name_store_profile_id_idx").on(
      table.name,
      table.storeId
    ),
    index("color_store_profile_id_idx").on(table.storeId),
  ]
);

// Create size table
export const size = pgTable(
  "size",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    name: text("name").notNull(),
    value: text("value").notNull(), // actual size value (S, M, L, 42, etc.)
    storeId: text("store_profile_id")
      .notNull()
      .references(() => store.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    // Ensure size names are unique within a store
    uniqueIndex("size_name_store_profile_id_idx").on(table.name, table.storeId),
    index("size_store_profile_id_idx").on(table.storeId),
  ]
);

// product variant table to handle color/size combinations
export const productVariant = pgTable(
  "product_variant",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    productId: text("product_id")
      .notNull()
      .references(() => product.id, { onDelete: "cascade" }),
    colorId: text("color_id").references(() => color.id, {
      onDelete: "cascade",
    }),
    sizeId: text("size_id").references(() => size.id, { onDelete: "cascade" }),
    sku: text("sku"),
    price: integer("price"), // Override product price if needed
    inStock: integer("in_stock"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("product_variant_product_id_idx").on(table.productId),
    index("product_variant_color_id_idx").on(table.colorId),
    index("product_variant_size_id_idx").on(table.sizeId),
    // Ensure unique combination of product, color, and size
    uniqueIndex("product_variant_unique_combination_idx").on(
      table.productId,
      table.colorId,
      table.sizeId
    ),
  ]
);

export const productImage = pgTable(
  "product_image",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    url: text("url").notNull(),
    alt: text("alt"),
    position: integer("position").default(0).notNull(), // For ordering images
    isDefault: boolean("is_default").default(false).notNull(), // To mark the main product image
    productId: text("product_id")
      .notNull()
      .references(() => product.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("product_image_product_id_idx").on(table.productId),
    index("product_image_position_idx").on(table.position),
  ]
);

export const productVideo = pgTable(
  "product_video",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    url: text("url").notNull(),
    title: text("title"),
    description: text("description"),
    position: integer("position").default(0).notNull(), // For ordering videos
    thumbnail: text("thumbnail"),
    productId: text("product_id")
      .notNull()
      .references(() => product.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("product_video_product_id_idx").on(table.productId),
    index("product_video_position_idx").on(table.position),
  ]
);

export const banner = pgTable(
  "banner",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    title: text("title"),
    description: text("description"),
    imageUrl: text("image_url").notNull(),
    linkUrl: text("link_url"),
    position: integer("position").default(0).notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    storeId: text("store_profile_id")
      .notNull()
      .references(() => store.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("banner_store_profile_id_idx").on(table.storeId),
    index("banner_position_idx").on(table.position),
  ]
);

export const productSource = pgTable(
  "product_source",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    storeId: text("store_profile_id")
      .notNull()
      .references(() => store.id, { onDelete: "cascade" }),
  },
  (table) => [
    // Ensure unique combination of name and store profile
    uniqueIndex("product_source_name_store_profile_id_idx").on(
      table.name,
      table.storeId
    ),
    // Ensure unique combination of slug and store profile
    uniqueIndex("product_source_slug_store_profile_id_idx").on(
      table.slug,
      table.storeId
    ),
    index("product_source_store_profile_id_idx").on(table.storeId),
  ]
);

export const domain = pgTable(
  "domain",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    domain: text("domain").notNull().unique(),
    verified: boolean("verified").default(false).notNull(),
    storeId: text("store_id")
      .notNull()
      .references(() => store.id, { onDelete: "cascade" }),
  },
  (table) => [index("domain_store_id_idx").on(table.storeId)]
);

export const productRelations = relations(product, ({ one, many }) => ({
  store: one(store, {
    fields: [product.storeId],
    references: [store.id],
  }),
  productSource: one(productSource, {
    fields: [product.productSourceId],
    references: [productSource.id],
  }),
  category: one(category, {
    fields: [product.categoryId],
    references: [category.id],
  }),
  images: many(productImage),
  videos: many(productVideo),
  variants: many(productVariant),
  weight: one(productWeight, {
    fields: [product.id],
    references: [productWeight.productId],
  }),
}));

export const productImageRelations = relations(productImage, ({ one }) => ({
  product: one(product, {
    fields: [productImage.productId],
    references: [product.id],
  }),
}));

export const shippingZoneTypeEnum = pgEnum("shipping_zone_type", [
  "COUNTRY",
  "STATE",
  "AREA",
]);

export const shippingZone = pgTable(
  "shipping_zone",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    country: text("country").notNull(),
    state: text("state"), // Optional for country-wide zones
    area: text("area"), // Optional for state/country-wide zones
    zoneType: shippingZoneTypeEnum("zone_type").notNull(),
    shippingCost: integer("shipping_cost").notNull(), //  0 for free shipping
    isActive: boolean("is_active").default(true).notNull(),
    minOrderAmount: integer("min_order_amount"), // Optional minimum order amount for this zone
    maxOrderAmount: integer("max_order_amount"), // Optional maximum order amount for this zone
    estimatedDays: integer("estimated_days"), // Estimated delivery days
    storeId: text("store_id")
      .notNull()
      .references(() => store.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    // Ensure unique combination of country, state, area per store
    uniqueIndex("shipping_zone_location_idx").on(
      table.storeId,
      table.country,
      table.state,
      table.area
    ),
    index("shipping_zone_store_id_idx").on(table.storeId),
    index("shipping_zone_country_idx").on(table.country),
  ]
);

// For additional shipping conditions or surcharges
export const shippingCondition = pgTable(
  "shipping_condition",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    shippingZoneId: text("shipping_zone_id")
      .notNull()
      .references(() => shippingZone.id, { onDelete: "cascade" }),
    minWeight: integer("min_weight"), // In grams
    maxWeight: integer("max_weight"), // In grams
    additionalCost: integer("additional_cost").notNull(), // Additional cost for this condition
    description: text("description").notNull(), // e.g., "Heavy items surcharge"
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [index("shipping_condition_zone_id_idx").on(table.shippingZoneId)]
);

export const shippingZoneRelations = relations(
  shippingZone,
  ({ one, many }) => ({
    store: one(store, {
      fields: [shippingZone.storeId],
      references: [store.id],
    }),
    conditions: many(shippingCondition),
  })
);

export const shippingConditionRelations = relations(
  shippingCondition,
  ({ one }) => ({
    zone: one(shippingZone, {
      fields: [shippingCondition.shippingZoneId],
      references: [shippingZone.id],
    }),
  })
);
