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

      <main className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="relative py-20 md:py-28 bg-gradient-to-b from-muted/50 to-background">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="text-center max-w-3xl mx-auto">
              <span className="inline-block px-4 py-1.5 text-sm font-medium bg-accent text-accent-foreground rounded-full mb-6">
                Zynkart Blog
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground">
                Grow Your <span className="text-primary">Online Business</span>
              </h1>
              <p className="mt-6 text-lg md:text-xl text-muted-foreground">
                Expert guides, tips, and insights for Nigerian online sellers.
                Learn how to succeed in e-commerce and social commerce.
              </p>
            </div>
          </div>
        </section>

        {/* Blog Posts Grid */}
        <section className="py-16 md:py-20">
          <div className="container mx-auto px-4 max-w-6xl">
            {posts.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-muted-foreground text-lg">
                  No blog posts yet. Check back soon!
                </p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
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
        <section className="py-16 bg-muted/50">
          <div className="container mx-auto px-4 max-w-4xl text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">
              Ready to Start Selling Online?
            </h2>
            <p className="mt-4 text-muted-foreground">
              Create your free online store in minutes. No coding required.
            </p>
            <a
              href="/sign-up"
              className="inline-flex mt-6 px-8 py-4 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-full transition-colors"
            >
              Create Your Free Store
            </a>
          </div>
        </section>
      </main>
    </>
  );
}
