import db from "@/db";
import { tag, store } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { redirect } from "next/navigation";
import React from "react";
import EditTagForm from "./_components/EditTagForm";
import { serverAuth } from "@/lib/server-auth";

const page = async ({
  params,
}: {
  params: Promise<{ storeSlug: string; tagSlug: string }>;
}) => {
  const { storeSlug, tagSlug } = await params;
  const merchant = await serverAuth();
  if (!merchant?.user)
    return redirect(
      `/auth/sign-in?callbackURL=/merchant/stores/${storeSlug}/tags/${tagSlug}/edit`
    );

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

  if (!storeData) return redirect("/merchant");

  const tagData = await db.query.tag.findFirst({
    where: and(eq(tag.storeId, storeData[0].id), eq(tag.slug, tagSlug)),
  });

  if (!tagData) return redirect(`/merchant/stores/${storeSlug}/tags`);

  return (
    <EditTagForm
      storeId={storeData[0].id}
      merchantId={merchant.user.id}
      storeSlug={storeSlug}
      tag={tagData}
    />
  );
};

export default page;
