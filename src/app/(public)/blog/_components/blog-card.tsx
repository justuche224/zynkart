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
      className={`group relative overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 hover:shadow-xl transition-shadow ${
        featured ? "md:col-span-2 md:row-span-2" : ""
      }`}
    >
      <Link href={`/blog/${post.slug}`} className="h-full flex flex-col">
        {/* Image Container */}
        <div
          className={`relative overflow-hidden border-b border-zinc-200 dark:border-zinc-800 ${
            featured ? "aspect-[16/9]" : "aspect-[16/10]"
          }`}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10 opacity-60" />
          <Image
            src={post.image}
            alt={post.title}
            fill
            className="object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-105"
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
                className="px-3 py-1 text-[10px] uppercase tracking-widest font-medium bg-white/90 dark:bg-zinc-900/90 text-zinc-900 dark:text-zinc-100"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className={`p-6 flex-1 flex flex-col ${featured ? "md:p-10" : ""}`}>
          {/* Meta */}
          <div className="flex items-center gap-4 text-xs tracking-widest uppercase text-zinc-500 mb-4">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              {new Date(post.date).toLocaleDateString("en-NG", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              {post.readingTime} min read
            </span>
          </div>

          {/* Title */}
          <h2
            className={`font-light tracking-tight text-zinc-900 dark:text-zinc-100 line-clamp-2 mb-3 ${
              featured ? "text-3xl md:text-5xl" : "text-xl md:text-2xl"
            }`}
          >
            {post.title}
          </h2>

          {/* Description */}
          <p
            className={`text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2 leading-relaxed flex-1 ${
              featured ? "md:line-clamp-3 md:text-base" : ""
            }`}
          >
            {post.description}
          </p>

          {/* Author & CTA */}
          <div className="mt-8 pt-6 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
            <span className="flex items-center gap-2 text-xs uppercase tracking-widest text-zinc-500">
              <User className="w-3.5 h-3.5" />
              {post.author}
            </span>
            <span className="flex items-center gap-2 text-xs uppercase tracking-widest font-medium text-zinc-900 dark:text-zinc-100 group-hover:text-zinc-500 dark:group-hover:text-zinc-400 transition-colors">
              Read more
              <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
            </span>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
