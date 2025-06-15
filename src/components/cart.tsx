import { LucideProps } from "lucide-react";
import { Button } from "./ui/button";
import Link from "next/link";
import { useCartStore } from "@/store/cart";
import { ForwardRefExoticComponent, RefAttributes } from "react";

export default function Cart({
  Icon,
  variant = "outline",
}: {
  Icon: ForwardRefExoticComponent<
    Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>
  >;
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
}) {
  const cartItemsCount = useCartStore((state) =>
    state.items.reduce((total, item) => total + item.quantity, 0)
  );
  return (
    <Link href="/cart">
      <Button variant={variant} size="icon" className="relative">
        <Icon className="h-5 w-5" />
        {cartItemsCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs rounded-full h-4 w-4 flex items-center justify-center">
            {cartItemsCount}
          </span>
        )}
      </Button>
    </Link>
  );
}
