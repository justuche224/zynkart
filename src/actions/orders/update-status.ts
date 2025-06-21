"use server"

import db from "@/db";
import { order } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { serverAuth } from "@/lib/server-auth";

export interface UpdateOrderStatusParams {
    orderId: string;
    storeId: string;
    paymentStatus?: "PENDING" | "PAID" | "FAILED" | "REFUNDED";
    fulfillmentStatus?: "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
}

/**
 * Update order payment and/or fulfillment status
 */
export async function updateOrderStatus(params: UpdateOrderStatusParams) {
    const session = await serverAuth();
    if (!session?.user?.id) {
        throw new Error("Unauthorized");
    }

    try {
        const { orderId, storeId, paymentStatus, fulfillmentStatus } = params;

        if (!orderId || !storeId) {
            throw new Error("Order ID and Store ID are required");
        }

        if (!paymentStatus && !fulfillmentStatus) {
            throw new Error("At least one status update is required");
        }

        const [existingOrder] = await db
            .select({
                id: order.id,
                paymentStatus: order.paymentStatus,
                fulfillmentStatus: order.fulfillmentStatus,
                storeId: order.storeId,
            })
            .from(order)
            .where(and(
                eq(order.id, orderId),
                eq(order.storeId, storeId)
            ));

        if (!existingOrder) {
            throw new Error("Order not found or access denied");
        }

        if (paymentStatus) {
            const validPaymentTransitions = {
                "PENDING": ["PAID", "FAILED", "REFUNDED"],
                "PAID": ["REFUNDED"],
                "FAILED": ["PENDING"],
                "REFUNDED": []
            };

            if (!validPaymentTransitions[existingOrder.paymentStatus]?.includes(paymentStatus as never)) {
                throw new Error(`Invalid payment status transition from ${existingOrder.paymentStatus} to ${paymentStatus}`);
            }
        }

        if (fulfillmentStatus) {
            const validFulfillmentTransitions = {
                "PROCESSING": ["SHIPPED", "CANCELLED"],
                "SHIPPED": ["DELIVERED", "CANCELLED"],
                "DELIVERED": [],
                "CANCELLED": []
            };

            if (!validFulfillmentTransitions[existingOrder.fulfillmentStatus]?.includes(fulfillmentStatus as never)) {
                throw new Error(`Invalid fulfillment status transition from ${existingOrder.fulfillmentStatus} to ${fulfillmentStatus}`);
            }
        }

        const updateData: any = {
            updatedAt: new Date(),
        };

        if (paymentStatus) {
            updateData.paymentStatus = paymentStatus;
        }

        if (fulfillmentStatus) {
            updateData.fulfillmentStatus = fulfillmentStatus;
            
            if (fulfillmentStatus === "SHIPPED") {
                updateData.shippedAt = new Date();
            } else if (fulfillmentStatus === "DELIVERED") {
                updateData.deliveredAt = new Date();
                if (!existingOrder.fulfillmentStatus || existingOrder.fulfillmentStatus !== "SHIPPED") {
                    updateData.shippedAt = new Date(); // Auto-set shipped date if not already set
                }
            }
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
            message: "Order status updated successfully",
            orderId,
            updatedFields: {
                ...(paymentStatus && { paymentStatus }),
                ...(fulfillmentStatus && { fulfillmentStatus }),
            }
        };

    } catch (error) {
        console.error("Error updating order status:", error);
        throw new Error(error instanceof Error ? error.message : "Failed to update order status");
    }
}

/**
 * Update payment status
 */
export async function updatePaymentStatus(orderId: string, storeId: string, paymentStatus: "PENDING" | "PAID" | "FAILED" | "REFUNDED") {
    return updateOrderStatus({
        orderId,
        storeId,
        paymentStatus
    });
}

/**
 * Update fulfillment status
 */
export async function updateFulfillmentStatus(orderId: string, storeId: string, fulfillmentStatus: "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED") {
    return updateOrderStatus({
        orderId,
        storeId,
        fulfillmentStatus
    });
} 