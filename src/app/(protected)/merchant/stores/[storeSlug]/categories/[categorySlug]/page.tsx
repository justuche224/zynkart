import db from "@/db";
import { category, store } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import CategoryInfo from "./_components/CategoryInfo";
import { Box, Plus } from "lucide-react";
import Link from "next/link";
import { serverAuth } from "@/lib/server-auth";

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ storeSlug: string; categorySlug: string }>;
}) {
  const { storeSlug, categorySlug } = await params;
  const merchant = await serverAuth();
  if (!merchant?.user) return redirect("/auth/sign-in");

  const storeData = await db.query.store.findFirst({
    where: and(eq(store.slug, storeSlug), eq(store.merchantId, merchant.user.id)),
  });

  if (!storeData) {
    return redirect("/merchant");
  }

  const categoryData = await db.query.category.findFirst({
    where: and(
      eq(category.slug, categorySlug),
      eq(category.storeId, storeData.id)
    ),
  });

  if (!categoryData) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 my-32">
        <Box className="w-12 h-12 text-muted-foreground" />
        <h3 className="text-xl font-semibold">Category not found</h3>
        <p className="text-muted-foreground text-center max-w-md">
          Create a category to start organizing your products
        </p>
        <Link
          href="categories/new"
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          Create Category <Plus size={16} />
        </Link>
      </div>
    );
  }

  return <CategoryInfo category={categoryData} storeSlug={storeSlug} />;
}
