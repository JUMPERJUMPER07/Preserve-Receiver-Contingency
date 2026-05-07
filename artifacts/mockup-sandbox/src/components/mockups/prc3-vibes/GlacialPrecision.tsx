import React, { useState, useMemo, useEffect, useCallback } from "react";
import {
  Terminal, Check, AlertTriangle, Search, Clock, Link as LinkIcon, BarChart3, Activity,
  Settings, LogOut, RefreshCw, Eye, Inbox, ChevronRight, CheckCircle2, ChevronDown, Monitor, Share2, Info
} from "lucide-react";

interface DicomStudy {
  id: string;
  patientName: string;
  patientId: string;
  birthDate: string;
  modality: string;
  studyDate: string;
  accessionNumber: string;
  description: string;
  studyInstanceUID: string;
  receivedAt: string;
  status: 'received' | 'processing' | 'archived';
}

interface WorklistItem {
  id: string;
  patientName: string;
  patientId: string;
  birthDate: string;
  modality: string;
  scheduledTime: string;
  accessionNumber: string;
  procedure: string;
  status: 'scheduled' | 'arrived' | 'in-progress' | 'completed';
  studyInstanceUID?: string;
}

interface OpsLogEntry {
  id: string;
  time: string;
  type: "link" | "unmatched" | "event";
  text: string;
}

const MOCK_STUDIES: DicomStudy[] = [
  { id: "S1", patientName: "Costa Lucia M.", patientId: "MRN-09821", birthDate: "1982-05-14", modality: "CT", studyDate: "2024-05-10", accessionNumber: "ACC-2024-005", description: "CT Abdomen C/C", studyInstanceUID: "1.2.3.4.5", receivedAt: "08:14:22", status: "received" },
  { id: "S2", patientName: "Silva João P.", patientId: "MRN-11234", birthDate: "1975-11-20", modality: "MR", studyDate: "2024-05-10", accessionNumber: "ACC-2024-012", description: "MR Brain W/O", studyInstanceUID: "1.2.3.4.6", receivedAt: "08:22:15", status: "received" },
  { id: "S3", patientName: "Oliveira Maria F.", patientId: "MRN-08342", birthDate: "1960-03-08", modality: "CR", studyDate: "2024-05-10", accessionNumber: "ACC-2024-008", description: "Chest X-Ray PA/LAT", studyInstanceUID: "1.2.3.4.7", receivedAt: "08:45:01", status: "received" }
];

const MOCK_WORKLIST: WorklistItem[] = [
  { id: "W1", patientName: "Costa Lucia M.", patientId: "MRN-09821", birthDate: "1982-05-14", modality: "CT", scheduledTime: "08:00", accessionNumber: "ACC-2024-005", procedure: "CT Abdomen/Pelvis w/ Contrast", status: "arrived" },
  { id: "W2", patientName: "Silva João P.", patientId: "MRN-11234", birthDate: "1975-11-20", modality: "MR", scheduledTime: "08:30", accessionNumber: "ACC-2024-012", procedure: "MRI Brain w/o Contrast", status: "arrived" },
  { id: "W3", patientName: "Ferreira Carlos T.", patientId: "MRN-14422", birthDate: "1988-07-30", modality: "US", scheduledTime: "09:00", accessionNumber: "ACC-2024-018", procedure: "US Abdomen Complete", status: "scheduled" }
];

const MOCK_LOGS: OpsLogEntry[] = [
  { id: "L1", time: "08:10:05", type: "event", text: "System initialized. Service active." },
  { id: "L2", time: "08:12:33", type: "event", text: "RIS connection established." },
  { id: "L3", time: "08:14:22", type: "unmatched", text: "Study received: ACC-2024-005" },
  { id: "L4", time: "08:22:15", type: "unmatched", text: "Study received: ACC-2024-012" }
];

function ModalityBadge({ modality }: { modality: string }) {
  return (
    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold font-mono tracking-wider bg-white/10 text-sky-300 border border-sky-400/20 backdrop-blur-sm">
      {modality}
    </span>
  );
}

