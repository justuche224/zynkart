import { Card, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const ProductCardSkeleton = () => {
  return (
    <Card className="aspect-[1/1] flex flex-col">
      <div className="p-6 pb-1 flex flex-col h-full">
        <div className="relative mb-4 flex justify-end">
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
        <div className="mt-auto space-y-4">
          <div>
            <Skeleton className="h-5 w-5/6 mb-2" />
            <Skeleton className="h-5 w-3/4" />
          </div>

          <div className="flex items-center justify-between">
            <Skeleton className="h-7 w-1/3" />
            <Skeleton className="h-6 w-14 rounded-md" />
          </div>
        </div>
      </div>
      <CardFooter className="p-4 pt-0">
        <Skeleton className="h-9 w-full" />
      </CardFooter>
    </Card>
  );
};

export default ProductCardSkeleton;
