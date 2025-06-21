import "server-only"
import db from "@/db";
import { storeVisit, store } from "@/db/schema";
import { eq, and, gte } from "drizzle-orm";
import { sql } from "drizzle-orm";

interface StoreAnalyticsProps {
  storeSlug: string;
  days?: number;
}

export default async function StoreAnalytics({
  storeSlug,
  days = 7,
}: StoreAnalyticsProps) {
  try {
    // Get store ID
    const storeRecord = await db
      .select({ id: store.id })
      .from(store)
      .where(eq(store.slug, storeSlug))
      .limit(1);

    if (!storeRecord.length) {
      return <div>Store not found</div>;
    }

    const dateFrom = new Date();
    dateFrom.setDate(dateFrom.getDate() - days);

    // Get recent visits
    const recentVisits = await db
      .select()
      .from(storeVisit)
      .where(
        and(
          eq(storeVisit.storeId, storeRecord[0].id),
          gte(storeVisit.createdAt, dateFrom)
        )
      )
      .orderBy(sql`${storeVisit.createdAt} DESC`)
      .limit(100);

    // Get device stats
    const deviceStats = await db
      .select({
        device: storeVisit.device,
        count: sql<number>`count(*)::int`,
      })
      .from(storeVisit)
      .where(
        and(
          eq(storeVisit.storeId, storeRecord[0].id),
          gte(storeVisit.createdAt, dateFrom)
        )
      )
      .groupBy(storeVisit.device);

    // Get browser stats
    const browserStats = await db
      .select({
        browser: storeVisit.browser,
        count: sql<number>`count(*)::int`,
      })
      .from(storeVisit)
      .where(
        and(
          eq(storeVisit.storeId, storeRecord[0].id),
          gte(storeVisit.createdAt, dateFrom)
        )
      )
      .groupBy(storeVisit.browser);

    return (
      <div className="p-6 bg-white rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-6">
          Store Analytics (Last {days} days)
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-800">
              Total Visits
            </h3>
            <p className="text-3xl font-bold text-blue-600">
              {recentVisits.length}
            </p>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-green-800">Unique IPs</h3>
            <p className="text-3xl font-bold text-green-600">
              {
                new Set(recentVisits.map((v) => v.ipAddress).filter(Boolean))
                  .size
              }
            </p>
          </div>

          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-purple-800">
              Mobile Visits
            </h3>
            <p className="text-3xl font-bold text-purple-600">
              {recentVisits.filter((v) => v.device === "mobile").length}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">Device Breakdown</h3>
            <div className="space-y-2">
              {deviceStats.map((stat) => (
                <div
                  key={stat.device}
                  className="flex justify-between items-center p-2 bg-gray-50 rounded"
                >
                  <span className="capitalize">{stat.device || "Unknown"}</span>
                  <span className="font-semibold">{stat.count}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Browser Breakdown</h3>
            <div className="space-y-2">
              {browserStats.map((stat) => (
                <div
                  key={stat.browser}
                  className="flex justify-between items-center p-2 bg-gray-50 rounded"
                >
                  <span className="capitalize">
                    {stat.browser || "Unknown"}
                  </span>
                  <span className="font-semibold">{stat.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4">Recent Visits</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Time
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Device
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Browser
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    OS
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Country
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {recentVisits.slice(0, 10).map((visit) => (
                  <tr key={visit.id}>
                    <td className="px-4 py-2 text-sm text-gray-900">
                      {visit.createdAt.toLocaleString()}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-900 capitalize">
                      {visit.device || "Unknown"}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-900 capitalize">
                      {visit.browser || "Unknown"}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-900 capitalize">
                      {visit.os || "Unknown"}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-900">
                      {visit.country || "Unknown"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error loading analytics:", error);
    return <div>Error loading analytics</div>;
  }
}
