"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useTransition } from "react";
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

export function ForgotPasswordForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"form"> & {}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");
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
    startTransition(async () => {
      const { error: forgetPasswordError } = await authClient.forgetPassword(
        {
          email: values.email,
          redirectTo: `${window.location.origin}/reset-password`,
        },
        {
          onSuccess: () => {
            setSuccess("Reset link sent to your email address.");
          },
          onError: (ctx) => {
            if (ctx.error.status === 429) {
              const retryAfter = ctx.error.headers.get("X-Retry-After");
              setError(
                `Clicking too fast! Please wait ${retryAfter} seconds before trying again.`
              );
            } else {
              setError(ctx.error.message);
            }
          },
        }
      );
      if (forgetPasswordError) {
        console.error("Forgot Password Error:", forgetPasswordError);
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
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-2xl font-bold">Forgot Your Password?</h1>
          <p className="text-balance text-sm text-muted-foreground">
            Enter your email below and we&apos;ll send you a link to reset it.
          </p>
        </div>
        <div className="grid gap-6">
          <FormField
            control={form.control}
            name="email"
            disabled={isPending}
            render={({ field }) => (
              <FormItem className="grid gap-2">
                <FormLabel htmlFor="email">Email</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    required
                    autoComplete="email"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormError message={error} />
          <FormSuccess message={success} />
          <Button disabled={isPending} type="submit" className="w-full">
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                Send Reset Link <ArrowRight className="ml-2 h-4 w-4" />
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
          Remember your password?{" "}
          <Link
            href={`/sign-in${
              callbackURL
                ? `?callbackURL=${encodeURIComponent(callbackURL)}`
                : ""
            }`}
            className="underline underline-offset-4 hover:text-primary"
          >
            Sign in
          </Link>
        </div>
      </form>
    </Form>
  );
}
