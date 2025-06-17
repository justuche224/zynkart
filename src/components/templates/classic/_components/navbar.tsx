"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import Cart from "@/components/cart";
import { ModeToggle } from "@/components/mode-toggle";
import NavUser from "@/components/nav-user";
import { Input } from "@/components/ui/input";
import {
  HelpCircleIcon,
  Menu,
  PackageIcon,
  PercentIcon,
  SearchIcon,
  SettingsIcon,
  ShoppingBasket,
  ShoppingCartIcon,
  TagsIcon,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { categoryList } from "@/actions/store/public/category/list";
import { useQuery } from "@tanstack/react-query";

const LIMIT = 7;

const data = {
  user: {
    name: "shadcn",
    email: "johndoe@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Products",
      url: "/products",
      icon: PackageIcon,
    },
    {
      title: "Categories",
      url: "/categories",
      icon: TagsIcon,
    },
    {
      title: "Promotions",
      url: "/promotions",
      icon: PercentIcon,
    },
    {
      title: "Orders",
      url: "/orders",
      icon: ShoppingCartIcon,
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "#",
      icon: SettingsIcon,
    },
    {
      title: "Get Help",
      url: "#",
      icon: HelpCircleIcon,
    },
    {
      title: "Search",
      url: "#",
      icon: SearchIcon,
    },
  ],
};

export default function Navbar({
  storeSlug,
  storeName,
  storeId,
}: {
  storeSlug: string;
  storeName: string;
  storeId: string;
}) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const currentPath = usePathname();

  const router = useRouter();

  function handleSearch(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!query) return;
    router.push(`/search?q=${query}`);
  }

  return (
    <header className="w-full bg-white/60 dark:bg-black/70 text-black dark:text-white backdrop-blur-lg py-2 px-4 fixed top-0 left-0 right-0 z-50 flex flex-col gap-1">
      <nav className="flex items-center justify-between gap-5">
        <div>
          <Link href="/">
            <h1 className="md:text-2xl font-bold text-base text-nowrap sm:hidden">
              {storeName.length > 10 ? storeName.slice(0, 10) + "..." : storeName}
            </h1>
          </Link>
          <Link href="/" className="hidden sm:block">
            <h1 className="text-xl font-bold">
              {storeName.length > 10
                ? storeName.slice(0, 10) + "..."
                : storeName}
            </h1>
          </Link>
        </div>
        <form
          onSubmit={handleSearch}
          className="w-2/3 max-w-2xl hidden md:block"
        >
          <Input
            placeholder="Search for products"
            className="w-full rounded-full bg-slate-200 dark:bg-slate-800 dark:text-white text-black"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </form>
        <div className="flex gap-4">
          <Cart Icon={ShoppingBasket} variant="ghost" />
          <ModeToggle variant="ghost" />
          <NavUser variant="ghost" storeSlug={storeSlug} />
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="cursor-pointer">
                <Menu />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <SheetHeader>
                <Link href="/">
                  <SheetTitle>{storeName}</SheetTitle>
                </Link>
              </SheetHeader>
              <NavigationMenu
                pathname={currentPath}
                onItemClick={() => setIsOpen(false)}
                storeId={storeId}
              />
            </SheetContent>
          </Sheet>
        </div>
      </nav>
      <form
        onSubmit={handleSearch}
        className="w-full max-w-2xl block md:hidden"
      >
        <Input
          placeholder="Search for products"
          className="w-full rounded-full bg-slate-200 dark:bg-slate-800 dark:text-white text-black"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </form>
    </header>
  );
}

function NavigationMenu({
  pathname,
  onItemClick,
  storeId,
}: {
  pathname: string;
  onItemClick: () => void;
  storeId: string;
}) {
  const {
    data: categories,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["categories-list-navbar", storeId],
    queryFn: () => categoryList({ storeId, limit: LIMIT }),
  });

  return (
    <ScrollArea className="py-4 h-full overflow-y-auto pb-16">
      <div className="space-y-1 px-3">
        <h3 className="mb-2 text-sm font-semibold">Main Navigation</h3>
        {data.navMain.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.title}
              href={item.url}
              onClick={onItemClick}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium",
                pathname === item.url
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted"
              )}
            >
              <Icon className="h-5 w-5" />
              {item.title}
            </Link>
          );
        })}
      </div>

      <Separator className="my-4" />

      <div className="space-y-1 px-3">
        <h3 className="mb-2 text-sm font-semibold">Categories</h3>
        {isLoading && (
          <div className="space-y-2">
            {[...Array(LIMIT)].map((_, i) => (
              <div
                key={i}
                className="h-8 w-full bg-muted rounded-md animate-pulse"
              ></div>
            ))}
          </div>
        )}
        {error && (
          <div className="text-sm text-destructive">
            Could not load categories.
          </div>
        )}
        {categories?.map((category) => (
          <Link
            key={category.id}
            href={`/categories/${category.slug}`}
            onClick={onItemClick}
            className="flex items-center gap-3 rounded-md px-3 py-2 text-sm hover:bg-muted"
          >
            {category.name}
          </Link>
        ))}
      </div>

      <Separator className="my-4" />

      <div className="space-y-1 px-3">
        <h3 className="mb-2 text-sm font-semibold">Utilities</h3>
        {data.navSecondary.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.title}
              href={item.url}
              onClick={onItemClick}
              className="flex items-center gap-3 rounded-md px-3 py-2 text-sm hover:bg-muted"
            >
              <Icon className="h-5 w-5" />
              {item.title}
            </Link>
          );
        })}
      </div>

      <Separator className="my-4" />

      <div className="flex items-center gap-2 px-3 justify-center">
        <p className="text-base font-bold text-muted-foreground">Theme</p>
        <ModeToggle />
      </div>
    </ScrollArea>
  );
}
