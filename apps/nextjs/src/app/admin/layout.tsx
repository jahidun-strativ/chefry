import { ClerkProvider } from "@clerk/nextjs";

import { env } from "../../env.mjs";

// Force dynamic rendering to prevent static generation
export const dynamic = "force-dynamic";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <ClerkProvider publishableKey={env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}>{children}</ClerkProvider>;
}
