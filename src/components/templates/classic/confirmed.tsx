"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import confetti from "canvas-confetti";
import { CheckCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import Navbar from "./_components/navbar";
import { StoreDataFromHomePage } from "@/lib/store-utils";
import { Footer } from "./_components/footer";

export default function OrderConfirmation({
  store,
}: {
  store: StoreDataFromHomePage;
}) {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const [confettiTriggered, setConfettiTriggered] = useState(false);

  useEffect(() => {
    if (!confettiTriggered) {
      const duration = 4 * 1000;
      const animationEnd = Date.now() + duration;
      const colors = ["#ff0000", "#00ff00", "#0000ff", "#ffff00", "#ff00ff"];

      const randomInRange = (min: number, max: number) => {
        return Math.random() * (max - min) + min;
      };

      const frame = () => {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return;
        }

        confetti({
          particleCount: 3,
          angle: randomInRange(55, 125),
          spread: randomInRange(50, 70),
          origin: { x: 0 },
          colors: colors,
        });

        confetti({
          particleCount: 3,
          angle: randomInRange(55, 125),
          spread: randomInRange(50, 70),
          origin: { x: 1 },
          colors: colors,
        });

        requestAnimationFrame(frame);
      };

      frame();
      setConfettiTriggered(true);
    }
  }, [confettiTriggered]);

  return (
    <section className="min-h-screen bg-[#fff] md:pt-16 pt-24 flex flex-col dark:bg-[#252525]">
    <Navbar
      storeSlug={store.slug}
      storeName={store.name}
      storeId={store.id}
    />
    <div className="flex min-h-[100svh] items-center justify-center">
      <Card className="mx-auto max-w-md text-center shadow-lg bg-sidebar">
        <CardHeader className="pb-2">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 dark:bg-primary/20">
            <CheckCircle className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold dark:text-white">
            Order Confirmed!
          </CardTitle>
        </CardHeader>
        <CardContent className="pb-6">
          <p className="mb-2 text-muted-foreground dark:text-slate-400">
            Thank you for your purchase. We&apos;ve received your order and are
            processing it now.
          </p>
          <div className="mt-4 rounded-lg bg-muted p-4 dark:bg-gray-950">
            <p className="text-sm font-medium text-muted-foreground dark:text-slate-400">
              Order ID
            </p>
            <p className="mt-1 font-mono text-lg font-bold dark:text-white">
              {orderId || "No order ID found"}
            </p>
          </div>
          <p className="mt-6 text-sm text-muted-foreground dark:text-slate-400">
            A confirmation email has been sent to your email address.
          </p>
        </CardContent>
        <CardFooter className="flex justify-center gap-4">
          <Link href={`/account?page=orders`}>
            <Button
              variant="outline"
              className="dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              View Order
            </Button>
          </Link>
          <Link href={"/"}>
            <Button className="dark:hover:bg-primary/90">
              Continue Shopping
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
    <Footer storeSlug={store.slug} />
    </section>
  );
}
