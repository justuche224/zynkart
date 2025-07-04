"use client";
import React, { useEffect, useRef } from "react";
import * as z from "zod";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Loader2, X } from "lucide-react";
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
import { FormError } from "@/components/ui/form-error";
import { FormSuccess } from "@/components/ui/form-success";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { InferSelectModel } from "drizzle-orm";
import { category, size, color, productSource, tag } from "@/db/schema";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
// import ProductVariants from "./new-product-variant-table";
import { toast } from "sonner";
import { convertBlobUrlToFile } from "@/lib/convert-blob-url-to-file";
import { uploadImage } from "@/lib/supabase/storage/client";
import { createProduct } from "@/actions/product/create-product";
import formatPrice from "@/lib/price-formatter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { NewProductSchema } from "@/schemas";
import { useFeatureLimit } from "@/hooks/use-feature-limits";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Crown } from "lucide-react";

const MAX_FILE_SIZE = 4 * 1024 * 1024;
const MAX_FILES = 5;

type Category = InferSelectModel<typeof category>;
type Color = InferSelectModel<typeof color>;
type Size = InferSelectModel<typeof size>;
type ProductSource = InferSelectModel<typeof productSource>;
type Tag = InferSelectModel<typeof tag>;

type NewProductFormProps = {
  storeData: {
    id: string;
    name: string;
  };
  categories?: Category[];
  colors?: Color[];
  sizes?: Size[];
  vendors?: ProductSource[];
  tags?: Tag[];
  storeSlug: string;
  merchantId: string;
};

