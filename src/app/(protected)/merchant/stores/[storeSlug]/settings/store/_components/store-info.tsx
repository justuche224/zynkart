"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { updateStore } from "@/actions/store";
import { toast } from "sonner";

const StoreInfo = ({
  storeInfo,
}: {
  storeInfo: {
    name: string;
    description: string | null;
    phone: string;
    email: string;
    address: string;
    slug: string;
    id: string;
  };
}) => {
  const [editMode, setEditMode] = useState(false);
  const [isPending, startTransition] = useTransition();

  const formSchema = z.object({
    name: z.string().min(1),
    description: z.string().optional(),
    phone: z.string().min(1),
    email: z.string().email(),
    address: z.string().min(1),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: storeInfo.name,
      description: storeInfo.description || "",
      phone: storeInfo.phone,
      email: storeInfo.email,
      address: storeInfo.address,
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    startTransition(async () => {
      const result = await updateStore(storeInfo.id, values);
      if (result.error) toast.error(result.error);
      else toast.success("Store updated successfully");
      setEditMode(false);
      //   form.reset();
    });
  }
  return (
    <Card className="flex flex-col gap-4">
      <CardHeader>
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Store Information</h2>
          <Button
            variant="outline"
            onClick={() => {
              if (editMode) {
                form.handleSubmit(onSubmit)();
              } else {
                setEditMode(!editMode);
              }
            }}
          >
            {editMode ? "Save" : "Edit"}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            id="store-info-form"
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
          >
            <div className="grid gap-6">
              <FormField
                control={form.control}
                name="name"
                disabled={isPending}
                render={({ field }) => (
                  <FormItem className="grid gap-2">
                    <FormLabel htmlFor="name">StoreName</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        id="name"
                        type="text"
                        placeholder="Store Name"
                        required
                        readOnly
                        disabled={isPending}
                        autoComplete="name"
                      />
                    </FormControl>
                    <FormDescription>
                      <span className="text-sm text-muted-foreground">
                        Domain:{" "}
                        <Link
                          className="font-bold underline"
                          href={`https://${storeInfo.slug}.${process.env.NEXT_PUBLIC_APP_URL}`}
                          target="_blank"
                        >
                          {storeInfo.slug}.{process.env.NEXT_PUBLIC_APP_URL}
                        </Link>
                      </span>
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                disabled={isPending}
                render={({ field }) => (
                  <FormItem className="grid gap-2">
                    <FormLabel htmlFor="description">
                      Store Description
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        id="description"
                        placeholder="Store Description"
                        readOnly={!editMode}
                        rows={5}
                        disabled={isPending}
                        onDoubleClick={() => {
                          if (!editMode) {
                            setEditMode(true);
                          }
                        }}
                      />
                    </FormControl>
                    <FormDescription>
                      This description will be displayed to your customers and
                      in the preview page of google search.
                      <span className="text-xs text-muted-foreground">
                        SEO tips: Use relevant keywords and keep it concise.
                      </span>
                    </FormDescription>
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
                    <FormLabel htmlFor="phone">Store Contact Phone</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        id="phone"
                        type="text"
                        placeholder="Store Phone"
                        required
                        readOnly={!editMode}
                        autoComplete="phone"
                        disabled={isPending}
                        onDoubleClick={() => {
                          if (!editMode) {
                            setEditMode(true);
                          }
                        }}
                      />
                    </FormControl>
                    <FormDescription>
                      This phone number will be displayed to your customers. It
                      is public, don't use your personal phone number if you
                      don't want to receive spam calls.
                    </FormDescription>
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
                    <FormLabel htmlFor="email">Store Contact Email</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        id="email"
                        type="email"
                        placeholder="Store Email"
                        required
                        readOnly={!editMode}
                        autoComplete="email"
                        disabled={isPending}
                        onDoubleClick={() => {
                          if (!editMode) {
                            setEditMode(true);
                          }
                        }}
                      />
                    </FormControl>
                    <FormDescription>
                      This email will be displayed to your customers. It is
                      public, don't use your personal email if you don't want to
                      receive spam emails.
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
                    <FormLabel htmlFor="address">Store Address</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        id="address"
                        type="text"
                        placeholder="Store Address"
                        required
                        readOnly={!editMode}
                        autoComplete="address"
                        disabled={isPending}
                        onDoubleClick={() => {
                          if (!editMode) {
                            setEditMode(true);
                          }
                        }}
                      />
                    </FormControl>
                    <FormDescription>
                      Your store location/address will be displayed to your
                      customers.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default StoreInfo;
