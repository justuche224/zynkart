import { serverCustomerAuth } from "@/lib/server-auth";
import { redirect } from "next/navigation";
import Account from "@/components/store-front/account";
import { getStoreForHomePage } from "../page";

const page = async ({ params }: { params: Promise<{ storeSlug: string }> }) => {
  const { storeSlug } = await params;

  const storeData = await getStoreForHomePage(storeSlug);

  if (!storeData) {
    return <div>Store not found</div>;
  }

  const customer = await serverCustomerAuth();
  if (!customer) {
    return redirect(`/sign-in?callbackUrl=/account`);
  }

  return <Account store={storeData} user={customer} />;
};

export default page;
