"use client";

import { motion } from "framer-motion";
import { FileText, Image as ImageIcon, Folder, MessageSquare } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col pt-20 overflow-hidden z-10">
      <div className="flex-1 container mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
        
        {/* Left side: Text & Neural Network Representation */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex flex-col gap-8 z-10"
        >
          <div className="flex items-center gap-3 text-xs font-mono tracking-widest text-text-secondary uppercase">
            <span>EST. 2026</span>
            <span className="w-4 h-[1px] bg-border-glass"></span>
            <span>STEALTH MODE</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-tight text-glow">
            <span className="block overflow-hidden"><motion.span initial={{y: 50}} animate={{y: 0}} transition={{delay: 0.1, duration: 0.6}} className="block">Building the</motion.span></span>
            <span className="block overflow-hidden"><motion.span initial={{y: 50}} animate={{y: 0}} transition={{delay: 0.2, duration: 0.6}} className="block">Future of</motion.span></span>
            <span className="block overflow-hidden">
              <motion.span initial={{y: 50}} animate={{y: 0}} transition={{delay: 0.3, duration: 0.6}} className="block text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-400 to-gray-600">
                Knowledge.
              </motion.span>
            </span>
          </h1>
          
          <div className="w-12 h-[1px] bg-white/20"></div>

          <p className="text-lg md:text-xl text-text-secondary max-w-xl leading-relaxed">
            Intelligent systems. Autonomous search.<br />
            Contextual memory. Mission intelligence.<br />
            <strong>Launching soon.</strong>
          </p>
          
          <div className="flex items-center gap-4 pt-4">
            <a href="#access" className="px-6 py-3 bg-white text-black font-medium rounded-full hover:scale-105 transition-transform shadow-[0_0_20px_rgba(255,255,255,0.2)] text-center">
              Request Early Access
            </a>
            <a href="#access" className="px-6 py-3 font-medium rounded-full border border-border-glass hover:bg-white/5 transition-colors text-center">
              Join Waitlist
            </a>
          </div>
        </motion.div>

        {/* Right side: Floating UI Elements Frame */}
        <div className="relative h-[500px] w-full hidden lg:block perspective-1000">
          <div className="img-frame w-full h-full absolute inset-0 flex items-center justify-center p-8">
            <span className="img-frame-label top-4 left-4">OPAREA-07</span>
            <span className="img-frame-label top-4 right-4">OS/26/001</span>
            <span className="img-frame-label bottom-4 left-4">LOCAL INFERENCE</span>
            <span className="img-frame-label bottom-4 right-4">CLASSIFIED</span>

            <div className="absolute inset-0 flex items-center justify-center transform-gpu preserve-3d rotate-y-[-10deg] rotate-x-[5deg]">
              
              {/* Center Chat Interface */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="absolute w-80 h-96 glass-card rounded-2xl p-6 flex flex-col gap-4 z-20 shadow-2xl"
              >
                <div className="flex items-center gap-3 border-b border-border-glass pb-4">
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                    <MessageSquare className="w-4 h-4 text-white" />
                  </div>
                  <div className="text-sm font-medium">Memory Assistant</div>
                </div>
                <div className="flex-1 flex flex-col gap-3 justify-end pb-2">
                  <div className="bg-white/5 p-3 rounded-xl rounded-tl-none text-sm self-start max-w-[85%]">
                    I've analyzed your recent PDFs. The core theme is neural network architecture.
                  </div>
                  <div className="bg-white p-3 rounded-xl rounded-tr-none text-sm text-black self-end max-w-[85%]">
                    Summarize the key points for my revision notes.
                  </div>
                </div>
              </motion.div>

              {/* Floating File 1 */}
              <motion.div
                initial={{ opacity: 0, x: 50, y: -50 }}
                animate={{ opacity: 1, x: 120, y: -80 }}
                transition={{ duration: 1, delay: 0.6, type: "spring" }}
                className="absolute w-40 glass-card rounded-xl p-4 flex items-center gap-3 z-10"
              >
                <FileText className="w-6 h-6 text-blue-400" />
                <div className="flex flex-col gap-1">
                  <div className="h-2 w-16 bg-white/20 rounded"></div>
                  <div className="h-2 w-10 bg-white/10 rounded"></div>
                </div>
              </motion.div>

              {/* Floating File 2 */}
              <motion.div
                initial={{ opacity: 0, x: -50, y: 50 }}
                animate={{ opacity: 1, x: -100, y: 120 }}
                transition={{ duration: 1, delay: 0.7, type: "spring" }}
                className="absolute w-48 glass-card rounded-xl p-4 flex items-center gap-3 z-30"
              >
                <ImageIcon className="w-6 h-6 text-purple-400" />
                <div className="flex flex-col gap-1">
                  <div className="h-2 w-20 bg-white/20 rounded"></div>
                  <div className="h-2 w-12 bg-white/10 rounded"></div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Status Strip */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
        className="w-full border-t border-border-glass bg-black/40 backdrop-blur-md px-6 py-4 flex flex-wrap gap-8 items-center justify-between text-xs font-mono tracking-widest text-text-secondary uppercase"
      >
        <div className="flex items-center gap-3">
          <span className="text-white/40">PROGRAM</span>
          <span className="text-white font-medium">OS/2026</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-white/40">CLASSIFICATION</span>
          <span className="text-white font-medium">STEALTH</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-white/40">ORIGIN</span>
          <span className="text-white font-medium">LOCAL ENCLAVE</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-white/40">ETA</span>
          <span className="text-white font-medium">2026</span>
        </div>
      </motion.div>
    </section>
  );
}
