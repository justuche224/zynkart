"use client";

import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import type {
  ShippingZonesFromStore,
  StoreDataFromHomePage,
} from "@/lib/store-utils";
import { useCartStore } from "@/store/cart";
import { useState, useTransition } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Separator } from "../ui/separator";
import formatPrice from "@/lib/price-formatter";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { orderInfoSchema } from "@/schemas";
import { toast } from "sonner";

const checkoutSchema = z.object({
  address: z.string().min(1, "Address is required"),
  primaryPhone: z.string().min(1, "Phone number is required"),
  secondaryPhone: z.string().optional(),
  additionalInfo: z.string().optional(),
});

export default function Checkout({
  shippingZones,
  customer,
  cardBg,
  store,
}: {
  shippingZones: ShippingZonesFromStore;
  cardBg?: string;
  store: StoreDataFromHomePage;
  customer: {
    id: string;
    name: string;
    email: string;
  };
}) {
  const { items, clearCart } = useCartStore();
  const [selectedZoneId, setSelectedZoneId] = useState<string | undefined>();
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof checkoutSchema>>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      address: "",
      primaryPhone: "",
      secondaryPhone: "",
      additionalInfo: "",
    },
  });

  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const selectedZone = shippingZones.find((zone) => zone.id === selectedZoneId);
  const shippingFee = selectedZone ? selectedZone.shippingCost : 0;
  const total = subtotal + shippingFee;

  async function onSubmit(values: z.infer<typeof checkoutSchema>) {
    const orderInfo: z.infer<typeof orderInfoSchema> = {
      customerId: customer.id,
      storeSlug: store.slug,
      storeId: store.id,
      subtotal,
      shippingCost: shippingFee,
      totalAmount: subtotal + shippingFee,
      shippingInfo: {
        address: values.address,
        area: selectedZone?.area || "",
        state: selectedZone?.state || "",
        country: selectedZone?.country || "",
        phoneNumber: values.primaryPhone,
        secondaryPhoneNumber: values.secondaryPhone || undefined,
        additionalInfo: values.additionalInfo || undefined,
      },
      items: items.map((item) => ({
        productId: item.id,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        //   variantId: item?.variantId || undefined,
      })),
    };

    console.log(orderInfo);
    startTransition(async () => {
      const response = await fetch("/api/store/order", {
        method: "POST",
        body: JSON.stringify(orderInfo),
      });

      if (!response.ok) {
        const errorData = await response.text();
        toast.error(errorData || "Failed to create order");
        return;
      }

      const data = await response.json();

      if (data.authorization_url) {
        toast.success("Order placed successfully", {
          description: "You will be redirected to the payment page shortly.",
        });
        clearCart();
        window.location.href = data.authorization_url;
      } else {
        toast.error(
          data.message || "Payment initialization failed. Please try again."
        );
      }
    });
  }

  return (
    <section className="container mx-auto py-8 px-4 md:px-6">
      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <Card className={cn(cardBg)}>
            <CardHeader>
              <CardTitle>Shipping Zone</CardTitle>
              <CardDescription className="font-semibold">
                Select the location most specific to your shipping
                address/location.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {shippingZones.length > 0 ? (
                <Select
                  onValueChange={setSelectedZoneId}
                  value={selectedZoneId}
                  disabled={isPending}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a shipping zone" />
                  </SelectTrigger>
                  <SelectContent>
                    {shippingZones.map((zone) => (
                      <SelectItem key={zone.id} value={zone.id}>
                        {zone.area ? `${zone.area}, ` : ""}
                        {zone.state ? `${zone.state}, ` : ""}
                        {zone.country} - {formatPrice(zone.shippingCost)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="text-center p-4 border rounded-md bg-muted/20">
                  <p className="text-muted-foreground">
                    This store does not currently ship to any locations.
                  </p>
                  <Button variant="link" asChild>
                    <Link href="/message">
                      Contact store to request shipping
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex flex-col gap-y-1">
              <h2 className="text-sm text-muted-foreground">
                Can&apos;t find your location?
              </h2>
              <Button variant="link" asChild>
                <Link href="/message">
                  Contact store to request shipping to your location
                </Link>
              </Button>
            </CardFooter>
          </Card>
          <Card className={cn(cardBg)}>
            <CardHeader>
              <CardTitle>Shipping Information</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4"
                >
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Address</FormLabel>
                        <FormControl>
                          <Textarea
                            disabled={isPending}
                            placeholder="123 Main St, Anytown, USA"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="primaryPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Primary Phone Number</FormLabel>
                        <FormControl>
                          <Input
                            disabled={isPending}
                            type="tel"
                            placeholder="+1234567890"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="secondaryPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Secondary Phone Number (Optional)</FormLabel>
                        <FormControl>
                          <Input
                            disabled={isPending}
                            type="tel"
                            placeholder="+0987654321"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="additionalInfo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Additional Information (Optional)</FormLabel>
                        <FormControl>
                          <Textarea
                            disabled={isPending}
                            placeholder="Additional information"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className={cn(cardBg)}>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between items-center"
                  >
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Quantity: {item.quantity}
                      </p>
                    </div>
                    <p>{formatPrice(item.price * item.quantity)}</p>
                  </div>
                ))}
              </div>
              <Separator />
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>{formatPrice(shippingFee)}</span>
                </div>
              </div>
              <Separator />
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
            </CardContent>
          </Card>
          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={!selectedZoneId || !form.formState.isValid || isPending}
            onClick={form.handleSubmit(onSubmit)}
          >
            Place Order
          </Button>
          <p className="text-sm text-muted-foreground font-semibold">
            You will be redirected to the payment page after placing your order.
          </p>
        </div>
      </div>
    </section>
  );
}
