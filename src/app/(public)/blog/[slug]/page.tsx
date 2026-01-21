import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { MDXRemote } from "next-mdx-remote/rsc";
import { getPostBySlug, getAllSlugs, getRelatedPosts } from "@/lib/blog";
import { BlogArticleHeader, RelatedPosts } from "../_components/blog-article";
import { mdxComponents } from "../_components/mdx-components";

interface BlogPostPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  const slugs = getAllSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    return {
      title: "Post Not Found | Zynkart Blog",
    };
  }

  return {
    title: `${post.title} | Zynkart Blog`,
    description: post.description,
    keywords: post.tags,
    authors: [{ name: post.author }],
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      publishedTime: post.date,
      authors: [post.author],
      images: [
        {
          url: post.image,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
      url: `https://zynkart.store/blog/${slug}`,
      siteName: "Zynkart",
      locale: "en_NG",
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
      images: [post.image],
      creator: "@zynkart",
    },
    alternates: {
      canonical: `https://zynkart.store/blog/${slug}`,
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
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const relatedPosts = getRelatedPosts(slug, post.tags);

  // JSON-LD structured data for blog post
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    image: post.image.startsWith("http")
      ? post.image
      : `https://zynkart.store${post.image}`,
    datePublished: post.date,
    dateModified: post.date,
    author: {
      "@type": "Person",
      name: post.author,
    },
    publisher: {
      "@type": "Organization",
      name: "Zynkart",
      logo: {
        "@type": "ImageObject",
        url: "https://zynkart.store/logo.png",
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://zynkart.store/blog/${slug}`,
    },
    articleBody: post.content.slice(0, 500),
    wordCount: post.content.split(/\s+/).length,
    keywords: post.tags.join(", "),
    inLanguage: "en-NG",
  };

  // Breadcrumb structured data
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://zynkart.store",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Blog",
        item: "https://zynkart.store/blog",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: post.title,
        item: `https://zynkart.store/blog/${slug}`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <main className="min-h-screen bg-background">
        <article className="py-12 md:py-20">
          <div className="container mx-auto px-4 max-w-4xl">
            <BlogArticleHeader
              title={post.title}
              description={post.description}
              date={post.date}
              author={post.author}
              image={post.image}
              readingTime={post.readingTime}
              tags={post.tags}
            />

            {/* Article Content */}
            <div className="mt-12 md:mt-16 prose-custom">
              <MDXRemote source={post.content} components={mdxComponents} />
            </div>

            {/* Related Posts */}
            <RelatedPosts posts={relatedPosts} />
          </div>
        </article>

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
