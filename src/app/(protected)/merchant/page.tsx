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
      productCount: sql<number>`count(distinct ${product.id})`.mapWith(Number),
      customerCount: sql<number>`count(distinct ${customer.id})`.mapWith(
        Number
      ),
    })
    .from(store)
    .leftJoin(product, eq(product.storeId, store.id))
    .leftJoin(customer, eq(customer.storeId, store.id))
    .where(eq(store.merchantId, data.user.id))
    .groupBy(store.id, store.name, store.slug);

  console.log(stores);

  return (
    <div suppressHydrationWarning>
      <Merchant merchant={data.user} stores={stores} />
    </div>
  );
};

export default page;
