"use server";

import db from "@/db";
import { storeSocial } from "@/db/schema";
import { eq } from "drizzle-orm";

export const getStoreSocials = async (storeId: string) => {
  try {
    const storeSocials = await db
      .select()
      .from(storeSocial)
      .where(eq(storeSocial.storeId, storeId));
    return { data: storeSocials };
  } catch (error) {
    throw new Error("Failed to get store socials!");
  }
};
