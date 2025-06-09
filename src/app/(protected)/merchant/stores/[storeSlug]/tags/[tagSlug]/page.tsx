import db from "@/db";
import { tag, store } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import TagInfo from "./_components/TagInfo";
import { Tag, Plus } from "lucide-react";
import Link from "next/link";
import { serverAuth } from "@/lib/server-auth";

export default async function TagPage({
  params,
}: {
  params: Promise<{ storeSlug: string; tagSlug: string }>;
}) {
  const { storeSlug, tagSlug } = await params;
  const merchant = await serverAuth();
  if (!merchant?.user) return redirect("/auth/sign-in");

  const storeData = await db.query.store.findFirst({
    where: and(
      eq(store.slug, storeSlug),
      eq(store.merchantId, merchant.user.id)
    ),
  });

  if (!storeData) {
    return redirect("/merchant");
  }

  const tagData = await db.query.tag.findFirst({
    where: and(eq(tag.slug, tagSlug), eq(tag.storeId, storeData.id)),
  });

  if (!tagData) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 my-32">
        <Tag className="w-12 h-12 text-muted-foreground" />
        <h3 className="text-xl font-semibold">Tag not found</h3>
        <p className="text-muted-foreground text-center max-w-md">
          Create a tag to help customers discover your products
        </p>
        <Link
          href="tags/new"
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          Create Tag <Plus size={16} />
        </Link>
      </div>
    );
  }

  return <TagInfo tag={tagData} storeSlug={storeSlug} />;
}
