import db from "@/db";
import { order } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  console.log("GET /api/store/order/confirmation");
  const { searchParams } = new URL(req.url);
  const reference = searchParams.get("reference");
  const orderId = searchParams.get("orderId");
  const storeSlug = searchParams.get("storeSlug");

  if (!reference) {
    return new NextResponse("Missing reference", { status: 400 });
  }

  if (!orderId) {
    return new NextResponse("Missing orderId", { status: 400 });
  }

  if (!storeSlug) {
    return new NextResponse("Missing storeSlug", { status: 400 });
  }

  const verifyUrl = `https://api.paystack.co/transaction/verify/${reference}`;
  const secretKey = process.env.PAYSTACK_SECRET_KEY;

  try {
    const response = await fetch(verifyUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${secretKey}`,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (data.status && data.data?.status === "success") {
      const orderInfo = await db.query.order.findFirst({
        where: eq(order.id, orderId),
        columns: { id: true },
      });

      if (!orderInfo?.id) {
        return new NextResponse("Order not found", { status: 404 });
      }
      console.log("Payment verified");
      return NextResponse.redirect(
        new URL(
          `https://${storeSlug}.zynkart.store/checkout/confirmed?orderId=${orderId}`,
          // `http://${storeSlug}.localhost:3000/checkout/confirmed?orderId=${orderId}`,
          req.url
        )
      );
    } else {
      return new NextResponse("Payment verification failed", { status: 400 });
    }
  } catch (error) {
    console.error("Error verifying payment:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
