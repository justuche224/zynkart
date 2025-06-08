import { CustomerSignInForm } from "@/components/auth/customer-sign-in";
import { serverCustomerAuth } from "@/lib/server-auth";
import db from "@/db";
import { store } from "@/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

const CustomerSignInPage = async ({
  params,
}: {
  params: Promise<{ storeSlug: string }>;
}) => {
  const { storeSlug } = await params;
  const storeData = await db.query.store.findFirst({
    where: eq(store.slug, storeSlug),
    columns: {
      id: true,
      name: true,
      slug: true,
    },
  });

  if (!storeData) {
    return <div>Store not found</div>;
  }

  const customer = await serverCustomerAuth();

  if (customer) {
    return redirect(`/account`);
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <CustomerSignInForm store={storeData} />
      </div>
    </div>
  );
};

export default CustomerSignInPage;
