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
  jsonb,
} from "drizzle-orm/pg-core";

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
    logoUrl: text("logo_url"),
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

export const customisations = pgTable(
  "customisations",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    storeId: text("store_id")
      .notNull()
      .references(() => store.id, { onDelete: "cascade" }),
    template: text("template").notNull(), // e.g., 'default', 'modern', etc.
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("customisations_unique_template_per_store_idx").on(
      table.storeId,
      table.template
    ),
  ]
);

export const productWheelSettings = pgTable("product_wheel_settings", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  show: boolean("show").default(true).notNull(),
  circleTime: integer("circle_time").default(3).notNull(),
  productCount: integer("product_count").default(6).notNull(),
  categoryId: text("category_id").default("all"), // Can reference category.id or be 'all'
  customisationId: text("customisation_id")
    .notNull()
    .unique()
    .references(() => customisations.id, { onDelete: "cascade" }),
});

export const bannerSettings = pgTable("banner_settings", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  show: boolean("show").default(true).notNull(),
  customisationId: text("customisation_id")
    .notNull()
    .unique()
    .references(() => customisations.id, { onDelete: "cascade" }),
});

export const customisationsRelations = relations(customisations, ({ one }) => ({
  store: one(store, {
    fields: [customisations.storeId],
    references: [store.id],
  }),
  productWheelSettings: one(productWheelSettings, {
    fields: [customisations.id],
    references: [productWheelSettings.customisationId],
  }),
  bannerSettings: one(bannerSettings, {
    fields: [customisations.id],
    references: [bannerSettings.customisationId],
  }),
}));

export const productWheelSettingsRelations = relations(
  productWheelSettings,
  ({ one }) => ({
    customisation: one(customisations, {
      fields: [productWheelSettings.customisationId],
      references: [customisations.id],
    }),
  })
);

export const bannerSettingsRelations = relations(bannerSettings, ({ one }) => ({
  customisation: one(customisations, {
    fields: [bannerSettings.customisationId],
    references: [customisations.id],
  }),
}));

export const customer = pgTable(
  "customer",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    name: text("name").notNull(),
    email: text("email").notNull(),
    phone: text("phone"),
    image: text("image"),
    password: text("password").notNull(),
    storeId: text("store_id")
      .notNull()
      .references(() => store.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("customer_store_name_idx").on(table.storeId, table.name),
    index("customer_store_email_idx").on(table.storeId, table.email),
    index("customer_name_search_idx").on(table.name),
    index("customer_email_search_idx").on(table.email),
    index("customer_store_created_idx").on(table.storeId, table.createdAt),
  ]
);

export const customerRelations = relations(customer, ({ one, many }) => ({
  store: one(store, {
    fields: [customer.storeId],
    references: [store.id],
  }),
  sessions: many(customerSesssion),
  savedProducts: many(customerSavedProduct),
  savedAddresses: many(customerSavedAddress),
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
  customers: many(customer),
  categories: many(category),
  products: many(product),
  productSources: many(productSource),
  colors: many(color),
  sizes: many(size),
  banners: many(banner),
  tags: many(tag),
  bank: one(bank, {
    fields: [store.id],
    references: [bank.storeId],
  }),
  shippingZones: many(shippingZone),
  socials: many(storeSocial),
  customisations: many(customisations),
  orders: many(order),
  orderItems: many(orderItem),
  visits: many(storeVisit),
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
    index("category_name_search_idx").on(table.name),
  ]
);
export const categoryRelations = relations(category, ({ one, many }) => ({
  store: one(store, {
    fields: [category.storeId],
    references: [store.id],
  }),
  products: many(product),
}));

export const product = pgTable(
  "product",
  {
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
  },
  (table) => [
    index("product_store_status_idx").on(table.storeId, table.status),
    index("product_store_name_idx").on(table.storeId, table.name),
    index("product_name_search_idx").on(table.name),
    index("product_description_search_idx").on(table.description),
    index("product_meta_search_idx").on(table.metaTitle, table.metaKeywords),
  ]
);

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

export const colorRelations = relations(color, ({ one }) => ({
  store: one(store, {
    fields: [color.storeId],
    references: [store.id],
  }),
}));

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

export const sizeRelations = relations(size, ({ one }) => ({
  store: one(store, {
    fields: [size.storeId],
    references: [store.id],
  }),
}));

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
    // Search performance index for default images
    index("product_image_default_idx").on(table.productId, table.isDefault),
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

export const bannerRelations = relations(banner, ({ one }) => ({
  store: one(store, {
    fields: [banner.storeId],
    references: [store.id],
  }),
}));

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

export const productSourceRelations = relations(productSource, ({ one }) => ({
  store: one(store, {
    fields: [productSource.storeId],
    references: [store.id],
  }),
}));

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
  tags: many(productTag),
}));

