import { and, eq } from "drizzle-orm";
import { redirect } from "next/navigation";

import ProductsPage from "./ProductsPage";
import { store } from "@/db/schema";
import db from "@/db";
import { serverAuth } from "@/lib/server-auth";

export default async function page({
  params,
}: {
  params: Promise<{ storeSlug: string }>;
}) {
  const { storeSlug } = await params;
  const user = await serverAuth();
  if (!user?.session || !user?.user) {
    return redirect("/sign-in?callbackURL=/merchant");
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

  return (
    <ProductsPage
      storeData={{
        id: storeData.id,
        name: storeData.name,
        slug: storeData.slug,
      }}
    />
  );
}
