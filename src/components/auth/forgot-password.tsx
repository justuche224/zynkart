"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useTransition, useRef } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { authClient } from "@/lib/auth-client";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { FormSuccess } from "@/components/ui/form-success";
import { FormError } from "@/components/ui/form-error";
import { ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { info } from "@/constants";
import { TurnstileComponent, TurnstileRef } from "@/components/ui/turnstile";

export function ForgotPasswordForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"form"> & {}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");
  const [captchaToken, setCaptchaToken] = useState<string>("");
  const turnstileRef = useRef<TurnstileRef>(null);
  const searchParams = useSearchParams();
  const callbackURL = searchParams.get("callbackURL") || info.defaultRedirect;

  const formSchema = z.object({
    email: z.string().email(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    setError(undefined);
    setSuccess(undefined);

    // if (process.env.NODE_ENV === "production" && !captchaToken) {
    //   setError("Please complete the captcha verification");
    //   return;
    // }

    startTransition(async () => {
      const { error: forgetPasswordError } = await authClient.forgetPassword({
        email: values.email,
        redirectTo: `${window.location.origin}/reset-password`,
        fetchOptions: {
          headers: {
            "x-captcha-response": captchaToken,
          },
          onSuccess: () => {
            setSuccess("Reset link sent to your email address.");
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
            } else {
              setError(ctx.error.message);
            }
          },
        },
      });
      if (forgetPasswordError) {
        console.error("Forgot Password Error:", forgetPasswordError);
        // Reset captcha on error
        turnstileRef.current?.reset();
        setCaptchaToken("");
        setError(forgetPasswordError.message);
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
        <div className="flex flex-col items-center gap-2 text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-light tracking-tighter uppercase text-zinc-900 dark:text-zinc-100">
            Forgot Password
          </h1>
          <p className="text-xs uppercase tracking-widest text-zinc-500 mt-2">
            We&apos;ll send you a link to reset it
          </p>
        </div>
        <div className="grid gap-6">
          <FormField
            control={form.control}
            name="email"
            disabled={isPending}
            render={({ field }) => (
              <FormItem className="grid gap-2">
                <FormLabel htmlFor="email" className="text-xs uppercase tracking-widest text-zinc-500 mb-1">Email</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    id="email"
                    type="email"
                    placeholder="address@example.com"
                    required
                    autoComplete="email"
                    className="rounded-none border-zinc-200 dark:border-zinc-800 bg-transparent focus-visible:ring-1 focus-visible:ring-zinc-900 dark:focus-visible:ring-zinc-100"
                  />
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
          <button
            disabled={
              isPending ||
              (process.env.NODE_ENV === "production" && !captchaToken)
            }
            type="submit"
            className="mt-4 group inline-flex items-center justify-center gap-3 text-xs uppercase tracking-widest border border-zinc-900 dark:border-zinc-100 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-8 py-4 hover:bg-transparent hover:text-zinc-900 dark:hover:bg-transparent dark:hover:text-zinc-100 transition-colors duration-300 w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                Send Reset Link <ArrowRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
          <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
            <span className="relative z-10 bg-background px-2 text-muted-foreground">
              Or
            </span>
          </div>
        </div>
        <div className="text-center mt-6">
          <span className="text-xs uppercase tracking-widest text-zinc-500">
            Remember your password?{" "}
          </span>
          <Link
            href={`/sign-in${
              callbackURL
                ? `?callbackURL=${encodeURIComponent(callbackURL)}`
                : ""
            }`}
             className="text-xs uppercase tracking-widest font-medium border-b border-zinc-900 dark:border-zinc-100 hover:text-zinc-500 hover:border-zinc-500 transition-colors pb-0.5"
          >
            Sign in
          </Link>
        </div>
      </form>
    </Form>
  );
}
