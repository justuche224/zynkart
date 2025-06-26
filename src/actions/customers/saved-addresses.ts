"use server";

import { revalidatePath } from "next/cache";
import { eq, and, desc } from "drizzle-orm";
import db from "@/db";
import { customerSavedAddress } from "@/db/schema";
import { savedAddressSchema, updateSavedAddressSchema } from "@/schemas";
import { serverCustomerAuth } from "@/lib/server-auth";

export async function getSavedAddresses() {
  try {
    const customer = await serverCustomerAuth();
    if (!customer) {
      return { error: "Unauthorized" };
    }

    const addresses = await db.query.customerSavedAddress.findMany({
      where: eq(customerSavedAddress.customerId, customer.id),
      orderBy: [
        desc(customerSavedAddress.isDefault),
        desc(customerSavedAddress.createdAt),
      ],
    });

    return { success: true, data: addresses };
  } catch (error) {
    console.error("Error fetching saved addresses:", error);
    return { error: "Failed to fetch saved addresses" };
  }
}

export async function createSavedAddress(data: unknown) {
  try {
    const customer = await serverCustomerAuth();
    if (!customer) {
      return { error: "Unauthorized" };
    }

    const validation = savedAddressSchema.safeParse(data);
    if (!validation.success) {
      return { error: "Invalid data", details: validation.error.errors };
    }

    const addressData = validation.data;

    if (addressData.isDefault) {
      await db
        .update(customerSavedAddress)
        .set({ isDefault: false })
        .where(eq(customerSavedAddress.customerId, customer.id));
    }

    const newAddress = await db
      .insert(customerSavedAddress)
      .values({
        customerId: customer.id,
        ...addressData,
      })
      .returning();

    revalidatePath("/checkout");
    return { success: true, data: newAddress[0] };
  } catch (error) {
    console.error("Error creating saved address:", error);
    return { error: "Failed to create saved address" };
  }
}

export async function updateSavedAddress(data: unknown) {
  try {
    const customer = await serverCustomerAuth();
    if (!customer) {
      return { error: "Unauthorized" };
    }

    const validation = updateSavedAddressSchema.safeParse(data);
    if (!validation.success) {
      return { error: "Invalid data", details: validation.error.errors };
    }

    const { id, ...addressData } = validation.data;

    const existingAddress = await db.query.customerSavedAddress.findFirst({
      where: and(
        eq(customerSavedAddress.id, id),
        eq(customerSavedAddress.customerId, customer.id)
      ),
    });

    if (!existingAddress) {
      return { error: "Address not found" };
    }

    if (addressData.isDefault) {
      await db
        .update(customerSavedAddress)
        .set({ isDefault: false })
        .where(
          and(
            eq(customerSavedAddress.customerId, customer.id),
            eq(customerSavedAddress.id, id)
          )
        );
    }

    const updatedAddress = await db
      .update(customerSavedAddress)
      .set({ ...addressData, updatedAt: new Date() })
      .where(
        and(
          eq(customerSavedAddress.id, id),
          eq(customerSavedAddress.customerId, customer.id)
        )
      )
      .returning();

    revalidatePath("/checkout");
    return { success: true, data: updatedAddress[0] };
  } catch (error) {
    console.error("Error updating saved address:", error);
    return { error: "Failed to update saved address" };
  }
}

export async function deleteSavedAddress(addressId: string) {
  try {
    const customer = await serverCustomerAuth();
    if (!customer) {
      return { error: "Unauthorized" };
    }

    const existingAddress = await db.query.customerSavedAddress.findFirst({
      where: and(
        eq(customerSavedAddress.id, addressId),
        eq(customerSavedAddress.customerId, customer.id)
      ),
    });

    if (!existingAddress) {
      return { error: "Address not found" };
    }

    await db
      .delete(customerSavedAddress)
      .where(
        and(
          eq(customerSavedAddress.id, addressId),
          eq(customerSavedAddress.customerId, customer.id)
        )
      );

    revalidatePath("/checkout");
    return { success: true };
  } catch (error) {
    console.error("Error deleting saved address:", error);
    return { error: "Failed to delete saved address" };
  }
}

export async function setDefaultAddress(addressId: string) {
  try {
    const customer = await serverCustomerAuth();
    if (!customer) {
      return { error: "Unauthorized" };
    }

    const existingAddress = await db.query.customerSavedAddress.findFirst({
      where: and(
        eq(customerSavedAddress.id, addressId),
        eq(customerSavedAddress.customerId, customer.id)
      ),
    });

    if (!existingAddress) {
      return { error: "Address not found" };
    }

    await db
      .update(customerSavedAddress)
      .set({ isDefault: false })
      .where(eq(customerSavedAddress.customerId, customer.id));

    await db
      .update(customerSavedAddress)
      .set({ isDefault: true, updatedAt: new Date() })
      .where(
        and(
          eq(customerSavedAddress.id, addressId),
          eq(customerSavedAddress.customerId, customer.id)
        )
      );

    revalidatePath("/checkout");
    return { success: true };
  } catch (error) {
    console.error("Error setting default address:", error);
    return { error: "Failed to set default address" };
  }
}
