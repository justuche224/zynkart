"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useCustomerSession } from "@/hooks/use-customer-session";
import Link from "next/link";
import {
  CreditCardIcon,
  UserCircleIcon,
  BellIcon,
  HeartIcon,
  User,
} from "lucide-react";
import CustomerSignOutButton from "@/components/auth/customer-sign-out-button";
import Image from "next/image";

const NavUser = ({
  storeSlug,
  variant = "outline",
  bgColor = "bg-card",
}: {
  storeSlug: string;
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  bgColor?: string;
}) => {
  const { customer } = useCustomerSession();

  if (!customer)
    return (
      <Button variant={variant} asChild>
        <Link href="/sign-in">
          <User />
        </Link>
      </Button>
    );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar className="cursor-pointer">
          <AvatarImage src={customer.image || ""} />
          <AvatarFallback className="bg-transparent border border-gray-200">
            {customer.name.charAt(0) + customer.name.charAt(1)}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent className={bgColor}>
        <DropdownMenuLabel>
          <div className="flex items-center gap-2">
            <div>
              {customer.image ? (
                <Image
                  src={customer.image}
                  alt="User"
                  className="h-16 w-16 rounded-full"
                  width={500}
                  height={500}
                />
              ) : (
                <Avatar className="h-16 w-16">
                  <AvatarFallback>
                    {customer.name.charAt(0) + customer.name.charAt(1)}
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
            <div>
              <p>{customer.name}</p>
              <p>{customer.email}</p>
              {/* <p>{customer.phone}</p> */}
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href="/account">
              <UserCircleIcon />
              Account
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/account?page=orders">
              <CreditCardIcon />
              Orders
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/account?page=saved-items">
              <HeartIcon />
              Saved Items
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/account?page=notifications">
              <BellIcon />
              Notifications
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <CustomerSignOutButton storeSlug={storeSlug} />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NavUser;
