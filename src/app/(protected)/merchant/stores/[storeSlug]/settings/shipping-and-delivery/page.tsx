import db from "@/db";
import { shippingZone, store } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import React from "react";
import ShippingZones from "./ShippingZones";
import { serverAuth } from "@/lib/server-auth";

const page = async ({ params }: { params: Promise<{ storeSlug: string }> }) => {
  const { storeSlug } = await params;
  const merchant = await serverAuth();
  if (!merchant?.user?.id) return redirect(`/sign-in?callbackUrl=/merchant/stores/${storeSlug}/settings/shipping-and-delivery`);

  const storeData = await db.query.store.findFirst({
    where: and(eq(store.slug, storeSlug), eq(store.merchantId, merchant.user.id)),
  });

  if (!storeData) return redirect("/merchant");

  const shipingZones = await db.query.shippingZone.findMany({
    where: eq(shippingZone.storeId, storeData.id),
  });

  return <ShippingZones shipingZones={shipingZones} storeSlug={storeSlug} merchantId={merchant.user.id} />;
};

export default page;
