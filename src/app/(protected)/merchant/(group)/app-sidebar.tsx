"use client";

import type * as React from "react";
import {
  Book,
  Frame,
  PieChart,
  ShoppingCart,
} from "lucide-react";

import { NavMain } from "./nav-main";
import { NavProjects } from "./nav-projects";
import { NavUser } from "./nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { authClient } from "@/lib/auth-client";
interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  storeSlug?: string;
  storeName?: string;
}

export function AppSidebar({ ...props }: AppSidebarProps) {
  const { data: session } = authClient.useSession();
  const data = {
    user: {
      name: session?.user.name || "",
      email: session?.user.email || "",
      avatar:
        session?.user.image ||
        "https://qlvnghvpsfqflytgfadz.supabase.co/storage/v1/object/public/cartify//user-placeholder.png",
    },
    navMain: [
      {
        title: "Store Management",
        url: "/",
        icon: ShoppingCart,
        isActive: true,
        items: [
          {
            title: "Dashboard",
            url: "/merchant",
          },
          {
            title: "Account",
            url: "/merchant/settings/account",
          },
          {
            title: "Plan",
            url: "/merchant/plan",
          },
        ],
      },
    ],
    projects: [
      {
        name: "Support",
        url: "/support",
        icon: Frame,
      },
      {
        name: "Help",
        url: "/help",
        icon: PieChart,
      },
      {
        name: "Tutorials",
        url: "#",
        icon: Book,
      },
    ],
  };
  return (
    <Sidebar className="noscrollbar" collapsible="icon" {...props}>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-1.5">
          <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
            <ShoppingCart className="size-4" />
          </div>
          <span className="truncate text-sm font-semibold">
            {data.user.name}
          </span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
