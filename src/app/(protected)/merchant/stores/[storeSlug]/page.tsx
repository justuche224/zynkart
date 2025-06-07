import { getStoreByMerchant } from "@/actions/store";
import StoreOverview from "@/components/store-overview";
import { serverAuth } from "@/lib/server-auth";
import { redirect } from "next/navigation";
import React from "react";
import { getStoreHealth } from "@/actions/store/health";

const page = async ({ params }: { params: Promise<{ storeSlug: string }> }) => {
  const user = await serverAuth();
  if (!user?.session || !user?.user) {
    return redirect("/sign-in?callbackURL=/merchant");
  }
  const { storeSlug } = await params;
  const { data, error } = await getStoreByMerchant(storeSlug);

  if (error || !data) {
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

  const storeHealth = await getStoreHealth(data.id, data.slug);

  return (
    <div>
      <StoreOverview store={data} health={storeHealth} />
    </div>
  );
};

export default page;
