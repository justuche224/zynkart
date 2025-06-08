import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import React from "react";

const SavedItems = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Saved Items</CardTitle>
        <CardDescription>View and manage your saved items</CardDescription>
      </CardHeader>
      <p className="p-6 pt-0">You have no saved items.</p>
    </Card>
  );
};

export default SavedItems;
