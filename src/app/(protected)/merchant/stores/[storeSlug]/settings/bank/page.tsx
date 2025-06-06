import { redirect } from "next/navigation";
import React from "react";
import db from "@/db";
import { bank, store } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import NewBankPage from "./NewBankPage";
import BankInfo from "./BankInfo";
import { serverAuth } from "@/lib/server-auth";

const page = async ({ params }: { params: Promise<{ storeSlug: string }> }) => {
  const { storeSlug } = await params;
  const merchant = await serverAuth();
  if (!merchant?.user?.id) return redirect(`/sign-in?callbackUrl=/merchant/stores/${storeSlug}/settings/bank`);

  const storeData = await db.query.store.findFirst({
    where: and(eq(store.slug, storeSlug), eq(store.merchantId, merchant.user.id)),
    columns: {
      id: true,
      name: true,
      slug: true,
    },
  });

  if (!storeData) {
    return redirect("/merchant");
  }

  const bankInfo = await db.query.bank.findFirst({
    where: eq(bank.storeId, storeData.id),
    columns: {
      id: true,
      bankName: true,
      accountName: true,
      accountNumber: true,
      currency: true,
      percentageCharge: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!bankInfo) {
    return <NewBankPage storeData={storeData} />;
  }

  return <BankInfo storeSlug={storeSlug} bankInfo={bankInfo} />;
};

export default page;
