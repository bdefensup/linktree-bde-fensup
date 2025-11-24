import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Liste des chemins autorisés
  const allowedPaths = [
    "/",
    "/_next",
    "/favicon.ico",
    "/logo.png",
    "/api",
    "/billetterie",
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
