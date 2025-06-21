"use client";
import React from "react";
import { CustomerOrders } from "@/components/store/orders";
import { StoreDataFromHomePage } from "@/lib/store-utils";

interface OrdersProps {
  store: StoreDataFromHomePage;
}

const Orders = ({ store }: OrdersProps) => {
  return (
    <div>
      <CustomerOrders store={store} />
    </div>
  );
};

export default Orders;
