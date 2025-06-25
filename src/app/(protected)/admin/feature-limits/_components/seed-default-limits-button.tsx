"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { seedDefaultLimits } from "@/actions/admin/feature-limits";
import { toast } from "sonner";
import { Database } from "lucide-react";

export function SeedDefaultLimitsButton() {
  const [loading, setLoading] = useState(false);

  const handleSeed = async () => {
    setLoading(true);
    try {
      const result = await seedDefaultLimits();
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to seed default limits");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline" disabled={loading}>
          <Database className="h-4 w-4 mr-2" />
          {loading ? "Seeding..." : "Seed Default Limits"}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Seed Default Feature Limits</AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p>
              This will create default feature limits for all plan types (Free,
              Pro, Elite). Existing limits will be updated with the default
              values.
            </p>
            <div className="text-sm text-muted-foreground">
              <strong>Default limits include:</strong>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>Store count limits (Free: 1, Pro: 2, Elite: unlimited)</li>
                <li>
                  Product count limits (Free: 10, Pro: 50, Elite: unlimited)
                </li>
                <li>Feature access (Custom domain, API mode, etc.)</li>
                <li>
                  Email service limits (Free: 0, Pro: 500/month, Elite:
                  unlimited)
                </li>
                <li>Branding settings and template access</li>
              </ul>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleSeed} disabled={loading}>
            {loading ? "Seeding..." : "Seed Default Limits"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
