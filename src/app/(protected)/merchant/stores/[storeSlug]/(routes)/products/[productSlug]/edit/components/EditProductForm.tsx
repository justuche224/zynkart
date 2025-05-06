"use client";
import React, { useEffect, useRef, useState } from "react";
import * as z from "zod";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { NewProductSchema } from "@/schemas";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { FormError } from "@/components/form-error";
import { FormSuccess } from "@/components/form-success";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { InferSelectModel } from "drizzle-orm";
import { category, size, color, productSource } from "@/server/database/schema";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Alert } from "@/components/ui/alert";
import { convertBlobUrlToFile } from "@/utils/convert-blob-url-to-file";
import { uploadImage } from "@/utils/supabase/storage/client";
import formatPrice from "@/utils/price-formatter";
import { ProductWithImages } from "@/types";
import { updateProduct } from "@/server/actions/product/update-product";
import { useQueryClient, useMutation } from "@tanstack/react-query";

const MAX_FILE_SIZE = 4 * 1024 * 1024;
const MAX_FILES = 5;

type Category = InferSelectModel<typeof category>;
type Color = InferSelectModel<typeof color>;
type Size = InferSelectModel<typeof size>;
type ProductSource = InferSelectModel<typeof productSource>;

type EditProductFormProps = {
  storeData: {
    id: string;
    name: string;
    storeProfileId: string | null;
  };
  storeProfileId?: string;
  categories?: Category[];
  colors?: Color[];
  sizes?: Size[];
  vendors?: ProductSource[];
  storeSlug: string;
  merchantId: string;
  product: ProductWithImages;
};

