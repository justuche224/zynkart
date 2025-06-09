"use client";
import {
  ArrowRight,
  UserPlus,
  Palette,
  ShoppingBag,
  TrendingUp,
} from "lucide-react";
import { motion } from "framer-motion";

export default function HowItWorks() {
  const steps = [
    {
      step: "01",
      icon: <UserPlus className="h-8 w-8" />,
      title: "Sign Up & Create Your Store",
      description:
        "Get started in minutes with our simple signup process. Choose your subdomain and you're ready to go.",
      color: "from-blue-500 to-purple-600",
    },
    {
      step: "02",
      icon: <Palette className="h-8 w-8" />,
      title: "Customize Your Store",
      description:
        "Pick from our beautiful templates or create your own design. Add your branding, colors, and make it uniquely yours.",
      color: "from-purple-500 to-pink-600",
    },
    {
      step: "03",
      icon: <ShoppingBag className="h-8 w-8" />,
      title: "Add Products & Go Live",
      description:
        "Upload your products, set prices, configure payments, and publish your store. Start selling immediately.",
      color: "from-pink-500 to-red-600",
    },
    {
      step: "04",
      icon: <TrendingUp className="h-8 w-8" />,
      title: "Grow & Scale",
      description:
        "Use our marketing tools, analytics, and APIs to grow your business. Scale as you succeed.",
      color: "from-orange-500 to-yellow-600",
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

  const stepVariants = {
    hidden: {
      opacity: 0,
      y: 50,
      scale: 0.9,
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

  const lineVariants = {
    hidden: {
      scaleX: 0,
      opacity: 0,
    },
    visible: {
      scaleX: 1,
      opacity: 1,
      transition: {
        duration: 0.8,
        delay: 0.5,
        ease: "easeInOut",
      },
    },
  };

  return (
    <section className="py-20 bg-gray-50 dark:bg-gray-900">
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
            Simple process, powerful results
          </motion.div>
          <motion.h2
            className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
          >
            How It
            <span className="bg-gradient-to-r from-primary to-pink-600 bg-clip-text text-transparent">
              {" "}
              Works
            </span>
          </motion.h2>
          <motion.p
            className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
          >
            From idea to online store in just 4 simple steps. No technical
            knowledge required, no complex setup process.
          </motion.p>
        </motion.div>

        <div className="max-w-6xl mx-auto">
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
          >
            {steps.map((step, index) => (
              <motion.div
                key={index}
                className="relative"
                variants={stepVariants}
              >
                <div className="text-center">
                  {/* Step number */}
                  <div className="relative mb-6">
                    <motion.div
                      className={`w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center text-white font-bold text-lg shadow-lg`}
                      whileHover={{
                        scale: 1.1,
                        rotate: 5,
                      }}
                      transition={{ duration: 0.2 }}
                    >
                      {step.step}
                    </motion.div>
                    {/* Connecting line */}
                    {index < steps.length - 1 && (
                      <motion.div
                        className="hidden lg:block absolute top-8 left-1/2 transform translate-x-8 w-full h-0.5 bg-gradient-to-r from-gray-300 to-gray-200 dark:from-gray-600 dark:to-gray-700 origin-left"
                        variants={lineVariants}
                        style={{ transformOrigin: "left center" }}
                      ></motion.div>
                    )}
                  </div>

                  {/* Icon */}
                  <motion.div
                    className="mb-6"
                    initial={{ opacity: 0, scale: 0.5 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <motion.div
                      className="w-12 h-12 mx-auto bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300 shadow-sm"
                      whileHover={{
                        scale: 1.1,
                        borderColor: "rgb(249 115 22)", // primary color
                      }}
                      transition={{ duration: 0.2 }}
                    >
                      {step.icon}
                    </motion.div>
                  </motion.div>

                  {/* Content */}
                  <motion.h3
                    className="text-xl font-bold text-gray-900 dark:text-white mb-4"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    {step.title}
                  </motion.h3>
                  <motion.p
                    className="text-gray-600 dark:text-gray-300 leading-relaxed"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    {step.description}
                  </motion.p>
                </div>

                {/* Mobile connecting arrow */}
                {index < steps.length - 1 && (
                  <motion.div
                    className="lg:hidden flex justify-center mt-8 mb-4"
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <ArrowRight className="h-6 w-6 text-gray-400" />
                  </motion.div>
                )}
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Additional info section */}
        <motion.div
          className="mt-20 bg-white dark:bg-gray-800 rounded-3xl p-8 md:p-12 border border-gray-200 dark:border-gray-700"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true, margin: "-100px" }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                Ready to Launch Your Store?
              </h3>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
                Join thousands of entrepreneurs who have built successful online
                businesses with Zynkart. Our platform handles the technical
                complexity so you can focus on what matters most - growing your
                business.
              </p>
              <div className="space-y-4">
                {[
                  "Average setup time: 15 minutes",
                  "99.9% uptime guarantee",
                  "24/7 customer support",
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    className="flex items-center gap-3"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <motion.div
                      className="w-2 h-2 bg-green-500 rounded-full"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: index * 0.3,
                      }}
                    ></motion.div>
                    <span className="text-gray-700 dark:text-gray-300">
                      {item}
                    </span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
            <motion.div
              className="text-center lg:text-right"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
            >
              <motion.div
                className="bg-gradient-to-br from-primary/10 to-pink-500/10 rounded-2xl p-8 inline-block"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                <motion.div
                  className="text-4xl font-bold text-gray-900 dark:text-white mb-2"
                  initial={{ opacity: 0, scale: 0.5 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                  viewport={{ once: true }}
                >
                  10,000+
                </motion.div>
                <div className="text-lg text-gray-600 dark:text-gray-300 mb-4">
                  Active Stores
                </div>
                <motion.div
                  className="text-4xl font-bold text-gray-900 dark:text-white mb-2"
                  initial={{ opacity: 0, scale: 0.5 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.8 }}
                  viewport={{ once: true }}
                >
                  $50M+
                </motion.div>
                <div className="text-lg text-gray-600 dark:text-gray-300">
                  Total Sales Processed
                </div>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
