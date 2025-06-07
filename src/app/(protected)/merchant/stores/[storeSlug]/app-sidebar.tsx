"use client";

import type * as React from "react";
import {
  AudioWaveform,
  User2,
  Command,
  Frame,
  GalleryVerticalEnd,
  Map,
  Package,
  PieChart,
  Settings2,
  ShoppingCart,
} from "lucide-react";

import { NavMain } from "./nav-main";
import { NavProjects } from "./nav-projects";
import { NavUser } from "./nav-user";
import { TeamSwitcher } from "./team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { authClient } from "@/lib/auth-client";
interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  storeSlug: string;
  storeName: string;
}

export function AppSidebar({
  storeSlug,
  storeName,
  ...props
}: AppSidebarProps) {
  const { data: session } = authClient.useSession();
  const data = {
    user: {
      name: session?.user.name || "",
      email: session?.user.email || "",
      avatar:
        session?.user.image ||
        "https://qlvnghvpsfqflytgfadz.supabase.co/storage/v1/object/public/cartify//user-placeholder.png",
    },
    teams: [
      {
        name: storeName,
        logo: GalleryVerticalEnd,
        plan: "Enterprise",
      },
      {
        name: "Acme Corp.",
        logo: AudioWaveform,
        plan: "Startup",
      },
      {
        name: "Evil Corp.",
        logo: Command,
        plan: "Free",
      },
    ],
    navMain: [
      {
        title: "Store",
        url: "#",
        icon: ShoppingCart,
        isActive: true,
        items: [
          {
            title: "Info",
            url: "/",
          },
          {
            title: "Dashboard",
            url: "/dashboard",
          },
          {
            title: "Banners",
            url: "/banners",
          },
          {
            title: "Customisation",
            url: "/customise",
          },
        ],
      },
      {
        title: "Inventory",
        url: "#",
        icon: Package,
        isActive: true,
        items: [
          {
            title: "New Product",
            url: "/products/new",
          },
          {
            title: "Products",
            url: "/products",
          },
          {
            title: "Analytics",
            url: "/products/analytics",
          },
          {
            title: "New Category",
            url: "/categories/new",
          },
          {
            title: "Categories",
            url: "/categories",
          },
        ],
      },
      {
        title: "Orders",
        url: "#",
        icon: User2,
        isActive: true,
        items: [
          {
            title: "All Orders",
            url: "/orders",
          },
          {
            title: "Pending Orders",
            url: "/orders/pending",
          },
          {
            title: "Shipped",
            url: "/orders/shipped",
          },
        ],
      },
      {
        title: "Settings",
        url: "#",
        icon: Settings2,
        isActive: true,
        items: [
          {
            title: "Info",
            url: "/settings/store",
          },
          {
            title: "Profile",
            url: "/settings/profile",
          },
          {
            title: "Shipping and Delivery",
            url: "/settings/shipping-and-delivery",
          },
          {
            title: "Receive Payments",
            url: "/settings/bank",
          },
          {
            title: "all",
            url: "/settings",
          },
        ],
      },
      {
        title: "Customers",
        url: "#",
        icon: User2,
        items: [
          {
            title: "Customer List",
            url: "/customers",
          },
          {
            title: "Top customers",
            url: "/customers?sort=order_count",
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
        name: "Travel",
        url: "#",
        icon: Map,
      },
    ],
  };
  return (
    <Sidebar className="noscrollbar" collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} storeSlug={storeSlug} />
        <NavProjects projects={data.projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
