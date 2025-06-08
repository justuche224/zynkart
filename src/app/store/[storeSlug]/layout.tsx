import { getCurrentCustomer } from "@/actions/customer";
import { CustomerSessionProvider } from "@/providers/customer-session-provider";
import db from "@/db";
import { store } from "@/db/schema";
import { eq } from "drizzle-orm";

const StoreLayout = async ({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ storeSlug: string }>;
}) => {
  const customer = await getCurrentCustomer();
  const { storeSlug } = await params;
  const storeData = await db.query.store.findFirst({
    where: eq(store.slug, storeSlug),
  });

  if (!storeData) {
    return <div>Store not found</div>;
  }

  return (
    <CustomerSessionProvider customer={customer}>
      {children}
    </CustomerSessionProvider>
  );
};

export default StoreLayout;
