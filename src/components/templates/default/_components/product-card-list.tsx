import { useState } from "react";
import { Heart, Minus, Plus, ShoppingCart } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { ProductWithImages } from "@/types";
import { useCartStore } from "@/store/cart";
import formatPrice from "@/lib/price-formatter";
import Link from "next/link";
import {
  saveProduct,
  unsaveProduct,
} from "@/actions/store/public/saved/products";

interface ProductCardListProps {
  product: ProductWithImages;
  isInitiallySaved?: boolean;
}

const ProductCardList = ({
  product,
  isInitiallySaved = false,
}: ProductCardListProps) => {
  const { items, addItem, removeItem, updateItemQuantity } = useCartStore();
  const cartItem = items.find((item) => item.id === product.slug);
  const isOnSale = product.slashedFrom && product.slashedFrom > product.price;
  const [isSaved, setIsSaved] = useState(isInitiallySaved);
  const [isWishlistLoading, setIsWishlistLoading] = useState(false);

  const handleAddToCart = () => {
    addItem({
      id: product.slug,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.images[0].url,
      inStock: product?.inStock,
      productSlug: product.slug,
      trackQuantity: product.trackQuantity,
    });
    toast.success("Item added to cart");
  };

  const handleIncrement = () => {
    if (cartItem) {
      updateItemQuantity(product.slug, cartItem.quantity + 1);
      toast.success("Item quantity updated");
    }
  };

  const handleDecrement = () => {
    if (cartItem) {
      if (cartItem.quantity === 1) {
        removeItem(product.slug);
        toast.success("Item removed from cart");
      } else {
        updateItemQuantity(product.slug, cartItem.quantity - 1);
        toast.success("Item quantity updated");
      }
    }
  };

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
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsWishlistLoading(false);
    }
  };

  return (
    <div className="overflow-hidden border-none shadow-sm hover:shadow-md transition-all duration-300 bg-card rounded-md">
      <div className="flex flex-col sm:flex-row">
        <div className="relative w-full sm:w-48 h-48">
          <Link href={`/products/${product.slug}`} className="block h-full">
            <img
              src={product.images[0]?.url || "/placeholder.png"}
              alt={product.images[0]?.alt || product.name}
              className="object-cover w-full h-full hover:scale-105 transition-transform duration-500 cursor-pointer"
            />
          </Link>

          {product.trackQuantity && product.inStock <= 0 && (
            <Badge variant="secondary" className="absolute top-2 left-2">
              Out of Stock
            </Badge>
          )}

          {isOnSale && (
            <Badge variant="destructive" className="absolute top-2 left-2">
              Sale
            </Badge>
          )}
        </div>

        <div className="flex-1 p-4 flex flex-col">
          <div className="flex justify-between items-start mb-2">
            <Link href={`/products/${product.slug}`} className="block">
              <h3 className="font-medium text-lg hover:underline">
                {product.name}
              </h3>
            </Link>

            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={handleWishlist}
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

          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
            {product.description ||
              "No description available for this product."}
          </p>

          <div className="mt-auto">
            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-lg font-bold">
                {formatPrice(product.price, "en-NG", "NGN")}
              </span>
              {product.slashedFrom && (
                <span className="text-sm text-muted-foreground line-through">
                  {formatPrice(product.slashedFrom, "en-NG", "NGN")}
                </span>
              )}
            </div>

            <div className="flex items-center gap-4">
              {!cartItem ? (
                <Button
                  className="gap-1"
                  onClick={handleAddToCart}
                  disabled={product.trackQuantity && product.inStock <= 0}
                >
                  <ShoppingCart className="h-4 w-4" />
                  {product.trackQuantity
                    ? product.inStock > 0
                      ? "Add to Cart"
                      : "Out of Stock"
                    : "Add to Cart"}
                </Button>
              ) : (
                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleDecrement}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="text-sm font-medium w-6 text-center">
                    {cartItem.quantity}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleIncrement}
                    disabled={
                      product.trackQuantity &&
                      cartItem.quantity >= product.inStock
                    }
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCardList;
