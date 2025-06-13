import React from "react";
import TagPage from "@/components/store-front/tag-page";
import { getStoreForHomePage } from "@/lib/store-utils";
import db from "@/db";
import { and, eq } from "drizzle-orm";
import { tag } from "@/db/schema";

const page = async ({
  params,
}: {
  params: Promise<{ storeSlug: string; tagSlug: string }>;
}) => {
  const { storeSlug, tagSlug } = await params;

  const storeData = await getStoreForHomePage(storeSlug);

  if (!storeData) {
    return <div>Store not found</div>;
  }

  const tagData = await db.query.tag.findFirst({
    where: and(eq(tag.storeId, storeData.id), eq(tag.slug, tagSlug)),
    columns: {
      id: true,
      name: true,
      slug: true,
    },
  });

  if (!tagData) {
    return <div>Tag not found</div>;
  }

  return <TagPage store={storeData} tag={tagData} />;
};

export default page;
