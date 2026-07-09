"use client";

import { AppShell } from "@/components/AppShell";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  async function googleLogin() {
    await supabase?.auth.signInWithOAuth({ provider: "google", options: { redirectTo: `${location.origin}/dashboard` } });
  }
  return (
    <AppShell>
      <section className="mx-auto max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-ink">Login</h1>
        <p className="mt-2 text-sm text-slate-500">Connect Supabase Auth to enable Google and email login.</p>
        <button onClick={googleLogin} disabled={!supabase} className="mt-5 w-full rounded-md bg-ink px-4 py-2 font-medium text-white disabled:opacity-50">
          Continue with Google
        </button>
      </section>
    </AppShell>
  );
}
