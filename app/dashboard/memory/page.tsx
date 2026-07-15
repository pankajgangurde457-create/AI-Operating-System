"use client";

import { useState, useEffect } from "react";
import { BrainCircuit, GitCommit, Search, Sparkles, Database, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

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
  const [events, setEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from("memory_events")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) throw error;
        setEvents(data || []);
      } catch (err) {
        console.error("Error fetching memory timeline events:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, []);

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
        {isLoading ? (
          <div className="text-center py-6 text-text-secondary font-mono text-sm">
            <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-white" />
            Loading timeline...
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-6 text-text-secondary font-mono text-sm border border-dashed border-border-glass rounded-xl bg-white/5 p-6">
            No dynamic events found. Showing baseline memory:
          </div>
        ) : null}

        {(events.length > 0 ? events : memoryEvents).map((event, i) => {
          let Icon = GitCommit;
          let iconColor = "text-text-secondary";
          
          if (event.event_type === "synthesis" || event.type === "synthesis") {
            Icon = Sparkles;
            iconColor = "text-purple-400";
          } else if (event.event_type === "ingestion" || event.type === "ingestion") {
            Icon = Database;
            iconColor = "text-blue-400";
          } else if (event.event_type === "recall" || event.type === "recall") {
            Icon = Search;
            iconColor = "text-green-400";
          }

          const date = event.created_at
            ? new Date(event.created_at).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })
            : event.date;

          return (
            <div key={event.id || i} className="relative group">
              {/* Timeline Node */}
              <div className="absolute -left-[41px] top-1 w-6 h-6 rounded-full bg-black border border-border-glass flex items-center justify-center group-hover:border-white/50 transition-colors z-10">
                <Icon className={`w-3 h-3 ${iconColor}`} />
              </div>
              
              {/* Content */}
              <div className="flex flex-col gap-2">
                <span className="text-[10px] font-mono tracking-widest text-text-secondary uppercase">{date}</span>
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
