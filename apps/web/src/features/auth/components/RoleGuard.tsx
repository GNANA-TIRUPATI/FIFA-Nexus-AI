"use client";

import React from "react";
import { useAuth } from "../hooks/useAuth";
import { UserRole } from "../types";
import { useRouter } from "next/navigation";
import { ShieldAlert, ArrowLeft, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
}

export default function RoleGuard({ children, allowedRoles }: RoleGuardProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  // Show loading skeleton during startup validation
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <div className="text-center space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-blue-500 mx-auto" />
          <p className="text-sm font-semibold text-slate-400">Verifying Security Credentials...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if user session is absent
  if (!isAuthenticated || !user) {
    if (typeof window !== "undefined") {
      router.push("/auth/login");
    }
    return null;
  }

  // Check if role is authorized
  if (!allowedRoles.includes(user.role)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md glass-panel rounded-3xl p-8 text-center space-y-6 shadow-glass border-red-500/20"
        >
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10 border border-red-500/20 text-red-500 shadow-neon">
            <ShieldAlert className="h-8 w-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-white tracking-tight">Security Restriction</h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              Your security clearance level (<span className="text-red-400 font-semibold">{user.role}</span>) is insufficient to access this command interface.
            </p>
          </div>

          <div className="bg-slate-900/60 border border-white/5 rounded-xl p-4 text-xs text-left text-slate-500 space-y-1 font-mono">
            <div>AUDIT_ALERT: ACCESS_DENIED</div>
            <div>TARGET_ROLE: {allowedRoles.join(" | ")}</div>
            <div>USER_EMAIL: {user.email}</div>
          </div>

          <button
            onClick={() => router.push("/")}
            className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-slate-900 border border-white/10 text-white text-sm font-medium hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Return to Terminal Gateway</span>
          </button>
        </motion.div>
      </div>
    );
  }

  return <>{children}</>;
}
