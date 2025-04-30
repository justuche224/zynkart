import PublicNav from "./_components/nav";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <PublicNav />
      {children}
    </>
  );
}
