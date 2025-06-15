"use client";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import React from "react";

const Orders = () => {
  return (
    <Card className="bg-gradient-to-r from-blue-900/40 via-purple-800/40 to-purple-900/40 backdrop-blur-md text-white">
      <CardHeader>
        <CardTitle>Orders</CardTitle>
        <CardDescription>View and manage your orders</CardDescription>
      </CardHeader>
    </Card>
  );
};

export default Orders;
