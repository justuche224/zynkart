"use client";

import React from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ModeToggle } from "@/components/mode-toggle";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Globe, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import Link from "next/link";

const Nav = ({ storeSlug }: { storeSlug: string }) => {
  return (
    <header className="w-full flex flex-col md:flex-row px-3 py-1 border-b backdrop-blur-md sticky top-0 z-10 left-0 gap-2 md:gap-8 lg:gap-12 md:h-16">
      <nav className="justify-between flex items-center gap-4 w-full">
        <SidebarTrigger />
        <SearchBar className="hidden md:flex" storeSlug={storeSlug} />
        <div className="flex gap-2">
          <Button variant={"outline"} asChild>
            <Link
              aria-label="Visit store"
              target="_blank"
              href={
                process.env.NODE_ENV === "development"
                  ? `http://${storeSlug}.${process.env.NEXT_PUBLIC_APP_BASE_URL}`
                  : `https://${storeSlug}.${process.env.NEXT_PUBLIC_APP_BASE_URL}`
              }
            >
              <Globe className="h-4 w-4" /> <span className="hidden md:flex">Visit store</span>
            </Link>
          </Button>
          <ModeToggle />
        </div>
      </nav>
      <SearchBar className="flex md:hidden" storeSlug={storeSlug} />
    </header>
  );
};

export default Nav;

function SearchBar({
  className,
  storeSlug,
}: {
  className?: string;
  storeSlug: string;
}) {
  const router = useRouter();
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const search = formData.get("search") as string;
    router.push(`/merchant/stores/${storeSlug}/search?q=${search}`);
  };
  return (
    <form
      className={cn(
        "flex flex-1 items-center gap-2 max-w-3xl w-full mx-auto",
        className
      )}
      onSubmit={onSubmit}
    >
      <Input
        type="text"
        placeholder="Search products, categories, users, orders, etc."
        className="w-full"
        name="search"
      />
      <Button type="submit">
        <Search className="h-4 w-4" />
        <span className="hidden md:flex">Search</span>
      </Button>
    </form>
  );
}
