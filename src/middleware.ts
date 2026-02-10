import createIntlMiddleware from "next-intl/middleware";
import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { routing } from "@/i18n/routing";

const intlMiddleware = createIntlMiddleware(routing);

const PUBLIC_PATHS = ["/login", "/auth/callback"];

function isPublicPath(pathname: string): boolean {
  const pathWithoutLocale = pathname.replace(/^\/(en|ko)/, "") || "/";
  if (pathWithoutLocale === "/") return true;
  return PUBLIC_PATHS.some((p) => pathWithoutLocale.startsWith(p));
}

export async function middleware(request: NextRequest) {
  // 1. Supabase session refresh
  const sessionResponse = await updateSession(request);

  // 2. Intl routing (locale prefix)
  const intlResponse = intlMiddleware(request);

  // Copy Supabase cookies to intl response
  sessionResponse.cookies.getAll().forEach((cookie) => {
    intlResponse.cookies.set(cookie.name, cookie.value, cookie);
  });

  // 3. Auth redirect for protected routes
  const { pathname } = request.nextUrl;
  if (!isPublicPath(pathname)) {
    const {
      data: { user },
    } = await createSupabaseMiddlewareClient(request).auth.getUser();

    if (!user) {
      const locale = pathname.match(/^\/(en|ko)/)?.[1] ?? routing.defaultLocale;
      const loginUrl = new URL(`/${locale}/login`, request.url);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return intlResponse;
}

// Lightweight Supabase client for middleware auth check
import { createServerClient } from "@supabase/ssr";

function createSupabaseMiddlewareClient(request: NextRequest) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll() {
          // no-op: we only read cookies for auth check
        },
      },
    },
  );
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
