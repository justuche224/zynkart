import db from "@/db";
import { mailService } from "@/services/mail";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

export const auth = betterAuth({
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    autoSignIn: false,
    sendResetPassword: async ({ user, url, token }, request) => {
      await mailService.sendPasswordResetEmail(user.email, url);
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url, token }, request) => {
      await mailService.sendVerificationEmail(user.email, url);
    },
  },
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  user: {
    additionalFields: {
      role: {
        type: "string",
        default: "USER",
      },
    },
  },
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60,
    },
  },
  rateLimit: {
    customRules: {
      "/forget-password": { window: 10, max: 3 },
      "/sign-up": {
        window: 10,
        max: 3,
      },
    },
  },
  logger: {
    level: "debug",
    log(level, message, ...args) {
      console.log(level, message, ...args);
    },
  },
});
