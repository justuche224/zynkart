import db from "@/db";
import { store } from "@/db/schema";
import { serverAuth } from "@/lib/server-auth";
import { redirect } from "next/navigation";
import { and, eq } from "drizzle-orm";
import StoreDashboard from "./store-dashboard";
import { getStoreHealth } from "@/actions/store/health";

const page = async ({ params }: { params: Promise<{ storeSlug: string }> }) => {
  const { storeSlug } = await params;
  const session = await serverAuth();

  if (!session?.user?.id)
    return redirect(
      `/sign-in?callbackUrl=/merchant/stores/${storeSlug}/dashboard`
    );

  const storeData = await db.query.store.findFirst({
    columns: {
      id: true,
      name: true,
      email: true,
      phone: true,
      address: true,
      slug: true,
    },
    where: and(
      eq(store.slug, storeSlug),
      eq(store.merchantId, session.user.id)
    ),
  });

  if (!storeData) return redirect("/merchant");

  const storeHealth = await getStoreHealth(storeData.id, storeData.slug);

  return (
    <div className="max-w-7xl mx-auto mt-10 px-4">
      <StoreDashboard storeInfo={storeData} storeHealth={storeHealth} />
    </div>
  );
};

export default page;
