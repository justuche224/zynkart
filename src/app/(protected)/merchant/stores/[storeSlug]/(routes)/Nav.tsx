"use client";

import React from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ModeToggle } from "@/components/mode-toggle";

const Nav = () => {
  return (
    <nav className="w-full flex justify-between items-center px-3 py-1 border-b bg-sidebar h-16">
      <SidebarTrigger />
      <ModeToggle />
    </nav>
  );
};

export default Nav;
