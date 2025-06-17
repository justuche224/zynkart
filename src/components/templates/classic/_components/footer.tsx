import { getStoreFooter } from "@/actions/store/public/footer";
import { useQuery } from "@tanstack/react-query";
import {
  Facebook,
  Instagram,
  Mail,
  MapPin,
  Phone,
  Twitter,
} from "lucide-react";

export function Footer({ storeSlug }: { storeSlug: string }) {
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
    return null;
  }

  if (isError || !store) {
    return null;
  }

  return (
    <footer className="bg-gray-100 dark:bg-gray-950 py-10">
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
}
