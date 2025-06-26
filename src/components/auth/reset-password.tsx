"use client";

import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import React, { useState, useTransition, useRef } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { authClient } from "@/lib/auth-client";
import {
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormField,
} from "@/components/ui/form";
import { Loader2, ArrowRight, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormError } from "../ui/form-error";
import { FormSuccess } from "../ui/form-success";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { TurnstileComponent, TurnstileRef } from "@/components/ui/turnstile";

export function ResetPasswordForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"form"> & {}) {
  const [isPending, startTransition] = useTransition();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const invalidToken = searchParams.get("invalidToken") || undefined;
  const [error, setError] = useState<string | undefined>(invalidToken);
  const [success, setSuccess] = useState<string | undefined>("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string>("");
  const turnstileRef = useRef<TurnstileRef>(null);
  const router = useRouter();

  const formSchema = z
    .object({
      password: z
        .string()
        .min(8, "Password must be at least 8 characters long")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/[a-z]/, "Password must contain at least one lowercase letter")
        .regex(/\d/, "Password must contain at least one number")
        .regex(
          /[@$!%*?&#]/,
          "Password must contain at least one special character (@$!%*?&#)"
        ),
      confirmPassword: z
        .string()
        .min(8, "Password must be at least 8 characters long"),
    })
    .refine((data) => data.password === data.confirmPassword, {
      path: ["confirmPassword"],
      message: "Passwords do not match",
    });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    if (invalidToken || !token) {
      setError(invalidToken || "Password reset token is missing or invalid.");
      toast.error(
        invalidToken || "Password reset token is missing or invalid."
      );
      return;
    }

    if (process.env.NODE_ENV === "production" && !captchaToken) {
      setError("Please complete the captcha verification");
      return;
    }

    setError(undefined);
    setSuccess(undefined);
    startTransition(async () => {
      const { error: resetError } = await authClient.resetPassword({
        newPassword: values.password,
        token,
        fetchOptions: {
          headers: {
            ...(process.env.NODE_ENV === "production" && captchaToken
              ? { "x-captcha-response": captchaToken }
              : {}),
          },
          onSuccess: () => {
            setSuccess("Password updated successfully!");
            toast.success("Password updated!", {
              description: "You can now login with your new password.",
              duration: 5000,
            });
            router.push("/sign-in");
          },
          onError: (ctx) => {
            // Reset captcha on error
            turnstileRef.current?.reset();
            setCaptchaToken("");

            if (ctx.error.status === 429) {
              const retryAfter = ctx.error.headers.get("X-Retry-After");
              setError(
                `Clicking too fast! Please wait ${retryAfter} seconds before trying again.`
              );
            } else if (ctx.error.message.includes("expired")) {
              setError(
                "This password reset link has expired. Please request a new one."
              );
            } else {
              setError(ctx.error.message || "Failed to reset password.");
            }
          },
        },
      });
      if (resetError) {
        // Reset captcha on error
        turnstileRef.current?.reset();
        setCaptchaToken("");
        console.error("Reset Password Error:", resetError);
        setError(resetError.message);
      }
    });
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn("flex flex-col gap-6", className)}
        {...props}
      >
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-2xl font-bold">Set New Password</h1>
          <p className="text-balance text-sm text-muted-foreground">
            Create a strong new password for your account.
          </p>
        </div>

        <div className="grid gap-6">
          <FormField
            control={form.control}
            name="password"
            disabled={isPending || !!invalidToken}
            render={({ field }) => (
              <FormItem className="grid gap-2">
                <FormLabel htmlFor="password">New Password</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      {...field}
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="********"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <Eye className="h-4 w-4" />
                      ) : (
                        <EyeOff className="h-4 w-4" />
                      )}
                      <span className="sr-only">
                        {showPassword ? "Hide password" : "Show password"}
                      </span>
                    </Button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="confirmPassword"
            disabled={isPending || !!invalidToken}
            render={({ field }) => (
              <FormItem className="grid gap-2">
                <FormLabel htmlFor="confirmPassword">
                  Confirm New Password
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      {...field}
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="********"
                      required
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

          {process.env.NODE_ENV === "production" && (
            <div className="flex justify-center">
              <TurnstileComponent
                ref={turnstileRef}
                siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
                onVerify={(token) => setCaptchaToken(token)}
                onError={() => {
                  setCaptchaToken("");
                  setError("Captcha verification failed. Please try again.");
                }}
                onExpire={() => {
                  setCaptchaToken("");
                  setError("Captcha expired. Please try again.");
                }}
              />
            </div>
          )}

          <FormError message={error} />
          <FormSuccess message={success} />

          <Button
            type="submit"
            className="w-full"
            disabled={
              isPending ||
              !!invalidToken ||
              (process.env.NODE_ENV === "production" && !captchaToken)
            }
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                Reset Password <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>

          <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
            <span className="relative z-10 bg-background px-2 text-muted-foreground">
              Or
            </span>
          </div>
        </div>

        <div className="text-center text-sm">
          Remembered your password or need to sign in?{" "}
          <Link
            href="/sign-in"
            className="underline underline-offset-4 hover:text-primary"
          >
            Sign in
          </Link>
        </div>
      </form>
    </Form>
  );
}