export function GlacialPrecision() {
  const [studies, setStudies] = useState<DicomStudy[]>(MOCK_STUDIES);
  const [worklist, setWorklist] = useState<WorklistItem[]>(MOCK_WORKLIST);
  const [logs, setLogs] = useState<OpsLogEntry[]>(MOCK_LOGS);
  
  const [selectedStudy, setSelectedStudy] = useState<DicomStudy | null>(studies[0]);
  const [selectedWorklist, setSelectedWorklist] = useState<WorklistItem | null>(worklist[0]);
  
  const [manualSearch, setManualSearch] = useState("");
  const [sessionSeconds, setSessionSeconds] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setSessionSeconds(s => s + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const formatSessionTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const handleLink = () => {
    if (!selectedStudy || !selectedWorklist) return;
    
    const newLog: OpsLogEntry = {
      id: Date.now().toString(),
      time: new Date().toLocaleTimeString('en-GB', { hour12: false }),
      type: "link",
      text: `Linked ${selectedStudy.accessionNumber} to ${selectedWorklist.accessionNumber}`
    };
    
    setLogs(prev => [newLog, ...prev]);
    
    setWorklist(prev => prev.map(w => w.id === selectedWorklist.id ? { ...w, status: 'completed', studyInstanceUID: selectedStudy.studyInstanceUID } : w));
    
    setSelectedStudy(null);
    setSelectedWorklist(null);
  };

  const linkedCount = worklist.filter(w => w.status === 'completed').length;
  const pendingCount = worklist.filter(w => w.status !== 'completed').length;
  const matchRate = studies.length > 0 ? Math.round((linkedCount / Math.max(worklist.length, 1)) * 100) : 0;

  const namesMatch = selectedStudy?.patientName.trim().toLowerCase() === selectedWorklist?.patientName.trim().toLowerCase();
  const idMatch = selectedStudy?.patientId === selectedWorklist?.patientId;
  const datesMatch = selectedStudy?.birthDate === selectedWorklist?.birthDate;
  const modalityMatch = selectedStudy?.modality === selectedWorklist?.modality;

  return (
    <div className="flex flex-col h-screen w-full overflow-hidden bg-[#06111E] text-[#F0F9FF] font-sans selection:bg-sky-500/30 selection:text-sky-100" style={{ height: '100vh' }}>
      
      {/* HEADER BAR */}
      <header className="h-14 flex items-center justify-between px-6 shrink-0 bg-slate-900/80 backdrop-blur-md border-b border-white/10 z-20">
        <div className="flex items-center gap-4">
          <Monitor className="w-5 h-5 text-sky-400" />
          <h1 className="font-mono text-sm tracking-[0.2em] text-sky-300 font-medium drop-shadow-[0_0_8px_rgba(125,211,252,0.4)]">
            SIEMENS<span className="text-white/40 mx-2">|</span>OP-CONSOLE
          </h1>
        </div>
        
        <div className="flex items-center gap-8 font-mono text-[11px] tracking-wider">
          <div className="flex items-center gap-3">
            <span className="text-white/40">PACS</span>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
              <span className="text-emerald-400">SYNC</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-white/40">RIS</span>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
              <span className="text-emerald-400">SYNC</span>
            </div>
          </div>
          <div className="h-4 w-px bg-white/10" />
          <div className="flex items-center gap-2 text-sky-300">
            <Clock className="w-3.5 h-3.5 opacity-70" />
            <span className="drop-shadow-[0_0_4px_rgba(125,211,252,0.5)]">{formatSessionTime(sessionSeconds)}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="p-2 text-white/50 hover:text-sky-300 hover:bg-white/5 rounded transition-all">
            <Settings className="w-4 h-4" />
          </button>
          <button className="p-2 text-white/50 hover:text-sky-300 hover:bg-white/5 rounded transition-all">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* METRICS RIBBON */}
      <div className="h-10 flex items-center px-6 shrink-0 bg-white/[0.02] border-b border-white/5 font-mono text-[10px] tracking-widest gap-8 z-10">
        <div className="flex items-center gap-2">
          <span className="text-white/40">RECEBIDOS</span>
          <span className="text-sky-300 font-medium">{studies.length}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-white/40">VINCULADOS</span>
          <span className="text-emerald-400 font-medium">{linkedCount}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-white/40">PENDENTES</span>
          <span className="text-white/80 font-medium">{pendingCount}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-white/40">SEM MATCH</span>
          <span className="text-amber-400 font-medium">0</span>
        </div>
        <div className="flex-1" />
        <div className="flex items-center gap-2">
          <span className="text-white/40">STATUS</span>
          <span className="text-emerald-400 font-medium flex items-center gap-1">
            <Activity className="w-3 h-3" /> NOMINAL
          </span>
        </div>
        <div className="h-4 w-px bg-white/10" />
        <div className="flex items-center gap-2">
          <span className="text-white/40">TAXA</span>
          <span className="text-sky-300 font-medium">{matchRate}%</span>
        </div>
      </div>

      {/* THREE COLUMNS */}
      <div className="flex-1 flex overflow-hidden min-h-0 bg-[#06111E] relative">
        {/* Subtle geometric background grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:48px_48px] pointer-events-none" />

        {/* LEFT: INCOMING */}
        <div className="w-[280px] shrink-0 border-r border-white/10 flex flex-col bg-slate-900/20 backdrop-blur-sm relative z-10">
          <div className="h-10 border-b border-white/10 flex items-center px-4 shrink-0 bg-white/[0.02]">
            <span className="font-mono text-[10px] tracking-[0.15em] text-white/50">INCOMING FEED</span>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {studies.map(study => {
              const isLinked = worklist.some(w => w.studyInstanceUID === study.studyInstanceUID);
              const isActive = selectedStudy?.id === study.id;
              return (
                <div 
                  key={study.id}
                  onClick={() => !isLinked && setSelectedStudy(study)}
                  className={`
                    group relative p-3 rounded-sm border transition-all cursor-pointer overflow-hidden
                    ${isActive 
                      ? 'bg-sky-900/20 border-sky-500/30' 
                      : isLinked 
                        ? 'bg-white/[0.01] border-white/5 opacity-50' 
                        : 'bg-white/[0.03] border-white/10 hover:border-sky-400/20 hover:bg-white/[0.05]'}
                  `}
                >
                  {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.5)]" />}
                  
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-mono text-[9px] text-white/40">{study.receivedAt}</span>
                    {isLinked ? (
                      <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                    ) : (
                      <span className={`font-mono text-[8px] px-1 py-0.5 rounded-sm ${isActive ? 'bg-sky-500/20 text-sky-300' : 'bg-white/10 text-white/50'}`}>
                        {isActive ? 'ACTIVE' : 'NEW'}
                      </span>
                    )}
                  </div>
                  
                  <div className="mb-1">
                    <div className={`text-xs font-medium tracking-wide truncate ${isActive ? 'text-white' : 'text-white/80'}`}>
                      {study.patientName.toUpperCase()}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 mt-2">
                    <ModalityBadge modality={study.modality} />
                    <span className="font-mono text-[10px] text-sky-200/70 truncate">{study.accessionNumber}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* CENTER: WORKSTATION */}
        <div className="flex-1 flex flex-col min-w-0 relative z-10 px-8 py-6">
          <div className="flex-1 max-w-4xl mx-auto w-full flex flex-col gap-6">
            
            {selectedStudy ? (
              <>
                {/* DICOM CARD */}
                <div className="relative rounded bg-slate-900/60 backdrop-blur-md border border-white/10 p-6 overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4">
                    <span className="font-mono text-[9px] tracking-[0.2em] text-white/20">SOURCE: PACS</span>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded bg-sky-900/30 border border-sky-400/20 flex items-center justify-center shrink-0">
                      <span className="font-mono text-lg text-sky-400 font-light">{selectedStudy.modality}</span>
                    </div>
                    <div className="flex-1">
                      <h2 className="text-xl font-light tracking-wide text-white mb-1">
                        {selectedStudy.patientName.toUpperCase()}
                      </h2>
                      <div className="flex flex-wrap gap-x-6 gap-y-2 font-mono text-xs text-white/50">
                        <div className="flex items-center gap-2"><span className="text-white/30">ID:</span> <span className="text-sky-200">{selectedStudy.patientId}</span></div>
                        <div className="flex items-center gap-2"><span className="text-white/30">DOB:</span> <span className="text-white/80">{selectedStudy.birthDate}</span></div>
                        <div className="flex items-center gap-2"><span className="text-white/30">ACC:</span> <span className="text-sky-200">{selectedStudy.accessionNumber}</span></div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 bg-white/[0.02] border border-white/5 rounded p-3 font-mono text-[11px] text-white/60">
                    <span className="text-white/30 mr-2">PROC:</span>
                    {selectedStudy.description.toUpperCase()}
                  </div>
                </div>

                {/* VERIFICATION ROW */}
                <div className="flex items-center justify-center py-2">
                  <div className="flex items-center gap-6 px-8 py-2.5 rounded-full bg-white/[0.02] border border-white/5 backdrop-blur-sm font-mono text-[10px] tracking-widest">
                    <div className={`flex items-center gap-2 ${namesMatch ? 'text-emerald-400' : 'text-white/40'}`}>
                      {namesMatch ? <Check className="w-3 h-3" /> : <div className="w-3 h-3 border border-white/20 rounded-sm" />} NOME
                    </div>
                    <div className="w-px h-3 bg-white/10" />
                    <div className={`flex items-center gap-2 ${datesMatch ? 'text-emerald-400' : 'text-white/40'}`}>
                      {datesMatch ? <Check className="w-3 h-3" /> : <div className="w-3 h-3 border border-white/20 rounded-sm" />} NASC
                    </div>
                    <div className="w-px h-3 bg-white/10" />
                    <div className={`flex items-center gap-2 ${idMatch ? 'text-emerald-400' : 'text-white/40'}`}>
                      {idMatch ? <Check className="w-3 h-3" /> : <div className="w-3 h-3 border border-white/20 rounded-sm" />} ID
                    </div>
                    <div className="w-px h-3 bg-white/10" />
                    <div className={`flex items-center gap-2 ${modalityMatch ? 'text-emerald-400' : 'text-white/40'}`}>
                      {modalityMatch ? <Check className="w-3 h-3" /> : <div className="w-3 h-3 border border-white/20 rounded-sm" />} MOD
                    </div>
                  </div>
                </div>

                {/* RIS CARD */}
                {selectedWorklist ? (
                  <div className="relative rounded bg-slate-900/60 backdrop-blur-md border border-white/10 p-6 overflow-hidden">
                    <div className="absolute top-0 right-0 p-4">
                      <span className="font-mono text-[9px] tracking-[0.2em] text-white/20">TARGET: RIS</span>
                    </div>
                    
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                        <span className="font-mono text-lg text-white/60 font-light">{selectedWorklist.modality}</span>
                      </div>
                      <div className="flex-1">
                        <h2 className="text-xl font-light tracking-wide text-white mb-1">
                          {selectedWorklist.patientName.toUpperCase()}
                        </h2>
                        <div className="flex flex-wrap gap-x-6 gap-y-2 font-mono text-xs text-white/50">
                          <div className="flex items-center gap-2"><span className="text-white/30">ID:</span> <span className="text-white/80">{selectedWorklist.patientId}</span></div>
                          <div className="flex items-center gap-2"><span className="text-white/30">DOB:</span> <span className="text-white/80">{selectedWorklist.birthDate}</span></div>
                          <div className="flex items-center gap-2"><span className="text-white/30">ACC:</span> <span className="text-white/80">{selectedWorklist.accessionNumber}</span></div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-6 bg-white/[0.02] border border-white/5 rounded p-3 font-mono text-[11px] text-white/60">
                      <span className="text-white/30 mr-2">PROC:</span>
                      {selectedWorklist.procedure.toUpperCase()}
                    </div>
                  </div>
                ) : (
                  <div className="rounded bg-white/[0.01] border border-white/5 border-dashed p-8 flex flex-col items-center justify-center text-center">
                    <Search className="w-6 h-6 text-white/20 mb-3" />
                    <span className="font-mono text-xs text-white/40">NO AUTOMATIC MATCH FOUND</span>
                  </div>
                )}

                {/* ACTION BUTTON */}
                <div className="mt-auto flex items-center gap-4">
                  <div className="relative flex-1 group">
                    <div className="absolute inset-0 bg-sky-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                    <button 
                      onClick={handleLink}
                      disabled={!selectedStudy || !selectedWorklist}
                      className="relative w-full h-14 bg-gradient-to-r from-sky-600/80 to-sky-500/80 hover:from-sky-500/90 hover:to-sky-400/90 disabled:from-white/5 disabled:to-white/5 disabled:text-white/20 disabled:border-white/5 border border-sky-400/30 rounded flex items-center justify-center gap-3 font-mono text-sm tracking-[0.2em] text-white transition-all shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]"
                    >
                      <LinkIcon className="w-4 h-4" />
                      CONFIRMAR VÍNCULO
                    </button>
                  </div>
                  <button className="h-14 px-6 bg-white/5 hover:bg-white/10 border border-white/10 rounded flex items-center justify-center text-white/60 transition-all font-mono text-xs tracking-widest">
                    REJEITAR
                  </button>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4 text-white/20">
                  <div className="w-24 h-24 rounded-full border border-white/10 flex items-center justify-center">
                    <Monitor className="w-8 h-8 opacity-50" />
                  </div>
                  <span className="font-mono text-xs tracking-[0.2em]">AWAITING SELECTION</span>
                </div>
              </div>
            )}
          </div>
          
          {/* MANUAL SEARCH */}
          <div className="absolute bottom-6 left-8 right-8 max-w-4xl mx-auto h-12 bg-slate-900/80 backdrop-blur-md border border-white/10 rounded flex items-center px-4 gap-3 focus-within:border-sky-500/50 transition-colors">
            <Search className="w-4 h-4 text-white/30" />
            <input 
              type="text" 
              placeholder="SEARCH RIS WORKLIST (ID, NAME, ACC)..." 
              className="flex-1 bg-transparent border-none outline-none font-mono text-[11px] tracking-wider text-white placeholder:text-white/20"
              value={manualSearch}
              onChange={e => setManualSearch(e.target.value)}
            />
          </div>
        </div>

        {/* RIGHT: OPS LOG */}
        <div className="w-[280px] shrink-0 border-l border-white/10 flex flex-col bg-slate-900/20 backdrop-blur-sm relative z-10">
          <div className="h-10 border-b border-white/10 flex items-center justify-between px-4 shrink-0 bg-white/[0.02]">
            <span className="font-mono text-[10px] tracking-[0.15em] text-white/50">OPERATION LOG</span>
            <div className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse" />
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-1">
            {logs.map(log => (
              <div key={log.id} className="flex gap-3 text-left py-1.5 px-2 hover:bg-white/[0.02] rounded-sm transition-colors">
                <span className="font-mono text-[9px] text-white/30 shrink-0 mt-0.5">{log.time}</span>
                <span className={`font-mono text-[10px] leading-relaxed ${
                  log.type === 'link' ? 'text-emerald-400' : 
                  log.type === 'unmatched' ? 'text-amber-400/80' : 
                  'text-sky-300/70'
                }`}>
                  {log.text}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FOOTER STATUS BAR */}
      <footer className="h-8 flex items-center justify-between px-6 shrink-0 bg-black/40 border-t border-white/5 z-20 font-mono text-[9px] tracking-widest text-white/40">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span>PACS:</span>
            <span className="text-emerald-400">192.168.1.104:104</span>
          </div>
          <div className="flex items-center gap-2">
            <span>RIS:</span>
            <span className="text-emerald-400">10.0.0.55:8080</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2 text-sky-400/50">
          <Info className="w-3 h-3" />
          <span>SYSTEM OPERATIONAL</span>
        </div>
        
        <div>
          V.3.4.1_BUILD_88
        </div>
      </footer>

    </div>
  );
}
