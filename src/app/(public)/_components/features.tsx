"use client";
import {
  Store,
  Code,
  Palette,
  Package,
  CreditCard,
  Mail,
  Users,
  Globe,
  Search,
  BarChart3,
  Smartphone,
  Shield,
} from "lucide-react";
import { motion } from "framer-motion";

export default function Features() {
  const features = [
    {
      icon: <Store className="h-8 w-8" />,
      title: "Multi-tenant Architecture",
      description:
        "Each store lives on its own subdomain with complete isolation and customization.",
    },
    {
      icon: <Code className="h-8 w-8" />,
      title: "Dashboard or Headless API",
      description:
        "Manage via intuitive dashboard or integrate headlessly with full API access.",
    },
    {
      icon: <Palette className="h-8 w-8" />,
      title: "Multiple Templates",
      description:
        "Choose from stunning professionally designed templates or create your own.",
    },
    {
      icon: <Package className="h-8 w-8" />,
      title: "Inventory Management",
      description:
        "Track products, manage stock levels, and organize everything in one place.",
    },
    {
      icon: <CreditCard className="h-8 w-8" />,
      title: "Payment Processing",
      description:
        "Accept payments globally with multiple payment methods and processors.",
    },
    {
      icon: <Mail className="h-8 w-8" />,
      title: "Email Marketing",
      description:
        "Reach your customers with powerful email campaigns and automation.",
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: "Customer Management",
      description:
        "Full user management with customer logins, profiles, and order history.",
    },
    {
      icon: <Globe className="h-8 w-8" />,
      title: "Custom Domains",
      description:
        "Use your own domain name for a fully branded shopping experience.",
    },
    {
      icon: <Search className="h-8 w-8" />,
      title: "SEO Optimized",
      description:
        "Server-side rendered for optimal search engine visibility and performance.",
    },
    {
      icon: <BarChart3 className="h-8 w-8" />,
      title: "Analytics & Insights",
      description:
        "Track sales, customer behavior, and store performance with detailed analytics.",
    },
    {
      icon: <Smartphone className="h-8 w-8" />,
      title: "Mobile Responsive",
      description:
        "Every store is optimized for mobile devices and tablets out of the box.",
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: "Security & Compliance",
      description:
        "Enterprise-grade security with PCI compliance and data protection.",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1,
      },
    },
  };

  const cardVariants = {
    hidden: {
      opacity: 0,
      y: 30,
      scale: 0.95,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };

  const highlightVariants = {
    hidden: {
      opacity: 0,
      scale: 0.9,
      y: 40,
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut",
      },
    },
  };

  return (
    <section id="features" className="py-20">
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
            Everything you need to succeed
          </motion.div>
          <motion.h2
            className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
          >
            Powerful Features for
            <span className="bg-gradient-to-r from-primary to-pink-600 bg-clip-text text-transparent block">
              Modern eCommerce
            </span>
          </motion.h2>
          <motion.p
            className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
          >
            All the features you&apos;d expect from a full-fledged eCommerce
            platform — and then some. Built for scale, designed for simplicity.
          </motion.p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="group p-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 hover:border-primary/50 hover:shadow-lg transition-all duration-300"
              variants={cardVariants}
              whileHover={{
                scale: 1.02,
                transition: { duration: 0.2 },
              }}
            >
              <motion.div
                className="mb-4 p-3 bg-gradient-to-br from-primary/10 to-pink-500/10 rounded-xl w-fit group-hover:scale-110 transition-transform duration-300"
                whileHover={{ rotate: 5 }}
                transition={{ duration: 0.2 }}
              >
                <div className="text-primary group-hover:text-pink-600 transition-colors duration-300">
                  {feature.icon}
                </div>
              </motion.div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* Additional highlight section */}
        <motion.div
          className="mt-20 text-center"
          variants={highlightVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          <motion.div
            className="bg-gradient-to-r from-primary to-pink-600 rounded-3xl p-8 md:p-12 text-white"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.3 }}
          >
            <motion.h3
              className="text-3xl md:text-4xl font-bold mb-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              Ready to Scale Your Business?
            </motion.h3>
            <motion.p
              className="text-lg md:text-xl opacity-90 mb-8 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
            >
              Join thousands of merchants who have chosen Zynkart to power their
              online stores. No setup fees, no hidden costs.
            </motion.p>
            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
            >
              {["99.9% Uptime", "24/7 Support", "30-day Free Trial"].map(
                (item, index) => (
                  <motion.div
                    key={index}
                    className="flex items-center gap-2 text-lg"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <motion.div
                      className="w-2 h-2 bg-white rounded-full"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: index * 0.3,
                      }}
                    ></motion.div>
                    <span>{item}</span>
                  </motion.div>
                )
              )}
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
