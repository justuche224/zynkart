"use client";
import React, { useRef } from "react";
import * as z from "zod";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { UpdateCategorySchema } from "@/schemas";
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
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Category } from "@/types";
import { updateCategory } from "@/actions/category/edit";
import { FormSuccess } from "@/components/ui/form-success";
import { FormError } from "@/components/ui/form-error";
import Image from "next/image";
import { Alert } from "@/components/ui/alert";
import { convertBlobUrlToFile } from "@/lib/convert-blob-url-to-file";
import { uploadImage } from "@/lib/supabase/storage/client";

interface EditCategoryFormProps {
  storeId: string;
  merchantId: string;
  storeSlug: string;
  category: Category;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const EditCategoryForm = ({
  storeId,
  merchantId,
  storeSlug,
  category,
}: EditCategoryFormProps) => {
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const [imageUrl, setImageUrl] = useState<string | undefined>(
    category.imageUrl || undefined
  );
  const [isNewImageSelected, setIsNewImageSelected] = useState(false);
  const [imageError, setImageError] = useState<string>("");
  const imageInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<z.infer<typeof UpdateCategorySchema>>({
    resolver: zodResolver(UpdateCategorySchema),
    defaultValues: {
      name: category.name,
      storeId: storeId,
      merchantId: merchantId,
      imageUrl: category.imageUrl || undefined,
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];

    if (file.size > MAX_FILE_SIZE) {
      setImageError(`Image exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit`);
      return;
    }

    setImageError("");
    const newImageUrl = URL.createObjectURL(file);
    setImageUrl(newImageUrl);
    setIsNewImageSelected(true);
  };

  const removeImage = () => {
    setImageUrl(undefined);
    setIsNewImageSelected(true); // to indicate change
    if (imageInputRef.current) {
      imageInputRef.current.value = "";
    }
  };

  const onSubmit = (values: z.infer<typeof UpdateCategorySchema>) => {
    setError("");
    setSuccess("");

    startTransition(async () => {
      try {
        let finalImageUrl: string | null | undefined = category.imageUrl;

        if (isNewImageSelected) {
          if (imageUrl) {
            const imageFile = await convertBlobUrlToFile(imageUrl);
            const { imageUrl: newImageUrl, error } = await uploadImage({
              file: imageFile,
              bucket: process.env.NEXT_PUBLIC_SUPABASE_BUCKET!,
              folder: "categories",
            });

            if (error) throw new Error(`Failed to upload image: ${error}`);
            finalImageUrl = newImageUrl;
          } else {
            // Image was removed
            finalImageUrl = null;
          }
        }

        const updateValues = {
          ...values,
          id: category.id,
          imageUrl: finalImageUrl,
        };

        const result = await updateCategory(updateValues);

        if (!result.success) {
          setError(result.error?.message);
          return;
        }

        setSuccess("Category updated successfully!");
        router.push(`/merchant/stores/${storeSlug}/categories`);
        router.refresh();
      } catch (error: any) {
        console.error(error);
        setError(error.message || "Something went wrong. Please try again.");
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
              <CardTitle>Edit Category</CardTitle>
              <CardDescription>Edit the category details</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-6"
                >
                  <div className="space-y-4">
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
                      disabled={isPending}
                    />

                    {imageUrl && (
                      <div className="relative group w-48 h-36">
                        <Image
                          src={imageUrl}
                          fill
                          alt="Category image"
                          className="object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={removeImage}
                          className="absolute top-1 right-1 p-1 bg-red-500 rounded-full text-white opacity-80 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    )}

                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => imageInputRef.current?.click()}
                      disabled={isPending}
                    >
                      {imageUrl ? "Change Image" : "Select Image"}
                    </Button>

                    {imageError && (
                      <Alert variant="destructive">{imageError}</Alert>
                    )}
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
                          Updating...
                        </>
                      ) : (
                        "Update Category"
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

export default EditCategoryForm;
