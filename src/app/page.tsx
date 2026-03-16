"use client";

import React, { useState, useEffect, useRef } from "react";
import { Send, Music, User, Dumbbell, Trash2, Loader2 } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// Utility for Tailwind class merging
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: input };
    const newMessages = [...messages, userMessage];
    
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.error) throw new Error(data.error);

      setMessages((prev) => [...prev, { role: "assistant", content: data.content }]);
    } catch (error: any) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `BŁĄD: ${error.message}` },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  return (
    <main className="flex flex-col h-screen w-full max-w-5xl mx-auto p-4 md:p-6 lg:p-8">
      {/* Centered Header */}
      <header className="mb-8 flex flex-col items-center justify-center animate-in fade-in slide-in-from-top duration-500">
        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter uppercase italic border-b-8 border-red-600 pb-2">
          Piotras - zmusi Cię do grania
        </h1>
        <button
          onClick={clearChat}
          className="mt-4 p-2 hover:bg-red-600/20 rounded border border-transparent hover:border-red-600 transition-all text-red-600 font-bold flex items-center gap-2 text-xs uppercase tracking-widest"
          title="Wyczyść czat"
        >
          <Trash2 className="w-4 h-4" /> WYCZYŚĆ HISTORIĘ
        </button>
      </header>

      {/* Chat Container - Aggressive Style */}
      <div className="aggressive-card flex-1 overflow-hidden flex flex-col mb-6 relative">
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-8 custom-scrollbar bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')]">
          {messages.length === 0 && !isLoading && (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
              <div className="p-6 border-4 border-red-600 rotate-3">
                <Dumbbell className="w-16 h-16 text-red-600" />
              </div>
              <div className="space-y-2">
                <h2 className="text-3xl font-black text-white uppercase italic">GRASZ COŚ CZY TYLKO MARUDZISZ?</h2>
                <p className="text-gray-500 font-bold">PIOTRAS CZEKA. DO ROBOTY.</p>
              </div>
            </div>
          )}

          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={cn(
                "flex items-start gap-4",
                msg.role === "user" ? "flex-row-reverse" : "flex-row"
              )}
            >
              <div
                className={cn(
                  "p-3 border-2",
                  msg.role === "user" ? "border-white bg-white text-black" : "border-red-600 bg-red-600 text-white"
                )}
              >
                {msg.role === "user" ? (
                  <User className="w-6 h-6" />
                ) : (
                  <Music className="w-6 h-6" />
                )}
              </div>
              <div
                className={cn(
                  "max-w-[85%] md:max-w-[75%] p-5 text-sm leading-relaxed font-bold tracking-tight",
                  msg.role === "user"
                    ? "bg-zinc-900 border-l-4 border-white text-white"
                    : "bg-zinc-900 border-l-4 border-red-600 text-red-50"
                )}
              >
                <div className="uppercase text-[10px] mb-2 opacity-50 tracking-widest">
                  {msg.role === "user" ? "TY" : "PIOTRAS"}
                </div>
                {msg.content}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-start gap-4">
              <div className="p-3 bg-red-600 text-white">
                <Music className="w-6 h-6" />
              </div>
              <div className="bg-zinc-900 border-l-4 border-red-600 p-5 flex items-center gap-3">
                <span className="text-red-600 font-black animate-pulse uppercase">Piotras myśli...</span>
                <Loader2 className="w-5 h-5 animate-spin text-red-600" />
              </div>
            </div>
          )}
          <div ref={scrollRef} />
        </div>
      </div>

      {/* Input Area - Aggressive & Focused */}
      <form onSubmit={handleSubmit} className="relative flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="PISZ ŚMIAŁO, TYLKO BEZ MARUDZENIA..."
          className="flex-1 aggressive-input py-5 px-6 uppercase tracking-tighter"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="aggressive-button px-8 flex items-center justify-center disabled:opacity-50 disabled:grayscale"
        >
          <Send className="w-6 h-6" />
        </button>
      </form>

      <footer className="mt-6 text-center">
        <p className="text-[10px] text-zinc-800 font-black uppercase tracking-tighter italic">
          NAPĘDZANE PRZEZ GOOGLE AI & NEXT.JS 15 // BRAK LIMITÓW // BRAK LITOŚCI
        </p>
      </footer>
    </main>
  );
}
