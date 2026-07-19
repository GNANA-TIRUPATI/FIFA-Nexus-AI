"use client";

import React, { useState } from "react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldAlert,
  Menu,
  X,
  Compass,
  FileText,
  AlertOctagon,
  LogOut,
  User,
  Activity,
  Calendar,
  Layers,
  Map,
  Trash2,
  Bot
} from "lucide-react";
import Link from "next/link";
import AIAssistant from "@/components/AIAssistant";

interface SidebarItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Dynamic sidebar items based on User Role
  const getSidebarItems = (): SidebarItem[] => {
    if (!user) return [];
    
    switch (user.role) {
      case "Fan":
        return [
          { name: "Digital Ticket", href: "/dashboard/fan", icon: FileText },
          { name: "Stadium Finder", href: "#", icon: Compass },
          { name: "Accessibility", href: "#", icon: Layers },
          { name: "AI Assistant", href: "/dashboard/assistant", icon: Bot },
          { name: "Emergency Help", href: "#", icon: ShieldAlert },
        ];
      case "Volunteer":
        return [
          { name: "Assigned Work", href: "/dashboard/volunteer", icon: Calendar },
          { name: "Stadium Map", href: "#", icon: Map },
          { name: "AI Assistant", href: "/dashboard/assistant", icon: Bot },
          { name: "Report Incident", href: "#", icon: AlertOctagon },
        ];
      case "Security Officer":
      case "Medical Team":
        return [
          { name: "Emergency Command", href: "/dashboard/security", icon: ShieldAlert },
          { name: "Sensor Matrix", href: "#", icon: Activity },
          { name: "AI Assistant", href: "/dashboard/assistant", icon: Bot },
          { name: "Incident Log", href: "#", icon: AlertOctagon },
        ];
      case "Administrator":
      case "Tournament Organizer":
      case "Super Admin":
        return [
          { name: "Overview Analytics", href: "/dashboard/admin", icon: Activity },
          { name: "Stadium Sensors", href: "#", icon: Layers },
          { name: "AI Assistant", href: "/dashboard/assistant", icon: Bot },
          { name: "System Log", href: "#", icon: FileText },
          { name: "Waste Management", href: "#", icon: Trash2 },
        ];
      default:
        return [];
    }
  };

  const navItems = getSidebarItems();

  const handleLogout = async () => {
    await logout();
    router.push("/auth/login");
  };

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100 font-sans">
      {/* Sidebar for desktop */}
      <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 glass-panel border-r border-white/10">
        <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto">
          {/* Logo Brand */}
          <div className="flex items-center flex-shrink-0 px-6 gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600/10 border border-blue-500/20 text-blue-500 shadow-neon">
              <Activity className="h-5 w-5 animate-pulse" />
            </div>
            <span className="text-lg font-bold tracking-tight text-white">
              FIFA <span className="text-blue-500">NEXUS</span>
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="mt-8 flex-1 px-4 space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center px-4 py-2.5 text-sm font-medium rounded-xl transition-all ${
                    isActive
                      ? "bg-blue-600 text-white shadow-neon"
                      : "text-slate-400 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <item.icon
                    className={`mr-3 h-5 w-5 shrink-0 ${
                      isActive ? "text-white" : "text-slate-400 group-hover:text-slate-200"
                    }`}
                  />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User profile section at bottom */}
        {user && (
          <div className="flex-shrink-0 flex border-t border-white/10 p-4 bg-slate-950/40">
            <div className="flex items-center gap-3 w-full justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <div className="h-9 w-9 rounded-full bg-slate-800 flex items-center justify-center text-slate-300">
                  <User className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-white truncate">{user.full_name}</p>
                  <p className="text-[10px] text-slate-400 truncate">{user.role}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="p-1.5 rounded-lg hover:bg-red-500/10 hover:text-red-400 text-slate-400 transition-colors"
                title="Sign Out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </aside>

      {/* Main Content Area */}
      <div className="md:pl-64 flex flex-col flex-1 w-full">
        {/* Mobile Header Bar */}
        <header className="sticky top-0 z-40 flex items-center justify-between h-16 px-4 md:hidden glass-panel border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600/10 border border-blue-500/20 text-blue-500">
              <Activity className="h-4 w-4" />
            </div>
            <span className="text-md font-bold tracking-tight text-white">
              FIFA <span className="text-blue-500">NEXUS</span>
            </span>
          </div>

          <button
            onClick={() => setIsMobileOpen(true)}
            className="p-2 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white"
          >
            <Menu className="h-5 w-5" />
          </button>
        </header>

        {/* Mobile Sidebar Flyout */}
        <AnimatePresence>
          {isMobileOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsMobileOpen(false)}
                className="fixed inset-0 z-50 bg-slate-950 md:hidden"
              />
              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "tween", duration: 0.3 }}
                className="fixed inset-y-0 right-0 z-50 w-64 glass-panel border-l border-white/10 p-5 flex flex-col justify-between md:hidden"
              >
                <div className="space-y-6">
                  <div className="flex items-center justify-between pb-4 border-b border-white/10">
                    <span className="font-bold text-white">FIFA NEXUS AI</span>
                    <button
                      onClick={() => setIsMobileOpen(false)}
                      className="p-1 rounded-lg hover:bg-white/5 text-slate-400"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                  <nav className="space-y-1">
                    {navItems.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setIsMobileOpen(false)}
                        className="flex items-center px-4 py-2 text-sm font-medium rounded-lg text-slate-400 hover:bg-white/5 hover:text-white transition-colors"
                      >
                        <item.icon className="mr-3 h-5 w-5 shrink-0" />
                        <span>{item.name}</span>
                      </Link>
                    ))}
                  </nav>
                </div>

                {user && (
                  <div className="border-t border-white/10 pt-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-300">
                        <User className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-white">{user.full_name}</p>
                        <p className="text-[9px] text-slate-400">{user.role}</p>
                      </div>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="p-1.5 rounded-lg hover:bg-red-500/10 hover:text-red-400 text-slate-400"
                    >
                      <LogOut className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Child Views Page Frame */}
        <div className="flex-1 py-6 px-4 sm:px-6 md:px-8 overflow-y-auto relative">
          {children}
          <AIAssistant />
        </div>
      </div>
    </div>
  );
}
