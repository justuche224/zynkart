"use client";

import { useState, useTransition, useEffect } from "react";
import PageLayout from "@/components/page-layout";
import { BankSchema } from "@/schemas";
import type { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { addBank } from "@/actions/bank/create";
import { useQuery } from "@tanstack/react-query";

type FormData = z.infer<typeof BankSchema>;

type Bank = {
  id: number;
  name: string;
  code: string;
  slug: string;
};

const NewBankPage = ({
  storeData,
}: {
  storeData: {
    id: string;
    name: string;
    slug: string;
  };
}) => {
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");
  const [isPending, startTransition] = useTransition();
  const [isVerifying, setIsVerifying] = useState(false);

  const {
    data: banks = [],
    isLoading: isLoadingBanks,
    error: banksError,
  } = useQuery<Bank[]>({
    queryKey: ["banks"],
    queryFn: async () => {
      const response = await fetch("/api/banks");
      if (!response.ok) {
        throw new Error("Failed to fetch banks");
      }
      return response.json();
    },
    staleTime: 1000 * 60 * 60, // 1 hour
    refetchOnWindowFocus: false,
  });

  const form = useForm<FormData>({
    resolver: zodResolver(BankSchema),
    defaultValues: {
      bankName: "",
      bankCode: "",
      accountName: "",
      accountNumber: "",
      country: "Nigeria",
      currency: "NGN",
      storeId: storeData.id,
      businessName: storeData.name,
      storeSlug: storeData.slug,
    },
  });

  useEffect(() => {
    if (banksError) {
      setError("Failed to fetch banks. Please try again.");
    }
  }, [banksError]);

  const verifyAccount = async (accountNumber: string, bankCode: string) => {
    setError("");
    try {
      console.log("Verifying:", accountNumber, bankCode);
      const response = await fetch(
        `/api/banks/verify?account_number=${accountNumber}&bank_code=${bankCode}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      console.log(response);
      if (!response.ok) {
        throw new Error("Failed to verify account");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error verifying account:", error);
      setError(
        "Failed to verify account. Please check your details and try again."
      );
      return null;
    }
  };

  const handleVerification = (accountNumber: string, bankCode: string) => {
    if (accountNumber.length === 10 && bankCode) {
      setIsVerifying(true);
      verifyAccount(accountNumber, bankCode)
        .then((data) => {
          if (data) {
            form.setValue("accountName", data.account_name);
          }
        })
        .finally(() => {
          setIsVerifying(false);
        });
    }
  };

  const onSubmit = async (data: FormData) => {
    setError(undefined);
    setSuccess(undefined);

    startTransition(async () => {
      try {
        const res = await addBank(data, storeData.slug);
        if (!res.success) {
          setError(res.error?.message);
          return;
        }
        setSuccess("Bank account added successfully!");
        window.location.reload();
      } catch (error) {
        console.error("Error submitting form:", error);
        setError("Failed to add bank account. Please try again.");
      }
    });
  };

  return (
    <PageLayout
      backLink={`/merchant/stores/${storeData.slug}/settings/bank`}
      backText="Back to Banks"
      title="Add new bank"
      description="Set up a new bank for your store"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="bankName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bank</FormLabel>
                <FormControl>
                  <Select
                    disabled={isPending || isLoadingBanks}
                    onValueChange={(value) => {
                      const selectedBank = banks.find(
                        (bank) => bank.code === value
                      );
                      if (selectedBank) {
                        field.onChange(selectedBank.name);
                        form.setValue("bankCode", selectedBank.code);
                        const accountNumber = form.getValues("accountNumber");
                        if (accountNumber.length === 10) {
                          handleVerification(accountNumber, selectedBank.code);
                        }
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a bank" />
                    </SelectTrigger>
                    <SelectContent>
                      {banks.map((bank) => (
                        <SelectItem key={bank.slug} value={bank.code}>
                          {bank.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="accountNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Account Number</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    disabled={isPending}
                    placeholder="0350024645"
                    type="text"
                    className="h-12"
                    onChange={(e) => {
                      field.onChange(e);
                      const accountNumber = e.target.value;
                      const bankCode = form.getValues("bankCode");
                      if (accountNumber.length === 10 && bankCode) {
                        handleVerification(accountNumber, bankCode);
                      }
                    }}
                  />
                </FormControl>
                <FormDescription>Your Account Number</FormDescription>
                <FormMessage />
                {isVerifying && (
                  <div className="text-sm text-blue-500 mt-1">
                    Verifying account...
                  </div>
                )}
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="accountName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Account Name</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    disabled={true}
                    placeholder="Account Name"
                    type="text"
                    className="h-12 text-green-400 capitalize font-bold"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="country"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Country</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    disabled={true}
                    type="text"
                    className="h-12"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="currency"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Currency</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    disabled={true}
                    type="text"
                    className="h-12"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {error && <div className="text-red-500">{error}</div>}
          {success && <div className="text-green-500">{success}</div>}

          <Button type="submit" disabled={isPending || isVerifying}>
            {isPending ? "Adding Bank Account..." : "Add Bank Account"}
          </Button>
        </form>
      </Form>
    </PageLayout>
  );
};

export default NewBankPage;
