"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getSupabaseClient, supabaseClient } from "@/lib/supabase";

function CallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleCallback = async () => {
      const supabase = getSupabaseClient();
      if (!supabase) {
        router.push("/auth/login");
        return;
      }

      try {
        // Detect which OAuth flow Supabase is using:
        // - PKCE flow: ?code=... in query params
        // - Implicit flow: #access_token=... in URL hash (handled automatically by Supabase)
        const code = searchParams.get("code");
        const errorParam = searchParams.get("error");

        // Handle any OAuth error params from Google
        if (errorParam) {
          console.error("OAuth error from provider:", errorParam);
          router.push(`/auth/login?error=${errorParam}`);
          return;
        }

        // PKCE flow: exchange the code for a session
        if (code) {
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          if (exchangeError) {
            console.error("Code exchange failed:", exchangeError.message);
            router.push("/auth/login?error=exchange_failed");
            return;
          }
        }

        // For implicit flow (#access_token in hash), Supabase JS client
        // automatically parses the hash and sets the session when getSession() is called.
        // Give it a brief moment to process the hash fragment.
        await new Promise((resolve) => setTimeout(resolve, 300));

        // Retrieve the active session (works for both PKCE and implicit flows)
        const { data, error: sessionError } = await supabase.auth.getSession();

        if (sessionError || !data.session) {
          console.error("No valid session after OAuth callback:", sessionError?.message);
          router.push("/auth/login?error=no_session");
          return;
        }

        const user = data.session.user;

        // Sync user profile into Supabase profiles table
        await supabaseClient.upsertUserProfile({
          id: user.id,
          email: user.email ?? "",
          full_name:
            user.user_metadata?.full_name ??
            user.user_metadata?.name ??
            user.email?.split("@")[0] ??
            "",
          role: "fan",
          avatar_url: user.user_metadata?.avatar_url ?? undefined,
        });

        // Save session tokens for FastAPI backend calls
        localStorage.setItem("access_token", data.session.access_token);
        if (data.session.refresh_token) {
          localStorage.setItem("refresh_token", data.session.refresh_token);
        }

        // Save user info so the auth hook can restore the session on page reload
        localStorage.setItem(
          "supabase_user",
          JSON.stringify({
            id: user.id,
            email: user.email,
            full_name:
              user.user_metadata?.full_name ??
              user.user_metadata?.name ??
              user.email?.split("@")[0] ??
              "",
            role: "fan",
          })
        );

        // Redirect to dashboard
        router.push("/");
      } catch (err) {
        console.error("Unexpected OAuth callback error:", err);
        router.push("/auth/login?error=unexpected");
      }
    };

    handleCallback();
  }, [router, searchParams]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center space-y-4">
        <div className="mx-auto h-12 w-12 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
        <p className="text-white text-lg font-semibold">Signing you in with Google…</p>
        <p className="text-slate-400 text-sm">Please wait while we verify your account</p>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="mx-auto h-12 w-12 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
        </div>
      }
    >
      <CallbackHandler />
    </Suspense>
  );
}