const NewProductForm = ({
  storeData,
  categories,
  // colors,
  // sizes,
  vendors,
  tags,
  merchantId,
  storeSlug,
}: NewProductFormProps) => {
  const [categoryInputType, setCategoryInputType] = useState<
    "select" | "create"
  >("select");
  const [vendorInputType, setVendorInputType] = useState<"select" | "create">(
    "select"
  );
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [imageError, setImageError] = useState<string>("");
  const [categoryImageUrls, setCategoryImageUrls] = useState<string[]>([]);
  const [categoryImageError, setCategoryImageError] = useState<string>("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [newTagInput, setNewTagInput] = useState<string>("");
  const [newTags, setNewTags] = useState<string[]>([]);
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");
  const [isDragOver, setIsDragOver] = useState(false);
  const [isCategoryDragOver, setIsCategoryDragOver] = useState(false);
  const queryClient = useQueryClient();

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
    featureKey: "products_count",
    requestedAmount: 1,
  });

  const imageInputRef = useRef<HTMLInputElement>(null);
  const categoryImageInputRef = useRef<HTMLInputElement>(null);

  type NewProductFormInput = z.input<typeof NewProductSchema>;
  type NewProductFormOutput = z.output<typeof NewProductSchema>;

  const form = useForm<NewProductFormInput, any, NewProductFormOutput>({
    resolver: zodResolver(NewProductSchema),
    defaultValues: {
      name: "",
      description: "",
      status: "ACTIVE",
      categoryId: "",
      newCategoryName: "",
      price: undefined,
      slashedFrom: undefined,
      trackQuantity: false,
      inStock: undefined,
      productSourceId: "",
      newVendorName: "",
      storeId: storeData.id,
      tagIds: [],
      newTags: [],
      variants: [],
    },
  });

  const trackQuantity = form.watch("trackQuantity");

  useEffect(() => {
    if (!trackQuantity) {
      form.setValue("inStock", undefined);
    }
  }, [trackQuantity, form]);

  const handleTagSelect = (tagId: string) => {
    if (!selectedTags.includes(tagId)) {
      const updatedTags = [...selectedTags, tagId];
      setSelectedTags(updatedTags);
      form.setValue("tagIds", updatedTags);
    }
  };

  const handleTagRemove = (tagId: string) => {
    const updatedTags = selectedTags.filter((id) => id !== tagId);
    setSelectedTags(updatedTags);
    form.setValue("tagIds", updatedTags);
  };

  const handleNewTagAdd = () => {
    const trimmedTag = newTagInput.trim();
    if (trimmedTag && !newTags.includes(trimmedTag)) {
      const updatedNewTags = [...newTags, trimmedTag];
      setNewTags(updatedNewTags);
      form.setValue("newTags", updatedNewTags);
      setNewTagInput("");
    }
  };

  const handleNewTagRemove = (tagName: string) => {
    const updatedNewTags = newTags.filter((tag) => tag !== tagName);
    setNewTags(updatedNewTags);
    form.setValue("newTags", updatedNewTags);
  };

  const handleNewTagKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleNewTagAdd();
    }
  };

  const createProductMutation = useMutation({
    mutationFn: async (values: z.infer<typeof NewProductSchema>) => {
      if (imageUrls.length === 0) {
        throw new Error("At least one product image is required");
      }
      if (imageUrls.length > MAX_FILES) {
        throw new Error(`Maximum ${MAX_FILES} product images allowed`);
      }

      let uploadedCategoryImageUrl: string | null = null;
      if (values.newCategoryName && categoryImageUrls.length > 0) {
        const imageFile = await convertBlobUrlToFile(categoryImageUrls[0]);
        const { imageUrl, error } = await uploadImage({
          file: imageFile,
          bucket: process.env.NEXT_PUBLIC_SUPABASE_BUCKET!,
          folder: "categories",
        });

        if (error) throw new Error(`Failed to upload category image: ${error}`);
        uploadedCategoryImageUrl = imageUrl;
      }

      const uploadedImages = await Promise.all(
        imageUrls.map(async (url, index) => {
          const imageFile = await convertBlobUrlToFile(url);
          const { imageUrl, error } = await uploadImage({
            file: imageFile,
            bucket: process.env.NEXT_PUBLIC_SUPABASE_BUCKET!,
            folder: "products",
          });

          if (error) throw new Error(`Failed to upload image: ${error}`);
          return {
            url: imageUrl,
            alt: values.name,
            position: index,
            isDefault: index === 0,
          };
        })
      );

      const finalValues = {
        ...values,
        images: uploadedImages,
      };

      const result = await createProduct({
        values: finalValues,
        merchantId,
        storeId: storeData.id,
        categoryImageUrl: uploadedCategoryImageUrl,
      });

      if (!result.success) {
        throw new Error(result.error?.message || "Failed to create product");
      }

      return result.data;
    },
    onSuccess: (newProduct) => {
      queryClient.invalidateQueries({ queryKey: ["products", storeData.id] });

      if (newProduct) {
        queryClient.setQueryData(
          ["products", storeData.id, 1],
          (oldData: any) => {
            if (!oldData) return oldData;

            return {
              ...oldData,
              products: [newProduct, ...(oldData.products || [])],
              totalProducts: (oldData.totalProducts || 0) + 1,
            };
          }
        );
      }

      setSuccess("Product created successfully!");
      toast.success("Product added");
      form.reset();
      setImageUrls([]);
      setCategoryImageUrls([]);
      setSelectedTags([]);
      setNewTags([]);
      setNewTagInput("");

      // Redirect to products page
      // router.push(`/merchant/stores/${storeSlug}/products`);
      // router.refresh();
      window.location.reload();
    },
    onError: (error: Error) => {
      setError(error.message);
      toast.error(error.message);
    },
  });

  const onSubmit = (values: NewProductFormOutput) => {
    if (!allowed) {
      setError(
        message || "Product creation limit reached. Please upgrade your plan."
      );
      return;
    }

    setError("");
    setSuccess("");
    createProductMutation.mutate(values);
  };

  const processFiles = (files: File[]) => {
    if (imageUrls.length + files.length > MAX_FILES) {
      setImageError(`Maximum ${MAX_FILES} images allowed`);
      return;
    }

    const invalidFiles = files.filter((file) => file.size > MAX_FILE_SIZE);
    if (invalidFiles.length > 0) {
      setImageError("Some files exceed 4MB limit");
      return;
    }

    const invalidTypes = files.filter(
      (file) => !file.type.startsWith("image/")
    );
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

  const processCategoryFiles = (files: File[]) => {
    if (categoryImageUrls.length + files.length > 1) {
      setCategoryImageError("Maximum 1 image allowed");
      return;
    }

    const invalidFiles = files.filter((file) => file.size > MAX_FILE_SIZE);
    if (invalidFiles.length > 0) {
      setCategoryImageError(
        `Image exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit`
      );
      return;
    }

    const invalidTypes = files.filter(
      (file) => !file.type.startsWith("image/")
    );
    if (invalidTypes.length > 0) {
      setCategoryImageError("Please select only image files");
      return;
    }

    setCategoryImageError("");
    const newImageUrls = files.map((file) => URL.createObjectURL(file));
    setCategoryImageUrls(newImageUrls);
  };

  const handleCategoryImageChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = e.target.files;
    if (!files) return;

    const filesArray = Array.from(files);
    processCategoryFiles(filesArray);
  };

  const handleCategoryDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsCategoryDragOver(true);
  };

  const handleCategoryDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsCategoryDragOver(false);
  };

  const handleCategoryDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsCategoryDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length === 0) return;

    processCategoryFiles(files);
  };

  const removeCategoryImage = (indexToRemove: number) => {
    setCategoryImageUrls((prev) =>
      prev.filter((_, index) => index !== indexToRemove)
    );
    if (categoryImageInputRef.current) {
      categoryImageInputRef.current.value = "";
    }
  };

  // const handleAddSize = async (newSize: {
  //   name: string;
  //   value: string;
  //   storeId?: string;
  //   merchantId: string;
  // }) => {
  //   const response = await fetch("/api/store/sizes", {
  //     method: "POST",
  //     headers: {
  //       "Content-Type": "application/json",
  //     },
  //     body: JSON.stringify({
  //       name: newSize.name,
  //       value: newSize.value,
  //       merchantId: newSize.merchantId,
  //       storeId: newSize.storeId,
  //     }),
  //   });

  //   if (!response.ok) {
  //     toast.error("Failed to create size");
  //     throw new Error("Failed to create size");
  //   }

  //   const size = await response.json();
  //   return size;
  // };
  // const handleAddColor = async (newColor: {
  //   name: string;
  //   value: string;
  //   storeId?: string;
  //   merchantId: string;
  // }) => {
  //   const response = await fetch("/api/store/colors", {
  //     method: "POST",
  //     headers: {
  //       "Content-Type": "application/json",
  //     },
  //     body: JSON.stringify({
  //       name: newColor.name,
  //       value: newColor.value,
  //       merchantId: newColor.merchantId,
  //       storeId: newColor.storeId,
  //     }),
  //   });

  //   if (!response.ok) {
  //     toast.error("Failed to create color");
  //     throw new Error("Failed to create color");
  //   }

  //   const color = await response.json();
  //   return color;
  // };

  if (checkingLimits) {
    return (
      <div className="min-h-screen bg-background">
        <div className="w-full max-w-3xl mx-auto p-4 pt-20 space-y-6">
          <div className="flex items-center justify-center p-8">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                Checking product creation limits...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="w-full max-w-3xl mx-auto p-4 pt-20 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Link
            href={`/merchant/stores/${storeSlug}/products`}
            className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to products
          </Link>

          <Card className="w-full">
            <CardHeader>
              <CardTitle>Create New Product</CardTitle>
              <CardDescription>Add a new product to your store</CardDescription>
            </CardHeader>
            <CardContent>
              {!allowed && (
                <Alert className="border-amber-200 bg-amber-50 mb-6">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                  <AlertDescription className="text-amber-800">
                    <div className="space-y-2">
                      <p className="font-medium">
                        {message || "Product creation limit reached"}
                      </p>
                      {limit && current !== undefined && (
                        <p className="text-sm">
                          You have used {current} of{" "}
                          {limit === -1 ? "unlimited" : limit} allowed products.
                        </p>
                      )}
                      {upgradeRequired && suggestedPlan && (
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => window.open("/pricing", "_blank")}
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

              {allowed && limit && current !== undefined && limit > 0 && (
                <Alert className="border-blue-200 bg-blue-50 mb-6">
                  <AlertDescription className="text-blue-800">
                    <div className="space-y-2">
                      <p className="text-sm font-medium">
                        Product Usage: {current} of {limit} used
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
                            createProductMutation.isPending ||
                            imageUrls.length >= MAX_FILES
                          }
                        />

                        <div
                          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                            isDragOver
                              ? "border-primary bg-primary/5"
                              : "border-gray-300 hover:border-gray-400"
                          } ${
                            createProductMutation.isPending ||
                            imageUrls.length >= MAX_FILES
                              ? "opacity-50 cursor-not-allowed"
                              : "cursor-pointer"
                          }`}
                          onDragOver={handleDragOver}
                          onDragLeave={handleDragLeave}
                          onDrop={handleDrop}
                          onClick={() => {
                            if (
                              !createProductMutation.isPending &&
                              imageUrls.length < MAX_FILES
                            ) {
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
                                  ? "Drop images here"
                                  : "Drag and drop images here"}
                              </p>
                              <p className="text-gray-500">
                                or click to select files
                              </p>
                            </div>
                          </div>
                        </div>

                        {imageError && (
                          <Alert variant="destructive">{imageError}</Alert>
                        )}

                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                          {imageUrls.map((url, index) => (
                            <div key={url} className="relative group">
                              <Image
                                src={url}
                                width={200}
                                height={200}
                                alt={`Product image ${index + 1}`}
                                className="object-cover rounded-lg aspect-square"
                              />
                              <button
                                type="button"
                                onClick={() => removeImage(index)}
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
                              disabled={createProductMutation.isPending}
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
                              disabled={createProductMutation.isPending}
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
                                disabled={createProductMutation.isPending}
                                placeholder="Enter price"
                                type="number"
                                value={
                                  field.value === undefined ? "" : field.value
                                } // Handle undefined
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
                                disabled={createProductMutation.isPending}
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
                            <div className="space-y-4">
                              <FormField
                                control={form.control}
                                name="newCategoryName"
                                render={({ field: newCategoryField }) => (
                                  <FormItem>
                                    <FormControl>
                                      <Input
                                        {...newCategoryField}
                                        disabled={
                                          createProductMutation.isPending
                                        }
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
                              <div className="flex flex-col gap-2">
                                <FormLabel>Category Image (Optional)</FormLabel>
                                <FormDescription>
                                  Upload 1 image (max 4MB). This image will be
                                  used for the new category.
                                </FormDescription>
                                <input
                                  type="file"
                                  hidden
                                  accept="image/*"
                                  ref={categoryImageInputRef}
                                  onChange={handleCategoryImageChange}
                                  disabled={
                                    createProductMutation.isPending ||
                                    categoryImageUrls.length >= 1
                                  }
                                />
                                <div
                                  className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                                    isCategoryDragOver
                                      ? "border-primary bg-primary/5"
                                      : "border-gray-300 hover:border-gray-400"
                                  } ${
                                    createProductMutation.isPending ||
                                    categoryImageUrls.length >= 1
                                      ? "opacity-50 cursor-not-allowed"
                                      : "cursor-pointer"
                                  }`}
                                  onDragOver={handleCategoryDragOver}
                                  onDragLeave={handleCategoryDragLeave}
                                  onDrop={handleCategoryDrop}
                                  onClick={() => {
                                    if (
                                      !createProductMutation.isPending &&
                                      categoryImageUrls.length < 1
                                    ) {
                                      categoryImageInputRef.current?.click();
                                    }
                                  }}
                                >
                                  <div className="flex flex-col items-center gap-2">
                                    <div className="w-10 h-10 border border-gray-300 rounded-lg flex items-center justify-center">
                                      <svg
                                        className="w-5 h-5 text-gray-400"
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
                                        {isCategoryDragOver
                                          ? "Drop image here"
                                          : "Drag and drop image here"}
                                      </p>
                                      <p className="text-gray-500">
                                        or click to select file
                                      </p>
                                    </div>
                                  </div>
                                </div>
                                {categoryImageError && (
                                  <Alert variant="destructive">
                                    {categoryImageError}
                                  </Alert>
                                )}
                                {categoryImageUrls.length > 0 && (
                                  <div className="relative group w-32 h-32">
                                    <Image
                                      src={categoryImageUrls[0]}
                                      fill
                                      alt="Category image"
                                      className="object-cover rounded-lg"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => removeCategoryImage(0)}
                                      className="absolute top-1 right-1 p-1 bg-red-500 rounded-full text-white opacity-80 group-hover:opacity-100 transition-opacity"
                                    >
                                      <X className="h-4 w-4" />
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
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
                                disabled={createProductMutation.isPending}
                                placeholder="0"
                                type="number"
                                value={
                                  field.value === undefined ? "" : field.value
                                } // Handle undefined
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
                                      disabled={createProductMutation.isPending}
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

                    {/* Tags Section */}
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-medium">Product Tags</h3>
                        <p className="text-sm text-gray-500">
                          Add tags to help customers find your product. Tags are
                          a great way to organize your products. it can also be
                          used to show certain products in custom pages.
                        </p>
                      </div>

                      {/* Existing Tags */}
                      {tags && tags.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="text-sm font-medium">
                            Select from existing tags:
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {tags.map((tag) => (
                              <Badge
                                key={tag.id}
                                variant={
                                  selectedTags.includes(tag.id)
                                    ? "default"
                                    : "outline"
                                }
                                className="cursor-pointer hover:bg-primary/10 transition-colors"
                                onClick={() =>
                                  selectedTags.includes(tag.id)
                                    ? handleTagRemove(tag.id)
                                    : handleTagSelect(tag.id)
                                }
                              >
                                {tag.name}
                                {selectedTags.includes(tag.id) && (
                                  <X className="w-3 h-3 ml-1" />
                                )}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Add New Tags */}
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium">Add new tags:</h4>
                        <div className="flex gap-2">
                          <Input
                            placeholder="Enter a new tag..."
                            value={newTagInput}
                            onChange={(e) => setNewTagInput(e.target.value)}
                            onKeyPress={handleNewTagKeyPress}
                            disabled={createProductMutation.isPending}
                            className="flex-1"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={handleNewTagAdd}
                            disabled={
                              !newTagInput.trim() ||
                              createProductMutation.isPending
                            }
                          >
                            Add Tag
                          </Button>
                        </div>

                        {/* New Tags Display */}
                        {newTags.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {newTags.map((tagName) => (
                              <Badge
                                key={tagName}
                                variant="secondary"
                                className="cursor-pointer"
                              >
                                {tagName}
                                <X
                                  className="w-3 h-3 ml-1 cursor-pointer"
                                  onClick={() => handleNewTagRemove(tagName)}
                                />
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Selected Tags Summary */}
                      {(selectedTags.length > 0 || newTags.length > 0) && (
                        <div className="space-y-2">
                          <h4 className="text-sm font-medium">
                            Selected tags:
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {selectedTags.map((tagId) => {
                              const tag = tags?.find((t) => t.id === tagId);
                              return tag ? (
                                <Badge key={tagId} variant="default">
                                  {tag.name}
                                </Badge>
                              ) : null;
                            })}
                            {newTags.map((tagName) => (
                              <Badge key={tagName} variant="secondary">
                                {tagName} (new)
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

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
                            trackQuantity={form.watch("trackQuantity") || false}
                            basePrice={form.watch("price")}
                            onAddColor={handleAddColor}
                            onAddSize={handleAddSize}
                            storeId={storeData.id}
                            merchantId={merchantId}
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
                      disabled={createProductMutation.isPending}
                      asChild
                    >
                      <Link href={`/merchant/${storeSlug}/products`}>
                        Cancel
                      </Link>
                    </Button>
                    <Button
                      disabled={createProductMutation.isPending || !allowed}
                      type="submit"
                      className="min-w-[120px]"
                    >
                      {createProductMutation.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Creating...
                        </>
                      ) : !allowed ? (
                        "Product Limit Reached"
                      ) : (
                        "Create Product"
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

export default NewProductForm;
