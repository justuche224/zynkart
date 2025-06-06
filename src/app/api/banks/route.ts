
import { NextResponse } from "next/server";
const perPage = 100;
export async function GET() {
  try {
    const res = await fetch(
      `https://api.paystack.co/bank?country=nigeria&perPage=${perPage}&currency=NGN`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      }
    );
    if (!res.ok) {
      return NextResponse.json(
        { message: "Failed to fetch banks" },
        { status: 500 }
      );
    }

    const data = await res.json();

    if (!data.status || !data.data) {
      return NextResponse.json(
        { message: "Failed to fetch banks" },
        { status: 500 }
      );
    }
    return NextResponse.json(data.data);
  } catch (error) {
    console.error("Failed to fetch banks", error);
    return NextResponse.json(
      { message: "Failed to fetch banks" },
      { status: 500 }
    );
  }
}
