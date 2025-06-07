import db from "@/db";
import { store } from "@/db/schema";
import { serverAuth } from "@/lib/server-auth";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import React from "react";
import Customise from "./customise";

const page = async ({ params }: { params: Promise<{ storeSlug: string }> }) => {
  const { storeSlug } = await params;
  const session = await serverAuth();
  if (!session?.user) {
    redirect(`/sign-in?callbackUrl=/merchant/stores/${storeSlug}/customise`);
  }

  const storeInfo = await db.query.store.findFirst({
    where: eq(store.slug, storeSlug),
  });

  if (!storeInfo) {
    redirect(`/merchant/`);
  }

  return (
    <Customise />
  );
};

export default page;
