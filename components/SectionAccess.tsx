"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export default function SectionAccess() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [usage, setUsage] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    setIsSubmitting(true);
    // Simulate brief API call latency
    await new Promise(resolve => setTimeout(resolve, 800));
    setIsSubmitted(true);
    setIsSubmitting(false);
  };

  return (
    <section className="section-container" id="access">
      <div className="section-eyebrow">
        <span className="eyebrow-num">007</span>
        <span className="text-white font-medium">Early Access</span>
      </div>

      <div className="grid lg:grid-cols-2 gap-12 lg:gap-24 items-start">
        <div className="flex flex-col gap-6">
          <h2 className="text-4xl md:text-6xl font-bold leading-tight">
            <span className="text-mask"><motion.span initial={{y: "100%"}} whileInView={{y: 0}} viewport={{once: true}} transition={{duration: 0.5}} className="text-mask-inner">Be among</motion.span></span>
            <span className="text-mask"><motion.span initial={{y: "100%"}} whileInView={{y: 0}} viewport={{once: true}} transition={{duration: 0.5, delay: 0.1}} className="text-mask-inner text-text-secondary">the first.</motion.span></span>
          </h2>
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.4 }}
            className="text-lg text-text-secondary max-w-md leading-relaxed"
          >
            The Personal Knowledge OS is preparing for launch. Request early access to receive exclusive updates and secure your private instance.
          </motion.p>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="glass-card rounded-2xl p-8 shadow-2xl relative overflow-hidden"
        >
          {isSubmitted ? (
            <div className="flex flex-col items-center justify-center text-center py-16 gap-6 relative z-10">
              <div className="w-16 h-16 rounded-full bg-white/5 border border-white/20 flex items-center justify-center text-white scale-110 shadow-[0_0_20px_rgba(255,255,255,0.15)]">
                ✓
              </div>
              <div className="flex flex-col gap-2">
                <h3 className="text-2xl font-bold tracking-tight text-white">You're on the list!</h3>
                <p className="text-sm text-text-secondary max-w-sm leading-relaxed">
                  Thank you, <strong className="text-white">{name}</strong>. We've registered <strong className="text-white">{email}</strong> for early access and will contact you as soon as your instance is ready.
                </p>
              </div>
            </div>
          ) : (
            <form className="flex flex-col gap-6 relative z-10" onSubmit={handleSubmit}>
              <div className="flex flex-col gap-2">
                <label htmlFor="name" className="text-xs font-mono text-text-secondary uppercase tracking-widest">Full Name</label>
                <input 
                  type="text" 
                  id="name" 
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your full name" 
                  className="bg-white/5 border border-border-glass rounded-lg px-4 py-3 text-white focus:outline-none focus:border-white/50 transition-colors" 
                />
              </div>
              
              <div className="flex flex-col gap-2">
                <label htmlFor="email" className="text-xs font-mono text-text-secondary uppercase tracking-widest">Email Address</label>
                <input 
                  type="email" 
                  id="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com" 
                  className="bg-white/5 border border-border-glass rounded-lg px-4 py-3 text-white focus:outline-none focus:border-white/50 transition-colors" 
                />
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="usage" className="text-xs font-mono text-text-secondary uppercase tracking-widest">Primary Use Case <span className="opacity-50">— Optional</span></label>
                <input 
                  type="text" 
                  id="usage" 
                  value={usage}
                  onChange={(e) => setUsage(e.target.value)}
                  placeholder="Research, studying, building..." 
                  className="bg-white/5 border border-border-glass rounded-lg px-4 py-3 text-white focus:outline-none focus:border-white/50 transition-colors" 
                />
              </div>

              <div className="mt-4 pt-6 border-t border-border-glass flex flex-col sm:flex-row items-center justify-between gap-6">
                <p className="text-[10px] font-mono text-text-secondary max-w-[200px]">
                  Your information remains private. No spam. Local-first ethos.
                </p>
                <button type="submit" disabled={isSubmitting} className="w-full sm:w-auto px-6 py-3 bg-white text-black font-medium rounded-full flex items-center justify-center gap-2 hover:scale-105 transition-transform disabled:opacity-50 disabled:scale-100">
                  {isSubmitting ? "Submitting..." : "Request Early Access"}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* Background grid for form */}
          <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{
            backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.5) 1px, transparent 1px)',
            backgroundSize: '20px 20px',
          }}></div>
        </motion.div>
      </div>
    </section>
  );
}
