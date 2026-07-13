"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";
import { LucideIcon, Database, BrainCircuit, Search, Zap, Shield, Lock } from "lucide-react";

type IconName = "database" | "brain" | "search" | "zap" | "shield" | "lock";

const IconMap: Record<IconName, LucideIcon> = {
  database: Database,
  brain: BrainCircuit,
  search: Search,
  zap: Zap,
  shield: Shield,
  lock: Lock,
};

interface FeatureProps {
  num: string;
  title: string;
  subtitle: string;
  description: string;
  tags: string[];
  primaryIcon: IconName;
  secondaryIcon: IconName;
  primaryLabel: string;
  secondaryLabel: string;
  align?: "left" | "right";
}

export default function SectionFeatures({ 
  num, title, subtitle, description, tags, 
  primaryIcon, secondaryIcon,
  primaryLabel, secondaryLabel, align = "left" 
}: FeatureProps) {
  
  const PrimaryIcon = IconMap[primaryIcon];
  const SecondaryIcon = IconMap[secondaryIcon];
  
  const textContent = (
    <div className="flex flex-col gap-6">
      <h2 className="text-5xl md:text-7xl font-bold tracking-tight">
        <span className="text-mask"><motion.span initial={{y: "100%"}} whileInView={{y: 0}} viewport={{once: true}} transition={{duration: 0.5}} className="text-mask-inner">{title}.</motion.span></span>
      </h2>
      <motion.p 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1, delay: 0.2 }}
        className="text-lg text-text-secondary max-w-md leading-relaxed"
      >
        {description}
      </motion.p>
      <motion.div 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1, delay: 0.4 }}
        className="flex flex-wrap gap-3 mt-4"
      >
        {tags.map((tag, i) => (
          <span key={i} className="text-[10px] font-mono tracking-widest uppercase px-3 py-1.5 border border-border-glass rounded-full text-text-secondary">
            {tag}
          </span>
        ))}
      </motion.div>
    </div>
  );

  const imagesContent = (
    <div className="relative w-full h-[500px] mt-12 lg:mt-0">
      {/* Primary Image Frame */}
      <motion.div 
        initial={{ opacity: 0, x: align === "left" ? 50 : -50 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className={`absolute top-0 ${align === "left" ? "right-0 lg:right-12" : "left-0 lg:left-12"} w-[80%] md:w-[60%] h-[70%] img-frame flex items-center justify-center bg-gradient-to-tr from-white/10 to-transparent z-10 backdrop-blur-md`}
      >
        <span className="img-frame-label top-4 left-4">{primaryLabel}</span>
        <PrimaryIcon className="w-16 h-16 text-white/20" />
      </motion.div>

      {/* Secondary Image Frame (Overlapping) */}
      <motion.div 
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className={`absolute bottom-0 ${align === "left" ? "left-0" : "right-0"} w-[70%] md:w-[50%] h-[60%] img-frame flex items-center justify-center bg-gradient-to-bl from-white/10 to-transparent z-20 backdrop-blur-xl shadow-2xl`}
      >
        <span className="img-frame-label top-4 left-4">{secondaryLabel}</span>
        <SecondaryIcon className="w-12 h-12 text-white/40" />
      </motion.div>
    </div>
  );

  return (
    <section className="section-container">
      <div className="section-eyebrow">
        <span className="eyebrow-num">{num}</span>
        <span className="text-white font-medium">{title}</span>
        <span className="hidden md:inline-block ml-2 opacity-50">— {subtitle}</span>
      </div>

      <div className="grid lg:grid-cols-2 gap-12 lg:gap-24 items-center">
        {align === "left" ? (
          <>
            {textContent}
            {imagesContent}
          </>
        ) : (
          <>
            <div className="order-2 lg:order-1">{imagesContent}</div>
            <div className="order-1 lg:order-2">{textContent}</div>
          </>
        )}
      </div>
    </section>
  );
}
