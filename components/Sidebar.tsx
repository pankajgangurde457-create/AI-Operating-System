"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, MessageSquare, Database, BrainCircuit, Settings, LogOut } from "lucide-react";
import clsx from "clsx";
import { logout } from "@/app/login/actions";

const navItems = [
  { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { name: "Chat", href: "/dashboard/chat", icon: MessageSquare },
  { name: "Knowledge Base", href: "/dashboard/knowledge", icon: Database },
  { name: "Memory", href: "/dashboard/memory", icon: BrainCircuit },
];

export default function Sidebar({ userEmail }: { userEmail?: string }) {
  const pathname = usePathname();

  return (
    <aside className="w-64 h-screen fixed left-0 top-0 border-r border-border-glass bg-black/50 backdrop-blur-xl flex flex-col z-50">
      {/* Brand */}
      <div className="h-16 flex items-center px-6 border-b border-border-glass">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-white relative">
            <span className="absolute inset-0 bg-white blur-[4px]"></span>
          </span>
          <span className="font-bold tracking-widest uppercase text-sm">AI OS</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6 px-3 flex flex-col gap-2">
        <div className="px-3 mb-2 text-[10px] font-mono text-text-secondary tracking-widest uppercase">
          Menu
        </div>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={clsx(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                isActive 
                  ? "bg-white/10 text-white font-medium shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]" 
                  : "text-text-secondary hover:bg-white/5 hover:text-white"
              )}
            >
              <Icon className={clsx("w-4 h-4", isActive ? "text-white" : "text-text-secondary")} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Footer / User Profile */}
      <div className="p-4 border-t border-border-glass flex flex-col gap-2">
        <Link 
          href="/dashboard/settings"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-text-secondary hover:bg-white/5 hover:text-white transition-colors"
        >
          <Settings className="w-4 h-4" />
          Settings
        </Link>
        
        <div className="flex items-center justify-between px-3 py-2 mt-2 border border-border-glass rounded-lg bg-white/5">
          <div className="flex items-center gap-2 truncate">
            <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center shrink-0">
              <span className="text-xs font-medium text-white">{userEmail?.charAt(0).toUpperCase() || 'U'}</span>
            </div>
            <span className="text-xs text-text-secondary truncate">{userEmail || 'user@ai-os.dev'}</span>
          </div>
          <button 
            onClick={() => logout()}
            className="text-text-secondary hover:text-red-400 transition-colors p-1"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
