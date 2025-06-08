"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Minus, Plus, ShoppingCart, Heart, ArrowLeft } from "lucide-react";
import { formatDate } from "@/lib/date-formatter";
import { toast } from "sonner";
import { useCartStore } from "@/store/cart";
import ReviewsSection from "./_components/reviews-section";
import Link from "next/link";
import { SiteHeader } from "./_components/navbar";
import { ProductInfoFromProductPage } from "@/app/store/[storeSlug]/products/[productSlug]/page";
import { StoreDataFromHomePage } from "@/app/store/[storeSlug]/page";
import { Footer } from "./_components/footer";

interface ProductInfoPageProps {
  product: ProductInfoFromProductPage;
  store: StoreDataFromHomePage;
}

const ProductInfoPage = ({ product, store }: ProductInfoPageProps) => {
  const { items, addItem, removeItem, updateItemQuantity } = useCartStore();
  const cartItem = items.find((item) => item.id === product.id);
  const [selectedImage, setSelectedImage] = useState(product.images[0]);

  const handleAddToCart = () => {
    addItem({
      id: product.id,
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
      updateItemQuantity(product.id, cartItem.quantity + 1);
      toast.success("Item quantity updated");
    }
  };

  const handleDecrement = () => {
    if (cartItem) {
      if (cartItem.quantity === 1) {
        removeItem(product.id);
        toast.success("Item removed from cart");
      } else {
        updateItemQuantity(product.id, cartItem.quantity - 1);
        toast.success("Item quantity updated");
      }
    }
  };

  const discount = product.slashedFrom
    ? Math.round(
        ((product.slashedFrom - product.price) / product.slashedFrom) * 100
      )
    : 0;

  return (
    <>
      <SiteHeader storeId={store.id} storeSlug={store.slug} storeName={store.name} />
      <div className="container max-w-6xl mx-auto px-4 pb-8 mt-20">
        {/* back button */}
        <div className="mb-4">
          <Link href="..">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Image Section */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative aspect-square overflow-hidden rounded-lg border">
              <img
                src={selectedImage.url}
                alt={product.name || ""}
                className="object-cover"
              />
            </div>

            {/* Thumbnail Gallery */}
            {product.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {product.images.map((image) => (
                  <button
                    key={image.url}
                    onClick={() => setSelectedImage(image)}
                    className={`relative w-20 aspect-square rounded-md overflow-hidden border-2 
                    ${
                      selectedImage.url === image.url
                        ? "border-primary"
                        : "border-transparent"
                    }`}
                  >
                    <img
                      src={image.url}
                      alt={product.name || ""}
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info Section */}
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold mb-2">
                {product.name}
              </h1>
              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-2xl font-bold">
                  ₦{product.price.toLocaleString()}
                </span>
                {product.slashedFrom && (
                  <>
                    <span className="text-lg text-muted-foreground line-through">
                      ₦{product.slashedFrom.toLocaleString()}
                    </span>
                    <span className="text-sm px-2 py-1 bg-red-100 text-red-700 rounded-md">
                      -{discount}%
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Stock Status */}
            <div>
              <div className="flex items-center gap-2 text-sm">
                <span
                  className={`h-3 w-3 rounded-full ${
                    product.inStock > 0 ? "bg-green-500" : "bg-red-500"
                  }`}
                />
                <span>{product.inStock > 0 ? "In Stock" : "Out of Stock"}</span>
                {product.inStock > 0 && (
                  <span className="text-muted-foreground">
                    ({product.inStock} units available)
                  </span>
                )}
              </div>
            </div>

            {/* Add to Cart Section */}
            <div className="flex items-center gap-4">
              {!cartItem ? (
                <Button
                  size="lg"
                  className="flex-1 gap-2"
                  onClick={handleAddToCart}
                  disabled={!product.inStock}
                >
                  <ShoppingCart className="h-5 w-5" />
                  Add to Cart
                </Button>
              ) : (
                <div className="flex items-center gap-4 flex-1">
                  <Button size="lg" variant="outline" onClick={handleDecrement}>
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="text-xl font-medium min-w-[3ch] text-center">
                    {cartItem.quantity}
                  </span>
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={handleIncrement}
                    disabled={cartItem.quantity >= product.inStock}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              )}
              <Button size="lg" variant="outline">
                <Heart className="h-5 w-5" />
              </Button>
            </div>

            {/* Description */}
            {product.description && (
              <div className="pt-6 border-t">
                <h2 className="text-lg font-semibold mb-2">Description</h2>
                <div className="prose prose-sm max-w-none">
                  <p className="text-muted-foreground">{product.description}</p>
                </div>
              </div>
            )}

            {/* Additional Info */}
            <div className="pt-6 border-t">
              <h2 className="text-lg font-semibold mb-4">Product Details</h2>
              <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <dt className="text-sm text-muted-foreground">SKU</dt>
                  <dd className="text-sm font-medium">
                    {product.id.slice(0, 8).toUpperCase()}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">
                    Last Updated
                  </dt>
                  <dd className="text-sm font-medium">
                    <p>{formatDate(product.updatedAt, "MMMM do, yyyy")}</p>
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
        <ReviewsSection />
      </div>
      <Footer storeSlug={store.slug} />
    </>
  );
};

export default ProductInfoPage;
