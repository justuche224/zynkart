"use client";

import React from "react";
import { motion } from "framer-motion";
import { Plus, Box, ChevronRight, Trash2, Pen, Loader } from "lucide-react";
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
import { deleteCategory } from "@/actions/category/delete";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface Props {
  categories: {
    id: string;
    name: string;
    slug: string;
    productCount: number;
    imageUrl: string | null;
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

const Categories = ({ categories, storeSlug, merchantId }: Props) => {
  const [initialCategories, setInitialCategories] = React.useState(categories);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const router = useRouter();

  const handleDelete = async (categoryId: string) => {
    setIsDeleting(true);
    const result = await deleteCategory(categoryId, storeSlug, merchantId);
    if (result.error) {
      toast.error(result.error);
    } else {
      setInitialCategories((prev) =>
        prev.filter((category) => category.id !== categoryId)
      );
      toast.success("Category deleted successfully");
    }
    setIsDeleting(false);
  };

  return (
    <div className="mt-10 w-full px-5 max-w-7xl mx-auto space-y-8">
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
          <h1 className="text-3xl font-bold">Categories</h1>
          <p className="text-muted-foreground mt-1">
            Organize your products into easily manageable categories
          </p>
        </div>
        <Link
          href={`categories/new`}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-xs md:text-sm lg:text-base"
        >
          New Category <Plus size={16} />
        </Link>
      </motion.div>

      {initialCategories.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center space-y-4 my-32"
        >
          <Box className="w-12 h-12 text-muted-foreground" />
          <h3 className="text-xl font-semibold">No categories yet</h3>
          <p className="text-muted-foreground text-center max-w-md">
            Create your first category to start organizing your products
          </p>
          <Link
            href="categories/new"
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Create Category <Plus size={16} />
          </Link>
        </motion.div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {initialCategories.map((category) => (
            <motion.div key={category.id} variants={itemVariants}>
              <Card
                className={`group hover:shadow-lg transition-all duration-300 bg-sidebar ${
                  category.imageUrl ? "bg-cover bg-center hover:scale-105" : ""
                }`}
                style={{
                  backgroundImage: category.imageUrl
                    ? `linear-gradient(to top, rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.4)), url(${category.imageUrl})`
                    : "none",
                }}
              >
                <CardHeader>
                  <CardTitle
                    className={`flex justify-between items-center ${
                      category.imageUrl ? "text-white" : ""
                    }`}
                  >
                    <span>{category.name}</span>
                    <AlertDialog>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() =>
                            router.push(
                              `/merchant/stores/${storeSlug}/categories/${category.slug}/edit`
                            )
                          }
                        >
                          <Pen
                            className={`w-4 h-4 ${
                              category.imageUrl
                                ? "text-gray-200"
                                : "text-muted-foreground"
                            }`}
                          />
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
                            This will permanently delete the category
                            <span className="font-bold text-destructive">
                              &quot;
                              {category.name}&quot;
                            </span>{" "}
                            and remove it from all associated products.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(category.id)}
                            className="bg-destructive hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </CardTitle>
                  <CardDescription
                    className={category.imageUrl ? "text-gray-300" : ""}
                  >
                    {category.productCount} product
                    {category.productCount !== 1 ? "s" : ""}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link
                    href={`categories/${category.slug}`}
                    className={`flex items-center justify-between text-sm transition-colors ${
                      category.imageUrl
                        ? "text-gray-300 hover:text-white"
                        : "text-muted-foreground hover:text-primary"
                    }`}
                  >
                    <span>View details</span>
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

export default Categories;
