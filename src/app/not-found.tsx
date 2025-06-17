import Link from "next/link";
import { Button } from "@/components/ui/button";

const NotFound = async () => {
  return (
    <section className="min-h-screen">
      <section className="section-sm text-center">
        <div className="container">
          <div className="row justify-center">
            <div className="sm:col-10 md:col-8 lg:col-6">
              <span className="text-[8rem] block font-bold text-text-dark dark:text-darkmode-text-dark">
                404
              </span>
              <h1 className="h2 mb-4">Page not found</h1>
              <div className="content">
                <p>
                  The page you are looking for might have been removed, had its
                  name changed, or is temporarily unavailable.
                </p>
              </div>
              <Button asChild className="mt-8">
                <Link href="/">
                  Back to home
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </section>
  );
};

export default NotFound;
