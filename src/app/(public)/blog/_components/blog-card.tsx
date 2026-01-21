"use client";

import Link from "next/link";
import Image from "next/image";
import { Calendar, Clock, User, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import type { BlogPostMeta } from "@/lib/blog";

interface BlogCardProps {
  post: BlogPostMeta;
  featured?: boolean;
}

export function BlogCard({ post, featured = false }: BlogCardProps) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className={`group relative overflow-hidden rounded-2xl bg-card border border-border ${
        featured ? "md:col-span-2 md:row-span-2" : ""
      }`}
    >
      <Link href={`/blog/${post.slug}`} className="block">
        {/* Image Container */}
        <div
          className={`relative overflow-hidden ${
            featured ? "aspect-[16/9]" : "aspect-[16/10]"
          }`}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10" />
          <Image
            src={post.image}
            alt={post.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes={
              featured
                ? "(max-width: 768px) 100vw, 66vw"
                : "(max-width: 768px) 100vw, 33vw"
            }
          />
          {/* Tags */}
          <div className="absolute top-4 left-4 z-20 flex flex-wrap gap-2">
            {post.tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 text-xs font-medium bg-background/90 rounded-full text-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className={`p-6 ${featured ? "md:p-8" : ""}`}>
          {/* Meta */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              {new Date(post.date).toLocaleDateString("en-NG", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              {post.readingTime} min read
            </span>
          </div>

          {/* Title */}
          <h2
            className={`font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2 ${
              featured ? "text-2xl md:text-3xl" : "text-lg md:text-xl"
            }`}
          >
            {post.title}
          </h2>

          {/* Description */}
          <p
            className={`mt-3 text-muted-foreground line-clamp-2 ${
              featured ? "md:line-clamp-3" : ""
            }`}
          >
            {post.description}
          </p>

          {/* Author & CTA */}
          <div className="mt-4 flex items-center justify-between">
            <span className="flex items-center gap-2 text-sm text-muted-foreground">
              <User className="w-4 h-4" />
              {post.author}
            </span>
            <span className="flex items-center gap-1 text-sm font-medium text-primary group-hover:gap-2 transition-all">
              Read more
              <ArrowRight className="w-4 h-4" />
            </span>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
