import Sidebar from "@/components/Sidebar";
import BackgroundEffects from "@/components/BackgroundEffects";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const userEmail = user?.email || "demo@ai-os.dev";

  return (
    <div className="min-h-screen bg-transparent font-sans text-white flex">
      {/* Background layer */}
      <BackgroundEffects />
      
      {/* Sidebar fixed to the left */}
      <Sidebar userEmail={userEmail} />

      {/* Main Content Area */}
      <main className="flex-1 ml-64 min-h-screen relative z-10 flex flex-col">
        {children}
      </main>
    </div>
  );
}
