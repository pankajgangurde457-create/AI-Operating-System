"use client";

import { motion } from "framer-motion";

export default function SectionPrinciple() {
  return (
    <section className="section-container">
      <div className="section-eyebrow">
        <span className="eyebrow-num">006</span>
      </div>
      
      <div className="grid lg:grid-cols-2 gap-12 lg:gap-24 items-center">
        <h2 className="text-4xl md:text-6xl font-bold leading-tight border-l-4 border-white pl-8 py-4">
          <span className="text-mask"><motion.span initial={{y: "100%"}} whileInView={{y: 0}} viewport={{once: true}} transition={{duration: 0.5}} className="text-mask-inner">Your knowledge</motion.span></span>
          <span className="text-mask"><motion.span initial={{y: "100%"}} whileInView={{y: 0}} viewport={{once: true}} transition={{duration: 0.5, delay: 0.1}} className="text-mask-inner">should belong</motion.span></span>
          <span className="text-mask"><motion.span initial={{y: "100%"}} whileInView={{y: 0}} viewport={{once: true}} transition={{duration: 0.5, delay: 0.2}} className="text-mask-inner text-text-secondary">to you.</motion.span></span>
        </h2>
        
        <motion.p 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.4 }}
          className="text-lg text-text-secondary leading-relaxed max-w-lg"
        >
          We believe in local-first principles. Your data is stored securely in your own encrypted enclave. We exist to build intelligent technologies that organize your mind, without harvesting your data for external models.
        </motion.p>
      </div>
    </section>
  );
}
