"use client";

import { motion } from "framer-motion";
import { Brain } from "lucide-react";

export default function SectionStatement() {
  return (
    <section className="section-container">
      <div className="section-eyebrow">
        <span className="eyebrow-num">001</span>
      </div>
      
      <div className="grid lg:grid-cols-2 gap-12 lg:gap-24 items-end mb-24">
        <h2 className="text-4xl md:text-6xl font-bold leading-tight">
          <span className="text-mask"><motion.span initial={{y: "100%"}} whileInView={{y: 0}} viewport={{once: true}} transition={{duration: 0.5}} className="text-mask-inner">Something</motion.span></span>
          <span className="text-mask"><motion.span initial={{y: "100%"}} whileInView={{y: 0}} viewport={{once: true}} transition={{duration: 0.5, delay: 0.1}} className="text-mask-inner">Significant</motion.span></span>
          <span className="text-mask"><motion.span initial={{y: "100%"}} whileInView={{y: 0}} viewport={{once: true}} transition={{duration: 0.5, delay: 0.2}} className="text-mask-inner text-text-secondary">Is Coming.</motion.span></span>
        </h2>
        
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.4 }}
          className="text-lg text-text-secondary space-y-4 max-w-lg"
        >
          <p>The future of personal knowledge management will not be defined by simple folders and search bars alone.</p>
          <p>It will be shaped by intelligent semantic search, autonomous perception, and real-time retrieval-augmented generation.</p>
          <p>We're building quietly.<br/>When the time is right, you'll be among the first to know.</p>
        </motion.div>
      </div>

      {/* Cinematic Wide Image Band Placeholder */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1 }}
        className="w-full h-64 md:h-96 img-frame flex items-center justify-center bg-gradient-to-br from-white/5 to-transparent"
      >
        <span className="img-frame-label top-4 left-4">CORE MODULE / NEURAL NET</span>
        <span className="img-frame-label bottom-4 right-4">OS/26/RESTRICTED</span>
        
        {/* Placeholder Graphic */}
        <div className="absolute inset-0 flex items-center justify-center opacity-20">
          <div className="w-full max-w-3xl h-full flex items-center justify-between px-12">
            {[1,2,3,4,5].map((i) => (
              <div key={i} className="w-[1px] h-full bg-white/20 relative">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white shadow-[0_0_10px_white]"></div>
              </div>
            ))}
          </div>
        </div>
        <Brain className="w-16 h-16 text-white/30" />
      </motion.div>
    </section>
  );
}
