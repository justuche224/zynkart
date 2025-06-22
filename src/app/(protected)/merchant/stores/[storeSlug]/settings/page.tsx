import db from "@/db";
import { store } from "@/db/schema";
import { serverAuth } from "@/lib/server-auth";
import { and, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import React from "react";
import StoreInfo from "./_components/store-info";
import StoreSocials from "./_components/store-socials";

const page = async ({ params }: { params: Promise<{ storeSlug: string }> }) => {
  const user = await serverAuth();
  if (!user?.session || !user?.user) {
    return redirect("/sign-in?callbackURL=/merchant");
  }
  const { storeSlug } = await params;

  const storeInfo = await db
    .select({
      id: store.id,
      name: store.name,
      description: store.description,
      phone: store.phone,
      email: store.email,
      address: store.address,
      slug: store.slug,
    })
    .from(store)
    .where(and(eq(store.slug, storeSlug), eq(store.merchantId, user.user.id)));

  if (!storeInfo) {
    return redirect("/merchant");
  }
  return (
    <section className="container mx-auto p-4 flex flex-col md:flex-row gap-4">
      <section className="w-full md:w-2/3">
        <StoreInfo storeInfo={storeInfo[0]} />
      </section>
      <section className="w-full md:w-1/3">
        <StoreSocials storeId={storeInfo[0].id} />
      </section>
    </section>
  );
};

export default page;
