import { AppSidebar } from "./app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import Nav from "./Nav";

export default async function Layout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ storeSlug: string }>;
}) {
  const { storeSlug } = await params;
  const storeName = storeSlug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  return (
    <SidebarProvider>
      <AppSidebar storeName={storeName} storeSlug={storeSlug} variant="floating"/>
      <SidebarInset className="w-full">
        <Nav storeSlug={storeSlug} />
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
