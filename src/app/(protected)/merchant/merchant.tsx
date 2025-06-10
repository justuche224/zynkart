"use client";

import { Separator } from "@/components/ui/separator";
import { User } from "better-auth";
import { ArrowRight, ShoppingCart } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { NewStore } from "@/components/new-store";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const Merchant = ({
  merchant,
  stores,
}: {
  merchant: User;
  stores: {
    id: string;
    name: string;
    slug: string;
    productCount: number;
    customerCount: number;
  }[];
}) => {
  const [open, setOpen] = useState(false);
  const searchParams = useSearchParams();
  const [onboarding, setOnboarding] = useState(
    searchParams.get("onboarding") === "true"
  );
  const [showKycWarning] = useState(false);

  useEffect(() => {
    if (stores.length === 0) {
      setOnboarding(true);
    }
  }, [stores]);

  useEffect(() => {
    setOpen(onboarding);
  }, [onboarding]);

  const totalProducts = useMemo(() => {
    return stores.reduce((acc, store) => acc + store.productCount, 0);
  }, [stores]);

  const totalCustomers = useMemo(() => {
    return stores.reduce((acc, store) => acc + store.customerCount, 0);
  }, [stores]);

  return (
    <section className="max-w-5xl mx-auto min-h-screen p-4">
      <NewStore merchantId={merchant.id} open={open} setOpen={setOpen} />
      <section className="flex flex-col text-center sm:text-left sm:flex-row items-center gap-4">
        <div>
          {merchant.image ? (
            <div className="w-[200px] h-[200px] bg-primary rounded-full flex items-center justify-center font-bold text-6xl">
              <Image
                src={merchant.image}
                alt={merchant.name}
                width={200}
                height={200}
                className="rounded-full w-[200px] h-[200px]"
              />
            </div>
          ) : (
            <div className="w-[200px] h-[200px] bg-primary rounded-full flex items-center justify-center font-bold text-6xl">
              {merchant.name.charAt(0) + merchant.name.charAt(1)}
            </div>
          )}
        </div>
        <div className="flex flex-col md:flex-row justify-center md:justify-between gap-2 w-full">
          <div>
            <h1 className="text-2xl font-bold">{merchant.name}</h1>
            <p className="text-sm text-muted-foreground">{merchant.email}</p>
            <p>+351 912 345 678</p>
            <div className="flex items-center gap-2 justify-center sm:justify-start">
              <p>Free Plan</p> <Button variant="outline">Upgrade</Button>
            </div>
          </div>
          <div className="flex items-center justify-center sm:justify-start  gap-4">
            <div className="flex flex-col items-center">
              <div className="text-2xl font-bold">{stores.length}</div>
              <div className="text-primary">
                store{stores.length > 1 ? "s" : ""}
              </div>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-2xl font-bold">{totalProducts}</div>
              <div className="text-primary">
                product{totalProducts > 1 ? "s" : ""}
              </div>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-2xl font-bold">{totalCustomers}</div>
              <div className="text-primary">
                customer{totalCustomers > 1 ? "s" : ""}
              </div>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-2xl font-bold relative">
                765
                <span className="absolute -top-3 -right-3 bg-primary text-white rounded-full px-2 py-1 text-xs">
                  2
                </span>
              </div>
              <div className="text-primary">orders</div>
            </div>
          </div>
        </div>
      </section>
     {showKycWarning && <div className="bg-red-500 text-white p-4 rounded-lg mt-4 flex flex-col items-center justify-center gap-4">
        <h1 className="text-center">
          Your haven&apos;t verified your merchant account yet. customers
          won&apos;t be able to place orders till you verify your account
        </h1>
        <Button>
          Verify Account <ArrowRight size={16} />
        </Button>
      </div>}
      <Separator className="my-4" />
      <section>
        <div className="flex justify-end mb-4">
          <Button onClick={() => setOpen(true)}>Create Store</Button>
        </div>
        {stores.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4">
            <ShoppingCart size={150} className="text-primary -rotate-12" />
            <div className="text-2xl font-bold text-center">
              <h1>you don&apos;t have any stores yet.</h1>
              <p>create a store to start selling</p>
              <Button onClick={() => setOpen(true)}>Create Store</Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
            {stores.map((store) => (
              <Card className="" key={store.id}>
                <CardHeader className="text-2xl font-bold">
                  {store.name}
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col items-center">
                      <div className="text-2xl font-bold">
                        {store.customerCount}
                      </div>
                      <div className="text-primary">customers</div>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="text-2xl font-bold">
                        {store.productCount}
                      </div>
                      <div className="text-primary">products</div>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="text-2xl font-bold relative">
                        765
                        <span className="absolute -top-3 -right-3 bg-primary text-white rounded-full px-2 py-1 text-xs">
                          2
                        </span>
                      </div>
                      <div className="text-primary">orders</div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button asChild>
                    <Link href={`/merchant/stores/${store.slug}`}>
                      View Store
                      <ArrowRight size={16} />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </section>
    </section>
  );
};

export default Merchant;
