import db from "@/db";
import { store, category, color, size, productSource } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { redirect } from "next/navigation";
import React from "react";
import NewProductForm from "./components/NewProductForm";
import { serverAuth } from "@/lib/server-auth";

const page = async ({ params }: { params: Promise<{ storeSlug: string }> }) => {
  const { storeSlug } = await params;
  const session = await serverAuth();
  const merchant = session?.user;
  if (!merchant?.id) return redirect("/auth/sign-in");

  const storeData = await db
    .select({
      id: store.id,
      name: store.name,
    })
    .from(store)
    .where(and(eq(store.slug, storeSlug), eq(store.merchantId, merchant.id)))
    .limit(1);

  if (!storeData)
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold">Store not found</h1>
        <p className="text-muted-foreground">
          The store you are looking for does not exist or you do not have access
          to it.
        </p>
      </div>
    );

  const [categories, colors, sizes, vendors] = await Promise.all([
    db.query.category.findMany({
      where: eq(category.storeId, storeData[0].id),
    }),
    db.query.color.findMany({
      where: eq(color.storeId, storeData[0].id),
    }),
    db.query.size.findMany({
      where: eq(size.storeId, storeData[0].id),
    }),
    db.query.productSource.findMany({
      where: eq(productSource.storeId, storeData[0].id),
    }),
  ]);

  const info = {
    storeData: storeData[0],
    categories: categories,
    colors: colors,
    sizes: sizes,
    vendors: vendors,
  };

  return (
    <NewProductForm {...info} storeSlug={storeSlug} merchantId={merchant.id} />
  );
};

export default page;
