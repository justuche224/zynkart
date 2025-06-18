import { Card, CardFooter } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { useQuery } from "@tanstack/react-query";
import { getFeaturedProducts } from "@/actions/store/public/products/featured";
import {
  getSavedProductIds,
  saveProduct,
  unsaveProduct,
} from "@/actions/store/public/saved/products";
import { useMemo, useEffect, useState } from "react";
import { toast } from "sonner";
import AddToCart from "@/components/add-to-cart";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import formatPrice from "@/lib/price-formatter";
import { Skeleton } from "@/components/ui/skeleton";

export function ProductWheel({
  storeId,
  circleTime = 3,
  productCount = 6,
  categoryId = "all",
}: {
  storeId: string;
  circleTime: number;
  productCount: number;
  categoryId: string;
}) {
  const {
    data: productList,
    isLoading: isLoadingProducts,
    error,
  } = useQuery({
    queryKey: ["featured-products"],
    queryFn: () =>
      getFeaturedProducts({ storeId, limit: productCount, categoryId }),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });

  const { data: savedProductIds, isLoading: isLoadingSavedIds } = useQuery({
    queryKey: ["savedProductIds"],
    queryFn: () => getSavedProductIds(),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
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

  if (isLoading) {
    return (
      <Carousel
        opts={{
          align: "start",
        }}
        className="w-[90%] mx-auto"
      >
        <CarouselContent>
          {Array.from({ length: productCount }).map((_, index) => (
            <CarouselItem
              key={index}
              className="basis-1/2 md:basis-1/3 lg:basis-1/5"
            >
              <div className="p-1">
                <Card className="relative aspect-[1/1.25] flex flex-col justify-end">
                  <div className="p-4 pt-0">
                    <div className="mt-auto space-y-2">
                      <Skeleton className="h-5 w-4/5" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                  </div>
                  <CardFooter className="p-4 pt-0">
                    <Skeleton className="h-10 w-full" />
                  </CardFooter>
                </Card>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="absolute top-1/2 -translate-y-1/2 left-0" />
        <CarouselNext className="absolute top-1/2 -translate-y-1/2 right-0" />
      </Carousel>
    );
  }

  if (error || !products || products.length === 0) return null;

  return (
    <Carousel
      opts={{
        align: "start",
      }}
      plugins={[
        Autoplay({
          delay: circleTime * 1000,
        }),
      ]}
      className="w-[90%] mx-auto"
    >
      <CarouselContent>
        {products.map((product) => (
          <CarouselItem
            key={product.id}
            className="basis-1/2 md:basis-1/3 lg:basis-1/5"
          >
            <div className="p-1">
              <Card
                className="cursor-pointer hover:shadow-lg transition-all aspect-[1/1] bg-cover duration-300 relative"
                style={{
                  backgroundImage: `linear-gradient(to top, rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.4)), url(${product.images[0].url})`,
                }}
              >
                <Link
                  href={`/products/${product.slug}`}
                  className="p-2 pb-1 flex flex-col h-full"
                >
                  <Button
                    size="sm"
                    variant="outline"
                    className="absolute -top-1 -right-1 w-8 h-8 p-0 rounded-full"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleWishlistClick(product.id);
                    }}
                    disabled={wishlistLoading[product.id]}
                  >
                    <Heart
                      className={`h-4 w-4 ${
                        savedStatus[product.id]
                          ? "fill-red-500 text-red-500"
                          : ""
                      }`}
                    />
                    <span className="sr-only">Add to wishlist</span>
                  </Button>
                  <div className="mt-auto">
                    <h3 className=" text-white mb-1 md:mb-2 line-clamp-2 text-balance text-md">
                      {product.name}
                    </h3>

                    <div className="flex items-center justify-between mb-1 md:mb-4">
                      <div className="flex flex-col items-start space-x-2">
                        <span className="text-sm md:text-base font-bold text-white">
                          {formatPrice(product.price)}
                        </span>
                        {product.slashedFrom && (
                          <span className="text-xs md:text-sm text-gray-300 line-through">
                            {formatPrice(product.slashedFrom)}
                          </span>
                        )}
                      </div>
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
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="absolute top-1/2 -translate-y-1/2 left-0" />
      <CarouselNext className="absolute top-1/2 -translate-y-1/2 right-0" />
    </Carousel>
  );
}
