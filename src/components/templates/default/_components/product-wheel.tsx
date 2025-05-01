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
import { ArrowRight } from "lucide-react";
import { Product } from "@/types";
import Link from "next/link";

function ProductWheel({ productList }: { productList: Product[] }) {
  return (
    <div className="relative w-full py-8 px-8">
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
          {productList.map((product) => (
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
                        <img
                          src={product.images[0].url || "/placeholder.svg"}
                          alt={product.name}
                          width={400}
                          height={400}
                          className="object-cover object-center w-full h-full transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>

                      <div className="absolute inset-0 rounded-lg sm:rounded-xl ring-1 ring-inset ring-black/10 dark:ring-white/10 group-hover:ring-primary/20 transition-all duration-300" />
                    </Link>
                  </div>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>

        <CarouselPrevious className="hidden lg:flex -left-4 h-10 w-10 border-border/40 bg-background/80 backdrop-blur-sm hover:bg-background" />
        <CarouselNext className="hidden lg:flex -right-4 h-10 w-10 border-border/40 bg-background/80 backdrop-blur-sm hover:bg-background" />
      </Carousel>

      {/* Carousel Indicators */}
      <div className="flex justify-center mt-4 sm:mt-6 gap-1 sm:gap-1.5">
        {productList.map((_, index) => (
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
