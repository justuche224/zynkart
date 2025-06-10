"use client";
import { Star, Quote } from "lucide-react";
import Image from "next/image";
import { motion } from "framer-motion";

export default function Testimonials() {
  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Founder, Artisan Jewelry Co.",
      image: "/images/4937.jpg",
      content:
        "Zynkart transformed my small jewelry business into a thriving online store. The setup was incredibly simple, and I was selling within hours. The multi-tenant architecture means my store feels completely professional and branded.",
      rating: 5,
      revenue: "$50K+ in first year",
    },
    {
      name: "Marcus Rodriguez",
      role: "E-commerce Manager, TechGear Plus",
      image: "/images/4937.jpg",
      content:
        "We manage multiple brand stores on Zynkart and the API access has been game-changing. Our development team can integrate everything seamlessly while the business team uses the intuitive dashboard.",
      rating: 5,
      revenue: "300% growth in 6 months",
    },
    {
      name: "Emily Thompson",
      role: "Creative Director, Sustainable Fashion",
      image: "/images/4937.jpg",
      content:
        "The email marketing tools and SEO features have helped us reach customers we never could before. Plus, having our own custom domain makes us look like an enterprise brand from day one.",
      rating: 5,
      revenue: "2x customer retention",
    },
    {
      name: "David Kim",
      role: "Agency Owner, Digital Commerce Solutions",
      image: "/images/4937.jpg",
      content:
        "As an agency, the white-label Enterprise plan is perfect. We can offer fully branded e-commerce solutions to our clients without them knowing about the underlying platform. It's powerful and professional.",
      rating: 5,
      revenue: "15+ client stores launched",
    },
    {
      name: "Lisa Wang",
      role: "Startup Founder, Health & Wellness",
      image: "/images/4937.jpg",
      content:
        "Started on the free plan to test my product-market fit. The platform grew with us, and now we're on Pro handling hundreds of orders monthly. The analytics help us make data-driven decisions daily.",
      rating: 5,
      revenue: "Zero to profitable in 4 months",
    },
    {
      name: "James Miller",
      role: "Dropshipper, Global Electronics",
      image: "/images/4937.jpg",
      content:
        "The inventory management and payment processing are top-notch. I can focus on marketing and customer service while Zynkart handles all the technical complexity. Best decision for my business.",
      rating: 5,
      revenue: "$100K+ GMV monthly",
    },
  ];

  const stats = [
    { number: "99.9%", label: "Uptime" },
    { number: "10K+", label: "Active Stores" },
    { number: "$50M+", label: "Sales Processed" },
    { number: "4.9★", label: "Customer Rating" },
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

  const statVariants = {
    hidden: {
      opacity: 0,
      scale: 0.5,
    },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  const floatingVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut",
      },
    },
  };

  return (
    <section className="py-20 bg-white dark:bg-black">
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
            Loved by thousands of merchants
          </motion.div>
          <motion.h2
            className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
          >
            What Our Customers
            <span className="bg-gradient-to-r from-primary to-pink-600 bg-clip-text text-transparent block">
              Are Saying
            </span>
          </motion.h2>
          <motion.p
            className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
          >
            Join thousands of successful entrepreneurs who have built thriving
            businesses with Zynkart. Here&apos;s what they have to say about their
            experience.
          </motion.p>
        </motion.div>

        {/* Stats Row */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-20"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              className="text-center"
              variants={statVariants}
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <motion.div
                className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2"
                initial={{ opacity: 0, scale: 0 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{
                  duration: 0.8,
                  delay: 0.2 + index * 0.1,
                  type: "spring",
                  stiffness: 100,
                }}
                viewport={{ once: true }}
              >
                {stat.number}
              </motion.div>
              <div className="text-gray-600 dark:text-gray-300">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Testimonials Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300 group"
              variants={cardVariants}
              whileHover={{
                y: -5,
                scale: 1.02,
                transition: { duration: 0.2 },
              }}
            >
              <motion.div
                className="flex items-center gap-1 mb-4"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 + index * 0.05 }}
                viewport={{ once: true }}
              >
                {[...Array(testimonial.rating)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{
                      duration: 0.3,
                      delay: 0.3 + index * 0.05 + i * 0.1,
                      type: "spring",
                      stiffness: 200,
                    }}
                    viewport={{ once: true }}
                  >
                    <Star className="h-5 w-5 text-yellow-400 fill-current" />
                  </motion.div>
                ))}
              </motion.div>

              <div className="relative mb-6">
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.4 + index * 0.05 }}
                  viewport={{ once: true }}
                >
                  <Quote className="absolute -top-2 -left-2 h-8 w-8 text-primary/20" />
                </motion.div>
                <motion.p
                  className="text-gray-700 dark:text-gray-300 leading-relaxed pl-6"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.5 + index * 0.05 }}
                  viewport={{ once: true }}
                >
                  &quot;{testimonial.content}&quot;
                </motion.p>
              </div>

              <motion.div
                className="flex items-center gap-4"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 + index * 0.05 }}
                viewport={{ once: true }}
              >
                <motion.div
                  className="relative"
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.2 }}
                >
                  <Image
                    src={testimonial.image}
                    alt={testimonial.name}
                    width={48}
                    height={48}
                    className="rounded-full"
                  />
                </motion.div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 dark:text-white">
                    {testimonial.name}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {testimonial.role}
                  </p>
                  <motion.p
                    className="text-sm text-primary font-medium"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.2 }}
                  >
                    {testimonial.revenue}
                  </motion.p>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA Section */}
        <motion.div
          className="bg-gradient-to-r from-primary to-pink-600 rounded-3xl p-8 md:p-12 text-center text-white"
          variants={floatingVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
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
            Ready to Join Our Success Stories?
          </motion.h3>
          <motion.p
            className="text-lg md:text-xl opacity-90 mb-8 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
          >
            Start your journey today and become our next success story. Join
            thousands of merchants who chose Zynkart to grow their business.
          </motion.p>
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <motion.button
              aria-label="Start Free Trial"
              className="bg-white text-primary hover:bg-gray-100 px-8 py-4 rounded-xl font-semibold transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              Start Free Trial
            </motion.button>
            <motion.button
              aria-label="View Demo"
              className="border-2 border-white text-white hover:bg-white hover:text-primary px-8 py-4 rounded-xl font-semibold transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              View Demo
            </motion.button>
          </motion.div>
        </motion.div>

        {/* Trust Badges */}
        <motion.div
          className="mt-16 text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
        >
          <motion.p
            className="text-gray-600 dark:text-gray-400 mb-8"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
          >
            Trusted by businesses worldwide and secured with enterprise-grade
            protection
          </motion.p>
          <motion.div
            className="flex flex-wrap justify-center items-center gap-8 opacity-60"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {["SSL", "PCI DSS", "GDPR", "SOC 2", "ISO 27001"].map(
              (badge, index) => (
                <motion.div
                  key={index}
                  className="text-2xl font-bold text-gray-400"
                  variants={cardVariants}
                  whileHover={{
                    scale: 1.1,
                    opacity: 1,
                    transition: { duration: 0.2 },
                  }}
                >
                  {badge}
                </motion.div>
              )
            )}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
