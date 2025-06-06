import db from "@/db";
import { store } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { redirect } from "next/navigation";
import React from "react";
import NewShippingAndDeliveryForm from "./NewShippingAndDeliveryForm";
import { serverAuth } from "@/lib/server-auth";

const page = async ({ params }: { params: Promise<{ storeSlug: string }> }) => {
  const { storeSlug } = await params;
  const merchant = await serverAuth();
  if (!merchant?.user?.id) return redirect(`/sign-in?callbackUrl=/merchant/stores/${storeSlug}/settings/shipping-and-delivery/new`);

  const storeData = await db.query.store.findFirst({
    where: and(eq(store.slug, storeSlug), eq(store.merchantId, merchant.user.id)),
    columns: {
      id: true,
    },
  });
  if (!storeData) return redirect("/merchant");

  return (
    <NewShippingAndDeliveryForm
      merchantId={merchant.user.id}
      storeSlug={storeSlug}
    />
  );
};

export default page;
