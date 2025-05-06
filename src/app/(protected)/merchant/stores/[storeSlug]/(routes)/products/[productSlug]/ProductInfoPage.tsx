"use client";
import { motion } from "framer-motion";
import Image from "next/image";
import { Edit, Trash2, Eye, BarChart2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { product, productImage } from "@/server/database/schema";
import type { InferSelectModel } from "drizzle-orm";
import { formatDate } from "@/utils/date-formatting";
import formatPrice from "@/utils/price-formatter";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import logger from "@/utils/logger";
import { deleteProduct } from "@/server/actions/product/delete-product";
import Link from "next/link";

type Image = InferSelectModel<typeof productImage>;
type ProductWithRelations = InferSelectModel<typeof product> & {
  storeProfile: {
    id: string;
    store: {
      merchantId: string;
      slug: string;
    };
  };
  category: {
    id: string;
    name: string;
    slug: string;
  };
  productSource: {
    id: string;
    name: string;
    slug: string;
  };
  images: Image[];
};

const ProductInfoPage = (productData: ProductWithRelations) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDeleteConfirm = async () => {
    if (!productData.id || !productData.storeProfile.store.merchantId) return;

    setIsDeleting(true);
    try {
      const result = await deleteProduct(
        productData.id,
        productData.storeProfile.store.slug,
        productData.storeProfile.store.merchantId
      );
      if (result.error) {
        toast.error(result.error);
      } else {
        router.push(
          `/merchant/${productData.storeProfile.store.slug}/products`
        );
        toast.success("Product deleted successfully");
      }
    } catch (error) {
      logger.error("Failed to delete product:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-8"
      >
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">{productData.name}</h1>
          <div className="space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                router.push(
                  `/merchant/${productData.storeProfile.store.slug}/products/${productData.slug}/edit`
                )
              }
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setShowDeleteDialog(true)}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Product Images</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {productData.images.length > 0 ? (
                <div className="grid grid-cols-2 gap-4">
                  {productData.images.map((image) => (
                    <div key={image.id} className="relative aspect-square">
                      <Image
                        src={image.url}
                        alt={image.alt ?? productData.name}
                        fill
                        className="object-cover rounded-lg"
                      />
                      {image.isDefault && (
                        <Badge
                          variant="secondary"
                          className="absolute top-2 right-2"
                        >
                          Default
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="relative aspect-square">
                  <Image
                    src="/images/product-placeholder.webp"
                    alt={productData.name}
                    fill
                    className="object-cover rounded-lg"
                  />
                  <p className="absolute bottom-2 left-2 text-sm text-muted-foreground">
                    No images uploaded
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Product Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="font-semibold">Status</p>
                  <Badge
                    variant={
                      productData.status === "ACTIVE" ? "outline" : "secondary"
                    }
                  >
                    {productData.status}
                  </Badge>
                </div>
                <div>
                  <p className="font-semibold">Category</p>
                  <p>{productData.category.name}</p>
                </div>
                <div>
                  <p className="font-semibold">Price</p>
                  <p>{formatPrice(productData.price, "en-NG", "NGN")}</p>
                </div>
                {productData.slashedFrom && (
                  <div>
                    <p className="font-semibold">Slashed From</p>
                    <p>
                      {formatPrice(productData.slashedFrom, "en-NG", "NGN")}
                    </p>
                  </div>
                )}
                <div>
                  <p className="font-semibold">In Stock</p>
                  <p>{productData.inStock} units</p>
                </div>
                <div>
                  <p className="font-semibold">Track Quantity</p>
                  <p>{productData.trackQuantity ? "Yes" : "No"}</p>
                </div>
              </div>
              <Separator />
              <div>
                <p className="font-semibold">Description</p>
                <p>{productData.description}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Meta Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <p className="font-semibold">Meta Title</p>
                <p>{productData.metaTitle || "Not set"}</p>
              </div>
              <div>
                <p className="font-semibold">Meta Description</p>
                <p>{productData.metaDescription || "Not set"}</p>
              </div>
              <div>
                <p className="font-semibold">Meta Keywords</p>
                <p>{productData.metaKeywords || "Not set"}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Source Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <p className="font-semibold">Product Source</p>
                <p>{productData.productSource.name}</p>
              </div>
              <div>
                <p className="font-semibold">Store</p>
                <p>{productData.storeProfile.store.slug}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Timestamps</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <p className="font-semibold">Created At</p>
                <p>{formatDate(productData.createdAt, "MMMM do, yyyy")}</p>
              </div>
              <div>
                <p className="font-semibold">Updated At</p>
                <p>{formatDate(productData.updatedAt, "MMMM do, yyyy")}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end space-x-4">
          <Link
            href={`http://${productData.storeProfile.store.slug}.localhost:3000/${productData.slug}`}
            target="_blank"
          >
            <Button variant="outline">
              <Eye className="w-4 h-4 mr-2" />
              Preview
            </Button>
          </Link>
          <Button>
            <BarChart2 className="w-4 h-4 mr-2" />
            View Analytics
          </Button>
        </div>
      </motion.div>
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              product{" "}
              <span className="font-bold text-red-600">
                &quot;{productData.name}&quot;
              </span>{" "}
              and remove it from your store.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <Button
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 text-sm py-1"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ProductInfoPage;
