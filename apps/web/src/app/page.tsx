"use client";

import { useAuth } from "@/features/auth/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { Loader2, LogOut, ShieldCheck, User, Compass, Heart, Settings } from "lucide-react";

export default function Home() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/auth/login");
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <div className="text-center space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-blue-500 mx-auto" />
          <p className="text-sm font-semibold text-slate-400">Restoring Active Terminal Session...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-4 sm:p-6 md:p-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl glass-panel rounded-3xl p-6 sm:p-8 shadow-glass space-y-8"
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/10 pb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600/10 border border-blue-500/20 text-blue-500 shadow-neon">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                FIFA <span className="text-blue-500">NEXUS</span> AI
              </h1>
              <p className="text-xs text-slate-400 uppercase tracking-wider font-mono">
                Command Terminal v1.0.0
              </p>
            </div>
          </div>
          
          <button
            onClick={() => logout()}
            className="flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-red-600/10 hover:bg-red-600/20 border border-red-500/20 hover:border-red-500/30 text-red-400 text-sm font-medium transition-all"
          >
            <LogOut className="h-4 w-4" />
            <span>Terminate Session</span>
          </button>
        </div>

        {/* User Card */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-5 space-y-4">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono">
              Authenticated Profile
            </h3>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-800 text-slate-300">
                <User className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">{user.full_name || "Nexus User"}</p>
                <p className="text-xs text-slate-400">{user.email}</p>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-5 space-y-4">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono">
              Access Privileges
            </h3>
            <div>
              <span className="inline-flex items-center rounded-full bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-400 ring-1 ring-inset ring-blue-500/20">
                Role: {user.role}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Your access privileges are determined dynamically based on tournament registry credentials.
            </p>
          </div>
        </div>

        {/* Dashboard Placeholder Announcement */}
        <div className="border border-blue-500/20 bg-blue-500/5 rounded-2xl p-5 space-y-2">
          <p className="text-sm font-semibold text-blue-400 flex items-center gap-2">
            <Compass className="h-4 w-4" />
            Milestone 1 Completed Successfully
          </p>
          <p className="text-xs text-slate-300 leading-relaxed">
            The monorepo structure, FastAPI database interface, active JWT tokens, refresh session store, and glassmorphic frontend login/registration framework are fully operational. Ready to initialize Milestone 2 (Database schema and full role-based dashboard layouts).
          </p>
        </div>

        {/* Dashboard Grid Options */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 text-center">
          <div className="p-4 rounded-xl border border-white/5 bg-slate-950/20 text-slate-400 hover:text-white transition-colors cursor-not-allowed">
            <Compass className="h-5 w-5 mx-auto mb-2 text-slate-500" />
            <span className="text-[10px] sm:text-xs font-medium block">Maps</span>
          </div>
          <div className="p-4 rounded-xl border border-white/5 bg-slate-950/20 text-slate-400 hover:text-white transition-colors cursor-not-allowed">
            <Heart className="h-5 w-5 mx-auto mb-2 text-slate-500" />
            <span className="text-[10px] sm:text-xs font-medium block">Crowd</span>
          </div>
          <div className="p-4 rounded-xl border border-white/5 bg-slate-950/20 text-slate-400 hover:text-white transition-colors cursor-not-allowed">
            <Settings className="h-5 w-5 mx-auto mb-2 text-slate-500" />
            <span className="text-[10px] sm:text-xs font-medium block">Terminal</span>
          </div>
        </div>
      </motion.div>
    </main>
  );
}
