import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import React from "react";
import NewBannerForm from "./new-banner";
import { serverAuth } from "@/lib/server-auth";
import { redirect } from "next/navigation";
import db from "@/db";
import { store } from "@/db/schema";
import { and, eq } from "drizzle-orm";

const NewBannerPage = async ({ params }: { params: Promise<{ storeSlug: string }> }) => {
  const session = await serverAuth();

  const { storeSlug } = await params;

  if (!session?.session || !session.user) {
    return redirect(`/sign-in?callbackURL=/merchant/stores/${storeSlug}/banners/new`);
  }

  const storeInfo = await db.query.store.findFirst({
    where: and(eq(store.slug, storeSlug), eq(store.merchantId, session.user.id!)),
    columns: {
      id: true,
      name: true,
    },
  });

  if (!storeInfo) {
    return redirect("/merchant");
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="w-full max-w-3xl mx-auto p-4 pt-20 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Create New Banner</CardTitle>
            <CardDescription>Add a new banner to your store</CardDescription>
          </CardHeader>
          <CardContent>
            <NewBannerForm
              storeData={{ id: storeInfo.id, name: storeInfo.name }}
              storeSlug={storeSlug}
              merchantId={session.user.id!}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NewBannerPage;
