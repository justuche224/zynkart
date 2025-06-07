"use client";

import * as React from "react";
import Autoplay from "embla-carousel-autoplay";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { type Banner } from "@/types";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Edit2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { deleteBanner } from "@/actions/banners/delete";
import { useRouter } from "next/navigation";

function BannerDemoDefaultTemplate({
  banners,
  storeSlug,
}: {
  banners: Banner[];
  storeSlug: string;
}) {
  const [api, setApi] = React.useState<CarouselApi>();
  const [current, setCurrent] = React.useState(0);
  const [isPending, startTransition] = React.useTransition();
  const [bannerToDelete, setBannerToDelete] = React.useState<Banner | null>(
    null
  );
  const router = useRouter();
  const handleDelete = (bannerId: string) => {
    startTransition(async () => {
      const { success, error } = await deleteBanner(bannerId, storeSlug);
      if (success) {
        toast.success("Banner deleted successfully");
        setBannerToDelete(null);
        router.refresh();
      } else {
        toast.error(error?.message || "Failed to delete banner");
      }
    });
  };

  React.useEffect(() => {
    if (!api) {
      return;
    }

    setCurrent(api.selectedScrollSnap());

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  const currentBanner = banners[current];

  return (
    <div className="relative w-full py-8 px-8">
      <Dialog
        open={!!bannerToDelete}
        onOpenChange={(isOpen) => {
          if (!isOpen) setBannerToDelete(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Banner</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this banner? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          {bannerToDelete && (
            <div className="my-4">
              <p className="font-semibold">{bannerToDelete.title}</p>
              <div className="mt-2 relative aspect-[4/3] w-full rounded-lg overflow-hidden">
                <Image
                  width={500}
                  height={375}
                  src={bannerToDelete.imageUrl || ""}
                  alt={bannerToDelete.title || "Banner image"}
                  className="object-cover w-full h-full"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setBannerToDelete(null)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => bannerToDelete && handleDelete(bannerToDelete.id)}
              disabled={isPending}
            >
              {isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <div className="absolute right-8 top-8 z-10 flex items-center gap-2">
        {currentBanner && (
          <>
            <Button asChild size="sm" variant="outline">
              <Link
                href={`/merchant/stores/${storeSlug}/banners/${currentBanner.id}/edit`}
              >
                <Edit2 className="mr-2 h-4 w-4" />
                Edit
              </Link>
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => setBannerToDelete(currentBanner)}
              disabled={isPending}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </>
        )}
      </div>
      <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-background to-background/80 pointer-events-none" />

      <Carousel
        setApi={setApi}
        className="w-full max-w-7xl mx-auto"
        plugins={[
          Autoplay({
            delay: 3000,
          }),
        ]}
      >
        <CarouselContent>
          {banners.map((banner) => (
            <CarouselItem key={banner.id}>
              <section className="relative w-[90%] mx-auto bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5">
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
                        {/* <Button size="lg" variant="outline" asChild>
                        <Link href={banner.linkUrl || ""}>Browse Categories</Link>
                      </Button> */}
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
}

export default BannerDemoDefaultTemplate;
