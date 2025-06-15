"use client";

import NavUser from "@/components/nav-user";
import Cart from "@/components/cart";
import { ShoppingBag, Search } from "lucide-react";
import Link from "next/link";
import React, { useState } from "react";
import GlobalSearch from "@/components/global-search";

const Navbar = ({
  storeSlug,
  storeName,
}: {
  storeSlug: string;
  storeName: string;
}) => {
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <header className="bg-gradient-to-r from-blue-900/40 via-purple-800/40 to-purple-900/40 backdrop-blur-md text-white fixed top-0 left-0 right-0 z-50">
      <GlobalSearch
        isOpen={searchOpen}
        setIsOpen={setSearchOpen}
        bgColor="bg-gradient-to-r from-blue-900/90 via-purple-800/90 to-purple-900/90"
      />
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {/* <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                <span className="text-purple-800 font-bold text-sm">H</span>
              </div> */}
            <span className="text-xl font-bold">
              {" "}
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
            </span>
          </div>

          {/* <nav className="hidden md:flex items-center space-x-8">
            <a href="#" className="hover:text-purple-200 transition-colors">
              Home
            </a>
            <a href="#" className="hover:text-purple-200 transition-colors">
              Help
            </a>
            <a href="#" className="hover:text-purple-200 transition-colors">
              How to Buy
            </a>
            <a href="#" className="hover:text-purple-200 transition-colors">
              Product
            </a>
            <a href="#" className="hover:text-purple-200 transition-colors">
              About Us
            </a>
          </nav> */}

          <div className="flex items-center space-x-4">
            <Search
              onClick={() => setSearchOpen(true)}
              className="w-5 h-5 cursor-pointer hover:text-purple-200"
            />
            <Cart Icon={ShoppingBag} variant="ghost" />
            <NavUser
              storeSlug={storeSlug}
              variant="ghost"
              bgColor="bg-gradient-to-r from-blue-900/50 via-purple-800/50 to-purple-900/50 backdrop-blur-lg"
            />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
