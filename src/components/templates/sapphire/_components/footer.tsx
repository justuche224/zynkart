"use client";

import { getStoreFooter } from "@/actions/store/public/footer";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import {
  Facebook,
  Instagram,
  Mail,
  MapPin,
  Phone,
  Twitter,
} from "lucide-react";

const FooterSkeleton = () => {
  return (
    <footer className="bg-gradient-to-r from-blue-900 via-purple-800 to-purple-900 text-white border-t mt-8">
      <div className="container max-w-5xl mx-auto px-2 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About Section */}
          <div className="space-y-4">
            <h3 className="font-semibold">
              <Skeleton className="h-6 w-32" />
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Skeleton className="h-4 w-24" />
              </li>
              <li>
                <Skeleton className="h-4 w-20" />
              </li>
              <li>
                <Skeleton className="h-4 w-32" />
              </li>
              <li>
                <Skeleton className="h-4 w-28" />
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div className="space-y-4">
            <h3 className="font-semibold">
              <Skeleton className="h-6 w-40" />
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Skeleton className="h-4 w-24" />
              </li>
              <li>
                <Skeleton className="h-4 w-36" />
              </li>
              <li>
                <Skeleton className="h-4 w-32" />
              </li>
              <li>
                <Skeleton className="h-4 w-16" />
              </li>
            </ul>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="font-semibold">
              <Skeleton className="h-6 w-32" />
            </h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-4 w-28" />
              </li>
              <li className="flex items-center gap-2">
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-4 w-36" />
              </li>
              <li className="flex items-center gap-2">
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-4 w-40" />
              </li>
            </ul>
          </div>

          {/* Social Media & Newsletter */}
          <div className="space-y-4">
            <h3 className="font-semibold">
              <Skeleton className="h-6 w-40" />
            </h3>
            <div className="flex gap-4">
              <Skeleton className="h-6 w-10" />
              <Skeleton className="h-6 w-10" />
              <Skeleton className="h-6 w-10" />
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-4 border-t text-center text-sm text-muted-foreground">
          <span>
            <Skeleton className="h-4 w-48" />
          </span>
          <span>
            <Skeleton className="h-4 w-32" />
          </span>
        </div>
      </div>
    </footer>
  );
};

export const Footer = ({ storeSlug }: { storeSlug: string }) => {
  const currentYear = new Date().getFullYear();

  const {
    data: store,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["store-footer", storeSlug],
    queryFn: async () => await getStoreFooter(storeSlug),
  });

  if (isLoading) {
    return <FooterSkeleton />;
  }

  if (isError || !store) {
    return (
      <footer className="bg-sidebar border-t mt-8">
        <div className="container max-w-5xl mx-auto px-2 py-8 text-center">
          <p className="text-muted-foreground">
            Could not load store information.
          </p>
        </div>
      </footer>
    );
  }

  return (
    <footer className="bg-gradient-to-r from-blue-900 via-purple-800 to-purple-900 text-white border-t mt-8">
      <div className="container max-w-5xl mx-auto px-2 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About Section */}
          <div className="space-y-4">
            <h3 className="font-semibold">About {store.name}</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="hover:underline">
                  About Us
                </a>
              </li>
              <li>
                <a href="#" className="hover:underline">
                  Careers
                </a>
              </li>
              <li>
                <a href="#" className="hover:underline">
                  Terms & Conditions
                </a>
              </li>
              <li>
                <a href="#" className="hover:underline">
                  Privacy Policy
                </a>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div className="space-y-4">
            <h3 className="font-semibold">Customer Service</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="hover:underline">
                  Contact Us
                </a>
              </li>
              <li>
                <a href="#" className="hover:underline">
                  Shipping Information
                </a>
              </li>
              <li>
                <a href="#" className="hover:underline">
                  Returns & Exchange
                </a>
              </li>
              <li>
                <a href="#" className="hover:underline">
                  FAQ
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="font-semibold">Contact Us</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span>{store.phone}</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>{store.email}</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>{store.address}</span>
              </li>
            </ul>
          </div>

          {/* Social Media & Newsletter */}
          <div className="space-y-4">
            <h3 className="font-semibold">Connect With Us</h3>
            <div className="flex gap-4">
              {store.socials.map((social) => (
                <a
                  href={social.link}
                  className="hover:text-primary"
                  target="_blank"
                  rel="noopener noreferrer"
                  key={social.name}
                >
                  {social.name.toLowerCase() === "facebook" && <Facebook />}
                  {social.name.toLowerCase() === "instagram" && <Instagram />}
                  {social.name.toLowerCase() === "twitter" && <Twitter />}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-4 border-t text-center text-sm text-muted-foreground">
          <p>
            {currentYear} {store.name}. All rights reserved.
          </p>
          <i>Made with Zynkart❤️</i>
        </div>
      </div>
    </footer>
  );
};
