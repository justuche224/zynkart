import db from "@/db";
import { store } from "@/db/schema";
import { serverAuth } from "@/lib/server-auth";
import { redirect } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { OrdersPage } from "./orders-page";

const page = async ({ params }: { params: Promise<{ storeSlug: string }> }) => {
  const { storeSlug } = await params;
const session = await serverAuth()

if (!session?.user?.id) return redirect(`/sign-in?callbackUrl=/merchant/stores/${storeSlug}/orders`);

const storeData = await db.query.store.findFirst({
  where: and(eq(store.slug, storeSlug), eq(store.merchantId, session.user.id)),
});

if (!storeData) return redirect("/merchant");


  return <div className="max-w-7xl mx-auto mt-10 px-4">
    <OrdersPage storeId={storeData.id} storeSlug={storeSlug} storeName={storeData.name} />
  </div>;
};

export default page;