import Sidebar from "@/components/Sidebar";
import BackgroundEffects from "@/components/BackgroundEffects";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-transparent font-sans text-white flex">
      {/* Background layer */}
      <BackgroundEffects />
      
      {/* Sidebar fixed to the left */}
      <Sidebar userEmail="demo@ai-os.dev" />

      {/* Main Content Area */}
      <main className="flex-1 ml-64 min-h-screen relative z-10 flex flex-col">
        {children}
      </main>
    </div>
  );
}
