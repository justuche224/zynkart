import db from "@/db";
import { store } from "@/db/schema";
import { serverAuth } from "@/lib/server-auth";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import React from "react";
import { Customers } from "./customers";

const page = async ({ params }: { params: Promise<{ storeSlug: string }> }) => {
  const { storeSlug } = await params;
  const session = await serverAuth();
  if (!session?.user) {
    redirect(`/sign-in?callbackUrl=/merchant/stores/${storeSlug}/customers`);
  }

  const storeInfo = await db.query.store.findFirst({
    where: eq(store.slug, storeSlug),
  });

  if (!storeInfo) {
    redirect(`/merchant/`);
  }

  return (
    <div className="max-w-7xl mx-auto mt-10 px-4">
      <Customers storeId={storeInfo.id} />
    </div>
  );
};

export default page;
