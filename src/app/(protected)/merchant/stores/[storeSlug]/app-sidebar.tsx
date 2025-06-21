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
        title: "Store Management",
        url: "#",
        icon: ShoppingCart,
        isActive: true,
        items: [
          {
            title: "Overview",
            url: "/",
          },
          {
            title: "Dashboard",
            url: "/dashboard",
          },
          {
            title: "Banners & Promotions",
            url: "/banners",
          },
          {
            title: "Customization",
            url: "/customise",
          },
        ],
      },
      {
        title: "Catalog",
        url: "#",
        icon: Package,
        isActive: true,
        items: [
          {
            title: "Products",
            url: "/products",
          },
          {
            title: "Categories",
            url: "/categories",
          },
          {
            title: "Tags",
            url: "/tags",
          },
          {
            title: "New Product",
            url: "/products/new",
          },
          {
            title: "New Category",
            url: "/categories/new",
          },
          {
            title: "New Tag",
            url: "/tags/new",
          },
          {
            title: "Product Analytics",
            url: "/products/analytics",
          },
        ],
      },
      {
        title: "Orders & Fulfillment",
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
            url: "/orders?fulfillmentStatus=PROCESSING",
          },
          {
            title: "Shipped Orders",
            url: "/orders?fulfillmentStatus=SHIPPED",
          },
        ],
      },
      {
        title: "Customers",
        url: "#",
        icon: User2,
        items: [
          {
            title: "All Customers",
            url: "/customers",
          },
          {
            title: "Top Customers",
            url: "/customers?sort=order_count",
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
            title: "Store Information",
            url: "/settings/store",
          },
          {
            title: "Profile Settings",
            url: "/settings/profile",
          },
          {
            title: "Payment Methods",
            url: "/settings/bank",
          },
          {
            title: "Shipping & Delivery",
            url: "/settings/shipping-and-delivery",
          },
          {
            title: "General Settings",
            url: "/settings",
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
