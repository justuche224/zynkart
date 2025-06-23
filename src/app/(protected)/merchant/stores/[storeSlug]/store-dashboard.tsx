"use client";

import React, { useState } from "react";
import { Download, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Metrics from "./_components/metrics";
import AdditionalMetrics from "./_components/additional-metrics";
import SalesChart from "./_components/sales-chart";
import CategoryPerformance from "./_components/category-performance";
import RecentOrders from "./_components/recent-orders";
import TopProducts from "./_components/top-products";
import Visitors from "./_components/visitors";
import StoreOverview from "@/components/store-overview";
import { type StoreHealth } from "@/actions/store/health";

interface StoreInfo {
  id: string;
  name: string;
  slug: string;
  email: string;
  phone: string;
  address: string;
}

const StoreDashboard = ({
  storeInfo,
  storeHealth,
}: {
  storeInfo: StoreInfo;
  storeHealth: StoreHealth;
}) => {
  const [timeRange, setTimeRange] = useState("7d");

  const getDaysFromTimeRange = (range: string) => {
    switch (range) {
      case "7d":
        return 7;
      case "30d":
        return 30;
      case "90d":
        return 90;
      default:
        return 7;
    }
  };

  return (
    <div className="min-h-screen bg-sidebar p-2 md:p-6">
      <div className="">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                {storeInfo.name}
              </h1>
            </div>
            <div className="flex items-center flex-col gap-2 md:flex-row md:space-x-4">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="border border-input rounded-lg px-3 py-2 text-sm bg-card w-full md:w-auto"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
              </select>
              <Button className="flex items-center w-full md:w-auto">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </div>

        {/* Store Health Overview - Show at top if not complete */}
        {storeHealth.healthScore < 100 && (
          <div className="mb-8">
            <StoreOverview health={storeHealth} />
          </div>
        )}

        {/* Metrics Grid */}
        <Metrics
          storeId={storeInfo.id}
          days={getDaysFromTimeRange(timeRange)}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Recent Orders */}
          <RecentOrders
            storeId={storeInfo.id}
            storeSlug={storeInfo.slug}
            days={getDaysFromTimeRange(timeRange)}
          />

          {/* Top Products */}
          <TopProducts
            storeId={storeInfo.id}
            storeSlug={storeInfo.slug}
            days={getDaysFromTimeRange(timeRange)}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Sales Chart */}
          <SalesChart
            storeId={storeInfo.id}
            days={getDaysFromTimeRange(timeRange)}
          />

          {/* Category Performance */}
          <CategoryPerformance
            storeId={storeInfo.id}
            days={getDaysFromTimeRange(timeRange)}
          />
        </div>

        {/* Additional Metrics */}
        <AdditionalMetrics
          storeId={storeInfo.id}
          days={getDaysFromTimeRange(timeRange)}
        />

        {/* Store Health Overview - Show at bottom if complete */}
        {storeHealth.healthScore === 100 && (
          <div className="mb-8">
            <StoreOverview health={storeHealth} />
          </div>
        )}

        {/* Visitor Analytics */}
        <div className="grid grid-cols-1 mb-8">
          <Visitors
            storeId={storeInfo.id}
            days={getDaysFromTimeRange(timeRange)}
          />
          {/* TODO:add country wise visitor traffic */}
        </div>
      </div>
    </div>
  );
};

export default StoreDashboard;
