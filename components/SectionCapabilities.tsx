"use client";

import { motion } from "framer-motion";

const capabilities = [
  { ref: "OS/26/001", name: "KNOWLEDGE GRAPH INGESTION", class: "DATA PROCESSING", status: "ACTIVE" },
  { ref: "OS/26/002", name: "RETRIEVAL-AUGMENTED GEN", class: "AI / SEARCH", status: "ACTIVE" },
  { ref: "OS/26/003", name: "LONG-TERM MEMORY", class: "CONTEXT RETENTION", status: "ACTIVE" },
  { ref: "OS/26/004", name: "AUTONOMOUS SUMMARIZATION", class: "MISSION SOFTWARE", status: "ACTIVE" },
];

export default function SectionCapabilities() {
  return (
    <section className="section-container">
      <div className="section-eyebrow">
        <span className="eyebrow-num">002</span>
        <span>Core Capabilities</span>
        <span className="ml-auto opacity-50 hidden md:block">System functions initialized</span>
      </div>

      <div className="flex flex-col border-t border-border-glass">
        {/* Table Header */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4 text-xs font-mono text-text-secondary tracking-widest border-b border-border-glass">
          <span>REF.</span>
          <span className="hidden md:block">PROGRAM</span>
          <span className="hidden md:block">CLASS</span>
          <span className="text-right md:text-left">STATUS</span>
        </div>

        {/* Table Rows */}
        {capabilities.map((cap, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 py-6 border-b border-border-glass text-sm md:text-base items-center group hover:bg-white/[0.02] transition-colors"
          >
            <span className="font-mono text-text-secondary">{cap.ref}</span>
            <span className="font-medium tracking-wide hidden md:block group-hover:text-white transition-colors">{cap.name}</span>
            <span className="text-text-secondary text-xs tracking-wider hidden md:block">{cap.class}</span>
            <span className="flex items-center gap-2 justify-end md:justify-start">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_#22c55e]"></span>
              <span className="text-xs font-mono text-green-500">{cap.status}</span>
            </span>
            {/* Mobile View Title */}
            <span className="col-span-2 font-medium tracking-wide md:hidden mt-2">{cap.name}</span>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
