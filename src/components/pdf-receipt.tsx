"use client";

import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  PDFDownloadLink,
} from "@react-pdf/renderer";
import { Button } from "@/components/ui/button";
import { Download, FileText } from "lucide-react";
import formatPrice from "@/lib/price-formatter";

interface OrderItem {
  id: string;
  quantity: number;
  productName: string;
  variantDetails: string | null;
  price: number;
  product: {
    id: string;
    name: string;
    slug: string;
  };
}

interface OrderData {
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
  customer: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
  };
  items: OrderItem[];
}

interface StoreData {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logo?: string;
}

const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#FFFFFF",
    padding: 30,
    fontFamily: "Helvetica",
  },
  header: {
    marginBottom: 20,
    paddingBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: "#000000",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#000000",
  },
  storeName: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
    color: "#2563eb",
  },
  section: {
    marginBottom: 15,
    paddingBottom: 10,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#374151",
    textTransform: "uppercase",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  label: {
    fontSize: 11,
    color: "#6b7280",
    fontWeight: "bold",
  },
  value: {
    fontSize: 11,
    color: "#000000",
  },
  itemsTable: {
    marginTop: 10,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f3f4f6",
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#d1d5db",
  },
  tableRow: {
    flexDirection: "row",
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  tableCell: {
    fontSize: 10,
    color: "#000000",
  },
  tableCellHeader: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#374151",
  },
  productCol: { width: "40%" },
  quantityCol: { width: "15%" },
  priceCol: { width: "20%" },
  totalCol: { width: "25%" },
  totalSection: {
    marginTop: 20,
    paddingTop: 15,
    borderTopWidth: 2,
    borderTopColor: "#000000",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  totalLabel: {
    fontSize: 12,
    color: "#374151",
  },
  totalValue: {
    fontSize: 12,
    color: "#000000",
  },
  grandTotal: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#d1d5db",
  },
  grandTotalLabel: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#000000",
  },
  grandTotalValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#000000",
  },
  footer: {
    marginTop: 30,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    textAlign: "center",
  },
  footerText: {
    fontSize: 10,
    color: "#6b7280",
  },
  addressSection: {
    marginTop: 15,
  },
  addressText: {
    fontSize: 11,
    color: "#000000",
    marginBottom: 3,
  },
  statusBadge: {
    padding: 4,
    borderRadius: 4,
    fontSize: 10,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 5,
  },
  paidStatus: {
    backgroundColor: "#dcfce7",
    color: "#166534",
  },
  pendingStatus: {
    backgroundColor: "#fef3c7",
    color: "#92400e",
  },
  refundedStatus: {
    backgroundColor: "#fee2e2",
    color: "#991b1b",
  },
});

