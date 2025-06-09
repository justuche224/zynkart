import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import { Menu, ShoppingCart } from "lucide-react";
import Link from "next/link";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import React from "react";
import { Separator } from "@/components/ui/separator";

const PublicNav = () => {
  return (
    <header className="fixed top-0 z-[99] w-full bg-background/50 backdrop-blur-md shadow">
      <nav className="flex items-center justify-between w-full px-20 py-2">
        <div className="flex gap-2">
          <Button
            asChild
            variant={"ghost"}
            className="font-bold tracking-tigt flex gap-1"
          >
            <Link href={"/"}>
              <ShoppingCart />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-pink-600">
                Zynkart
              </span>
            </Link>
          </Button>
          <Button className="hidden md:inline-block" asChild variant={"link"}>
            <Link href={"/#pricing"}>Pricing</Link>
          </Button>
          <Button className="hidden md:inline-block" asChild variant={"link"}>
            <Link href={"/#features"}>Features</Link>
          </Button>
          <Button className="hidden md:inline-block" asChild variant={"link"}>
            <Link href={"/themes"}>Themes</Link>
          </Button>
        </div>
        <div className="gap-4 hidden md:flex">
          <Button size={"sm"} variant={"outline"} asChild>
            <Link href={"/sign-in"}>Sign In</Link>
          </Button>
          <Button size={"sm"} variant={"outline"} asChild>
            <Link href={"/contact"}>Contact</Link>
          </Button>
          <Button size={"sm"} asChild>
            <Link href={"/sign-up"}>Get Started</Link>
          </Button>
          <ModeToggle />
        </div>
        <Sheet>
          <SheetTrigger asChild className="md:hidden">
            <Button variant={"outline"}>
              <Menu />
            </Button>
          </SheetTrigger>
          <SheetContent className="md:hidden w-[100%] z-[100]">
            <SheetHeader>
              <div className="flex justify-between">
                <SheetTitle>
                  <Button
                    asChild
                    variant={"ghost"}
                    className="font-bold tracking-tigt flex gap-1"
                  >
                    <Link href={"/"}>
                      <ShoppingCart />
                      <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-pink-600">
                        Zynkart
                      </span>
                    </Link>
                  </Button>
                </SheetTitle>
              </div>
            </SheetHeader>
            <SheetDescription className="flex flex-col gap-2 px-10">
              <Button asChild variant={"link"}>
                <Link href={"/#pricing"}>Pricing</Link>
              </Button>
              <Button asChild variant={"link"}>
                <Link href={"/#features"}>Features</Link>
              </Button>
              <Button className="hidden md:inline-block" asChild variant={"link"}>
                <Link href={"/themes"}>Themes</Link>
              </Button>
              <Button size={"sm"} variant={"outline"} asChild>
                <Link href={"/sign-in"}>Sign In</Link>
              </Button>
              <Button size={"sm"} variant={"outline"} asChild>
                <Link href={"/contact"}>Contact</Link>
              </Button>
              <Button size={"sm"} asChild>
                <Link href={"/sign-up"}>Get Started</Link>
              </Button>
              <Separator />
              <div className="flex justify-between">
                <span>Theme</span>
                <ModeToggle />
              </div>
              <Separator />
            </SheetDescription>
          </SheetContent>
        </Sheet>
      </nav>
    </header>
  );
};

export default PublicNav;
