"use client";
import {
  Mail,
  MapPin,
  Phone,
  Twitter,
  Linkedin,
  Github,
  Facebook,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";

export default function Footer() {

  const pathname = usePathname();
  
  const isHome = pathname === "/";
  
  if(isHome) return null;

  const footerLinks = {
    product: [
      { name: "Features", href: "#features" },
      { name: "Pricing", href: "#pricing" },
      { name: "Templates", href: "/templates" },
      { name: "API Documentation", href: "/docs" },
      { name: "Integrations", href: "/integrations" },
    ],
    company: [
      { name: "About Us", href: "/about" },
      { name: "Careers", href: "/careers" },
      { name: "Blog", href: "/blog" },
      { name: "Press", href: "/press" },
      { name: "Contact", href: "/contact" },
    ],
    resources: [
      { name: "Help Center", href: "/help" },
      { name: "Community", href: "/community" },
      { name: "Tutorials", href: "/tutorials" },
      { name: "Case Studies", href: "/case-studies" },
      { name: "System Status", href: "/status" },
    ],
    legal: [
      { name: "Privacy Policy", href: "/privacy" },
      { name: "Terms of Service", href: "/terms" },
      { name: "Cookie Policy", href: "/cookies" },
      { name: "GDPR", href: "/gdpr" },
      { name: "Security", href: "/security" },
    ],
  };

  const socialLinks = [
    {
      name: "Twitter",
      icon: <Twitter className="h-5 w-5" />,
      href: "https://twitter.com/zynkart",
    },
    {
      name: "LinkedIn",
      icon: <Linkedin className="h-5 w-5" />,
      href: "https://linkedin.com/company/zynkart",
    },
    {
      name: "Github",
      icon: <Github className="h-5 w-5" />,
      href: "https://github.com/zynkart",
    },
    {
      name: "Facebook",
      icon: <Facebook className="h-5 w-5" />,
      href: "https://facebook.com/zynkart",
    },
  ];

  return (
    <footer className="">
      <div className="container mx-auto px-4 py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 mb-12">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <div className="mb-6">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-primary to-pink-600 bg-clip-text text-transparent">
                Zynkart
              </h3>
              <p className="text-gray-400 mt-4 leading-relaxed">
                The commerce platform that unifies storefronts, inventory,
                payments, and automation so teams move faster.
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3 text-gray-400">
                <Mail className="h-4 w-4" />
                <span>hello@zynkart.com</span>
              </div>
              <div className="flex items-center gap-3 text-gray-400">
                <Phone className="h-4 w-4" />
                <span>+1 (415) 555-0199</span>
              </div>
              <div className="flex items-center gap-3 text-gray-400">
                <MapPin className="h-4 w-4" />
                <span>San Francisco, CA</span>
              </div>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="font-semibold text-white mb-4">Product</h4>
            <ul className="space-y-3">
              {footerLinks.product.map((link, index) => (
                <li key={index}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="font-semibold text-white mb-4">Company</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link, index) => (
                <li key={index}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Links */}
          <div>
            <h4 className="font-semibold text-white mb-4">Resources</h4>
            <ul className="space-y-3">
              {footerLinks.resources.map((link, index) => (
                <li key={index}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h4 className="font-semibold text-white mb-4">Legal</h4>
            <ul className="space-y-3">
              {footerLinks.legal.map((link, index) => (
                <li key={index}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Newsletter Signup */}
        <div className="border-t border-gray-800 pt-12 mb-12">
          <div className="max-w-md mx-auto text-center">
            <h4 className="font-semibold text-white mb-4">Get Product Updates</h4>
            <p className="text-gray-400 mb-6">
              Weekly tips, releases, and growth playbooks for modern brands.
            </p>
            <div className="flex gap-2 flex-col md:flex-row">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-primary"
              />
              <Button
                aria-label="Subscribe"
                className="bg-gradient-to-r from-primary to-pink-600 hover:from-primary hover:to-pink-500 px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Subscribe
              </Button>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-gray-400 text-sm">
              © 2026 Zynkart. All rights reserved.
            </div>

            <div className="flex items-center gap-6">
              {socialLinks.map((social, index) => (
                <Link
                  key={index}
                  href={social.href}
                  className="text-gray-400 hover:text-white transition-colors"
                  aria-label={social.name}
                >
                  {social.icon}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Background Pattern */}
      <div className="absolute inset-0 bg-center opacity-5 pointer-events-none"></div>
    </footer>
  );
}
