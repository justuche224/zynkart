import { CustomerSignUpForm } from "@/components/auth/customer-sign-up";
import db from "@/db";
import { store } from "@/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { serverCustomerAuth } from "@/lib/server-auth";

const CustomerSignUpPage = async ({
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
      template: true,
    },
  });

  // TODO implement template

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
        <CustomerSignUpForm store={storeData} />
      </div>
    </div>
  );
};

export default CustomerSignUpPage;
