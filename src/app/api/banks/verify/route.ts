
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const account_number = searchParams.get("account_number");
  const bank_code = searchParams.get("bank_code");

  if (!account_number || !bank_code)
    return NextResponse.json(
      { message: "Account number and bank code are required" },
      { status: 400 }
    );

  try {
    const res = await fetch(
      `https://api.paystack.co/bank/resolve?account_number=${account_number}&bank_code=${bank_code}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    if (!res.ok) {
      return NextResponse.json(
        { message: "Failed to verify account" },
        { status: 500 }
      );
    }

    const data = await res.json();

    if (!data.status || !data.data) {
      return NextResponse.json(
        { message: "Failed to verify account" },
        { status: 500 }
      );
    }
    return NextResponse.json(data.data);
  } catch (error) {
    console.error("Failed to verify account", error);
    return NextResponse.json(
      { message: "Failed to verify account" },
      { status: 500 }
    );
  }
}
