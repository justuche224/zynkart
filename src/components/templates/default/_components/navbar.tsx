"use client";

import { Separator } from "@/components/ui/separator";
import { useCartStore } from "@/store/cart";
import {
  HelpCircleIcon,
  Menu,
  PackageIcon,
  PercentIcon,
  Search,
  SearchIcon,
  SettingsIcon,
  ShoppingCart,
  ShoppingCartIcon,
  TagsIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import { useQuery } from "@tanstack/react-query";
import { categoryList } from "@/actions/store/public/category/list";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import NavUser from "./nav-user";
import { ModeToggle } from "@/components/mode-toggle";
import { Input } from "@/components/ui/input";

const LIMIT = 5;

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

export function SiteHeader({
  storeId,
  storeSlug,
  storeName,
}: {
  storeId: string;
  storeSlug: string;
  storeName: string;
}) {
  const currentPath = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const router = useRouter();

  useEffect(() => {
    const storedHistory = localStorage.getItem("searchHistory");
    if (storedHistory) {
      setSearchHistory(JSON.parse(storedHistory));
    }
  }, []);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSearchOpen(false);
      }
    };

    if (searchOpen) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [searchOpen]);

  return (
    <header className="group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 flex h-12 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear fixed top-0 right-0 left-0 z-10 bg-background/50 backdrop-blur-md">
      {searchOpen && (
        <div
          className="fixed top-0 z-[999] left-0 h-screen w-full bg-background/90 backdrop-blur-lg"
          onClick={() => setSearchOpen(false)}
        >
          <div
            className="flex flex-col items-center justify-center mt-20 max-w-2xl mx-auto px-4 gap-2"
            onClick={(e) => e.stopPropagation()}
          >
            <h1 className="text-2xl font-bold">
              Search products, services, and more
            </h1>
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
              className="w-full max-w-md"
              autoFocus
            />
            <Button
              onClick={() => {
                if (searchQuery.length > 0) {
                  const newHistory = [
                    searchQuery,
                    ...searchHistory.filter((item) => item !== searchQuery),
                  ].slice(0, 5);
                  setSearchHistory(newHistory);
                  localStorage.setItem(
                    "searchHistory",
                    JSON.stringify(newHistory)
                  );
                  router.push(`/search?q=${searchQuery}`);
                  // setSearchOpen(false);
                }
              }}
            >
              Search
            </Button>
            {searchHistory.length > 0 && (
              <div className="mt-4 w-full max-w-md">
                <h2 className="text-sm font-semibold text-muted-foreground text-center mb-2">
                  Recent Searches
                </h2>
                <div className="flex flex-wrap gap-2 justify-center">
                  {searchHistory.map((item, index) => (
                    <Button
                      key={index}
                      variant="secondary"
                      className="cursor-pointer"
                      onClick={() => {
                        router.push(`/search?q=${item}`);
                        // setSearchOpen(false);
                      }}
                    >
                      {item}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      <div className="flex w-full items-center justify-between gap-1 px-4 lg:gap-2 lg:px-6">
        <div className="flex items-center gap-4">
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
          <Link href="/" className="sm:hidden">
            <h1 className="text-xl font-bold">
              {storeName.length > 10
                ? storeName.slice(0, 10) + "..."
                : storeName}
            </h1>
          </Link>
          <Link href="/" className="hidden sm:flex md:hidden">
            <h1 className="text-xl font-bold">
              {storeName.length > 25
                ? storeName.slice(0, 25) + "..."
                : storeName}
            </h1>
          </Link>
          <Link href="/" className="hidden md:flex">
            <h1 className="text-xl font-bold">{storeName}</h1>
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            className=""
            aria-label="Search"
            onClick={() => setSearchOpen(true)}
          >
            <Search size={20} />
          </Button>
          <Cart />
          <NavUser storeSlug={storeSlug} />
        </div>
      </div>
    </header>
  );
}

function Cart() {
  const cartItemsCount = useCartStore((state) =>
    state.items.reduce((total, item) => total + item.quantity, 0)
  );
  return (
    <Link href="/cart">
      <Button variant="outline" size="icon" className="relative">
        <ShoppingCart className="h-5 w-5" />
        {cartItemsCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs rounded-full h-4 w-4 flex items-center justify-center">
            {cartItemsCount}
          </span>
        )}
      </Button>
    </Link>
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

// import {
//   BellIcon,
//   CreditCardIcon,
//   LogOutIcon,
//   MoreVerticalIcon,
//   UserCircleIcon,
// } from "lucide-react";

// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuGroup,
//   DropdownMenuItem,
//   DropdownMenuLabel,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";
// import { ModeToggle } from "@/components/mode-toggle";

// export function NavUser({
//   user,
// }: {
//   user: {
//     name: string;
//     email: string;
//     avatar: string;
//   };
// }) {
//   return (
//     <div>
//       <div>
//         <DropdownMenu>
//           <DropdownMenuTrigger asChild className="bg-sidebar w-full">
//             <Button
//               variant="ghost"
//               size="lg"
//               className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground rounded-none"
//             >
//               <Avatar className="h-8 w-8 rounded-lg grayscale">
//                 <AvatarImage src={user.avatar} alt={user.name} />
//                 <AvatarFallback className="rounded-lg">CN</AvatarFallback>
//               </Avatar>
//               <div className="grid flex-1 text-left text-sm leading-tight">
//                 <span className="truncate font-medium">{user.name}</span>
//                 <span className="truncate text-xs text-muted-foreground">
//                   {user.email}
//                 </span>
//               </div>
//               <MoreVerticalIcon className="ml-auto size-4" />
//             </Button>
//           </DropdownMenuTrigger>
//           <DropdownMenuContent
//             className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
//             side="top"
//             align="end"
//             sideOffset={4}
//           >
//             <DropdownMenuLabel className="p-0 font-normal">
//               <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
//                 <Avatar className="h-8 w-8 rounded-lg">
//                   <AvatarImage src={user.avatar} alt={user.name} />
//                   <AvatarFallback className="rounded-lg">CN</AvatarFallback>
//                 </Avatar>
//                 <div className="grid flex-1 text-left text-sm leading-tight">
//                   <span className="truncate font-medium">{user.name}</span>
//                   <span className="truncate text-xs text-muted-foreground">
//                     {user.email}
//                   </span>
//                 </div>
//               </div>
//             </DropdownMenuLabel>
//             <DropdownMenuSeparator />
//             <DropdownMenuGroup>
//               <DropdownMenuItem>
//                 <UserCircleIcon />
//                 Account
//               </DropdownMenuItem>
//               <DropdownMenuItem>
//                 <CreditCardIcon />
//                 Billing
//               </DropdownMenuItem>
//               <DropdownMenuItem>
//                 <BellIcon />
//                 Notifications
//               </DropdownMenuItem>
//             </DropdownMenuGroup>
//             <DropdownMenuSeparator />
//             <DropdownMenuItem>
//               <LogOutIcon />
//               Log out
//             </DropdownMenuItem>
//           </DropdownMenuContent>
//         </DropdownMenu>
//       </div>
//     </div>
//   );
// }