const EditProductForm = ({
  storeData,
  storeProfileId,
  categories,
  vendors,
  merchantId,
  storeSlug,
  product,
}: EditProductFormProps) => {
  const [categoryInputType, setCategoryInputType] = useState<
    "select" | "create"
  >(product.categoryId ? "select" : "create");
  const [vendorInputType, setVendorInputType] = useState<"select" | "create">(
    product.productSourceId ? "select" : "create"
  );
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState(product.images || []);
  const [imageError, setImageError] = useState<string>("");
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");
  const router = useRouter();
  const queryClient = useQueryClient();

  const imageInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<z.infer<typeof NewProductSchema>>({
    resolver: zodResolver(NewProductSchema),
    defaultValues: {
      name: product.name,
      description: product.description,
      categoryId: product.categoryId || "",
      newCategoryName: "",
      price: product.price,
      slashedFrom: product.slashedFrom || undefined,
      trackQuantity: product.trackQuantity,
      inStock: product.inStock,
      productSourceId: product.productSourceId || "",
      newVendorName: "",
      storeProfileId: storeProfileId || product.storeProfileId,
      variants: [],
    },
  });

  const trackQuantity = form.watch("trackQuantity");

  useEffect(() => {
    if (!trackQuantity) {
      form.setValue("inStock", undefined);
    }
  }, [trackQuantity, form]);

  useEffect(() => {
    if (product.images && product.images.length > 0) {
      setExistingImages(product.images);
    }
  }, [product.images]);

  const updateProductMutation = useMutation({
    mutationFn: async (values: z.infer<typeof NewProductSchema>) => {
      // Validate total images
      const totalImageCount = existingImages.length + imageUrls.length;
      if (totalImageCount === 0) {
        throw new Error("At least one image is required");
      }
      if (totalImageCount > MAX_FILES) {
        throw new Error(`Maximum ${MAX_FILES} images allowed`);
      }

      try {
        // Handle new image uploads if any
        const newUploadedImages = await Promise.all(
          imageUrls.map(async (url, index) => {
            const imageFile = await convertBlobUrlToFile(url);
            const { imageUrl, error } = await uploadImage({
              file: imageFile,
              bucket: "cartify",
            });

            if (error) throw new Error(`Failed to upload image: ${error}`);
            return {
              url: imageUrl,
              alt: values.name,
              position: existingImages.length + index,
              isDefault: existingImages.length === 0 && index === 0,
            };
          })
        );

        // Combine existing images with new uploads
        const finalImages = [
          ...existingImages.map((img, index) => ({
            url: img.url,
            alt: img.alt || values.name,
            position: index,
            isDefault: index === 0,
          })),
          ...newUploadedImages,
        ];

        // Prepare final values with all image URLs
        const finalValues = {
          ...values,
          images: finalImages,
          productSourceId:
            vendorInputType === "create" ? "" : values.productSourceId,
          newVendorName:
            vendorInputType === "create" ? values.newVendorName : "",
        };

        const result = await updateProduct(
          product.id,
          finalValues,
          merchantId,
          storeData.id
        );

        if (!result.success) {
          throw new Error(result.error?.message || "Failed to update product");
        }

        return result.data;
      } catch (err) {
        throw new Error(
          err instanceof Error ? err.message : "Failed to update product"
        );
      }
    },
    onSuccess: (updatedProduct) => {
      // Invalidate products query to trigger refetch
      queryClient.invalidateQueries({ queryKey: ["products", storeProfileId] });

      // Optimistically update product list
      queryClient.setQueryData(
        ["products", storeProfileId, 1], // assuming we're on page 1

        (oldData: any) => {
          if (!oldData) return oldData;

          return {
            ...oldData,

            products: oldData.products.map((p: any) =>
              p.id === product.id ? updatedProduct : p
            ),
          };
        }
      );

      setSuccess("Product updated successfully!");
      toast.success("Product updated");
      router.push(`/merchant/${storeSlug}/products`);
      router.refresh();
    },
    onError: (error: Error) => {
      setError(error.message);
      toast.error(error.message);
    },
  });

  const onSubmit = (values: z.infer<typeof NewProductSchema>) => {
    setError("");
    setSuccess("");

    if (vendorInputType === "create" && !values.newVendorName) {
      setError("Vendor name is required when creating a new vendor");
      return;
    }

    if (vendorInputType === "select" && !values.productSourceId) {
      setError("Please select a vendor");
      return;
    }

    updateProductMutation.mutate(values);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const filesArray = Array.from(files);

    // Validate total number of images (existing + new)
    if (
      existingImages.length + imageUrls.length + filesArray.length >
      MAX_FILES
    ) {
      setImageError(`Maximum ${MAX_FILES} images allowed`);
      return;
    }

    // Validate file sizes
    const invalidFiles = filesArray.filter((file) => file.size > MAX_FILE_SIZE);
    if (invalidFiles.length > 0) {
      setImageError("Some files exceed 4MB limit");
      return;
    }

    setImageError("");
    const newImageUrls = filesArray.map((file) => URL.createObjectURL(file));
    setImageUrls([...imageUrls, ...newImageUrls]);
  };

  const removeNewImage = (indexToRemove: number) => {
    setImageUrls((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  const removeExistingImage = (indexToRemove: number) => {
    setExistingImages((prev) =>
      prev.filter((_, index) => index !== indexToRemove)
    );
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
            href={`/merchant/${storeSlug}/products`}
            className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to products
          </Link>

          <Card className="w-full">
            <CardHeader>
              <CardTitle>Edit Product</CardTitle>
              <CardDescription>Update your product details</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-6"
                >
                  <div className="space-y-4">
                    <div className="space-y-4">
                      <div className="flex flex-col gap-4">
                        <div>
                          <h3 className="text-lg font-medium">
                            Product Images
                          </h3>
                          <p className="text-sm text-gray-500">
                            Upload up to 5 images (max 4MB each)
                          </p>
                        </div>

                        <input
                          type="file"
                          hidden
                          multiple
                          accept="image/*"
                          ref={imageInputRef}
                          onChange={handleImageChange}
                          disabled={
                            updateProductMutation.isPending ||
                            existingImages.length + imageUrls.length >=
                              MAX_FILES
                          }
                        />

                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => imageInputRef.current?.click()}
                          disabled={
                            updateProductMutation.isPending ||
                            existingImages.length + imageUrls.length >=
                              MAX_FILES
                          }
                        >
                          Add More Images
                        </Button>

                        {imageError && (
                          <Alert variant="destructive">{imageError}</Alert>
                        )}

                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                          {/* Existing images */}
                          {existingImages.map((img, index) => (
                            <div
                              key={img.id || index}
                              className="relative group"
                            >
                              <Image
                                src={img.url}
                                width={200}
                                height={200}
                                alt={img.alt || `Product image ${index + 1}`}
                                className="object-cover rounded-lg aspect-square"
                              />
                              <button
                                type="button"
                                onClick={() => removeExistingImage(index)}
                                className="absolute top-2 right-2 p-1 bg-red-500 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <X className="h-4 w-4" />
                              </button>
                              {index === 0 && (
                                <span className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded-md text-xs">
                                  Main Image
                                </span>
                              )}
                            </div>
                          ))}

                          {/* New images */}
                          {imageUrls.map((url, index) => (
                            <div key={url} className="relative group">
                              <Image
                                src={url}
                                width={200}
                                height={200}
                                alt={`New product image ${index + 1}`}
                                className="object-cover rounded-lg aspect-square"
                              />
                              <button
                                type="button"
                                onClick={() => removeNewImage(index)}
                                className="absolute top-2 right-2 p-1 bg-red-500 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <X className="h-4 w-4" />
                              </button>
                              {existingImages.length === 0 && index === 0 && (
                                <span className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded-md text-xs">
                                  Main Image
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Product Name</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              disabled={updateProductMutation.isPending}
                              placeholder="e.g., Mango, T-Shirt, iPhone 12"
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
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              disabled={updateProductMutation.isPending}
                              placeholder="Product/Service description"
                              rows={4}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex gap-5">
                      <FormField
                        control={form.control}
                        name="price"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Price</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                disabled={updateProductMutation.isPending}
                                placeholder="Enter price"
                                type="number"
                                value={
                                  field.value === undefined ? "" : field.value
                                }
                                onChange={(e) =>
                                  field.onChange(
                                    e.target.value
                                      ? Number(e.target.value)
                                      : undefined
                                  )
                                }
                              />
                            </FormControl>
                            <FormDescription>
                              {field.value && typeof field.value === "number"
                                ? `Formatted price ${formatPrice(
                                    field.value,
                                    "en-NG",
                                    "NGN"
                                  )}`
                                : "Enter a valid cost in naira (NGN)"}
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="slashedFrom"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Slashed From</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                disabled={updateProductMutation.isPending}
                                placeholder="0"
                                type="number"
                                value={
                                  field.value === undefined ? "" : field.value
                                }
                                onChange={(e) =>
                                  field.onChange(
                                    e.target.value
                                      ? Number(e.target.value)
                                      : undefined
                                  )
                                }
                              />
                            </FormControl>
                            <FormDescription>
                              {field.value && typeof field.value === "number"
                                ? `Formatted price ${formatPrice(
                                    field.value,
                                    "en-NG",
                                    "NGN"
                                  )}`
                                : "Enter a valid cost in naira (NGN)"}
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Status</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select product status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {["ACTIVE", "INACTIVE"].map((status) => (
                                <SelectItem key={status} value={status}>
                                  {status}
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
                      name="categoryId"
                      render={({ field }) => (
                        <FormItem className="space-y-4">
                          <FormLabel>Category</FormLabel>
                          <RadioGroup
                            defaultValue="select"
                            className="mb-4"
                            onValueChange={(value) =>
                              setCategoryInputType(value as "select" | "create")
                            }
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem
                                value="select"
                                id="select-existing-category"
                              />
                              <label htmlFor="select-existing-category">
                                Select existing category
                              </label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem
                                value="create"
                                id="create-new-category"
                              />
                              <label htmlFor="create-new-category">
                                Create new category
                              </label>
                            </div>
                          </RadioGroup>

                          {categoryInputType === "select" ? (
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                              {categories?.map((category) => (
                                <Button
                                  key={category.id}
                                  type="button"
                                  variant={
                                    field.value === category.id
                                      ? "default"
                                      : "outline"
                                  }
                                  className="w-full"
                                  onClick={() => {
                                    form.setValue("categoryId", category.id);
                                    form.setValue("newCategoryName", "");
                                  }}
                                >
                                  {category.name}
                                </Button>
                              ))}
                            </div>
                          ) : (
                            <FormField
                              control={form.control}
                              name="newCategoryName"
                              render={({ field: newCategoryField }) => (
                                <FormItem>
                                  <FormControl>
                                    <Input
                                      {...newCategoryField}
                                      disabled={updateProductMutation.isPending}
                                      placeholder="Enter new category name..."
                                      className="w-full"
                                      onChange={(e) => {
                                        newCategoryField.onChange(e);
                                        form.setValue("categoryId", "");
                                      }}
                                    />
                                  </FormControl>
                                  <FormDescription>
                                    A new category will be created with this
                                    name
                                  </FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          )}
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="trackQuantity"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">
                              Track Quantity
                            </FormLabel>
                            <FormDescription>
                              Enable this to track product quantity
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
                    {trackQuantity && (
                      <FormField
                        control={form.control}
                        name="inStock"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>In Stock</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                disabled={updateProductMutation.isPending}
                                placeholder="0"
                                type="number"
                                value={
                                  field.value === undefined ? "" : field.value
                                }
                                onChange={(e) =>
                                  field.onChange(
                                    e.target.value
                                      ? Number(e.target.value)
                                      : undefined
                                  )
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                    <FormField
                      control={form.control}
                      name="productSourceId"
                      render={({ field }) => (
                        <FormItem className="space-y-4">
                          <FormLabel>Product Source/Vendor</FormLabel>
                          <RadioGroup
                            defaultValue="select"
                            className="mb-4"
                            onValueChange={(value) =>
                              setVendorInputType(value as "select" | "create")
                            }
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem
                                value="select"
                                id="select-existing"
                              />
                              <label htmlFor="select-existing">
                                Select existing vendor
                              </label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="create" id="create-new" />
                              <label htmlFor="create-new">
                                Create new vendor
                              </label>
                            </div>
                          </RadioGroup>
                          {vendorInputType === "select" ? (
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                              {vendors?.map((vendor) => (
                                <Button
                                  key={vendor.id}
                                  type="button"
                                  variant={
                                    field.value === vendor.id
                                      ? "default"
                                      : "outline"
                                  }
                                  className="w-full"
                                  onClick={() =>
                                    form.setValue("productSourceId", vendor.id)
                                  }
                                >
                                  {vendor.name}
                                </Button>
                              ))}
                            </div>
                          ) : (
                            <FormField
                              control={form.control}
                              name="newVendorName"
                              render={({ field: newVendorField }) => (
                                <FormItem>
                                  <FormControl>
                                    <Input
                                      {...newVendorField}
                                      disabled={updateProductMutation.isPending}
                                      placeholder="Enter new vendor name..."
                                      className="w-full"
                                    />
                                  </FormControl>
                                  <FormDescription>
                                    A new vendor will be created with this name
                                  </FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          )}
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {/* <FormField
                      control={form.control}
                      name="variants"
                      render={({ field }) => (
                        <FormItem>
                          <ProductVariants
                            colors={colors}
                            sizes={sizes}
                            value={field.value || []}
                            onChange={field.onChange}
                            trackQuantity={form.watch("trackQuantity")}
                            basePrice={form.watch("price")}
                            onAddColor={handleAddColor}
                            onAddSize={handleAddSize}
                            storeProfileId={storeProfileId || ""}
                            storeId={storeData.id}
                          />
                          <FormMessage />
                        </FormItem>
                      )}
                    /> */}
                  </div>
                  <FormError message={error} />
                  <FormSuccess message={success} />
                  <div className="flex flex-col gap-4 sm:flex-row sm:justify-end">
                    <Button
                      type="button"
                      variant="outline"
                      disabled={updateProductMutation.isPending}
                      asChild
                    >
                      <Link href={`/merchant/${storeSlug}/products`}>
                        Cancel
                      </Link>
                    </Button>
                    <Button
                      disabled={updateProductMutation.isPending}
                      type="submit"
                      className="min-w-[120px]"
                    >
                      {updateProductMutation.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Update...
                        </>
                      ) : (
                        "Update Product"
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

export default EditProductForm;
