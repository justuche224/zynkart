import db from "@/db";
import { banner, store } from "@/db/schema";
import { serverAuth } from "@/lib/server-auth";
import { and, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import EditBannerForm from "./edit-banner";

const EditBannerPage = async ({
  params,
}: {
  params: Promise<{ storeSlug: string; bannerId: string }>;
}) => {
  const { storeSlug, bannerId } = await params;
  const session = await serverAuth();

  if (!session?.user || !session.session)
    return redirect(
      `/sign-in?callbackURL=/merchant/stores/${storeSlug}/banners/${bannerId}/edit`
    );

  const storeInfo = await db.query.store.findFirst({
    where: and(
      eq(store.slug, storeSlug),
      eq(store.merchantId, session.user.id)
    ),
    columns: {
      id: true,
      name: true,
    },
  });

  if (!storeInfo) {
    return redirect("/merchant");
  }

  const bannerInfoResult = await db
    .select({
      id: banner.id,
      title: banner.title,
      description: banner.description,
      imageUrl: banner.imageUrl,
      link: banner.linkUrl,
      isActive: banner.isActive,
    })
    .from(banner)
    .where(and(eq(banner.id, bannerId), eq(banner.storeId, storeInfo.id)));

  // TODO: add 404 page

  if (bannerInfoResult.length === 0)
    return redirect(`/merchant/stores/${storeSlug}/banners`);

  const bannerInfo = bannerInfoResult[0];

  return (
    <div className="min-h-screen bg-background">
      <div className="w-full max-w-3xl mx-auto p-4 pt-20 space-y-6">
        <Link
          href={`/merchant/stores/${storeSlug}/banners`}
          className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Banners
        </Link>
        <Card>
          <CardHeader>
            <CardTitle>Edit Banner</CardTitle>
            <CardDescription>Update your banner details</CardDescription>
          </CardHeader>
          <CardContent>
            <EditBannerForm
              banner={bannerInfo}
              storeData={{ id: storeInfo.id, name: storeInfo.name }}
              storeSlug={storeSlug}
              merchantId={session.user.id}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EditBannerPage;
