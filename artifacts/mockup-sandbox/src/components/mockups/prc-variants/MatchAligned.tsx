import React from "react";
import { 
  CheckCircle2, 
  Settings, 
  Activity, 
  Server, 
  UserCircle,
  Link as LinkIcon,
  Search,
  AlertCircle
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const modalities: Record<string, string> = {
  CT: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  MR: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
  US: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  XR: "bg-slate-500/20 text-slate-400 border-slate-500/30",
  DX: "bg-orange-500/20 text-orange-400 border-orange-500/30",
};

interface Study {
  id: string;
  patientName: string;
  patientId: string;
  modality: string;
  procedure: string;
  time: string;
  status: "new" | "linked" | "unmatched";
  matchConfidence?: number;
  accessionNumber?: string;
}

interface WorklistItem {
  id: string;
  patientName: string;
  patientId: string;
  modality: string;
  procedure: string;
  status: "scheduled" | "in-progress" | "completed";
  accessionNumber: string;
  scheduledTime: string;
}

const receivedStudies: Study[] = [
  { id: "S1", patientName: "Silva, Maria J.", patientId: "MRN-84920", modality: "CT", procedure: "CT Torax S/C", time: "10:42 AM", status: "new", matchConfidence: 98, accessionNumber: "ACC-100234" },
  { id: "S2", patientName: "Chen, David W.", patientId: "MRN-33019", modality: "MR", procedure: "MR Brain W/WO", time: "10:35 AM", status: "linked", matchConfidence: 100, accessionNumber: "ACC-100231" },
  { id: "S3", patientName: "Johnson, Robert", patientId: "MRN-11029", modality: "US", procedure: "US Abdomen Complete", time: "10:15 AM", status: "linked", matchConfidence: 100, accessionNumber: "ACC-100228" },
  { id: "S4", patientName: "Garcia, Elena", patientId: "MRN-99210", modality: "CT", procedure: "CT Abdomen/Pelvis", time: "09:55 AM", status: "new", matchConfidence: 85, accessionNumber: "ACC-100225" },
  { id: "S5", patientName: "Unknown Patient", patientId: "UNKNOWN", modality: "DX", procedure: "Chest X-Ray 2 Views", time: "09:40 AM", status: "unmatched" },
];

const worklistItems: WorklistItem[] = [
  { id: "W1", patientName: "Silva, Maria J.", patientId: "MRN-84920", modality: "CT", procedure: "CT Torax S/C", status: "scheduled", accessionNumber: "ACC-100234", scheduledTime: "10:30 AM" },
  { id: "W2", patientName: "Chen, David W.", patientId: "MRN-33019", modality: "MR", procedure: "MR Brain W/WO", status: "completed", accessionNumber: "ACC-100231", scheduledTime: "09:00 AM" },
  { id: "W3", patientName: "Johnson, Robert", patientId: "MRN-11029", modality: "US", procedure: "US Abdomen Complete", status: "completed", accessionNumber: "ACC-100228", scheduledTime: "08:30 AM" },
  { id: "W4", patientName: "Garcia, E.", patientId: "MRN-99210", modality: "CT", procedure: "CT Abdomen/Pelvis W/C", status: "in-progress", accessionNumber: "ACC-100225", scheduledTime: "09:45 AM" },
  { id: "W5", patientName: "Smith, James", patientId: "MRN-55392", modality: "MR", procedure: "MR C-Spine", status: "scheduled", accessionNumber: "ACC-100235", scheduledTime: "11:00 AM" },
  { id: "W6", patientName: "Wong, Emily", patientId: "MRN-22940", modality: "US", procedure: "US Pelvis", status: "scheduled", accessionNumber: "ACC-100236", scheduledTime: "11:30 AM" },
];

// Map rows to create perfect alignment
const alignedRows = [
  { study: receivedStudies[0], worklist: worklistItems[0] }, // Silva
  { study: receivedStudies[1], worklist: worklistItems[1] }, // Chen
  { study: receivedStudies[2], worklist: worklistItems[2] }, // Johnson
  { study: receivedStudies[3], worklist: worklistItems[3] }, // Garcia
  { study: null, worklist: worklistItems[4] }, // Smith (no study yet)
  { study: null, worklist: worklistItems[5] }, // Wong (no study yet)
];

const unmatchedStudies = receivedStudies.filter(s => s.status === "unmatched");

export function MatchAligned() {
  return (
    <div className="flex flex-col h-screen w-full bg-[#0a0f18] text-slate-300 font-sans overflow-hidden">
      {/* Header */}
      <header className="flex-none h-14 border-b border-slate-800 bg-[#0f1522] flex items-center justify-between px-6 z-10 relative shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-blue-600/20 border border-blue-500/50 flex items-center justify-center">
            <Activity className="w-5 h-5 text-blue-400" />
          </div>
          <h1 className="text-slate-100 font-semibold text-lg tracking-tight">Preserve Receiver</h1>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4 text-xs font-medium bg-[#0a0f18] px-4 py-1.5 rounded-full border border-slate-800">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-slate-400 uppercase tracking-wider">PACS</span>
            </div>
            <div className="w-px h-3 bg-slate-700" />
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-slate-400 uppercase tracking-wider">RIS</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3 border-l border-slate-800 pl-6">
            <div className="text-right hidden md:block">
              <div className="text-sm font-medium text-slate-200">Dr. Sarah Jenkins</div>
              <div className="text-xs text-slate-500">Lead Radiologist</div>
            </div>
            <Avatar />
            <Button variant="ghost" size="icon" className="text-slate-400 hover:text-slate-100">
              <Settings className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="flex-1 flex flex-col min-h-0 overflow-hidden relative">
        <div className="flex flex-1 min-h-0 relative z-0">
          
          {/* Background Grid Lines for Alignment */}
          <div className="absolute inset-0 pointer-events-none" style={{
            backgroundImage: `linear-gradient(to bottom, transparent 119px, rgba(30, 41, 59, 0.3) 120px)`,
            backgroundSize: `100% 120px`
          }}></div>

          {/* PACS Column */}
          <div className="flex-1 flex flex-col min-w-0 border-r border-slate-800 relative z-10 bg-[#0a0f18]/80 backdrop-blur-sm">
            <div className="h-12 border-b border-slate-800/80 bg-[#0f1522]/95 flex items-center justify-between px-6 sticky top-0 z-20">
              <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                <Server className="w-4 h-4 text-blue-400" />
                RECEIVED STUDIES
              </h2>
              <Badge variant="secondary" className="bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 rounded-full">
                {receivedStudies.length} New
              </Badge>
            </div>
            <div className="flex-1 overflow-y-auto pt-4 pb-32 no-scrollbar">
              <div className="flex flex-col gap-[20px] px-6">
                {alignedRows.map((row, i) => (
                  <div key={`pacs-${i}`} className="h-[100px] flex items-center justify-end w-full">
                    {row.study ? (
                      <StudyCard study={row.study} isMatched={!!row.worklist} />
                    ) : (
                      <div className="w-full h-full border border-dashed border-slate-800 rounded-lg flex items-center justify-center bg-slate-900/20">
                        <span className="text-slate-600 text-sm">Waiting for incoming study...</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Connection / Match Zone */}
          <div className="w-32 flex-none flex flex-col relative z-0 bg-[#0a0f18]">
            <div className="h-12 border-b border-slate-800/80 bg-[#0f1522]/95 sticky top-0 z-20 flex items-center justify-center">
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Match</div>
            </div>
            <div className="flex-1 overflow-y-auto pt-4 pb-32 no-scrollbar relative">
              {/* Center Line */}
              <div className="absolute left-1/2 top-0 bottom-0 w-px bg-slate-800 -translate-x-1/2 z-0" />
              
              <div className="flex flex-col gap-[20px] px-2 h-full">
                {alignedRows.map((row, i) => (
                  <div key={`link-${i}`} className="h-[100px] flex items-center justify-center w-full relative z-10">
                    {row.study && row.worklist && (
                      <MatchConnector study={row.study} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIS Column */}
          <div className="flex-1 flex flex-col min-w-0 border-l border-slate-800 relative z-10 bg-[#0a0f18]/80 backdrop-blur-sm">
            <div className="h-12 border-b border-slate-800/80 bg-[#0f1522]/95 flex items-center justify-between px-6 sticky top-0 z-20">
              <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400" />
                RIS WORKLIST
              </h2>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <Input 
                  placeholder="Filter worklist..." 
                  className="h-8 w-48 bg-slate-900 border-slate-700 text-sm pl-9 focus-visible:ring-1 focus-visible:ring-emerald-500/50"
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto pt-4 pb-32 no-scrollbar">
              <div className="flex flex-col gap-[20px] px-6">
                {alignedRows.map((row, i) => (
                  <div key={`ris-${i}`} className="h-[100px] flex items-center justify-start w-full">
                    {row.worklist && (
                      <WorklistCard item={row.worklist} isMatched={!!row.study && row.study.status === 'linked'} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Unmatched Holding Area */}
        {unmatchedStudies.length > 0 && (
          <div className="absolute bottom-8 left-6 right-[calc(50%+4rem)] bg-[#121927] border border-slate-700 rounded-xl p-4 shadow-2xl flex flex-col gap-3 z-30 transform transition-all hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-amber-400">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm font-semibold">Unmatched Studies ({unmatchedStudies.length})</span>
              </div>
              <Button variant="ghost" size="sm" className="h-6 text-xs text-slate-400 hover:text-slate-200">View All</Button>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-1 no-scrollbar">
              {unmatchedStudies.map(study => (
                <div key={study.id} className="flex-none w-[300px] bg-[#0a0f18] border border-slate-700/50 rounded-lg p-3 flex flex-col gap-2">
                  <div className="flex items-start justify-between">
                    <span className="font-medium text-slate-200 truncate">{study.patientName}</span>
                    <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0 h-5 border", modalities[study.modality])}>
                      {study.modality}
                    </Badge>
                  </div>
                  <div className="text-xs text-slate-500 flex justify-between">
                    <span>{study.patientId}</span>
                    <span>{study.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>

      {/* Footer Status */}
      <footer className="flex-none h-8 border-t border-slate-800 bg-[#0a0f18] flex items-center px-4 text-[11px] text-slate-500 justify-between z-20">
        <div>System Healthy • Last Sync: Just now</div>
        <div className="flex items-center gap-4">
          <span>Auto-matching enabled</span>
          <span>v2.4.1</span>
        </div>
      </footer>
    </div>
  );
}

function StudyCard({ study, isMatched }: { study: Study, isMatched: boolean }) {
  const isNewMatch = study.status === "new" && isMatched;
  const isLinked = study.status === "linked";

  return (
    <div className={cn(
      "w-full h-full rounded-xl border p-4 flex flex-col justify-between transition-all relative group overflow-hidden",
      isNewMatch ? "bg-blue-950/20 border-blue-500/40 shadow-[0_0_15px_rgba(59,130,246,0.1)]" : 
      isLinked ? "bg-slate-900/50 border-slate-700/50 opacity-70" : 
      "bg-slate-900 border-slate-700"
    )}>
      {isNewMatch && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/5 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite]" />
      )}
      
      <div className="flex justify-between items-start z-10">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <h3 className={cn("font-semibold text-base truncate", isLinked ? "text-slate-400" : "text-slate-100")}>
              {study.patientName}
            </h3>
            {isNewMatch && (
              <span className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)] animate-pulse" />
            )}
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
            <span>{study.patientId}</span>
            <span className="text-slate-600">•</span>
            <span>{study.accessionNumber}</span>
          </div>
        </div>
        <Badge variant="outline" className={cn("text-xs font-medium border", modalities[study.modality])}>
          {study.modality}
        </Badge>
      </div>

      <div className="flex justify-between items-end z-10 mt-auto">
        <div className="text-sm text-slate-300 truncate max-w-[70%]">
          {study.procedure}
        </div>
        <div className="text-xs font-medium text-slate-500 bg-slate-950/50 px-2 py-1 rounded">
          {study.time}
        </div>
      </div>
    </div>
  );
}

function WorklistCard({ item, isMatched }: { item: WorklistItem, isMatched: boolean }) {
  const isCompleted = item.status === "completed";
  const isInProgress = item.status === "in-progress";

  return (
    <div className={cn(
      "w-full h-full rounded-xl border p-4 flex flex-col justify-between transition-all relative",
      isCompleted ? "bg-slate-900/30 border-slate-800 opacity-50" : 
      isInProgress ? "bg-emerald-950/20 border-emerald-500/30" : 
      "bg-[#121927] border-slate-700"
    )}>
      <div className="flex justify-between items-start">
        <div className="flex flex-col gap-1">
          <h3 className={cn("font-semibold text-base truncate", isCompleted ? "text-slate-500" : "text-slate-200")}>
            {item.patientName}
          </h3>
          <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
            <span>{item.patientId}</span>
            <span className="text-slate-600">•</span>
            <span>{item.accessionNumber}</span>
          </div>
        </div>
        <Badge variant="outline" className={cn("text-xs font-medium border", modalities[item.modality])}>
          {item.modality}
        </Badge>
      </div>

      <div className="flex justify-between items-end mt-auto">
        <div className="text-sm text-slate-300 truncate max-w-[70%]">
          {item.procedure}
        </div>
        <div className={cn(
          "text-xs font-medium px-2 py-1 rounded",
          isCompleted ? "text-slate-500 bg-slate-900" :
          isInProgress ? "text-emerald-400 bg-emerald-950/50" :
          "text-slate-400 bg-slate-900/80"
        )}>
          {item.scheduledTime}
        </div>
      </div>
    </div>
  );
}

function MatchConnector({ study }: { study: Study }) {
  const isLinked = study.status === "linked";
  const confidence = study.matchConfidence || 0;
  
  if (isLinked) {
    return (
      <div className="w-full flex items-center justify-center relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full h-px bg-slate-700" />
        </div>
        <div className="w-8 h-8 rounded-full bg-[#0a0f18] border border-slate-700 flex items-center justify-center z-10 text-slate-500">
          <CheckCircle2 className="w-4 h-4" />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex items-center justify-center relative group">
      {/* Animated Connection Line */}
      <div className="absolute inset-0 flex items-center">
        <div className="w-full h-[2px] bg-gradient-to-r from-blue-500/50 via-blue-400 to-emerald-500/50" />
      </div>
      
      {/* Match Action Button */}
      <Button 
        variant="default"
        className="w-14 h-14 rounded-full bg-blue-600 hover:bg-blue-500 border-[4px] border-[#0a0f18] shadow-[0_0_20px_rgba(59,130,246,0.4)] z-10 flex flex-col items-center justify-center gap-0.5 transition-transform hover:scale-110"
      >
        <LinkIcon className="w-4 h-4 text-white" />
        <span className="text-[10px] font-bold text-blue-100">{confidence}%</span>
      </Button>

      {/* Connection glow */}
      <div className="absolute left-0 right-0 h-12 bg-gradient-to-r from-blue-500/10 via-blue-400/20 to-emerald-500/10 blur-md -z-10 opacity-50 group-hover:opacity-100 transition-opacity" />
    </div>
  );
}

function Avatar() {
  return (
    <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center overflow-hidden border border-slate-700">
      <UserCircle className="w-full h-full text-slate-400 p-0.5" />
    </div>
  );
}
