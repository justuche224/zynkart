"use client";
import Image from "next/image";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { useQuery } from "@tanstack/react-query";
import { getFeaturedProducts } from "@/actions/store/public/products/featured";
import AddToCart from "@/components/add-to-cart";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import Autoplay from "embla-carousel-autoplay";

const HeroSkeleton = () => {
  return (
    <section className="bg-gradient-to-r from-blue-900 via-purple-800 to-purple-900 text-white pt-16  rounded-bl-full rounded-br-full overflow-hidden">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center min-h-[600px]">
          <div className="flex flex-col justify-center space-y-6 items-center md:items-start w-full">
            <Skeleton className="h-12 w-4/5" />
            <div className="space-y-2 w-full">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </div>
            <Skeleton className="h-10 w-full max-w-xs" />
          </div>
          <div className=" md:flex justify-center items-center mx-auto">
            <Skeleton className="w-full max-w-md aspect-[1/1] rounded-full" />
          </div>
        </div>
      </div>
    </section>
  );
};

const Hero = ({
  storeId,
  productCount,
  circleTime,
  categoryId,
}: {
  storeId: string;
  productCount: number;
  categoryId: string;
  circleTime: number;
}) => {
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
  if (isLoadingProducts) {
    return <HeroSkeleton />;
  }
  if (error) {
    return <div>Error: {error.message}</div>;
  }
  const products = productList || [];
  return (
    <section className="bg-gradient-to-r from-blue-900 via-purple-800 to-purple-900 text-white pt-16 rounded-bl-full rounded-br-full overflow-hidden">
      <Carousel
        className="w-full"
        plugins={[
          Autoplay({
            delay: circleTime * 1000,
          }),
        ]}
      >
        <CarouselContent>
          {products.map((product) => (
            <CarouselItem key={product.id}>
              <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center min-h-[600px]">
                  <div className="flex flex-col justify-center space-y-6 items-center md:items-start lg:ml-12">
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight line-clamp-2 text-center md:text-left">
                      <Link
                        href={`/products/${product.slug}`}
                        className="hover:text-purple-200 transition-colors"
                      >
                        {product.name}
                      </Link>
                    </h1>
                    <p className="text-lg md:text-xl text-purple-100 max-w-lg line-clamp-3 lg:line-clamp-4 text-center md:text-left">
                      <Link
                        href={`/products/${product.slug}`}
                        className="hover:text-purple-200 transition-colors"
                      >
                        {product.description}
                      </Link>
                    </p>
                    <div className="w-full max-w-xs mx-auto">
                      <AddToCart product={product} />
                    </div>
                  </div>

                  <div className="flex justify-center items-center">
                    <div className="relative w-full max-w-md aspect-[1/1] rounded-full overflow-hidden">
                      <Link href={`/products/${product.slug}`}>
                        <Image
                          src={product.images[0].url}
                          alt={product.images[0].alt || product.name}
                          width={400}
                          height={400}
                          className="object-cover w-full h-full"
                        />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>

        <CarouselPrevious className="left-4 bg-white/20 border-white/30 text-white hover:bg-white/30" />
        <CarouselNext className="right-4 bg-white/20 border-white/30 text-white hover:bg-white/30" />
      </Carousel>
    </section>
  );
};

export default Hero;
