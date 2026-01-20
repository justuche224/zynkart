/*
import Hero from "./_components/hero";
import Features from "./_components/features";
import HowItWorks from "./_components/how-it-works";
import Pricing from "./_components/pricing";
import Testimonials from "./_components/testimonials";

export default function Home() {
  return (
    <main className="relative w-full bg-gradient-to-br from-white to-gray-50 dark:from-black dark:to-gray-900">
      <Hero />
      <Features />
      <HowItWorks />
      <Pricing />
      <Testimonials />
    </main>
  );
}
*/

import { LandingPage } from "@/components/home";

export default function Home() {
  return (
    <LandingPage />
  )
}