"use client";

import Link from "next/link";
import Image from "next/image";
import {
  Calendar,
  Clock,
  User,
  ArrowLeft,
  Share2,
  Twitter,
  Linkedin,
  Facebook,
} from "lucide-react";
import { motion } from "framer-motion";
import type { BlogPostMeta } from "@/lib/blog";
import { BlogCard } from "./blog-card";

interface BlogArticleHeaderProps {
  title: string;
  description: string;
  date: string;
  author: string;
  image: string;
  readingTime: number;
  tags: string[];
}

export function BlogArticleHeader({
  title,
  description,
  date,
  author,
  image,
  readingTime,
  tags,
}: BlogArticleHeaderProps) {
  const shareUrl = typeof window !== "undefined" ? window.location.href : "";
  const shareText = `${title} - ${description}`;

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: description,
          url: shareUrl,
        });
      } catch {
        // User cancelled or error
      }
    }
  };

  return (
    <header className="relative">
      {/* Back Link */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="mb-8"
      >
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Blog
        </Link>
      </motion.div>

      {/* Tags */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-wrap gap-2 mb-4"
      >
        {tags.map((tag) => (
          <span
            key={tag}
            className="px-3 py-1 text-xs font-medium bg-accent text-accent-foreground rounded-full"
          >
            {tag}
          </span>
        ))}
      </motion.div>

      {/* Title */}
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground leading-tight"
      >
        {title}
      </motion.h1>

      {/* Description */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-4 text-lg md:text-xl text-muted-foreground"
      >
        {description}
      </motion.p>

      {/* Meta Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-6 flex flex-wrap items-center gap-4 text-sm text-muted-foreground"
      >
        <span className="flex items-center gap-2">
          <User className="w-4 h-4" />
          {author}
        </span>
        <span className="flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          {new Date(date).toLocaleDateString("en-NG", {
            month: "long",
            day: "numeric",
            year: "numeric",
          })}
        </span>
        <span className="flex items-center gap-2">
          <Clock className="w-4 h-4" />
          {readingTime} min read
        </span>
      </motion.div>

      {/* Share Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-6 flex items-center gap-3"
      >
        <span className="text-sm text-muted-foreground">Share:</span>
        <div className="flex items-center gap-2">
          <button
            onClick={handleShare}
            className="p-2 rounded-full bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
            aria-label="Share"
          >
            <Share2 className="w-4 h-4" />
          </button>
          <a
            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-full bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
            aria-label="Share on Twitter"
          >
            <Twitter className="w-4 h-4" />
          </a>
          <a
            href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(title)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-full bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
            aria-label="Share on LinkedIn"
          >
            <Linkedin className="w-4 h-4" />
          </a>
          <a
            href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-full bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
            aria-label="Share on Facebook"
          >
            <Facebook className="w-4 h-4" />
          </a>
        </div>
      </motion.div>

      {/* Featured Image */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="mt-8 relative aspect-[2/1] rounded-2xl overflow-hidden"
      >
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover"
          priority
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
        />
      </motion.div>
    </header>
  );
}

interface RelatedPostsProps {
  posts: BlogPostMeta[];
}

export function RelatedPosts({ posts }: RelatedPostsProps) {
  if (posts.length === 0) return null;

  return (
    <section className="mt-16 pt-12 border-t border-border">
      <h2 className="text-2xl font-bold text-foreground mb-8">
        Related Articles
      </h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post) => (
          <BlogCard key={post.slug} post={post} />
        ))}
      </div>
    </section>
  );
}
