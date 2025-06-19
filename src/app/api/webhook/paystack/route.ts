import db from "@/db";
import { order } from "@/db/schema";
import { eq } from "drizzle-orm";
import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  console.log("POST /api/webhook/paystack");

  const body = await req.json();

  const signature = req.headers.get("x-paystack-signature");
  const secretKey = process.env.PAYSTACK_SECRET_KEY!;
  const hash = crypto
    .createHmac("sha512", secretKey)
    .update(JSON.stringify(body))
    .digest("hex");

  if (hash == signature) {
    console.log("Signature verified");
    const event = body;
    switch (event.event) {
      case "charge.success":
        await db
          .update(order)
          .set({ paymentStatus: "PAID" })
          .where(eq(order.paymentReference, event.data.reference));
        console.log("Payment successful");
        break;
      case "charge.fail":
        await db
          .update(order)
          .set({ paymentStatus: "FAILED" })
          .where(eq(order.paymentReference, event.data.reference));
        console.log("Payment failed");
        break;
      default:
        console.log("Unhandled event:", event.event);
    }
  }

  return NextResponse.json({ success: true }, { status: 200 });
}
