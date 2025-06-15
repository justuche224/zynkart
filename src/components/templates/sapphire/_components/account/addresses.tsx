import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import React from "react";

const MyAddresses = () => {
  return (
    <Card className="bg-gradient-to-r from-blue-900/40 via-purple-800/40 to-purple-900/40 backdrop-blur-md text-white">
      <CardHeader>
        <CardTitle>My Addresses</CardTitle>
        <CardDescription>View and manage your saved addresses</CardDescription>
      </CardHeader>
      <p className="p-6 pt-0">You have no saved addresses.</p>
    </Card>
  );
};

export default MyAddresses;
