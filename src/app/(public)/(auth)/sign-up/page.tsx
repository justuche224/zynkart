import { RegisterForm } from "@/components/auth/sign-up";
import { info } from "@/constants";
import { serverAuth } from "@/lib/server-auth";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import Image from "next/image";

export const metadata: Metadata = {
  title: `Create ${info.name} Account`,
};

const page = async () => {
  const data = await serverAuth();
  if (data?.session) {
    return redirect(info.defaultRedirect);
  }
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <RegisterForm />
            {/* we are not onboarding user currently
            <h1 className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-pink-600 text-2xl font-bold text-center">
              Hey, Happy you want to try out zynkart but we are currently not
              onboarding users.
            </h1>
            <p className="text-center text-muted-foreground">
              Follow us on social medias to be the first to know when sign up is
              available!
            </p> */}
          </div>
        </div>
      </div>
      <div className="relative hidden bg-muted lg:block">
        <Image
          src="/images/hero-image.png"
          alt="Image"
          width={500}
          height={500}
          className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
        />
      </div>
    </div>
  );
};

export default page;
