"use client";

import React, { useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import formatPrice from "@/lib/price-formatter";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { NIGERIA_STATES } from "@/lib/zones";
import { useRouter } from "next/navigation";
import { createShipingZone } from "@/actions/shipping/create";
import { ShipingZoneSchema } from "@/schemas";
import { FormError } from "@/components/ui/form-error";
import { FormSuccess } from "@/components/ui/form-success";
import { Button } from "@/components/ui/button";
import { SearchableSelect } from "@/components/ui/searchable-select";

// Create types from the data
type NigeriaState = keyof typeof NIGERIA_STATES;
// type NigeriaLGA = (typeof NIGERIA_STATES)[NigeriaState][number];

interface NewShippingAndDeliveryFormProps {
  merchantId: string;
  storeSlug: string;
}

const NewShippingAndDeliveryForm = ({
  merchantId,
  storeSlug,
}: NewShippingAndDeliveryFormProps) => {
  const [selectedState, setSelectedState] = React.useState<NigeriaState | "">(
    ""
  );
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  type NewProductFormInput = z.input<typeof ShipingZoneSchema>;
  type NewProductFormOutput = z.output<typeof ShipingZoneSchema>;

  const form = useForm<NewProductFormInput, any, NewProductFormOutput>({
    resolver: zodResolver(ShipingZoneSchema),
    defaultValues: {
      country: "Nigeria",
      state: "",
      area: "",
      shippingCost: undefined,
      minOrderAmount: undefined,
      maxOrderAmount: undefined,
      estimatedDays: undefined,
    },
  });
  // TODO isActive
  // TODO add wards
  const onSubmit = (data: NewProductFormOutput) => {
    setError("");
    setSuccess("");
    if (!data.shippingCost) {
      setError("Shipping cost is required");
      return;
    }

    startTransition(async () => {
      try {
        const result = await createShipingZone(data, merchantId, storeSlug);

        if (!result.success) {
          if (
            result.error?.message.includes(
              'duplicate key value violates unique constraint "shipping_zone_location_idx"'
            )
          ) {
            setError(
              "A shipping zone for this exact location already exists. Please visit the shipping zones page to update it if needed."
            );
            return;
          }
          setError(result.error?.message);
          return;
        }
        setSuccess("Shiping Zone created successfully!");
        form.reset();
        router.push(
          `/merchant/stores/${storeSlug}/settings/shipping-and-delivery`
        );
      } catch (error) {
        console.error(error);
        setError("Something went wrong. Please try again.");
      }
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="w-full max-w-3xl mx-auto p-4 pt-20 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Link
            href={`/merchant/stores/${storeSlug}/settings/shipping-and-delivery`}
            className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Shipping Zones
          </Link>
          <Card className="w-full">
            <CardHeader>
              <CardTitle>Shipping Zone Details</CardTitle>
              <CardDescription>
                Set up a new shipping zone for deliveries in Nigeria. You can
                create specific area zones (e.g., "Nsukka") and broader state
                zones (e.g., "Enugu") as fallbacks for unlisted areas.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-6"
                >
                  <FormField
                    control={form.control}
                    name="country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Country</FormLabel>
                        <FormControl>
                          <Select
                            defaultValue={field.value}
                            onValueChange={field.onChange}
                            disabled
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select country" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Nigeria">Nigeria</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {/* State Field */}
                  <FormField
                    control={form.control}
                    name="state"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>State</FormLabel>
                        <FormControl>
                          <SearchableSelect
                            value={field.value}
                            disabled={isPending}
                            onChange={(value) => {
                              field.onChange(value);
                              setSelectedState(value as NigeriaState);
                              // Reset LGA when state changes
                              form.setValue("area", "");
                            }}
                            placeholder="Select state"
                            searchPlaceholder="Search state..."
                            emptyMessage="No state found."
                            options={Object.keys(NIGERIA_STATES).map(
                              (state) => ({
                                value: state,
                                label: state,
                              })
                            )}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {/* LGA Field */}
                  <FormField
                    control={form.control}
                    name="area"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Local Government Area</FormLabel>
                        <FormControl>
                          <SearchableSelect
                            value={field.value}
                            onChange={field.onChange}
                            disabled={!selectedState || isPending}
                            placeholder="Select LGA"
                            searchPlaceholder="Search LGA..."
                            emptyMessage="No LGA found."
                            options={
                              selectedState
                                ? NIGERIA_STATES[selectedState].map((lga) => ({
                                    value: lga,
                                    label: lga,
                                  }))
                                : []
                            }
                          />
                        </FormControl>
                        <FormDescription>
                          Leave empty to create a state-wide zone that applies
                          to all areas in{" "}
                          {selectedState || "the selected state"} not
                          specifically listed
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {/* Shipping Cost */}
                  <FormField
                    control={form.control}
                    name="shippingCost"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Shipping Cost (₦)</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            disabled={isPending}
                            placeholder="Enter shipping cost"
                            type="number"
                            value={field.value === undefined ? "" : field.value}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value
                                  ? Number(e.target.value)
                                  : undefined
                              )
                            }
                          />
                        </FormControl>
                        <FormDescription>
                          {field.value && typeof field.value === "number"
                            ? formatPrice(field.value, "en-NG", "NGN")
                            : "Enter a valid cost"}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {/* TODO add remaining fields */}

                  <FormError message={error} />
                  <FormSuccess message={success} />
                  <div className="flex flex-col gap-4 sm:flex-row sm:justify-end">
                    <Button
                      type="button"
                      variant="outline"
                      disabled={isPending}
                      asChild
                    >
                      <Link
                        href={`/merchant/stores/${storeSlug}/settings/shipping-and-delivery`}
                      >
                        Cancel
                      </Link>
                    </Button>
                    <Button
                      disabled={isPending}
                      type="submit"
                      className="min-w-[120px]"
                    >
                      {isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        "Create Shipping Zone"
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default NewShippingAndDeliveryForm;
