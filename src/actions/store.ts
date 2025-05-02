"use server";
import db from "@/db";
import { store } from "@/db/schema";
import { serverAuth } from "@/lib/server-auth";
import { slugify } from "@/lib/utils";
import { StoreSchema } from "@/schemas";
import { eq } from "drizzle-orm";

export const createStore = async (merchantId: string, name: string) => {
  if (!name) return { error: "Store Name is Required" };
  if (!merchantId) return { error: "Unauthorised" };

  const validationResult = StoreSchema.safeParse({ name });
  if (!validationResult.success) {
    return {
      error: validationResult.error.errors[0].message,
    };
  }

  const user = await serverAuth();

  if (!user?.session || !user.user)
    return { error: "Authentication required!" };
  if (user.user.id !== merchantId) return { error: "Unauthorized access." };

  //   TODO subscription check

  const storeSlug = slugify(name);
  const existingSlug = await db
    .select({
      id: store.id,
    })
    .from(store)
    .where(eq(store.slug, storeSlug))
    .limit(1);
  if (existingSlug.length) {
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
      })
      .returning();

    return { data: newStore[0] };
  } catch (error) {
    console.error("Failed to create store:", error);
    return { error: "Failed to create store." };
  }
};
