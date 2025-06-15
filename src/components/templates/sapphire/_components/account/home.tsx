"use client";
import React from "react";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const AccountHome = ({
  user,
}: {
  user: { id: string; name: string; email: string };
}) => {
  return (
    <Card className="bg-gradient-to-r from-blue-900/40 via-purple-800/40 to-purple-900/40 backdrop-blur-md text-white">
      <CardHeader>
        <CardTitle>Account Details</CardTitle>
        <CardDescription>View and manage your account details.</CardDescription>
      </CardHeader>
      <Separator className="my-4" />
      <CardContent>
        <p>{user.name}</p>
        <p>{user.email}</p>
      </CardContent>
    </Card>
  );
};

export default AccountHome;
