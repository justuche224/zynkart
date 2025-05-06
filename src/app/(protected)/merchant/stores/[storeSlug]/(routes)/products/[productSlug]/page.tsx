import { currentUser } from "@/lib/current-user";
import { db } from "@/server/database";
import { product } from "@/server/database/schema";
import { and, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import ProductInfoPage from "./ProductInfoPage";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ storeSlug: string; productSlug: string }>;
}) {
  const { storeSlug, productSlug } = await params;
  const merchant = await currentUser();

  if (!merchant?.id) {
    return redirect("/auth/sign-in");
  }

  const productData = await db.query.product.findFirst({
    where: and(eq(product.slug, productSlug)),
    with: {
      storeProfile: {
        columns: {
          id: true,
        },
        with: {
          store: {
            columns: {
              merchantId: true,
              slug: true,
            },
          },
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
    },
  });

  if (
    !productData ||
    productData.storeProfile.store.merchantId !== merchant.id ||
    productData.storeProfile.store.slug !== storeSlug
  ) {
    return redirect(`/merchant/${storeSlug}/products`);
  }

  return <ProductInfoPage {...productData} />;
}
