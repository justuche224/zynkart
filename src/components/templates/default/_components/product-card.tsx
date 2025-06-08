import { useState } from "react";
import { Heart, Minus, Plus, ShoppingCart } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { ProductWithImages } from "@/types";
import { useCartStore } from "@/store/cart";
import formatPrice from "@/lib/price-formatter";
import Link from "next/link";

interface ProductCardProps {
  product: ProductWithImages;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const { items, addItem, removeItem, updateItemQuantity } = useCartStore();
  const [isHovered, setIsHovered] = useState(false);
  const cartItem = items.find((item) => item.id === product.slug);
  const isOnSale = product.slashedFrom && product.slashedFrom > product.price;

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

  const handleWishlist = () => {
    toast.success("Item added to wishlist");
  };

  return (
    <div
      className="group overflow-hidden border-none shadow-sm hover:shadow-md transition-all duration-300 bg-card rounded-md"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="p-0 relative">
        <Link
          href={`/products/${product.slug}`}
          className="block aspect-square overflow-hidden"
        >
          <img
            src={product.images[0]?.url || "/placeholder.png"}
            alt={product.images[0]?.alt || product.name}
            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500 cursor-pointer"
          />
          {product.images.length > 1 && isHovered && (
            <img
              src={product.images[1]?.url || "/placeholder.png"}
              alt={product.images[1]?.alt || `${product.name} - alternate view`}
              className="object-cover w-full h-full absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer"
            />
          )}
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

        <Button
          variant="secondary"
          size="icon"
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 bg-white/80 hover:bg-white text-black"
          onClick={handleWishlist}
        >
          <Heart className="h-4 w-4" />
          <span className="sr-only">Add to wishlist</span>
        </Button>
      </div>

      <div className="p-3">
        <Link href={`/products/${product.slug}`} className="block">
          <h3 className="font-medium text-sm line-clamp-1 mb-1 hover:underline">
            {product.name}
          </h3>
        </Link>

        <div className="flex items-baseline gap-2">
          <span className="text-sm font-bold">
            {formatPrice(product.price, "en-NG", "NGN")}
          </span>
          {product.slashedFrom && (
            <span className="text-xs text-muted-foreground line-through">
              {formatPrice(product.slashedFrom, "en-NG", "NGN")}
            </span>
          )}
        </div>
      </div>

      <div className="p-3 pt-0">
        {!cartItem ? (
          <Button
            size="sm"
            className="w-full gap-1 text-xs"
            onClick={handleAddToCart}
            disabled={product.trackQuantity && product.inStock <= 0}
          >
            <ShoppingCart className="h-3 w-3" />
            {product.trackQuantity ? (
              product.inStock > 0 ? "Add to Cart" : "Out of Stock"
            ) : (
              "Add to Cart"
            )}
          </Button>
        ) : (
          <div className="flex items-center justify-between w-full">
            <Button
              size="sm"
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={handleDecrement}
            >
              <Minus className="h-3 w-3" />
            </Button>
            <span className="text-sm font-medium">{cartItem.quantity}</span>
            <Button
              size="sm"
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={handleIncrement}
              disabled={
                product.trackQuantity &&
                cartItem.quantity >= product.inStock
              }
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
