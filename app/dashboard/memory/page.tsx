"use client";

import { BrainCircuit, GitCommit, Search, Sparkles } from "lucide-react";

const memoryEvents = [
  {
    date: "Today, 10:45 AM",
    title: "Synthesized Agentic AI concepts",
    description: "Combined insights from 'Research_Notes_Agentic_AI.txt' and previous chat history to form a new permanent memory cluster regarding autonomous decision making.",
    type: "synthesis"
  },
  {
    date: "Yesterday, 2:15 PM",
    title: "Ingested Q3 Financials",
    description: "Parsed 45 pages of 'Q3_Financial_Report.pdf'. Extracted 1,200 semantic chunks and identified key revenue metrics.",
    type: "ingestion"
  },
  {
    date: "Oct 10, 2026",
    title: "Architecture Discussion",
    description: "User queried about scalable vector databases. Retrieved info from 3 past documents and provided a comparative analysis.",
    type: "recall"
  },
  {
    date: "Oct 08, 2026",
    title: "Audio Transcription",
    description: "Processed 'Brainstorming_Session.mp3'. Generated full text transcript and extracted action items for Q4 planning.",
    type: "ingestion"
  }
];

export default function MemoryTimeline() {
  return (
    <div className="flex-1 flex flex-col p-8 max-w-4xl mx-auto w-full pb-24">
      <header className="flex flex-col gap-2 mb-12">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <BrainCircuit className="w-6 h-6" />
          Memory Timeline
        </h1>
        <p className="text-sm text-text-secondary">A chronological view of how your AI OS is learning and synthesizing information.</p>
      </header>

      {/* Timeline */}
      <div className="relative border-l border-border-glass ml-4 sm:ml-8 pl-8 flex flex-col gap-12">
        
        {memoryEvents.map((event, i) => {
          let Icon = GitCommit;
          let iconColor = "text-text-secondary";
          
          if (event.type === "synthesis") {
            Icon = Sparkles;
            iconColor = "text-purple-400";
          } else if (event.type === "ingestion") {
            Icon = Database;
            iconColor = "text-blue-400";
          } else if (event.type === "recall") {
            Icon = Search;
            iconColor = "text-green-400";
          }

          return (
            <div key={i} className="relative group">
              {/* Timeline Node */}
              <div className="absolute -left-[41px] top-1 w-6 h-6 rounded-full bg-black border border-border-glass flex items-center justify-center group-hover:border-white/50 transition-colors z-10">
                <Icon className={`w-3 h-3 ${iconColor}`} />
              </div>
              
              {/* Content */}
              <div className="flex flex-col gap-2">
                <span className="text-[10px] font-mono tracking-widest text-text-secondary uppercase">{event.date}</span>
                <h3 className="text-lg font-medium text-white">{event.title}</h3>
                <div className="glass-card p-4 rounded-xl border border-border-glass text-sm text-text-secondary leading-relaxed mt-2 shadow-lg">
                  {event.description}
                </div>
              </div>
            </div>
          );
        })}

        {/* End of timeline marker */}
        <div className="relative mt-8">
          <div className="absolute -left-[37px] top-0 w-4 h-4 rounded-full border border-border-glass bg-transparent z-10 flex items-center justify-center">
            <div className="w-1 h-1 rounded-full bg-white/20"></div>
          </div>
          <span className="text-xs font-mono tracking-widest text-text-secondary uppercase">System Initialization</span>
        </div>

      </div>
    </div>
  );
}
