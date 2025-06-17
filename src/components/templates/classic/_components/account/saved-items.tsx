"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getSavedProducts,
  unsaveProduct,
} from "@/actions/store/public/saved/products";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import Image from "next/image";
import Link from "next/link";
import formatPrice from "@/lib/price-formatter";
import { Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";
import { useCartStore } from "@/store/cart";

const SavedItems = () => {
  const queryClient = useQueryClient();
  const { addItem, items, updateItemQuantity, removeItem } = useCartStore();

  const { data, isLoading, error } = useQuery({
    queryKey: ["saved-products"],
    queryFn: getSavedProducts,
  });

  const unsaveMutation = useMutation({
    mutationFn: (productId: string) => unsaveProduct(productId),
    onSuccess: (_, productId) => {
      toast.success("Item removed from saved items.");
      queryClient.invalidateQueries({ queryKey: ["saved-products"] });
      queryClient.invalidateQueries({ queryKey: ["savedProductIds"] });
      queryClient.invalidateQueries({
        queryKey: ["isProductSaved", productId],
      });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to remove item.");
    },
  });

  const handleRemoveItem = (productId: string) => {
    unsaveMutation.mutate(productId);
  };

  type SavedProduct = NonNullable<NonNullable<typeof data>["data"]>[0];

  const handleAddToCart = (product: SavedProduct) => {
    addItem({
      id: product.slug,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.defaultImage || "",
      inStock: product.inStock,
      productSlug: product.slug,
      trackQuantity: product.trackQuantity,
    });
    toast.success("Item added to cart");
  };

  const handleIncrement = (productSlug: string) => {
    const cartItem = items.find((i) => i.id === productSlug);
    if (cartItem) {
      updateItemQuantity(productSlug, cartItem.quantity + 1);
      toast.success("Item quantity updated");
    }
  };

  const handleDecrement = (productSlug: string) => {
    const cartItem = items.find((i) => i.id === productSlug);
    if (cartItem) {
      if (cartItem.quantity === 1) {
        removeItem(productSlug);
        toast.success("Item removed from cart");
      } else {
        updateItemQuantity(productSlug, cartItem.quantity - 1);
        toast.success("Item quantity updated");
      }
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Saved Items</CardTitle>
          <CardDescription>View and manage your saved items</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="flex items-center space-x-4 border-b pb-4"
              >
                <Skeleton className="h-24 w-24 rounded-md" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-1/4" />
                </div>
                <div className="flex flex-col gap-2">
                  <Skeleton className="h-10 w-32" />
                  <Skeleton className="h-10 w-28" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || data?.error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Saved Items</CardTitle>
          <CardDescription>View and manage your saved items</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-destructive">
            Error: {error?.message || data?.error}
          </p>
        </CardContent>
      </Card>
    );
  }

  const savedProducts = data?.data || [];

  return (
    <Card className="dark:bg-[#121212] bg-[#f5f5f5]">
      <CardHeader>
        <CardTitle>Saved Items</CardTitle>
        <CardDescription>View and manage your saved items.</CardDescription>
      </CardHeader>
      <CardContent>
        {savedProducts.length === 0 ? (
          <p className="text-muted-foreground pt-4">You have no saved items.</p>
        ) : (
          <div className="space-y-6">
            {savedProducts.map((item) => {
              const cartItem = items.find((ci) => ci.id === item.slug);
              return (
                <div
                  key={item.id}
                  className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4 border-b pb-6 last:border-b-0"
                >
                  <Link href={`/products/${item.slug}`}>
                    <div className="relative h-24 w-24 rounded-md overflow-hidden flex-shrink-0">
                      <Image
                        src={item.defaultImage || "/placeholder.png"}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  </Link>
                  <div className="flex-1">
                    <Link
                      href={`/products/${item.slug}`}
                      className="hover:underline"
                    >
                      <h3 className="font-semibold">{item.name}</h3>
                    </Link>
                    <p className="text-sm text-muted-foreground">
                      {item.categoryName}
                    </p>
                    <p className="font-bold text-lg mt-1">
                      {formatPrice(item.price, "en-NG", "NGN")}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    {cartItem ? (
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-9 w-9 p-0"
                          onClick={() => handleDecrement(item.slug)}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="text-sm font-medium w-6 text-center">
                          {cartItem.quantity}
                        </span>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-9 w-9 p-0"
                          onClick={() => handleIncrement(item.slug)}
                          disabled={
                            item.trackQuantity &&
                            cartItem.quantity >= item.inStock
                          }
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        className="w-full sm:w-auto"
                        onClick={() => handleAddToCart(item)}
                        disabled={item.trackQuantity && item.inStock <= 0}
                      >
                        <ShoppingCart className="mr-2 h-4 w-4" />
                        {item.trackQuantity && item.inStock <= 0
                          ? "Out of Stock"
                          : "Add to Cart"}
                      </Button>
                    )}

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRemoveItem(item.id)}
                      disabled={unsaveMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Remove</span>
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SavedItems;
