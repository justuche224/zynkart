"use client";

import { cn } from "@/lib/utils";
import { useMediaQuery } from "@react-hook/media-query";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { StoreSchema } from "@/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useTransition, useEffect } from "react";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Loader2, Plus, Crown, AlertTriangle } from "lucide-react";
import { FormError } from "@/components/ui/form-error";
import { FormSuccess } from "@/components/ui/form-success";
import { slugify } from "@/lib/utils";
import { createStore } from "@/actions/store";
import { useRouter } from "next/navigation";
import { useFeatureLimit } from "@/hooks/use-feature-limits";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function NewStore({
  merchantId,
  open,
  setOpen,
}: {
  merchantId: string;
  open: boolean;
  setOpen: (open: boolean) => void;
}) {
  const isDesktop = useMediaQuery("(min-width: 768px)");

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>New Store</DialogTitle>
            <DialogDescription>
              These details could be publicly available. Do not use your
              personal information.
            </DialogDescription>
          </DialogHeader>
          <ProfileForm merchantId={merchantId} />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle>New Store</DrawerTitle>
          <DrawerDescription>
            These details could be publicly available. Do not use your personal
            information.
          </DrawerDescription>
        </DrawerHeader>
        <ProfileForm className="px-4" merchantId={merchantId} />
        <DrawerFooter className="pt-2">
          <DrawerClose asChild>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

function ProfileForm({
  className,
  merchantId,
}: React.ComponentProps<"form"> & { merchantId: string }) {
  const form = useForm<z.infer<typeof StoreSchema>>({
    resolver: zodResolver(StoreSchema),
    defaultValues: {
      name: "",
      address: "",
      phone: "",
      email: "",
    },
  });

  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");
  const [slug, setSlug] = useState<string>("");
  const router = useRouter();

  // Check store creation limits
  const {
    allowed,
    loading: checkingLimits,
    limit,
    current,
    message,
    upgradeRequired,
    suggestedPlan,
  } = useFeatureLimit({
    userId: merchantId,
    featureKey: "stores_count",
    requestedAmount: 1,
  });

  const storeName = form.watch("name");
  useEffect(() => {
    setSlug(slugify(storeName));
  }, [storeName]);

  function onSubmit(values: z.infer<typeof StoreSchema>) {
    if (!allowed) {
      setError(
        message || "Store creation limit reached. Please upgrade your plan."
      );
      return;
    }

    setError(undefined);
    setSuccess(undefined);
    startTransition(async () => {
      const result = await createStore(merchantId, values);
      if ("data" in result) {
        setSuccess("Store Created, redirecting to dashboard...");
        router.push(`/merchant/stores/${result.data.slug}`);
      } else {
        setError(result.error);
      }
    });
  }
  if (checkingLimits) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">
            Checking store creation limits...
          </p>
        </div>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form
        className={cn("grid items-start gap-4", className)}
        onSubmit={form.handleSubmit(onSubmit)}
      >
        {/* Store limit warning */}
        {!allowed && (
          <Alert className="border-amber-200 bg-amber-50">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800">
              <div className="space-y-2">
                <p className="font-medium">
                  {message || "Store creation limit reached"}
                </p>
                {limit && current !== undefined && (
                  <p className="text-sm">
                    You have used {current} of{" "}
                    {limit === -1 ? "unlimited" : limit} allowed stores.
                  </p>
                )}
                {upgradeRequired && suggestedPlan && (
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => router.push("/pricing")}
                    className="bg-amber-600 hover:bg-amber-700 text-white"
                  >
                    <Crown className="h-4 w-4 mr-2" />
                    Upgrade to {suggestedPlan.toUpperCase()}
                  </Button>
                )}
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Usage meter for allowed users */}
        {allowed && limit && current !== undefined && limit > 0 && (
          <Alert className="border-blue-200 bg-blue-50">
            <AlertDescription className="text-blue-800">
              <div className="space-y-2">
                <p className="text-sm font-medium">
                  Store Usage: {current} of {limit} used
                </p>
                <div className="w-full bg-blue-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{ width: `${(current / limit) * 100}%` }}
                  />
                </div>
              </div>
            </AlertDescription>
          </Alert>
        )}

        <div className="grid gap-4">
          <FormField
            control={form.control}
            name="name"
            disabled={isPending}
            render={({ field }) => (
              <FormItem className="grid gap-2">
                <FormLabel htmlFor="store-name">Store Name</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    id="store-name"
                    type="text"
                    placeholder="My Store"
                    required
                  />
                </FormControl>
                <FormDescription>
                  {slug && `Store will be available at ${slug}.zynkart.io`}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="address"
            disabled={isPending}
            render={({ field }) => (
              <FormItem className="grid gap-2">
                <FormLabel htmlFor="address">Store contact address</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    id="address"
                    type="text"
                    placeholder="No 2, Somemething road, Some Place"
                    required
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            disabled={isPending}
            render={({ field }) => (
              <FormItem className="grid gap-2">
                <FormLabel htmlFor="email">Store email address</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    id="email"
                    type="text"
                    placeholder="store@provider.com"
                    required
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="phone"
            disabled={isPending}
            render={({ field }) => (
              <FormItem className="grid gap-2">
                <FormLabel htmlFor="phone">Store contect number</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    id="phone"
                    type="text"
                    placeholder="+2348000000"
                    required
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormError message={error} />
        <FormSuccess message={success} />
        <Button
          disabled={isPending || !allowed}
          type="submit"
          className="w-full"
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : !allowed ? (
            "Store Limit Reached"
          ) : (
            <>
              <Plus className="h-4 w-4" /> Create
            </>
          )}
        </Button>
      </form>
    </Form>
  );
}
