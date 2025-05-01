import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/cart";
import { Product } from "@/types";
import { Minus, Plus, ShoppingCart } from "lucide-react";
import { toast } from "sonner";

const AddToCart = ({ product }: { product: Product }) => {
  const { items, addItem, removeItem, updateItemQuantity } = useCartStore();
  const cartItem = items.find((item) => item.id === product.slug);

  const isOutOfStock = product.trackQuantity && product.inStock <= 0;

  const handleAddToCart = () => {
    if (isOutOfStock) {
      toast.error("This item is out of stock");
      return;
    }

    addItem({
      id: product.slug,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.images[0].url,
      inStock: product?.inStock,
      productSlug: product.slug,
    });
    toast.success("Item added to cart");
  };

  const handleIncrement = () => {
    if (
      product.trackQuantity &&
      cartItem &&
      cartItem.quantity >= product.inStock
    ) {
      toast.error(`Sorry, only ${product.inStock} item(s) available`);
      return;
    }

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

  return (
    <>
      {!cartItem ? (
        <Button
          size="sm"
          className="w-full gap-1 text-xs"
          onClick={handleAddToCart}
          disabled={isOutOfStock}
        >
          <ShoppingCart className="h-3 w-3" />
          {isOutOfStock ? "Out of Stock" : "Add to Cart"}
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
              product.trackQuantity && cartItem.quantity >= product.inStock
            }
          >
            <Plus className="h-3 w-3" />
          </Button>
        </div>
      )}
    </>
  );
};

export default AddToCart;
