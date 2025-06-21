"use server"

import { serverCustomerAuth } from "@/lib/server-auth"
import db from "@/db";
import { order, orderItem, product, productImage } from "@/db/schema";
import { eq, and, gte, lte, desc, asc, count, sql, ilike, or, inArray } from "drizzle-orm";

interface GetCustomerOrdersParams {
    storeId: string;
    page?: number;
    limit?: number;
    paymentStatus?: string;
    fulfillmentStatus?: string;
    minDate?: Date;
    maxDate?: Date;
    search?: string;
    sort?: string;
    orderBy?: "asc" | "desc";
}

interface CustomerOrderResult {
    id: string;
    paymentStatus: string;
    fulfillmentStatus: string;
    paymentReference: string;
    subtotal: number;
    total: number;
    shippingCost: number;
    shippingInfo: any;
    trackingNumber: string | null;
    shippingProvider: string | null;
    createdAt: Date;
    updatedAt: Date;
    shippedAt: Date | null;
    deliveredAt: Date | null;
    items: Array<{
        id: string;
        quantity: number;
        productName: string;
        variantDetails: string | null;
        price: number;
        product: {
            id: string;
            name: string;
            slug: string;
            image?: string;
        };
    }>;
}

interface GetCustomerOrdersResponse {
    orders: CustomerOrderResult[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
    };
    summary: {
        totalOrders: number;
        totalSpent: number;
        pendingOrders: number;
        completedOrders: number;
    };
}

