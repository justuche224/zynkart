"use client";
import React, { useRef } from "react";
import * as z from "zod";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateCategorySchema } from "@/schemas";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Loader2, X } from "lucide-react";
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
import { createCategory } from "@/actions/category/create";
import Image from "next/image";
import { Alert } from "@/components/ui/alert";
import { convertBlobUrlToFile } from "@/lib/convert-blob-url-to-file";
import { uploadImage } from "@/lib/supabase/storage/client";

interface NewCategoryFormProps {
  storeId: string;
  merchantId: string;
  storeSlug: string;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const MAX_FILES = 1;

const NewCategoryForm = ({
  storeId,
  merchantId,
  storeSlug,
}: NewCategoryFormProps) => {
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [imageError, setImageError] = useState<string>("");
  const imageInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<z.infer<typeof CreateCategorySchema>>({
    resolver: zodResolver(CreateCategorySchema),
    defaultValues: {
      name: "",
      storeId: storeId,
      merchantId: merchantId,
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const filesArray = Array.from(files);

    if (imageUrls.length + filesArray.length > MAX_FILES) {
      setImageError(`Maximum ${MAX_FILES} image allowed`);
      return;
    }

    const invalidFiles = filesArray.filter((file) => file.size > MAX_FILE_SIZE);
    if (invalidFiles.length > 0) {
      setImageError(`Image exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit`);
      return;
    }

    setImageError("");
    const newImageUrls = filesArray.map((file) => URL.createObjectURL(file));
    setImageUrls([...imageUrls, ...newImageUrls]);
  };

  const removeImage = (indexToRemove: number) => {
    setImageUrls((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  const onSubmit = (values: z.infer<typeof CreateCategorySchema>) => {
    setError("");
    setSuccess("");

    startTransition(async () => {
      try {
        let imageUrl: string | undefined = undefined;

        if (imageUrls.length > 0) {
          const imageFile = await convertBlobUrlToFile(imageUrls[0]);
          const { imageUrl: uploadedUrl, error } = await uploadImage({
            file: imageFile,
            bucket: process.env.NEXT_PUBLIC_SUPABASE_BUCKET!,
            folder: "categories",
          });

          if (error) throw new Error(`Failed to upload image: ${error}`);
          imageUrl = uploadedUrl;
        }

        const finalValues = {
          ...values,
          imageUrl,
        };

        const result = await createCategory(finalValues);

        if (!result.success) {
          setError(result.error?.message);
          return;
        }

        setSuccess("Category created successfully!");
        form.reset();
        router.push(`/merchant/stores/${storeSlug}/categories`);
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
            href={`/merchant/stores/${storeSlug}/categories`}
            className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to categories
          </Link>

          <Card className="w-full">
            <CardHeader>
              <CardTitle>Create New Category</CardTitle>
              <CardDescription>
                Add a new category to organize your products
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-6"
                >
                  <div className="space-y-4">
                    <div className="flex flex-col gap-4">
                      <div>
                        <h3 className="text-lg font-medium">Category Image</h3>
                        <p className="text-sm text-gray-500">
                          Upload 1 image (max {MAX_FILE_SIZE / 1024 / 1024}
                          MB). This is optional.
                        </p>
                      </div>

                      <input
                        type="file"
                        hidden
                        accept="image/*"
                        ref={imageInputRef}
                        onChange={handleImageChange}
                        disabled={isPending || imageUrls.length >= MAX_FILES}
                      />

                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => imageInputRef.current?.click()}
                        disabled={isPending || imageUrls.length >= MAX_FILES}
                      >
                        Select Image
                      </Button>

                      {imageError && (
                        <Alert variant="destructive">{imageError}</Alert>
                      )}

                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
                        {imageUrls.map((url, index) => (
                          <div key={url} className="relative group">
                            <Image
                              src={url}
                              width={500}
                              height={375}
                              alt={`Category image ${index + 1}`}
                              className="object-cover rounded-lg aspect-[4/3] w-full h-full"
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="absolute top-2 right-2 p-1 bg-red-500 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category Name</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              disabled={isPending}
                              placeholder="e.g., Electronics, Clothing, Books"
                              type="text"
                              className="h-12"
                            />
                          </FormControl>
                          <FormDescription>
                            This name will be displayed to your customers
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
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
                      <Link href={`/merchant/stores/${storeSlug}/categories`}>
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
                        "Create Category"
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

export default NewCategoryForm;
