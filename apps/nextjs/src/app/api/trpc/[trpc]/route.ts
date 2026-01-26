/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-explicit-any */

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";

import { appRouter, createTRPCContext } from "@startracker/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";



// export API handler
const handler = async (req: NextRequest) => {
  const origin = req.headers.get("origin");

  // Handle preflight OPTIONS request
  if (req.method === "OPTIONS") {
    try {
      const corsHeaders: Record<string, string> = {
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With, X-Clerk-Auth",
        "Access-Control-Max-Age": "86400",
      };

      if (origin) {
        // Always echo back the origin if provided (required for credentials)
        corsHeaders["Access-Control-Allow-Origin"] = origin;
        corsHeaders["Access-Control-Allow-Credentials"] = "true";
      } else {
        // No origin header (some mobile apps) - use wildcard but no credentials
        corsHeaders["Access-Control-Allow-Origin"] = "*";
      }

      return new NextResponse(null, {
        status: 200,
        headers: corsHeaders,
      });
    } catch (error) {
      console.error("Error handling OPTIONS request:", error);
      return new NextResponse(null, {
        status: 200,
        headers: {
          "Access-Control-Allow-Origin": origin || "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With, X-Clerk-Auth",
        },
      });
    }
  }

  const clientIp =
    (req.headers.get("x-forwarded-for") || "").split(",").pop()?.trim() ||
    (((req as any).socket.remoteAddress as string | null) ?? "unknown");
  // const ip = ipAddress(req) ?? "unknown";
  // console.log("user ip", ip);
  
  const response = await fetchRequestHandler({
    endpoint: "/api/trpc",
    router: appRouter,
    req,
    createContext: () => {
      return createTRPCContext(clientIp);
    },
    onError: ({ error, path }) => {
      console.log("Error in tRPC handler on path", path);
      console.error(error);
    },
  });

  // Add CORS headers to the response
  if (origin) {
    // Always echo back the origin if provided (required for credentials)
    response.headers.set("Access-Control-Allow-Origin", origin);
    response.headers.set("Access-Control-Allow-Credentials", "true");
    response.headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With, X-Clerk-Auth");
  } else {
    // No origin header - use wildcard (but credentials won't work)
    response.headers.set("Access-Control-Allow-Origin", "*");
  }

  return response;
};

export { handler as GET, handler as POST, handler as OPTIONS };
