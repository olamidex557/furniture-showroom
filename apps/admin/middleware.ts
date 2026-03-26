import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isProtectedRoute = createRouteMatcher([
  "/admin(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  if (!isProtectedRoute(req)) {
    return;
  }

  const { userId, sessionClaims } = await auth.protect();

  if (!userId) {
    return;
  }

  const metadata = sessionClaims?.public_metadata as
    | { role?: string }
    | undefined;

  const role = metadata?.role;

  const allowedRoles = ["admin", "super_admin"];

  if (!role || !allowedRoles.includes(role)) {
    return NextResponse.redirect(new URL("/", req.url));
  }
});

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)", "/(api|trpc)(.*)"],
};