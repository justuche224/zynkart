"use client";

import React from "react";
import { StoreDataFromHomePage } from "@/lib/store-utils";
import Navbar from "./_components/navbar";
import { Footer } from "./_components/footer";
import AccountHome from "./_components/account/home";
import Session from "./_components/account/session";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Orders from "./_components/account/orders";
import SavedItems from "./_components/account/saved-items";
import MyAddresses from "./_components/account/addresses";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

interface AccountProps {
  store: StoreDataFromHomePage;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

const NavLink = ({
  href,
  page,
  children,
}: {
  href: string;
  page: string | null;
  children: React.ReactNode;
}) => {
  const currentPage = page === null ? "home" : page;
  const isActive =
    currentPage === href.split("=")[1] ||
    (page === null && href.includes("home"));

  return (
    <Link href={`/account?page=${href.split("=")[1] || "home"}`}>
      <li
        className={`p-2 rounded-md ${
          isActive ? "bg-muted font-semibold" : "hover:bg-muted/50"
        }`}
      >
        {children}
      </li>
    </Link>
  );
};

const Account = ({ store, user }: AccountProps) => {
  const searchParams = useSearchParams();
  const page = searchParams.get("page");

  const renderContent = () => {
    switch (page) {
      case "sessions":
        return <Session />;
      case "saved-items":
        return <SavedItems />;
      case "orders":
        return <Orders store={store} />;
      case "addresses":
        return <MyAddresses />;
      case "home":
      default:
        return <AccountHome user={user} />;
    }
  };

  const menuItems = [
    { page: "home", label: "My Account" },
    { page: "saved-items", label: "Saved Items" },
    { page: "orders", label: "My Orders" },
    { page: "addresses", label: "My Addresses" },
    { page: "sessions", label: "Sessions" },
  ];

  return (
    <section className="flex flex-col min-h-screen dark:bg-[#1e1b4b] dark:text-white bg-white pt-10">
      <Navbar storeSlug={store.slug} storeName={store.name} />
      <div className="md:hidden mt-16 container">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full">
              <Menu className="mr-2 h-4 w-4" /> Menu
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            <DropdownMenuLabel>Account Menu</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {menuItems.map((item) => (
              <Link href={`/account?page=${item.page}`} key={item.page}>
                <DropdownMenuItem>{item.label}</DropdownMenuItem>
              </Link>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <section className="flex-1 flex container mx-auto gap-4 mt-4 md:mt-16">
        <div className="w-1/3 hidden md:block h-fit mt-2">
          <div className="p-2">
            <ul>
              {menuItems.map((item) => (
                <NavLink
                  href={`/account?page=${item.page}`}
                  page={page}
                  key={item.page}
                >
                  {item.label}
                </NavLink>
              ))}
            </ul>
          </div>
        </div>
        <div className="w-full md:w-2/3">
          <div className="p-4">{renderContent()}</div>
        </div>
      </section>
      <Footer storeSlug={store.slug} />
    </section>
  );
};

export default Account;
