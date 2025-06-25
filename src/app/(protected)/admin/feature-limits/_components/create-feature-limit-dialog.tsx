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

interface CreateFeatureLimitDialogProps {
  children: React.ReactNode;
  onSuccess?: () => void;
}

export function CreateFeatureLimitDialog({
  children,
  onSuccess,
}: CreateFeatureLimitDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      planType: "free",
      featureKey: "stores_count",
      limitType: "count",
      limitValue: 1,
      resetPeriod: "never",
      enabled: true,
      description: "",
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
        form.reset();
        onSuccess?.();
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to create feature limit");
    } finally {
      setLoading(false);
    }
  };

  const featureOptions = [
    { value: "stores_count", label: "Stores Count" },
    { value: "products_count", label: "Products Count" },
    { value: "custom_domain", label: "Custom Domain" },
    { value: "email_service", label: "Email Service" },
    { value: "zynkart_branding", label: "Zynkart Branding" },
    { value: "api_mode", label: "API Mode" },
    { value: "templates_access", label: "Templates Access" },
  ];

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
          <DialogTitle>Create Feature Limit</DialogTitle>
          <DialogDescription>
            Configure a new feature limit for a specific plan type. Use -1 for
            unlimited access, 0 to disable the feature.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="planType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Plan Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select plan type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="free">Free</SelectItem>
                        <SelectItem value="pro">Pro</SelectItem>
                        <SelectItem value="elite">Elite</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="featureKey"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Feature</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select feature" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {featureOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
                {loading ? "Creating..." : "Create Feature Limit"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
