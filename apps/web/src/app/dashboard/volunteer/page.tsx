"use client";

import React, { useState } from "react";
import RoleGuard from "@/features/auth/components/RoleGuard";
import { motion } from "framer-motion";
import { Calendar, Languages, CheckCircle, Play, MapPin } from "lucide-react";

interface VolunteerTask {
  id: string;
  title: string;
  description: string;
  location: string;
  status: "Pending" | "Active" | "Completed";
  priority: "Low" | "Medium" | "High";
}

const INITIAL_TASKS: VolunteerTask[] = [
  {
    id: "task-101",
    title: "Gate 5 Navigation Assist",
    description: "Help direct inbound spectators from Section 110-120 to Gate 5 turnstiles.",
    location: "Gate 5 Concourse",
    status: "Pending",
    priority: "High",
  },
  {
    id: "task-102",
    title: "Translate French Announcement",
    description: "Translate the safety broadcast text regarding metro schedule changes.",
    location: "Information Desk C",
    status: "Active",
    priority: "Medium",
  },
  {
    id: "task-103",
    title: "Wheelchair Escort Support",
    description: "Assist a family with wheelchair route navigation from Parking Lot B to Elevator 2.",
    location: "Elevator 2 Lobby",
    status: "Completed",
    priority: "High",
  },
];

export default function VolunteerDashboard() {
  const [tasks, setTasks] = useState<VolunteerTask[]>(INITIAL_TASKS);
  
  // Translation Simulator State
  const [sourceText, setSourceText] = useState("");
  const [targetLang, setTargetLang] = useState("Spanish");
  const [translatedText, setTranslatedText] = useState("");
  const [isTranslating, setIsTranslating] = useState(false);

  const handleStartTask = (taskId: string) => {
    setTasks(prev =>
      prev.map(t => (t.id === taskId ? { ...t, status: "Active" } : t))
    );
  };

  const handleCompleteTask = (taskId: string) => {
    setTasks(prev =>
      prev.map(t => (t.id === taskId ? { ...t, status: "Completed" } : t))
    );
  };

  const simulateTranslation = () => {
    if (!sourceText) return;
    setIsTranslating(true);
    setTimeout(() => {
      let translation = "";
      if (targetLang === "Spanish") {
        translation = `[Traducido] Atención espectadores, el metro de la línea azul funcionará con frecuencias extendidas después del partido.`;
      } else if (targetLang === "French") {
        translation = `[Traduit] Attention spectateurs, la ligne de métro bleue fonctionnera à des fréquences prolongées après le match.`;
      } else {
        translation = `[Translated to ${targetLang}] System notification: The blue line metro will run with extended frequencies.`;
      }
      setTranslatedText(translation);
      setIsTranslating(false);
    }, 1200);
  };

  return (
    <RoleGuard allowedRoles={["Volunteer"]}>
      <div className="space-y-8">
        
        {/* Header */}
        <div>
          <h1 className="text-3xl font-extrabold text-white">Volunteer Terminal</h1>
          <p className="text-slate-400 text-sm mt-1">Steward Support and Stadium Operations Center.</p>
        </div>

        {/* Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Assigned Tasks Log */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex justify-between items-center pb-2">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-500" />
                Assigned Logistics Tasks
              </h3>
              <span className="text-xs bg-blue-600/10 border border-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full font-mono">
                {tasks.filter(t => t.status !== "Completed").length} ACTIVE
              </span>
            </div>

            <div className="space-y-4">
              {tasks.map((task) => (
                <motion.div
                  key={task.id}
                  layout
                  className={`glass-panel rounded-2xl p-5 border-l-4 transition-all ${
                    task.status === "Completed"
                      ? "border-l-emerald-500 opacity-60"
                      : task.status === "Active"
                      ? "border-l-blue-500"
                      : "border-l-amber-500"
                  }`}
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white">{task.title}</span>
                        <span className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded ${
                          task.priority === "High" ? "bg-red-500/10 text-red-400" : "bg-slate-800 text-slate-400"
                        }`}>
                          {task.priority} Priority
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">{task.description}</p>
                      
                      <div className="flex items-center gap-2 text-slate-400 text-[11px] font-mono">
                        <MapPin className="h-3..5 w-3.5" />
                        <span>{task.location}</span>
                      </div>
                    </div>

                    <div className="shrink-0 pt-1">
                      {task.status === "Pending" && (
                        <button
                          onClick={() => handleStartTask(task.id)}
                          className="flex items-center gap-1 py-1.5 px-3 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold transition-colors"
                        >
                          <Play className="h-3 w-3 fill-current" />
                          <span>Start Task</span>
                        </button>
                      )}

                      {task.status === "Active" && (
                        <button
                          onClick={() => handleCompleteTask(task.id)}
                          className="flex items-center gap-1 py-1.5 px-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors"
                        >
                          <CheckCircle className="h-3 w-3" />
                          <span>Mark Done</span>
                        </button>
                      )}

                      {task.status === "Completed" && (
                        <span className="inline-flex items-center gap-1 text-emerald-400 text-xs font-semibold">
                          <CheckCircle className="h-3.5 w-3.5" />
                          <span>Completed</span>
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Translation Assist Tool */}
          <div className="space-y-6">
            <div className="glass-panel rounded-3xl p-6 shadow-glass space-y-6">
              <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600/10 border border-blue-500/20 text-blue-500">
                  <Languages className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-md font-bold text-white">Announcement Translator</h3>
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest font-mono">Multilingual Helpdesk</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 uppercase tracking-wider font-mono">Select Target Language</label>
                  <select
                    value={targetLang}
                    onChange={(e) => setTargetLang(e.target.value)}
                    className="block w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-lg text-white text-xs"
                  >
                    <option value="Spanish">Spanish (Español)</option>
                    <option value="French">French (Français)</option>
                    <option value="German">German (Deutsch)</option>
                    <option value="Arabic">Arabic (العربية)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-slate-400 uppercase tracking-wider font-mono">Broadcast Text (English)</label>
                  <textarea
                    rows={3}
                    value={sourceText}
                    onChange={(e) => setSourceText(e.target.value)}
                    placeholder="Enter announcement text to translate..."
                    className="block w-full p-3 bg-slate-900 border border-white/10 rounded-lg text-white text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                  />
                </div>

                <button
                  onClick={simulateTranslation}
                  disabled={isTranslating || !sourceText}
                  className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors disabled:opacity-40"
                >
                  {isTranslating ? "RUNNING NLP ENGINE..." : "RUN TRANSLATION"}
                </button>

                {translatedText && (
                  <div className="border border-emerald-500/20 bg-emerald-500/5 rounded-xl p-3.5 space-y-1.5 animate-fadeIn">
                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest font-mono">System Translation Output</span>
                    <p className="text-xs text-slate-200 leading-relaxed">{translatedText}</p>
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
