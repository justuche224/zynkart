"use server";

import {
  TCustomerSignInSchema,
  TCustomerSignUpSchema,
  customerSignUpSchema,
} from "@/schemas/customer";
import db from "@/db";
import { customer, customerSesssion } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { sign, verify } from "jsonwebtoken";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

export const getCurrentCustomer = async () => {
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
        customer: true,
      },
    });

    if (!session || new Date() > session.expiresAt) {
      return null;
    }

    return session.customer;
  } catch (error) {
    return null;
  }
};

export const signOutCustomer = async (storeSlug: string) => {
  const token = (await cookies()).get("customer_token")?.value;

  if (token) {
    try {
      const decoded = verify(token, process.env.JWT_SECRET as string) as {
        sessionId: string;
      };
      await db
        .delete(customerSesssion)
        .where(eq(customerSesssion.id, decoded.sessionId));
    } catch (error) {
      // Token verification failed, but we'll proceed with clearing the cookie
      console.error("Sign-out error:", error);
    }
  }

  (await cookies()).set("customer_token", "", {
    expires: new Date(0),
    path: "/",
  });

  revalidatePath(`/store/${storeSlug}`);
};

export const signInCustomer = async ({
  storeId,
  ...values
}: TCustomerSignInSchema & { storeId: string }) => {
  try {
    const existingCustomer = await db.query.customer.findFirst({
      where: and(
        eq(customer.email, values.email),
        eq(customer.storeId, storeId)
      ),
    });

    if (!existingCustomer) {
      return {
        error: "Invalid email or password",
        success: "",
      };
    }

    const passwordMatch = await bcrypt.compare(
      values.password,
      existingCustomer.password
    );

    if (!passwordMatch) {
      return {
        error: "Invalid email or password",
        success: "",
      };
    }

    const session = await db
      .insert(customerSesssion)
      .values({
        id: crypto.randomUUID(),
        customerId: existingCustomer.id,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
        token: "pending",
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    const token = sign(
      { sessionId: session[0].id },
      process.env.JWT_SECRET as string
    );

    await db
      .update(customerSesssion)
      .set({ token })
      .where(eq(customerSesssion.id, session[0].id));

    (await cookies()).set("customer_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });

    revalidatePath(`/store/${storeId}`);

    return {
      success: "Signed in successfully",
      error: "",
    };
  } catch (error) {
    console.error(error);
    return {
      error: "An unexpected error occurred. Please try again.",
      success: "",
    };
  }
};

export const signUpCustomer = async ({
  storeId,
  ...values
}: TCustomerSignUpSchema & { storeId: string }) => {
  try {
    const validatedValues = customerSignUpSchema.safeParse(values);

    if (!validatedValues.success) {
      return {
        error: validatedValues.error.errors[0].message,
        success: "",
      };
    }

    const existingCustomer = await db.query.customer.findFirst({
      where: and(
        eq(customer.email, values.email),
        eq(customer.storeId, storeId)
      ),
    });

    if (existingCustomer) {
      return {
        error: "A user with this email already exists",
        success: "",
      };
    }

    const hashedPassword = await bcrypt.hash(values.password, 10);
    const newCustomer = await db
      .insert(customer)
      .values({
        storeId,
        email: values.email,
        name: values.name,
        password: hashedPassword,
      })
      .returning();

    // TODO: Send verification email in production

    return {
      success: "Account created successfully",
      error: "",
      data: newCustomer[0],
    };
  } catch (error) {
    console.error(error);
    return {
      error: "An unexpected error occurred. Please try again.",
      success: "",
    };
  }
};
