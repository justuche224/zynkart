import Autoplay from "embla-carousel-autoplay";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import formatPrice from "@/lib/price-formatter";
import AddToCart from "@/components/add-to-cart";
import { ArrowRight, Heart } from "lucide-react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { getFeaturedProducts } from "@/actions/store/public/products/featured";
import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  getSavedProductIds,
  saveProduct,
  unsaveProduct,
} from "@/actions/store/public/saved/products";
import Image from "next/image";

function ProductWheelSkeleton() {
  return (
    <div className="relative w-full py-2 md:py-8 px-2 md:px-8">
      <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-background to-background/80 pointer-events-none" />
      <div className="w-full max-w-7xl mx-auto animate-pulse">
        <div className="relative w-full overflow-hidden rounded-2xl p-4 sm:p-6 lg:p-10 bg-gradient-to-br from-background to-muted/50 border border-border/40 shadow-lg">
          <div className="flex flex-row justify-between items-center gap-4 sm:gap-8 lg:gap-12">
            {/* Product Details Skeleton */}
            <div className="flex-1 space-y-3 sm:space-y-4 lg:space-y-6">
              <div className="space-y-2 sm:space-y-3">
                <div className="h-7 sm:h-8 lg:h-9 w-3/4 bg-muted rounded-md"></div>
                <div className="space-y-2 pt-2">
                  <div className="h-4 sm:h-5 w-full bg-muted rounded-md"></div>
                  <div className="h-4 sm:h-5 w-5/6 bg-muted rounded-md"></div>
                </div>
              </div>

              <div className="h-8 sm:h-9 lg:h-10 w-1/3 bg-muted rounded-md"></div>

              <div className="flex items-center gap-2">
                <div className="h-6 w-20 bg-muted rounded-full"></div>
              </div>

              <div className="flex flex-col gap-2 sm:gap-4 items-start pt-2">
                <div className="h-10 sm:h-11 w-full max-w-[140px] sm:max-w-[160px] lg:min-w-[180px] bg-muted rounded-lg"></div>
                <div className="h-5 w-24 bg-muted rounded-md"></div>
              </div>
            </div>

            {/* Product Image Skeleton */}
            <div className="relative flex-shrink-0">
              <div className="relative aspect-square w-28 sm:w-32 lg:w-[350px] bg-muted rounded-lg sm:rounded-xl"></div>
            </div>
          </div>
        </div>
        {/* Carousel Indicators Skeleton */}
        <div className="flex justify-center mt-4 sm:mt-6 gap-1 sm:gap-1.5">
          {[...Array(5)].map((_, index) => (
            <div
              key={index}
              className={`h-1 sm:h-1.5 rounded-full ${
                index === 0 ? "w-4 sm:w-6 bg-muted" : "w-1 sm:w-1.5 bg-muted/50"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function ProductWheel({ storeId }: { storeId: string }) {
  const {
    data: productList,
    isLoading: isLoadingProducts,
    error,
  } = useQuery({
    queryKey: ["featured-products"],
    queryFn: () => getFeaturedProducts({ storeId, limit: 5 }),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });

  const { data: savedProductIds, isLoading: isLoadingSavedIds } = useQuery({
    queryKey: ["savedProductIds"],
    queryFn: () => getSavedProductIds(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const [savedStatus, setSavedStatus] = useState<{ [key: string]: boolean }>(
    {}
  );
  const [wishlistLoading, setWishlistLoading] = useState<{
    [key: string]: boolean;
  }>({});

  const products = useMemo(() => productList || [], [productList]);

  useEffect(() => {
    if (savedProductIds && products) {
      const initialStatus = products.reduce((acc, product) => {
        acc[product.id] = savedProductIds.includes(product.id);
        return acc;
      }, {} as { [key: string]: boolean });
      setSavedStatus(initialStatus);
    }
  }, [savedProductIds, products]);

  const handleWishlistClick = async (productId: string) => {
    setWishlistLoading((prev) => ({ ...prev, [productId]: true }));
    const isCurrentlySaved = savedStatus[productId];

    try {
      if (isCurrentlySaved) {
        const result = await unsaveProduct(productId);
        if (result.success) {
          toast.success("Product removed from wishlist");
          setSavedStatus((prev) => ({ ...prev, [productId]: false }));
        } else {
          toast.error(result.error || "Failed to remove from wishlist");
        }
      } else {
        const result = await saveProduct(productId);
        if (result.success) {
          toast.success("Product added to wishlist");
          setSavedStatus((prev) => ({ ...prev, [productId]: true }));
        } else {
          toast.error(result.error || "Failed to add to wishlist");
        }
      }
    } catch (error) {
      console.error(error);
      toast.error("An unexpected error occurred.");
    } finally {
      setWishlistLoading((prev) => ({ ...prev, [productId]: false }));
    }
  };

  const isLoading = isLoadingProducts || isLoadingSavedIds;

  if (isLoading) return <ProductWheelSkeleton />;

  if (error || !products || products.length === 0) return null;

  return (
    <div className="relative w-full py-2 md:py-8 px-2 md:px-8">
      <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-background to-background/80 pointer-events-none" />

      <Carousel
        className="w-full max-w-7xl mx-auto"
        plugins={[
          Autoplay({
            delay: 5000,
          }),
        ]}
      >
        <CarouselContent>
          {products?.map((product) => {
            const isSaved = savedStatus[product.id] ?? false;
            const isWishlistActionLoading =
              wishlistLoading[product.id] ?? false;
            return (
              <CarouselItem key={product.slug} className="lg:basis-full">
                <div className="relative w-full overflow-hidden rounded-2xl p-4 sm:p-6 lg:p-10 bg-gradient-to-br from-background to-muted/50 border border-border/40 shadow-lg">
                  <div className="flex flex-row justify-between items-center gap-4 sm:gap-8 lg:gap-12">
                    {/* Product Details */}
                    <div className="flex-1 space-y-3 sm:space-y-4 lg:space-y-6">
                      <div className="space-y-1 sm:space-y-2">
                        <Link
                          href={`/products/${product.slug}`}
                          className="group transition-all duration-300"
                        >
                          <h2 className="text-lg sm:text-xl lg:text-3xl font-bold tracking-tight group-hover:text-primary transition-colors">
                            {product.name}
                          </h2>

                          <p className="text-muted-foreground line-clamp-2 sm:line-clamp-3 lg:line-clamp-4 mt-1 sm:mt-2 text-xs sm:text-sm lg:text-base">
                            {product.description}
                          </p>
                        </Link>
                      </div>

                      <div className="flex items-baseline gap-2 sm:gap-3">
                        <span className="text-lg sm:text-xl lg:text-3xl font-bold text-primary">
                          {formatPrice(product.price, "en-NG", "NGN")}
                        </span>
                        {product.slashedFrom && (
                          <span className="line-through text-muted-foreground text-xs sm:text-sm lg:text-base">
                            {formatPrice(product.slashedFrom, "en-NG", "NGN")}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {product.trackQuantity && (
                          <span
                            className={`inline-flex items-center px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs font-medium ${
                              product.inStock > 0
                                ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                            }`}
                          >
                            {product.inStock > 0 ? "In Stock" : "Out of Stock"}
                          </span>
                        )}
                      </div>

                      <div className="flex flex-col gap-2 sm:gap-4 items-start">
                        <div className="w-full max-w-[140px] sm:max-w-[160px] lg:min-w-[180px]">
                          <AddToCart product={product} />
                        </div>

                        <Link
                          href={`/products/${product.slug}`}
                          className="inline-flex items-center text-xs sm:text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                        >
                          View Details
                          <ArrowRight className="ml-1 h-3 w-3 sm:h-4 sm:w-4" />
                        </Link>
                      </div>
                    </div>

                    {/* Product Image */}
                    <div className="relative flex-shrink-0">
                      <Link
                        href={`/products/${product.slug}`}
                        className="block group relative overflow-hidden rounded-lg sm:rounded-xl bg-background/50 p-1 sm:p-2 transition-all duration-300 hover:shadow-xl"
                      >
                        <div className="relative aspect-square w-28 sm:w-32 lg:w-[350px] overflow-hidden rounded-md sm:rounded-lg">
                          <Image
                            src={product.images[0].url || "/placeholder.svg"}
                            alt={product.name}
                            width={400}
                            height={400}
                            className="object-cover object-center w-full h-full transition-transform duration-500 group-hover:scale-105"
                            priority
                          />
                        </div>

                        <div className="absolute inset-0 rounded-lg sm:rounded-xl ring-1 ring-inset ring-black/10 dark:ring-white/10 group-hover:ring-primary/20 transition-all duration-300" />
                        <Button
                          variant="secondary"
                          size="icon"
                          className="absolute top-3 right-3 z-10 h-8 w-8 rounded-full bg-white/80 text-black shadow-md transition-all hover:bg-white opacity-0 group-hover:opacity-100"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleWishlistClick(product.id);
                          }}
                          disabled={isWishlistActionLoading}
                        >
                          <Heart
                            className={`h-4 w-4 transition-colors ${
                              isSaved
                                ? "fill-red-500 text-red-500"
                                : "text-neutral-700"
                            }`}
                          />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </CarouselItem>
            );
          })}
        </CarouselContent>

        <CarouselPrevious className="hidden lg:flex -left-4 h-10 w-10 border-border/40 bg-background/80 backdrop-blur-sm hover:bg-background" />
        <CarouselNext className="hidden lg:flex -right-4 h-10 w-10 border-border/40 bg-background/80 backdrop-blur-sm hover:bg-background" />
      </Carousel>

      {/* Carousel Indicators */}
      <div className="flex justify-center mt-4 sm:mt-6 gap-1 sm:gap-1.5">
        {products?.map((_, index) => (
          <div
            key={index}
            className={`h-1 sm:h-1.5 rounded-full transition-all duration-300 ${
              index === 0
                ? "w-4 sm:w-6 bg-primary"
                : "w-1 sm:w-1.5 bg-muted-foreground/30"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

export default ProductWheel;
