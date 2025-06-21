"use server"

import db from "@/db";
import { order } from "@/db/schema";
import { eq, and, inArray, sql, count, gte } from "drizzle-orm";
import { serverAuth } from "@/lib/server-auth";

export interface BulkUpdateStatusParams {
    orderIds: string[];
    storeId: string;
    paymentStatus?: "PENDING" | "PAID" | "FAILED" | "REFUNDED";
    fulfillmentStatus?: "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
}

export interface BulkOperationResult {
    success: boolean;
    message: string;
    results: Array<{
        orderId: string;
        success: boolean;
        error?: string;
    }>;
    summary: {
        total: number;
        successful: number;
        failed: number;
    };
}

/**
 * Bulk update order statuses
 */
export async function bulkUpdateOrderStatus(params: BulkUpdateStatusParams): Promise<BulkOperationResult> {
    const session = await serverAuth();
    if (!session?.user?.id) {
        throw new Error("Unauthorized");
    }

    try {
        const { orderIds, storeId, paymentStatus, fulfillmentStatus } = params;

        if (!orderIds?.length) {
            throw new Error("No order IDs provided");
        }

        if (!storeId) {
            throw new Error("Store ID is required");
        }

        if (!paymentStatus && !fulfillmentStatus) {
            throw new Error("At least one status update is required");
        }

        const existingOrders = await db
            .select({
                id: order.id,
                paymentStatus: order.paymentStatus,
                fulfillmentStatus: order.fulfillmentStatus,
            })
            .from(order)
            .where(and(
                inArray(order.id, orderIds),
                eq(order.storeId, storeId)
            ));

        const foundOrderIds = existingOrders.map(o => o.id);
        const notFoundOrders = orderIds.filter(id => !foundOrderIds.includes(id));

        const results: Array<{ orderId: string; success: boolean; error?: string }> = [];

        notFoundOrders.forEach(orderId => {
            results.push({
                orderId,
                success: false,
                error: "Order not found or access denied"
            });
        });

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
            }
        }

        if (foundOrderIds.length > 0) {
            await db
                .update(order)
                .set(updateData)
                .where(and(
                    inArray(order.id, foundOrderIds),
                    eq(order.storeId, storeId)
                ));

            foundOrderIds.forEach(orderId => {
                results.push({
                    orderId,
                    success: true
                });
            });
        }

        const successful = results.filter(r => r.success).length;
        const failed = results.filter(r => !r.success).length;

        return {
            success: true,
            message: `Updated ${successful} orders, ${failed} failed`,
            results,
            summary: {
                total: orderIds.length,
                successful,
                failed
            }
        };

    } catch (error) {
        console.error("Error in bulk status update:", error);
        throw new Error(error instanceof Error ? error.message : "Failed to bulk update order status");
    }
}

/**
 * Bulk mark orders as shipped
 */
export async function bulkMarkAsShipped(orderIds: string[], storeId: string): Promise<BulkOperationResult> {
    return bulkUpdateOrderStatus({
        orderIds,
        storeId,
        fulfillmentStatus: "SHIPPED"
    });
}

/**
 * Bulk mark orders as delivered
 */
export async function bulkMarkAsDelivered(orderIds: string[], storeId: string): Promise<BulkOperationResult> {
    return bulkUpdateOrderStatus({
        orderIds,
        storeId,
        fulfillmentStatus: "DELIVERED"
    });
}

/**
 * Bulk mark payment as received
 */
export async function bulkMarkPaymentReceived(orderIds: string[], storeId: string): Promise<BulkOperationResult> {
    return bulkUpdateOrderStatus({
        orderIds,
        storeId,
        paymentStatus: "PAID"
    });
}

/**
 * Archive old orders (mark them with a special status)
 */
export async function archiveOldOrders(storeId: string, daysBefore: number = 365) {
    const session = await serverAuth();
    if (!session?.user?.id) {
        throw new Error("Unauthorized");
    }

    try {
        if (!storeId) {
            throw new Error("Store ID is required");
        }

        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysBefore);

        const oldOrders = await db
            .select({ id: order.id })
            .from(order)
            .where(and(
                eq(order.storeId, storeId),
                eq(order.fulfillmentStatus, "DELIVERED"),
                sql`${order.deliveredAt} < ${cutoffDate}`
            ));

        if (oldOrders.length === 0) {
            return {
                success: true,
                message: "No orders to archive",
                archivedCount: 0
            };
        }

        return {
            success: true,
            message: `Found ${oldOrders.length} orders that could be archived`,
            archivedCount: oldOrders.length,
            orderIds: oldOrders.map(o => o.id)
        };

    } catch (error) {
        console.error("Error archiving old orders:", error);
        throw new Error(error instanceof Error ? error.message : "Failed to archive old orders");
    }
}

/**
 * Get bulk operation statistics
 */
export async function getBulkOperationStats(storeId: string, days: number = 30) {
    const session = await serverAuth();
    if (!session?.user?.id) {
        throw new Error("Unauthorized");
    }

    try {
        if (!storeId) {
            throw new Error("Store ID is required");
        }

        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);

        const stats = await db
            .select({
                totalOrders: count(),
                pendingOrders: sql<number>`COUNT(CASE WHEN ${order.paymentStatus} = 'PENDING' THEN 1 END)`,
                processingOrders: sql<number>`COUNT(CASE WHEN ${order.fulfillmentStatus} = 'PROCESSING' THEN 1 END)`,
                shippedOrders: sql<number>`COUNT(CASE WHEN ${order.fulfillmentStatus} = 'SHIPPED' THEN 1 END)`,
                needsTrackingOrders: sql<number>`COUNT(CASE WHEN ${order.fulfillmentStatus} = 'SHIPPED' AND ${order.trackingNumber} IS NULL THEN 1 END)`,
            })
            .from(order)
            .where(and(
                eq(order.storeId, storeId),
                gte(order.createdAt, cutoffDate)
            ));

        return {
            success: true,
            stats: stats[0],
            period: `Last ${days} days`,
            recommendations: [
                ...(stats[0].pendingOrders > 0 ? [`${stats[0].pendingOrders} orders need payment confirmation`] : []),
                ...(stats[0].processingOrders > 0 ? [`${stats[0].processingOrders} orders ready to ship`] : []),
                ...(stats[0].needsTrackingOrders > 0 ? [`${stats[0].needsTrackingOrders} shipped orders missing tracking numbers`] : []),
            ]
        };

    } catch (error) {
        console.error("Error getting bulk operation stats:", error);
        throw new Error(error instanceof Error ? error.message : "Failed to get bulk operation statistics");
    }
} 