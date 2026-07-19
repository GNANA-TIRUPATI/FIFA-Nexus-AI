"use client";

import React, { useState, useEffect } from "react";
import RoleGuard from "@/features/auth/components/RoleGuard";
import { motion, AnimatePresence } from "framer-motion";
import { AlertOctagon, Users, Eye } from "lucide-react";
import { supabaseClient } from "@/lib/supabase";

interface AlertItem {
  id: string;
  type: string;
  source: string;
  description: string;
  priority: "Critical" | "High" | "Medium";
  status: "Active" | "Acknowledged" | "Resolved";
}

const INITIAL_ALERTS: AlertItem[] = [
  {
    id: "alert-501",
    type: "SOS Button",
    source: "Section 112A, Row M",
    description: "Spectator SOS panic button pressed. Medical dispatch requested.",
    priority: "Critical",
    status: "Active",
  },
  {
    id: "alert-502",
    type: "Crowd Congestion",
    source: "Turnstile Gate 3",
    description: "Turnstile entrance rate exceeds safety bounds (85 people/min).",
    priority: "High",
    status: "Active",
  },
  {
    id: "alert-503",
    type: "Lost Child",
    source: "Gate 1 Concourse",
    description: "Unaccompanied 6-year-old child reported. Red jacket.",
    priority: "Medium",
    status: "Acknowledged",
  },
];

