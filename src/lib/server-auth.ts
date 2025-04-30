import "server-only";
import { auth } from "./auth";
import { headers } from "next/headers";
export const serverAuth = async () => {
  const data = await auth.api.getSession({
    headers: await headers(),
  });
  return data;
};
