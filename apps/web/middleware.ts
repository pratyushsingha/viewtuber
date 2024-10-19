import {
  authMiddleware,
  clerkClient,
  redirectToSignIn,
} from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const publicRoutes = [
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/webhooks/user",
];

export default authMiddleware({
  publicRoutes,
  async afterAuth(auth, request) {
    if (!auth.userId && !publicRoutes.includes(request.nextUrl.pathname)) {
      return NextResponse.redirect(new URL("/sign-in", request.url));
    }

    if (auth.userId) {
      try {
        const user = await clerkClient.users.getUser(auth.userId);
        console.log(user);
        const role = user.publicMetadata.role as string | undefined;

        if (role === "youtuber" && request.nextUrl.pathname === "/dashboard") {
          return NextResponse.redirect(
            new URL("/youtube/dashboard", request.url)
          );
        }
        if (
          role !== "youtuber" &&
          request.nextUrl.pathname.startsWith("/youtube")
        ) {
          return NextResponse.redirect(new URL("/dashboard", request.url));
        }

        if (publicRoutes.includes(request.nextUrl.pathname)) {
          return NextResponse.redirect(
            new URL(
              role === "youtuber" ? "/youtube/dashboard" : "/dashboard",
              request.url
            )
          );
        }
        return NextResponse.next();
      } catch (error) {
        console.error("Error fetching user", error);
        return NextResponse.redirect(new URL("/error", request.url));
      }
    }
  },
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/api/:path*",
  ],
};
