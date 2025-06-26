"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useState, useTransition, useRef } from "react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Loader2, ArrowRight, Eye, EyeOff } from "lucide-react";
import { FormError } from "@/components/ui/form-error";
import { FormSuccess } from "@/components/ui/form-success";
import { authClient } from "@/lib/auth-client";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { info } from "@/constants";
import { TurnstileComponent, TurnstileRef } from "@/components/ui/turnstile";

export function RegisterForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"form"> & {}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [done, setDone] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string>("");
  const turnstileRef = useRef<TurnstileRef>(null);
  const searchParams = useSearchParams();
  const callbackURL = searchParams.get("callbackURL") || info.defaultRedirect;

  const formSchema = z
    .object({
      name: z.string().min(2).max(50),
      email: z.string().email(),
      // phone: z
      //   .string()
      //   .regex(/^\+?[1-9]\d{1,14}$/, "Please enter a valid phone number"),
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
      name: "",
      email: "",
      // phone: "",
      password: "",
      confirmPassword: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    setError(undefined);
    setSuccess(undefined);

    if (process.env.NODE_ENV === "production" && !captchaToken) {
      setError("Please complete the captcha verification");
      return;
    }

    startTransition(async () => {
      const { data, error } = await authClient.signUp.email({
        email: values.email,
        name: values.name,
        password: values.password,
        role: "USER",
        callbackURL: `${window.location.origin}${callbackURL}`,
        fetchOptions: {
          headers: {
            "x-captcha-response": captchaToken,
          },
          onError(context) {
            // Reset captcha on error
            turnstileRef.current?.reset();
            setCaptchaToken("");
            setError(context.error.message);
          },
        },
      });
      if (error) {
        // Reset captcha on error
        turnstileRef.current?.reset();
        setCaptchaToken("");
        setError(error.message);
      }
      if (data) {
        setDone(true);
      }
    });
  }

  return (
    <Form {...form}>
      <Done done={done} setDone={setDone} callbackURL={callbackURL} />
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn("flex flex-col gap-6", className)}
        {...props}
      >
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-2xl font-bold">Create an account</h1>
          <p className="text-balance text-sm text-muted-foreground">
            Enter your details below to create your account
          </p>
        </div>
        <div className="grid gap-6">
          <FormField
            control={form.control}
            name="name"
            disabled={isPending}
            render={({ field }) => (
              <FormItem className="grid gap-2">
                <FormLabel htmlFor="name">Name</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    id="name"
                    type="text"
                    placeholder="John Doe"
                    required
                    autoComplete="name"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
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
                    placeholder="m@example.com"
                    required
                    autoComplete="email"
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
                <FormLabel htmlFor="password">Password</FormLabel>
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
            disabled={isPending}
            render={({ field }) => (
              <FormItem className="grid gap-2">
                <FormLabel htmlFor="confirmPassword">
                  Confirm Password
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
            disabled={
              isPending ||
              (process.env.NODE_ENV === "production" && !captchaToken)
            }
            type="submit"
            className="w-full"
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                Sign Up <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
          <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
            <span className="relative z-10 bg-background px-2 text-muted-foreground">
              Or
            </span>
          </div>
          <div className="text-center text-sm">
            Already have an account?{" "}
            <Link href="/sign-in" className="underline underline-offset-4">
              Sign in
            </Link>
          </div>
        </div>
      </form>
    </Form>
  );
}

const Done = ({
  done,
  setDone,
  callbackURL,
}: {
  done: boolean;
  setDone: (done: boolean) => void;
  callbackURL: string;
}) => {
  const router = useRouter();
  return (
    <Dialog open={done} onOpenChange={setDone}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Account created successfully!</DialogTitle>
          <DialogDescription>
            <h1 className="text-lg font-semibold">
              A link has been sent to your email to verify your account.
            </h1>
            <p className="text-sm text-muted-foreground mt-2">
              Check your email for the verification link. you might need to
              check your spam folder and mark it as not spam.
            </p>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            onClick={() => {
              router.push(callbackURL);
            }}
          >
            Continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
