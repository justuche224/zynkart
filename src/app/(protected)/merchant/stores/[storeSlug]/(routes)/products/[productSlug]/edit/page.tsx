import { currentUser } from "@/lib/current-user";
import { db } from "@/server/database";
import {
  store,
  storeProfile,
  category,
  color,
  size,
  productSource,
  product,
} from "@/server/database/schema";
import { eq, and } from "drizzle-orm";
import { redirect } from "next/navigation";
import React from "react";
import EditProductForm from "./components/EditProductForm";

const page = async ({
  params,
}: {
  params: Promise<{ storeSlug: string; productSlug: string }>;
}) => {
  const { storeSlug, productSlug } = await params;
  const merchant = await currentUser();
  if (!merchant?.id) return redirect("/auth/sign-in");

  const storeData = await db
    .select({
      id: store.id,
      name: store.name,
      storeProfileId: storeProfile.id,
    })
    .from(store)
    .leftJoin(storeProfile, eq(storeProfile.storeId, store.id))
    .where(and(eq(store.slug, storeSlug), eq(store.merchantId, merchant.id)))
    .limit(1);

  if (!storeData || !storeData[0].storeProfileId) return redirect("/merchant");

  const existingProduct = await db.query.product.findFirst({
    where: and(
      eq(product.storeProfileId, storeData[0].storeProfileId),
      eq(product.slug, productSlug)
    ),
    with: {
      images: {
        orderBy: (images, { asc }) => [asc(images.position)],
      },
    },
  });

  if (!existingProduct) return redirect(`/merchant/${storeSlug}/products`);

  const [categories, colors, sizes, vendors] = await Promise.all([
    db.query.category.findMany({
      where: eq(category.storeProfileId, storeData[0].storeProfileId),
    }),
    db.query.color.findMany({
      where: eq(color.storeProfileId, storeData[0].storeProfileId),
    }),
    db.query.size.findMany({
      where: eq(size.storeProfileId, storeData[0].storeProfileId),
    }),
    db.query.productSource.findMany({
      where: eq(productSource.storeProfileId, storeData[0].storeProfileId),
    }),
  ]);

  const info = {
    storeData: storeData[0],
    storeProfileId: storeData[0].storeProfileId,
    categories: categories,
    colors: colors,
    sizes: sizes,
    vendors: vendors,
    product: existingProduct,
  };

  return (
    <EditProductForm {...info} storeSlug={storeSlug} merchantId={merchant.id} />
  );
};

export default page;