export const customerSesssion = pgTable("customer_session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  customerId: text("customer_id")
    .notNull()
    .references(() => customer.id, { onDelete: "cascade" }),
});

export const customerSesssionRelations = relations(
  customerSesssion,
  ({ one }) => ({
    customer: one(customer, {
      fields: [customerSesssion.customerId],
      references: [customer.id],
    }),
  })
);

export const productImageRelations = relations(productImage, ({ one }) => ({
  product: one(product, {
    fields: [productImage.productId],
    references: [product.id],
  }),
}));

export const productVideoRelations = relations(productVideo, ({ one }) => ({
  product: one(product, {
    fields: [productVideo.productId],
    references: [product.id],
  }),
}));

export const productVariantRelations = relations(productVariant, ({ one }) => ({
  product: one(product, {
    fields: [productVariant.productId],
    references: [product.id],
  }),
  color: one(color, {
    fields: [productVariant.colorId],
    references: [color.id],
  }),
  size: one(size, {
    fields: [productVariant.sizeId],
    references: [size.id],
  }),
}));

export const productWeightRelations = relations(productWeight, ({ one }) => ({
  product: one(product, {
    fields: [productWeight.productId],
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

// -------------------------------------------------------
// Customer Saved Products Table
// -------------------------------------------------------

export const customerSavedProduct = pgTable(
  "customer_saved_product",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    customerId: text("customer_id")
      .notNull()
      .references(() => customer.id, { onDelete: "cascade" }),
    productId: text("product_id")
      .notNull()
      .references(() => product.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    // Ensure a customer can only save a product once
    uniqueIndex("customer_saved_product_unique_idx").on(
      table.customerId,
      table.productId
    ),
    index("customer_saved_product_customer_id_idx").on(table.customerId),
    index("customer_saved_product_product_id_idx").on(table.productId),
  ]
);

export const customerSavedProductRelations = relations(
  customerSavedProduct,
  ({ one }) => ({
    customer: one(customer, {
      fields: [customerSavedProduct.customerId],
      references: [customer.id],
    }),
    product: one(product, {
      fields: [customerSavedProduct.productId],
      references: [product.id],
    }),
  })
);

// -------------------------------------------------------
// Customer Saved Addresses Table
// -------------------------------------------------------

export const customerSavedAddress = pgTable(
  "customer_saved_address",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    customerId: text("customer_id")
      .notNull()
      .references(() => customer.id, { onDelete: "cascade" }),
    label: text("label").notNull(), // e.g., "Home", "Work", "Office"
    address: text("address").notNull(),
    primaryPhone: text("primary_phone").notNull(),
    secondaryPhone: text("secondary_phone"),
    additionalInfo: text("additional_info"),
    isDefault: boolean("is_default").default(false).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("customer_saved_address_customer_id_idx").on(table.customerId),
    index("customer_saved_address_default_idx").on(
      table.customerId,
      table.isDefault
    ),
  ]
);

export const customerSavedAddressRelations = relations(
  customerSavedAddress,
  ({ one }) => ({
    customer: one(customer, {
      fields: [customerSavedAddress.customerId],
      references: [customer.id],
    }),
  })
);

export const tag = pgTable(
  "tag",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    storeId: text("store_id")
      .notNull()
      .references(() => store.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    // Ensure tag names are unique within a store
    uniqueIndex("tag_name_store_id_idx").on(table.name, table.storeId),
    // Ensure tag slugs are unique within a store
    uniqueIndex("tag_slug_store_id_idx").on(table.slug, table.storeId),
    index("tag_store_id_idx").on(table.storeId),
    index("tag_name_search_idx").on(table.name),
  ]
);

export const productTag = pgTable(
  "product_tag",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    productId: text("product_id")
      .notNull()
      .references(() => product.id, { onDelete: "cascade" }),
    tagId: text("tag_id")
      .notNull()
      .references(() => tag.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    // Ensure unique product-tag combinations
    uniqueIndex("product_tag_unique_idx").on(table.productId, table.tagId),
    index("product_tag_product_id_idx").on(table.productId),
    index("product_tag_tag_id_idx").on(table.tagId),
    index("product_tag_composite_idx").on(table.tagId, table.productId),
  ]
);

export const tagRelations = relations(tag, ({ one, many }) => ({
  store: one(store, {
    fields: [tag.storeId],
    references: [store.id],
  }),
  products: many(productTag),
}));

export const productTagRelations = relations(productTag, ({ one }) => ({
  product: one(product, {
    fields: [productTag.productId],
    references: [product.id],
  }),
  tag: one(tag, {
    fields: [productTag.tagId],
    references: [tag.id],
  }),
}));

export const paymentStatusEnum = pgEnum("payment_status", [
  "PENDING",
  "PAID",
  "FAILED",
  "REFUNDED",
]);

export const fulfillmentStatusEnum = pgEnum("fulfillment_status", [
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
]);

export const order = pgTable(
  "order",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    storeId: text("store_id")
      .notNull()
      .references(() => store.id, { onDelete: "cascade" }),
    customerId: text("customer_id")
      .notNull()
      .references(() => customer.id, { onDelete: "cascade" }),
    paymentStatus: paymentStatusEnum("payment_status")
      .default("PENDING")
      .notNull(),
    fulfillmentStatus: fulfillmentStatusEnum("fulfillment_status")
      .default("PROCESSING")
      .notNull(),
    paymentReference: text("payment_reference").notNull().unique(),
    paymentAccessCode: text("payment_access_code").notNull().unique(),
    subtotal: integer("subtotal").notNull(),
    total: integer("total").notNull(),
    shippingCost: integer("shipping_cost").notNull(),
    shippingInfo: jsonb("shipping_info").notNull(),
    trackingNumber: text("tracking_number"),
    shippingProvider: text("shipping_provider"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    shippedAt: timestamp("shipped_at"),
    deliveredAt: timestamp("delivered_at"),
  },
  (table) => [
    uniqueIndex("order_payment_reference_idx").on(table.paymentReference),
    uniqueIndex("order_payment_access_code_idx").on(table.paymentAccessCode),
    index("order_store_id_idx").on(table.storeId),
    index("order_customer_id_idx").on(table.customerId),
    index("order_payment_status_idx").on(table.paymentStatus),
    index("order_fulfillment_status_idx").on(table.fulfillmentStatus),
    index("payment_reference_idx").on(table.paymentReference),
    index("order_store_payment_ref_idx").on(
      table.storeId,
      table.paymentReference
    ),
    index("order_store_created_idx").on(table.storeId, table.createdAt),
  ]
);

export const orderItem = pgTable(
  "order_item",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    orderId: text("order_id")
      .notNull()
      .references(() => order.id, { onDelete: "cascade" }),
    productId: text("product_id")
      .notNull()
      .references(() => product.id),
    storeId: text("store_id")
      .notNull()
      .references(() => store.id, { onDelete: "cascade" }),
    variantId: text("variant_id").references(() => productVariant.id),
    quantity: integer("quantity").notNull(),
    productName: text("product_name").notNull(),
    variantDetails: text("variant_details"),
    price: integer("price").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("order_item_order_id_idx").on(table.orderId),
    index("order_item_product_id_idx").on(table.productId),
    index("order_item_variant_id_idx").on(table.variantId),
  ]
);

export const orderRelations = relations(order, ({ one, many }) => ({
  customer: one(customer, {
    fields: [order.customerId],
    references: [customer.id],
  }),
  store: one(store, {
    fields: [order.storeId],
    references: [store.id],
  }),
  items: many(orderItem),
}));

export const orderItemRelations = relations(orderItem, ({ one }) => ({
  order: one(order, {
    fields: [orderItem.orderId],
    references: [order.id],
  }),
  product: one(product, {
    fields: [orderItem.productId],
    references: [product.id],
  }),
  variant: one(productVariant, {
    fields: [orderItem.variantId],
    references: [productVariant.id],
  }),
  store: one(store, {
    fields: [orderItem.storeId],
    references: [store.id],
  }),
}));

// -------------------------------------------------------
// Store Analytics Table
// -------------------------------------------------------

export const storeVisit = pgTable(
  "store_visit",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    storeId: text("store_id")
      .notNull()
      .references(() => store.id, { onDelete: "cascade" }),
    storeSlug: text("store_slug").notNull(), // For easier querying
    userAgent: text("user_agent"),
    ipAddress: text("ip_address"),
    referrer: text("referrer"),
    country: text("country"),
    city: text("city"),
    device: text("device"), // mobile, desktop, tablet
    browser: text("browser"),
    os: text("os"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("store_visit_store_id_idx").on(table.storeId),
    index("store_visit_store_slug_idx").on(table.storeSlug),
    index("store_visit_created_at_idx").on(table.createdAt),
    index("store_visit_country_idx").on(table.country),
    index("store_visit_device_idx").on(table.device),
  ]
);

export const storeVisitRelations = relations(storeVisit, ({ one }) => ({
  store: one(store, {
    fields: [storeVisit.storeId],
    references: [store.id],
  }),
}));

// -------------------------------------------------------
// Feature Limit System Tables
// -------------------------------------------------------

export const planTypeEnum = pgEnum("plan_type", ["free", "pro", "elite"]);

export const featureKeyEnum = pgEnum("feature_key", [
  "stores_count",
  "products_count",
  "custom_domain",
  "email_service",
  "zynkart_branding",
  "api_mode",
  "templates_access",
]);

export const limitTypeEnum = pgEnum("limit_type", [
  "count", // Numeric limits (e.g., max 10 products)
  "monthly", // Monthly reset limits (e.g., 500 emails per month)
  "boolean", // True/false features (e.g., custom domain yes/no)
]);

export const resetPeriodEnum = pgEnum("reset_period", [
  "daily",
  "monthly",
  "never",
]);

// User plans table
export const userPlans = pgTable(
  "user_plans",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    planType: planTypeEnum("plan_type").notNull(),
    status: text("status").default("active").notNull(), // active, cancelled, expired
    startDate: timestamp("start_date").defaultNow().notNull(),
    endDate: timestamp("end_date"), // null for lifetime plans
    stripeSubscriptionId: text("stripe_subscription_id"),
    stripePriceId: text("stripe_price_id"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("user_plans_user_id_idx").on(table.userId),
    index("user_plans_status_idx").on(table.status),
    index("user_plans_plan_type_idx").on(table.planType),
  ]
);

// Feature limits configuration table
export const featureLimits = pgTable(
  "feature_limits",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    planType: planTypeEnum("plan_type").notNull(),
    featureKey: featureKeyEnum("feature_key").notNull(),
    limitType: limitTypeEnum("limit_type").notNull(),
    limitValue: integer("limit_value").notNull(), // -1 for unlimited, 0 for disabled, positive for limits
    resetPeriod: resetPeriodEnum("reset_period").default("never").notNull(),
    enabled: boolean("enabled").default(true).notNull(),
    description: text("description"), // Human readable description
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    // Ensure unique combination of plan type and feature key
    uniqueIndex("feature_limits_plan_feature_idx").on(
      table.planType,
      table.featureKey
    ),
    index("feature_limits_plan_type_idx").on(table.planType),
    index("feature_limits_feature_key_idx").on(table.featureKey),
    index("feature_limits_enabled_idx").on(table.enabled),
  ]
);

// Feature usage tracking table
export const featureUsage = pgTable(
  "feature_usage",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    featureKey: featureKeyEnum("feature_key").notNull(),
    usageCount: integer("usage_count").default(0).notNull(),
    lastUsed: timestamp("last_used").defaultNow().notNull(),
    resetDate: timestamp("reset_date").notNull(),
    metadata: jsonb("metadata"), // Store additional context if needed
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    // Ensure unique combination of user and feature
    uniqueIndex("feature_usage_user_feature_idx").on(
      table.userId,
      table.featureKey
    ),
    index("feature_usage_user_id_idx").on(table.userId),
    index("feature_usage_feature_key_idx").on(table.featureKey),
    index("feature_usage_reset_date_idx").on(table.resetDate),
  ]
);

// Feature override table (for temporary access or special cases)
export const featureOverrides = pgTable(
  "feature_overrides",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    featureKey: featureKeyEnum("feature_key").notNull(),
    overrideValue: integer("override_value").notNull(), // -1 for unlimited, 0 for disabled
    reason: text("reason").notNull(), // Admin reason for override
    expiresAt: timestamp("expires_at"), // null for permanent overrides
    createdBy: text("created_by")
      .notNull()
      .references(() => user.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    // Ensure unique combination of user and feature for active overrides
    uniqueIndex("feature_overrides_user_feature_idx").on(
      table.userId,
      table.featureKey
    ),
    index("feature_overrides_user_id_idx").on(table.userId),
    index("feature_overrides_expires_at_idx").on(table.expiresAt),
  ]
);

// Relations
export const userPlansRelations = relations(userPlans, ({ one }) => ({
  user: one(user, {
    fields: [userPlans.userId],
    references: [user.id],
  }),
}));

export const featureLimitsRelations = relations(featureLimits, ({}) => ({}));

export const featureUsageRelations = relations(featureUsage, ({ one }) => ({
  user: one(user, {
    fields: [featureUsage.userId],
    references: [user.id],
  }),
}));

export const featureOverridesRelations = relations(
  featureOverrides,
  ({ one }) => ({
    user: one(user, {
      fields: [featureOverrides.userId],
      references: [user.id],
    }),
    createdByUser: one(user, {
      fields: [featureOverrides.createdBy],
      references: [user.id],
    }),
  })
);

// Add user relation to include plans
export const userRelations = relations(user, ({ many }) => ({
  accounts: many(account),
  sessions: many(session),
  stores: many(store),
  plans: many(userPlans),
  featureUsage: many(featureUsage),
  featureOverrides: many(featureOverrides),
}));
