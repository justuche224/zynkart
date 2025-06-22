import db from "@/db";
import { store } from "@/db/schema";
import { serverAuth } from "@/lib/server-auth";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import React from "react";
import GlobalSearch from "./global-search";

const page = async ({
  params,
  searchParams,
}: {
  params: Promise<{ storeSlug: string }>;
  searchParams: Promise<{ q: string }>;
}) => {
  const { storeSlug } = await params;
  const { q } = await searchParams;
  const session = await serverAuth();
  if (!session?.user) {
    redirect(
      `/sign-in?callbackUrl=/merchant/stores/${storeSlug}/search?q=${q}`
    );
  }

  const storeInfo = await db.query.store.findFirst({
    where: eq(store.slug, storeSlug),
    columns: {
      id: true,
      name: true,
      slug: true,
    },
  });

  if (!storeInfo) {
    redirect(`/merchant/`);
  }

  return <GlobalSearch storeInfo={storeInfo} searchQuery={q} />;
};

export default page;
