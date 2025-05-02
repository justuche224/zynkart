import { z } from "zod";

export const StoreSchema = z.object({
  name: z
    .string()
    .min(3, {
      message:
        "Store Name should be more than 3 characters but less than 50 characters",
    })
    .max(50, {
      message:
        "Store Name should be more than 3 characters but less than 50 characters",
    })
    .regex(/^[a-zA-Z0-9\s-]+$/, {
      message:
        "Store Name can only contain letters, numbers, spaces, and hyphens.",
    }),
});
