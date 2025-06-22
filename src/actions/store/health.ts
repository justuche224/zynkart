"use server";

import db from "@/db";
import { count, eq } from "drizzle-orm";
import { bank, product, shippingZone, store } from "@/db/schema";

interface HealthCheck {
  hasAccountDetails: boolean;
  hasProducts: boolean;
  hasShippingZones: boolean;
  totalProducts: number;
  hasOwnerDoneKYC: boolean;
  customised: boolean;
}

export interface StoreHealth extends HealthCheck {
  healthScore: number;
  recommendations: {
    info: string;
    link: string;
  }[];
}

const getRecommendations = (health: HealthCheck, slug: string) => {
  const recommendations: { info: string; link: string }[] = [];

  if (!health.hasAccountDetails) {
    recommendations.push({
      info: "Add your bank account details to receive payments from customers",
      link: `/merchant/stores/${slug}/settings/bank`,
    });
  }

  if (!health.hasProducts) {
    recommendations.push({
      info: "Add your first product to start selling",
      link: `/merchant/stores/${slug}/products/new`,
    });
  } else if (health.totalProducts < 10) {
    recommendations.push({
      info: "Add more products to increase your store's visibility",
      link: `/merchant/stores/${slug}/products/new`,
    });
  }

  if (!health.hasShippingZones) {
    recommendations.push({
      info: "Set up shipping zones to define delivery fees for different locations",
      link: `/merchant/stores/${slug}/settings/shipping-and-delivery`,
    });
  }

  if (!health.hasOwnerDoneKYC) {
    recommendations.push({
      info: "Complete your KYC verification to enable checkout for customers",
      link: `/merchant/stores/${slug}/settings/verification`,
    });
  }

  if (!health.customised) {
    recommendations.push({
      info: "Customize your store with a logo, banner, and theme to attract more customers",
      link: `/merchant/stores/${slug}/customise`,
    });
  }

  return recommendations;
};

const calculateHealthScore = (health: HealthCheck) => {
  let score = 0;

  if (health.hasAccountDetails) score += 20;
  if (health.hasProducts) score += 15;
  if (health.hasShippingZones) score += 15;
  if (health.totalProducts >= 10) score += 10;
  if (health.hasOwnerDoneKYC) score += 20;
  if (health.customised) score += 20;

  return score > 100 ? 100 : score;
};

export const getStoreHealth = async (
  storeId: string,
  storeSlug: string
): Promise<StoreHealth> => {
  const [bankDetails, productCountResult, shippingZoneDetails, storeDetails] =
    await Promise.all([
      db.query.bank.findFirst({
        where: eq(bank.storeId, storeId),
        columns: { id: true },
      }),
      db
        .select({ value: count() })
        .from(product)
        .where(eq(product.storeId, storeId)),
      db.query.shippingZone.findFirst({
        where: eq(shippingZone.storeId, storeId),
        columns: { id: true },
      }),
      db.query.store.findFirst({
        where: eq(store.id, storeId),
        columns: { logoUrl: true },
      }),
    ]);

  const totalProducts = productCountResult[0].value;

  const healthCheck: HealthCheck = {
    hasAccountDetails: !!bankDetails,
    totalProducts: totalProducts,
    hasProducts: totalProducts > 0,
    hasShippingZones: !!shippingZoneDetails,
    // TODO: check if owner has done kyc
    hasOwnerDoneKYC: true,
    customised: !!storeDetails?.logoUrl,
  };

  const healthScore = calculateHealthScore(healthCheck);
  const recommendations = getRecommendations(healthCheck, storeSlug);

  return {
    ...healthCheck,
    healthScore,
    recommendations,
  };
};
