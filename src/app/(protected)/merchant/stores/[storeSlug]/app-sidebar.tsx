"use client";

import type * as React from "react";
import {
  Book,
  User2,
  Frame,
  Package,
  PieChart,
  Settings2,
  ShoppingCart,
  Truck,
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
    navMain: [
      {
        title: "Store Management",
        url: "#",
        icon: ShoppingCart,
        isActive: true,
        items: [
          {
            title: "Dashboard",
            url: "/",
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
        title: "Catalogue",
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
          // {
          //   title: "Analytics",
          //   url: "/products/analytics",
          // },
        ],
      },
      {
        title: "Orders & Fulfillment",
        url: "#",
        icon: Truck,
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
        isActive: true,
        items: [
          {
            title: "All Customers",
            url: "/customers",
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
            title: "General Settings",
            url: "/settings",
          },
          {
            title: "Recieve Payments",
            url: "/settings/bank",
          },
          {
            title: "Shipping & Delivery",
            url: "/settings/shipping-and-delivery",
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
          <span className="truncate text-sm font-semibold">{storeName}</span>
        </div>
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
