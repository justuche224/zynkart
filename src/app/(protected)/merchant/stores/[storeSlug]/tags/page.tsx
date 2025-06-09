import db from "@/db";
import { and, eq, sql } from "drizzle-orm";
import { redirect } from "next/navigation";
import { tag, productTag, store } from "@/db/schema";
import { serverAuth } from "@/lib/server-auth";
import Tags from "./_components/Tags";

const page = async ({ params }: { params: Promise<{ storeSlug: string }> }) => {
  const { storeSlug } = await params;
  const user = await serverAuth();
  if (!user?.session || !user?.user) {
    return redirect(`/sign-in?callbackURL=/merchant/stores/${storeSlug}/tags`);
  }

  const storeData = await db.query.store.findFirst({
    where: and(eq(store.slug, storeSlug), eq(store.merchantId, user.user.id)),
    columns: {
      id: true,
      name: true,
      slug: true,
    },
  });

  if (!storeData) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold">Store not found</h1>
        <p className="text-muted-foreground">
          The store you are looking for does not exist or you do not have access
          to it.
        </p>
      </div>
    );
  }

  const tagsWithCount = await db
    .select({
      id: tag.id,
      name: tag.name,
      slug: tag.slug,
      productCount: sql<number>`COUNT(${productTag.productId})`.as(
        "productCount"
      ),
      createdAt: tag.createdAt,
      updatedAt: tag.updatedAt,
    })
    .from(tag)
    .leftJoin(productTag, eq(tag.id, productTag.tagId))
    .where(eq(tag.storeId, storeData.id))
    .groupBy(tag.id, tag.name, tag.slug, tag.createdAt, tag.updatedAt);

  return (
    <Tags
      tags={tagsWithCount}
      storeSlug={storeSlug}
      merchantId={user.user.id}
    />
  );
};

export default page;
