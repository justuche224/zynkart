import { create } from "zustand";

type Customer = {
  id: string;
  name: string;
  email: string;
  storeId: string;
};

type CustomerSessionState = {
  customer: Customer | null;
  setCustomer: (customer: Customer | null) => void;
};

export const useCustomerSession = create<CustomerSessionState>((set) => ({
  customer: null,
  setCustomer: (customer) => set({ customer }),
}));
