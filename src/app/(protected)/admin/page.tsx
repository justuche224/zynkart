import { serverAuth } from "@/lib/server-auth";
import { redirect } from "next/navigation";
import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
  Settings,
  Users,
  ShieldCheck,
  Crown,
  Database,
  Activity,
  BarChart3,
  Lock,
} from "lucide-react";

const AdminPage = async () => {
  const session = await serverAuth();

  if (!session) {
    return redirect("/sign-in");
  }

  if (session.user.role !== "ADMIN") {
    return redirect("/");
  }

  const adminSections = [
    {
      title: "Feature Limits",
      description: "Manage feature access and limits for different plan types",
      icon: ShieldCheck,
      href: "/admin/feature-limits",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
    },
    {
      title: "User Management",
      description: "Manage users, plans, and account settings",
      icon: Users,
      href: "/admin/users",
      color: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
    },
    {
      title: "Plan Analytics",
      description: "View usage analytics and plan metrics",
      icon: BarChart3,
      href: "/admin/analytics",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200",
    },
    {
      title: "Feature Overrides",
      description: "Temporary feature access controls for specific users",
      icon: Lock,
      href: "/admin/feature-overrides",
      color: "text-amber-600",
      bgColor: "bg-amber-50",
      borderColor: "border-amber-200",
    },
    {
      title: "System Settings",
      description: "Global system configuration and settings",
      icon: Settings,
      href: "/admin/settings",
      color: "text-gray-600",
      bgColor: "bg-gray-50",
      borderColor: "border-gray-200",
    },
    {
      title: "Database Tools",
      description: "Database management and seeding tools",
      icon: Database,
      href: "/admin/database",
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
      borderColor: "border-indigo-200",
    },
  ];

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <Badge variant="destructive" className="text-xs">
            <Crown className="h-3 w-3 mr-1" />
            ADMIN
          </Badge>
        </div>
        <p className="text-muted-foreground">
          Manage your Zynkart platform with comprehensive admin tools and
          controls.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {adminSections.map((section) => {
          const IconComponent = section.icon;
          return (
            <Link key={section.href} href={section.href}>
              <Card
                className={`transition-all hover:shadow-lg cursor-pointer ${section.borderColor} ${section.bgColor}`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${section.bgColor}`}>
                      <IconComponent className={`h-5 w-5 ${section.color}`} />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{section.title}</CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <CardDescription className="text-sm">
                    {section.description}
                  </CardDescription>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Quick Actions
          </CardTitle>
          <CardDescription>
            Common administrative tasks and shortcuts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Link href="/admin/feature-limits">
              <Button variant="outline" className="w-full justify-start">
                <ShieldCheck className="h-4 w-4 mr-2" />
                Setup Feature Limits
              </Button>
            </Link>
            <Link href="/admin/users">
              <Button variant="outline" className="w-full justify-start">
                <Users className="h-4 w-4 mr-2" />
                Manage Users
              </Button>
            </Link>
            <Link href="/admin/analytics">
              <Button variant="outline" className="w-full justify-start">
                <BarChart3 className="h-4 w-4 mr-2" />
                View Analytics
              </Button>
            </Link>
            <Link href="/admin/settings">
              <Button variant="outline" className="w-full justify-start">
                <Settings className="h-4 w-4 mr-2" />
                System Settings
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminPage;
