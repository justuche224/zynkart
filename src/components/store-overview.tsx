"use client";

import {
  AlertCircle,
  ArrowRight,
  BarChart3,
  BanknoteIcon,
  Check,
  CreditCard,
  DollarSign,
  ExternalLink,
  Globe,
  Package,
  Palette,
  ShoppingCart,
  Truck,
  User,
  X,
} from "lucide-react";
import Link from "next/link";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { type StoreHealth } from "@/actions/store/health";

interface StoreData {
  id: string;
  merchantId: string;
  name: string;
  slug: string;
  createdAt: Date;
  updatedAt: Date;
  template: string;
  address: string;
  phone: string;
  email: string;
}

const getHealthStatus = (score: number) => {
  if (score < 30) return "Critical";
  if (score < 60) return "Needs Improvement";
  if (score < 90) return "Good";
  return "Excellent";
};

const getHealthColor = (score: number) => {
  if (score < 30) return "text-red-500";
  if (score < 60) return "text-amber-500";
  if (score < 90) return "text-emerald-500";
  return "text-green-500";
};

export default function StoreOverview({
  store,
  health,
}: {
  store: StoreData;
  health: StoreHealth;
}) {
  return (
    <div className="flex min-h-screen">
      <main className="flex-1 overflow-auto">
        <div className="container mx-auto p-6 space-y-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold">{store.name}</h1>
              <p className="text-muted-foreground">Store dashboard</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link
                  href={`http://${store.slug}.localhost:3000`}
                  target="_blank"
                >
                  <Globe className="mr-2 h-4 w-4" />
                  View Store
                </Link>
              </Button>
              <Button size="sm" asChild>
                <Link href={`/merchant/stores/${store.slug}/settings`}>
                  Settings
                </Link>
              </Button>
            </div>
          </div>

          {/* Store Health Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Store Health</CardTitle>
              <CardDescription>
                Complete these steps to ensure your store is ready for customers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-6">
                <div className="md:w-1/3">
                  <div className="text-center p-4 border rounded-lg dark:border-gray-800">
                    <h3 className="text-lg font-medium mb-2">Health Score</h3>
                    <div className="relative w-32 h-32 mx-auto">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span
                          className={`text-3xl font-bold ${getHealthColor(
                            health.healthScore
                          )}`}
                        >
                          {health.healthScore}%
                        </span>
                      </div>
                      <svg className="w-full h-full" viewBox="0 0 100 100">
                        <circle
                          className="text-gray-200 dark:text-gray-800"
                          strokeWidth="10"
                          stroke="currentColor"
                          fill="transparent"
                          r="40"
                          cx="50"
                          cy="50"
                        />
                        <circle
                          className={`${
                            health.healthScore < 30
                              ? "text-red-500"
                              : health.healthScore < 60
                              ? "text-amber-500"
                              : health.healthScore < 90
                              ? "text-emerald-500"
                              : "text-green-500"
                          }`}
                          strokeWidth="10"
                          strokeDasharray={`${health.healthScore * 2.51} 251`}
                          strokeLinecap="round"
                          stroke="currentColor"
                          fill="transparent"
                          r="40"
                          cx="50"
                          cy="50"
                        />
                      </svg>
                    </div>
                    <p className="mt-2 text-muted-foreground">
                      Status:{" "}
                      <span className={getHealthColor(health.healthScore)}>
                        {getHealthStatus(health.healthScore)}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="md:w-2/3 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 p-3 rounded-lg border dark:border-gray-800">
                      {health.hasAccountDetails ? (
                        <Check className="h-5 w-5 text-green-500" />
                      ) : (
                        <X className="h-5 w-5 text-red-500" />
                      )}
                      <div>
                        <p className="font-medium">Payment Account</p>
                        <p className="text-sm text-muted-foreground">
                          {health.hasAccountDetails ? "Set up" : "Not set up"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 rounded-lg border dark:border-gray-800">
                      {health.hasProducts ? (
                        <Check className="h-5 w-5 text-green-500" />
                      ) : (
                        <X className="h-5 w-5 text-red-500" />
                      )}
                      <div>
                        <p className="font-medium">Products</p>
                        <p className="text-sm text-muted-foreground">
                          {health.totalProducts} products added
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 rounded-lg border dark:border-gray-800">
                      {health.hasShippingZones ? (
                        <Check className="h-5 w-5 text-green-500" />
                      ) : (
                        <X className="h-5 w-5 text-red-500" />
                      )}
                      <div>
                        <p className="font-medium">Shipping</p>
                        <p className="text-sm text-muted-foreground">
                          {health.hasShippingZones
                            ? "Configured"
                            : "Not configured"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 rounded-lg border dark:border-gray-800">
                      {health.hasOwnerDoneKYC ? (
                        <Check className="h-5 w-5 text-green-500" />
                      ) : (
                        <X className="h-5 w-5 text-red-500" />
                      )}
                      <div>
                        <p className="font-medium">KYC Verification</p>
                        <p className="text-sm text-muted-foreground">
                          {health.hasOwnerDoneKYC
                            ? "Completed"
                            : "Not completed"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 rounded-lg border dark:border-gray-800">
                      {health.customised ? (
                        <Check className="h-5 w-5 text-green-500" />
                      ) : (
                        <X className="h-5 w-5 text-red-500" />
                      )}
                      <div>
                        <p className="font-medium">Store Customization</p>
                        <p className="text-sm text-muted-foreground">
                          {health.customised ? "Customized" : "Not customized"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            {health.recommendations.length > 0 && (
              <CardFooter className="flex-col items-start">
                <Separator className="my-4" />
                <h4 className="font-medium mb-2">Recommended Actions</h4>
                <div className="space-y-2 w-full">
                  {health.recommendations.map((rec, i) => (
                    <Alert key={i} variant="default" className="bg-muted">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Action Required</AlertTitle>
                      <AlertDescription className="flex justify-between items-center">
                        <span>{rec.info}</span>
                        <Button size="sm" variant="outline" asChild>
                          <Link href={rec.link}>
                            Take Action
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Link>
                        </Button>
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              </CardFooter>
            )}
          </Card>

          {/* Quick Actions and Products Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Products Overview */}
            <Card className="lg:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Products Overview</CardTitle>
                <Link href={`/merchant/${store.slug}/products`}>
                  <Button variant="ghost" size="sm">
                    View All
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {!health.hasProducts ? (
                    <div className="flex items-center justify-center h-40 border-2 border-dashed rounded-lg dark:border-gray-800">
                      <div className="text-center">
                        <Package
                          className="mx-auto text-muted-foreground"
                          size={24}
                        />
                        <p className="mt-2 text-sm text-muted-foreground">
                          No products added yet
                        </p>
                        <Link
                          href={`/merchant/${store.slug}/products/new`}
                          className="mt-4 inline-block"
                        >
                          <Button size="sm" variant="outline">
                            Add your first product
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <div className="text-center p-4 border rounded-lg dark:border-gray-800">
                          <h3 className="text-2xl font-bold">
                            {health.totalProducts}
                          </h3>
                          <p className="text-muted-foreground text-sm">
                            Total Products
                          </p>
                        </div>

                        <div className="text-center p-4 border rounded-lg dark:border-gray-800">
                          <h3 className="text-2xl font-bold">0</h3>
                          <p className="text-muted-foreground text-sm">
                            Out of Stock
                          </p>
                        </div>

                        <div className="text-center p-4 border rounded-lg dark:border-gray-800">
                          <h3 className="text-2xl font-bold">
                            {health.totalProducts}
                          </h3>
                          <p className="text-muted-foreground text-sm">
                            Active Products
                          </p>
                        </div>
                      </div>

                      <div className="mt-6">
                        <Link
                          href={`/merchant/${store.slug}/products/new`}
                          className="block w-full"
                        >
                          <Button className="w-full">
                            <Package className="mr-2 h-4 w-4" />
                            Add New Product
                          </Button>
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Recent Orders */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
                <CardDescription>
                  Your most recent customer orders
                </CardDescription>
              </CardHeader>
              <CardContent>
                {health.hasProducts ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-800">
                      <div className="flex items-center gap-3">
                        <div className="bg-muted p-2 rounded-md">
                          <ShoppingCart size={16} />
                        </div>
                        <div>
                          <p className="font-medium">Order #1234</p>
                          <p className="text-sm text-muted-foreground">
                            2 items • $120.00
                          </p>
                        </div>
                      </div>
                      <Badge>Processing</Badge>
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-800">
                      <div className="flex items-center gap-3">
                        <div className="bg-muted p-2 rounded-md">
                          <ShoppingCart size={16} />
                        </div>
                        <div>
                          <p className="font-medium">Order #1233</p>
                          <p className="text-sm text-muted-foreground">
                            1 item • $45.00
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline">Delivered</Badge>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-40 border-2 border-dashed rounded-lg dark:border-gray-800">
                    <div className="text-center">
                      <ShoppingCart
                        className="mx-auto text-muted-foreground"
                        size={24}
                      />
                      <p className="mt-2 text-sm text-muted-foreground">
                        No orders yet
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Add products to start receiving orders
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button
                  variant="outline"
                  className="w-full"
                  disabled={!health.hasProducts}
                >
                  View All Orders
                </Button>
              </CardFooter>
            </Card>
          </div>

          {/* Store Analytics */}
          <Card>
            <CardHeader>
              <CardTitle>Store Analytics</CardTitle>
              <CardDescription>
                Overview of your store performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="visitors">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="visitors">Visitors</TabsTrigger>
                  <TabsTrigger value="sales">Sales</TabsTrigger>
                  <TabsTrigger value="conversion">Conversion</TabsTrigger>
                </TabsList>
                <TabsContent value="visitors" className="mt-4">
                  <div className="h-[200px] flex items-center justify-center">
                    {health.hasProducts ? (
                      <div className="w-full space-y-4">
                        <div className="flex justify-between">
                          <div>
                            <p className="text-2xl font-bold">124</p>
                            <p className="text-sm text-muted-foreground">
                              Total visitors this week
                            </p>
                          </div>
                          <div>
                            <Badge
                              variant="outline"
                              className="bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                            >
                              +12% ↑
                            </Badge>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Mon</span>
                            <span>Tue</span>
                            <span>Wed</span>
                            <span>Thu</span>
                            <span>Fri</span>
                            <span>Sat</span>
                            <span>Sun</span>
                          </div>
                          <div className="flex items-end gap-1 h-24">
                            <div className="bg-primary/80 dark:bg-primary/60 w-full h-[30%] rounded-sm"></div>
                            <div className="bg-primary/80 dark:bg-primary/60 w-full h-[45%] rounded-sm"></div>
                            <div className="bg-primary/80 dark:bg-primary/60 w-full h-[60%] rounded-sm"></div>
                            <div className="bg-primary/80 dark:bg-primary/60 w-full h-[40%] rounded-sm"></div>
                            <div className="bg-primary/80 dark:bg-primary/60 w-full h-[70%] rounded-sm"></div>
                            <div className="bg-primary/80 dark:bg-primary/60 w-full h-[90%] rounded-sm"></div>
                            <div className="bg-primary/80 dark:bg-primary/60 w-full h-[50%] rounded-sm"></div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center">
                        <BarChart3
                          className="mx-auto text-muted-foreground"
                          size={24}
                        />
                        <p className="mt-2 text-sm text-muted-foreground">
                          No analytics data available yet
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Add products and start promoting your store
                        </p>
                      </div>
                    )}
                  </div>
                </TabsContent>
                <TabsContent value="sales" className="mt-4">
                  <div className="h-[200px] flex items-center justify-center">
                    <div className="text-center">
                      <DollarSign
                        className="mx-auto text-muted-foreground"
                        size={24}
                      />
                      <p className="mt-2 text-sm text-muted-foreground">
                        No sales data available yet
                      </p>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="conversion" className="mt-4">
                  <div className="h-[200px] flex items-center justify-center">
                    <div className="text-center">
                      <CreditCard
                        className="mx-auto text-muted-foreground"
                        size={24}
                      />
                      <p className="mt-2 text-sm text-muted-foreground">
                        No conversion data available yet
                      </p>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Store Completion Checklist */}
          <Card>
            <CardHeader>
              <CardTitle>Store Completion Checklist</CardTitle>
              <CardDescription>
                Complete these steps to maximize your store&apos;s potential
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {health.hasAccountDetails ? (
                      <div className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 p-1 rounded-full">
                        <Check className="h-5 w-5" />
                      </div>
                    ) : (
                      <div className="bg-gray-100 dark:bg-gray-800 text-gray-500 p-1 rounded-full">
                        <BanknoteIcon className="h-5 w-5" />
                      </div>
                    )}
                    <div>
                      <p className="font-medium">Set up payment account</p>
                      <p className="text-sm text-muted-foreground">
                        Add your bank details to receive payments
                      </p>
                    </div>
                  </div>
                  <Button
                    variant={health.hasAccountDetails ? "outline" : "default"}
                    size="sm"
                    asChild
                  >
                    <Link href={`/merchant/${store.slug}/settings/payments`}>
                      {health.hasAccountDetails ? "View" : "Set up"}
                    </Link>
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {health.hasProducts ? (
                      <div className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 p-1 rounded-full">
                        <Check className="h-5 w-5" />
                      </div>
                    ) : (
                      <div className="bg-gray-100 dark:bg-gray-800 text-gray-500 p-1 rounded-full">
                        <Package className="h-5 w-5" />
                      </div>
                    )}
                    <div>
                      <p className="font-medium">Add products</p>
                      <p className="text-sm text-muted-foreground">
                        Add at least one product to your store
                      </p>
                    </div>
                  </div>
                  <Button
                    variant={health.hasProducts ? "outline" : "default"}
                    size="sm"
                    asChild
                  >
                    <Link href={`/merchant/${store.slug}/products/new`}>
                      {health.hasProducts ? "Add more" : "Add product"}
                    </Link>
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {health.hasShippingZones ? (
                      <div className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 p-1 rounded-full">
                        <Check className="h-5 w-5" />
                      </div>
                    ) : (
                      <div className="bg-gray-100 dark:bg-gray-800 text-gray-500 p-1 rounded-full">
                        <Truck className="h-5 w-5" />
                      </div>
                    )}
                    <div>
                      <p className="font-medium">Configure shipping</p>
                      <p className="text-sm text-muted-foreground">
                        Set up shipping zones and delivery fees
                      </p>
                    </div>
                  </div>
                  <Button
                    variant={health.hasShippingZones ? "outline" : "default"}
                    size="sm"
                    asChild
                  >
                    <Link href={`/merchant/${store.slug}/settings/shipping`}>
                      {health.hasShippingZones ? "Manage" : "Set up"}
                    </Link>
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {health.hasOwnerDoneKYC ? (
                      <div className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 p-1 rounded-full">
                        <Check className="h-5 w-5" />
                      </div>
                    ) : (
                      <div className="bg-gray-100 dark:bg-gray-800 text-gray-500 p-1 rounded-full">
                        <User className="h-5 w-5" />
                      </div>
                    )}
                    <div>
                      <p className="font-medium">Complete KYC verification</p>
                      <p className="text-sm text-muted-foreground">
                        Verify your identity to enable checkout
                      </p>
                    </div>
                  </div>
                  <Button
                    variant={health.hasOwnerDoneKYC ? "outline" : "default"}
                    size="sm"
                    asChild
                  >
                    <Link
                      href={`/merchant/${store.slug}/settings/verification`}
                    >
                      {health.hasOwnerDoneKYC ? "View" : "Complete"}
                    </Link>
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {health.customised ? (
                      <div className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 p-1 rounded-full">
                        <Check className="h-5 w-5" />
                      </div>
                    ) : (
                      <div className="bg-gray-100 dark:bg-gray-800 text-gray-500 p-1 rounded-full">
                        <Palette className="h-5 w-5" />
                      </div>
                    )}
                    <div>
                      <p className="font-medium">Customize your store</p>
                      <p className="text-sm text-muted-foreground">
                        Add logo, banner, and select a theme
                      </p>
                    </div>
                  </div>
                  <Button
                    variant={health.customised ? "outline" : "default"}
                    size="sm"
                    asChild
                  >
                    <Link href={`/merchant/${store.slug}/settings/appearance`}>
                      {health.customised ? "Edit" : "Customize"}
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Progress value={health.healthScore} className="w-full" />
            </CardFooter>
          </Card>
        </div>
      </main>
    </div>
  );
}