export const getCustomerOrders = async (params: GetCustomerOrdersParams): Promise<GetCustomerOrdersResponse> => {
    const customer = await serverCustomerAuth();

    if (!customer) {
        throw new Error("Customer not authenticated");
    }

    try {
        const {
            storeId,
            page = 1,
            limit = 10,
            paymentStatus,
            fulfillmentStatus,
            minDate,
            maxDate,
            search,
            sort = "createdAt",
            orderBy = "desc"
        } = params;

        if (!storeId) {
            throw new Error("Store ID is required");
        }

        const pageNum = Math.max(1, page);
        const limitNum = Math.min(Math.max(1, limit), 50);
        const offset = (pageNum - 1) * limitNum;

        const whereConditions = [
            eq(order.storeId, storeId),
            eq(order.customerId, customer.id)
        ];

        if (paymentStatus && ["PENDING", "PAID", "FAILED", "REFUNDED"].includes(paymentStatus)) {
            whereConditions.push(eq(order.paymentStatus, paymentStatus as any));
        }

        if (fulfillmentStatus && ["PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"].includes(fulfillmentStatus)) {
            whereConditions.push(eq(order.fulfillmentStatus, fulfillmentStatus as any));
        }

        if (minDate) {
            whereConditions.push(gte(order.createdAt, minDate));
        }
        if (maxDate) {
            whereConditions.push(lte(order.createdAt, maxDate));
        }

        const buildSearchConditions = (baseConditions: any[]) => {
            if (search && search.trim()) {
                const searchTerm = `%${search.trim()}%`;
                return and(
                    ...baseConditions,
                    or(
                        ilike(order.paymentReference, searchTerm),
                        ilike(order.trackingNumber, searchTerm)
                    )
                );
            }
            return and(...baseConditions);
        };

        const validSortFields = ["createdAt", "updatedAt", "total", "paymentStatus", "fulfillmentStatus"];
        const sortField = validSortFields.includes(sort) ? sort : "createdAt";
        const sortDirection = orderBy === "asc" ? asc : desc;
        
        let orderByClause;
        switch (sortField) {
            case "createdAt":
                orderByClause = sortDirection(order.createdAt);
                break;
            case "updatedAt":
                orderByClause = sortDirection(order.updatedAt);
                break;
            case "total":
                orderByClause = sortDirection(order.total);
                break;
            case "paymentStatus":
                orderByClause = sortDirection(order.paymentStatus);
                break;
            case "fulfillmentStatus":
                orderByClause = sortDirection(order.fulfillmentStatus);
                break;
            default:
                orderByClause = sortDirection(order.createdAt);
        }

        const [totalResult] = await db
            .select({ count: count() })
            .from(order)
            .where(buildSearchConditions(whereConditions));

        const total = totalResult.count;
        const totalPages = Math.ceil(total / limitNum);

        const orders = await db
            .select({
                id: order.id,
                paymentStatus: order.paymentStatus,
                fulfillmentStatus: order.fulfillmentStatus,
                paymentReference: order.paymentReference,
                subtotal: order.subtotal,
                total: order.total,
                shippingCost: order.shippingCost,
                shippingInfo: order.shippingInfo,
                trackingNumber: order.trackingNumber,
                shippingProvider: order.shippingProvider,
                createdAt: order.createdAt,
                updatedAt: order.updatedAt,
                shippedAt: order.shippedAt,
                deliveredAt: order.deliveredAt,
            })
            .from(order)
            .where(buildSearchConditions(whereConditions))
            .orderBy(orderByClause)
            .limit(limitNum)
            .offset(offset);

        const orderIds = orders.map(o => o.id);
        let orderItemsMap: Record<string, Array<any>> = {};

        if (orderIds.length > 0) {
            const orderItemsResult = await db
                .select({
                    orderItem: {
                        id: orderItem.id,
                        orderId: orderItem.orderId,
                        quantity: orderItem.quantity,
                        productName: orderItem.productName,
                        variantDetails: orderItem.variantDetails,
                        price: orderItem.price,
                    },
                    product: {
                        id: product.id,
                        name: product.name,
                        slug: product.slug,
                    },
                    productImage: {
                        url: productImage.url,
                        alt: productImage.alt,
                    }
                })
                .from(orderItem)
                .leftJoin(product, eq(orderItem.productId, product.id))
                .leftJoin(productImage, and(
                    eq(productImage.productId, product.id),
                    eq(productImage.isDefault, true)
                ))
                .where(inArray(orderItem.orderId, orderIds));

            orderItemsMap = orderItemsResult.reduce((acc, item) => {
                const orderId = item.orderItem.orderId;
                if (!acc[orderId]) {
                    acc[orderId] = [];
                }
                acc[orderId].push({
                    id: item.orderItem.id,
                    quantity: item.orderItem.quantity,
                    productName: item.orderItem.productName,
                    variantDetails: item.orderItem.variantDetails,
                    price: item.orderItem.price,
                    product: {
                        id: item.product?.id || "",
                        name: item.product?.name || "",
                        slug: item.product?.slug || "",
                        image: item.productImage?.url || undefined,
                    }
                });
                return acc;
            }, {} as Record<string, Array<any>>);
        }

        const [summaryResult] = await db
            .select({
                totalOrders: count(),
                totalSpent: sql<number>`COALESCE(SUM(${order.total}), 0)`,
                pendingOrders: sql<number>`COUNT(CASE WHEN ${order.paymentStatus} = 'PENDING' THEN 1 END)`,
                completedOrders: sql<number>`COUNT(CASE WHEN ${order.paymentStatus} = 'PAID' AND ${order.fulfillmentStatus} = 'DELIVERED' THEN 1 END)`,
            })
            .from(order)
            .where(and(
                eq(order.storeId, storeId),
                eq(order.customerId, customer.id)
            ));

        const formattedOrders: CustomerOrderResult[] = orders.map(orderData => ({
            id: orderData.id,
            paymentStatus: orderData.paymentStatus,
            fulfillmentStatus: orderData.fulfillmentStatus,
            paymentReference: orderData.paymentReference,
            subtotal: orderData.subtotal,
            total: orderData.total,
            shippingCost: orderData.shippingCost,
            shippingInfo: orderData.shippingInfo,
            trackingNumber: orderData.trackingNumber,
            shippingProvider: orderData.shippingProvider,
            createdAt: orderData.createdAt,
            updatedAt: orderData.updatedAt,
            shippedAt: orderData.shippedAt,
            deliveredAt: orderData.deliveredAt,
            items: orderItemsMap[orderData.id] || []
        }));

        return {
            orders: formattedOrders,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                totalPages,
                hasNext: pageNum < totalPages,
                hasPrev: pageNum > 1,
            },
            summary: {
                totalOrders: Number(summaryResult.totalOrders),
                totalSpent: Number(summaryResult.totalSpent),
                pendingOrders: Number(summaryResult.pendingOrders),
                completedOrders: Number(summaryResult.completedOrders),
            }
        };

    } catch (error) {
        console.error("Error fetching customer orders:", error);
        throw new Error(error instanceof Error ? error.message : "Failed to get customer orders");
    }
}

/**
 * Get a single order for the authenticated customer
 */
