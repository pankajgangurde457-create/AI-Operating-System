"use client";

import { motion } from "framer-motion";
import { Search, UploadCloud, FileText, Database, Activity } from "lucide-react";

export default function DashboardHome() {
  return (
    <div className="p-8 max-w-6xl mx-auto w-full flex flex-col gap-8 pb-24">
      {/* Header */}
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Overview</h1>
        <p className="text-text-secondary">Welcome back. System is online and monitoring.</p>
      </header>

      {/* Stats / Status Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card rounded-xl p-6 border border-border-glass relative overflow-hidden group">
          <div className="flex justify-between items-start mb-4 relative z-10">
            <span className="text-xs font-mono tracking-widest text-text-secondary uppercase">Total Memories</span>
            <Database className="w-4 h-4 text-white/50" />
          </div>
          <div className="text-4xl font-bold text-white relative z-10">1,248</div>
          <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
        </div>

        <div className="glass-card rounded-xl p-6 border border-border-glass relative overflow-hidden group">
          <div className="flex justify-between items-start mb-4 relative z-10">
            <span className="text-xs font-mono tracking-widest text-text-secondary uppercase">Recent Uploads</span>
            <UploadCloud className="w-4 h-4 text-white/50" />
          </div>
          <div className="text-4xl font-bold text-white relative z-10">12</div>
          <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
        </div>

        <div className="glass-card rounded-xl p-6 border border-border-glass relative overflow-hidden group">
          <div className="flex justify-between items-start mb-4 relative z-10">
            <span className="text-xs font-mono tracking-widest text-text-secondary uppercase">System Status</span>
            <Activity className="w-4 h-4 text-green-500" />
          </div>
          <div className="flex items-center gap-2 relative z-10 mt-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_#22c55e]"></span>
            <span className="font-mono text-sm tracking-widest text-green-500 uppercase">Online</span>
          </div>
          <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
        </div>
      </div>

      {/* Main Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Quick Chat Input */}
        <div className="glass-card rounded-xl border border-border-glass flex flex-col overflow-hidden">
          <div className="p-4 border-b border-border-glass bg-black/20 flex items-center justify-between">
            <h2 className="text-sm font-medium tracking-wide">Quick Query</h2>
            <Search className="w-4 h-4 text-text-secondary" />
          </div>
          <div className="p-6 flex-1 flex flex-col justify-between gap-4">
            <p className="text-sm text-text-secondary">Search across your entire knowledge graph or ask a question.</p>
            <div className="relative">
              <input 
                type="text" 
                placeholder="Ask your second brain..." 
                className="w-full bg-white/5 border border-border-glass rounded-lg pl-4 pr-12 py-3 text-sm focus:outline-none focus:border-white/40 transition-colors"
              />
              <button className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md hover:bg-white/10 transition-colors">
                <Search className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>
        </div>

        {/* Recent Files List */}
        <div className="glass-card rounded-xl border border-border-glass flex flex-col overflow-hidden">
          <div className="p-4 border-b border-border-glass bg-black/20 flex items-center justify-between">
            <h2 className="text-sm font-medium tracking-wide">Recent Ingestions</h2>
            <button className="text-xs font-mono tracking-widest text-text-secondary hover:text-white uppercase transition-colors">View All</button>
          </div>
          <div className="flex flex-col divide-y divide-border-glass">
            {[
              { name: "Neural_Networks_Architecture.pdf", time: "2 hours ago", type: "PDF" },
              { name: "Project_Qwerty_Notes.docx", time: "5 hours ago", type: "DOCX" },
              { name: "Meeting_Transcript_Sales.txt", time: "1 day ago", type: "TXT" },
            ].map((file, i) => (
              <div key={i} className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors cursor-pointer group">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-white/10 flex items-center justify-center">
                    <FileText className="w-4 h-4 text-white/70 group-hover:text-white transition-colors" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium truncate max-w-[200px] md:max-w-[250px]">{file.name}</span>
                    <span className="text-xs text-text-secondary">{file.time}</span>
                  </div>
                </div>
                <span className="text-[10px] font-mono tracking-widest text-text-secondary border border-border-glass px-2 py-1 rounded">{file.type}</span>
              </div>
            ))}
          </div>
        </div>
        
      </div>
    </div>
  );
}
