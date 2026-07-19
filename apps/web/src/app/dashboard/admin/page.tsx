"use client";

import React, { useState } from "react";
import RoleGuard from "@/features/auth/components/RoleGuard";
import { motion } from "framer-motion";
import { Activity, ShieldAlert, Users, Trash2, Megaphone, CheckCircle, Info, Landmark } from "lucide-react";

export default function AdminDashboard() {
  const [broadcastText, setBroadcastText] = useState("");
  const [broadcastTarget, setBroadcastTarget] = useState("All");
  const [broadcastStatus, setBroadcastStatus] = useState<"idle" | "broadcasting" | "sent">("idle");

  const handleBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastText) return;
    setBroadcastStatus("broadcasting");
    setTimeout(() => {
      setBroadcastStatus("sent");
      setBroadcastText("");
      setTimeout(() => setBroadcastStatus("idle"), 3000);
    }, 2000);
  };

  return (
    <RoleGuard allowedRoles={["Administrator", "Tournament Organizer", "Super Admin"]}>
      <div className="space-y-8">
        
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-white">Tournament Director</h1>
            <p className="text-slate-400 text-sm mt-1">Smart Stadium Operations Control Center & Global Metrics.</p>
          </div>
          <div className="flex items-center gap-3 bg-slate-900/60 border border-white/5 rounded-2xl px-4 py-2 text-xs font-semibold text-slate-300">
            <Landmark className="h-4 w-4 text-blue-500" />
            <span>METLIFE COMMAND: SECTOR 4</span>
          </div>
        </div>

        {/* Global Dashboard Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          <div className="glass-panel rounded-2xl p-5 space-y-3 shadow-glass">
            <div className="flex justify-between items-center text-slate-400">
              <span className="text-xs font-semibold uppercase tracking-wider font-mono">Total Attendance</span>
              <Users className="h-5 w-5 text-blue-500" />
            </div>
            <div className="space-y-1">
              <div className="text-3xl font-extrabold text-white">68,240</div>
              <p className="text-[10px] text-emerald-400 font-semibold font-mono">82% OF CAPACITY CAP</p>
            </div>
          </div>

          <div className="glass-panel rounded-2xl p-5 space-y-3 shadow-glass">
            <div className="flex justify-between items-center text-slate-400">
              <span className="text-xs font-semibold uppercase tracking-wider font-mono">Active Incidents</span>
              <ShieldAlert className="h-5 w-5 text-red-500" />
            </div>
            <div className="space-y-1">
              <div className="text-3xl font-extrabold text-white">2</div>
              <p className="text-[10px] text-red-400 font-semibold font-mono">1 CRITICAL SOS DISPATCHED</p>
            </div>
          </div>

          <div className="glass-panel rounded-2xl p-5 space-y-3 shadow-glass">
            <div className="flex justify-between items-center text-slate-400">
              <span className="text-xs font-semibold uppercase tracking-wider font-mono">Carbon Index</span>
              <Activity className="h-5 w-5 text-emerald-500" />
            </div>
            <div className="space-y-1">
              <div className="text-3xl font-extrabold text-white">-12.8%</div>
              <p className="text-[10px] text-emerald-400 font-semibold font-mono">AI ENERGY OPTIMIZATION ACTIVE</p>
            </div>
          </div>

          <div className="glass-panel rounded-2xl p-5 space-y-3 shadow-glass">
            <div className="flex justify-between items-center text-slate-400">
              <span className="text-xs font-semibold uppercase tracking-wider font-mono">Waste Queue</span>
              <Trash2 className="h-5 w-5 text-amber-500" />
            </div>
            <div className="space-y-1">
              <div className="text-3xl font-extrabold text-white">920 kg</div>
              <p className="text-[10px] text-slate-400 font-semibold font-mono">CLEANING ROUTES ASSIGNED</p>
            </div>
          </div>

        </div>

        {/* Dashboard Grid Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Global Broadcast Form */}
          <div className="lg:col-span-2 space-y-6">
            <div className="glass-panel rounded-3xl p-6 shadow-glass space-y-6">
              <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600/10 border border-blue-500/20 text-blue-500">
                  <Megaphone className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-md font-bold text-white">Global Audio & Terminal Broadcast</h3>
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest font-mono">Direct Spectator Messaging</p>
                </div>
              </div>

              <form onSubmit={handleBroadcast} className="space-y-4">
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs text-slate-400 uppercase tracking-wider font-mono">Broadcast Target Channel</label>
                    <select
                      value={broadcastTarget}
                      onChange={(e) => setBroadcastTarget(e.target.value)}
                      className="block w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-lg text-white text-xs cursor-pointer"
                    >
                      <option value="All">All Spectators & Volunteers</option>
                      <option value="Volunteers">Volunteers Only</option>
                      <option value="Security">Security & Medical staff</option>
                      <option value="Gate 5">Sector Gate 5 Terminals</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-slate-400 uppercase tracking-wider font-mono">Announcement Message Text</label>
                  <textarea
                    rows={4}
                    value={broadcastText}
                    onChange={(e) => setBroadcastText(e.target.value)}
                    placeholder="Enter warning/announcement broadcast content..."
                    className="block w-full p-3 bg-slate-900 border border-white/10 rounded-lg text-white text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                    required
                  />
                </div>

                {broadcastStatus === "sent" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs p-3 rounded-lg flex items-center gap-2"
                  >
                    <CheckCircle className="h-4 w-4 shrink-0" />
                    <span>Announcement broadcasted successfully to channel: {broadcastTarget}.</span>
                  </motion.div>
                )}

                <button
                  type="submit"
                  disabled={broadcastStatus === "broadcasting" || !broadcastText}
                  className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs tracking-wide transition-colors disabled:opacity-40"
                >
                  {broadcastStatus === "broadcasting" ? "DISPATCHING BROADCAST DATA..." : "SEND GLOBAL BROADCAST"}
                </button>

              </form>
            </div>
          </div>

          {/* Quick System Telemetry info */}
          <div className="space-y-6">
            <div className="glass-panel rounded-3xl p-6 shadow-glass space-y-6">
              <h3 className="text-md font-bold text-white border-b border-white/10 pb-4">AI Stadium Optimizer</h3>
              
              <div className="space-y-4">
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-400">Turnstile Inflow Rate</span>
                    <span className="text-blue-400">Normal</span>
                  </div>
                  <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-blue-500 h-full w-[45%]"></div>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-400">Thermal Heat Dissipation</span>
                    <span className="text-emerald-400">Optimized</span>
                  </div>
                  <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-emerald-500 h-full w-[72%]"></div>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-400">Waste Management Inflow</span>
                    <span className="text-amber-400">Heavy</span>
                  </div>
                  <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-amber-500 h-full w-[85%]"></div>
                  </div>
                </div>
              </div>

              <div className="bg-slate-900/60 border border-white/5 rounded-xl p-4 flex items-start gap-2.5">
                <Info className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
                <p className="text-[10px] text-slate-400 leading-relaxed">
                  The artificial intelligence optimizer performs automated load-balancing recommendations based on telemetry turnstile queue data and HVAC sensor feeds.
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </RoleGuard>
  );
}
