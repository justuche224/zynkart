import db from "@/db";
import {
  store,
  category,
  color,
  size,
  productSource,
  product,
  tag,
} from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { redirect } from "next/navigation";
import React from "react";
import EditProductForm from "./components/EditProductForm";
import { serverAuth } from "@/lib/server-auth";

const page = async ({
  params,
}: {
  params: Promise<{ storeSlug: string; productSlug: string }>;
}) => {
  const { storeSlug, productSlug } = await params;
  const merchant = await serverAuth();
  if (!merchant?.user) return redirect("/auth/sign-in");

  const storeData = await db
    .select({
      id: store.id,
      name: store.name,
    })
    .from(store)
    .where(
      and(eq(store.slug, storeSlug), eq(store.merchantId, merchant.user.id))
    )
    .limit(1);

  if (!storeData) return <div>Store not found</div>;

  const existingProduct = await db.query.product.findFirst({
    where: and(
      eq(product.storeId, storeData[0].id),
      eq(product.slug, productSlug)
    ),
    with: {
      images: {
        orderBy: (images, { asc }) => [asc(images.position)],
      },
      tags: {
        with: {
          tag: true,
        },
      },
    },
  });

  if (!existingProduct) return redirect(`/merchant/${storeSlug}/products`);

  const [categories, colors, sizes, vendors, tags] = await Promise.all([
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
    db.query.tag.findMany({
      where: eq(tag.storeId, storeData[0].id),
    }),
  ]);

  const info = {
    storeData: storeData[0],
    storeId: storeData[0].id,
    categories: categories,
    colors: colors,
    sizes: sizes,
    vendors: vendors,
    tags: tags,
    product: existingProduct,
  };

  return (
    <EditProductForm
      {...info}
      storeSlug={storeSlug}
      merchantId={merchant.user.id}
    />
  );
};

export default page;
