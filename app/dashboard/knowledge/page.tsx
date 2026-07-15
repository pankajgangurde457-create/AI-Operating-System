"use client";

import { useState, useRef, useEffect } from "react";
import { Database, UploadCloud, Search, FileText, Image as ImageIcon, Music, MoreVertical, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const mockFiles = [
  { name: "Q3_Financial_Report.pdf", type: "PDF", size: "2.4 MB", date: "Oct 12, 2026", icon: FileText },
  { name: "Project_Qwerty_Architecture.docx", type: "DOCX", size: "1.1 MB", date: "Oct 10, 2026", icon: FileText },
  { name: "Brainstorming_Session.mp3", type: "AUDIO", size: "14.2 MB", date: "Oct 08, 2026", icon: Music },
  { name: "Whiteboard_Diagram.jpg", type: "IMAGE", size: "3.8 MB", date: "Oct 07, 2026", icon: ImageIcon },
  { name: "Research_Notes_Agentic_AI.txt", type: "TXT", size: "45 KB", date: "Oct 05, 2026", icon: FileText },
  { name: "Meeting_Transcript_Sales.txt", type: "TXT", size: "120 KB", date: "Oct 01, 2026", icon: FileText },
];

export default function KnowledgeBase() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [files, setFiles] = useState<any[]>([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(true);
  const supabase = createClient();

  const fetchFiles = async () => {
    try {
      setIsLoadingFiles(true);
      const { data, error } = await supabase
        .from("files")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setFiles(data || []);
    } catch (err) {
      console.error("Error fetching files from Supabase:", err);
    } finally {
      setIsLoadingFiles(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadStatus(`Ingesting ${file.name}...`);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/ingest", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || "Upload failed");
      
      setUploadStatus(`Success: ${data.message}`);
      if (fileInputRef.current) fileInputRef.current.value = "";
      await fetchFiles();
    } catch (error: any) {
      setUploadStatus(`Error: ${error.message} (Are API keys set up?)`);
    } finally {
      setIsUploading(false);
      setTimeout(() => setUploadStatus(""), 8000);
    }
  };

  return (
    <div className="flex-1 flex flex-col p-8 max-w-6xl mx-auto w-full pb-24">
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Database className="w-6 h-6" />
            Knowledge Base
          </h1>
          <p className="text-sm text-text-secondary">Manage and explore your ingested files and memories.</p>
        </div>
        
        <div className="flex flex-col gap-2">
          <input 
            type="file" 
            className="hidden" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            accept=".pdf,.txt,.md,.csv" 
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-white text-black font-medium rounded-lg hover:bg-gray-200 transition-colors text-sm shadow-[0_0_15px_rgba(255,255,255,0.1)] disabled:opacity-50"
          >
            {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
            {isUploading ? "Ingesting..." : "Upload Data"}
          </button>
        </div>
      </header>

      {uploadStatus && (
        <div className="mb-8 p-4 rounded-xl border border-border-glass bg-white/5 text-sm font-mono flex items-center gap-3 text-white">
          {isUploading && <Loader2 className="w-4 h-4 animate-spin" />}
          {uploadStatus}
        </div>
      )}

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <input 
            type="text" 
            placeholder="Search files, tags, or content..." 
            className="w-full bg-white/5 border border-border-glass rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-white/40 transition-colors text-white"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
        </div>
        <div className="flex gap-2">
          <select className="bg-white/5 border border-border-glass rounded-lg px-4 py-2.5 text-sm focus:outline-none appearance-none text-text-secondary min-w-[120px]">
            <option>All Types</option>
            <option>PDFs</option>
            <option>Documents</option>
            <option>Images</option>
            <option>Audio</option>
          </select>
          <select className="bg-white/5 border border-border-glass rounded-lg px-4 py-2.5 text-sm focus:outline-none appearance-none text-text-secondary min-w-[120px]">
            <option>Recent</option>
            <option>Oldest</option>
            <option>Size (Large)</option>
          </select>
        </div>
      </div>

      {/* Grid View */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoadingFiles ? (
          <div className="col-span-full text-center py-12 text-text-secondary font-mono text-sm">
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-white" />
            Loading knowledge base...
          </div>
        ) : files.length === 0 ? (
          <div className="col-span-full text-center py-12 text-text-secondary font-mono text-sm border border-dashed border-border-glass rounded-xl bg-white/5">
            No dynamic files found. Showing mock system baseline:
          </div>
        ) : null}

        {(files.length > 0 ? files : mockFiles).map((file, i) => {
          let Icon = FileText;
          let typeLabel = "TXT";
          
          if (file.file_type === "application/pdf" || file.type === "PDF") {
            Icon = FileText;
            typeLabel = "PDF";
          } else if (file.file_type?.startsWith("image/") || file.type === "IMAGE") {
            Icon = ImageIcon;
            typeLabel = "IMAGE";
          } else if (file.file_type?.startsWith("audio/") || file.type === "AUDIO") {
            Icon = Music;
            typeLabel = "AUDIO";
          }

          const name = file.file_name || file.name;
          const size = file.file_size || file.size;
          const date = file.created_at 
            ? new Date(file.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) 
            : file.date;

          return (
            <div key={file.id || i} className="glass-card rounded-xl border border-border-glass p-5 flex flex-col gap-4 group hover:border-white/20 transition-colors relative overflow-hidden cursor-pointer">
              <div className="flex justify-between items-start z-10">
                <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Icon className="w-5 h-5 text-white/80" />
                </div>
                <button className="text-text-secondary hover:text-white transition-colors">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
              
              <div className="flex flex-col gap-1 z-10 mt-2">
                <h3 className="text-sm font-medium text-white truncate" title={name}>{name}</h3>
                <div className="flex items-center gap-3 text-xs font-mono text-text-secondary tracking-wider">
                  <span>{typeLabel}</span>
                  <span className="w-1 h-1 rounded-full bg-border-glass"></span>
                  <span>{size}</span>
                </div>
              </div>
              
              <div className="mt-2 text-[10px] font-mono text-text-secondary uppercase tracking-widest pt-4 border-t border-border-glass z-10">
                Ingested {date}
              </div>

              {/* Hover effect background */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </div>
          )
        })}
      </div>
    </div>
  );
}
