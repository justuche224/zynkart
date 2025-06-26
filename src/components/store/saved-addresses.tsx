"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, MapPin, Phone, Trash2, Edit, Star } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { savedAddressSchema, updateSavedAddressSchema } from "@/schemas";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  createSavedAddress,
  updateSavedAddress,
  deleteSavedAddress,
  setDefaultAddress,
} from "@/actions/customers/saved-addresses";

interface SavedAddress {
  id: string;
  label: string;
  address: string;
  primaryPhone: string;
  secondaryPhone?: string | null;
  additionalInfo?: string | null;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface SavedAddressesProps {
  addresses: SavedAddress[];
  onSelectAddress: (address: SavedAddress) => void;
  selectedAddressId?: string;
  cardBg?: string;
}

export default function SavedAddresses({
  addresses,
  onSelectAddress,
  selectedAddressId,
  cardBg,
}: SavedAddressesProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<SavedAddress | null>(
    null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addForm = useForm<z.infer<typeof savedAddressSchema>>({
    resolver: zodResolver(savedAddressSchema),
    defaultValues: {
      label: "",
      address: "",
      primaryPhone: "",
      secondaryPhone: "",
      additionalInfo: "",
      isDefault: false,
    },
  });

  const editForm = useForm<z.infer<typeof updateSavedAddressSchema>>({
    resolver: zodResolver(updateSavedAddressSchema),
    defaultValues: {
      id: "",
      label: "",
      address: "",
      primaryPhone: "",
      secondaryPhone: "",
      additionalInfo: "",
      isDefault: false,
    },
  });

  const handleAddAddress = async (
    values: z.infer<typeof savedAddressSchema>
  ) => {
    setIsSubmitting(true);
    try {
      const result = await createSavedAddress(values);
      if (result.success) {
        toast.success("Address saved successfully");
        setIsAddDialogOpen(false);
        addForm.reset();
        window.location.reload();
      } else {
        toast.error(result.error || "Failed to save address");
      }
    } catch (error) {
      toast.error("An error occurred while saving the address");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditAddress = async (
    values: z.infer<typeof updateSavedAddressSchema>
  ) => {
    setIsSubmitting(true);
    try {
      const result = await updateSavedAddress(values);
      if (result.success) {
        toast.success("Address updated successfully");
        setEditingAddress(null);
        editForm.reset();
        window.location.reload();
      } else {
        toast.error(result.error || "Failed to update address");
      }
    } catch (error) {
      toast.error("An error occurred while updating the address");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    try {
      const result = await deleteSavedAddress(addressId);
      if (result.success) {
        toast.success("Address deleted successfully");
        window.location.reload();
      } else {
        toast.error(result.error || "Failed to delete address");
      }
    } catch (error) {
      toast.error("An error occurred while deleting the address");
    }
  };

  const handleSetDefault = async (addressId: string) => {
    try {
      const result = await setDefaultAddress(addressId);
      if (result.success) {
        toast.success("Default address updated");
        window.location.reload();
      } else {
        toast.error(result.error || "Failed to set default address");
      }
    } catch (error) {
      toast.error("An error occurred while setting default address");
    }
  };

  const openEditDialog = (address: SavedAddress) => {
    setEditingAddress(address);
    editForm.reset({
      id: address.id,
      label: address.label,
      address: address.address,
      primaryPhone: address.primaryPhone,
      secondaryPhone: address.secondaryPhone || "",
      additionalInfo: address.additionalInfo || "",
      isDefault: address.isDefault,
    });
  };

  return (
    <Card className={cn(cardBg)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Saved Addresses</CardTitle>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add New
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Address</DialogTitle>
                <DialogDescription>
                  Save this address for faster checkout in the future.
                </DialogDescription>
              </DialogHeader>
              <Form {...addForm}>
                <form
                  onSubmit={addForm.handleSubmit(handleAddAddress)}
                  className="space-y-4"
                >
                  <FormField
                    control={addForm.control}
                    name="label"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address Label</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., Home, Work, Office"
                            disabled={isSubmitting}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={addForm.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Address</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="123 Main St, Anytown, USA"
                            disabled={isSubmitting}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={addForm.control}
                    name="primaryPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Primary Phone</FormLabel>
                        <FormControl>
                          <Input
                            type="tel"
                            placeholder="+1234567890"
                            disabled={isSubmitting}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={addForm.control}
                    name="secondaryPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Secondary Phone (Optional)</FormLabel>
                        <FormControl>
                          <Input
                            type="tel"
                            placeholder="+0987654321"
                            disabled={isSubmitting}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={addForm.control}
                    name="additionalInfo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Additional Info (Optional)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Delivery instructions, landmarks, etc."
                            disabled={isSubmitting}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={addForm.control}
                    name="isDefault"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            disabled={isSubmitting}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Set as default address</FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                  <div className="flex justify-end space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsAddDialogOpen(false)}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                      Save Address
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {addresses.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No saved addresses yet</p>
            <p className="text-sm">Add an address to get started</p>
          </div>
        ) : (
          addresses.map((address) => (
            <div
              key={address.id}
              className={cn(
                "border rounded-lg p-4 cursor-pointer transition-colors hover:bg-muted/50",
                selectedAddressId === address.id && "ring-2 ring-primary"
              )}
              onClick={() => onSelectAddress(address)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-medium">{address.label}</h4>
                    {address.isDefault && (
                      <Badge variant="default" className="text-xs">
                        <Star className="h-3 w-3 mr-1" />
                        Default
                      </Badge>
                    )}
                  </div>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span>{address.address}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      <span>{address.primaryPhone}</span>
                      {address.secondaryPhone && (
                        <span className="text-xs">
                          • {address.secondaryPhone}
                        </span>
                      )}
                    </div>
                    {address.additionalInfo && (
                      <p className="text-xs mt-2">{address.additionalInfo}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 ml-4">
                  {!address.isDefault && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSetDefault(address.id);
                      }}
                      title="Set as default"
                    >
                      <Star className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      openEditDialog(address);
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Address</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete &quot;{address.label}
                          &quot;? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDeleteAddress(address.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </div>
          ))
        )}

        <Dialog
          open={!!editingAddress}
          onOpenChange={(open) => !open && setEditingAddress(null)}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Address</DialogTitle>
              <DialogDescription>
                Update your saved address information.
              </DialogDescription>
            </DialogHeader>
            <Form {...editForm}>
              <form
                onSubmit={editForm.handleSubmit(handleEditAddress)}
                className="space-y-4"
              >
                <FormField
                  control={editForm.control}
                  name="label"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address Label</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Home, Work, Office"
                          disabled={isSubmitting}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Address</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="123 Main St, Anytown, USA"
                          disabled={isSubmitting}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="primaryPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Primary Phone</FormLabel>
                      <FormControl>
                        <Input
                          type="tel"
                          placeholder="+1234567890"
                          disabled={isSubmitting}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="secondaryPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Secondary Phone (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          type="tel"
                          placeholder="+0987654321"
                          disabled={isSubmitting}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="additionalInfo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Additional Info (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Delivery instructions, landmarks, etc."
                          disabled={isSubmitting}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="isDefault"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Set as default address</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setEditingAddress(null)}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    Update Address
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
