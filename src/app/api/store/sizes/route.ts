import db from "@/db/index";
import { size, store } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { serverAuth } from "@/lib/server-auth";

export async function POST(req: Request) {
  const body = await req.json();
  const { name, value, storeProfileId, storeId, merchantId } = body;

  const session = await serverAuth();
  const merchant = session?.user;
  if (merchant?.id !== merchantId) {
    return new Response("Unauthorized access", { status: 401 });
  }

  if (!name || !value) {
    return new Response("Missing required fields", { status: 400 });
  }

  if (!storeProfileId && !storeId) {
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

    const newSize = await db
      .insert(size)
      .values({ name, value, storeId })
      .returning();

    return Response.json(newSize[0]);
  } catch (error) {
    console.error(error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
