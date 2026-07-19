"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, X, Send, Bot, Sparkles, User, Loader2 } from "lucide-react";
import axios from "axios";

interface Message {
  role: "user" | "model";
  text: string;
}

const SUGGESTIONS = [
  "Where is Gate 5?",
  "Find vegetarian food",
  "Where is first aid?",
  "Wheelchair routes",
];

export default function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "model", text: "Hello! I am your FIFA Nexus AI Assistant. How can I help you navigate MetLife Stadium today?" }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    const userMessage: Message = { role: "user", text: textToSend };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
      
      // Map current messages context to match history schema required by API
      const historyContext = messages.map(m => ({
        role: m.role,
        text: m.text
      }));

      const response = await axios.post(`${apiBase}/ai/chat`, {
        message: textToSend,
        history: historyContext
      });

      const replyText = response.data.response || "I could not resolve that announcement query. Please contact the nearest volunteer.";
      setMessages((prev) => [...prev, { role: "model", text: replyText }]);
    } catch (error) {
      console.error("AI Assistant query failed:", error);
      setMessages((prev) => [
        ...prev,
        { role: "model", text: "Connection error. Stadium operations expert fallback: Gate 5 is the north side entry; elevator 2 lobby is in the west corridor." }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="w-80 sm:w-96 h-[480px] mb-4 glass-panel rounded-3xl overflow-hidden shadow-glass flex flex-col border border-white/10"
          >
            {/* Chat Panel Header */}
            <div className="bg-blue-600/10 border-b border-white/10 p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-600/20 text-blue-400 shadow-neon">
                  <Bot className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white flex items-center gap-1">
                    NEXUS AI ASSISTANT <Sparkles className="h-3 w-3 text-blue-400" />
                  </h4>
                  <span className="text-[9px] text-slate-400 uppercase tracking-widest font-mono">Operations Advisor</span>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Chat Stream Area */}
            <div className="flex-grow p-4 overflow-y-auto space-y-4">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex gap-2.5 max-w-[85%] ${
                    msg.role === "user" ? "ml-auto flex-row-reverse" : ""
                  }`}
                >
                  <div className={`h-7 w-7 rounded-lg shrink-0 flex items-center justify-center text-xs font-bold ${
                    msg.role === "user" ? "bg-slate-800 text-slate-300" : "bg-blue-600/10 text-blue-400 border border-blue-500/20"
                  }`}>
                    {msg.role === "user" ? <User className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
                  </div>
                  <div className={`rounded-2xl px-3.5 py-2 text-xs leading-relaxed ${
                    msg.role === "user"
                      ? "bg-blue-600 text-white rounded-tr-none"
                      : "bg-slate-900/60 border border-white/5 text-slate-200 rounded-tl-none"
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex gap-2.5 max-w-[85%]">
                  <div className="h-7 w-7 rounded-lg shrink-0 flex items-center justify-center bg-blue-600/10 text-blue-400 border border-blue-500/20">
                    <Bot className="h-3.5 w-3.5" />
                  </div>
                  <div className="bg-slate-900/60 border border-white/5 rounded-2xl rounded-tl-none px-4 py-2.5 flex items-center gap-1.5">
                    <Loader2 className="h-3 w-3 animate-spin text-blue-500" />
                    <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Analyzing layouts...</span>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* suggestion chips (show only if input is empty) */}
            {!inputValue && (
              <div className="px-4 pb-2 flex gap-1.5 flex-wrap">
                {SUGGESTIONS.map((item) => (
                  <button
                    key={item}
                    onClick={() => handleSendMessage(item)}
                    className="py-1 px-2.5 bg-slate-900 border border-white/5 rounded-full text-[10px] text-slate-400 hover:text-white hover:bg-white/5 transition-all text-left"
                  >
                    {item}
                  </button>
                ))}
              </div>
            )}

            {/* Input Footer */}
            <div className="p-4 border-t border-white/10 bg-slate-950/40">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage(inputValue);
                }}
                className="flex gap-2"
              >
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Ask about gate paths, restrooms..."
                  className="flex-grow px-3.5 py-1.5 bg-slate-900 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  disabled={!inputValue.trim()}
                  className="p-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white transition-colors disabled:opacity-40"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Action Trigger Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 hover:bg-blue-500 text-white shadow-neon select-none cursor-pointer border border-blue-500/20"
      >
        <MessageSquare className="h-5 w-5" />
      </motion.button>
    </div>
  );
}
