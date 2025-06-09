"use client";
import React from "react";
import * as z from "zod";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateTagSchema } from "@/schemas";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Loader2, Tag } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { FormError } from "@/components/ui/form-error";
import { FormSuccess } from "@/components/ui/form-success";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { createTag } from "@/actions/tag/create";
import { Badge } from "@/components/ui/badge";

interface NewTagFormProps {
  storeId: string;
  merchantId: string;
  storeSlug: string;
}

const NewTagForm = ({ storeId, merchantId, storeSlug }: NewTagFormProps) => {
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const form = useForm<z.infer<typeof CreateTagSchema>>({
    resolver: zodResolver(CreateTagSchema),
    defaultValues: {
      name: "",
      storeId: storeId,
      merchantId: merchantId,
    },
  });

  const tagPreview = form.watch("name");

  const onSubmit = (values: z.infer<typeof CreateTagSchema>) => {
    setError("");
    setSuccess("");

    startTransition(async () => {
      try {
        const result = await createTag(values);

        if (!result.success) {
          setError(result.error?.message);
          return;
        }

        setSuccess("Tag created successfully!");
        form.reset();
        router.push(`/merchant/stores/${storeSlug}/tags`);
        router.refresh();
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
            href={`/merchant/stores/${storeSlug}/tags`}
            className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to tags
          </Link>

          <Card className="w-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tag className="w-5 h-5" />
                Create New Tag
              </CardTitle>
              <CardDescription>
                Add a new tag to help customers discover your products
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-6"
                >
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tag Name</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              disabled={isPending}
                              placeholder="e.g., Organic, Sale, Featured, New Arrival"
                              type="text"
                              className="h-12"
                            />
                          </FormControl>
                          <FormDescription>
                            This tag will help customers find your products more
                            easily
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Tag Preview */}
                    {tagPreview && tagPreview.trim() && (
                      <div className="space-y-2">
                        <h3 className="text-sm font-medium">Preview</h3>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">{tagPreview.trim()}</Badge>
                          <span className="text-xs text-muted-foreground">
                            This is how your tag will appear
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  <FormError message={error} />
                  <FormSuccess message={success} />

                  <div className="flex flex-col gap-4 sm:flex-row sm:justify-end">
                    <Button
                      type="button"
                      variant="outline"
                      disabled={isPending}
                      asChild
                    >
                      <Link href={`/merchant/stores/${storeSlug}/tags`}>
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
                        "Create Tag"
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

export default NewTagForm;
