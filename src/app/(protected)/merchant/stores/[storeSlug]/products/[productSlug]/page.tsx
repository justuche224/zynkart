import db from "@/db";
import { product } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import ProductInfoPage from "./ProductInfoPage";
import { serverAuth } from "@/lib/server-auth";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ storeSlug: string; productSlug: string }>;
}) {
  const { storeSlug, productSlug } = await params;
  const user = await serverAuth();

  if (!user?.user) {
    return redirect("/auth/sign-in");
  }

  const productData = await db.query.product.findFirst({
    where: and(eq(product.slug, productSlug)),
    with: {
      store: {
        columns: {
          merchantId: true,
          slug: true,
        },
      },
      category: {
        columns: {
          id: true,
          name: true,
          slug: true,
        },
      },
      productSource: {
        columns: {
          id: true,
          name: true,
          slug: true,
        },
      },
      images: {
        orderBy: (images, { asc }) => [asc(images.position)],
      },
      tags: {
        with: {
          tag: true,
        },
      },
    },
  });

  if (!productData) {
    // TODO: design product not found page
    return (
      <div className="flex items-center justify-center h-screen">
        <h1 className="text-2xl font-bold">Product not found</h1>
      </div>
    );
  }

  if (
    productData.store.merchantId !== user.user.id ||
    productData.store.slug !== storeSlug
  ) {
    return redirect(`/merchant/stores/${storeSlug}/products`);
  }

  return <ProductInfoPage {...productData} />;
}
