"use client";

import { Card, CardFooter } from "@/components/ui/card";
import formatPrice from "@/lib/price-formatter";
import { Heart } from "lucide-react";
import AddToCart from "@/components/add-to-cart";
import { Button } from "@/components/ui/button";
import { ProductWithImages } from "@/types";
import { useState } from "react";
import { toast } from "sonner";
import Link from "next/link";
import {
  saveProduct,
  unsaveProduct,
} from "@/actions/store/public/saved/products";

interface ProductCardListProps {
  product: ProductWithImages;
  isInitiallySaved?: boolean;
}

const ProductCard = ({ product, isInitiallySaved }: ProductCardListProps) => {
  const [isSaved, setIsSaved] = useState(isInitiallySaved);
  const [isWishlistLoading, setIsWishlistLoading] = useState(false);

  const handleWishlist = async () => {
    setIsWishlistLoading(true);
    try {
      if (isSaved) {
        const result = await unsaveProduct(product.id);
        if (result.success) {
          setIsSaved(false);
          toast.success("Item removed from wishlist");
        } else {
          toast.error(result.error || "Failed to remove from wishlist");
        }
      } else {
        const result = await saveProduct(product.id);
        if (result.success) {
          setIsSaved(true);
          toast.success("Item added to wishlist");
        } else {
          toast.error(result.error || "Failed to add to wishlist");
        }
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsWishlistLoading(false);
    }
  };

  return (
    <Card
      className="cursor-pointer hover:shadow-lg transition-all aspect-[1/1] bg-cover hover:scale-105 duration-300"
      style={{
        backgroundImage: `linear-gradient(to top, rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.4)), url(${product.images[0].url})`,
      }}
    >
      <Link
        href={`/products/${product.slug}`}
        className="p-6 pb-1 flex flex-col h-full"
      >
        <div className="relative mb-4">
          <Button
            size="sm"
            variant="outline"
            className="absolute top-2 right-2 w-8 h-8 p-0 rounded-full"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleWishlist();
            }}
            disabled={isWishlistLoading}
          >
            <Heart
              className={`h-4 w-4 ${
                isSaved ? "fill-red-500 text-red-500" : ""
              }`}
            />
            <span className="sr-only">Add to wishlist</span>
          </Button>
        </div>
        <div className="mt-auto">
          <h3 className="font-semibold text-white mb-2 line-clamp-2">
            {product.name}
          </h3>

          {/* <div className="flex items-center mb-2">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < Math.floor(5)
                      ? "text-yellow-400 fill-current"
                      : "text-gray-300"
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-gray-200 ml-2">(3)</span>
          </div> */}

          <div className="flex items-center justify-between mb-4">
            <div className="flex flex-col items-start space-x-2">
              <span className="text-lg font-bold text-white">
                {formatPrice(product.price)}
              </span>
              {product.slashedFrom && (
                <span className="text-sm text-gray-300 line-through">
                  {formatPrice(product.slashedFrom)}
                </span>
              )}
            </div>
            {/* {product.slashedFrom && (
              <Badge variant="destructive" className="text-xs">
                Sale
              </Badge>
            )} */}
          </div>
        </div>
      </Link>
      <CardFooter
        className="px-4"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
      >
        <AddToCart product={product} />
      </CardFooter>
    </Card>
  );
};

export default ProductCard;
