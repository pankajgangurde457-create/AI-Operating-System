import { BrainCircuit } from "lucide-react";
import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 glass border-b border-border-glass">
      <div className="flex items-center gap-2">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/5 border border-white/10">
          <BrainCircuit className="w-5 h-5 text-text-primary" />
        </div>
        <span className="font-semibold text-lg tracking-tight">OS<span className="text-text-secondary">.sys</span></span>
      </div>
      
      <div className="hidden md:flex items-center gap-8 text-sm text-text-secondary">
        <Link href="#features" className="hover:text-text-primary transition-colors">Features</Link>
        <Link href="#memory" className="hover:text-text-primary transition-colors">Memory</Link>
        <Link href="#security" className="hover:text-text-primary transition-colors">Security</Link>
      </div>

      <div className="flex items-center gap-4">
        <Link href="/login" className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors">
          Log in
        </Link>
        <Link href="#access" className="px-4 py-2 text-sm font-medium bg-white text-black rounded-full hover:bg-gray-200 transition-colors shadow-[0_0_15px_rgba(255,255,255,0.3)]">
          Join Waitlist
        </Link>
      </div>
    </nav>
  );
}
