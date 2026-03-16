"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
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
import { ArrowRight, Loader2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { info } from "@/constants";
import { TurnstileComponent, TurnstileRef } from "@/components/ui/turnstile";

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"form"> & {}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");
  const [showPassword, setShowPassword] = useState(false);
  const [done, setDone] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string>("");
  const turnstileRef = useRef<TurnstileRef>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackURL = searchParams.get("callbackURL") || info.defaultRedirect;

  const formSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
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
      const { error } = await authClient.signIn.email({
        email: values.email,
        password: values.password,
        callbackURL: `${window.location.origin}${callbackURL}`,
        fetchOptions: {
          headers: {
            ...(process.env.NODE_ENV === "production" && captchaToken
              ? { "x-captcha-response": captchaToken }
              : {}),
          },
          onSuccess: () => {
            // console.log("login success");
            router.push(callbackURL);
          },
          onError(context) {
            // Reset captcha on error
            turnstileRef.current?.reset();
            setCaptchaToken("");

            if (context.error.status === 403) {
              toast.error("Verify your email!");
              setDone(true);
            } else if (context.error.status === 429) {
              const retryAfter = context.error.headers.get("X-Retry-After");
              setError(
                `Clicking too fast! Please wait ${retryAfter} seconds before trying again.`
              );
            } else {
              setError(context.error.message);
            }
          },
        },
      });
      if (error) {
        // Reset captcha on error
        turnstileRef.current?.reset();
        setCaptchaToken("");
        setError(error.message);
      }
    });
  }

  return (
    <>
      <Done done={done} setDone={setDone} />
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className={cn("flex flex-col gap-6", className)}
          {...props}
        >
          <div className="flex flex-col items-center gap-2 text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-light tracking-tighter uppercase text-zinc-900 dark:text-zinc-100">
              Sign In
            </h1>
            <p className="text-xs uppercase tracking-widest text-zinc-500 mt-2">
              Welcome back to your store
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
            <FormField
              control={form.control}
              name="password"
              disabled={isPending}
              render={({ field }) => (
                <FormItem className="grid gap-2">
                  <div className="flex items-center justify-between mb-1">
                    <FormLabel htmlFor="password" className="text-xs uppercase tracking-widest text-zinc-500">Password</FormLabel>
                    <Link
                      href="/forgot-password"
                      className="text-xs tracking-widest uppercase text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <FormControl>
                    <div className="relative">
                      <Input
                        {...field}
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="********"
                        required
                        className="rounded-none border-zinc-200 dark:border-zinc-800 bg-transparent focus-visible:ring-1 focus-visible:ring-zinc-900 dark:focus-visible:ring-zinc-100"
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
                  Enter Store
                  <ArrowRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
            <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
              <span className="relative z-10 bg-background px-2 text-muted-foreground">
                Or
              </span>
            </div>
            {/* <Button variant="outline" className="w-full">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path
                d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"
                fill="currentColor"
              />
            </svg>
            Login with GitHub
          </Button> */}
          </div>
          <div className="text-center mt-6">
            <span className="text-xs uppercase tracking-widest text-zinc-500">
              No account?{" "}
            </span>
            <Link href="/sign-up" className="text-xs uppercase tracking-widest font-medium border-b border-zinc-900 dark:border-zinc-100 hover:text-zinc-500 hover:border-zinc-500 transition-colors pb-0.5">
              Create a store
            </Link>
          </div>
        </form>
      </Form>
    </>
  );
}

const Done = ({
  done,
  setDone,
}: {
  done: boolean;
  setDone: (done: boolean) => void;
}) => {
  return (
    <Dialog open={done} onOpenChange={setDone}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Account verification required!</DialogTitle>
          <DialogDescription>
            <h1 className="text-lg font-semibold">
              A link has been sent to your email to verify your account. Please
              check your email for the verification link.
            </h1>
            <p className="text-sm text-muted-foreground mt-2">
              You might need to check your spam folder and mark it as not spam.
            </p>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button>Continue</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
