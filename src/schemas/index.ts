import { z } from "zod";

export const StoreSchema = z.object({
  name: z
    .string()
    .min(3, {
      message:
        "Store Name should be more than 3 characters but less than 50 characters",
    })
    .max(50, {
      message:
        "Store Name should be more than 3 characters but less than 50 characters",
    })
    .regex(/^[a-zA-Z0-9\s-]+$/, {
      message:
        "Store Name can only contain letters, numbers, spaces, and hyphens.",
    }),
  phone: z
    .string()
    .regex(/^\+?[1-9]\d{1,14}$/, "Please enter a valid phone number"),
  email: z.string().email({ message: "Please enter store contact email" }),
  address: z
    .string({ message: "Please enter store address" })
    .regex(/^[a-zA-Z0-9\s-.,]+$/, {
      message:
        "Address can only contain letters, numbers, spaces, hyphens, commas, and periods.",
    }),
});

export const NewProductSchema = z
  .object({
    name: z
      .string()
      .min(1, "Product name is required")
      .max(150, "Product name can not be longer than 150 characters")
      .regex(/^[a-zA-Z0-9\s-.,]+$/, {
        message:
          "Product Name can only contain letters, numbers, spaces, hyphens, commas, and periods.",
      }),
    description: z
      .string()
      .min(1, "Description is required")
      .max(1000, "Description can not be longer than 1000 characters")
      .regex(/^[a-zA-Z0-9\s-.,!?"]+$/, {
        message:
          "Description can only contain letters, numbers, spaces, hyphens, commas, periods, exclamation marks, question marks, and quotation marks.",
      }),
    status: z.enum(["ACTIVE", "INACTIVE"]).default("ACTIVE"),
    categoryId: z.string().optional(),
    newCategoryName: z.string().optional(),
    price: z
      .number()
      .int("Price must be an integer")
      .positive("Price must be a positive integer"),
    slashedFrom: z.number().int().positive().optional(),
    trackQuantity: z.boolean().default(false),
    inStock: z
      .number()
      .int()
      .nonnegative("Stock must be a non-negative integer")
      .optional(),
    productSourceId: z.string().optional(),
    newVendorName: z.string().optional(),
    storeId: z.string().min(1, "Store profile is required").optional(),
    tagIds: z.array(z.string()).optional(),
    newTags: z.array(z.string()).optional(),
    images: z
      .array(
        z.object({
          url: z.string().url("Image URL must be valid"),
          alt: z.string().optional(),
          position: z.number().int().nonnegative().default(0),
          isDefault: z.boolean().default(false),
        })
      )
      .optional(),
    variants: z
      .array(
        z.object({
          colorId: z.string().optional(),
          sizeId: z.string().optional(),
          sku: z.string().optional(),
          price: z
            .number()
            .int()
            .positive("Variant price must be a positive integer")
            .optional(),
          inStock: z
            .number()
            .int()
            .nonnegative("Variant stock must be a non-negative integer")
            .optional(),
        })
      )
      .optional(),
  })
  .refine(
    (data) => {
      return !!(data.categoryId || data.newCategoryName);
    },
    {
      message: "Either select an existing category or create a new one",
      path: ["categoryId"],
    }
  )
  .refine(
    (data) => {
      return !!(data.productSourceId || data.newVendorName);
    },
    {
      message: "Either select an existing vendor or create a new one",
      path: ["productSourceId"],
    }
  )
  .refine(
    (data) => {
      if (data.slashedFrom !== undefined && data.slashedFrom !== null) {
        return data.slashedFrom > 0;
      }
      return true;
    },
    {
      message: "Slashed from price must be a positive integer",
      path: ["slashedFrom"],
    }
  );

export const CreateCategorySchema = z.object({
  name: z
    .string()
    .min(3, {
      message:
        "Category Name should be more than 3 characters but less than 50 characters",
    })
    .max(50, {
      message:
        "Category Name should be more than 3 characters but less than 50 characters",
    })
    .regex(/^[a-zA-Z0-9\s-]+$/, {
      message:
        "Category Name can only contain letters, numbers, spaces, and hyphens.",
    }),
  storeId: z.string(),
  merchantId: z.string(),
  imageUrl: z.string().optional(),
});

