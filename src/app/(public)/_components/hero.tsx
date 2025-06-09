"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  ShoppingCart,
  Store,
  Package,
  CreditCard,
  PlayCircle,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function EnhancedHero() {
  const [isVisible, setIsVisible] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);

  const features = [
    {
      icon: <Store className="h-5 w-5" />,
      title: "Customizable storefronts",
      description: "Build your brand with stunning drag-and-drop store designs",
    },
    {
      icon: <Package className="h-5 w-5" />,
      title: "Inventory management",
      description: "Track products, manage stock, and automate restocking",
    },
    {
      icon: <CreditCard className="h-5 w-5" />,
      title: "Integrated payments",
      description: "Accept payments globally with 30+ payment methods",
    },
    {
      icon: <ShoppingCart className="h-5 w-5" />,
      title: "Multi-channel selling",
      description:
        "Sell everywhere your customers shop - social, marketplace, and more",
    },
  ];

  useEffect(() => {
    setIsVisible(true);
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % features.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [features.length]);

  return (
    <div className="relative w-full min-h-screen bg-gradient-to-br from-white to-gray-50 dark:from-black dark:to-gray-900 overflow-hidden pt-10">
      {/* Background gradient effects */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
        <div className="absolute top-1/4 -left-1/4 w-1/2 h-1/2 bg-primary/30 dark:bg-primary/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-pink-500/30 dark:bg-primary/20 rounded-full blur-3xl"></div>
      </div>

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-10 dark:opacity-20"></div>

      <div className="container mx-auto px-4 py-16 flex flex-col lg:flex-row items-center justify-between gap-12 relative z-10">
        <div
          className={`max-w-2xl space-y-8 text-center lg:text-left transition-all duration-1000 ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
          }`}
        >
          <div className="space-y-2">
            <div className="inline-flex items-center px-3 py-1 rounded-full border border-primary/50 bg-primary/20 dark:bg-primary/10 dark:border-primary/30 text-sm font-medium text-primary mb-4">
              <span className="flex h-2 w-2 rounded-full bg-primary mr-2"></span>{" "}
              Next-gen eCommerce platform
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-pink-600">
                Zynkart
              </span>
              <span className="block mt-1 text-gray-800 dark:text-white">
                Sell Without Limits
              </span>
            </h1>
            <p className="text-xl md:text-2xl font-medium text-gray-700 dark:text-white/80 mt-6">
              Your complete eCommerce ecosystem
            </p>
          </div>

          <p className="text-lg leading-relaxed text-gray-600 dark:text-white/70">
            Launch, manage, and scale your online business with our all-in-one
            platform. Create branded stores, process payments, and grow your
            customer base—all without technical expertise.
          </p>

          <div className="relative bg-white/80 dark:bg-black/40 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-xl p-6 mt-10 shadow-lg">
            <div className="absolute -top-3 left-4 px-3 py-1 bg-gradient-to-r from-primary to-pink-500 text-white text-xs font-semibold rounded-full">
              POWERFUL FEATURES
            </div>

            <div className="mt-2">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className={`transition-all duration-500 ${
                    activeFeature === index
                      ? "opacity-100 scale-100"
                      : "opacity-0 scale-95 absolute"
                  } ${activeFeature !== index && "pointer-events-none"}`}
                >
                  <div className="flex items-start gap-4">
                    <div className="bg-gradient-to-br from-primary to-pink-600 p-3 rounded-lg text-white">
                      {feature.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                        {feature.title}
                      </h3>
                      <p className="text-gray-600 dark:text-white/70">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-center mt-6">
              {features.map((_, index) => (
                <button
                  key={index}
                  className={`w-2 h-2 rounded-full mx-1 ${
                    activeFeature === index
                      ? "bg-primary"
                      : "bg-gray-300 dark:bg-white/30"
                  }`}
                  onClick={() => setActiveFeature(index)}
                  aria-label={`Feature ${index + 1}`}
                />
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-6 justify-center lg:justify-start">
            <Button
              asChild
              size="lg"
              className="bg-gradient-to-r from-primary to-pink-600 hover:from-primary hover:to-pink-500 text-white border-0 h-14 px-8 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all"
            >
              <Link href={"/sign-in"}>
                Start for free <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="bg-white/30 dark:bg-transparent border-gray-300 dark:border-white/20 hover:bg-white/50 dark:hover:bg-white/10 text-gray-700 dark:text-white h-14 px-8 rounded-xl shadow-md"
            >
              <PlayCircle className="mr-2 h-5 w-5" /> Watch demo
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-6 text-sm text-gray-600 dark:text-white/70">
            <div className="flex items-center">
              <svg
                className="h-5 w-5 text-primary mr-2"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span>No credit card required</span>
            </div>
          </div>
        </div>

        <div
          className={`relative w-full hidden lg:block max-w-md lg:max-w-lg xl:max-w-xl z-0 transition-all duration-1000 ${
            isVisible ? "translate-x-0 opacity-100" : "translate-x-10 opacity-0"
          }`}
        >
          {/* 3D Product Showcase */}
          <div className="relative">
            <div className="relative animate-float">
              <Image
                src="/images/hero-image.png"
                width={600}
                height={600}
                alt="Zynkart shopping experience with various products"
                className="w-full h-auto drop-shadow-2xl"
                priority
              />
            </div>

            {/* Floating elements */}
            <div className="absolute -top-8 -left-8 bg-white/90 dark:bg-white/10 backdrop-blur-lg p-4 rounded-lg border border-gray-200 dark:border-white/20 shadow-xl animate-float-slow">
              <div className="flex items-center gap-3">
                <div className="bg-primary p-2 rounded-full">
                  <ShoppingCart className="h-5 w-5 text-white" />
                </div>
                <div className="text-gray-800 dark:text-white">
                  <p className="text-xs">New order</p>
                  <p className="text-sm font-medium">$129.99</p>
                </div>
              </div>
            </div>

            <div className="absolute bottom-10 -right-6 bg-white/90 dark:bg-white/10 backdrop-blur-lg p-4 rounded-lg border border-gray-200 dark:border-white/20 shadow-xl animate-float-delay">
              <div className="flex items-center gap-3">
                <div className="bg-green-500 p-2 rounded-full">
                  <svg
                    className="h-5 w-5 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <div className="text-gray-800 dark:text-white">
                  <p className="text-xs">Inventory updated</p>
                  <p className="text-sm font-medium">+ 24 items</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add custom CSS for animations */}
      <style jsx global>{`
        @keyframes float {
          0% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
          100% {
            transform: translateY(0px);
          }
        }

        @keyframes float-slow {
          0% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-15px) rotate(2deg);
          }
          100% {
            transform: translateY(0px) rotate(0deg);
          }
        }

        @keyframes float-delay {
          0% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-10px) rotate(-2deg);
          }
          100% {
            transform: translateY(0px) rotate(0deg);
          }
        }

        .animate-float {
          animation: float 6s ease-in-out infinite;
        }

        .animate-float-slow {
          animation: float-slow 7s ease-in-out infinite;
        }

        .animate-float-delay {
          animation: float-delay 8s ease-in-out 1s infinite;
        }
      `}</style>
    </div>
  );
}
