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

      <main className="min-h-screen bg-white dark:bg-zinc-950 font-sans text-zinc-900 dark:text-zinc-100">
        <div className="pt-24 md:pt-32" />
        <article className="py-12 md:py-20">
          <div className="container mx-auto px-6 max-w-4xl">
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
            <div className="mt-16 md:mt-24 prose prose-zinc dark:prose-invert max-w-none prose-headings:font-light prose-headings:tracking-tighter prose-h2:text-4xl prose-h3:text-2xl prose-p:leading-relaxed prose-p:text-zinc-600 dark:prose-p:text-zinc-400 prose-a:underline hover:prose-a:text-zinc-500">
              <MDXRemote source={post.content} components={mdxComponents} />
            </div>

            {/* Related Posts */}
            <RelatedPosts posts={relatedPosts} />
          </div>
        </article>

        {/* CTA Section */}
        <section className="py-32 bg-zinc-50 dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800">
          <div className="container mx-auto px-6 max-w-4xl text-center flex flex-col items-center">
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
