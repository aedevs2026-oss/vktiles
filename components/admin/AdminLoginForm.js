"use client";

import { useActionState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { loginAction } from "@/app/admin/actions/auth";
import { ui } from "@/components/admin/admin-ui";

export default function AdminLoginForm() {
  const searchParams = useSearchParams();
  const unauthorized = searchParams.get("error") === "unauthorized";
  const [state, formAction, pending] = useActionState(loginAction, null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-sky-soft/30 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex w-16 h-16 rounded-2xl bg-gradient-to-br from-sky to-sky-bright items-center justify-center shadow-xl shadow-sky/30 mb-4">
            <span className="font-display text-white text-2xl font-bold">VK</span>
          </div>
          <p className="text-[10px] uppercase tracking-[0.3em] text-sky font-semibold mb-2">Secure access</p>
          <h1 className="font-display text-3xl text-navy">VK Tiles Admin</h1>
          <p className="text-gray text-sm mt-2">Authorized personnel only</p>
        </div>

        <div className="bg-white/90 backdrop-blur-sm border border-slate-200/80 rounded-2xl shadow-[0_20px_50px_-20px_rgba(11,31,58,0.2)] p-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-sky to-sky-bright" />

          {unauthorized && (
            <p className={`mb-4 ${ui.alertError}`}>
              Your account is not authorized for admin access.
            </p>
          )}

          <form action={formAction} className="space-y-5">
            <input
              type="text"
              name="website"
              tabIndex={-1}
              autoComplete="off"
              className="absolute opacity-0 pointer-events-none h-0 w-0"
              aria-hidden="true"
            />

            <div>
              <label className={ui.label}>Email</label>
              <input name="email" type="email" required autoComplete="username" className={ui.input} />
            </div>

            <div>
              <label className={ui.label}>Password</label>
              <input
                name="password"
                type="password"
                required
                minLength={8}
                autoComplete="current-password"
                className={ui.input}
              />
            </div>

            {state?.error && <p className={ui.alertError}>{state.error}</p>}

            <button type="submit" disabled={pending} className={`w-full py-3.5 ${ui.btnPrimary}`}>
              {pending ? "Authenticating..." : "Sign in securely"}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-gray mt-6">
          <Link href="/" className="hover:text-sky transition-colors">
            ← Back to website
          </Link>
        </p>
      </div>
    </div>
  );
}
