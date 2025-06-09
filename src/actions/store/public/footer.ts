"use server";

import db from "@/db";
import { eq } from "drizzle-orm";
import { store } from "@/db/schema";

export const getStoreFooter = async (storeSlug: string) => {
  try {
    const storeData = await db.query.store.findFirst({
      where: eq(store.slug, storeSlug),
      columns: {
        name: true,
        slug: true,
        phone: true,
        email: true,
        address: true,
      },
      with: {
        socials: {
          columns: {
            name: true,
            link: true,
          },
        },
      },
    });

    if (!storeData) {
      throw new Error("Store not found");
    }

    return storeData;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to fetch store footer");
  }
};
