"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowLeft, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import React, { useEffect, useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { uploadImage } from "@/lib/supabase/storage/client";
import { convertBlobUrlToFile } from "@/lib/convert-blob-url-to-file";
import { FormError } from "@/components/ui/form-error";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { updateStoreLogo } from "@/actions/store/logo";
import { store as storeSchema } from "@/db/schema";
import { getCustomisation } from "@/actions/store/customisation/get";
import { useQuery } from "@tanstack/react-query";
import { updateCustomisation } from "@/actions/store/customisation/update";
import { changeTemplate } from "@/actions/store/customisation/change-template";
import { info } from "@/constants";
import { Loader } from "lucide-react";

const MAX_FILE_SIZE = 1024 * 1024 * 5;
const MAX_FILES = 1;

const Customise = ({ store }: { store: typeof storeSchema.$inferSelect }) => {
  const {
    data: customisationsData,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["customisations", store.id],
    queryFn: () => getCustomisation(store.id),
  });

  const [isPending, startTransition] = useTransition();

  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [imageError, setImageError] = useState<string>("");
  const imageInputRef = useRef<HTMLInputElement>(null);

  const [productWheelState, setProductWheelState] = useState({
    show: true,
    circleTime: 3,
    productCount: 6,
    categoryId: "all",
  });
  const [initialProductWheelState, setInitialProductWheelState] =
    useState(productWheelState);

  const [bannerSettingsState, setBannerSettingsState] = useState({
    show: true,
  });
  const [initialBannerSettingsState, setInitialBannerSettingsState] =
    useState(bannerSettingsState);

  const [templateState, setTemplateState] = useState({
    current: store.template || "default",
  });
  const [initialTemplateState, setInitialTemplateState] =
    useState(templateState);

  useEffect(() => {
    if (customisationsData?.data) {
      if (customisationsData.data.productWheelSettings) {
        const newProductWheelSettings = {
          ...customisationsData.data.productWheelSettings,
          categoryId:
            customisationsData.data.productWheelSettings.categoryId || "all",
        };
        setProductWheelState(newProductWheelSettings);
        setInitialProductWheelState(newProductWheelSettings);
      }
      if (customisationsData.data.bannerSettings) {
        setBannerSettingsState(customisationsData.data.bannerSettings);
        setInitialBannerSettingsState(customisationsData.data.bannerSettings);
      }

      const currentTemplate = store.template || "default";
      const newTemplateState = { current: currentTemplate };
      setTemplateState(newTemplateState);
      setInitialTemplateState(newTemplateState);
    }
  }, [customisationsData, store.template]);

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

  const uploadStoreLogo = async () => {
    startTransition(async () => {
      try {
        let imageUrl: string | undefined = undefined;

        if (imageUrls.length > 0) {
          const imageFile = await convertBlobUrlToFile(imageUrls[0]);
          const { imageUrl: uploadedUrl, error } = await uploadImage({
            file: imageFile,
            bucket: process.env.NEXT_PUBLIC_SUPABASE_BUCKET!,
            folder: "store-logos",
          });

          if (error) throw new Error(`Failed to upload image: ${error}`);
          imageUrl = uploadedUrl;
        }

        if (!imageUrl) throw new Error("No image URL found");

        const result = await updateStoreLogo(store.id, imageUrl);

        if (!result.success)
          throw new Error(result.error || "Failed to upload store logo");

        toast.success("Store logo updated successfully");
      } catch (error) {
        console.error(error);
        toast.error("Failed to update store logo");
      }
    });
  };

  const handleProductWheelSave = () => {
    if (!customisationsData?.data.id) return;
    startTransition(async () => {
      try {
        const result = await updateCustomisation({
          customisationId: customisationsData.data.id,
          storeSlug: store.slug,
          productWheel: productWheelState,
        });
        if (result.success) {
          toast.success("Product wheel settings updated");
          refetch();
        } else {
          toast.error(result.error || "Failed to update settings");
        }
      } catch (error) {
        console.error(error);
        toast.error("An unexpected error occurred.");
      }
    });
  };

  const handleBannerSettingsSave = () => {
    if (!customisationsData?.data.id) return;
    startTransition(async () => {
      try {
        const result = await updateCustomisation({
          customisationId: customisationsData.data.id,
          storeSlug: store.slug,
          banner: bannerSettingsState,
        });
        if (result.success) {
          toast.success("Banner settings updated");
          refetch();
        } else {
          toast.error(result.error || "Failed to update settings");
        }
      } catch (error) {
        console.error(error);
        toast.error("An unexpected error occurred.");
      }
    });
  };

  const handleTemplateSave = () => {
    startTransition(async () => {
      try {
        const result = await changeTemplate(store.id, templateState.current);
        if (result.success) {
          toast.success("Template updated successfully");
          setInitialTemplateState(templateState);
          refetch();
          window.location.reload();
        } else {
          toast.error(result.error || "Failed to update template");
        }
      } catch (error) {
        console.error(error);
        toast.error("An unexpected error occurred.");
      }
    });
  };

  const productWheelHasChanged =
    JSON.stringify(productWheelState) !==
    JSON.stringify(initialProductWheelState);

  const bannerSettingsHasChanged =
    JSON.stringify(bannerSettingsState) !==
    JSON.stringify(initialBannerSettingsState);

  const templateHasChanged =
    JSON.stringify(templateState) !== JSON.stringify(initialTemplateState);

  if (isLoading)
    return (
      <div className="flex items-center justify-center h-full">
        <Loader className="animate-spin" />
      </div>
    );
  if (isError) return <div>Error</div>;
  console.log("customisationsData", customisationsData);

  return (
    <section className="px-5 mt-10 grid gap-5">
      <div>
        <Button variant="link" size="sm" asChild>
          <Link href={`/merchant/stores/${store.slug}`}>
            <ArrowLeft /> Back to Store Overview
          </Link>
        </Button>
      </div>
      <Card className="max-w-4xl mx-auto w-full">
        <CardHeader>
          <CardTitle>Customize Your Store Front</CardTitle>
          <CardDescription>
            Lorem ipsum dolor sit amet, consectetur adipisicing elit.{" "}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-5">
          <div className="grid gap-4 border rounded-lg p-4 border-dashed border-gray-300">
            <h2 className="text-lg font-medium">Store Template</h2>
            <p className="text-sm text-muted-foreground">
              Select a template for your store. This will change the overall
              look and feel of your storefront.
            </p>
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-medium mb-2">
                  Current Template: {store.template || "default"}
                </h3>
                <Select
                  onValueChange={(template) =>
                    setTemplateState((s) => ({ ...s, current: template }))
                  }
                  value={templateState.current}
                  disabled={isPending}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Select a template" />
                  </SelectTrigger>
                  <SelectContent>
                    {info.templates.map((template) => (
                      <SelectItem key={template} value={template}>
                        {template.charAt(0).toUpperCase() + template.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {info.templates.map((template) => (
                  <div
                    key={template}
                    className={`border rounded-lg p-4 cursor-pointer transition-all ${
                      templateState.current === template
                        ? "border-blue-500 bg-blue-50 border-4"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() =>
                      setTemplateState((s) => ({ ...s, current: template }))
                    }
                  >
                    <div
                      className="aspect-video rounded mb-2 flex items-center justify-center"
                      style={{
                        backgroundImage: `url(/images/templates/${template}.png)`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }}
                    >
                      <span className="text-sm text-gray-500">Preview</span>
                    </div>
                    <h4 className="font-medium capitalize">{template}</h4>
                    <p className="text-xs text-muted-foreground">
                      {template === "default" && "Clean and minimal design"}
                      {template === "sapphire" && "Modern and vibrant layout"}
                      {template === "glassy" && "Elegant glass-like interface"}
                    </p>
                  </div>
                ))}
              </div>
              <Button
                onClick={handleTemplateSave}
                disabled={isPending || !templateHasChanged}
                className="w-fit"
                variant={templateHasChanged ? "default" : "outline"}
              >
                {isPending ? "Saving..." : "Save Template"}
              </Button>
            </div>
          </div>
          <div>
            <div className="flex flex-col gap-4 border rounded-lg p-4 border-dashed border-gray-300">
              <div className="flex flex-col items-center justify-between gap-4">
                <h3 className="text-lg font-medium">Store Logo</h3>
                {store.logoUrl && (
                  <Image
                    src={store.logoUrl}
                    alt="Store Logo"
                    width={500}
                    height={500}
                    className="rounded-lg w-40 h-40 object-cover"
                  />
                )}
                <p className="text-sm text-gray-500">
                  Upload 1 image (max {MAX_FILE_SIZE / 1024 / 1024}
                  MB).
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

              {imageError && <FormError message={imageError} />}

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
                      disabled={isPending}
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 p-1 bg-red-500 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
              <Button
                disabled={isPending || imageUrls.length === 0}
                onClick={uploadStoreLogo}
              >
                Save
              </Button>
            </div>
          </div>
          <div className="grid gap-4 border rounded-lg p-4 border-dashed border-gray-300">
            {/* TODO: Add actual template image */}
            <h2 className="text-lg font-medium">Product Wheel</h2>
            <Image
              src="https://afakpghdgtblnxinpzgy.supabase.co/storage/v1/object/public/zynkart-product-images//Screenshot%202025-06-11%20110835.png"
              alt="Product Wheel"
              width={500}
              height={300}
              className="rounded-lg w-full"
            />
            <div className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
              <div className="space-y-0.5">
                <h3 className="text-lg font-medium">Show Product Wheel</h3>
                <p className="text-sm text-muted-foreground">
                  Show the product wheel on the home page.
                </p>
              </div>
              <div>
                <Switch
                  checked={productWheelState.show}
                  onCheckedChange={(show) =>
                    setProductWheelState((s) => ({ ...s, show }))
                  }
                  disabled={isPending}
                />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-medium">Product wheel circle time</h3>
              <p className="text-sm text-muted-foreground">
                The time in seconds for the product wheel circle to rotate.
              </p>
              <Input
                type="number"
                min={1}
                max={10}
                value={productWheelState.circleTime}
                onChange={(e) =>
                  setProductWheelState((s) => ({
                    ...s,
                    circleTime: parseInt(e.target.value),
                  }))
                }
                className="w-24"
                disabled={isPending}
              />
            </div>
            <div>
              <h3 className="text-lg font-medium">
                Number of products on the product wheel
              </h3>
              <p className="text-sm text-muted-foreground">
                The number of products to show on the product wheel.
              </p>
              <Input
                type="number"
                min={1}
                max={10}
                value={productWheelState.productCount}
                onChange={(e) =>
                  setProductWheelState((s) => ({
                    ...s,
                    productCount: parseInt(e.target.value),
                  }))
                }
                className="w-24"
                disabled={isPending}
              />
            </div>
            <div>
              <h3 className="text-lg font-medium">
                Show a specific category on the product wheel
              </h3>
              <p className="text-sm text-muted-foreground">
                Select a category to show on the product wheel.
              </p>
              <Select
                onValueChange={(categoryId) =>
                  setProductWheelState((s) => ({ ...s, categoryId }))
                }
                value={productWheelState.categoryId}
                disabled={isPending}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  {customisationsData?.categories?.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={handleProductWheelSave}
              disabled={isPending || !productWheelHasChanged}
              className="w-fit"
              variant={productWheelHasChanged ? "default" : "outline"}
            >
              Save Changes
            </Button>
          </div>
          <div className="grid gap-4 border rounded-lg p-4 border-dashed border-gray-300">
            <h2 className="text-lg font-medium">Banners</h2>
            {/* TODO: Add actual template image */}
            <Image
              src="https://afakpghdgtblnxinpzgy.supabase.co/storage/v1/object/public/zynkart-product-images//Screenshot%202025-06-11%20112635.png"
              alt="Banners"
              width={500}
              height={300}
              className="rounded-lg w-full"
            />
            <div>
              <h3 className="text-lg font-medium">Manage Banners</h3>
              <p className="text-sm text-muted-foreground">
                To add new banners or update existing banner go to the{" "}
                <Link
                  className="text-blue-500 hover:underline"
                  href={`/merchant/stores/${store.slug}/banners`}
                >
                  Banners
                </Link>{" "}
                page.
              </p>
            </div>
            <div className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
              <div className="space-y-0.5">
                <h3 className="text-lg font-medium">Show Banners</h3>
                <p className="text-sm text-muted-foreground">
                  Show the banners on the home page.
                </p>
              </div>
              <div>
                <Switch
                  checked={bannerSettingsState.show}
                  onCheckedChange={(show) =>
                    setBannerSettingsState((s) => ({ ...s, show }))
                  }
                  disabled={isPending}
                />
              </div>
            </div>
            <Button
              onClick={handleBannerSettingsSave}
              disabled={isPending || !bannerSettingsHasChanged}
              className="w-fit"
              variant={bannerSettingsHasChanged ? "default" : "outline"}
            >
              Save Changes
            </Button>
          </div>
        </CardContent>
      </Card>
    </section>
  );
};

export default Customise;
