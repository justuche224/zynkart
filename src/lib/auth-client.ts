import { createAuthClient } from "better-auth/react"
import { inferAdditionalFields } from "better-auth/client/plugins";

export const authClient = createAuthClient({  plugins: [
    inferAdditionalFields({
      user: {
        role: {
          type: "string",
          enum: ["ADMIN", "USER"],
        }
      },
    }),
  ],
  fetchOptions: {
    onError: async (context) => {
      const { response } = context;
      if (response.status === 429) {
        const retryAfter = response.headers.get("X-Retry-After");
        console.log(`Too fast!. Retry after ${retryAfter} seconds`);
      }
    },
  },})