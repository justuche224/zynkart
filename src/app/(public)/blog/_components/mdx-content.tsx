"use client";

import { MDXRemote, MDXRemoteSerializeResult } from "next-mdx-remote";
import Image from "next/image";
import Link from "next/link";

// Custom components for MDX
const components = {
  h1: ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h1
      className="text-3xl md:text-4xl font-bold mt-10 mb-6 text-zinc-900 dark:text-white"
      {...props}
    >
      {children}
    </h1>
  ),
  h2: ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h2
      className="text-2xl md:text-3xl font-bold mt-10 mb-4 text-zinc-900 dark:text-white scroll-mt-20"
      {...props}
    >
      {children}
    </h2>
  ),
  h3: ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h3
      className="text-xl md:text-2xl font-semibold mt-8 mb-3 text-zinc-900 dark:text-white"
      {...props}
    >
      {children}
    </h3>
  ),
  h4: ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h4
      className="text-lg md:text-xl font-semibold mt-6 mb-2 text-zinc-900 dark:text-white"
      {...props}
    >
      {children}
    </h4>
  ),
  p: ({ children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p
      className="text-zinc-700 dark:text-zinc-300 leading-relaxed mb-4"
      {...props}
    >
      {children}
    </p>
  ),
  a: ({
    href,
    children,
    ...props
  }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => {
    const isExternal = href?.startsWith("http");
    if (isExternal) {
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-emerald-600 dark:text-emerald-400 hover:underline font-medium"
          {...props}
        >
          {children}
        </a>
      );
    }
    return (
      <Link
        href={href || "#"}
        className="text-emerald-600 dark:text-emerald-400 hover:underline font-medium"
        {...props}
      >
        {children}
      </Link>
    );
  },
  ul: ({ children, ...props }: React.HTMLAttributes<HTMLUListElement>) => (
    <ul
      className="list-disc list-inside space-y-2 mb-4 text-zinc-700 dark:text-zinc-300 ml-4"
      {...props}
    >
      {children}
    </ul>
  ),
  ol: ({ children, ...props }: React.HTMLAttributes<HTMLOListElement>) => (
    <ol
      className="list-decimal list-inside space-y-2 mb-4 text-zinc-700 dark:text-zinc-300 ml-4"
      {...props}
    >
      {children}
    </ol>
  ),
  li: ({ children, ...props }: React.LiHTMLAttributes<HTMLLIElement>) => (
    <li className="leading-relaxed" {...props}>
      {children}
    </li>
  ),
  blockquote: ({
    children,
    ...props
  }: React.BlockquoteHTMLAttributes<HTMLQuoteElement>) => (
    <blockquote
      className="border-l-4 border-emerald-500 pl-4 py-2 my-6 bg-emerald-50/50 dark:bg-emerald-950/20 text-zinc-700 dark:text-zinc-300 italic"
      {...props}
    >
      {children}
    </blockquote>
  ),
  code: ({
    children,
    className,
    ...props
  }: React.HTMLAttributes<HTMLElement>) => {
    const isInline = !className?.includes("language-");
    if (isInline) {
      return (
        <code
          className="px-1.5 py-0.5 bg-zinc-100 dark:bg-zinc-800 rounded text-sm font-mono text-emerald-600 dark:text-emerald-400"
          {...props}
        >
          {children}
        </code>
      );
    }
    return (
      <code className={className} {...props}>
        {children}
      </code>
    );
  },
  pre: ({ children, ...props }: React.HTMLAttributes<HTMLPreElement>) => (
    <pre
      className="overflow-x-auto p-4 my-6 bg-zinc-900 dark:bg-zinc-950 rounded-xl text-sm"
      {...props}
    >
      {children}
    </pre>
  ),
  table: ({
    children,
    ...props
  }: React.TableHTMLAttributes<HTMLTableElement>) => (
    <div className="overflow-x-auto my-6">
      <table className="w-full border-collapse text-sm" {...props}>
        {children}
      </table>
    </div>
  ),
  thead: ({
    children,
    ...props
  }: React.HTMLAttributes<HTMLTableSectionElement>) => (
    <thead className="bg-zinc-100 dark:bg-zinc-800" {...props}>
      {children}
    </thead>
  ),
  th: ({
    children,
    ...props
  }: React.ThHTMLAttributes<HTMLTableCellElement>) => (
    <th
      className="px-4 py-3 text-left font-semibold text-zinc-900 dark:text-white border-b border-zinc-200 dark:border-zinc-700"
      {...props}
    >
      {children}
    </th>
  ),
  td: ({
    children,
    ...props
  }: React.TdHTMLAttributes<HTMLTableCellElement>) => (
    <td
      className="px-4 py-3 text-zinc-700 dark:text-zinc-300 border-b border-zinc-200 dark:border-zinc-800"
      {...props}
    >
      {children}
    </td>
  ),
  hr: (props: React.HTMLAttributes<HTMLHRElement>) => (
    <hr
      className="my-8 border-t border-zinc-200 dark:border-zinc-800"
      {...props}
    />
  ),
  strong: ({ children, ...props }: React.HTMLAttributes<HTMLElement>) => (
    <strong className="font-semibold text-zinc-900 dark:text-white" {...props}>
      {children}
    </strong>
  ),
  em: ({ children, ...props }: React.HTMLAttributes<HTMLElement>) => (
    <em className="italic" {...props}>
      {children}
    </em>
  ),
  img: ({ src, alt }: React.ImgHTMLAttributes<HTMLImageElement>) => (
    <span className="block my-6">
      <Image
        src={typeof src === "string" ? src : ""}
        alt={alt || ""}
        width={800}
        height={450}
        className="rounded-xl w-full"
      />
    </span>
  ),
};

interface MDXContentProps {
  source: MDXRemoteSerializeResult;
}

export function MDXContent({ source }: MDXContentProps) {
  return (
    <article className="prose-custom">
      <MDXRemote {...source} components={components} />
    </article>
  );
}
