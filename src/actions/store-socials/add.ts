"use server";
import db from "@/db";
import { storeSocial } from "@/db/schema";
import { serverAuth } from "@/lib/server-auth";

export const addStoreSocial = async (storeId: string, name: string, link: string) => {
   try {
    const session = await serverAuth();
    if (!session?.session || !session?.user) {
       throw new Error("Unauthorized");
    }
    const social =await db.insert(storeSocial).values({
        storeId,
        name: name,
        link: link,
    }).returning();
    return social[0];
   } catch (error) {
    console.error(error);
   throw new Error("Failed to add social");
   }
}