"use client";
import { Button } from "@/components/ui/button";
import { Check, X, Crown, Zap, Rocket } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function Pricing() {
  const plans = [
    {
      name: "Free",
      icon: <Zap className="h-6 w-6" />,
      price: "$0",
      period: "forever",
      description: "Perfect for getting started and testing the waters",
      featured: false,
      features: [
        { name: "1 store", included: true },
        { name: "Up to 15 products", included: true },
        { name: "Basic templates", included: true },
        { name: "Standard support", included: true },
        { name: "Basic analytics", included: true },
        { name: "Mobile responsive", included: true },
        { name: "Custom domain", included: false },
        { name: "Email marketing", included: false },
        { name: "API access", included: false },
        { name: "Priority support", included: false },
        { name: "Advanced analytics", included: false },
      ],
      limitations: ["Zynkart branding", "Community support only"],
    },
    {
      name: "Pro",
      icon: <Crown className="h-6 w-6" />,
      price: "$29",
      period: "per month",
      description: "Best for growing businesses and serious entrepreneurs",
      featured: true,
      features: [
        { name: "Up to 5 stores", included: true },
        { name: "Up to 500 products per store", included: true },
        { name: "All premium templates", included: true },
        { name: "Priority support", included: true },
        { name: "Advanced analytics", included: true },
        { name: "Mobile responsive", included: true },
        { name: "Custom domain", included: true },
        { name: "Email marketing (5,000 emails/month)", included: true },
        { name: "Full API access", included: true },
        { name: "SEO tools", included: true },
      ],
      limitations: ["Remove Zynkart branding", "24/7 email support"],
    },
    {
      name: "Enterprise",
      icon: <Rocket className="h-6 w-6" />,
      price: "$99",
      period: "per month",
      description: "For large businesses and agencies with multiple brands",
      featured: false,
      features: [
        { name: "Unlimited stores", included: true },
        { name: "Unlimited products", included: true },
        { name: "All premium templates + custom", included: true },
        { name: "White-label solution", included: true },
        { name: "Enterprise analytics", included: true },
        { name: "Mobile responsive", included: true },
        { name: "Custom domain", included: true },
        { name: "Unlimited email marketing", included: true },
        { name: "Full API access + webhooks", included: true },
        { name: "Advanced SEO tools", included: true },
      ],
      limitations: [
        "Complete white-label",
        "24/7 phone & email support",
        "Dedicated account manager",
      ],
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.2,
      },
    },
  };

  const cardVariants = {
    hidden: {
      opacity: 0,
      y: 50,
      scale: 0.95,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  const featureVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.3,
      },
    },
  };

  return (
    <section id="pricing" className="py-20">
      <div className="container mx-auto px-4">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true, margin: "-100px" }}
        >
          <motion.div
            className="inline-flex items-center px-4 py-2 rounded-full border border-primary/50 bg-primary/10 text-sm font-medium text-primary mb-6"
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
          >
            Simple, transparent pricing
          </motion.div>
          <motion.h2
            className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
          >
            Choose Your
            <span className="bg-gradient-to-r from-primary to-pink-600 bg-clip-text text-transparent block">
              Perfect Plan
            </span>
          </motion.h2>
          <motion.p
            className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
          >
            Start free and scale as you grow. All plans include core eCommerce
            features, with advanced capabilities in higher tiers.
          </motion.p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              className={`relative rounded-3xl border-2 p-8 ${
                plan.featured
                  ? "border-primary bg-gradient-to-b from-primary/5 to-transparent scale-105 shadow-2xl"
                  : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
              }`}
              variants={cardVariants}
              whileHover={{
                y: -10,
                transition: { duration: 0.3 },
              }}
            >
              {plan.featured && (
                <motion.div
                  className="absolute -top-4 left-1/2 transform -translate-x-1/2"
                  initial={{ opacity: 0, y: -10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                  viewport={{ once: true }}
                >
                  <div className="bg-gradient-to-r from-primary to-pink-600 text-white px-6 py-2 rounded-full text-sm font-medium">
                    Most Popular
                  </div>
                </motion.div>
              )}

              <div className="text-center mb-8">
                <motion.div
                  className={`inline-flex p-3 rounded-2xl mb-4 ${
                    plan.featured
                      ? "bg-gradient-to-br from-primary to-pink-600 text-white"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300"
                  }`}
                  whileHover={{
                    scale: 1.1,
                    rotate: 5,
                  }}
                  transition={{ duration: 0.2 }}
                >
                  {plan.icon}
                </motion.div>
                <motion.h3
                  className="text-2xl font-bold text-gray-900 dark:text-white mb-2"
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                  viewport={{ once: true }}
                >
                  {plan.name}
                </motion.h3>
                <motion.p
                  className="text-gray-600 dark:text-gray-300 mb-6"
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                  viewport={{ once: true }}
                >
                  {plan.description}
                </motion.p>
                <motion.div
                  className="mb-6"
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <span className="text-5xl font-bold text-gray-900 dark:text-white">
                    {plan.price}
                  </span>
                  <span className="text-gray-600 dark:text-gray-300 ml-2">
                    {plan.period}
                  </span>
                </motion.div>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                viewport={{ once: true }}
              >
                <Button
                  aria-label={`Get ${plan.name}`}
                  asChild
                  className={`w-full mb-8 h-12 ${
                    plan.featured
                      ? "bg-gradient-to-r from-primary to-pink-600 hover:from-primary hover:to-pink-500 text-white"
                      : "bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100"
                  }`}
                >
                  <Link href="/sign-up">
                    {plan.name === "Free" ? "Start Free" : `Get ${plan.name}`}
                  </Link>
                </Button>
              </motion.div>

              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900 dark:text-white">
                  What&apos;s included:
                </h4>
                <motion.ul
                  className="space-y-3"
                  initial="hidden"
                  whileInView="visible"
                  transition={{ staggerChildren: 0.05 }}
                  viewport={{ once: true }}
                >
                  {plan.features.map((feature, featureIndex) => (
                    <motion.li
                      key={featureIndex}
                      className="flex items-start gap-3"
                      variants={featureVariants}
                    >
                      {feature.included ? (
                        <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      ) : (
                        <X className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                      )}
                      <span
                        className={`text-sm ${
                          feature.included
                            ? "text-gray-700 dark:text-gray-300"
                            : "text-gray-400 dark:text-gray-500"
                        }`}
                      >
                        {feature.name}
                      </span>
                    </motion.li>
                  ))}
                </motion.ul>

                {plan.limitations && plan.limitations.length > 0 && (
                  <motion.div
                    className="pt-4 border-t border-gray-200 dark:border-gray-700"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <h5 className="font-medium text-gray-900 dark:text-white mb-3 text-sm">
                      Additional benefits:
                    </h5>
                    <motion.ul
                      className="space-y-2"
                      initial="hidden"
                      whileInView="visible"
                      transition={{ staggerChildren: 0.1 }}
                      viewport={{ once: true }}
                    >
                      {plan.limitations.map((limitation, limitIndex) => (
                        <motion.li
                          key={limitIndex}
                          className="flex items-start gap-2"
                          variants={featureVariants}
                        >
                          <motion.div
                            className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0"
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              delay: limitIndex * 0.2,
                            }}
                          ></motion.div>
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {limitation}
                          </span>
                        </motion.li>
                      ))}
                    </motion.ul>
                  </motion.div>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          className="mt-16 text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          viewport={{ once: true }}
        >
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Need something custom? We offer enterprise solutions with custom
            pricing.
          </p>
          <motion.div
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            <Button
              aria-label="Contact Sales"
              variant="outline"
              size="lg"
              className="border-primary text-primary hover:bg-primary hover:text-white"
            >
              Contact Sales
            </Button>
          </motion.div>
        </motion.div>

        {/* FAQ section */}
        <motion.div
          className="mt-20 max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true, margin: "-100px" }}
        >
          <motion.h3
            className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            Frequently Asked Questions
          </motion.h3>
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {[
              {
                question: "Can I change plans anytime?",
                answer:
                  "Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.",
              },
              {
                question: "Is there a setup fee?",
                answer:
                  "No setup fees, no hidden costs. You only pay the monthly subscription fee.",
              },
              {
                question: "What payment methods do you accept?",
                answer:
                  "We accept all major credit cards, PayPal, and bank transfers for enterprise plans.",
              },
              {
                question: "Do you offer refunds?",
                answer:
                  "Yes, we offer a 30-day money-back guarantee on all paid plans.",
              },
            ].map((faq, index) => (
              <motion.div
                key={index}
                variants={cardVariants}
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  {faq.question}
                </h4>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  {faq.answer}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
