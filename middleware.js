import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

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

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  if (!pathname.startsWith("/admin")) return NextResponse.next();

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    if (pathname !== "/admin/setup") {
      return securityHeaders(NextResponse.redirect(new URL("/admin/setup", request.url)));
    }
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

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (pathname === "/admin/login" || pathname === "/admin/setup") {
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
    await supabase.auth.signOut();
    return securityHeaders(
      NextResponse.redirect(new URL("/admin/login?error=unauthorized", request.url))
    );
  }

  return securityHeaders(response);
}

export const config = {
  matcher: ["/admin/:path*"],
};
