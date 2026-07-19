"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Send, 
  Trash2, 
  Mic, 
  MicOff, 
  Loader2, 
  User, 
  Bot, 
  HelpCircle, 
  Sparkles
} from "lucide-react";
import { api } from "@/lib/api";

interface Player {
  id: string;
  name: string;
  pos: string;
  x: number;
  y: number;
  role: "defense" | "attack";
  instruction: string;
}

interface FormationData {
  tacticsName: string;
  defenseTeam: string;
  attackTeam: string;
  players: Player[];
}

interface Message {
  id: string;
  role: "user" | "model";
  text: string;
  timestamp: string;
  formationData?: FormationData;
}

const FORMATION_4231_VS_433: FormationData = {
  tacticsName: "4-3-3 Counter (vs 4-2-3-1 Narrow)",
  defenseTeam: "Opponent (4-2-3-1)",
  attackTeam: "Liverpool (4-3-3)",
  players: [
    // 4-3-3 Attacking (Liverpool - Blue dots)
    { id: "a1", name: "Alisson", pos: "GK", x: 50, y: 90, role: "attack", instruction: "Sweeper keeper. Distribute quickly to fullbacks." },
    { id: "a2", name: "Robertson", pos: "LB", x: 15, y: 65, role: "attack", instruction: "Overlap wingers. Provide width on left flank." },
    { id: "a3", name: "Van Dijk", pos: "LCB", x: 38, y: 78, role: "attack", instruction: "Hold defensive line. Direct aerial threats." },
    { id: "a4", name: "Konate", pos: "RCB", x: 62, y: 78, role: "attack", instruction: "Cover spaces left by overlapping RB." },
    { id: "a5", name: "Alexander-Arnold", pos: "RB", x: 85, y: 65, role: "attack", instruction: "Inverted role. Move into central midfield during build-up." },
    { id: "a6", name: "Mac Allister", pos: "LCM", x: 30, y: 55, role: "attack", instruction: "Playmaker. Link defense to attackers." },
    { id: "a7", name: "Endo", pos: "DM", x: 50, y: 62, role: "attack", instruction: "Shield CB line. Disrupt opponent CAM (4-2-3-1 narrow)." },
    { id: "a8", name: "Szoboszlai", pos: "RCM", x: 70, y: 55, role: "attack", instruction: "Box-to-box engine. High press opposing LDM." },
    { id: "a9", name: "Luis Diaz", pos: "LW", x: 22, y: 32, role: "attack", instruction: "Stay wide, isolate RB in 1v1 duels." },
    { id: "a10", name: "Darwin Nunez", pos: "ST", x: 50, y: 22, role: "attack", instruction: "Run in behind opposing CBs. Drag defenders." },
    { id: "a11", name: "Mohamed Salah", pos: "RW", x: 78, y: 32, role: "attack", instruction: "Inverted winger. Cut inside to shoot on left foot." },

    // 4-2-3-1 Defensive (Opponent - Red dots)
    { id: "d1", name: "Opponent GK", pos: "GK", x: 50, y: 8, role: "defense", instruction: "Stay inside 6-yard box." },
    { id: "d2", name: "Opponent LB", pos: "LB", x: 18, y: 28, role: "defense", instruction: "Contain Salah's inward cuts." },
    { id: "d3", name: "Opponent LCB", pos: "LCB", x: 38, y: 24, role: "defense", instruction: "Mark Darwin tightly." },
    { id: "d4", name: "Opponent RCB", pos: "RCB", x: 62, y: 24, role: "defense", instruction: "Provide aerial cover." },
    { id: "d5", name: "Opponent RB", pos: "RB", x: 82, y: 28, role: "defense", instruction: "Prevent Luis Diaz from crossing." },
    { id: "d6", name: "Opponent LDM", pos: "LDM", x: 35, y: 44, role: "defense", instruction: "Disrupt Mac Allister's supply." },
    { id: "d7", name: "Opponent RDM", pos: "RDM", x: 65, y: 44, role: "defense", instruction: "Cover Szoboszlai's runs." },
    { id: "d8", name: "Opponent LAM", pos: "LAM", x: 20, y: 48, role: "defense", instruction: "Exploit spaces behind Trent." },
    { id: "d9", name: "Opponent CAM", pos: "CAM", x: 50, y: 50, role: "defense", instruction: "Target space between CBs and DM." },
    { id: "d10", name: "Opponent RAM", pos: "RAM", x: 80, y: 48, role: "defense", instruction: "Press Robertson high." },
    { id: "d11", name: "Opponent ST", pos: "ST", x: 50, y: 68, role: "defense", instruction: "Press Van Dijk on build-up." }
  ]
};

