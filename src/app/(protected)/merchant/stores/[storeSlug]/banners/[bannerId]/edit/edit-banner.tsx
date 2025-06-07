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
import { updateBanner } from "@/actions/banners/edit";

const MAX_FILE_SIZE = 10 * 1024 * 1024;

type BannerData = {
  id: string;
  title: string | null;
  description: string | null;
  imageUrl: string;
  link: string | null;
  isActive: boolean;
};

type EditBannerFormProps = {
  banner: BannerData;
  storeData: {
    id: string;
    name: string;
  };
  storeSlug: string;
  merchantId: string;
};

const EditBannerForm = ({
  banner,
  storeData,
  storeSlug,
  merchantId,
}: EditBannerFormProps) => {
  const [imageUrl, setImageUrl] = useState<string>(banner.imageUrl);
  const [isNewImageSelected, setIsNewImageSelected] = useState(false);
  const [imageError, setImageError] = useState<string>("");
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  const imageInputRef = useRef<HTMLInputElement>(null);

  type NewBannerFormInput = z.input<typeof NewBannerSchema>;
  type NewBannerFormOutput = z.output<typeof NewBannerSchema>;

  const form = useForm<NewBannerFormInput, any, NewBannerFormOutput>({
    resolver: zodResolver(NewBannerSchema),
    defaultValues: {
      title: banner.title || "",
      description: banner.description || "",
      linkUrl: banner.link || "",
      isActive: banner.isActive,
      storeId: storeData.id,
    },
  });

  const onSubmit = async (values: NewBannerFormOutput) => {
    setError("");
    setSuccess("");
    setIsPending(true);

    try {
      let finalImageUrl = banner.imageUrl;

      if (isNewImageSelected) {
        const imageFile = await convertBlobUrlToFile(imageUrl);
        const { imageUrl: newImageUrl, error } = await uploadImage({
          file: imageFile,
          bucket: process.env.NEXT_PUBLIC_SUPABASE_BUCKET!,
          folder: "banners",
        });

        if (error) throw new Error(`Failed to upload image: ${error}`);
        finalImageUrl = newImageUrl;
      }

      const finalValues = {
        ...values,
        imageUrl: finalImageUrl,
      };

      const { success, error: updateError } = await updateBanner(
        banner.id,
        finalValues,
        merchantId
      );

      if (updateError) {
        throw new Error(updateError);
      }

      toast.success("Banner updated successfully!");
      setSuccess("Banner updated successfully!");
      router.push(`/merchant/stores/${storeSlug}/banners`);
    } catch (error: any) {
      setError(error.message);
      toast.error(error.message);
    } finally {
      setIsPending(false);
    }
  };

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

  const revertImage = () => {
    setImageUrl(banner.imageUrl);
    setIsNewImageSelected(false);
    if (imageInputRef.current) {
      imageInputRef.current.value = "";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
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
                </div>

                <input
                  type="file"
                  hidden
                  accept="image/*"
                  ref={imageInputRef}
                  onChange={handleImageChange}
                  disabled={isPending}
                />

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
                  <div key={imageUrl} className="relative group">
                    <Image
                      src={imageUrl}
                      width={500}
                      height={375}
                      alt={`Banner image`}
                      className="object-cover rounded-lg aspect-[4/3] w-full h-full"
                    />
                    {isNewImageSelected && (
                      <button
                        type="button"
                        onClick={revertImage}
                        className="absolute top-2 right-2 p-1 bg-red-500 rounded-full text-white opacity-70 hover:opacity-100 transition-opacity"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => imageInputRef.current?.click()}
                  disabled={isPending}
                >
                  Change Image
                </Button>

                {imageError && (
                  <Alert variant="destructive">{imageError}</Alert>
                )}
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
                  Updating...
                </>
              ) : (
                "Update Banner"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </motion.div>
  );
};

export default EditBannerForm;
