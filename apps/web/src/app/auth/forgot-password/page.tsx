"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Mail, ArrowLeft, Loader2, Info, CheckCircle2 } from "lucide-react";
import axios from "axios";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [devResetLink, setDevResetLink] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setDevResetLink(null);

    if (!email) {
      setError("Please enter your email address.");
      return;
    }

    setIsSubmitting(true);
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
      const response = await axios.post(`${apiBase}/auth/forgot-password`, { email });
      setSuccessMsg(response.data.message || "Instructions sent.");
      if (response.data.dev_reset_link) {
        setDevResetLink(response.data.dev_reset_link);
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.detail || "Could not process request.");
      } else {
        setError("Could not process request.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md space-y-8"
      >
        <div className="text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-white">
            Recover <span className="text-blue-500">Nexus</span> Account
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            Request an authorized password recovery credential.
          </p>
        </div>

        <div className="glass-panel rounded-2xl p-8 shadow-glass space-y-6">
          {successMsg ? (
            <div className="space-y-6 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">{successMsg}</p>
              
              {devResetLink && (
                <div className="border border-blue-500/20 bg-blue-500/5 rounded-xl p-4 space-y-2 text-left">
                  <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest font-mono">Dev Mode Reset Bypass</span>
                  <p className="text-xs text-slate-300">Click below to bypass email inbox delivery:</p>
                  <Link
                    href={devResetLink}
                    className="text-xs text-blue-400 hover:text-blue-300 font-semibold underline block truncate"
                  >
                    Reset Password Direct Link
                  </Link>
                </div>
              )}

              <Link
                href="/auth/login"
                className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-slate-900 border border-white/10 text-white text-sm font-medium hover:bg-slate-800 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Return to Sign In</span>
              </Link>
            </div>
          ) : (
            <form className="space-y-4" onSubmit={handleSubmit}>
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-3 rounded-lg flex items-start gap-2">
                  <Info className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Account Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Mail className="h-4 w-4" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 bg-slate-900/60 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-all"
                    placeholder="name@nexus.fifa.com"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-4 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm transition-all disabled:opacity-50"
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <span>Send Recovery Instructions</span>
                )}
              </button>

              <Link
                href="/auth/login"
                className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-slate-950/40 text-slate-400 text-xs font-medium hover:text-white transition-colors mt-2"
              >
                <ArrowLeft className="h-4.5 w-4.5" />
                <span>Back to Sign In</span>
              </Link>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}
