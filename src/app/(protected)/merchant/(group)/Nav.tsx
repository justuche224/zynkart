"use client";

import React from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ModeToggle } from "@/components/mode-toggle";

const Nav = () => {
  return (
    <header className="w-full flex flex-col md:flex-row px-3 py-1 border-b backdrop-blur-md sticky top-0 z-10 left-0 gap-2 md:gap-8 lg:gap-12 md:h-16">
      <nav className="justify-between flex items-center gap-4 w-full">
        <SidebarTrigger />
        <div className="flex gap-2">
          <ModeToggle />
        </div>
      </nav>
    </header>
  );
};

export default Nav;
