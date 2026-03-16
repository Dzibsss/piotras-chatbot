"use client";

import React, { useState, useEffect, useRef } from "react";
import { Send, Music, User, UserRound, Trash2, Loader2 } from "lucide-react";
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

  // Blokada DevTools, prawego kliku i zoomowania
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => e.preventDefault();
    const handleKeyDown = (e: KeyboardEvent) => {
      // F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) ||
        (e.ctrlKey && e.key === 'u')
      ) {
        e.preventDefault();
      }

      // Blokada zoomu klawiszami (Ctrl + plus/minus/0)
      if (e.ctrlKey && (e.key === '+' || e.key === '-' || e.key === '=' || e.key === '0')) {
        e.preventDefault();
      }
    };

    // Blokada zoomu kółkiem myszy (Ctrl + wheel)
    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey) {
        e.preventDefault();
      }
    };

    // Blokada gestów (pinch-to-zoom) na touchpadach (Safari/Chrome)
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 1) {
        e.preventDefault();
      }
    };

    // Safari na macOS (pinch-to-zoom na trackpadzie)
    const handleGestureStart = (e: any) => {
      e.preventDefault();
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('wheel', handleWheel, { passive: false });
    document.addEventListener('touchstart', handleTouchStart, { passive: false });
    document.addEventListener('gesturestart', handleGestureStart);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('wheel', handleWheel);
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('gesturestart', handleGestureStart);
    };
  }, []);

  // Inteligentne przewijanie
  useEffect(() => {
    if (isLoading && scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [isLoading]);

  // Gdy pojawia się nowa wiadomość
  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.role === "user" && scrollRef.current) {
        scrollRef.current.scrollIntoView({ behavior: "smooth" });
      } 
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
    <main className="flex flex-col h-screen w-full max-w-5xl mx-auto p-3 sm:p-4 md:p-6 lg:p-8 select-none">
      {/* Centered Header */}
      <header className="mb-6 sm:mb-10 flex flex-col items-center justify-center animate-in fade-in slide-in-from-top duration-500">
        <h1 className="text-[1.7rem] sm:text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tighter uppercase italic border-b-4 sm:border-b-8 border-red-600 pb-1 sm:pb-2 text-center leading-tight">
          Piotras - będziesz grał!
        </h1>
      </header>

      {/* Chat Container */}
      <div className="aggressive-card flex-1 overflow-hidden flex flex-col mb-4 sm:mb-6 relative">
        {/* Discrete Clear Button - Top Right of Chat Box */}
        {messages.length > 0 && (
          <button
            onClick={clearChat}
            className="absolute top-2 right-2 z-10 p-1.5 text-zinc-800 hover:text-red-900 transition-colors opacity-30 hover:opacity-100"
            title="Wyczyść historię"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}

        <div 
          ref={containerRef}
          className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 space-y-6 sm:space-y-8 custom-scrollbar bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')]"
        >
          {messages.length === 0 && !isLoading && (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 sm:space-y-6 px-4">
              <div className="p-4 sm:p-6 border-2 sm:border-4 border-red-600 rounded-full">
                <UserRound className="w-10 h-10 sm:w-16 sm:h-16 text-red-600" />
              </div>
              <div className="space-y-1 sm:space-y-2">
                <h2 className="text-xl sm:text-3xl font-black text-white uppercase italic tracking-tighter">GRASZ COŚ CZY TYLKO MARUDZISZ?</h2>
                <p className="text-zinc-700 text-[10px] sm:text-xs font-black uppercase tracking-[0.2em]">Piotras nie znosi lenistwa</p>
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
                <div className="uppercase text-[8px] sm:text-[10px] mb-1 sm:mb-2 opacity-50 tracking-widest text-zinc-500">
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

      {/* Input Area */}
      <form onSubmit={handleSubmit} className="relative flex gap-1 sm:gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="CO TAM?"
          className="flex-1 aggressive-input py-3 sm:py-5 px-4 sm:px-6 uppercase tracking-tighter text-base"
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

      <footer className="mt-4 sm:mt-8 flex justify-between items-center opacity-20 hover:opacity-100 transition-opacity">
        <p className="text-[7px] sm:text-[9px] text-zinc-800 font-black uppercase tracking-tighter italic">
          GOOGLE AI // NEXT.JS 15 // NO LIMITS
        </p>
        <p className="text-[7px] sm:text-[9px] text-zinc-800 font-black uppercase tracking-tighter italic">
          DESIGNED FOR PIOTRAS
        </p>
      </footer>
    </main>
  );
}
