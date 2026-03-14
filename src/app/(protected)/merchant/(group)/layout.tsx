import { AppSidebar } from "./app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import Nav from "./Nav";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <SidebarProvider>
      <AppSidebar variant="floating"/>
      <SidebarInset className="w-full">
        <Nav />
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
