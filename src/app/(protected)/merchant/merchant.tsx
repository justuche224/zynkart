"use client";

import { User } from "better-auth";
import {
  ArrowRight,
  ShoppingCart,
  TrendingUp,
  Users,
  Package,
  Store,
  Crown,
  AlertCircle,
  Plus,
  Eye,
  BarChart3,
} from "lucide-react";
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
import { Badge } from "@/components/ui/badge";

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 dark:from-slate-900 dark:to-gray-800">
      <NewStore merchantId={merchant.id} open={open} setOpen={setOpen} />

      <div className="bg-white shadow-sm border-b dark:bg-gray-900 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-8">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="relative">
                {merchant.image ? (
                  <div className="relative">
                    <Image
                      src={merchant.image}
                      alt={merchant.name}
                      width={120}
                      height={120}
                      className="rounded-2xl w-[120px] h-[120px] object-cover shadow-lg"
                    />
                    <div className="absolute -bottom-2 -right-2 bg-green-500 rounded-full p-2">
                      <div className="w-3 h-3 bg-white rounded-full"></div>
                    </div>
                  </div>
                ) : (
                  <div className="w-[120px] h-[120px] bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center font-bold text-3xl text-white shadow-lg">
                    {merchant.name.charAt(0) + merchant.name.charAt(1)}
                  </div>
                )}
              </div>

              <div className="text-center sm:text-left">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                    {merchant.name}
                  </h1>
                  <Badge
                    variant="secondary"
                    className="bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/50 dark:text-amber-300 dark:border-amber-800"
                  >
                    <Crown className="w-3 h-3 mr-1" />
                    Free Plan
                  </Badge>
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-1">
                  {merchant.email}
                </p>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  +351 912 345 678
                </p>
                <Button
                  variant="outline"
                  className="mt-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 border-0"
                >
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Upgrade Plan
                </Button>
              </div>
            </div>

            <div className="flex-1 w-full lg:w-auto">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200 dark:from-blue-900/50 dark:to-blue-800/50 dark:border-blue-700">
                  <div className="flex items-center justify-between mb-2">
                    <Store className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                    <Badge variant="outline" className="text-xs">
                      Active
                    </Badge>
                  </div>
                  <div className="text-2xl font-bold text-blue-900 dark:text-blue-200">
                    {stores.length}
                  </div>
                  <div className="text-blue-700 dark:text-blue-300 text-sm font-medium">
                    Store{stores.length !== 1 ? "s" : ""}
                  </div>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl border border-green-200 dark:from-green-900/50 dark:to-green-800/50 dark:border-green-700">
                  <div className="flex items-center justify-between mb-2">
                    <Package className="w-8 h-8 text-green-600 dark:text-green-400" />
                    <Badge variant="outline" className="text-xs">
                      +12%
                    </Badge>
                  </div>
                  <div className="text-2xl font-bold text-green-900 dark:text-green-200">
                    {totalProducts}
                  </div>
                  <div className="text-green-700 dark:text-green-300 text-sm font-medium">
                    Product{totalProducts !== 1 ? "s" : ""}
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl border border-purple-200 dark:from-purple-900/50 dark:to-purple-800/50 dark:border-purple-700">
                  <div className="flex items-center justify-between mb-2">
                    <Users className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                    <Badge variant="outline" className="text-xs">
                      +8%
                    </Badge>
                  </div>
                  <div className="text-2xl font-bold text-purple-900 dark:text-purple-200">
                    {totalCustomers}
                  </div>
                  <div className="text-purple-700 dark:text-purple-300 text-sm font-medium">
                    Customer{totalCustomers !== 1 ? "s" : ""}
                  </div>
                </div>

                <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-xl border border-orange-200 dark:from-orange-900/50 dark:to-orange-800/50 dark:border-orange-700">
                  <div className="flex items-center justify-between mb-2">
                    <BarChart3 className="w-8 h-8 text-orange-600 dark:text-orange-400" />
                    <Badge
                      variant="outline"
                      className="text-xs bg-orange-500 text-white"
                    >
                      2 New
                    </Badge>
                  </div>
                  <div className="text-2xl font-bold text-orange-900 dark:text-orange-200">
                    765
                  </div>
                  <div className="text-orange-700 dark:text-orange-300 text-sm font-medium">
                    Orders
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showKycWarning && (
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="bg-gradient-to-r from-red-500 to-pink-600 text-white p-6 rounded-xl shadow-lg">
            <div className="flex items-center gap-4">
              <AlertCircle className="w-8 h-8 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-1">
                  Account Verification Required
                </h3>
                <p className="text-red-100 dark:text-red-200">
                  Your merchant account needs verification before customers can
                  place orders. Complete the verification process to unlock full
                  functionality.
                </p>
              </div>
              <Button className="bg-white text-red-600 hover:bg-red-50 font-semibold dark:bg-gray-50 dark:text-red-500 dark:hover:bg-red-100">
                Verify Now
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Your Stores
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Manage and monitor your store performance
            </p>
          </div>
          <Button
            onClick={() => setOpen(true)}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create Store
          </Button>
        </div>

        {stores.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border p-12 text-center dark:bg-gray-800 dark:border-gray-700">
            <div className="max-w-md mx-auto">
              <div className="bg-gradient-to-br from-blue-100 to-purple-100 w-32 h-32 rounded-full flex items-center justify-center mx-auto mb-6 dark:from-blue-900/50 dark:to-purple-900/50">
                <ShoppingCart
                  size={60}
                  className="text-blue-600 dark:text-blue-400 -rotate-12"
                />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                No stores yet
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Create your first store to start selling and managing your
                products
              </p>
              <Button
                onClick={() => setOpen(true)}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold px-8 py-3 rounded-xl"
              >
                <Plus className="w-5 h-5 mr-2" />
                Create Your First Store
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stores.map((store) => (
              <Card
                key={store.id}
                className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-white rounded-2xl overflow-hidden dark:bg-gray-800"
              >
                <div className="h-2 bg-gradient-to-r from-blue-500 to-purple-600"></div>

                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {store.name}
                    </h3>
                    <Badge
                      variant="outline"
                      className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/50 dark:text-green-300 dark:border-green-800"
                    >
                      Active
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Store ID: {store.slug}
                  </p>
                </CardHeader>

                <CardContent className="pb-6">
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="text-center">
                      <div className="bg-blue-50 rounded-lg p-3 mb-2 dark:bg-blue-900/50">
                        <Users className="w-5 h-5 text-blue-600 dark:text-blue-400 mx-auto" />
                      </div>
                      <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
                        {store.customerCount}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Customers
                      </div>
                    </div>

                    <div className="text-center">
                      <div className="bg-green-50 rounded-lg p-3 mb-2 dark:bg-green-900/50">
                        <Package className="w-5 h-5 text-green-600 dark:text-green-400 mx-auto" />
                      </div>
                      <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
                        {store.productCount}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Products
                      </div>
                    </div>

                    <div className="text-center">
                      <div className="bg-orange-50 rounded-lg p-3 mb-2 relative dark:bg-orange-900/50">
                        <BarChart3 className="w-5 h-5 text-orange-600 dark:text-orange-400 mx-auto" />
                        <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                          2
                        </Badge>
                      </div>
                      <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
                        765
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Orders
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-3 dark:bg-gray-700/50">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-300">
                        Performance
                      </span>
                      <span className="text-green-600 dark:text-green-400 font-medium">
                        +12% this month
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2 dark:bg-gray-700">
                      <div
                        className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full"
                        style={{ width: "68%" }}
                      ></div>
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="pt-0">
                  <Button
                    asChild
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold rounded-xl group-hover:shadow-lg transition-all duration-200"
                  >
                    <Link href={`/merchant/stores/${store.slug}`}>
                      <Eye className="w-4 h-4 mr-2" />
                      View Store
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Merchant;