export const CreateTagSchema = z.object({
  name: z
    .string()
    .min(2, {
      message:
        "Tag Name should be more than 2 characters but less than 30 characters",
    })
    .max(30, {
      message:
        "Tag Name should be more than 2 characters but less than 30 characters",
    })
    .regex(/^[a-zA-Z0-9\s-]+$/, {
      message:
        "Tag Name can only contain letters, numbers, spaces, and hyphens.",
    }),
  storeId: z.string(),
  merchantId: z.string(),
});

export const UpdateTagSchema = CreateTagSchema.extend({
  id: z.string(),
});

export const UpdateCategorySchema = CreateCategorySchema.extend({
  id: z.string().min(1, "Category ID is required"),
});

export const BankSchema = z.object({
  bankCode: z.string().min(1, "Bank code is required"),
  bankName: z.string().min(1, "Bank name is required"),
  accountName: z.string().min(1, "Account name is required"),
  accountNumber: z.string().min(10, "Account number is required"),
  country: z.string().min(1, "Country is required"),
  currency: z.string().min(1, "Currency is required"),
  businessName: z.string().min(1, "Business name is required"),
  storeId: z.string().min(1, "Store ID is required"),
  storeSlug: z.string().min(1, "Store slug is required"),
});

export const ShipingZoneSchema = z.object({
  country: z.string().min(1, "Country is required"),
  state: z.string().optional(),
  area: z.string().optional(),
  shippingCost: z.number().optional(),
  isActive: z.boolean().default(true),
  minOrderAmount: z.number().optional(),
  maxOrderAmount: z.number().optional(),
  estimatedDays: z.number().optional(),
});

export const NewBannerSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  linkUrl: z
    .string()
    // .url({ message: "Please enter a valid URL." })
    .optional()
    .or(z.literal("")),
  isActive: z.boolean().default(true),
  storeId: z.string(),
  imageUrl: z.string().optional(),
});

export const shippingInfoSchema = z.object({
  country: z.string().min(1, "Country is required"),
  state: z.string().optional(),
  area: z.string().optional(),
  address: z.string().min(1, "Address is required"),
  phoneNumber: z.string().min(1, "Phone number is required"),
  secondaryPhoneNumber: z.string().optional(),
  additionalInfo: z.string().optional(),
});

export const itemSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  name: z.string().min(1, "Product name is required"),
  quantity: z.number().int().positive("Quantity must be a positive integer"),
  price: z.number().positive("Price must be positive"),
  variantId: z.string().optional(),
});

export const orderInfoSchema = z
  .object({
    customerId: z.string().min(1, "Customer ID is required"),
    storeSlug: z.string().min(1, "Store slug is required"),
    storeId: z.string().min(1, "Store ID is required"),
    subtotal: z.number().positive("Subtotal must be positive"),
    shippingCost: z.number().nonnegative("Shipping cost must be non-negative"),
    totalAmount: z.number().positive("Total amount must be positive"),
    shippingInfo: shippingInfoSchema,
    items: z.array(itemSchema).min(1, "At least one item is required"),
  })
  .refine((data) => data.totalAmount === data.subtotal + data.shippingCost, {
    message: "Total amount must equal subtotal plus shipping cost",
    path: ["totalAmount"],
  });

export const savedAddressSchema = z.object({
  label: z
    .string()
    .min(1, "Address label is required")
    .max(50, "Label must be less than 50 characters"),
  address: z.string().min(1, "Address is required"),
  primaryPhone: z.string().min(1, "Primary phone number is required"),
  secondaryPhone: z.string().optional(),
  additionalInfo: z.string().optional(),
  isDefault: z.boolean(),
});

export const updateSavedAddressSchema = savedAddressSchema.extend({
  id: z.string().min(1, "Address ID is required"),
});
