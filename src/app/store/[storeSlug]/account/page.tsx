import { serverCustomerAuth } from "@/lib/server-auth";
import { redirect } from "next/navigation";
import db from "@/db";
import { store } from "@/db/schema";
import { eq } from "drizzle-orm";
import CustomerSignOutButton from "@/components/auth/customer-sign-out-button";

const page = async ({ params }: { params: Promise<{ storeSlug: string }> }) => {
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
  if (!customer) {
    return redirect(`/sign-in?callbackUrl=/account`);
  }
  return (
    <div>
      <h1>Account</h1>
      <pre>{JSON.stringify(customer, null, 2)}</pre>
      <CustomerSignOutButton storeSlug={storeData.slug} />
    </div>
  );
};

export default page;
