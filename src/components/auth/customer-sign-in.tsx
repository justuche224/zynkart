"use client";

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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  TCustomerSignInSchema,
  customerSignInSchema,
} from "@/schemas/customer";
import { signInCustomer } from "@/actions/customer";
import { toast } from "sonner";
import { useTransition } from "react";
import { Loader } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const CustomerSignInForm = ({
  store,
}: {
  store: {
    id: string;
    name: string;
    slug: string;
    template: string;
  };
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/account";
  const [isPending, startTransition] = useTransition();
  const form = useForm<TCustomerSignInSchema>({
    resolver: zodResolver(customerSignInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (values: TCustomerSignInSchema) => {
    startTransition(async () => {
      const { success, error } = await signInCustomer({
        ...values,
        storeId: store.id,
      });

      if (success) {
        toast.success(success);
        form.reset();
        router.push(callbackUrl);
      }

      if (error) {
        toast.error(error);
      }
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold">
            {store.name} Sign In
          </CardTitle>
          <CardDescription className="text-center text-sm text-muted-foreground">
            Enter your email below to sign in to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="john@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="********"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button disabled={isPending} type="submit" className="w-full">
                {isPending && <Loader className="w-4 h-4 mr-2 animate-spin" />}
                Sign In
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex flex-col gap-y-4">
          <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
            <span className="relative z-10 bg-background px-2 text-muted-foreground">
              Or
            </span>
          </div>
          <div className="text-center text-sm">
            Don&apos;t have an account?{" "}
            <Link href={`/sign-up?callbackUrl=${callbackUrl}`} className="underline underline-offset-4">
              Sign up
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};
