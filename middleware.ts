import { clerkMiddleware } from '@clerk/nextjs/server';
export default clerkMiddleware();
export const config = {
  matcher: [
    // Serve all routes except Next internals
    "/((?!_next|static|favicon.ico).*)",
    "/(api|trpc)(.*)"
  ],
};
