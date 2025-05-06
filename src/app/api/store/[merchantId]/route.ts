import logger from "@/utils/logger";
import type { NextRequest } from "next/server";
import { db } from "@/server/database";
import { store } from "@/server/database/schema";
import { eq } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ merchantId: string }> }
) {
  const { merchantId } = await params;
  logger.info(`GET /api/store/${merchantId}`);
  try {
    const stores = await db.query.store.findMany({
      where: eq(store.merchantId, merchantId),
      with: {
        domains: true,
        storeProfile: true,
      },
    });
    logger.info(stores);
    return Response.json(stores);
  } catch (error) {
    logger.error(error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
