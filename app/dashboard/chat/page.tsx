"use client";

import { useState } from "react";
import { MessageSquare, Send, Paperclip, Bot, User, Loader2 } from "lucide-react";

type Message = {
  role: "user" | "ai";
  content: string;
  citations?: { fileName: string; contentSnippet: string }[];
};

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "ai",
      content: "Hello! I'm online and have indexed your documents. What would you like to recall or explore today?",
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage.content, history: messages }),
      });

      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || "Failed to fetch response");

      setMessages((prev) => [
        ...prev,
        { role: "ai", content: data.answer, citations: data.citations }
      ]);
    } catch (error: any) {
      setMessages((prev) => [
        ...prev,
        { role: "ai", content: `Error: ${error.message}. (Did you set up your API keys in .env.local?)` }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-2rem)] p-8 max-w-5xl mx-auto w-full">
      <header className="flex flex-col gap-1 mb-6 border-b border-border-glass pb-4">
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          AI Memory Chat
        </h1>
        <p className="text-sm text-text-secondary">Synthesizing answers from your personal knowledge base.</p>
      </header>

      {/* Chat History */}
      <div className="flex-1 overflow-y-auto pr-4 flex flex-col gap-6 no-scrollbar pb-6">
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-4 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border ${msg.role === "user" ? "bg-white text-black" : "bg-white/10 border-border-glass"}`}>
              {msg.role === "user" ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5 text-white" />}
            </div>
            
            <div className={`flex flex-col gap-2 max-w-[80%] ${msg.role === "user" ? "items-end" : ""}`}>
              <div className="text-xs font-mono text-text-secondary tracking-widest uppercase flex items-center gap-2">
                <span>{msg.role === "user" ? "You" : "System"}</span>
                {msg.citations && msg.citations.length > 0 && (
                  <>
                    <span className="w-1 h-1 rounded-full bg-border-glass"></span>
                    <span className="text-green-400">Synthesized from {msg.citations.length} sources</span>
                  </>
                )}
              </div>
              <div className={`p-4 rounded-xl text-sm leading-relaxed shadow-lg flex flex-col gap-4 ${msg.role === "user" ? "bg-white text-black rounded-tr-none" : "glass-card rounded-tl-none"}`}>
                <p>{msg.content}</p>
                
                {msg.citations && msg.citations.length > 0 && (
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {msg.citations.map((cit, idx) => (
                      <span key={idx} className="text-[10px] font-mono border border-border-glass px-2 py-1 rounded bg-white/5 cursor-pointer hover:bg-white/10 text-text-secondary" title={cit.contentSnippet}>
                        {cit.fileName}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0 border border-border-glass">
              <Loader2 className="w-5 h-5 text-white animate-spin" />
            </div>
            <div className="flex items-center">
              <span className="text-sm font-mono text-text-secondary animate-pulse">Synthesizing knowledge...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="relative mt-auto pt-4">
        <div className="glass-card border border-border-glass rounded-2xl p-2 flex items-end gap-2 bg-black/40 backdrop-blur-xl focus-within:border-white/30 transition-colors">
          <button className="p-3 text-text-secondary hover:text-white transition-colors rounded-xl hover:bg-white/5">
            <Paperclip className="w-5 h-5" />
          </button>
          
          <textarea 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            placeholder="Query your memory..."
            className="flex-1 bg-transparent resize-none max-h-32 min-h-[44px] py-3 text-sm focus:outline-none text-white overflow-y-auto no-scrollbar"
            rows={1}
            disabled={isLoading}
          />
          
          <button 
            onClick={sendMessage}
            disabled={isLoading || !input.trim()}
            className="p-3 bg-white text-black rounded-xl hover:scale-105 transition-transform flex items-center justify-center shadow-lg disabled:opacity-50 disabled:hover:scale-100"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        <div className="text-center mt-2 text-[10px] text-text-secondary font-mono tracking-widest uppercase">
          AI can make mistakes. Verify critical knowledge.
        </div>
      </div>
    </div>
  );
}
