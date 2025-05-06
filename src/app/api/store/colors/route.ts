import db from "@/db/index";
import { color, store } from "@/db/schema";
import { serverAuth } from "@/lib/server-auth";
import { and, eq } from "drizzle-orm";

export async function POST(req: Request) {
  const body = await req.json();
  const { name, value, storeId, merchantId } = body;

  const session = await serverAuth();
  const merchant = session?.user;
  if (merchant?.id !== merchantId) {
    return new Response("Unauthorized access", { status: 401 });
  }

  if (!name || !value) {
    return new Response("Missing required fields", { status: 400 });
  }

  if (!storeId) {
    return new Response("Missing required fields", { status: 400 });
  }

  try {
    const storeData = await db.query.store.findFirst({
      where: and(eq(store.id, storeId), eq(store.merchantId, merchantId)),
    });

    if (!storeData) {
      return new Response("Store not found or unauthorized access", {
        status: 403,
      });
    }

    const newColor = await db
      .insert(color)
      .values({ name, value, storeId })
      .returning();

    return Response.json(newColor[0]);
  } catch (error) {
    console.error(error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
