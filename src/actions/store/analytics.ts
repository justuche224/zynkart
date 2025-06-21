"use server";

import db from "@/db";
import { storeVisit, store } from "@/db/schema";
import { serverAuth } from "@/lib/server-auth";
import { eq } from "drizzle-orm";

interface VisitorData {
  storeSlug: string;
  userAgent?: string;
  ipAddress?: string;
  referrer?: string;
  country?: string;
  city?: string;
}

function parseUserAgent(userAgent: string | null) {
  if (!userAgent)
    return { device: "unknown", browser: "unknown", os: "unknown" };

  const ua = userAgent.toLowerCase();

  let device = "desktop";
  if (
    ua.includes("mobile") ||
    ua.includes("android") ||
    ua.includes("iphone")
  ) {
    device = "mobile";
  } else if (ua.includes("tablet") || ua.includes("ipad")) {
    device = "tablet";
  }

  let browser = "unknown";
  if (ua.includes("chrome") && !ua.includes("edg")) {
    browser = "chrome";
  } else if (ua.includes("firefox")) {
    browser = "firefox";
  } else if (ua.includes("safari") && !ua.includes("chrome")) {
    browser = "safari";
  } else if (ua.includes("edg")) {
    browser = "edge";
  } else if (ua.includes("opera")) {
    browser = "opera";
  }

  let os = "unknown";
  if (ua.includes("windows")) {
    os = "windows";
  } else if (ua.includes("mac")) {
    os = "macos";
  } else if (ua.includes("linux")) {
    os = "linux";
  } else if (ua.includes("android")) {
    os = "android";
  } else if (
    ua.includes("ios") ||
    ua.includes("iphone") ||
    ua.includes("ipad")
  ) {
    os = "ios";
  }

  return { device, browser, os };
}

export async function trackStoreVisit(visitorData: VisitorData) {
  try {
    const storeRecord = await db
      .select({ id: store.id })
      .from(store)
      .where(eq(store.slug, visitorData.storeSlug))
      .limit(1);

    if (!storeRecord.length) {
      console.warn(`Store not found for slug: ${visitorData.storeSlug}`);
      return;
    }

    const { device, browser, os } = parseUserAgent(
      visitorData.userAgent || null
    );

    await db.insert(storeVisit).values({
      storeId: storeRecord[0].id,
      storeSlug: visitorData.storeSlug,
      userAgent: visitorData.userAgent,
      ipAddress: visitorData.ipAddress,
      referrer: visitorData.referrer,
      country: visitorData.country,
      city: visitorData.city,
      device,
      browser,
      os,
    });

    console.log(`📊 Visit tracked for store: ${visitorData.storeSlug}`);
  } catch (error) {
    console.error("Error tracking store visit:", error);
  }
}

export async function getStoreAnalytics(storeSlug: string, days: number = 30) {
  const session = await serverAuth();

  if (!session) {
    return null;
  }

  try {
    const storeRecord = await db
      .select({ id: store.id })
      .from(store)
      .where(eq(store.slug, storeSlug))
      .limit(1);

    if (!storeRecord.length) {
      return null;
    }

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - days);

    const visits = await db
      .select()
      .from(storeVisit)
      .where(eq(storeVisit.storeId, storeRecord[0].id));

    return {
      totalVisits: visits.length,
    };
  } catch (error) {
    console.error("Error getting store analytics:", error);
    return null;
  }
}
