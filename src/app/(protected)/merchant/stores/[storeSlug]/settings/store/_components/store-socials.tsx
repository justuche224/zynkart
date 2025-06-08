"use client";

import { getStoreSocials } from "@/actions/product/store-socials/get";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Loader, Trash } from "lucide-react";
import { useState, useTransition } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { addStoreSocial } from "@/actions/product/store-socials/add";
import { deleteStoreSocial } from "@/actions/product/store-socials/delete";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";

const StoreSocials = ({ storeId }: { storeId: string }) => {
  const [isAddSocialOpen, setIsAddSocialOpen] = useState(false);
  const [isDeleteSocialOpen, setIsDeleteSocialOpen] = useState<string | null>(
    null
  );
  const { data, isLoading, error } = useQuery({
    queryKey: ["store-socials", storeId],
    queryFn: () => getStoreSocials(storeId),
  });
  return (
    <Card>
      <CardHeader>
        <CardTitle>Store Socials</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader className="w-4 h-4 animate-spin" />
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-muted-foreground">{error.message}</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {data?.data.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-4">
                <p className="text-sm text-muted-foreground">
                  No socials found, add social media links to let your customers
                  find you easily.
                </p>
                <Button onClick={() => setIsAddSocialOpen(true)}>
                  Add Social
                </Button>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <Button onClick={() => setIsAddSocialOpen(true)}>
                  Add Social
                </Button>
                {data?.data.map((social) => (
                  <div
                    key={social.id}
                    className="flex items-center justify-between gap-4"
                  >
                    <Link
                      href={social.link}
                      target="_blank"
                      className="hover:underline"
                    >
                      <p>{social.name}</p>
                    </Link>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setIsDeleteSocialOpen(social.id)}
                    >
                      <Trash className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
      <AddSocial
        storeId={storeId}
        isOpen={isAddSocialOpen}
        onOpenChange={setIsAddSocialOpen}
      />
      <DeleteSocial
        storeId={storeId}
        isOpen={isDeleteSocialOpen !== null}
        onOpenChange={setIsDeleteSocialOpen}
        socialId={isDeleteSocialOpen}
      />
    </Card>
  );
};

export default StoreSocials;

const DeleteSocial = ({
  storeId,
  socialId,
  isOpen,
  onOpenChange,
}: {
  storeId: string;
  socialId: string | null;
  isOpen: boolean;
  onOpenChange: (socialId: string | null) => void;
}) => {
  const [isPending, startTransition] = useTransition();
  const queryClient = useQueryClient();

  const handleDelete = () => {
    if (!socialId) return;

    startTransition(async () => {
      try {
        const result = await deleteStoreSocial(socialId, storeId);
        if (result) {
          toast.success("Social deleted successfully");

          await queryClient.invalidateQueries({
            queryKey: ["store-socials", storeId],
          });

          onOpenChange(null);
        } else {
          toast.error("Failed to delete social");
        }
      } catch (error) {
        toast.error("Failed to delete social");
        console.error(error);
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => onOpenChange(null)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Social</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this social media link? This action
            cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" disabled={isPending}>
              Cancel
            </Button>
          </DialogClose>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isPending}
          >
            {isPending ? <Loader className="w-4 h-4 animate-spin" /> : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const AddSocial = ({
  storeId,
  isOpen,
  onOpenChange,
}: {
  storeId: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  const [isPending, startTransition] = useTransition();
  const queryClient = useQueryClient();

  const formSchema = z.object({
    name: z.string().min(1),
    url: z.string().url(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      url: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    startTransition(async () => {
      try {
        const social = await addStoreSocial(storeId, values.name, values.url);
        if (social) {
          toast.success("Social added successfully");

          await queryClient.invalidateQueries({
            queryKey: ["store-socials", storeId],
          });

          onOpenChange(false);
          form.reset();
        } else {
          toast.error("Failed to add social");
        }
      } catch (error) {
        toast.error("Failed to add social");
        console.error(error);
      }
    });
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Social</DialogTitle>
          <DialogDescription>
            Add social media links to let your customers find you easily.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            id="add-social-form"
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-8"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="grid gap-2">
                  <FormLabel htmlFor="name">Social Name</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      id="name"
                      type="text"
                      placeholder="Social Name"
                      required
                      disabled={isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem className="grid gap-2">
                  <FormLabel htmlFor="url">Social URL</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      id="url"
                      type="text"
                      placeholder="Social URL"
                      required
                      disabled={isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
        <DialogFooter>
          <DialogClose>Cancel</DialogClose>
          <Button type="submit" form="add-social-form" disabled={isPending}>
            {isPending ? (
              <Loader className="w-4 h-4 animate-spin" />
            ) : (
              "Add Social"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
