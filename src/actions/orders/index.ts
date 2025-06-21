// Order retrieval functions
export {
    getStoreOrders,
    getOrderById,
    getOrderStats,
    getRecentOrders
} from "./get";

// Order status update functions
export {
    updateOrderStatus,
    updatePaymentStatus,
    updateFulfillmentStatus
} from "./update-status";

// Order tracking functions
export {
    updateTrackingInfo,
    addTrackingNumber,
    removeTrackingInfo,
    bulkUpdateTracking
} from "./update-tracking";

// Order cancellation and refund functions
export {
    cancelOrder,
    refundOrder,
    quickCancelOrder,
    processFullRefund,
    bulkCancelOrders
} from "./cancel-refund";

// Order export functions
export {
    exportOrders,
    exportOrdersByDateRange,
    exportOrdersByStatus,
    exportRecentOrders
} from "./export";

// Bulk operation functions
export {
    bulkUpdateOrderStatus,
    bulkMarkAsShipped,
    bulkMarkAsDelivered,
    bulkMarkPaymentReceived,
    archiveOldOrders,
    getBulkOperationStats
} from "./bulk-operations";

// Type exports for better developer experience
export type {
    GetStoreOrdersParams,
    OrderResult,
    GetStoreOrdersResponse
} from "./get";

export type {
    UpdateOrderStatusParams
} from "./update-status";

export type {
    UpdateTrackingInfoParams
} from "./update-tracking";

export type {
    CancelOrderParams,
    RefundOrderParams
} from "./cancel-refund";

export type {
    ExportOrdersParams,
    ExportOrderData
} from "./export";

export type {
    BulkUpdateStatusParams,
    BulkOperationResult
} from "./bulk-operations"; 