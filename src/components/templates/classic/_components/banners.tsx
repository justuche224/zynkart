import { Button } from "@/components/ui/button";
import { BannersFromHomePage } from "@/lib/store-utils";
import Image from "next/image";
import Link from "next/link";

export function Banners({ banners }: { banners: BannersFromHomePage }) {
  return (
    <>
      {banners.map((banner) => (
        <div key={banner.id}>
          <div className="md:flex justify-between gap-4 py-2 px-4 max-w-7xl mx-auto hidden">
            <div className="w-1/2 flex flex-col justify-center ">
              <h1 className="text-2xl font-bold tracking-tight text-balance line-clamp-2 md:text-4xl lg:text-6xl">
                {banner.title}
              </h1>
              <p className="text-muted-foreground text-sm line-clamp-3 md:text-lg lg:text-2xl">
                {banner.description}
              </p>
              <Button className="mt-2 w-fit md:text-lg lg:text-xl lg:w-fit">
                Shop Now
              </Button>
            </div>
            <div className="w-1/2 flex items-center justify-end">
              <Image
                src={banner.imageUrl}
                alt={banner.title || "Banner Image"}
                width={500}
                height={500}
                className="rounded-tr-2xl rounded-bl-2xl"
              />
            </div>
          </div>
          {/* mobile banner */}
          <div
            style={{
              backgroundImage: `linear-gradient(to top, rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.4)), url(${banner.imageUrl})`,
            }}
            className="bg-cover bg-center w-full h-64 block md:hidden"
          >
            <div className="flex justify-between gap-4 py-2 px-4 max-w-7xl mx-auto h-full">
              <div className="w-1/2 flex flex-col justify-center h-full">
                <h1 className="text-2xl font-bold tracking-tight text-balance line-clamp-2 md:text-4xl lg:text-6xl text-primary">
                  {banner.title || "Banner Text Here"}
                </h1>
                <p className="text-sm line-clamp-3 md:text-lg lg:text-2xl text-white">
                  {banner.description ||
                    "Lorem ipsum dolor sit amet consectetur, adipisicing elit. Iste distinctio voluptatum culpa laboriosam qui illum? Rerum corporis natus beatae qui illo ducimus dolores incidunt ipsum exercitationem vitae. Unde, natus repellat?"}
                </p>
                <Button asChild className="w-fit mt-2">
                  <Link href={banner.linkUrl || "/"}>Shop Now</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </>
  );
}
