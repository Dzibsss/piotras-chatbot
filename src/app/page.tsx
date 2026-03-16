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
  const containerRef = useRef<HTMLDivElement>(null);

  // Inteligentne przewijanie
  useEffect(() => {
    if (isLoading && scrollRef.current) {
      // Przewijaj do dołu tylko gdy czekamy na odpowiedź (żeby widzieć loader)
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [isLoading]);

  // Gdy pojawia się nowa wiadomość
  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.role === "user" && scrollRef.current) {
        // Po wysłaniu przez użytkownika - leć na dół
        scrollRef.current.scrollIntoView({ behavior: "smooth" });
      } 
      // Gdy odpowiada asystent, NIE przewijamy automatycznie do samego dołu, 
      // dzięki czemu użytkownik widzi początek nowej wiadomości.
    }
  }, [messages]);

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
    <main className="flex flex-col h-screen w-full max-w-5xl mx-auto p-3 sm:p-4 md:p-6 lg:p-8">
      {/* Centered Header - Responsive Font */}
      <header className="mb-4 sm:mb-8 flex flex-col items-center justify-center animate-in fade-in slide-in-from-top duration-500">
        <h1 className="text-[1.7rem] sm:text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tighter uppercase italic border-b-4 sm:border-b-8 border-red-600 pb-1 sm:pb-2 text-center leading-tight">
          Piotras - zmusi Cię do grania
        </h1>
        <button
          onClick={clearChat}
          className="mt-3 sm:mt-4 p-1.5 sm:p-2 hover:bg-red-600/20 rounded border border-transparent hover:border-red-600 transition-all text-red-600 font-bold flex items-center gap-2 text-[10px] sm:text-xs uppercase tracking-widest"
          title="Wyczyść czat"
        >
          <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" /> WYCZYŚĆ HISTORIĘ
        </button>
      </header>

      {/* Chat Container - Aggressive Style */}
      <div className="aggressive-card flex-1 overflow-hidden flex flex-col mb-4 sm:mb-6 relative">
        <div 
          ref={containerRef}
          className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 space-y-6 sm:space-y-8 custom-scrollbar bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')]"
        >
          {messages.length === 0 && !isLoading && (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 sm:space-y-6 px-4">
              <div className="p-4 sm:p-6 border-2 sm:border-4 border-red-600 rotate-3">
                <Dumbbell className="w-10 h-10 sm:w-16 sm:h-16 text-red-600" />
              </div>
              <div className="space-y-1 sm:space-y-2">
                <h2 className="text-xl sm:text-3xl font-black text-white uppercase italic">GRASZ COŚ CZY TYLKO MARUDZISZ?</h2>
                <p className="text-gray-500 text-xs sm:text-base font-bold">PIOTRAS CZEKA. DO ROBOTY.</p>
              </div>
            </div>
          )}

          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={cn(
                "flex items-start gap-2 sm:gap-4 animate-in fade-in duration-300",
                msg.role === "user" ? "flex-row-reverse" : "flex-row"
              )}
            >
              <div
                className={cn(
                  "p-2 sm:p-3 border-2 shrink-0",
                  msg.role === "user" ? "border-white bg-white text-black" : "border-red-600 bg-red-600 text-white"
                )}
              >
                {msg.role === "user" ? (
                  <User className="w-4 h-4 sm:w-6 sm:h-6" />
                ) : (
                  <Music className="w-4 h-4 sm:w-6 sm:h-6" />
                )}
              </div>
              <div
                className={cn(
                  "max-w-[90%] sm:max-w-[85%] md:max-w-[75%] p-3 sm:p-5 text-xs sm:text-sm md:text-base leading-relaxed font-bold tracking-tight",
                  msg.role === "user"
                    ? "bg-zinc-900 border-l-2 sm:border-l-4 border-white text-white"
                    : "bg-zinc-900 border-l-2 sm:border-l-4 border-red-600 text-red-50"
                )}
              >
                <div className="uppercase text-[8px] sm:text-[10px] mb-1 sm:mb-2 opacity-50 tracking-widest">
                  {msg.role === "user" ? "TY" : "PIOTRAS"}
                </div>
                {msg.content}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-start gap-2 sm:gap-4">
              <div className="p-2 sm:p-3 bg-red-600 text-white">
                <Music className="w-4 h-4 sm:w-6 sm:h-6" />
              </div>
              <div className="bg-zinc-900 border-l-2 sm:border-l-4 border-red-600 p-3 sm:p-5 flex items-center gap-2 sm:gap-3">
                <span className="text-red-600 text-xs sm:text-base font-black animate-pulse uppercase">Myślę...</span>
                <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin text-red-600" />
              </div>
            </div>
          )}
          <div ref={scrollRef} className="h-1" />
        </div>
      </div>

      {/* Input Area - Aggressive & Focused */}
      <form onSubmit={handleSubmit} className="relative flex gap-1 sm:gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="PISZ..."
          className="flex-1 aggressive-input py-3 sm:py-5 px-4 sm:px-6 uppercase tracking-tighter text-xs sm:text-base"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="aggressive-button px-4 sm:px-8 flex items-center justify-center disabled:opacity-50 disabled:grayscale transition-all"
        >
          <Send className="w-4 h-4 sm:w-6 sm:h-6" />
        </button>
      </form>

      <footer className="mt-3 sm:mt-6 text-center">
        <p className="text-[8px] sm:text-[10px] text-zinc-800 font-black uppercase tracking-tighter italic">
          GOOGLE AI & NEXT.JS 15 // BRAK LIMITÓW // BRAK LITOŚCI
        </p>
      </footer>
    </main>
  );
}
