import {
  category,
  product,
  productImage,
  shippingZone,
  banner,
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

export type Product = InferSelectModel<typeof product> & {
  images: InferSelectModel<typeof productImage>[];
};

export type ShippingZone = InferSelectModel<typeof shippingZone>;
export type Banner = InferSelectModel<typeof banner>;