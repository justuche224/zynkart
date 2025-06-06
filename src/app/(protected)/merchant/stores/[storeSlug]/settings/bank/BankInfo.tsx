"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { deleteBank } from "@/actions/bank/delete";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function BankInfo({
  bankInfo,
  storeSlug,
}: {
  bankInfo: {
    id: string;
    bankName: string;
    accountName: string;
    accountNumber: string;
    currency: string;
    percentageCharge: string;
    createdAt: Date;
    updatedAt: Date;
  };
  storeSlug: string;
}) {
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();
  const handleDelete = async () => {
    setDeleting(true);
    const result = await deleteBank(bankInfo.id, storeSlug);
    if (result.error) {
      toast.error(result.error.message ?? "Failed to delete bank");
    } else {
      toast.success("Bank deleted successfully");
      router.push(`/merchant/stores/${storeSlug}/settings/bank`);
    }
    setDeleting(false);
  };
  return (
    <div className="space-y-4 px-5 pb-5">
      <h2 className="text-2xl font-bold">Bank Information</h2>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="font-semibold">Bank Name</p>
          <p>{bankInfo.bankName}</p>
        </div>
        <div>
          <p className="font-semibold">Account Name</p>
          <p>{bankInfo.accountName}</p>
        </div>
        <div>
          <p className="font-semibold">Account Number</p>
          <p>{bankInfo.accountNumber}</p>
        </div>
        <div>
          <p className="font-semibold">Currency</p>
          <p>{bankInfo.currency}</p>
        </div>
        <div>
          <p className="font-semibold">Percentage Charge</p>
          <p>{bankInfo.percentageCharge}%</p>
        </div>
      </div>
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="destructive">Delete Bank Information</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Are you sure you want to delete this bank information?
            </DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the
              bank information for this store.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                Close
              </Button>
            </DialogClose>{" "}
            <Button
              variant={"destructive"}
              disabled={deleting}
              onClick={handleDelete}
            >
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
