"use server"

import db from "@/db";
import { order } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { serverAuth } from "@/lib/server-auth";

export interface UpdateTrackingInfoParams {
    orderId: string;
    storeId: string;
    trackingNumber?: string;
    shippingProvider?: string;
    estimatedDelivery?: Date;
}

/**
 * Update order tracking information
 */
export async function updateTrackingInfo(params: UpdateTrackingInfoParams) {
    const session = await serverAuth();
    if (!session?.user?.id) {
        throw new Error("Unauthorized");
    }

    try {
        const { orderId, storeId, trackingNumber, shippingProvider, estimatedDelivery } = params;

        if (!orderId || !storeId) {
            throw new Error("Order ID and Store ID are required");
        }

        if (!trackingNumber && !shippingProvider && !estimatedDelivery) {
            throw new Error("At least one tracking field is required");
        }

        const [existingOrder] = await db
            .select({
                id: order.id,
                fulfillmentStatus: order.fulfillmentStatus,
                paymentStatus: order.paymentStatus,
            })
            .from(order)
            .where(and(
                eq(order.id, orderId),
                eq(order.storeId, storeId)
            ));

        if (!existingOrder) {
            throw new Error("Order not found or access denied");
        }

        if (existingOrder.paymentStatus !== "PAID") {
            throw new Error("Cannot update tracking for unpaid orders");
        }

        if (existingOrder.fulfillmentStatus === "CANCELLED") {
            throw new Error("Cannot update tracking for cancelled orders");
        }

        const updateData: any = {
            updatedAt: new Date(),
        };

        if (trackingNumber !== undefined) {
            updateData.trackingNumber = trackingNumber;
        }

        if (shippingProvider !== undefined) {
            updateData.shippingProvider = shippingProvider;
        }

        if (trackingNumber && existingOrder.fulfillmentStatus === "PROCESSING") {
            updateData.fulfillmentStatus = "SHIPPED";
            updateData.shippedAt = new Date();
        }

        await db
            .update(order)
            .set(updateData)
            .where(and(
                eq(order.id, orderId),
                eq(order.storeId, storeId)
            ));

        return {
            success: true,
            message: "Tracking information updated successfully",
            orderId,
            updatedFields: {
                ...(trackingNumber !== undefined && { trackingNumber }),
                ...(shippingProvider !== undefined && { shippingProvider }),
                ...(updateData.fulfillmentStatus && { fulfillmentStatus: updateData.fulfillmentStatus }),
            }
        };

    } catch (error) {
        console.error("Error updating tracking info:", error);
        throw new Error(error instanceof Error ? error.message : "Failed to update tracking information");
    }
}

/**
 * Add tracking number to order
 */
export async function addTrackingNumber(orderId: string, storeId: string, trackingNumber: string, shippingProvider?: string) {
    if (!trackingNumber?.trim()) {
        throw new Error("Valid tracking number is required");
    }

    return updateTrackingInfo({
        orderId,
        storeId,
        trackingNumber: trackingNumber.trim(),
        ...(shippingProvider && { shippingProvider: shippingProvider.trim() })
    });
}

/**
 * Remove tracking information
 */
export async function removeTrackingInfo(orderId: string, storeId: string) {
    const session = await serverAuth();
    if (!session?.user?.id) {
        throw new Error("Unauthorized");
    }

    try {
        const [existingOrder] = await db
            .select({
                id: order.id,
                fulfillmentStatus: order.fulfillmentStatus,
            })
            .from(order)
            .where(and(
                eq(order.id, orderId),
                eq(order.storeId, storeId)
            ));

        if (!existingOrder) {
            throw new Error("Order not found or access denied");
        }

        if (existingOrder.fulfillmentStatus === "DELIVERED") {
            throw new Error("Cannot remove tracking info from delivered orders");
        }

        await db
            .update(order)
            .set({
                trackingNumber: null,
                shippingProvider: null,
                updatedAt: new Date(),
            })
            .where(and(
                eq(order.id, orderId),
                eq(order.storeId, storeId)
            ));

        return {
            success: true,
            message: "Tracking information removed successfully",
            orderId
        };

    } catch (error) {
        console.error("Error removing tracking info:", error);
        throw new Error(error instanceof Error ? error.message : "Failed to remove tracking information");
    }
}

/**
 * Bulk update tracking
 */
export async function bulkUpdateTracking(orders: Array<{
    orderId: string;
    trackingNumber: string;
    shippingProvider?: string;
}>, storeId: string) {
    const session = await serverAuth();
    if (!session?.user?.id) {
        throw new Error("Unauthorized");
    }

    try {
        if (!orders?.length) {
            throw new Error("No orders provided for tracking update");
        }

        if (!storeId) {
            throw new Error("Store ID is required");
        }

        const results = [];
        const errors = [];

        for (const orderUpdate of orders) {
            try {
                const result = await addTrackingNumber(
                    orderUpdate.orderId,
                    storeId,
                    orderUpdate.trackingNumber,
                    orderUpdate.shippingProvider
                );
                results.push(result);
            } catch (error) {
                errors.push({
                    orderId: orderUpdate.orderId,
                    error: error instanceof Error ? error.message : "Unknown error"
                });
            }
        }

        return {
            success: true,
            message: `Updated tracking for ${results.length} orders`,
            results,
            errors: errors.length > 0 ? errors : undefined,
            summary: {
                total: orders.length,
                successful: results.length,
                failed: errors.length
            }
        };

    } catch (error) {
        console.error("Error in bulk tracking update:", error);
        throw new Error(error instanceof Error ? error.message : "Failed to bulk update tracking");
    }
} 