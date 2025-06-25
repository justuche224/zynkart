"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
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
import { Switch } from "@/components/ui/switch";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { upsertFeatureLimit } from "@/actions/admin/feature-limits";
import { toast } from "sonner";
import type { FeatureLimit } from "@/services/feature-limit";

const formSchema = z.object({
  planType: z.enum(["free", "pro", "elite"]),
  featureKey: z.enum([
    "stores_count",
    "products_count",
    "custom_domain",
    "email_service",
    "zynkart_branding",
    "api_mode",
    "templates_access",
  ]),
  limitType: z.enum(["count", "monthly", "boolean"]),
  limitValue: z.coerce.number().int(),
  resetPeriod: z.enum(["daily", "monthly", "never"]),
  enabled: z.boolean(),
  description: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface EditFeatureLimitDialogProps {
  children: React.ReactNode;
  limit: FeatureLimit;
  onSuccess?: () => void;
}

export function EditFeatureLimitDialog({
  children,
  limit,
  onSuccess,
}: EditFeatureLimitDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      planType: limit.planType,
      featureKey: limit.featureKey,
      limitType: limit.limitType,
      limitValue: limit.limitValue,
      resetPeriod: limit.resetPeriod,
      enabled: limit.enabled,
      description: limit.description || "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    setLoading(true);
    try {
      const formData = new FormData();
      Object.entries(values).forEach(([key, value]) => {
        if (value !== undefined) {
          formData.append(key, value.toString());
        }
      });

      const result = await upsertFeatureLimit(formData);

      if (result.success) {
        toast.success(result.message);
        setOpen(false);
        onSuccess?.();
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to update feature limit");
    } finally {
      setLoading(false);
    }
  };

  const limitTypeOptions = [
    {
      value: "count",
      label: "Count",
      description: "Numeric limit (e.g., max 10 products)",
    },
    {
      value: "monthly",
      label: "Monthly",
      description: "Monthly reset limit (e.g., 500 emails/month)",
    },
    {
      value: "boolean",
      label: "Boolean",
      description: "True/false feature access",
    },
  ];

  const resetPeriodOptions = [
    { value: "never", label: "Never" },
    { value: "daily", label: "Daily" },
    { value: "monthly", label: "Monthly" },
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Feature Limit</DialogTitle>
          <DialogDescription>
            Update the feature limit for {limit.featureKey.replace(/_/g, " ")}{" "}
            on the {limit.planType} plan.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Read-only fields */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Plan Type
                </label>
                <div className="p-2 bg-muted rounded-md text-sm">
                  {limit.planType.toUpperCase()}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Feature
                </label>
                <div className="p-2 bg-muted rounded-md text-sm">
                  {limit.featureKey
                    .replace(/_/g, " ")
                    .replace(/\b\w/g, (l) => l.toUpperCase())}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="limitType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Limit Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select limit type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {limitTypeOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            <div>
                              <div className="font-medium">{option.label}</div>
                              <div className="text-xs text-muted-foreground">
                                {option.description}
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="limitValue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Limit Value</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="-1 for unlimited, 0 to disable"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      -1 = unlimited, 0 = disabled, positive = limit
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="resetPeriod"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reset Period</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select reset period" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {resetPeriodOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    How often the usage counter resets (for applicable limit
                    types)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="enabled"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Enabled</FormLabel>
                    <FormDescription>
                      Whether this feature limit is currently active
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Optional description for this feature limit"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Updating..." : "Update Feature Limit"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
