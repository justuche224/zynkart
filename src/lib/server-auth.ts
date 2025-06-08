import "server-only";
import { auth } from "./auth";
import { cookies, headers } from "next/headers";
import { verify } from "jsonwebtoken";
import db from "@/db";
import { customerSesssion } from "@/db/schema";
import { eq } from "drizzle-orm";

export const serverAuth = async () => {
  const data = await auth.api.getSession({
    headers: await headers(),
  });
  return data;
};

export const serverCustomerAuth = async () => {
  const token = (await cookies()).get("customer_token")?.value;

  if (!token) {
    return null;
  }

  try {
    const decoded = verify(token, process.env.JWT_SECRET as string) as {
      sessionId: string;
    };

    const session = await db.query.customerSesssion.findFirst({
      where: eq(customerSesssion.id, decoded.sessionId),
      with: {
        customer: {
          columns: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!session || new Date() > session.expiresAt) {
      return null;
    }

    return session.customer;
  } catch (error) {
    console.error(error);
    return null;
  }
};
