import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

const AUTH_TIMEOUT_MS = 4000;

function securityHeaders(response) {
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  return response;
}

function getAllowedEmails() {
  const raw = process.env.ADMIN_ALLOWED_EMAILS || "";
  return raw
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

function hasSupabaseAuthCookie(request) {
  return request.cookies
    .getAll()
    .some((cookie) => cookie.name.startsWith("sb-") && cookie.name.includes("auth-token"));
}

function withTimeout(promise, ms) {
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      setTimeout(() => reject(new Error("auth_timeout")), ms);
    }),
  ]);
}

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  if (!pathname.startsWith("/admin")) return NextResponse.next();

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    if (pathname !== "/admin/setup") {
      return securityHeaders(NextResponse.redirect(new URL("/admin/setup", request.url)));
    }
    return securityHeaders(NextResponse.next());
  }

  const isPublicAdminRoute = pathname === "/admin/login" || pathname === "/admin/setup";

  // Avoid a Supabase round-trip for login/setup when there is no session cookie.
  if (isPublicAdminRoute && !hasSupabaseAuthCookie(request)) {
    return securityHeaders(NextResponse.next());
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, {
              ...options,
              httpOnly: true,
              secure: process.env.NODE_ENV === "production",
              sameSite: "lax",
            })
          );
        },
      },
    }
  );

  let session = null;
  try {
    const { data } = await withTimeout(supabase.auth.getSession(), AUTH_TIMEOUT_MS);
    session = data.session;
  } catch {
    if (isPublicAdminRoute) {
      return securityHeaders(NextResponse.next());
    }
    return securityHeaders(
      NextResponse.redirect(new URL("/admin/login?error=auth_timeout", request.url))
    );
  }

  const user = session?.user ?? null;

  if (isPublicAdminRoute) {
    if (user && pathname === "/admin/login") {
      return securityHeaders(NextResponse.redirect(new URL("/admin", request.url)));
    }
    return securityHeaders(response);
  }

  if (!user) {
    return securityHeaders(NextResponse.redirect(new URL("/admin/login", request.url)));
  }

  const allowed = getAllowedEmails();
  const email = user.email?.toLowerCase();
  if (allowed.length > 0 && email && !allowed.includes(email)) {
    try {
      await withTimeout(supabase.auth.signOut(), 2000);
    } catch {
      /* sign-out is best-effort when auth is slow */
    }
    return securityHeaders(
      NextResponse.redirect(new URL("/admin/login?error=unauthorized", request.url))
    );
  }

  return securityHeaders(response);
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
