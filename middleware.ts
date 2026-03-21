import { authMiddleware } from "@civic/auth/nextjs/middleware";

export default authMiddleware();

export const config = {
  matcher: [
    // Protect export routes — require auth for Google exports
    "/api/export/:path*",
    // Skip Next.js internals and static assets
    "/((?!_next|favicon.ico|sitemap.xml|robots.txt|api/plan-trip|api/auth|.*\\.jpg|.*\\.png|.*\\.svg|.*\\.gif).*)",
  ],
};
