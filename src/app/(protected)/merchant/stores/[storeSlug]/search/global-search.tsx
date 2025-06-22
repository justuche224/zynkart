"use client";

import { useQuery } from "@tanstack/react-query";
import {
  globalSearch,
  type SearchResults,
} from "@/actions/store/global-search";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Package,
  FolderOpen,
  Tag,
  ShoppingCart,
  Users,
  Search,
  Loader2,
  AlertCircle,
  ExternalLink,
  TrendingUp,
  Clock,
} from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface StoreInfo {
  id: string;
  name: string;
  slug: string;
}

const GlobalSearch = ({
  storeInfo,
  searchQuery,
}: {
  storeInfo: StoreInfo;
  searchQuery: string;
}) => {
  const {
    data: searchResults,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["global-search", storeInfo.id, searchQuery],
    queryFn: () => globalSearch(searchQuery, storeInfo.id),
    enabled: !!searchQuery && searchQuery.trim().length >= 2,
    staleTime: 30000, // Cache for 30 seconds
    gcTime: 300000, // Keep in cache for 5 minutes
  });

  if (!searchQuery || searchQuery.trim().length < 2) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <Search className="mx-auto h-12 w-12 text-muted-foreground" />
          <h2 className="mt-4 text-lg font-semibold">Search your store</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Enter at least 2 characters to search products, categories, tags,
            orders, and customers.
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin" />
          <p className="mt-2 text-sm text-muted-foreground">
            Searching your store...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error instanceof Error
              ? error.message
              : "Something went wrong while searching."}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const hasResults =
    searchResults &&
    (searchResults.products.length > 0 ||
      searchResults.categories.length > 0 ||
      searchResults.tags.length > 0 ||
      searchResults.orders.length > 0 ||
      searchResults.customers.length > 0);

  if (!hasResults) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <Search className="mx-auto h-12 w-12 text-muted-foreground" />
          <h2 className="mt-4 text-lg font-semibold">No results found</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            No matches found for "{searchQuery}". Try adjusting your search
            terms.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Search Results</h1>
        <div className="flex items-center gap-2 mt-1">
          <p className="text-muted-foreground">
            Results for "{searchQuery}" in {storeInfo.name}
          </p>
          {searchResults && (
            <Badge variant="outline">
              {searchResults.totalResults} total results
            </Badge>
          )}
        </div>
      </div>

      {searchResults && (
        <div className="grid gap-8">
          {/* Products */}
          {searchResults.products.length > 0 && (
            <SearchSection
              title="Products"
              icon={<Package className="h-5 w-5" />}
              count={searchResults.products.length}
            >
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {searchResults.products.map((product) => (
                  <Card
                    key={product.id}
                    className="hover:shadow-md transition-shadow group"
                  >
                    <CardContent className="p-4">
                      <div className="flex gap-3">
                        {product.imageUrl && (
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="h-16 w-16 rounded-lg object-cover flex-shrink-0"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <Link
                              href={`/merchant/stores/${storeInfo.slug}/products/${product.slug}`}
                              className="font-medium hover:underline line-clamp-1 group-hover:text-primary transition-colors"
                            >
                              {product.name}
                            </Link>
                            {product.relevanceScore &&
                              product.relevanceScore >= 80 && (
                                <TrendingUp className="h-4 w-4 text-green-500 ml-2 flex-shrink-0" />
                              )}
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                            {product.description}
                          </p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="font-semibold">
                              ₦{(product.price / 100).toLocaleString()}
                            </span>
                            {product.categoryName && (
                              <Badge variant="secondary" className="text-xs">
                                {product.categoryName}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </SearchSection>
          )}

          {/* Categories */}
          {searchResults.categories.length > 0 && (
            <SearchSection
              title="Categories"
              icon={<FolderOpen className="h-5 w-5" />}
              count={searchResults.categories.length}
            >
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {searchResults.categories.map((category) => (
                  <Card
                    key={category.id}
                    className="hover:shadow-md transition-shadow group"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        {category.imageUrl ? (
                          <img
                            src={category.imageUrl}
                            alt={category.name}
                            className="h-12 w-12 rounded-lg object-cover flex-shrink-0"
                          />
                        ) : (
                          <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                            <FolderOpen className="h-6 w-6 text-muted-foreground" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <Link
                            href={`/merchant/stores/${storeInfo.slug}/categories/${category.slug}`}
                            className="font-medium hover:underline group-hover:text-primary transition-colors"
                          >
                            {category.name}
                          </Link>
                          <p className="text-sm text-muted-foreground">
                            {category.productCount} products
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </SearchSection>
          )}

          {/* Tags */}
          {searchResults.tags.length > 0 && (
            <SearchSection
              title="Tags"
              icon={<Tag className="h-5 w-5" />}
              count={searchResults.tags.length}
            >
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {searchResults.tags.map((tag) => (
                  <Card
                    key={tag.id}
                    className="hover:shadow-md transition-shadow group"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Tag className="h-6 w-6 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <Link
                            href={`/merchant/stores/${storeInfo.slug}/tags/${tag.slug}`}
                            className="font-medium hover:underline group-hover:text-primary transition-colors"
                          >
                            {tag.name}
                          </Link>
                          <p className="text-sm text-muted-foreground">
                            {tag.productCount} products
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </SearchSection>
          )}

          {/* Orders */}
          {searchResults.orders.length > 0 && (
            <SearchSection
              title="Orders"
              icon={<ShoppingCart className="h-5 w-5" />}
              count={searchResults.orders.length}
            >
              <div className="space-y-4">
                {searchResults.orders.map((order) => (
                  <Card
                    key={order.id}
                    className="hover:shadow-md transition-shadow"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-medium">
                              #{order.paymentReference}
                            </span>
                            <Badge
                              variant={
                                order.paymentStatus === "PAID"
                                  ? "default"
                                  : "secondary"
                              }
                            >
                              {order.paymentStatus}
                            </Badge>
                            <Badge
                              variant={
                                order.fulfillmentStatus === "DELIVERED"
                                  ? "default"
                                  : "outline"
                              }
                            >
                              {order.fulfillmentStatus}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                            <span>Customer: {order.customerName}</span>
                            <span>•</span>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatDistanceToNow(
                                new Date(order.createdAt)
                              )}{" "}
                              ago
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">
                            ₦{(order.total / 100).toLocaleString()}
                          </p>
                          <Link
                            href={`/merchant/stores/${storeInfo.slug}/orders`}
                            className="text-sm text-muted-foreground hover:underline inline-flex items-center gap-1"
                          >
                            View order <ExternalLink className="h-3 w-3" />
                          </Link>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </SearchSection>
          )}

          {/* Customers */}
          {searchResults.customers.length > 0 && (
            <SearchSection
              title="Customers"
              icon={<Users className="h-5 w-5" />}
              count={searchResults.customers.length}
            >
              <div className="grid gap-4 md:grid-cols-2">
                {searchResults.customers.map((customer) => (
                  <Card
                    key={customer.id}
                    className="hover:shadow-md transition-shadow group"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="flex-shrink-0">
                          <AvatarFallback>
                            {customer.name.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <Link
                            href={`/merchant/stores/${storeInfo.slug}/customers`}
                            className="font-medium hover:underline group-hover:text-primary transition-colors"
                          >
                            {customer.name}
                          </Link>
                          <p className="text-sm text-muted-foreground truncate">
                            {customer.email}
                          </p>
                          {customer.phone && (
                            <p className="text-sm text-muted-foreground">
                              {customer.phone}
                            </p>
                          )}
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-muted-foreground">
                              {customer.orderCount} orders
                            </span>
                            <span className="text-xs text-muted-foreground">
                              Joined{" "}
                              {formatDistanceToNow(
                                new Date(customer.createdAt)
                              )}{" "}
                              ago
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </SearchSection>
          )}
        </div>
      )}
    </div>
  );
};

function SearchSection({
  title,
  icon,
  count,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        {icon}
        <h2 className="text-lg font-semibold">{title}</h2>
        <Badge variant="outline">{count}</Badge>
      </div>
      <Separator />
      {children}
    </div>
  );
}

export default GlobalSearch;
