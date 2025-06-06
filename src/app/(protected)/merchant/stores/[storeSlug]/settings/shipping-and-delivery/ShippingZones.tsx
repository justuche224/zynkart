"use client";

import { motion } from "framer-motion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import formatPrice from "@/lib/price-formatter";
import { ShippingZone } from "@/types";
import { Loader2, Trash2 } from "lucide-react";
import { deleteShippingZone } from "@/actions/shipping/delete";
import { useState } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface ShippingZonesProps {
  shipingZones: ShippingZone[];
  storeSlug: string;
  merchantId: string;
}

const ShippingZones = ({
  shipingZones,
  storeSlug,
  merchantId,
}: ShippingZonesProps) => {
  const [deleting, setDeleting] = useState<string | null>(null);
  const [initialShipingZones, setInitialShipingZones] =
    useState<ShippingZone[]>(shipingZones);

  const handleDeleteShippingZone = async (shippingZoneId: string) => {
    try {
      setDeleting(shippingZoneId);
      const { error } = await deleteShippingZone(
        shippingZoneId,
        storeSlug,
        merchantId
      );
      if (error) {
        toast.error(error);
      } else {
        setDeleting(null);
        toast.success("Shipping zone deleted successfully");
        setInitialShipingZones(
          initialShipingZones.filter((zone) => zone.id !== shippingZoneId)
        );
      }
    } catch (error) {
      console.error(`[DELETE SHIPPING ZONE ERROR] ${error}`);
      toast.error("Failed to delete shipping zone");
    } finally {
      setDeleting(null);
    }
  };

  const tableAnimation = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1,
      },
    },
  };

  const rowAnimation = {
    hidden: { opacity: 0, x: -20 },
    show: { opacity: 1, x: 0 },
  };

  return (
    <div className="mt-20 w-full px-5 max-w-7xl mx-auto">
      <Card className="bg-sidebar shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold flex justify-between items-center">
            <span>Shipping Zones</span>
            <Link
              href={`/merchant/stores/${storeSlug}/settings/shipping-and-delivery/new`}
            >
              <Button>New Zone</Button>
            </Link>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <motion.div
            initial="hidden"
            animate="show"
            variants={tableAnimation}
            className="overflow-x-auto"
          >
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Location</TableHead>
                  <TableHead>Zone Type</TableHead>
                  <TableHead>Shipping Cost</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Order Amount</TableHead>
                  <TableHead>Estimated Days</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {initialShipingZones.map((zone) => (
                  <motion.tr
                    key={zone.id}
                    variants={rowAnimation}
                    className="hover:bg-accent"
                  >
                    <TableCell className="font-medium">
                      <div className="flex flex-col">
                        <span>{zone.country}</span>
                        <span className="text-sm text-gray-500">
                          {zone.state && zone.area
                            ? `${zone.state}, ${zone.area}`
                            : zone.state
                            ? `${zone.state} (State-wide)`
                            : "Country-wide"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{zone.zoneType}</Badge>
                    </TableCell>
                    <TableCell>
                      {zone.shippingCost === 0 ? (
                        <Badge variant="default">Free Shipping</Badge>
                      ) : (
                        formatPrice(zone.shippingCost, "en-NG", "NGN")
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={zone.isActive ? "default" : "destructive"}
                      >
                        {zone.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {zone.minOrderAmount || zone.maxOrderAmount ? (
                        <span>
                          {zone.minOrderAmount &&
                            `Min: ${formatPrice(
                              zone.minOrderAmount,
                              "en-NG",
                              "NGN"
                            )}`}
                          {zone.maxOrderAmount &&
                            `Max: ${formatPrice(
                              zone.maxOrderAmount,
                              "en-NG",
                              "NGN"
                            )}`}
                        </span>
                      ) : (
                        <span className="text-gray-500">No limits</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {zone.estimatedDays ? (
                        `${zone.estimatedDays} days`
                      ) : (
                        <span className="text-gray-500">Not specified</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="destructive"
                            disabled={deleting !== null}
                            size="icon"
                          >
                            {deleting === zone.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Are you absolutely sure?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will
                              permanently delete this shipping zone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => {
                                handleDeleteShippingZone(zone.id);
                              }}
                            >
                              Continue
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </motion.tr>
                ))}
              </TableBody>
            </Table>
          </motion.div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ShippingZones;