const ReceiptDocument = ({
  order,
  store,
  watermark,
}: {
  order: OrderData;
  store: StoreData;
  watermark?: string;
}) => (
  <Document>
    {/* Watermark - positioned behind content */}
    {watermark && (
      <Text
        fixed
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%) rotate(-45deg)",
          fontSize: 48,
          color: "rgba(0, 0, 0, 0.08)",
          fontWeight: "bold",
          zIndex: -1,
          textAlign: "center",
        }}
      >
        {watermark}
      </Text>
    )}

    <Page size="A4" style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>RECEIPT</Text>
        <Text style={styles.storeName}>{store.name}</Text>
        <Text style={styles.value}>Order #{order.paymentReference}</Text>
      </View>

      {/* Order Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Order Information</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Order ID:</Text>
          <Text style={styles.value}>#{order.paymentReference}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Order Date:</Text>
          <Text style={styles.value}>
            {new Date(order.createdAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Payment Status:</Text>
          <Text
            style={{
              ...styles.value,
              ...(order.paymentStatus === "PAID" && styles.paidStatus),
              ...(order.paymentStatus === "PENDING" && styles.pendingStatus),
              ...(order.paymentStatus === "REFUNDED" && styles.refundedStatus),
            }}
          >
            {order.paymentStatus}
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Fulfillment Status:</Text>
          <Text style={styles.value}>{order.fulfillmentStatus}</Text>
        </View>
        {order.trackingNumber && (
          <View style={styles.row}>
            <Text style={styles.label}>Tracking Number:</Text>
            <Text style={styles.value}>{order.trackingNumber}</Text>
          </View>
        )}
      </View>

      {/* Customer Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Customer Information</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Name:</Text>
          <Text style={styles.value}>{order.customer.name}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Email:</Text>
          <Text style={styles.value}>{order.customer.email}</Text>
        </View>
        {order.customer.phone && (
          <View style={styles.row}>
            <Text style={styles.label}>Phone:</Text>
            <Text style={styles.value}>{order.customer.phone}</Text>
          </View>
        )}
      </View>

      {/* Shipping Information */}
      {order.shippingInfo && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Shipping Address</Text>
          <Text style={styles.addressText}>{order.shippingInfo.address}</Text>
          <Text style={styles.addressText}>
            {order.shippingInfo.area}, {order.shippingInfo.state}
          </Text>
          <Text style={styles.addressText}>{order.shippingInfo.country}</Text>
          {order.shippingInfo.phoneNumber && (
            <Text style={styles.addressText}>
              Phone: {order.shippingInfo.phoneNumber}
            </Text>
          )}
        </View>
      )}

      {/* Order Items */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Order Items</Text>
        <View style={styles.itemsTable}>
          {/* Table Header */}
          <View style={styles.tableHeader}>
            <Text style={[styles.tableCellHeader, styles.productCol]}>
              Product
            </Text>
            <Text style={[styles.tableCellHeader, styles.quantityCol]}>
              Qty
            </Text>
            <Text style={[styles.tableCellHeader, styles.priceCol]}>Price</Text>
            <Text style={[styles.tableCellHeader, styles.totalCol]}>Total</Text>
          </View>

          {/* Table Rows */}
          {order.items.map((item, index) => (
            <View key={item.id} style={styles.tableRow}>
              <View style={styles.productCol}>
                <Text style={styles.tableCell}>{item.productName}</Text>
                {item.variantDetails && (
                  <Text
                    style={[
                      styles.tableCell,
                      { fontSize: 9, color: "#6b7280" },
                    ]}
                  >
                    {item.variantDetails}
                  </Text>
                )}
              </View>
              <Text style={[styles.tableCell, styles.quantityCol]}>
                {item.quantity}
              </Text>
              <Text style={[styles.tableCell, styles.priceCol]}>
                {formatPrice(item.price)}
              </Text>
              <Text style={[styles.tableCell, styles.totalCol]}>
                {formatPrice(item.price * item.quantity)}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* Order Totals */}
      <View style={styles.totalSection}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Subtotal:</Text>
          <Text style={styles.totalValue}>{formatPrice(order.subtotal)}</Text>
        </View>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Shipping:</Text>
          <Text style={styles.totalValue}>
            {formatPrice(order.shippingCost)}
          </Text>
        </View>
        <View style={styles.grandTotal}>
          <Text style={styles.grandTotalLabel}>TOTAL:</Text>
          <Text style={styles.grandTotalValue}>{formatPrice(order.total)}</Text>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Thank you for your business! For any questions, please contact{" "}
          {store.name}.
        </Text>
        <Text style={styles.footerText}>
          Generated on{" "}
          {new Date().toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </Text>
      </View>
    </Page>
  </Document>
);

interface PDFReceiptProps {
  order: OrderData;
  store: StoreData;
  variant?: "button" | "link";
  size?: "sm" | "default" | "lg";
  className?: string;
  watermark?: string;
}

export const PDFReceipt = ({
  order,
  store,
  variant = "button",
  size = "default",
  className = "",
  watermark,
}: PDFReceiptProps) => {
  const filename = `receipt-${order.paymentReference}-${
    new Date().toISOString().split("T")[0]
  }.pdf`;

  return (
    <PDFDownloadLink
      document={
        <ReceiptDocument order={order} store={store} watermark={watermark} />
      }
      fileName={filename}
    >
      {({ blob, url, loading, error }) => {
        // TODO: Remove this
        console.log(blob, url);
        if (variant === "link") {
          return (
            <span
              className={`inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 cursor-pointer ${className}`}
            >
              {loading ? (
                <>
                  <FileText className="h-4 w-4 animate-spin" />
                  Preparing PDF...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  Download Receipt (PDF)
                </>
              )}
            </span>
          );
        }

        return (
          <Button
            variant="outline"
            size={size}
            disabled={loading || !!error}
            className={className}
          >
            {loading ? (
              <>
                <FileText className="mr-2 h-4 w-4 animate-spin" />
                Preparing PDF...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Download Receipt (PDF)
              </>
            )}
          </Button>
        );
      }}
    </PDFDownloadLink>
  );
};

export default PDFReceipt;
