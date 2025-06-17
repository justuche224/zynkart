"use client";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import React from "react";

const Orders = () => {
  return (
    <Card className="dark:bg-[#121212] bg-[#f5f5f5]">
      <CardHeader>
        <CardTitle>Orders</CardTitle>
        <CardDescription>View and manage your orders</CardDescription>
      </CardHeader>
    </Card>
  );
};

export default Orders;
