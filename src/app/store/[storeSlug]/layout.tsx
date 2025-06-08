import { getCurrentCustomer } from "@/actions/customer";
import { CustomerSessionProvider } from "@/providers/customer-session-provider";

const StoreLayout = async ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const customer = await getCurrentCustomer();

  return (
    <CustomerSessionProvider customer={customer}>
      {children}
    </CustomerSessionProvider>
  );
};

export default StoreLayout;
