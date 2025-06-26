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

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { SearchableSelect } from "@/components/ui/searchable-select";

import type {
  ShippingZonesFromStore,
  StoreDataFromHomePage,
} from "@/lib/store-utils";
import { useCartStore } from "@/store/cart";
import { useState, useTransition, useEffect } from "react";
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
import SavedAddresses from "./saved-addresses";
import {
  getSavedAddresses,
  createSavedAddress,
} from "@/actions/customers/saved-addresses";

const checkoutSchema = z.object({
  address: z.string().min(1, "Address is required"),
  primaryPhone: z.string().min(1, "Phone number is required"),
  secondaryPhone: z.string().optional(),
  additionalInfo: z.string().optional(),
  saveAddress: z.boolean(),
  addressLabel: z.string().optional(),
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
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const [selectedSavedAddress, setSelectedSavedAddress] = useState<
    string | undefined
  >();
  const [showSavedAddresses, setShowSavedAddresses] = useState(true);

  const form = useForm<z.infer<typeof checkoutSchema>>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      address: "",
      primaryPhone: "",
      secondaryPhone: "",
      additionalInfo: "",
      saveAddress: false,
      addressLabel: "",
    },
  });

  useEffect(() => {
    async function loadSavedAddresses() {
      const result = await getSavedAddresses();
      if (result.success && result.data) {
        setSavedAddresses(result.data);
        const defaultAddress = result.data.find((addr: any) => addr.isDefault);
        if (defaultAddress) {
          setSelectedSavedAddress(defaultAddress.id);
          form.setValue("address", defaultAddress.address);
          form.setValue("primaryPhone", defaultAddress.primaryPhone);
          form.setValue("secondaryPhone", defaultAddress.secondaryPhone || "");
          form.setValue("additionalInfo", defaultAddress.additionalInfo || "");
        }
      }
    }
    loadSavedAddresses();
  }, [form]);

  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const shippingZoneOptions = shippingZones.map((zone) => ({
    value: zone.id,
    label: `${zone.area ? `${zone.area}, ` : ""}${
      zone.state ? `${zone.state}, ` : ""
    }${zone.country} - ${formatPrice(zone.shippingCost)}`,
  }));

  const selectedZone = shippingZones.find((zone) => zone.id === selectedZoneId);
  const shippingFee = selectedZone ? selectedZone.shippingCost : 0;
  const total = subtotal + shippingFee;

  const handleSavedAddressSelect = (address: any) => {
    setSelectedSavedAddress(address.id);
    form.setValue("address", address.address);
    form.setValue("primaryPhone", address.primaryPhone);
    form.setValue("secondaryPhone", address.secondaryPhone || "");
    form.setValue("additionalInfo", address.additionalInfo || "");
    setShowSavedAddresses(false);
  };

  async function onSubmit(values: z.infer<typeof checkoutSchema>) {
    if (values.saveAddress && values.addressLabel) {
      const addressData = {
        label: values.addressLabel,
        address: values.address,
        primaryPhone: values.primaryPhone,
        secondaryPhone: values.secondaryPhone || "",
        additionalInfo: values.additionalInfo || "",
        isDefault: savedAddresses.length === 0,
      };

      const saveResult = await createSavedAddress(addressData);
      if (saveResult.success) {
        toast.success("Address saved for future use");
      }
    }

    const orderInfo: z.infer<typeof orderInfoSchema> = {
      customerId: customer.id,
      storeSlug: store.slug,
      storeId: store.id,
      subtotal,
      shippingCost: shippingFee,
      totalAmount: subtotal + shippingFee,
      shippingInfo: {
        address: values.address,
        area: selectedZone?.area || undefined,
        state: selectedZone?.state || undefined,
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
    <section className="container mx-auto py-8 md:px-6 mt-10">
      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-6">
          {savedAddresses.length > 0 && showSavedAddresses && (
            <SavedAddresses
              addresses={savedAddresses}
              onSelectAddress={handleSavedAddressSelect}
              selectedAddressId={selectedSavedAddress}
              cardBg={cardBg}
            />
          )}

          {showSavedAddresses && savedAddresses.length > 0 && (
            <div className="text-center">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowSavedAddresses(false)}
              >
                Enter New Address
              </Button>
            </div>
          )}

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
                <SearchableSelect
                  options={shippingZoneOptions}
                  value={selectedZoneId}
                  onChange={setSelectedZoneId}
                  placeholder="Select a shipping zone"
                  searchPlaceholder="Search shipping zones..."
                  emptyMessage="No shipping zones found"
                  disabled={isPending}
                />
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
          {(!showSavedAddresses || savedAddresses.length === 0) && (
            <Card className={cn(cardBg)}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Shipping Information</CardTitle>
                  {savedAddresses.length > 0 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowSavedAddresses(true)}
                    >
                      Use Saved Address
                    </Button>
                  )}
                </div>
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
                          <FormLabel>
                            Secondary Phone Number (Optional)
                          </FormLabel>
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
                          <FormLabel>
                            Additional Information (Optional)
                          </FormLabel>
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

                    {/* Save Address Option */}
                    <FormField
                      control={form.control}
                      name="saveAddress"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              disabled={isPending}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>
                              Save this address for future use
                            </FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />

                    {form.watch("saveAddress") && (
                      <FormField
                        control={form.control}
                        name="addressLabel"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Address Label</FormLabel>
                            <FormControl>
                              <Input
                                disabled={isPending}
                                placeholder="e.g., Home, Work, Office"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </form>
                </Form>
              </CardContent>
            </Card>
          )}
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
                  <span>Shipping Fee</span>
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
