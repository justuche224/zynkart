"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  motion,
  useScroll,
  useTransform,
  AnimatePresence,
} from "framer-motion";
import {
  ArrowRight,
  Menu,
  X,
  ArrowUpRight,
  Instagram,
  Linkedin,
  Mail,
  Check,
  Zap,
  Crown,
  Rocket,
  Store,
  Code,
  Palette,
  Package,
  CreditCard,
  Users,
  Globe,
  Search,
  BarChart3,
  Smartphone,
  Shield,
} from "lucide-react";
import Link from "next/link";
import { ModeToggle } from "./mode-toggle";
import formatPrice from "@/lib/price-formatter";

// --- Types & Data ---

type FeatureItem = {
  title: string;
  description: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
};
type FeatureGroup = {
  id: number;
  label: string;
  image: string;
  items: FeatureItem[];
};
const FEATURE_GROUPS: FeatureGroup[] = [
  {
    id: 1,
    label: "Your Store",
    image:
      "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=2400&auto=format&fit=crop",
    items: [
      {
        icon: Store,
        title: "Your Own Professional Storefront",
        description:
          "Get a custom website link (yourstore.zynkart.store) to share on WhatsApp, Instagram, and Twitter. Look like a serious business.",
      },
      {
        icon: Globe,
        title: "No More 'DM for Price'",
        description:
          "Your customers see clear prices and can order directly. No more replying to 100 DMs asking the same questions.",
      },
    ],
  },
  {
    id: 2,
    label: "Manage Stock",
    image:
      "https://images.unsplash.com/photo-1487017159836-4e23ece2e4cf?q=80&w=2400&auto=format&fit=crop",
    items: [
      {
        icon: Package,
        title: "Easy Inventory Management",
        description:
          "Add products with photos, prices, sizes, and colors. Track what's in stock automatically, no Excel sheets needed.",
      },
      {
        icon: Palette,
        title: "Beautiful Ready-Made Designs",
        description:
          "Pick from professional templates that make your products look premium. Just add your items and go live.",
      },
    ],
  },
  {
    id: 3,
    label: "Get Paid",
    image:
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2400&auto=format&fit=crop",
    items: [
      {
        icon: CreditCard,
        title: "Nigerian Payment Integration",
        description:
          "Accept payments via Paystack, Flutterwave, and bank transfers. Customers pay in Naira, money goes straight to your account.",
      },
      {
        icon: Mail,
        title: "Automatic Invoices",
        description:
          "Every order creates an invoice automatically. Share it on WhatsApp or email, no manual calculations.",
      },
    ],
  },
  {
    id: 4,
    label: "Customers",
    image:
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=2400&auto=format&fit=crop",
    items: [
      {
        icon: Users,
        title: "Customer Accounts",
        description:
          "Customers can create accounts, save addresses, and view order history. They'll keep coming back.",
      },
      {
        icon: Search,
        title: "People Can Find You on Google",
        description:
          "Your store is built to rank on Google. New customers can discover you beyond just social media.",
      },
    ],
  },
  {
    id: 5,
    label: "Insights",
    image:
      "https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7?q=80&w=2400&auto=format&fit=crop",
    items: [
      {
        icon: BarChart3,
        title: "Know What's Selling",
        description:
          "See your best products, busiest days, and customer behavior. Make smarter decisions with real data.",
      },
      {
        icon: Smartphone,
        title: "Works Perfectly on Phones",
        description:
          "90% of your customers will visit from their phones. Every Zynkart store looks amazing on mobile.",
      },
    ],
  },
  {
    id: 6,
    label: "Trust",
    image:
      "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=2400&auto=format&fit=crop",
    items: [
      {
        icon: Shield,
        title: "Secure Payments",
        description:
          "Bank-level security protects every transaction. Your customers can trust buying from you.",
      },
      {
        icon: Code,
        title: "Always Available",
        description:
          "Your store never sleeps. Customers can browse and order 24/7, even while you're in class or asleep.",
      },
    ],
  },
];
const NEWS = [
  {
    id: 1,
    date: "JAN 16, 2026",
    title:
      "How Chioma moved from WhatsApp to ₦2M monthly with her Zynkart store",
    category: "SUCCESS",
  },
  {
    id: 2,
    date: "DEC 12, 2025",
    title: "No more 'DM for price', Lagos vendor sees 5x order increase",
    category: "STORY",
  },
  {
    id: 3,
    date: "NOV 05, 2025",
    title: "Guide: How to run your side hustle while in school",
    category: "GUIDE",
  },
];
const PLANS = [
  {
    name: "Starter",
    icon: Zap,
    price: 0,
    period: "forever",
    description: "Perfect for testing your business idea. Start selling today.",
    featured: false,
    features: [
      "1 store",
      "Up to 10 products",
      "Core templates",
      "Standard support",
      "Basic analytics",
    ],
    limitations: ["Zynkart branding", "Community support"],
  },
  {
    name: "Pro",
    icon: Crown,
    price: 10000,
    period: "per month",
    description: "For serious sellers ready to grow. Most popular for vendors.",
    featured: true,
    features: [
      "2 stores",
      "Up to 50 products per store",
      "Premium templates",
      "Priority support",
      "Advanced analytics",
      "Custom domain",
    ],
    limitations: ["24/7 email support", "Remove Zynkart branding"],
  },
  {
    name: "Elite",
    icon: Rocket,
    price: 100000,
    period: "per month",
    description:
      "For established businesses with multiple brands or high volume.",
    featured: false,
    features: [
      "Unlimited stores",
      "Unlimited products",
      "Custom templates",
      "White-label",
      "Enterprise analytics",
      "Full API access",
    ],
    limitations: ["Dedicated account manager", "24/7 phone support"],
  },
];

