import Autoplay from "embla-carousel-autoplay";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Link from "next/link";
import { BannersFromHomePage } from "@/lib/store-utils";
import { Button } from "@/components/ui/button";
import Image from "next/image";

const Banners = ({ banners }: { banners: BannersFromHomePage }) => {
  return (
    <div className="relative w-full py-8 px-8">
      <div className="absolute inset-0 pointer-events-none" />

      <Carousel
        className="w-full max-w-7xl mx-auto"
        plugins={[
          Autoplay({
            delay: 5000,
          }),
        ]}
      >
        <CarouselContent>
          {banners.map((banner) => (
            <CarouselItem key={banner.id} className="lg:basis-full">
              <section className="relative w-full mx-auto bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5">
                <div className="container max-w-7xl mx-auto px-4 py-12 md:py-24">
                  <div className="grid md:grid-cols-2 gap-8 items-center">
                    <div className="space-y-6">
                      <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight line-clamp-3 ">
                        {banner.title}
                      </h1>
                      <p className="text-muted-foreground text-lg max-w-md line-clamp-3">
                        {banner.description}
                      </p>
                      <div className="flex flex-wrap gap-4">
                        <Button size="lg" asChild>
                          <Link href={banner.linkUrl || ""}>Shop Now</Link>
                        </Button>
                      </div>
                    </div>
                    <div className="relative">
                      <div className="aspect-[4/3] rounded-lg overflow-hidden">
                        <Image
                          width={500}
                          height={500}
                          src={banner.imageUrl || ""}
                          alt="Hero Image"
                          className="object-cover w-full h-full"
                        />
                      </div>
                      {/* <div className="absolute -bottom-6 -left-6 bg-background rounded-lg shadow-lg p-4 hidden md:block">
                      <div className="flex items-center gap-3">
                        <div className="bg-primary/10 p-2 rounded-full">
                          <ShoppingBag className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">Special Offer</p>
                          <p className="text-sm text-muted-foreground">
                            Up to 50% off
                          </p>
                        </div>
                      </div>
                    </div> */}
                    </div>
                  </div>
                </div>
              </section>
            </CarouselItem>
          ))}
        </CarouselContent>

        <CarouselPrevious className="hidden lg:flex -left-4 h-10 w-10 border-border/40 bg-background/80 backdrop-blur-sm hover:bg-background" />
        <CarouselNext className="hidden lg:flex -right-4 h-10 w-10 border-border/40 bg-background/80 backdrop-blur-sm hover:bg-background" />
      </Carousel>

      {/* Carousel Indicators */}
      <div className="flex justify-center mt-4 sm:mt-6 gap-1 sm:gap-1.5">
        {banners.map((_, index) => (
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
};

export default Banners;
