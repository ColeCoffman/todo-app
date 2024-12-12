import { NextRequest, NextResponse } from "next/server";
import { decrypt } from "./lib/session";
import { cookies } from "next/headers";

const protectedRoutes = ["/dashboard"];
const publicRoutes = ["/login", "/register"];

export default async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const isProtectedRoute = protectedRoutes.includes(path);
  const isPublicRoute = publicRoutes.includes(path);

  try {
    // Get cookie from the request instead of using cookies()
    const cookie = req.cookies.get("session")?.value;
    const session = cookie ? await decrypt(cookie) : null;

    // console.log("Cookie:", cookie);
    // console.log("Decrypted session:", session);

    if (isProtectedRoute && !session?.userId) {
      //   console.log("Redirecting to login - no valid session");
      return NextResponse.redirect(new URL("/login", req.url));
    }

    if (isPublicRoute && session?.userId) {
      //   console.log("Redirecting to dashboard - user already logged in");
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    return NextResponse.next();
  } catch (error) {
    console.error("Middleware error:", error);
    // On session error, clear the cookie and redirect to login
    if (isProtectedRoute) {
      const response = NextResponse.redirect(new URL("/login", req.url));
      response.cookies.delete("session");
      return response;
    }
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
