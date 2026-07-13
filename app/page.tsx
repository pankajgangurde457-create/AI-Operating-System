import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import BackgroundEffects from "@/components/BackgroundEffects";
import SectionStatement from "@/components/SectionStatement";
import SectionCapabilities from "@/components/SectionCapabilities";
import SectionFeatures from "@/components/SectionFeatures";
import SectionPrinciple from "@/components/SectionPrinciple";
import SectionAccess from "@/components/SectionAccess";
import Footer from "@/components/Footer";

import { BrainCircuit, Database, Search, Shield, Zap, Lock } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-transparent font-sans selection:bg-white/20 selection:text-white">
      <BackgroundEffects />
      <Navbar />
      
      {/* 000: HERO */}
      <Hero />

      {/* 001: STATEMENT */}
      <SectionStatement />

      {/* 002: CORE CAPABILITIES */}
      <SectionCapabilities />

      {/* 003: MEMORY & RETRIEVAL */}
      <SectionFeatures 
        num="003"
        title="Memory"
        subtitle="Context Retention System"
        description="A second brain that actually remembers. By leveraging local vector databases, the AI OS recalls your past conversations, uploaded documents, and core concepts."
        tags={["VECTOR DB", "RAG PIPELINE", "LONG-TERM RECALL"]}
        primaryIcon="database"
        secondaryIcon="brain"
        primaryLabel="VECTOR EMBEDDINGS"
        secondaryLabel="KNOWLEDGE GRAPH"
        align="left"
      />

      {/* 004: CONTEXT-AWARE CHAT */}
      <SectionFeatures 
        num="004"
        title="Chat"
        subtitle="Semantic Understanding"
        description="Chat with your entire knowledge base. It's not just retrieving text; it understands the semantic relationships between your files and synthesizes accurate answers."
        tags={["SEMANTIC SEARCH", "SYNTHESIS", "CITATION TRACING"]}
        primaryIcon="search"
        secondaryIcon="zap"
        primaryLabel="SEMANTIC ANALYSIS"
        secondaryLabel="REAL-TIME SYNTHESIS"
        align="right"
      />

      {/* 005: SECURITY & PRIVACY */}
      <SectionFeatures 
        num="005"
        title="Security"
        subtitle="Local-First Enclave"
        description="Your data never leaves your machine unless you explicitly allow it. Built with a local-first ethos, ensuring maximum privacy for your most sensitive notes."
        tags={["LOCAL INFERENCE", "END-TO-END ENCRYPTION", "ZERO TELEMETRY"]}
        primaryIcon="shield"
        secondaryIcon="lock"
        primaryLabel="ZERO-TRUST ARCHITECTURE"
        secondaryLabel="LOCAL ENCLAVE"
        align="left"
      />

      {/* 006: PRINCIPLE */}
      <SectionPrinciple />

      {/* 007: EARLY ACCESS */}
      <SectionAccess />

      {/* FOOTER */}
      <Footer />
    </main>
  );
}
