import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import React from "react";

const MyAddresses = () => {
  return (
    <Card className="dark:bg-[#121212] bg-[#f5f5f5]">
      <CardHeader>
        <CardTitle>My Addresses</CardTitle>
        <CardDescription>View and manage your saved addresses</CardDescription>
      </CardHeader>
      <p className="p-6 pt-0">You have no saved addresses.</p>
    </Card>
  );
};

export default MyAddresses;
