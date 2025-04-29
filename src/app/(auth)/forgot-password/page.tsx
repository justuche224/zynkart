import { ForgotPasswordForm } from '@/components/auth/forgot-password';
import { info } from '@/constants';
import { authClient } from '@/lib/auth-client';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import React from 'react'

export const metadata: Metadata = {
    title: `Reset you ${info.name} account password`,
};

const page = async () => {
    const { data } = await authClient.getSession();
    if (data?.session) {
        return redirect(info.defaultRedirect);
    }
    return (
        <div className="grid min-h-svh lg:grid-cols-2">
            <div className="flex flex-col gap-4 p-6 md:p-10">
                <div className="flex flex-1 items-center justify-center">
                    <div className="w-full max-w-xs">
                        <ForgotPasswordForm />
                    </div>
                </div>
            </div>
            <div className="relative hidden bg-muted lg:block">
                <img
                    src="/images/Astronaut-suit-pana.png"
                    alt="Image"
                    className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
                />
            </div>
        </div>
    );
}

export default page