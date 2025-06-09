import { Button } from "@/components/ui/button";
import db from "@/db";
import { banner, store } from "@/db/schema";
import { serverAuth } from "@/lib/server-auth";
import { and, eq } from "drizzle-orm";
import Link from "next/link";
import { redirect } from "next/navigation";
import BannerDemoDefaultTemplate from "./_components/banner-demo";

const page = async ({ params }: { params: Promise<{ storeSlug: string }> }) => {
  const { storeSlug } = await params;
  const session = await serverAuth();
  if (!session?.session || !session.user) {
    return redirect(
      `/sign-in?callbackURL=/merchant/stores/${storeSlug}/banners`
    );
  }

  const storeInfo = await db.query.store.findFirst({
    where: and(
      eq(store.slug, storeSlug),
      eq(store.merchantId, session.user.id)
    ),
    columns: {
      id: true,
      name: true,
      slug: true,
      template: true,
    },
  });
  if (!storeInfo) {
    return redirect("/merchant");
  }

  const banners = await db
    .select()
    .from(banner)
    .where(eq(banner.storeId, storeInfo.id));

  if (banners.length === 0) {
    return (
      <div className="container mx-auto p-4 flex flex-col items-center justify-center mt-28 gap-4">
        <h1 className="text-2xl font-bold">No banners found</h1>
        <p className="text-muted-foreground">
          You don&apos;t have any banners for this store.
        </p>
        <Button asChild>
          <Link href={`/merchant/stores/${storeSlug}/banners/new`}>
            Add Banner
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <section className="container mx-auto p-4 ">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Banners</h1>
          <p className="text-muted-foreground text-sm md:text-base">
            Manage your banners for your store.
          </p>
        </div>
        <div>
            <Button asChild>
                <Link href={`/merchant/stores/${storeSlug}/banners/new`}>
                    Add Banner
                </Link>
            </Button>
        </div>
      </div>
      {/* TODO: add other templates */}
      <BannerDemoDefaultTemplate banners={banners} storeSlug={storeSlug} />
    </section>
  );
};

export default page;
