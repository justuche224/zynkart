"use client";

import {
  AlertCircle,
  ArrowRight,
  Check,
  X,
} from "lucide-react";
import Link from "next/link";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { type StoreHealth } from "@/actions/store/health";

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
  health,
}: {
  health: StoreHealth;
}) {
  return (
    <div className="">
      <main className="">
        <div className="container mx-auto p-0 md:p-6 space-y-6">
          <Card className="bg-background">
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
                      <AlertCircle className="h-4 w-4" color="red" />
                      <AlertTitle>Action Required</AlertTitle>
                      <AlertDescription className="flex justify-between items-center flex-col md:flex-row">
                        <span>{rec.info}</span>
                        <Button size="sm" variant="outline" asChild className="w-full md:w-auto">
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
        </div>
      </main>
    </div>
  );
}
