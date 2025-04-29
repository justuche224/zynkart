"use client";

import { useTransition } from "react";
import { Button } from "../ui/button";
import { authClient } from "@/lib/auth-client";
import { redirect } from "next/navigation";
import { Loader2, LogOutIcon } from "lucide-react";

const SignOut = () => {
  const [isPending, startTransition] = useTransition();
  const logout = async (e: any) => {
    e.preventDefault();
    e.stopPropagation();
    startTransition(async () => {
      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            redirect("/");
          },
        },
      });
    });
  };
  return (
    <Button onClick={logout} disabled={isPending} className="cursor-pointer">
      {isPending ? (
        <Loader2 className="animate-spin" />
      ) : (
        <>
          <LogOutIcon /> Log out
        </>
      )}
    </Button>
  );
};

export default SignOut;
