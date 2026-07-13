export default function Footer() {
  return (
    <footer className="w-full border-t border-border-glass py-12 relative z-10 bg-black/50 backdrop-blur-sm mt-32">
      <div className="container mx-auto px-6 md:px-12 lg:px-24 flex flex-col md:flex-row justify-between items-center gap-8">
        
        <div className="flex items-center gap-4 text-xs font-mono tracking-widest text-text-secondary uppercase">
          <span className="w-4 h-4 rounded-full bg-white flex items-center justify-center relative">
            <span className="w-2 h-2 rounded-full bg-black"></span>
          </span>
          <span>© 2026 AI OS</span>
        </div>

        <div className="text-xs font-mono tracking-widest text-white/40 uppercase">
          ENGINEERED FOR PRIVACY
        </div>

        <div className="flex items-center gap-6 text-xs font-mono tracking-widest uppercase">
          <a href="#" className="text-text-secondary hover:text-white transition-colors">Documentation</a>
          <a href="#" className="text-text-secondary hover:text-white transition-colors">Privacy</a>
          <a href="#" className="text-text-secondary hover:text-white transition-colors">Contact</a>
        </div>
        
      </div>
    </footer>
  );
}