const SUGGESTED_PROMPTS = [
  "How to counter 4-2-3-1 narrow?",
  "Suggest a pressing setup for a 4-3-3 system",
  "How should the DM defend against 2 CAMs?",
  "Recommend tactical changes for the final 15 minutes"
];

export default function AssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "model",
      text: "Hello! I am your FIFA Nexus AI Tactical Assistant. Ask me how to optimize player formations, counter specific strategies, or visualize dynamic pitch positioning on the grid.",
      timestamp: ""
    }
  ]);
  const [input, setInput] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<typeof FORMATION_4231_VS_433.players[0] | null>(null);
  const [activeFormationTab, setActiveFormationTab] = useState<"both" | "attack" | "defense">("both");
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Set local timestamp after client-side mount to avoid React hydration mismatches
  useEffect(() => {
    setMessages(prev => prev.map(msg => 
      msg.id === "welcome" 
        ? { ...msg, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) } 
        : msg
    ));
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    const userMessage: Message = {
      id: Math.random().toString(36).substring(7),
      role: "user",
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsAnalyzing(true);

    try {
      // Map message history
      const history = messages.map(msg => ({
        role: msg.role,
        text: msg.text
      }));

      const res = await api.post("/ai/chat", {
        message: textToSend,
        history: history
      });

      const aiReply = res.data.response || "No response received.";
      
      const containsTacticsQuery = textToSend.toLowerCase().includes("counter") || 
                                   textToSend.toLowerCase().includes("4-2-3-1") ||
                                   textToSend.toLowerCase().includes("squad") ||
                                   textToSend.toLowerCase().includes("formation");

      const modelMessage: Message = {
        id: Math.random().toString(36).substring(7),
        role: "model",
        text: aiReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        ...(containsTacticsQuery ? { formationData: FORMATION_4231_VS_433 } : {})
      };

      setMessages(prev => [...prev, modelMessage]);
    } catch (err) {
      console.error(err);
      const errorMessage: Message = {
        id: Math.random().toString(36).substring(7),
        role: "model",
        text: "Sorry, I am having trouble connecting to the tactical analysis matrix. Please try again.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleClear = () => {
    setMessages([
      {
        id: "welcome",
        role: "model",
        text: "Tactical session cleared. Input a new team formation query or click one of the templates below.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
    setSelectedPlayer(null);
  };

  const startVoiceRecording = () => {
    setIsRecording(true);
    // Simulate speech recognition transcription input
    setTimeout(() => {
      setInput("How to counter 4-2-3-1 narrow with Klopp's high-press system?");
      setIsRecording(false);
    }, 2500);
  };

  const filteredPlayers = FORMATION_4231_VS_433.players.filter(p => {
    if (activeFormationTab === "both") return true;
    if (activeFormationTab === "attack") return p.role === "attack";
    if (activeFormationTab === "defense") return p.role === "defense";
    return true;
  });

  return (
    <div className="flex flex-col xl:flex-row gap-6 min-h-[calc(100vh-8rem)] w-full">
      {/* Left Chat Window Column */}
      <div className="flex-1 flex flex-col glass-panel rounded-2xl border border-white/10 overflow-hidden shadow-glass">
        {/* Terminal Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950/40 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600/10 border border-blue-500/20 text-blue-500 shadow-neon">
              <Bot className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white">Assistant Bot - Live Session</h2>
              <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                AI Tactical Engine Online
              </span>
            </div>
          </div>
          
          <button 
            onClick={handleClear}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-400 hover:text-white bg-slate-900 border border-white/10 rounded-lg hover:bg-white/5 transition-all"
            title="Clear Chat History"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Reset Session</span>
          </button>
        </div>

        {/* Chat History Messages list */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 max-h-[50vh] xl:max-h-[60vh] bg-slate-950/20">
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`flex gap-4 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
              >
                {/* Avatar */}
                <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 text-white ${
                  msg.role === "user" 
                    ? "bg-gradient-to-tr from-pink-600 to-rose-500 shadow-rose" 
                    : "bg-gradient-to-tr from-blue-600 to-indigo-500 shadow-neon"
                }`}>
                  {msg.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                </div>

                {/* Content Bubble */}
                <div className="space-y-4 max-w-[85%]">
                  <div className={`rounded-xl p-4 text-sm font-medium leading-relaxed ${
                    msg.role === "user"
                      ? "bg-blue-600 text-white shadow-neon"
                      : "bg-slate-900/80 border border-white/10 text-slate-200"
                  }`}>
                    <p className="whitespace-pre-line">{msg.text}</p>
                    <span className="block text-[9px] text-right mt-2 opacity-50 font-mono">
                      {msg.timestamp}
                    </span>
                  </div>

                  {/* Inline visual soccer pitch diagram if query involves formations */}
                  {msg.role === "model" && msg.formationData && (
                    <div className="xl:hidden border border-white/10 rounded-xl overflow-hidden bg-slate-950/60 p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Sparkles className="h-4 w-4 text-blue-400" />
                        <span className="text-xs font-semibold text-white">Visual Formation Plot</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mb-2">
                        Scroll down to the right-hand panel for full high-fidelity, interactive player details.
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          <div ref={chatEndRef} />
        </div>

        {/* Input Bar section */}
        <div className="p-4 border-t border-white/10 bg-slate-950/40 space-y-4">
          {/* Quick Prompts templates */}
          <div className="flex flex-wrap gap-2">
            {SUGGESTED_PROMPTS.map((promptText) => (
              <button
                key={promptText}
                onClick={() => handleSend(promptText)}
                className="text-[11px] text-slate-400 hover:text-white bg-slate-900/60 border border-white/10 hover:border-blue-500/30 px-3 py-1.5 rounded-full hover:bg-blue-950/10 transition-all font-mono"
              >
                {promptText}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            {/* Input field inside styled red-blue neon border */}
            <div className="flex-1 relative rounded-xl bg-slate-900/60 border-2 border-slate-800 focus-within:border-blue-500/50 transition-all overflow-hidden flex items-center pr-2">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend(input);
                  }
                }}
                className="w-full bg-transparent px-4 py-3 text-sm text-slate-200 placeholder-slate-500 focus:outline-none resize-none min-h-[50px] max-h-[120px]"
                placeholder="Ask FIFA Nexus AI about counters, tactics, player setups..."
              />
              
              {/* Voice button */}
              <button
                type="button"
                onClick={isRecording ? () => setIsRecording(false) : startVoiceRecording}
                className={`p-2 rounded-lg transition-colors ${
                  isRecording 
                    ? "bg-red-500/20 text-red-400 hover:bg-red-500/30 animate-pulse" 
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
                title={isRecording ? "Stop voice input" : "Start voice input"}
              >
                {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </button>
            </div>

            <button
              onClick={() => handleSend(input)}
              disabled={isAnalyzing || !input.trim()}
              className="p-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-neon transition-all focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shrink-0"
              title="Send Message"
            >
              {isAnalyzing ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </button>
          </div>

          {/* Bottom status notification bar */}
          <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono pt-1">
            <span>
              {isAnalyzing 
                ? "FIFA Nexus AI is analyzing your request... ⌛" 
                : isRecording 
                  ? "Listening to audio transcription..." 
                  : "Status: Idle"}
            </span>
            <span className="text-[10px] text-blue-400/70">Powered by Gemini 2.5 Flash</span>
          </div>
        </div>
      </div>

      {/* Right Column: Visual Interactive Pitch Diagram */}
      <div className="w-full xl:w-[480px] flex flex-col glass-panel rounded-2xl border border-white/10 overflow-hidden shadow-glass">
        {/* Tactical Diagram Header */}
        <div className="px-6 py-4 bg-slate-950/40 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-blue-400" />
            <h3 className="text-sm font-semibold text-white">Live Tactical Pitch Grid</h3>
          </div>
          <div className="flex rounded-lg bg-slate-900 p-0.5 border border-white/5">
            {(["both", "attack", "defense"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveFormationTab(tab)}
                className={`px-2.5 py-1 text-[10px] font-semibold rounded-md capitalize transition-colors ${
                  activeFormationTab === tab 
                    ? "bg-blue-600 text-white" 
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* The Soccer Pitch Visualizer (Green Field SVG overlay layout) */}
        <div className="p-6 flex-1 flex flex-col justify-center items-center">
          <div className="relative w-full aspect-[3/4] bg-emerald-950/40 rounded-xl border border-emerald-500/30 overflow-hidden shadow-inner">
            {/* Soccer Pitch Lines (SVG background markup) */}
            <svg className="absolute inset-0 w-full h-full text-emerald-500/20 stroke-current" fill="none" strokeWidth="1.5">
              {/* Outer Border */}
              <rect x="2" y="2" width="98.5%" height="99%" rx="4" />
              {/* Center Line */}
              <line x1="0" y1="50%" x2="100%" y2="50%" />
              {/* Center Circle */}
              <circle cx="50%" cy="50%" r="15%" />
              <circle cx="50%" cy="50%" r="0.8%" fill="currentColor" />
              
              {/* Penalty Area Top */}
              <rect x="20%" y="2" width="60%" height="16%" />
              {/* Goal Area Top */}
              <rect x="35%" y="2" width="30%" height="6%" />
              {/* Penalty Spot Top */}
              <circle cx="50%" cy="12%" r="0.8%" fill="currentColor" />
              {/* Penalty Arc Top */}
              <path d="M 38 18 A 12 12 0 0 0 62 18" />

              {/* Penalty Area Bottom */}
              <rect x="20%" y="82%" width="60%" height="18%" />
              {/* Goal Area Bottom */}
              <rect x="35%" y="94%" width="30%" height="6%" />
              {/* Penalty Spot Bottom */}
              <circle cx="50%" cy="88%" r="0.8%" fill="currentColor" />
              {/* Penalty Arc Bottom */}
              <path d="M 38 82 A 12 12 0 0 1 62 82" />
            </svg>

            {/* Render interactive player dots */}
            {filteredPlayers.map((player) => {
              const isSelected = selectedPlayer?.id === player.id;
              return (
                <button
                  key={player.id}
                  onClick={() => setSelectedPlayer(player)}
                  className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group focus:outline-none z-10"
                  style={{ left: `${player.x}%`, top: `${player.y}%` }}
                >
                  {/* Glowing Node Circle */}
                  <div className={`h-7 w-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white border transition-all ${
                    player.role === "attack"
                      ? isSelected 
                        ? "bg-blue-500 border-white scale-125 shadow-blue" 
                        : "bg-blue-600/90 border-blue-400 group-hover:scale-110"
                      : isSelected
                        ? "bg-red-500 border-white scale-125 shadow-rose"
                        : "bg-red-600/90 border-red-400 group-hover:scale-110"
                  }`}>
                    {player.pos}
                  </div>
                  {/* Small tooltip name */}
                  <span className="mt-1 px-1 py-0.5 text-[8px] bg-slate-950/80 border border-white/10 rounded text-slate-300 font-medium whitespace-nowrap opacity-80 group-hover:opacity-100 transition-opacity">
                    {player.name.split(" ")[0]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Player Tactical Instruction Panel */}
        <div className="p-4 bg-slate-950/40 border-t border-white/10 min-h-[100px] flex items-center">
          {selectedPlayer ? (
            <motion.div 
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${selectedPlayer.role === 'attack' ? 'bg-blue-400' : 'bg-red-400'}`} />
                  <h4 className="text-xs font-bold text-white uppercase">{selectedPlayer.name} ({selectedPlayer.pos})</h4>
                </div>
                <span className="text-[9px] text-slate-400 font-mono bg-slate-900 border border-white/5 px-2 py-0.5 rounded">
                  {selectedPlayer.role === 'attack' ? 'Counter Unit' : 'Opponent Unit'}
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-mono bg-slate-900/60 border border-white/5 p-2 rounded">
                {selectedPlayer.instruction}
              </p>
            </motion.div>
          ) : (
            <div className="w-full text-center py-2">
              <HelpCircle className="h-5 w-5 text-slate-500 mx-auto mb-1 animate-bounce" />
              <p className="text-xs text-slate-400">Click any player circle on the soccer pitch grid to inspect detailed tactical instructions.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
