import type { Metadata } from "next";
import { getAllPosts } from "@/lib/blog";
import { BlogCard } from "./_components/blog-card";

export const metadata: Metadata = {
  title: "Blog | Zynkart - Tips for Nigerian Online Sellers",
  description:
    "Expert guides, tips, and insights for Nigerian online sellers. Learn how to grow your e-commerce business, accept payments, and succeed in social commerce.",
  keywords: [
    "Nigerian e-commerce blog",
    "online selling tips Nigeria",
    "WhatsApp business tips",
    "how to sell online Nigeria",
    "e-commerce guide Nigeria",
    "social commerce tips",
    "Paystack tutorials",
    "online store guides",
  ],
  openGraph: {
    title: "Blog | Zynkart - Tips for Nigerian Online Sellers",
    description:
      "Expert guides, tips, and insights for Nigerian online sellers. Learn how to grow your e-commerce business.",
    images: [
      {
        url: "/images/screenshots/image.png",
        width: 1919,
        height: 1046,
        alt: "Zynkart Blog - E-commerce Tips for Nigerian Sellers",
      },
    ],
    url: "https://zynkart.store/blog",
    siteName: "Zynkart",
    type: "website",
    locale: "en_NG",
  },
  twitter: {
    card: "summary_large_image",
    title: "Blog | Zynkart - Tips for Nigerian Online Sellers",
    description:
      "Expert guides and tips for Nigerian online sellers. Grow your e-commerce business.",
    images: ["/images/screenshots/image.png"],
    creator: "@zynkart",
  },
  alternates: {
    canonical: "https://zynkart.store/blog",
  },
};

export default function BlogPage() {
  const posts = getAllPosts();

  // JSON-LD structured data for blog listing
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "Zynkart Blog",
    description:
      "Expert guides, tips, and insights for Nigerian online sellers",
    url: "https://zynkart.store/blog",
    publisher: {
      "@type": "Organization",
      name: "Zynkart",
      logo: {
        "@type": "ImageObject",
        url: "https://zynkart.store/logo.png",
      },
    },
    blogPost: posts.map((post) => ({
      "@type": "BlogPosting",
      headline: post.title,
      description: post.description,
      datePublished: post.date,
      author: {
        "@type": "Person",
        name: post.author,
      },
      url: `https://zynkart.store/blog/${post.slug}`,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main className="min-h-screen bg-white dark:bg-zinc-950 font-sans text-zinc-900 dark:text-zinc-100 pb-20">
        <div className="pt-24 md:pt-32" />

        {/* Hero Section */}
        <section className="relative py-20 border-b border-zinc-200 dark:border-zinc-800">
          <div className="container mx-auto px-6 max-w-6xl">
            <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-6 mb-12">
              <div>
                <span className="text-xs uppercase tracking-widest text-zinc-500">
                  Zynkart Blog
                </span>
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-light tracking-tighter uppercase mt-4">
                  Grow Your <br /><span className="italic font-serif">Online Business</span>
                </h1>
              </div>
              <p className="max-w-md text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                Expert guides, tips, and insights for Nigerian online sellers.
                Learn how to succeed in e-commerce and social commerce.
              </p>
            </div>
          </div>
        </section>

        {/* Blog Posts Grid */}
        <section className="py-24 bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
          <div className="container mx-auto px-6 max-w-6xl">
            {posts.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-zinc-500 text-sm tracking-widest uppercase">
                  No blog posts yet. Check back soon!
                </p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {posts.map((post, index) => (
                  <BlogCard
                    key={post.slug}
                    post={post}
                    featured={index === 0}
                  />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-32 bg-white dark:bg-zinc-950">
          <div className="container mx-auto px-6 text-center flex flex-col items-center">
            <h2 className="text-4xl md:text-6xl font-light tracking-tighter uppercase">
              Ready to Start <br /><span className="italic font-serif">Selling Online?</span>
            </h2>
            <p className="mt-6 text-sm text-zinc-600 dark:text-zinc-400 max-w-md">
              Create your free online store in minutes. No coding required. Stop the DMs.
            </p>
            <a
              href="/sign-up"
              className="mt-10 group inline-flex items-center gap-3 text-xs uppercase tracking-widest border border-zinc-900 dark:border-zinc-100 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-8 py-4 hover:bg-transparent hover:text-zinc-900 dark:hover:bg-transparent dark:hover:text-zinc-100 transition-colors duration-300"
            >
              Create Your Free Store
            </a>
          </div>
        </section>
      </main>
    </>
  );
}
