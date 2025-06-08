import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import React from "react";

const MyAddresses = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>My Addresses</CardTitle>
        <CardDescription>View and manage your saved addresses</CardDescription>
      </CardHeader>
      <p className="p-6 pt-0">You have no saved addresses.</p>
    </Card>
  );
};

export default MyAddresses;
