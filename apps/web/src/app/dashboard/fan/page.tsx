"use client";

import React, { useState, useEffect } from "react";
import RoleGuard from "@/features/auth/components/RoleGuard";
import { motion } from "framer-motion";
import { MapPin, Compass, ShieldAlert, Award } from "lucide-react";

export default function FanDashboard() {
  const [sosStatus, setSosStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [matchMinutes, setMatchMinutes] = useState(72);
  const [score, setScore] = useState({ home: 2, away: 1 });

  useEffect(() => {
    const timer = setInterval(() => {
      setMatchMinutes(prev => (prev >= 90 ? 72 : prev + 1));
      if (Math.random() > 0.95) {
        setScore(prev => ({ ...prev, home: prev.home + 1 }));
      }
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const triggerSOS = () => {
    setSosStatus("sending");
    setTimeout(() => {
      setSosStatus("sent");
    }, 2000);
  };

  return (
    <RoleGuard allowedRoles={["Fan"]}>
      <div className="space-y-8">
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-white">Spectator Portal</h1>
            <p className="text-slate-400 text-sm mt-1">Welcome to the FIFA World Cup 2026 Smart Stadium Terminal.</p>
          </div>
          <div className="flex items-center gap-3 bg-slate-900/60 border border-white/5 rounded-2xl px-4 py-2 text-xs font-semibold text-slate-300">
            <span className="h-2.5 w-2.5 rounded-full bg-red-500 animate-ping"></span>
            <span>MATCH LIVE NOW</span>
          </div>
        </div>

        {/* Grid Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Column 1 & 2: Digital Ticket & Controls */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Digital Match Ticket */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-panel rounded-3xl overflow-hidden shadow-glass"
            >
              {/* Ticket Top */}
              <div className="bg-blue-600/20 border-b border-white/10 p-6 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-blue-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-400 font-mono">MATCH 42 • ROUND OF 16</span>
                </div>
                <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-full font-semibold">
                  CONFIRMED SEAT
                </span>
              </div>

              {/* Match Header */}
              <div className="p-6 md:p-8 grid grid-cols-3 items-center text-center">
                <div className="space-y-1">
                  <div className="text-2xl font-black text-white">USA</div>
                  <div className="text-xs text-slate-400">HOST NATION</div>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-xs bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-0.5 rounded font-mono animate-pulse uppercase tracking-wider">
                    LIVE • {matchMinutes}{"'"}
                  </span>
                  <span className="text-xl font-bold text-white mt-1 font-mono">{score.home} - {score.away}</span>
                </div>
                <div className="space-y-1">
                  <div className="text-2xl font-black text-white">BRA</div>
                  <div className="text-xs text-slate-400">VISITOR</div>
                </div>
              </div>

              {/* Ticket Details Grid */}
              <div className="grid grid-cols-4 border-t border-b border-white/10 bg-slate-950/40 text-center font-mono">
                <div className="border-r border-white/10 py-4">
                  <div className="text-[10px] text-slate-500 uppercase">GATE</div>
                  <div className="text-md font-bold text-white mt-0.5">05</div>
                </div>
                <div className="border-r border-white/10 py-4">
                  <div className="text-[10px] text-slate-500 uppercase">SECTION</div>
                  <div className="text-md font-bold text-white mt-0.5">112A</div>
                </div>
                <div className="border-r border-white/10 py-4">
                  <div className="text-[10px] text-slate-500 uppercase">ROW</div>
                  <div className="text-md font-bold text-white mt-0.5">M</div>
                </div>
                <div className="py-4">
                  <div className="text-[10px] text-slate-500 uppercase">SEAT</div>
                  <div className="text-md font-bold text-white mt-0.5">14</div>
                </div>
              </div>

              {/* Barcode / QR Simulation */}
              <div className="p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="space-y-2 text-center sm:text-left">
                  <h4 className="text-sm font-semibold text-white">Digital Pass Entry Scan</h4>
                  <p className="text-xs text-slate-400 max-w-sm">Present this QR code at Gate 5 turnstiles. Turn up screen brightness to speed scanning.</p>
                </div>
                
                {/* Styled high-tech QR box */}
                <div className="h-32 w-32 bg-white p-2 rounded-xl flex flex-wrap gap-[2px] relative shrink-0">
                  {/* Decorative corner borders to look premium */}
                  <div className="absolute -top-1 -left-1 h-3 w-3 border-t-2 border-l-2 border-blue-500"></div>
                  <div className="absolute -top-1 -right-1 h-3 w-3 border-t-2 border-r-2 border-blue-500"></div>
                  <div className="absolute -bottom-1 -left-1 h-3 w-3 border-b-2 border-l-2 border-blue-500"></div>
                  <div className="absolute -bottom-1 -right-1 h-3 w-3 border-b-2 border-r-2 border-blue-500"></div>
                  
                  {/* Simulated QR grids */}
                  <div className="w-8 h-8 bg-slate-950 border border-white"></div>
                  <div className="w-8 h-8 flex flex-wrap gap-[1px]">
                    <div className="w-3 h-3 bg-slate-950"></div><div className="w-3 h-3 bg-slate-950"></div>
                  </div>
                  <div className="w-8 h-8 bg-slate-950 border border-white"></div>
                  
                  <div className="w-full h-8 flex gap-[2px] mt-1">
                    <div className="w-4 h-full bg-slate-950"></div>
                    <div className="w-2 h-full bg-slate-950"></div>
                    <div className="w-6 h-full bg-slate-950"></div>
                  </div>

                  <div className="w-full h-8 flex gap-[2px] mt-1 justify-between">
                    <div className="w-8 h-full bg-slate-950"></div>
                    <div className="w-12 h-full bg-slate-950"></div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Navigation Assist Quick Links */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="glass-panel rounded-2xl p-5 hover:bg-white/5 transition-colors cursor-pointer group flex items-start gap-4">
                <div className="h-10 w-10 rounded-xl bg-blue-600/10 border border-blue-500/20 text-blue-500 flex items-center justify-center shrink-0">
                  <MapPin className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-semibold text-white group-hover:text-blue-400 transition-colors">Seat Locator Map</h4>
                  <p className="text-xs text-slate-400">Indoor waypoint routes direct to Section 112A, Row M.</p>
                </div>
              </div>

              <div className="glass-panel rounded-2xl p-5 hover:bg-white/5 transition-colors cursor-pointer group flex items-start gap-4">
                <div className="h-10 w-10 rounded-xl bg-emerald-600/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center shrink-0">
                  <Compass className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-semibold text-white group-hover:text-emerald-400 transition-colors">Food Queue Tracker</h4>
                  <p className="text-xs text-slate-400">Check food menus, vegetarian filters, and line sizes.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Column 3: SOS Emergency Center */}
          <div className="space-y-8">
            <div className="glass-panel rounded-3xl p-6 border-red-500/20 shadow-glass space-y-6">
              <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-600/10 border border-red-500/20 text-red-500 shadow-neon">
                  <ShieldAlert className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-md font-bold text-white">Emergency Center</h3>
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest font-mono">Instant Medical / Security SOS</p>
                </div>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed">
                Pressing the SOS button transmits your GPS location (Section 112A, Row M) directly to stadium dispatchers, volunteers, and the emergency medical team.
              </p>

              <div className="pt-2">
                {sosStatus === "idle" && (
                  <button
                    onClick={triggerSOS}
                    className="w-full py-4 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-bold text-sm tracking-wide transition-all shadow-neon hover:scale-[1.02]"
                  >
                    TRIGGER PANIC SOS
                  </button>
                )}

                {sosStatus === "sending" && (
                  <button
                    disabled
                    className="w-full py-4 rounded-2xl bg-red-600/40 border border-red-500/40 text-white font-bold text-sm flex items-center justify-center gap-2 cursor-wait"
                  >
                    <span className="h-2 w-2 rounded-full bg-white animate-ping"></span>
                    <span>TRANSMITTING COORDS...</span>
                  </button>
                )}

                {sosStatus === "sent" && (
                  <div className="space-y-4">
                    <button
                      disabled
                      className="w-full py-4 rounded-2xl bg-emerald-600/20 border border-emerald-500/40 text-emerald-400 font-bold text-sm"
                    >
                      DISPATCH DISPATCHED ✓
                    </button>
                    <p className="text-[10px] text-center text-emerald-400 animate-pulse font-mono uppercase tracking-wider">
                      Rescue Team Assigned (EST: 3 mins)
                    </p>
                    <button
                      onClick={() => setSosStatus("idle")}
                      className="w-full text-center text-xs text-slate-500 hover:text-slate-300 underline pt-1 block"
                    >
                      Cancel False Alert
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </RoleGuard>
  );
}
