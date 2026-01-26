import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

export const runtime = "nodejs";

// Define public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
  "/",
  "/api/(.*)",
  "/image-cropper/(.*)",
  "/preview-app",
  "/preview-staging-app",
  "/terms",
  "/delete-account",
  "/star-sign-up",
  "/post/(.*)",
  "/profile/(.*)",
  "/checkout/(.*)",
  "/icon",
  "/admin/sign-in(.*)",
  "/admin/sign-up(.*)",
]);

export default clerkMiddleware(async (auth, request) => {
  // Protect all routes that are not public
  if (!isPublicRoute(request)) {
    const signInUrl = new URL("/admin/sign-in", request.url);
    await auth.protect({
      unauthenticatedUrl: signInUrl.toString(),
    });
  }
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