export const getCustomerOrderById = async (orderId: string, storeId: string) => {
    const customer = await serverCustomerAuth();

    if (!customer) {
        throw new Error("Customer not authenticated");
    }

    try {
        if (!orderId || !storeId) {
            throw new Error("Order ID and Store ID are required");
        }

        const [orderResult] = await db
            .select({
                id: order.id,
                storeId: order.storeId,
                customerId: order.customerId,
                paymentStatus: order.paymentStatus,
                fulfillmentStatus: order.fulfillmentStatus,
                paymentReference: order.paymentReference,
                subtotal: order.subtotal,
                total: order.total,
                shippingCost: order.shippingCost,
                shippingInfo: order.shippingInfo,
                trackingNumber: order.trackingNumber,
                shippingProvider: order.shippingProvider,
                createdAt: order.createdAt,
                updatedAt: order.updatedAt,
                shippedAt: order.shippedAt,
                deliveredAt: order.deliveredAt,
            })
            .from(order)
            .where(and(
                eq(order.id, orderId),
                eq(order.storeId, storeId),
                eq(order.customerId, customer.id)
            ));

        if (!orderResult) {
            throw new Error("Order not found or access denied");
        }

        const orderItemsResult = await db
            .select({
                orderItem: {
                    id: orderItem.id,
                    quantity: orderItem.quantity,
                    productName: orderItem.productName,
                    variantDetails: orderItem.variantDetails,
                    price: orderItem.price,
                },
                product: {
                    id: product.id,
                    name: product.name,
                    slug: product.slug,
                    description: product.description,
                },
                productImage: {
                    url: productImage.url,
                    alt: productImage.alt,
                }
            })
            .from(orderItem)
            .leftJoin(product, eq(orderItem.productId, product.id))
            .leftJoin(productImage, and(
                eq(productImage.productId, product.id),
                eq(productImage.isDefault, true)
            ))
            .where(eq(orderItem.orderId, orderId));

        return {
            id: orderResult.id,
            storeId: orderResult.storeId,
            customerId: orderResult.customerId,
            paymentStatus: orderResult.paymentStatus,
            fulfillmentStatus: orderResult.fulfillmentStatus,
            paymentReference: orderResult.paymentReference,
            subtotal: orderResult.subtotal,
            total: orderResult.total,
            shippingCost: orderResult.shippingCost,
            shippingInfo: orderResult.shippingInfo,
            trackingNumber: orderResult.trackingNumber,
            shippingProvider: orderResult.shippingProvider,
            createdAt: orderResult.createdAt,
            updatedAt: orderResult.updatedAt,
            shippedAt: orderResult.shippedAt,
            deliveredAt: orderResult.deliveredAt,
            items: orderItemsResult.map(item => ({
                id: item.orderItem.id,
                quantity: item.orderItem.quantity,
                productName: item.orderItem.productName,
                variantDetails: item.orderItem.variantDetails,
                price: item.orderItem.price,
                product: {
                    id: item.product?.id || "",
                    name: item.product?.name || "",
                    slug: item.product?.slug || "",
                    description: item.product?.description || "",
                    image: item.productImage?.url || undefined,
                }
            }))
        };

    } catch (error) {
        console.error("Error fetching customer order:", error);
        throw new Error(error instanceof Error ? error.message : "Failed to get order");
    }
}

/**
 * Check if customer can reorder (all items still available)
 */
export const canReorder = async (orderId: string, storeId: string) => {
    const customer = await serverCustomerAuth();

    if (!customer) {
        throw new Error("Customer not authenticated");
    }

    try {
        if (!orderId || !storeId) {
            throw new Error("Order ID and Store ID are required");
        }

        const [orderExists] = await db
            .select({ id: order.id })
            .from(order)
            .where(and(
                eq(order.id, orderId),
                eq(order.storeId, storeId),
                eq(order.customerId, customer.id)
            ));

        if (!orderExists) {
            throw new Error("Order not found or access denied");
        }

        const orderItemsCheck = await db
            .select({
                orderItemId: orderItem.id,
                productId: orderItem.productId,
                quantity: orderItem.quantity,
                productStatus: product.status,
                productInStock: product.inStock,
            })
            .from(orderItem)
            .leftJoin(product, eq(orderItem.productId, product.id))
            .where(eq(orderItem.orderId, orderId));

        const unavailableItems = orderItemsCheck.filter(item => 
            !item.productStatus || 
            item.productStatus !== "ACTIVE" || 
            !item.productInStock || 
            item.productInStock < item.quantity
        );

        return {
            canReorder: unavailableItems.length === 0,
            unavailableItems: unavailableItems.map(item => ({
                productId: item.productId,
                reason: !item.productStatus || item.productStatus !== "ACTIVE" 
                    ? "Product no longer available" 
                    : "Insufficient stock"
            }))
        };

    } catch (error) {
        console.error("Error checking reorder possibility:", error);
        throw new Error(error instanceof Error ? error.message : "Failed to check reorder status");
    }
}