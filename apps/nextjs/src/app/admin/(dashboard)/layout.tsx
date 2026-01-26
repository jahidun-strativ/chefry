import "@/styles/globals.css";

import type { StaticImageData } from "next/image";
import Image from "next/image";
import { currentUser } from "@clerk/nextjs/server";
import { SignOutButton } from "@clerk/nextjs";
import { LogOut } from "lucide-react";
import { customAlphabet } from "nanoid";

import { prisma } from "@startracker/db";

import AppBar from "@/components/app-bar";
import TabMenu from "@/components/tab-menu";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/toaster";
import logo from "@/assets/logo.svg";
import { ClientProviders } from "./providers";

const nanoid = customAlphabet("0123456789abcdefghijklmnopqrstuvwxyz", 8);

export const metadata = {
  title: "Star Tracker | Admin",
};

const NotAuthorized = () => {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center">
      <Image priority src={(logo as StaticImageData).src} alt="Logo" width={300} height={150} />
      <div className="mt-12 flex max-w-md flex-col items-center justify-center">
        <h1 className="text-center font-sans text-4xl font-bold">Not authorized</h1>
        <p className="mt-4 text-center font-sans text-lg text-slate-500">
          You are not authorized to view this page. Please contact an administrator if you believe this is an error.
        </p>
        <SignOutButton>
          <Button className="mt-6 text-lg" size="lg" variant="outline">
            <LogOut className="mr-2 h-6 w-6" />
            Sign out
          </Button>
        </SignOutButton>
      </div>
    </main>
  );
};

export default async function Layout(props: { children: React.ReactNode }) {
  const clerkUser = await currentUser();

  if (!clerkUser) {
    return <NotAuthorized />;
  }

  let user = await prisma.user.findUnique({
    where: {
      clerkId: clerkUser.id,
    },
  });

  // Auto-create user if they don't exist (for admin access)
  if (!user) {
    const email = clerkUser.emailAddresses?.[0]?.emailAddress ?? null;
    const clerkUsername = clerkUser.username;
    
    // Generate a username from Clerk username or email, or use a fallback
    let username: string = clerkUsername?.toLowerCase() ?? 
      (email ? email.split("@")[0]?.toLowerCase() ?? `admin_${clerkUser.id.slice(0, 8)}` : `admin_${clerkUser.id.slice(0, 8)}`);
    
    // Ensure username is valid (only lowercase letters, numbers, underscores, hyphens)
    username = username.replace(/[^a-z0-9_-]/g, "_");
    
    // Check if username is taken, if so append a suffix
    let finalUsername = username;
    let counter = 1;
    while (await prisma.user.findUnique({ where: { username: finalUsername } })) {
      finalUsername = `${username}_${counter}`;
      counter++;
    }

    user = await prisma.user.create({
      data: {
        username: finalUsername,
        clerkId: clerkUser.id,
        email,
        verificationReferenceNumber: nanoid(),
        privilegeLevel: "ADMIN", // Set as ADMIN for admin panel access
      },
    });
  }

  // if (user.privilegeLevel !== "ADMIN") {
  //   return <NotAuthorized />;
  // }

  return (
    <ClientProviders>
      <>
        <AppBar />
        <TabMenu />
        <main className="mx-auto w-full max-w-screen-xl px-6 py-8">{props.children}</main>
        <Toaster />
      </>
    </ClientProviders>
  );
}
