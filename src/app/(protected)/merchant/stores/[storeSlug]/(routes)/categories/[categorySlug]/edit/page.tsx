import db from "@/db";
import { category, store } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { redirect } from "next/navigation";
import React from "react";
import EditCategoryForm from "./_components/EditCategoryForm";
import { serverAuth } from "@/lib/server-auth";

const page = async ({
  params,
}: {
  params: Promise<{ storeSlug: string; categorySlug: string }>;
}) => {
  const { storeSlug, categorySlug } = await params;
  const merchant = await serverAuth();
  if (!merchant?.user) return redirect(`/auth/sign-in?callbackURL=/merchant/stores/${storeSlug}/categories/${categorySlug}/edit`);

  const storeData = await db
    .select({
      id: store.id,
      name: store.name,
    })
    .from(store)
    .where(and(eq(store.slug, storeSlug), eq(store.merchantId, merchant.user.id)))
    .limit(1);

  if (!storeData) return redirect("/merchant");

  const categoryData = await db.query.category.findFirst({
    where: and(
      eq(category.storeId, storeData[0].id),
      eq(category.slug, categorySlug)
    ),
  });

  if (!categoryData) return redirect(`/merchant/stores/${storeSlug}/categories`);

  return (
    <EditCategoryForm
      storeId={storeData[0].id}
      merchantId={merchant.user.id}
      storeSlug={storeSlug}
      category={categoryData}
    />
  );
};

export default page;
