"use client";

import React from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ModeToggle } from "@/components/mode-toggle";

const Nav = () => {
  return (
    <nav className="w-full flex justify-between items-center px-3 py-1 border-b bg-sidebar/50 backdrop-blur-md h-16 sticky top-0 z-10 left-0">
      <SidebarTrigger />
      <ModeToggle />
    </nav>
  );
};

export default Nav;
