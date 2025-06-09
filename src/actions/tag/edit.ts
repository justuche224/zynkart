"use server";
import { UpdateTagSchema } from "@/schemas";
import { tag, user, store } from "@/db/schema";
import { slugify } from "@/lib/utils";
import { and, eq, ne } from "drizzle-orm";
import type z from "zod";
import { serverAuth } from "@/lib/server-auth";
import db from "@/db";

export const updateTag = async (values: z.infer<typeof UpdateTagSchema>) => {
  try {
    // Validate input schema
    const validationResult = UpdateTagSchema.safeParse(values);
    if (!validationResult.success) {
      return {
        success: false,
        error: { message: validationResult.error.errors[0].message },
        data: null,
      };
    }

    // Validate user authentication
    const session = await serverAuth();
    if (!session?.user?.id) {
      return {
        success: false,
        error: { message: "Authentication required!" },
        data: null,
      };
    }
    if (session?.user.id !== values.merchantId) {
      return {
        success: false,
        error: { message: "Unauthorized access." },
        data: null,
      };
    }

    // Check if merchant exists
    const merchantRecord = await db
      .select()
      .from(user)
      .where(eq(user.id, values.merchantId))
      .limit(1);

    if (!merchantRecord.length) {
      return {
        success: false,
        error: { message: "Merchant not found!" },
        data: null,
      };
    }

    // Check if store exists and belongs to merchant
    const storeRecord = await db
      .select()
      .from(store)
      .where(
        and(
          eq(store.id, values.storeId),
          eq(store.merchantId, values.merchantId)
        )
      )
      .limit(1);

    if (!storeRecord.length) {
      return {
        success: false,
        error: { message: "Store not found!" },
        data: null,
      };
    }

    // Check if tag exists in this store
    const existingTag = await db
      .select()
      .from(tag)
      .where(and(eq(tag.id, values.id), eq(tag.storeId, values.storeId)))
      .limit(1);

    if (!existingTag.length) {
      return {
        success: false,
        error: { message: "Tag not found!" },
        data: null,
      };
    }

    // Generate unique slug
    const tagSlug = slugify(values.name);

    // Check if another tag with the same name/slug already exists in this store
    const duplicateTag = await db
      .select()
      .from(tag)
      .where(
        and(
          eq(tag.slug, tagSlug),
          eq(tag.storeId, values.storeId),
          ne(tag.id, values.id) // Exclude current tag
        )
      )
      .limit(1);

    if (duplicateTag.length) {
      return {
        success: false,
        error: {
          message: `The tag "${values.name}" already exists in this store.`,
        },
        data: null,
      };
    }

    // Update the tag
    const updatedTags = await db
      .update(tag)
      .set({
        name: values.name,
        slug: tagSlug,
        updatedAt: new Date(),
      })
      .where(eq(tag.id, values.id))
      .returning();

    if (!updatedTags.length) {
      throw new Error("Failed to update tag.");
    }

    return {
      success: true,
      error: null,
      data: updatedTags[0],
    };
  } catch (error) {
    console.error("Tag update error:", error);
    return {
      success: false,
      error: {
        message:
          error instanceof Error ? error.message : "Failed to update tag",
      },
      data: null,
    };
  }
};
