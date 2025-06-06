"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, Filter, ArrowUpRight, Trash, Pen } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { deleteProduct } from "@/actions/product/delete-product";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import formatPrice from "@/lib/price-formatter";
import { authClient } from "@/lib/auth-client";

interface BaseProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  status: string;
  slug: string;
  slashedFrom?: number | null;
  inStock: number;
  images: Array<{
    url: string;
    alt: string | null;
  }>;
}

interface GenericProductListProps<T extends BaseProduct> {
  products: T[];
  onProductClick?: (product: T) => void;
  header?: React.ReactNode;
  showSearch?: boolean;
  showFilter?: boolean;
  className?: string;
  productDetailsPath?: (product: T) => string;
  storeSlug: string;
  storeId: string;
}

const GenericProductList = <T extends BaseProduct>({
  products: initialProducts,
  onProductClick,
  header,
  showSearch = true,
  showFilter = true,
  className = "",
  productDetailsPath,
  storeSlug,
  storeId,
}: GenericProductListProps<T>) => {
  const [products, setProducts] = useState<T[]>(initialProducts);
  const [selectedProduct, setSelectedProduct] = useState<T | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { data: session } = authClient.useSession();
  const merchant = session?.user;
  const router = useRouter();
  const queryClient = useQueryClient();

  // Update local products state whenever initialProducts changes
  useEffect(() => {
    setProducts(initialProducts);
  }, [initialProducts]);

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 },
  };

  const handleProductClick = (product: T) => {
    if (onProductClick) {
      onProductClick(product);
    } else {
      setSelectedProduct(product);
    }
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteDialog(true);
  };

  const deleteProductMutation = useMutation({
    mutationFn: async (productId: string) => {
      if (!merchant?.id) throw new Error("Merchant ID is required");
      const result = await deleteProduct(productId, storeSlug, merchant.id);
      if (result.error) throw new Error(result.error);
      return productId;
    },
    onMutate: async (productId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({
        queryKey: ["products", storeId],
      });

      // Snapshot the previous value
      const previousProducts = queryClient.getQueryData(["products", storeId]);

      // Optimistically update the cache
      queryClient.setQueryData(["products", storeId], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          products: old.products.filter((p: T) => p.id !== productId),
          totalProducts: old.totalProducts - 1,
        };
      });

      // Also update local state for immediate UI update
      setProducts((prevProducts) =>
        prevProducts.filter((product) => product.id !== productId)
      );

      // Return context with the snapshotted value
      return { previousProducts };
    },
    onError: (err, productId, context) => {
      // Revert to the previous value if mutation fails
      console.error("Failed to delete product:", err, productId);
      queryClient.setQueryData(
        ["products", storeId],
        context?.previousProducts
      );

      // Revert local state as well
      if (context?.previousProducts) {
        const typedPrevious = context.previousProducts as any;
        if (typedPrevious.products) {
          setProducts(typedPrevious.products);
        }
      }

      toast.error("Failed to delete product");
      console.error("Failed to delete product:", err);
    },
    onSuccess: (productId) => {
      console.log("Product deleted:", productId);
      toast.success("Product deleted successfully");
      setSelectedProduct(null);
      setShowDeleteDialog(false);

      // Invalidate related queries to ensure data consistency
      queryClient.invalidateQueries({
        queryKey: ["products", storeId],
      });
    },
  });

  const handleDeleteConfirm = () => {
    if (!selectedProduct) return;
    deleteProductMutation.mutate(selectedProduct.id);
  };

  return (
    <div className={className}>
      {/* Header Section */}
      {(showSearch || showFilter || header) && (
        <div className="mb-4">
          {header}
          {(showSearch || showFilter) && (
            <div className="flex gap-2 items-center mt-2">
              {showSearch && (
                <div className="relative flex-1">
                  <Search
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={16}
                  />
                  <Input
                    className="pl-8 py-1 text-sm"
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              )}
              {showFilter && (
                <Button variant="outline" className="gap-1 text-sm py-1">
                  <Filter size={16} /> Filter
                </Button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Products Grid */}
      <motion.div
        className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {filteredProducts.map((product) => (
          <motion.div key={product.id} variants={item}>
            <Card
              className="group cursor-pointer hover:shadow transition-shadow"
              onClick={() => handleProductClick(product)}
            >
              <CardHeader className="relative">
                <div className="absolute top-2 right-2 z-10">
                  <Badge variant="secondary" className="text-xs">
                    {product.status}
                  </Badge>
                </div>
                <div className="h-32 bg-gray-100 rounded-t-lg overflow-hidden">
                  <Image
                    width={200}
                    height={200}
                    src={
                      product.images[0]?.url ??
                      "/images/product-placeholder.webp"
                    }
                    alt={product.images[0]?.alt || product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                </div>
              </CardHeader>
              <CardContent className="pt-2 px-2">
                <CardTitle className="text-base mb-1 group-hover:text-blue-600 transition-colors line-clamp-1">
                  {product.name}
                </CardTitle>
              </CardContent>
              <CardFooter className="flex justify-between items-center px-2 pb-2">
                <span className="font-bold text-sm">
                  {formatPrice(product.price, "en-NG", "NGN")}
                </span>
                {product.slashedFrom && (
                  <span className="text-xs text-gray-400 line-through">
                    {formatPrice(product.slashedFrom, "en-NG", "NGN")}
                  </span>
                )}
              </CardFooter>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Product Dialog */}
      {!onProductClick && (
        <Dialog
          open={!!selectedProduct}
          onOpenChange={(open) => {
            if (!open) setSelectedProduct(null);
          }}
        >
          <DialogContent className="max-w-2xl overflow-y-auto max-h-[90vh]">
            {selectedProduct && (
              <>
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold">
                    {selectedProduct.name}
                  </DialogTitle>
                </DialogHeader>
                <div className="flex flex-col md:grid md:grid-cols-2 gap-6 mt-4">
                  <div className="bg-gray-100 rounded-lg overflow-hidden h-64 md:h-auto">
                    <Image
                      width={250}
                      height={250}
                      src={
                        selectedProduct.images[0]?.url ??
                        "/images/product-placeholder.webp"
                      }
                      alt={
                        selectedProduct.images[0]?.alt || selectedProduct.name
                      }
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="space-y-4">
                    <p className="text-gray-600 text-sm md:text-base line-clamp-3">
                      {selectedProduct.description}
                    </p>
                    <div className="flex items-center gap-4">
                      <span className="text-xl md:text-2xl font-bold">
                        {formatPrice(selectedProduct.price, "en-NG", "NGN")}
                      </span>
                      {selectedProduct.slashedFrom && (
                        <span className="text-sm text-gray-400 line-through">
                          {formatPrice(
                            selectedProduct.slashedFrom,
                            "en-NG",
                            "NGN"
                          )}
                        </span>
                      )}
                    </div>
                    <div className="space-x-2">
                      <Badge variant="outline" className="text-xs">
                        {selectedProduct.status}
                      </Badge>
                      {selectedProduct.inStock > 0 ? (
                        <Badge variant="secondary" className="text-xs">
                          In Stock: {selectedProduct.inStock}
                        </Badge>
                      ) : (
                        <Badge variant="destructive" className="text-xs">
                          Out of Stock
                        </Badge>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        className="w-1/2"
                        variant="destructive"
                        onClick={handleDeleteClick}
                        disabled={deleteProductMutation.isPending}
                      >
                         <Trash className="ml-2" />
                      </Button>
                      <Button
                        className="w-1/2"
                        variant="default"
                        onClick={() =>
                          router.push(
                            `/merchant/stores/${storeSlug}/products/${selectedProduct.id}/edit`
                          )
                        }
                      >
                         <Pen className="ml-2" />
                      </Button>
                    </div>
                    {productDetailsPath && (
                      <Button
                        className="w-full gap-2"
                        onClick={() => {
                          router.push(productDetailsPath(selectedProduct))
                        }}
                      >
                        View Full Details
                        <ArrowUpRight size={14} />
                      </Button>
                    )}
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              product &quot;{selectedProduct?.name}&quot; and remove it from
              your store.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteProductMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <Button
              onClick={handleDeleteConfirm}
              disabled={deleteProductMutation.isPending}
              className="bg-red-600 hover:bg-red-700 text-sm py-1"
            >
              {deleteProductMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default GenericProductList;
