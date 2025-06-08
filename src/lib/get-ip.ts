import "server-only";
import { headers } from "next/headers";

export async function getClientIp() {
  const headersList = await headers();
  let ip = headersList.get("x-real-ip");
  const forwardedFor = headersList.get("x-forwarded-for");

  if (!ip && forwardedFor) {
    ip = forwardedFor.split(",")[0].trim();
  }

  return ip || null;
}
