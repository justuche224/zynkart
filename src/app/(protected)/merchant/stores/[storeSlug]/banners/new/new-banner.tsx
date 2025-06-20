"use client";
import React, { useRef, useState } from "react";
import * as z from "zod";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Loader2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
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
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Alert } from "@/components/ui/alert";
import { convertBlobUrlToFile } from "@/lib/convert-blob-url-to-file";
import { uploadImage } from "@/lib/supabase/storage/client";
import { Textarea } from "@/components/ui/textarea";
import { NewBannerSchema } from "@/schemas";
import { createBanner } from "@/actions/banners/create";

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const MAX_FILES = 1;

type NewBannerFormProps = {
  storeData: {
    id: string;
    name: string;
  };
  storeSlug: string;
  merchantId: string;
};

const NewBannerForm = ({
  storeData,
  storeSlug,
  merchantId,
}: NewBannerFormProps) => {
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [imageError, setImageError] = useState<string>("");
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");
  const [isDragOver, setIsDragOver] = useState(false);
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  const imageInputRef = useRef<HTMLInputElement>(null);

  type NewBannerFormInput = z.input<typeof NewBannerSchema>;
  type NewBannerFormOutput = z.output<typeof NewBannerSchema>;

  const form = useForm<NewBannerFormInput, any, NewBannerFormOutput>({
    resolver: zodResolver(NewBannerSchema),
    defaultValues: {
      title: "",
      description: "",
      linkUrl: "",
      isActive: true,
      storeId: storeData.id,
    },
  });

  const onSubmit = async (values: NewBannerFormOutput) => {
    setError("");
    setSuccess("");
    setIsPending(true);

    if (imageUrls.length === 0) {
      setImageError("A banner image is required");
      setIsPending(false);
      return;
    }

    try {
      const imageFile = await convertBlobUrlToFile(imageUrls[0]);
      const { imageUrl, error } = await uploadImage({
        file: imageFile,
        bucket: process.env.NEXT_PUBLIC_SUPABASE_BUCKET!,
        folder: "banners",
      });

      if (error) throw new Error(`Failed to upload image: ${error}`);

      const finalValues = {
        ...values,
        imageUrl,
      };

      const { success, error: createError } = await createBanner(
        finalValues,
        merchantId,
        storeData.id
      );

      if (createError) {
        setError(createError);
        toast.error(createError);
        return;
      }

      if (success) {
        toast.success("Banner created successfully!");
        setSuccess("Banner created successfully!");
        router.push(`/merchant/stores/${storeSlug}/banners`);
      }
    } catch (error: any) {
      setError(error.message);
      toast.error(error.message);
    } finally {
      setIsPending(false);
    }
  };

  const processFiles = (files: File[]) => {
    if (imageUrls.length + files.length > MAX_FILES) {
      setImageError(`Maximum ${MAX_FILES} image allowed`);
      return;
    }

    const invalidFiles = files.filter((file) => file.size > MAX_FILE_SIZE);
    if (invalidFiles.length > 0) {
      setImageError(`Image exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit`);
      return;
    }

    const invalidTypes = files.filter((file) => !file.type.startsWith('image/'));
    if (invalidTypes.length > 0) {
      setImageError("Please select only image files");
      return;
    }

    setImageError("");
    const newImageUrls = files.map((file) => URL.createObjectURL(file));
    setImageUrls([...imageUrls, ...newImageUrls]);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const filesArray = Array.from(files);
    processFiles(filesArray);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length === 0) return;

    processFiles(files);
  };

  const removeImage = (indexToRemove: number) => {
    setImageUrls((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Link
        href={`/merchant/stores/${storeSlug}/banners`}
        className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to banners
      </Link>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-4">
              <div className="flex flex-col gap-4">
    <div>
                  <h3 className="text-lg font-medium">Banner Image</h3>
                  <p className="text-sm text-gray-500">
                    Upload 1 image (max {MAX_FILE_SIZE / 1024 / 1024}MB)
                  </p>
                  {/* TODO: auto recommend aspect ratio based on template */}
                  <p className="text-sm text-gray-500">
                    For better quality check your template page for recommended
                    aspect ratio.
                  </p>
                  {/* <p className="text-xs text-gray-500 italic">
                  Recommended size: 1200x900px
                </p>     */}
                </div>

                <input
                  type="file"
                  hidden
                  accept="image/*"
                  ref={imageInputRef}
                  onChange={handleImageChange}
                  disabled={isPending || imageUrls.length >= MAX_FILES}
                />

                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    isDragOver
                      ? "border-primary bg-primary/5"
                      : "border-gray-300 hover:border-gray-400"
                  } ${
                    isPending || imageUrls.length >= MAX_FILES
                      ? "opacity-50 cursor-not-allowed"
                      : "cursor-pointer"
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => {
                    if (!isPending && imageUrls.length < MAX_FILES) {
                      imageInputRef.current?.click();
                    }
                  }}
                >
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 border border-gray-300 rounded-lg flex items-center justify-center">
                      <svg
                        className="w-6 h-6 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                        />
                      </svg>
                    </div>
                    <div className="text-sm">
                      <p className="font-medium text-gray-900">
                        {isDragOver
                          ? "Drop banner image here"
                          : "Drag and drop banner image here"}
                      </p>
                      <p className="text-gray-500">
                        or click to select file
                      </p>
                    </div>
                  </div>
                </div>

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
                        alt={`Banner image ${index + 1}`}
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
            </div>
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={isPending}
                      placeholder="e.g., Summer Sale"
                      type="text"
                      className="h-12"
                    />
                  </FormControl>
                  <FormDescription>
                    This will be shown on the banner image.
                  </FormDescription>
                  <FormMessage />
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
                      {...field}
                      disabled={isPending}
                      placeholder="Banner description"
                      rows={4}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="linkUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Link URL</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={isPending}
                      placeholder="e.g., /products/summer-collection"
                      type="text"
                      className="h-12"
                    />
                  </FormControl>
                  <FormDescription>
                    When a user clicks the banner, they will be redirected to
                    this URL.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Active</FormLabel>
                    <FormDescription>
                      Inactive banners will not be shown in your store.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isPending}
                    />
                  </FormControl>
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
              <Link href={`/merchant/stores/${storeSlug}/banners`}>Cancel</Link>
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
                "Create Banner"
              )}
            </Button>
    </div>
        </form>
      </Form>
    </motion.div>
  );
};

export default NewBannerForm;
