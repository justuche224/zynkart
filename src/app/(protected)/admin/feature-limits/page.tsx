import { Suspense } from "react";
import { serverAuth } from "@/lib/server-auth";
import { redirect } from "next/navigation";
import { FeatureLimitsTable } from "./_components/feature-limits-table";
import { CreateFeatureLimitDialog } from "./_components/create-feature-limit-dialog";
import { SeedDefaultLimitsButton } from "./_components/seed-default-limits-button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default async function FeatureLimitsPage() {
  const session = await serverAuth();

  if (!session) {
    return redirect("/sign-in");
  }

  if (session.user.role !== "ADMIN") {
    return redirect("/");
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Feature Limits</h1>
          <p className="text-muted-foreground">
            Manage feature limits and access controls for different plan types.
          </p>
        </div>
        <div className="flex gap-2">
          <SeedDefaultLimitsButton />
          <CreateFeatureLimitDialog>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Feature Limit
            </Button>
          </CreateFeatureLimitDialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Feature Limits Configuration</CardTitle>
          <CardDescription>
            Configure feature access and limits for free, pro, and elite plans.
            Use -1 for unlimited access, 0 to disable a feature.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<div>Loading feature limits...</div>}>
            <FeatureLimitsTable />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
