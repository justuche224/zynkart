"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface GlobalSearchProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  bgColor?: string;
}

const GlobalSearch = ({
  isOpen,
  setIsOpen,
  bgColor = "bg-background/90",
}: GlobalSearchProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const router = useRouter();

  useEffect(() => {
    const storedHistory = localStorage.getItem("searchHistory");
    if (storedHistory) {
      setSearchHistory(JSON.parse(storedHistory));
    }
  }, []);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, setIsOpen]);

  const handleSearch = () => {
    if (searchQuery.trim().length === 0) {
      return;
    }
    const newHistory = [
      searchQuery,
      ...searchHistory.filter((item) => item !== searchQuery),
    ].slice(0, 5);
    setSearchHistory(newHistory);
    localStorage.setItem("searchHistory", JSON.stringify(newHistory));
    router.push(`/search?q=${searchQuery}`);
    setIsOpen(false);
  };

  const handleRecentSearchClick = (item: string) => {
    setSearchQuery(item);
    router.push(`/search?q=${item}`);
    setIsOpen(false);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch();
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className={`fixed top-0 z-[999] left-0 h-screen w-full ${bgColor} backdrop-blur-lg`}
      onClick={() => setIsOpen(false)}
    >
      <div
        className="flex flex-col items-center justify-center mt-20 max-w-2xl mx-auto px-4 gap-2"
        onClick={(e) => e.stopPropagation()}
      >
        <h1 className="text-2xl font-bold">
          Search products, services, and more
        </h1>
        <form
          onSubmit={handleFormSubmit}
          className="w-full max-w-md flex flex-col gap-2 items-center"
        >
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search..."
            className="w-full"
            autoFocus
          />
          <Button type="submit">Search</Button>
        </form>
        {searchHistory.length > 0 && (
          <div className="mt-4 w-full max-w-md">
            <h2 className="text-sm font-semibold text-muted-foreground text-center mb-2">
              Recent Searches
            </h2>
            <div className="flex flex-wrap gap-2 justify-center">
              {searchHistory.map((item, index) => (
                <Button
                  key={index}
                  variant="secondary"
                  className="cursor-pointer"
                  onClick={() => handleRecentSearchClick(item)}
                >
                  {item}
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GlobalSearch;
