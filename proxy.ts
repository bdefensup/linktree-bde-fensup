import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // --- Admin Redirection Logic ---
  const isAdminRoot = pathname === "/admin";
  const isAdminLogin = pathname === "/admin/login";
  const isAdminRoute = pathname.startsWith("/admin");

  const sessionCookie =
    request.cookies.get("better-auth.session_token") ||
    request.cookies.get("__Secure-better-auth.session_token");
  const isAuthenticated = !!sessionCookie;

  // 1. Redirect /admin to /admin/events if authenticated, or /admin/login if not
  if (isAdminRoot) {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL("/admin/events", request.url));
    } else {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }

  // 2. Protect /admin/* routes (excluding login and signup)
  const isAdminSignup = pathname === "/admin/signup";
  if (isAdminRoute && !isAdminLogin && !isAdminSignup) {
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }

  // 3. Redirect /admin/login to /admin/events if already authenticated
  if (isAdminLogin && isAuthenticated) {
    return NextResponse.redirect(new URL("/admin/events", request.url));
  }

  // Liste des chemins autorisés
  const allowedPaths = [
    "/",
    "/_next",
    "/favicon.ico",
    "/logo.png",
    "/api",
    "/billetterie",
    "/admin", // Allow admin routes (auth is handled above)
    "/don", // Allow donation page
  ];

  // Vérifier si le chemin commence par un des chemins autorisés
  const isAllowed = allowedPaths.some((path) => pathname.startsWith(path));

  // Si le chemin n'est pas autorisé, rediriger vers la page d'accueil
  if (!isAllowed) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     */
    "/((?!_next/static|_next/image).*)",
  ],
};
