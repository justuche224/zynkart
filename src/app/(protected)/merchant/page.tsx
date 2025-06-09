
import { serverAuth } from "@/lib/server-auth";
import { redirect } from "next/navigation";
import React from "react";
import db from "@/db";
import { store, product, customer } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import Merchant from "./merchant";

const page = async () => {
  const data = await serverAuth();
  if (!data?.session || !data?.user) {
    return redirect("/sign-in?callbackURL=/merchant");
  }
  const stores = await db
    .select({
      id: store.id,
      name: store.name,
      slug: store.slug,
      productCount: sql<number>`(
        SELECT COUNT(*)::int 
        FROM ${product} 
        WHERE ${product.storeId} = ${store.id}
      )`,
      customerCount: sql<number>`(
        SELECT COUNT(*)::int 
        FROM ${customer} 
        WHERE ${customer.storeId} = ${store.id}
      )`,
    })
    .from(store)
    .where(eq(store.merchantId, data.user.id));

  return (
    <div suppressHydrationWarning>
      <Merchant merchant={data.user} stores={stores} />
    </div>
  );
};

export default page;
