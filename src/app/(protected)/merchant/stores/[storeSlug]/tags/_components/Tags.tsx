"use client";

import React from "react";
import { motion } from "framer-motion";
import { Plus, Tag, ChevronRight, Trash2, Pen, Loader } from "lucide-react";
import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { formatDate } from "@/lib/date-formatter";

interface Props {
  tags: {
    id: string;
    name: string;
    slug: string;
    productCount: number;
    createdAt: Date;
    updatedAt: Date;
  }[];
  storeSlug: string;
  merchantId: string;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
    },
  },
};

const Tags = ({ tags, storeSlug, merchantId }: Props) => {
  const [initialTags, setInitialTags] = React.useState(tags);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const router = useRouter();

  const handleDelete = async (tagId: string) => {
    setIsDeleting(true);
    // TODO: Create deleteTag action
    try {
      // Placeholder for delete action
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setInitialTags((prev) => prev.filter((tag) => tag.id !== tagId));
      toast.success("Tag deleted successfully");
    } catch (error) {
      toast.error("Failed to delete tag");
    }
    setIsDeleting(false);
  };

  return (
    <div className="mt-20 w-full px-5 max-w-7xl mx-auto space-y-8">
      {isDeleting && (
        <div className="w-full h-screen flex items-center justify-center fixed top-0 left-0 bg-sidebar/50 z-50 backdrop-blur-sm">
          <Loader className="animate-spin" color="blue" size={60} />
        </div>
      )}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center"
      >
        <div>
          <h1 className="text-3xl font-bold">Tags</h1>
          <p className="text-muted-foreground mt-1">
            Manage tags to help customers discover your products
          </p>
        </div>
        <Link
          href={`tags/new`}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-xs md:text-sm lg:text-base"
        >
          New Tag <Plus size={16} />
        </Link>
      </motion.div>

      {initialTags.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center space-y-4 my-32"
        >
          <Tag className="w-12 h-12 text-muted-foreground" />
          <h3 className="text-xl font-semibold">No tags yet</h3>
          <p className="text-muted-foreground text-center max-w-md">
            Create your first tag to help customers find your products more
            easily
          </p>
          <Link
            href="tags/new"
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Create Tag <Plus size={16} />
          </Link>
        </motion.div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {initialTags.map((tag) => (
            <motion.div key={tag.id} variants={itemVariants}>
              <Card className="group hover:shadow-lg transition-all duration-300 bg-sidebar">
                <CardHeader>
                  <CardTitle className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{tag.name}</Badge>
                    </div>
                    <AlertDialog>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() =>
                            router.push(
                              `/merchant/stores/${storeSlug}/tags/${tag.slug}/edit`
                            )
                          }
                        >
                          <Pen className="w-4 h-4 text-muted-foreground" />
                        </Button>

                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </AlertDialogTrigger>
                      </div>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete the tag
                            <span className="font-bold text-destructive">
                              &quot;{tag.name}&quot;
                            </span>{" "}
                            and remove it from all associated products.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(tag.id)}
                            className="bg-destructive hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </CardTitle>
                  <CardDescription>
                    {tag.productCount} product
                    {tag.productCount !== 1 ? "s" : ""}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="text-xs text-muted-foreground">
                    Created: {formatDate(tag.createdAt, "MMM dd, yyyy")}
                  </div>
                  <Link
                    href={`tags/${tag.slug}`}
                    className="flex items-center justify-between text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    <span>View products</span>
                    <ChevronRight
                      size={16}
                      className="group-hover:translate-x-1 transition-transform"
                    />
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
};

export default Tags;
