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
  MoreHorizontal,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { NewStore } from "@/components/new-store";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useFeatureLimit } from "@/hooks/use-feature-limits";

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
    searchParams.get("onboarding") === "true",
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

  // Check store creation limits
  const {
    allowed: canCreateStore,
    limit: storeLimit,
    current: currentStores,
    upgradeRequired,
  } = useFeatureLimit({
    userId: merchant.id,
    featureKey: "stores_count",
    requestedAmount: 1,
  });

  return (
    <div className="min-h-screen bg-background">
      <NewStore merchantId={merchant.id} open={open} setOpen={setOpen} />

      {/* Header Section */}
      <div className="border-b border-border/40">
        <div className="max-w-6xl mx-auto px-6 py-10">
          <div className="flex flex-col lg:flex-row gap-10">
            {/* Profile Section */}
            <div className="flex items-start gap-5">
              <div className="relative flex-shrink-0">
                {merchant.image ? (
                  <Image
                    src={merchant.image}
                    alt={merchant.name}
                    width={72}
                    height={72}
                    className="rounded-full w-[72px] h-[72px] object-cover ring-2 ring-border"
                  />
                ) : (
                  <div className="w-[72px] h-[72px] bg-foreground/10 rounded-full flex items-center justify-center font-semibold text-xl text-foreground">
                    {merchant.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-500 rounded-full ring-2 ring-background"></div>
              </div>

              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-2xl font-semibold text-foreground tracking-tight">
                    {merchant.name}
                  </h1>
                  <Badge
                    variant="outline"
                    className="text-xs font-medium border-border text-muted-foreground"
                  >
                    Free Plan
                  </Badge>
                </div>
                <p className="text-muted-foreground text-sm mb-3">
                  {merchant.email}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs font-medium"
                >
                  <TrendingUp className="w-3.5 h-3.5 mr-1.5" />
                  Upgrade Plan
                </Button>
              </div>
            </div>

            {/* Stats Section */}
            <div className="flex-1">
              <div className="flex flex-wrap gap-8 lg:gap-12 lg:justify-end">
                <div className="min-w-[100px]">
                  <div className="flex items-center gap-2 mb-1">
                    <Store className="w-4 h-4 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
                      Stores
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-semibold text-foreground tabular-nums">
                      {stores.length}
                    </span>
                    {storeLimit && storeLimit > 0 && (
                      <span className="text-xs text-muted-foreground">
                        / {storeLimit}
                      </span>
                    )}
                  </div>
                </div>

                <div className="min-w-[100px]">
                  <div className="flex items-center gap-2 mb-1">
                    <Package className="w-4 h-4 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
                      Products
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-semibold text-foreground tabular-nums">
                      {totalProducts}
                    </span>
                    <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                      +12%
                    </span>
                  </div>
                </div>

                <div className="min-w-[100px]">
                  <div className="flex items-center gap-2 mb-1">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
                      Customers
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-semibold text-foreground tabular-nums">
                      {totalCustomers}
                    </span>
                    <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                      +8%
                    </span>
                  </div>
                </div>

                <div className="min-w-[100px]">
                  <div className="flex items-center gap-2 mb-1">
                    <BarChart3 className="w-4 h-4 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
                      Orders
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-semibold text-foreground tabular-nums">
                      765
                    </span>
                    <Badge
                      variant="secondary"
                      className="text-[10px] px-1.5 py-0 h-4 font-medium"
                    >
                      2 new
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showKycWarning && (
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="bg-destructive/10 border border-destructive/20 text-destructive p-4 rounded-lg">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium">
                  Account verification required to start receiving orders.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="border-destructive/30 text-destructive hover:bg-destructive hover:text-destructive-foreground"
              >
                Verify Now
                <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Stores Section */}
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-1">
              Your Stores
            </h2>
            <p className="text-sm text-muted-foreground">
              Manage and monitor your store performance
            </p>
          </div>
          <div className="flex items-center gap-3">
            {!canCreateStore && upgradeRequired && (
              <span className="text-xs text-muted-foreground">
                Store limit reached
              </span>
            )}
            <Button
              onClick={() => setOpen(true)}
              disabled={!canCreateStore}
              size="sm"
              className="font-medium"
            >
              {!canCreateStore ? (
                <>
                  <Crown className="w-4 h-4 mr-1.5" />
                  Upgrade
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-1.5" />
                  New Store
                </>
              )}
            </Button>
          </div>
        </div>

        {stores.length === 0 ? (
          <div className="border border-dashed border-border rounded-xl p-12 text-center">
            <div className="max-w-sm mx-auto">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingCart className="w-7 h-7 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                No stores yet
              </h3>
              <p className="text-sm text-muted-foreground mb-6">
                Create your first store to start selling and managing your
                products.
              </p>
              <Button
                onClick={() => setOpen(true)}
                disabled={!canCreateStore}
                size="sm"
                className="font-medium"
              >
                {!canCreateStore ? (
                  <>
                    <Crown className="w-4 h-4 mr-1.5" />
                    Upgrade to Create
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-1.5" />
                    Create Store
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {stores.map((store) => (
              <div
                key={store.id}
                className="group border border-border rounded-xl p-5 hover:border-border/80 hover:bg-muted/30 transition-all duration-200"
              >
                <div className="flex flex-col lg:flex-row lg:items-center gap-5">
                  {/* Store Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-base font-semibold text-foreground truncate">
                        {store.name}
                      </h3>
                      <Badge
                        variant="outline"
                        className="text-[10px] px-1.5 py-0 h-4 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/5"
                      >
                        Active
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {store.slug}
                    </p>
                  </div>

                  {/* Store Stats */}
                  <div className="flex items-center gap-8">
                    <div className="text-center min-w-[60px]">
                      <div className="text-lg font-semibold text-foreground tabular-nums">
                        {store.customerCount}
                      </div>
                      <div className="text-[11px] text-muted-foreground uppercase tracking-wide">
                        Customers
                      </div>
                    </div>
                    <div className="text-center min-w-[60px]">
                      <div className="text-lg font-semibold text-foreground tabular-nums">
                        {store.productCount}
                      </div>
                      <div className="text-[11px] text-muted-foreground uppercase tracking-wide">
                        Products
                      </div>
                    </div>
                    <div className="text-center min-w-[60px]">
                      <div className="flex items-center justify-center gap-1">
                        <span className="text-lg font-semibold text-foreground tabular-nums">
                          765
                        </span>
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                          +12%
                        </span>
                      </div>
                      <div className="text-[11px] text-muted-foreground uppercase tracking-wide">
                        Orders
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="font-medium"
                    >
                      <Link href={`/merchant/stores/${store.slug}`}>
                        <Eye className="w-3.5 h-3.5 mr-1.5" />
                        Manage
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Merchant;
