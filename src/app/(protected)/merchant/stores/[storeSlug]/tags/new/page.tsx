import db from "@/db";
import { store } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { redirect } from "next/navigation";
import React from "react";
import NewTagForm from "./_components/NewTagForm";
import { serverAuth } from "@/lib/server-auth";

const page = async ({ params }: { params: Promise<{ storeSlug: string }> }) => {
  const { storeSlug } = await params;
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

  if (!storeData) return redirect("/merchant");

  return (
    <NewTagForm
      storeId={storeData[0].id}
      merchantId={merchant.user.id}
      storeSlug={storeSlug}
    />
  );
};

export default page;