// --- Helper Components ---

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navItems = [
    {
      label: "Features",
      href: "#features",
    },
    {
      label: "Pricing",
      href: "#pricing",
    },
    {
      label: "How It Works",
      href: "#how-it-works",
    },
    {
      label: "Stories",
      href: "#stories",
    },
    {
      label: "Contact",
      href: "#contact",
    },
  ];
  return (
    <>
      <nav className="fixed top-0 left-0 w-full z-50 mix-blend-difference text-white px-6 py-6 flex justify-between items-start pointer-events-none">
        <div className="flex flex-col pointer-events-auto">
          <span className="font-bold text-lg tracking-tighter uppercase">
            Zynkart
          </span>
          <span className="text-xs tracking-widest opacity-60 mt-1">
            Online Store Builder
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsOpen(true)}
            className="pointer-events-auto group flex items-center gap-2"
          >
            <span className="text-xs uppercase tracking-widest hidden md:block group-hover:tracking-[0.2em] transition-all duration-300">
              Menu
            </span>
            <Menu size={24} strokeWidth={1.5} />
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            exit={{
              opacity: 0,
            }}
            transition={{
              duration: 0.4,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="fixed inset-0 bg-zinc-950 z-[60] text-white flex flex-col"
          >
            <div className="flex justify-between items-start px-6 py-6">
              <div className="flex flex-col">
                <span className="font-bold text-lg tracking-tighter uppercase">
                  Zynkart
                </span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="group flex items-center gap-2 hover:text-zinc-400 transition-colors"
              >
                <span className="text-xs uppercase tracking-widest hidden md:block">
                  Close
                </span>
                <X size={24} strokeWidth={1.5} />
              </button>
            </div>

            <div className="flex-1 flex flex-col justify-center px-6 md:px-24 lg:px-40">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 w-full max-w-6xl mx-auto">
                <ul className="flex flex-col gap-4">
                  {navItems.map((item, i) => (
                    <motion.li
                      key={item.label}
                      initial={{
                        opacity: 0,
                        y: 20,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                      }}
                      transition={{
                        delay: 0.1 + i * 0.1,
                        duration: 0.5,
                      }}
                    >
                      <a
                        href={item.href}
                        onClick={() => setIsOpen(false)}
                        className="text-5xl md:text-7xl font-light tracking-tighter hover:ml-4 transition-all duration-300 block group"
                      >
                        {item.label}
                        <span className="text-lg ml-2 opacity-0 group-hover:opacity-100 align-top text-zinc-500 transition-opacity">
                          0{i + 1}
                        </span>
                      </a>
                    </motion.li>
                  ))}
                </ul>

                <div className="hidden md:flex flex-col justify-end pb-4 text-zinc-500">
                  <p className="text-sm max-w-xs leading-relaxed">
                    Built for Nigerian vendors who want to look professional and
                    stop replying to DMs manually. Your store, your brand.
                  </p>
                  <div className="mt-8 grid grid-cols-2 gap-8 text-xs uppercase tracking-widest">
                    <div>
                      <p className="text-white mb-2">Lagos</p>
                      <p>Victoria Island</p>
                      <p>Lagos, Nigeria</p>
                    </div>
                    <div>
                      <p className="text-white mb-2">Socials</p>
                      <p className="hover:text-white cursor-pointer">
                        X (Twitter)
                      </p>
                      <p className="hover:text-white cursor-pointer">
                        Instagram
                      </p>
                    </div>
                  </div>

                  <div className="pointer-events-auto mt-8 flex items-center gap-2">
                    <span className="text-xs uppercase tracking-widest">
                      Theme
                    </span>
                    <ModeToggle />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
const Hero = () => {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 150]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);
  return (
    <section className="relative h-screen w-full overflow-hidden bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center border-b border-zinc-200 dark:border-zinc-800">
      <motion.div
        style={{
          y: y1,
        }}
        className="absolute inset-0 z-0"
      >
        <div
          className="w-full h-full bg-cover bg-center grayscale opacity-20"
          style={{
            backgroundImage: "url('/images/shoper-af5Oi0kOByE-unsplash.jpg')",
          }}
        ></div>
      </motion.div>

      <div className="z-10 container mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-6 h-full items-end pb-24">
        <motion.div
          style={{
            opacity,
          }}
          className="lg:col-span-8"
        >
          <h1 className="text-[12vw] 2xl:text-[9vw] xl:text-[8vw] leading-[0.80] font-medium tracking-tighter text-zinc-900 dark:text-zinc-100 uppercase mix-blend-overlay">
            Stop <br /> The DMs <br />{" "}
            <span className="italic font-serif font-light text-nowrap">
              Start Selling
            </span>
          </h1>
          <Link
            href="/sign-up"
            className="group inline-flex items-center gap-3 mt-8 text-xs uppercase tracking-widest border border-zinc-900 dark:border-zinc-100 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-8 py-4 hover:bg-transparent hover:text-zinc-900 dark:hover:bg-transparent dark:hover:text-zinc-100 transition-colors duration-300"
          >
            Create Your Free Store
            <ArrowRight
              size={16}
              className="group-hover:translate-x-1 transition-transform"
            />
          </Link>
        </motion.div>
      </div>
    </section>
  );
};
const ProjectList = () => {
  return (
    <section
      id="features"
      className="py-32 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100"
    >
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-end mb-20 border-b border-zinc-200 dark:border-zinc-800 pb-6 gap-6">
          <div>
            <span className="text-xs uppercase tracking-widest text-zinc-500">
              Platform
            </span>
            <h2 className="text-4xl md:text-6xl font-light tracking-tighter uppercase mt-3">
              Feature Highlights
            </h2>
          </div>
          <span className="text-xs tracking-widest text-zinc-500">
            Built for scale
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {FEATURE_GROUPS.map((group) => (
            <div
              key={group.id}
              className="group relative overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/60 p-8 min-h-[320px]"
            >
              <div className="absolute inset-0">
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                  style={{
                    backgroundImage: `url(${group.image})`,
                  }}
                ></div>
                <div className="absolute inset-0 bg-white/85 dark:bg-zinc-950/80 opacity-90 group-hover:opacity-60 transition-opacity duration-500"></div>
                <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-white/70 to-white/95 dark:from-zinc-950/30 dark:via-zinc-950/70 dark:to-zinc-950/90 opacity-90 group-hover:opacity-65 transition-opacity duration-500"></div>
              </div>

              <div className="relative z-10 flex h-full flex-col">
                <div className="flex items-center justify-between mb-8">
                  <span className="text-xs uppercase tracking-widest text-zinc-500">
                    {group.label}
                  </span>
                  <span className="text-xs tracking-widest text-zinc-400">
                    0{group.id}
                  </span>
                </div>

                <div className="space-y-6">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    return (
                      <div key={item.title} className="flex items-start gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full border border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/70">
                          <Icon
                            size={18}
                            className="text-zinc-900 dark:text-zinc-100"
                          />
                        </div>
                        <div>
                          <h3 className="text-lg font-medium tracking-tight">
                            {item.title}
                          </h3>
                          <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-32 flex justify-center">
          <button className="group flex items-center gap-3 text-sm uppercase tracking-widest hover:text-zinc-500 transition-colors">
            See All Features
            <ArrowRight
              size={16}
              className="group-hover:translate-x-2 transition-transform"
            />
          </button>
        </div>
      </div>
    </section>
  );
};
const Pricing = () => {
  return (
    <section
      id="pricing"
      className="py-32 bg-zinc-100 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 border-t border-zinc-200 dark:border-zinc-800"
    >
      <div className="container mx-auto px-6">
        <div className="flex justify-between items-end mb-20 border-b border-zinc-200 dark:border-zinc-800 pb-6">
          <div>
            <span className="text-xs uppercase tracking-widest text-zinc-500">
              Pricing
            </span>
            <h2 className="text-4xl md:text-6xl font-light tracking-tighter uppercase mt-4">
              Plans for Every Stage
            </h2>
          </div>
          <span className="text-xs tracking-widest hidden md:block">
            Monthly, cancel anytime
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {PLANS.map((plan) => {
            const Icon = plan.icon;
            return (
              <div
                key={plan.name}
                className={`border border-zinc-200 dark:border-zinc-800 p-10 flex flex-col ${plan.featured ? "bg-white dark:bg-zinc-900 shadow-[0_40px_80px_rgba(0,0,0,0.25)]" : "bg-transparent"}`}
              >
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <p className="text-xs uppercase tracking-widest text-zinc-500">
                      Plan
                    </p>
                    <h3 className="text-2xl font-medium tracking-tight mt-2">
                      {plan.name}
                    </h3>
                  </div>
                  <div className="w-10 h-10 flex items-center justify-center border border-zinc-200 dark:border-zinc-800">
                    <Icon size={18} />
                  </div>
                </div>

                <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-8">
                  {plan.description}
                </p>

                <div className="flex flex-col items-end gap-3 mb-8">
                  <span className="text-4xl font-medium tracking-tight">
                    {formatPrice(plan.price)}
                  </span>
                  <span className="text-xs uppercase tracking-widest text-zinc-500 pb-2">
                    {plan.period}
                  </span>
                </div>

                <button
                  className={`w-full text-xs uppercase tracking-widest border px-6 py-3 transition-colors ${plan.featured ? "border-zinc-900 dark:border-zinc-100 text-white bg-zinc-900 dark:bg-zinc-100 dark:text-black" : "border-zinc-300 dark:border-zinc-700 hover:border-zinc-900 dark:hover:border-zinc-100"}`}
                >
                  {plan.name === "Starter"
                    ? "Start Free"
                    : `Choose ${plan.name}`}
                </button>

                <div className="mt-10">
                  <p className="text-xs uppercase tracking-widest text-zinc-500 mb-4">
                    Includes
                  </p>
                  <ul className="flex flex-col gap-3">
                    {plan.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-start gap-3 text-sm text-zinc-600 dark:text-zinc-400"
                      >
                        <Check size={16} className="mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-8 border-t border-zinc-200 dark:border-zinc-800 pt-6">
                  <p className="text-xs uppercase tracking-widest text-zinc-500 mb-3">
                    Extra
                  </p>
                  <ul className="flex flex-col gap-3">
                    {plan.limitations.map((item) => (
                      <li
                        key={item}
                        className="flex items-start gap-3 text-sm text-zinc-500"
                      >
                        <ArrowUpRight size={16} className="mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-16 flex justify-center">
          <button className="group flex items-center gap-3 text-sm uppercase tracking-widest hover:text-zinc-500 transition-colors">
            Talk to Sales
            <ArrowRight
              size={16}
              className="group-hover:translate-x-2 transition-transform"
            />
          </button>
        </div>
      </div>
    </section>
  );
};
const Philosophy = () => {
  return (
    <section
      id="how-it-works"
      className="py-32 bg-zinc-100 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100"
    >
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-4">
            <h2 className="text-xs font-bold uppercase tracking-widest mb-8 sticky top-32">
              How It Works
            </h2>
          </div>
          <div className="lg:col-span-8">
            <p className="text-3xl md:text-5xl lg:text-6xl font-light leading-[1.1] tracking-tight mb-12">
              Stop replying to DMs manually. Get a professional online store
              where customers can see prices and order instantly.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
              <p>
                Tired of answering "How much?" a hundred times a day? Zynkart
                gives you a real online store. Your customers see the price,
                pick their size and color, and checkout themselves.
              </p>
              <p>
                Upload your products, set your prices, and share your link on
                WhatsApp, Instagram, or anywhere. Accept payments directly to
                your bank account with Nigerian payment gateways.
              </p>
            </div>

            {/*<div className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-8 border-t border-zinc-300 dark:border-zinc-700 pt-8">
              {[
                {
                  label: "Nigerian Vendors",
                  value: "2,000+",
                },
                {
                  label: "Products Listed",
                  value: "50K+",
                },
                {
                  label: "Orders Processed",
                  value: "₦100M+",
                },
                {
                  label: "States Covered",
                  value: "36",
                },
              ].map((stat) => (
                <div key={stat.label}>
                  <span className="block text-3xl font-medium mb-1">
                    {stat.value}
                  </span>
                  <span className="text-xs uppercase tracking-widest text-zinc-500">
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>*/}
          </div>
        </div>
      </div>
    </section>
  );
};
const Journal = () => {
  return (
    <section
      id="stories"
      className="py-32 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 border-t border-zinc-200 dark:border-zinc-800"
    >
      <div className="container mx-auto px-6">
        <div className="flex justify-between items-end mb-16">
          <h2 className="text-4xl md:text-6xl font-light tracking-tighter uppercase">
            Customer Stories
          </h2>
          <a
            href="#"
            className="hidden md:flex items-center gap-2 text-xs uppercase tracking-widest hover:text-zinc-500 transition-colors"
          >
            View All <ArrowRight size={14} />
          </a>
        </div>

        <div className="flex flex-col">
          {NEWS.map((item) => (
            <a
              key={item.id}
              href="#"
              className="group py-10 border-t border-zinc-200 dark:border-zinc-800 grid grid-cols-1 md:grid-cols-12 gap-6 items-center hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
            >
              <div className="md:col-span-2 text-xs tracking-widest text-zinc-500">
                {item.date}
              </div>
              <div className="md:col-span-8 text-2xl md:text-4xl font-light tracking-tight group-hover:pl-4 transition-all duration-300">
                {item.title}
              </div>
              <div className="md:col-span-2 flex justify-between items-center">
                <span className="text-xs uppercase tracking-widest border border-zinc-200 dark:border-zinc-800 px-3 py-1 rounded-none">
                  {item.category}
                </span>
                <ArrowUpRight
                  size={20}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                />
              </div>
            </a>
          ))}
          <div className="w-full border-b border-zinc-200 dark:border-zinc-800"></div>
        </div>
      </div>
    </section>
  );
};
export const Footer = () => {
  return (
    <footer id="contact" className="bg-zinc-950 text-white pt-32 pb-12">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-32">
          <div className="flex flex-col gap-8">
            <h3 className="text-2xl font-medium tracking-tight">
              Ready to stop replying DMs? Let&apos;s build your store.
            </h3>
            <a
              href="mailto:hello@zynkart.store"
              className="flex items-center gap-3 text-zinc-400 hover:text-white transition-colors text-lg"
            >
              <Mail size={20} />
              hello@zynkart.store
            </a>
          </div>

          <div className="flex flex-col gap-4">
            <h4 className="text-xs uppercase tracking-widest text-zinc-500 mb-2">
              Lagos, Nigeria
            </h4>
            <p className="text-sm leading-relaxed text-zinc-300">
              Victoria Island
              <br />
              Lagos, Nigeria
            </p>
            <p className="text-sm text-zinc-400">WhatsApp: +234 XXX XXX XXXX</p>
          </div>

          <div className="flex flex-col gap-4">
            <h4 className="text-xs uppercase tracking-widest text-zinc-500 mb-2">
              Support
            </h4>
            <p className="text-sm leading-relaxed text-zinc-300">
              Questions about your store?
              <br />
              We respond within 24 hours.
            </p>
            <p className="text-sm text-zinc-400">support@zynkart.store</p>
          </div>

          <div className="flex flex-col gap-4">
            <h4 className="text-xs uppercase tracking-widest text-zinc-500 mb-2">
              Follow Us
            </h4>
            <div className="flex flex-col gap-2">
              <a
                href="#"
                className="flex items-center gap-2 text-sm text-zinc-300 hover:text-white transition-colors"
              >
                <Instagram size={16} /> Instagram
              </a>
              <a
                href="#"
                className="flex items-center gap-2 text-sm text-zinc-300 hover:text-white transition-colors"
              >
                X (Twitter)
              </a>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-end border-t border-zinc-800 pt-8">
          <div className="mb-8 md:mb-0">
            <h1 className="text-[15vw] md:text-[12vw] leading-[0.8] font-bold tracking-tighter text-zinc-900 uppercase select-none pointer-events-none">
              Zynkart
            </h1>
          </div>
          <div className="flex gap-8 text-xs text-zinc-500 uppercase tracking-widest">
            <a href="#" className="hover:text-white transition-colors">
              Privacy
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Imprint
            </a>
            <span>© 2026 Zynkart</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
const CustomCursor = () => {
  const cursorRef = useRef<HTMLDivElement>(null);
  const [isHoveringLink, setIsHoveringLink] = useState(false);
  useEffect(() => {
    const moveCursor = (e: MouseEvent) => {
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      }
    };
    const handleLinkHover = () => setIsHoveringLink(true);
    const handleLinkLeave = () => setIsHoveringLink(false);
    window.addEventListener("mousemove", moveCursor);
    const links = document.querySelectorAll("a, button");
    links.forEach((link) => {
      link.addEventListener("mouseenter", handleLinkHover);
      link.addEventListener("mouseleave", handleLinkLeave);
    });
    return () => {
      window.removeEventListener("mousemove", moveCursor);
      links.forEach((link) => {
        link.removeEventListener("mouseenter", handleLinkHover);
        link.removeEventListener("mouseleave", handleLinkLeave);
      });
    };
  }, []);
  return (
    <div
      ref={cursorRef}
      className={`fixed top-0 left-0 w-4 h-4 bg-black dark:bg-white rounded-none pointer-events-none z-[100] mix-blend-difference transition-[width,height,opacity] duration-300 -translate-x-1/2 -translate-y-1/2 hidden md:block
        ${isHoveringLink ? "w-8 h-8 opacity-50" : "opacity-100"}
      `}
    />
  );
};

// @component: ArchitectureWebsite
export const LandingPage = () => {
  // @return
  return (
    <div className="font-sans bg-white dark:bg-zinc-950 text-black dark:text-zinc-50 min-h-screen w-full selection:bg-zinc-200 selection:text-black dark:selection:bg-zinc-800 dark:selection:text-white overflow-x-hidden">
      <CustomCursor />
      <Navigation />
      <main>
        <Hero />
        <ProjectList />
        <Pricing />
        <Philosophy />
        <Journal />
      </main>
      {/* <Footer /> */}
    </div>
  );
};
