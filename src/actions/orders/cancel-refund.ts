"use server"

import db from "@/db";
import { order, orderItem, product } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { serverAuth } from "@/lib/server-auth";

export interface CancelOrderParams {
    orderId: string;
    storeId: string;
    reason?: string;
    restoreInventory?: boolean;
}

export interface RefundOrderParams {
    orderId: string;
    storeId: string;
    refundAmount?: number;
    reason?: string;
    restoreInventory?: boolean;
}

/**
 * Cancel an order
 */
export async function cancelOrder(params: CancelOrderParams) {
    const session = await serverAuth();
    if (!session?.user?.id) {
        throw new Error("Unauthorized");
    }

    try {
        const { orderId, storeId, reason, restoreInventory = true } = params;

        if (!orderId || !storeId) {
            throw new Error("Order ID and Store ID are required");
        }

        const [existingOrder] = await db
            .select({
                id: order.id,
                paymentStatus: order.paymentStatus,
                fulfillmentStatus: order.fulfillmentStatus,
                customerId: order.customerId,
                total: order.total,
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
            throw new Error("Cannot cancel delivered orders");
        }

        if (existingOrder.fulfillmentStatus === "CANCELLED") {
            throw new Error("Order is already cancelled");
        }

        if (existingOrder.fulfillmentStatus === "SHIPPED") {
            throw new Error("Cannot cancel shipped orders. Use return/refund process instead");
        }

        let orderItems: string | any[] = [];
        if (restoreInventory) {
            orderItems = await db
                .select({
                    productId: orderItem.productId,
                    quantity: orderItem.quantity,
                })
                .from(orderItem)
                .where(eq(orderItem.orderId, orderId));
        }

        await db.transaction(async (tx) => {
            await tx
                .update(order)
                .set({
                    fulfillmentStatus: "CANCELLED",
                    updatedAt: new Date(),
                })
                .where(and(
                    eq(order.id, orderId),
                    eq(order.storeId, storeId)
                ));

            if (restoreInventory && orderItems.length > 0) {
                for (const item of orderItems) {
                    await tx
                        .update(product)
                        .set({
                            inStock: sql`${product.inStock} + ${item.quantity}`,
                            updatedAt: new Date(),
                        })
                        .where(eq(product.id, item.productId));
                }
            }
        });

        return {
            success: true,
            message: "Order cancelled successfully",
            orderId,
            details: {
                reason,
                inventoryRestored: restoreInventory,
                itemsRestored: orderItems.length,
            }
        };

    } catch (error) {
        console.error("Error cancelling order:", error);
        throw new Error(error instanceof Error ? error.message : "Failed to cancel order");
    }
}

/**
 * Process a refund for an order
 */
export async function refundOrder(params: RefundOrderParams) {
    const session = await serverAuth();
    if (!session?.user?.id) {
        throw new Error("Unauthorized");
    }

    try {
        const { orderId, storeId, refundAmount, reason, restoreInventory = false } = params;

        if (!orderId || !storeId) {
            throw new Error("Order ID and Store ID are required");
        }

        const [existingOrder] = await db
            .select({
                id: order.id,
                paymentStatus: order.paymentStatus,
                fulfillmentStatus: order.fulfillmentStatus,
                total: order.total,
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
            throw new Error("Can only refund paid orders");
        }

        const maxRefundAmount = existingOrder.total;
        const actualRefundAmount = refundAmount || maxRefundAmount;

        if (actualRefundAmount > maxRefundAmount) {
            throw new Error(`Refund amount cannot exceed order total of ${maxRefundAmount}`);
        }

        if (actualRefundAmount <= 0) {
            throw new Error("Refund amount must be greater than 0");
        }

        let orderItems: string | any[] = [];
        if (restoreInventory) {
            orderItems = await db
                .select({
                    productId: orderItem.productId,
                    quantity: orderItem.quantity,
                })
                .from(orderItem)
                .where(eq(orderItem.orderId, orderId));
        }

        const isFullRefund = actualRefundAmount === maxRefundAmount;

        await db.transaction(async (tx) => {
            await tx
                .update(order)
                .set({
                    paymentStatus: "REFUNDED",
                    ...(isFullRefund && { fulfillmentStatus: "CANCELLED" }),
                    updatedAt: new Date(),
                })
                .where(and(
                    eq(order.id, orderId),
                    eq(order.storeId, storeId)
                ));

            if (restoreInventory && isFullRefund && orderItems.length > 0) {
                for (const item of orderItems) {
                    await tx
                        .update(product)
                        .set({
                            inStock: sql`${product.inStock} + ${item.quantity}`,
                            updatedAt: new Date(),
                        })
                        .where(eq(product.id, item.productId));
                }
            }
        });

        return {
            success: true,
            message: `${isFullRefund ? 'Full' : 'Partial'} refund processed successfully`,
            orderId,
            details: {
                refundAmount: actualRefundAmount,
                maxRefundAmount,
                isFullRefund,
                reason,
                inventoryRestored: restoreInventory && isFullRefund,
                itemsRestored: restoreInventory && isFullRefund ? orderItems.length : 0,
            }
        };

    } catch (error) {
        console.error("Error processing refund:", error);
        throw new Error(error instanceof Error ? error.message : "Failed to process refund");
    }
}

/**
 * Quick cancel order
 */
export async function quickCancelOrder(orderId: string, storeId: string, reason?: string) {
    return cancelOrder({
        orderId,
        storeId,
        reason,
        restoreInventory: true
    });
}

/**
 * Process full refund
 */
export async function processFullRefund(orderId: string, storeId: string, reason?: string, restoreInventory = false) {
    return refundOrder({
        orderId,
        storeId,
        reason,
        restoreInventory
    });
}

/**
 * Bulk cancel multiple orders
 */
export async function bulkCancelOrders(orderIds: string[], storeId: string, reason?: string) {
    const session = await serverAuth();
    if (!session?.user?.id) {
        throw new Error("Unauthorized");
    }

    try {
        if (!orderIds?.length) {
            throw new Error("No order IDs provided");
        }

        if (!storeId) {
            throw new Error("Store ID is required");
        }

        const results = [];
        const errors = [];

        for (const orderId of orderIds) {
            try {
                const result = await quickCancelOrder(orderId, storeId, reason);
                results.push(result);
            } catch (error) {
                errors.push({
                    orderId,
                    error: error instanceof Error ? error.message : "Unknown error"
                });
            }
        }

        return {
            success: true,
            message: `Cancelled ${results.length} orders`,
            results,
            errors: errors.length > 0 ? errors : undefined,
            summary: {
                total: orderIds.length,
                successful: results.length,
                failed: errors.length
            }
        };

    } catch (error) {
        console.error("Error in bulk order cancellation:", error);
        throw new Error(error instanceof Error ? error.message : "Failed to bulk cancel orders");
    }
} 