import db from "@/db";
import { and, eq, sql } from "drizzle-orm";
import { redirect } from "next/navigation";
import { category, product, store } from "@/db/schema";
import { serverAuth } from "@/lib/server-auth";
import Categories from "./_components/Categories";

const page = async ({ params }: { params: Promise<{ storeSlug: string }> }) => {
  const { storeSlug } = await params;
  const user = await serverAuth();
  if (!user?.session || !user?.user) {
    return redirect(`/sign-in?callbackURL=/merchant/stores/${storeSlug}/categories`);
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

  const categoriesWithCount = await db
    .select({
      id: category.id,
      name: category.name,
      slug: category.slug,
      productCount: sql<number>`COUNT(${product.id})`.as("productCount"),
      imageUrl: category.imageUrl,
    })
    .from(category)
    .leftJoin(product, eq(category.id, product.categoryId))
    .where(eq(category.storeId, storeData.id))
    .groupBy(category.id, category.name, category.slug, category.imageUrl);
  return <Categories categories={categoriesWithCount} storeSlug={storeSlug} merchantId={user.user.id} />;
};

export default page;
