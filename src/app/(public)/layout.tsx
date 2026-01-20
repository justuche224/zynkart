import PublicNav from "./_components/nav";
import { Footer } from "@/components/home";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <PublicNav />
      {children}
      <Footer />
    </>
  );
}
