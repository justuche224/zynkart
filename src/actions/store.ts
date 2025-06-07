"use server";
import db from "@/db";
import { store } from "@/db/schema";
import { serverAuth } from "@/lib/server-auth";
import { slugify } from "@/lib/utils";
import { StoreSchema } from "@/schemas";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

export const createStore = async (
  merchantId: string,
  values: z.infer<typeof StoreSchema>
) => {
  if (!values) return { error: "Store info is Required" };
  if (!merchantId) return { error: "Unauthorised" };
  const user = await serverAuth();

  if (!user?.session || !user.user)
    return { error: "Authentication required!" };
  if (user.user.id !== merchantId) return { error: "Unauthorized access." };

  const validationResult = StoreSchema.safeParse(values);
  if (!validationResult.success) {
    return {
      error: validationResult.error.errors[0].message,
    };
  }
  const { name, email, phone, address } = validationResult.data;

  //   TODO subscription check

  const storeSlug = slugify(name);
  const existingStore = await db
    .select({
      id: store.id,
    })
    .from(store)
    .where(eq(store.slug, storeSlug))
    .limit(1);
  if (existingStore.length) {
    return { error: `The store name "${name}" is already in use.` };
  }

  try {
    const newStore = await db
      .insert(store)
      .values({
        name: name,
        slug: storeSlug,
        merchantId: user.user.id,
        template: "default",
        phone,
        email,
        address,
      })
      .returning();

    return { data: newStore[0] };
  } catch (error) {
    console.error("Failed to create store:", error);
    return { error: "Failed to create store." };
  }
};

export const getStoreByMerchant = async (storeSlug?: string, id?: string) => {
  if (!storeSlug && !id) return { error: "Store ID or Slug is required" };

  try {
    const user = await serverAuth();
    if (!user?.session || !user.user) return { error: "Unauthorised!" };

    if (storeSlug) {
      const existingStore = await db
        .select()
        .from(store)
        .where(
          and(eq(store.slug, storeSlug), eq(store.merchantId, user.user.id))
        )
        .limit(1);
      if (!existingStore) return { error: "Store not found!" };
      return { data: existingStore[0] };
    }

    if (id) {
      const existingStore = await db
        .select()
        .from(store)
        .where(and(eq(store.id, id), eq(store.merchantId, user.user.id)))
        .limit(1);

      if (!existingStore) return { error: "Store not found!" };
      return { data: existingStore[0] };
    }
    return { error: "Please Specify store slug or ID" };
  } catch (error) {
    return { error: "Failed to get store!" };
  }
};

export const updateStore = async (
  storeId: string,
  values: {
    description?: string;
    phone: string;
    email: string;
    address: string;
  }
) => {
  try {
    const session = await serverAuth();
    if (!values.phone) return { error: "Phone is required!" };
    if (!values.email) return { error: "Email is required!" };
    if (!values.address) return { error: "Address is required!" };

    if (!session?.session || !session.user) return { error: "Unauthorised!" };
    const storeInfo = await db
      .select()
      .from(store)
      .where(and(eq(store.id, storeId), eq(store.merchantId, session.user.id)));

    if (!storeInfo) return { error: "Store not found!" };

    const updatedStore = await db
      .update(store)
      .set({
        description: values.description,
        phone: values.phone,
        email: values.email,
        address: values.address,
      })
      .where(and(eq(store.id, storeId), eq(store.merchantId, session.user.id)));

    return { data: updatedStore[0] };
  } catch (error) {
    return { error: "Failed to update store!" };
  }
};
