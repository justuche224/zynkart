import { getCurrentCustomer } from "@/actions/customer";
import { CustomerSessionProvider } from "@/providers/customer-session-provider";
import { trackStoreVisit } from "@/actions/store/analytics";
import { headers } from "next/headers";
import { after } from "next/server";

const StoreLayout = async ({
  params,
  children,
}: {
  params: Promise<{ storeSlug: string }>;
  children: React.ReactNode;
}) => {
  const customer = await getCurrentCustomer();
  const { storeSlug } = await params;
  const headersList = await headers();

  after(async () => {
    const userAgent = headersList.get("user-agent");
    const ipAddress =
      headersList.get("x-forwarded-for") || headersList.get("x-real-ip");
    const referrer = headersList.get("referer");

    await trackStoreVisit({
      storeSlug,
      userAgent: userAgent || undefined,
      ipAddress: ipAddress || undefined,
      referrer: referrer || undefined,
    });
  });
  return (
    <CustomerSessionProvider customer={customer}>
      {children}
    </CustomerSessionProvider>
  );
};

export default StoreLayout;
