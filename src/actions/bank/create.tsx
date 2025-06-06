"use server";
import { z } from "zod";
import { BankSchema } from "@/schemas";
import db from "@/db";
import { bank, store } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { serverAuth } from "@/lib/server-auth";

type FormData = z.infer<typeof BankSchema>;

export async function addBank(values: FormData, storeSlug: string) {
  try {
    const user = await serverAuth();
    if (!user?.user?.id) {
      return {
        success: false,
        error: { message: "Authentication required!" },
        data: null,
      };
    }

    const validationResult = BankSchema.safeParse(values);
    if (!validationResult.success) {
      return {
        success: false,
        error: { message: validationResult.error.errors[0].message },
        data: null,
      };
    }

    const storeData = await db.query.store.findFirst({
      where: and(eq(store.slug, storeSlug), eq(store.merchantId, user.user.id)),
      columns: {
        id: true,
        merchantId: true,
      }
    });

    if (!storeData) {
      return {
        success: false,
        error: { message: "Store not found or unauthorized." },
        data: null,
      };
    }

    const existingBank = await db.query.bank.findFirst({
      where: eq(bank.storeId, storeData.id),
    });

    if (existingBank) {
      return {
        success: false,
        error: { message: "Bank account already exists for this store." },
        data: null,
      };
    }

    const params = {
      business_name: values.businessName,
      bank_code: values.bankCode,
      account_number: values.accountNumber,
      percentage_charge: 0.5,
    };

    const response = await fetch("https://api.paystack.co/subaccount", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        error: {
          message:
            errorData.message ||
            "Failed to create bank account with payment provider.",
        },
        data: null,
      };
    }

    const data = await response.json();
    if (!data.status || !data?.data?.subaccount_code) {
      return {
        success: false,
        error: { message: "Failed to create subaccount." },
        data: null,
      };
    }

    const newBank = await db
      .insert(bank)
      .values({
        bankCode: values.bankCode,
        bankName: values.bankName,
        accountName: values.accountName,
        accountNumber: values.accountNumber,
        country: values.country,
        currency: values.currency,
        businessName: values.businessName,
        percentageCharge: "0.5",
        subaccountCode: data.data.subaccount_code,
        storeId: storeData.id,
      })
      .returning();

    return {
      success: true,
      error: null,
      data: newBank[0],
    };
  } catch (error) {
    console.error("Bank creation error:", error);
    return {
      success: false,
      error: {
        message:
          error instanceof Error ? error.message : "Failed to create bank.",
      },
      data: null,
    };
  }
}
