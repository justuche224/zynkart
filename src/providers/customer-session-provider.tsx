"use client";

import { useCustomerSession } from "@/hooks/use-customer-session";
import { useEffect } from "react";

type Customer = {
  id: string;
  name: string;
  email: string;
  storeId: string;
};

export const CustomerSessionProvider = ({
  children,
  customer,
}: {
  children: React.ReactNode;
  customer: Customer | null;
}) => {
  const { setCustomer } = useCustomerSession();

  useEffect(() => {
    setCustomer(customer);
  }, [customer, setCustomer]);

  return <>{children}</>;
};
