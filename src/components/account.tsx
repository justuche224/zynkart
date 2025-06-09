"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { authClient } from "@/lib/auth-client";
import type { Prettify } from "better-auth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  LogOut,
  Shield,
  User,
  UserCircle,
  Eye,
  EyeOff,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { format } from "date-fns";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";
import Link from "next/link";
import SignOut from "./auth/sign-out";

type Session = Prettify<{
  id: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  expiresAt: Date;
  token: string;
  ipAddress?: string | null | undefined;
  userAgent?: string | null | undefined;
}>;

type UserProfile = {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  image?: string | null | undefined;
  role: string;
};

type CurrentSession = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  expiresAt: Date;
  token: string;
  ipAddress?: string | null | undefined | undefined;
  userAgent?: string | null | undefined | undefined;
};

export default function Account({
  user,
  currentSession,
}: {
  user: UserProfile;
  currentSession: CurrentSession;
}) {
  const [sessions, setSessions] = useState<Session[] | null>(null);
  const [loading, setLoading] = useState({
    sessions: true,
    profile: false,
    password: false,
  });
  const [profileForm, setProfileForm] = useState({
    name: user.name,
    image: user.image || "",
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const passwordSchema = z
    .object({
      currentPassword: z.string().min(1, "Current password is required"),
      newPassword: z
        .string()
        .min(8, "Password must be at least 8 characters long")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/[a-z]/, "Password must contain at least one lowercase letter")
        .regex(/\d/, "Password must contain at least one number")
        .regex(
          /[@$!%*?&#]/,
          "Password must contain at least one special character (@$!%*?&#)"
        ),
      confirmPassword: z.string().min(1, "Please confirm your password"),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      path: ["confirmPassword"],
      message: "Passwords do not match",
    });

  type PasswordFormValues = z.infer<typeof passwordSchema>;

  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    setLoading((prev) => ({ ...prev, sessions: true }));
    try {
      const { data, error } = await authClient.listSessions();
      if (error) throw error;
      setSessions(data);
    } catch (error) {
      console.error(error);
      toast.error("Error fetching sessions", {
        description: "Please try again later.",
      });
    } finally {
      setLoading((prev) => ({ ...prev, sessions: false }));
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading((prev) => ({ ...prev, profile: true }));

    try {
      await authClient.updateUser({
        name: profileForm.name,
        image: profileForm.image,
      });

      toast.success("Profile updated", {
        description: "Your profile information has been updated successfully.",
      });
    } catch (error) {
      console.error(error);
      toast.error("Error updating profile", {
        description: "Please try again later.",
      });
    } finally {
      setLoading((prev) => ({ ...prev, profile: false }));
    }
  };

  const handleChangePassword = async (values: PasswordFormValues) => {
    setLoading((prev) => ({ ...prev, password: true }));

    try {
      const {  error } = await authClient.changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
        revokeOtherSessions: true,
      });
      if (error) throw error;
      passwordForm.reset();

      toast("Password changed", {
        description:
          "Your password has been changed successfully. All other sessions have been revoked.",
      });

      fetchSessions();
    } catch (error) {
      console.error(error);
      toast.error("Error changing password", {
        description:
          error instanceof Error
            ? error.message
            : "Please check your current password and try again.",
      });
    } finally {
      setLoading((prev) => ({ ...prev, password: false }));
    }
  };

  const handleRevokeSession = async (token: string) => {
    try {
      await authClient.revokeSession({
        token,
      });

      toast.success("Session revoked", {
        description: "The session has been revoked successfully.",
      });

      fetchSessions();
    } catch (error) {
      console.error(error);
      toast.error("Error revoking session", {
        description: "Please try again later.",
      });
    }
  };

  const handleRevokeAllSessions = async () => {
    try {
      await authClient.revokeSessions();

      toast.success("All sessions revoked", {
        description: "All sessions except the current one have been revoked.",
      });

      fetchSessions();
    } catch (error) {
      console.error(error);
      toast.error("Error revoking sessions", {
        description: "Please try again later.",
      });
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const isCurrentSession = (session: Session) => {
    return session.id === currentSession.id;
  };

  const truncateUserAgent = (userAgent?: string | null) => {
    if (!userAgent) return "Unknown";
    return userAgent.length > 40
      ? userAgent.substring(0, 40) + "..."
      : userAgent;
  };

  return (
    <div className="container max-w-5xl py-10 mx-auto">
      <div className="mb-8 flex items-center gap-4">
        <Avatar className="h-16 w-16">
          <AvatarImage src={user.image || ""} alt={user.name} />
          <AvatarFallback className="text-lg">
            {getInitials(user.name)}
          </AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-2xl font-bold">{user.name}</h1>
          <p className="text-muted-foreground">{user.email}</p>
          <div className="mt-1 flex items-center gap-2">
            <Badge
              variant={user.emailVerified ? "default" : "outline"}
              className="gap-1"
            >
              {user.emailVerified ? (
                <>
                  <CheckCircle2 className="h-3 w-3" />
                  <span>Verified</span>
                </>
              ) : (
                <>
                  <AlertCircle className="h-3 w-3" />
                  <span>Unverified</span>
                </>
              )}
            </Badge>
            <Badge variant="secondary" className="gap-1">
              <UserCircle className="h-3 w-3" />
              <span>{user.role}</span>
            </Badge>
          </div>
        </div>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span>Profile</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span>Security</span>
          </TabsTrigger>
          <TabsTrigger value="sessions" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>Sessions</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your account profile information and profile picture
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleUpdateProfile}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={profileForm.name}
                    onChange={(e) =>
                      setProfileForm({ ...profileForm, name: e.target.value })
                    }
                    placeholder="Your full name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" value={user.email} disabled />
                  {!user.emailVerified && (
                    <Alert variant="destructive" className="mt-2">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Unverified Email</AlertTitle>
                      <AlertDescription>
                        Please verify your email address to access all features.
                        <Button variant="link" className="h-auto p-0 pl-1">
                          Resend verification email
                        </Button>
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="image">Profile Picture URL</Label>
                  <Input
                    id="image"
                    value={profileForm.image}
                    onChange={(e) =>
                      setProfileForm({ ...profileForm, image: e.target.value })
                    }
                    placeholder="https://example.com/avatar.jpg"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Account Created</Label>
                  <div className="text-sm text-muted-foreground">
                    {format(new Date(user.createdAt), "PPP")}
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={loading.profile}>
                  {loading.profile ? "Saving..." : "Save Changes"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>
                Update your password to keep your account secure
              </CardDescription>
            </CardHeader>
            <Form {...passwordForm}>
              <form onSubmit={passwordForm.handleSubmit(handleChangePassword)}>
                <CardContent className="space-y-4">
                  <FormField
                    control={passwordForm.control}
                    name="currentPassword"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center">
                          <FormLabel>Current Password</FormLabel>
                          <Link
                            href="/forgot-password"
                            className="ml-auto text-sm underline-offset-4 hover:underline"
                          >
                            Forgot your password?
                          </Link>
                        </div>
                        <FormControl>
                          <div className="relative">
                            <Input
                              {...field}
                              type={showCurrentPassword ? "text" : "password"}
                              disabled={loading.password}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                              onClick={() =>
                                setShowCurrentPassword(!showCurrentPassword)
                              }
                            >
                              {showCurrentPassword ? (
                                <Eye className="h-4 w-4" />
                              ) : (
                                <EyeOff className="h-4 w-4" />
                              )}
                              <span className="sr-only">
                                {showCurrentPassword
                                  ? "Hide password"
                                  : "Show password"}
                              </span>
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={passwordForm.control}
                    name="newPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>New Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              {...field}
                              type={showNewPassword ? "text" : "password"}
                              disabled={loading.password}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                              onClick={() =>
                                setShowNewPassword(!showNewPassword)
                              }
                            >
                              {showNewPassword ? (
                                <Eye className="h-4 w-4" />
                              ) : (
                                <EyeOff className="h-4 w-4" />
                              )}
                              <span className="sr-only">
                                {showNewPassword
                                  ? "Hide password"
                                  : "Show password"}
                              </span>
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={passwordForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm New Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              {...field}
                              type={showConfirmPassword ? "text" : "password"}
                              disabled={loading.password}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                              onClick={() =>
                                setShowConfirmPassword(!showConfirmPassword)
                              }
                            >
                              {showConfirmPassword ? (
                                <Eye className="h-4 w-4" />
                              ) : (
                                <EyeOff className="h-4 w-4" />
                              )}
                              <span className="sr-only">
                                {showConfirmPassword
                                  ? "Hide password"
                                  : "Show password"}
                              </span>
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="space-y-1 text-sm">
                    <p className="font-medium">Password requirements:</p>
                    <ul className="list-disc pl-5 text-muted-foreground">
                      <li>At least 8 characters long</li>
                      <li>At least one uppercase letter (A-Z)</li>
                      <li>At least one lowercase letter (a-z)</li>
                      <li>At least one number (0-9)</li>
                      <li>At least one special character (@$!%*?&#)</li>
                    </ul>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" disabled={loading.password}>
                    {loading.password ? "Updating..." : "Update Password"}
                  </Button>
                </CardFooter>
              </form>
            </Form>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Danger Zone</CardTitle>
              <CardDescription>
                Actions that can permanently affect your account
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-lg font-medium">Delete Account</h3>
                <p className="text-sm text-muted-foreground">
                  Once you delete your account, there is no going back. Please
                  be certain.
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="destructive">Delete Account</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="sessions" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Active Sessions</CardTitle>
                <CardDescription>
                  Manage your active sessions across devices
                </CardDescription>
              </div>
              <Button
                variant="outline"
                onClick={handleRevokeAllSessions}
                disabled={!sessions || sessions.length <= 1}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out All Devices
              </Button>
            </CardHeader>
            <CardContent>
              {loading.sessions ? (
                <div className="flex justify-center py-8">
                  <div className="animate-pulse text-center">
                    <p className="text-sm text-muted-foreground">
                      Loading sessions...
                    </p>
                  </div>
                </div>
              ) : !sessions || sessions.length === 0 ? (
                <div className="py-8 text-center">
                  <p className="text-sm text-muted-foreground">
                    No active sessions found
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {sessions.map((session) => (
                    <div key={session.id} className="rounded-lg border p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium">
                              {truncateUserAgent(session.userAgent)}
                            </h3>
                            {isCurrentSession(session) && (
                              <Badge variant="secondary" className="text-xs">
                                Current
                              </Badge>
                            )}
                          </div>
                          <div className="mt-1 text-sm text-muted-foreground">
                            <p>IP: {session.ipAddress || "Unknown"}</p>
                            <p>
                              Last active:{" "}
                              {format(new Date(session.updatedAt), "PPp")}
                            </p>
                            <p>
                              Expires:{" "}
                              {format(new Date(session.expiresAt), "PPp")}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRevokeSession(session.token)}
                          disabled={isCurrentSession(session)}
                        >
                          {isCurrentSession(session)
                            ? "Current Session"
                            : "Revoke"}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="mt-8">
        <SignOut />
      </div>
    </div>
  );
}
