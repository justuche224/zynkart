import { LandingPage } from "@/components/home";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title:
    "Zynkart - Free Online Store for Nigerian Sellers | No More 'DM for Price'",
  description:
    "Create your free online store in minutes. Stop replying to DMs manually, get a professional storefront with Nigerian payment integration (Paystack, Flutterwave). Perfect for WhatsApp vendors, Instagram sellers & studentpreneurs.",
  keywords: [
    "how to sell on WhatsApp Nigeria",
    "free online store Nigeria",
    "create online store Nigeria",
    "DM for price alternative",
    "stop dm for price",
    "online store for small business Nigeria",
    "sell online without website knowledge",
    "WhatsApp business store",
    "Instagram shop Nigeria",
    "online store builder Nigeria",
    "ecommerce website Nigeria",
    "free website for small business",
    "student business Nigeria",
    "side hustle store",
    "small business website Nigeria",
    "vendor website Nigeria",
    "Nigerian payment gateway integration",
    "Paystack store",
    "Flutterwave online store",
    "inventory management Nigeria",
    "self service invoice Nigeria",
    "sell products online Lagos",
    "online shop Abuja",
    "naira payment store",
  ],
  authors: [{ name: "Zynkart", url: "https://zynkart.store" }],
  creator: "Zynkart",
  publisher: "Zynkart",
  openGraph: {
    title: "Zynkart - Your Professional Online Store in Minutes",
    description:
      "No more 'DM for price'. Create a free online store with clear pricing, Nigerian payment options, and inventory management. Built for WhatsApp vendors and social sellers.",
    images: [
      {
        url: "/images/screenshots/image.png",
        width: 1919,
        height: 1046,
        alt: "Zynkart - Online Store Builder for Nigerian Sellers",
      },
    ],
    url: "https://zynkart.store",
    siteName: "Zynkart",
    type: "website",
    locale: "en_NG",
  },
  twitter: {
    card: "summary_large_image",
    title: "Zynkart - Free Online Store for Nigerian Sellers",
    description:
      "Create your storefront in minutes. Stop the manual DM replies. Nigerian payment integration included. Perfect for WhatsApp & Instagram vendors.",
    images: [
      {
        url: "/images/screenshots/image.png",
        width: 1919,
        height: 1046,
      },
    ],
    creator: "@zynkart",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://zynkart.store",
  },
  category: "E-commerce",
  classification: "Business/E-commerce",
  other: {
    "geo.region": "NG",
    "geo.country": "Nigeria",
    "target-audience": "Nigerian small business owners, social media vendors",
  },
};

export default function Home() {
  return <LandingPage />;
}
