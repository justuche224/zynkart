"use client";

import { signOutCustomer } from "@/actions/customer";
import { Button } from "@/components/ui/button";
import { Loader, LogOut } from "lucide-react";
import { useTransition } from "react";
import { useRouter } from "next/navigation";

const CustomerSignOutButton = ({ storeSlug }: { storeSlug: string }) => {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const handleSignOut = () => {
    startTransition(async () => {
      await signOutCustomer(storeSlug);
      router.push(`/`);
    });
  };

  return (
    <Button onClick={handleSignOut} disabled={isPending} className="w-full">
      {isPending ? (
        <Loader className="w-4 h-4 mr-2 animate-spin" />
      ) : (
        <LogOut className="w-4 h-4 mr-2" />
      )}
      Sign Out
    </Button>
  );
};

export default CustomerSignOutButton;
