"use client";

import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

interface PageLayoutProps {
  backLink: string;
  backText?: string;
  title: string;
  description?: string;
  children: React.ReactNode;
}

const PageLayout = ({
  backLink,
  backText = "Back",
  title,
  description,
  children,
}: PageLayoutProps) => {
  return (
    <div className="min-h-screen bg-background">
      <div className="w-full max-w-3xl mx-auto p-4 pt-20 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Link
            href={backLink}
            className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {backText}
          </Link>
          <Card className="w-full">
            <CardHeader>
              <CardTitle>{title}</CardTitle>
              {description && <CardDescription>{description}</CardDescription>}
            </CardHeader>
            <CardContent>{children}</CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default PageLayout;
