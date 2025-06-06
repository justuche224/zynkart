import {
  category,
  product,
  productImage,
  shippingZone,
  // shippingZone,
  // storeProfile,
} from "@/db/schema";
import { InferSelectModel } from "drizzle-orm";
// import type z from "zod";

// export type ShippingZone = InferSelectModel<typeof shippingZone>;

// export type StoreProfile = InferSelectModel<typeof storeProfile>;

export type Category = InferSelectModel<typeof category>;

export type ProductWithImages = InferSelectModel<typeof product> & {
  images: InferSelectModel<typeof productImage>[];
};

export type Store = {
  id: number;
  name: string;
  slug: string;
  template: string;
};

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  slashedFrom: number | null;
  inStock: number;
  trackQuantity: boolean;
  // categoryId: string;
  createdAt: string;
  updatedAt: string;
  images: {
    id: string;
    url: string;
    alt: string;
    position: number;
    isDefault: boolean;
  }[];
}

export type ShippingZone = InferSelectModel<typeof shippingZone>;