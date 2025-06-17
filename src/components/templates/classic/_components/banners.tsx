import { Button } from "@/components/ui/button";
import { BannersFromHomePage } from "@/lib/store-utils";
import Image from "next/image";

export function Banners({ banners }: { banners: BannersFromHomePage }) {
  return (
    <div className="flex justify-between gap-4 py-2 px-4 max-w-7xl mx-auto">
      <div className="w-1/2 flex flex-col justify-center ">
        <h1 className="text-2xl font-bold tracking-tight text-balance line-clamp-2 md:text-4xl lg:text-6xl">
          Banner Text Here
        </h1>
        <p className="text-muted-foreground text-sm line-clamp-3 md:text-lg lg:text-2xl">
          Lorem ipsum dolor sit amet consectetur, adipisicing elit. Iste
          distinctio voluptatum culpa laboriosam qui illum? Rerum corporis natus
          beatae qui illo ducimus dolores incidunt ipsum exercitationem vitae.
          Unde, natus repellat?
        </p>
        <Button className="mt-2 w-fit md:text-lg lg:text-xl lg:w-fit">
          Shop Now
        </Button>
      </div>
      <div className="w-1/2 flex items-center justify-end">
        <Image
          src={banners[0].imageUrl}
          alt={banners[0].title || "Banner Image"}
          width={500}
          height={500}
          className="rounded-tr-2xl rounded-bl-2xl"
        />
      </div>
    </div>
  );
}