export default function SecurityDashboard() {
  const [alerts, setAlerts] = useState<AlertItem[]>(INITIAL_ALERTS);

  // Dynamic Turnstile Telemetry State
  const [turnstiles, setTurnstiles] = useState([
    { id: "Gate 1", rate: 34, status: "Normal" },
    { id: "Gate 2", rate: 45, status: "Normal" },
    { id: "Gate 3", rate: 82, status: "Crowded" },
    { id: "Gate 4", rate: 21, status: "Normal" },
    { id: "Gate 5", rate: 58, status: "Normal" },
  ]);

  // Listen to realtime turnstile updates via Supabase simulation
  useEffect(() => {
    const unsubscribe = supabaseClient.subscribeToChannel("crowd-updates", "INSERT", (payload) => {
      const data = payload.new;
      setTurnstiles(prev =>
        prev.map(t =>
          t.id === "Gate 3"
            ? { ...t, rate: data.crowd_count ?? t.rate, status: data.status_level ?? t.status }
            : t
        )
      );
    });
    return () => unsubscribe();
  }, []);

  const handleAcknowledgeAlert = (alertId: string) => {
    setAlerts(prev =>
      prev.map(a => (a.id === alertId ? { ...a, status: "Acknowledged" } : a))
    );
  };

  const handleResolveAlert = (alertId: string) => {
    setAlerts(prev =>
      prev.filter(a => a.id !== alertId)
    );
  };

  return (
    <RoleGuard allowedRoles={["Security Officer", "Medical Team"]}>
      <div className="space-y-8">
        
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-white">Security & Medical Command</h1>
            <p className="text-slate-400 text-sm mt-1">Live Stadium Operations Telemetry & Emergency SOS Feed.</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-ping"></span>
            <span className="text-xs font-mono font-bold text-slate-300">LIVE FEED ACTIVE</span>
          </div>
        </div>

        {/* Command Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          
          {/* Column 1 & 2: CCTV Feed Grids & Alerts */}
          <div className="xl:col-span-2 space-y-8">
            
            {/* Live CCTV Video Frame Simulator */}
            <div>
              <div className="flex items-center gap-2 pb-3">
                <Eye className="h-5 w-5 text-blue-500" />
                <h3 className="text-lg font-bold text-white">Live Computer Vision Feeds</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* CCTV Frame 1 */}
                <div className="glass-panel rounded-2xl overflow-hidden relative group aspect-video bg-slate-950">
                  {/* CCTV Info Overlay */}
                  <div className="absolute top-3 left-3 bg-slate-950/80 border border-white/10 rounded px-2 py-0.5 text-[9px] font-mono text-slate-300 flex items-center gap-1.5 z-10">
                    <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse"></span>
                    <span>CCTV_01: GATE 5 TURNSTILES</span>
                  </div>
                  
                  {/* CV Object Detection Bounding Box Graphics */}
                  <div className="absolute inset-0 border border-emerald-500/20 m-6 rounded flex items-center justify-center pointer-events-none">
                    <div className="absolute top-2 left-2 border-t-2 border-l-2 border-emerald-500 h-4 w-4"></div>
                    <div className="absolute top-2 right-2 border-t-2 border-r-2 border-emerald-500 h-4 w-4"></div>
                    <div className="absolute bottom-2 left-2 border-b-2 border-l-2 border-emerald-500 h-4 w-4"></div>
                    <div className="absolute bottom-2 right-2 border-b-2 border-r-2 border-emerald-500 h-4 w-4"></div>
                    
                    <span className="text-[9px] text-emerald-400 font-mono absolute top-2 left-8 bg-slate-950/60 px-1 rounded">
                      CROWD_COUNT: NORMAL (58)
                    </span>
                  </div>

                  {/* High Tech Scanline animations */}
                  <div className="w-full h-[2px] bg-blue-500/10 absolute top-0 animate-scanline pointer-events-none"></div>
                  
                  {/* Grid Lines */}
                  <div className="absolute inset-0 grid grid-cols-4 grid-rows-4 opacity-5 pointer-events-none">
                    {Array.from({ length: 16 }).map((_, i) => (
                      <div key={i} className="border border-white"></div>
                    ))}
                  </div>
                </div>

                {/* CCTV Frame 2 */}
                <div className="glass-panel rounded-2xl overflow-hidden relative group aspect-video bg-slate-950">
                  <div className="absolute top-3 left-3 bg-slate-950/80 border border-white/10 rounded px-2 py-0.5 text-[9px] font-mono text-slate-300 flex items-center gap-1.5 z-10">
                    <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse"></span>
                    <span>CCTV_02: GATE 3 INFLOW</span>
                  </div>
                  
                  {/* Bounding box indicating warning congestion */}
                  <div className="absolute inset-0 border border-amber-500/40 m-4 rounded flex items-center justify-center pointer-events-none">
                    <div className="absolute top-2 left-2 border-t-2 border-l-2 border-amber-500 h-4 w-4"></div>
                    <div className="absolute top-2 right-2 border-t-2 border-r-2 border-amber-500 h-4 w-4"></div>
                    <div className="absolute bottom-2 left-2 border-b-2 border-l-2 border-amber-500 h-4 w-4"></div>
                    <div className="absolute bottom-2 right-2 border-b-2 border-r-2 border-amber-500 h-4 w-4"></div>
                    
                    <span className="text-[9px] text-amber-400 font-mono absolute top-2 left-8 bg-slate-950/60 px-1 rounded">
                      CROWD_CONGESTION: WARNING ({turnstiles[2].rate})
                    </span>
                  </div>

                  <div className="w-full h-[2px] bg-red-500/10 absolute top-0 animate-scanline pointer-events-none"></div>

                  <div className="absolute inset-0 grid grid-cols-4 grid-rows-4 opacity-5 pointer-events-none">
                    {Array.from({ length: 16 }).map((_, i) => (
                      <div key={i} className="border border-white"></div>
                    ))}
                  </div>
                </div>

              </div>
            </div>

            {/* Turnstile Inflow Matrix */}
            <div>
              <div className="flex items-center gap-2 pb-3">
                <Users className="h-5 w-5 text-emerald-500" />
                <h3 className="text-lg font-bold text-white">Turnstile Telemetry Matrix</h3>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                {turnstiles.map((t) => (
                  <div key={t.id} className="glass-panel rounded-2xl p-4 text-center space-y-2">
                    <div className="text-xs font-semibold text-slate-400 font-mono">{t.id}</div>
                    <div className="text-2xl font-black text-white">{t.rate}</div>
                    <div className="text-[10px] uppercase font-mono">
                      <span className={`inline-block h-2 w-2 rounded-full mr-1 ${
                        t.status === "Normal" ? "bg-emerald-500" : "bg-amber-500 animate-pulse"
                      }`}></span>
                      <span className={t.status === "Normal" ? "text-slate-400" : "text-amber-400 font-bold"}>
                        {t.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Active Emergency Dispatch Alerts Column */}
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-1">
              <h3 className="text-md font-bold text-white flex items-center gap-2">
                <AlertOctagon className="h-5 w-5 text-red-500" />
                Emergency Alerts Feed
              </h3>
              <span className="text-[10px] bg-red-500/10 border border-red-500/20 text-red-400 px-2 py-0.5 rounded-full font-bold">
                {alerts.length} ALERTS
              </span>
            </div>

            <div className="space-y-4">
              <AnimatePresence>
                {alerts.map((alert) => (
                  <motion.div
                    key={alert.id}
                    layout
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className={`glass-panel rounded-2xl p-5 border-l-4 ${
                      alert.priority === "Critical"
                        ? "border-l-red-500 bg-red-500/5"
                        : alert.priority === "High"
                        ? "border-l-amber-500 bg-amber-500/5"
                        : "border-l-blue-500"
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <span className="text-xs font-mono font-bold text-slate-400">{alert.type}</span>
                          <h4 className="text-sm font-bold text-white">{alert.source}</h4>
                        </div>
                        <span className={`text-[9px] uppercase font-mono px-2 py-0.5 rounded font-bold ${
                          alert.priority === "Critical" ? "bg-red-500/20 text-red-400" : "bg-slate-800 text-slate-400"
                        }`}>
                          {alert.priority}
                        </span>
                      </div>
                      
                      <p className="text-xs text-slate-300 leading-relaxed">{alert.description}</p>
                      
                      <div className="flex items-center gap-2 pt-1 border-t border-white/5 justify-end">
                        {alert.status === "Active" && (
                          <button
                            onClick={() => handleAcknowledgeAlert(alert.id)}
                            className="py-1 px-2.5 rounded bg-slate-900 border border-white/10 hover:bg-slate-800 text-slate-300 text-[10px] font-semibold transition-colors"
                          >
                            Acknowledge
                          </button>
                        )}
                        {alert.status === "Acknowledged" && (
                          <button
                            onClick={() => handleResolveAlert(alert.id)}
                            className="py-1 px-2.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-semibold transition-colors"
                          >
                            Resolve Alert
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

        </div>
      </div>
    </RoleGuard>
  );
}
