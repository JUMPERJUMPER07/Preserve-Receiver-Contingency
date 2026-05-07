import React, { useState, useMemo, useEffect } from "react";
import {
  Terminal, Check, AlertTriangle, Zap, Search,
  Clock, Link as LinkIcon, BarChart3, Activity,
  Settings, LogOut, RefreshCw, Eye, Inbox, ChevronRight,
  Wifi, Target, Database, FileText
} from "lucide-react";

// --- Types ---
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
  type: "link" | "unmatched" | "event" | "system";
  text: string;
  level?: "info" | "warn" | "error" | "success";
}

// --- Mock Data ---
const mockStudies: DicomStudy[] = [
  {
    id: "s1", patientName: "COSTA LUCIA M.", patientId: "MRN-88421", birthDate: "1954-08-22",
    modality: "CT", studyDate: "2024-05-14", accessionNumber: "ACC-2024-005",
    description: "CT ABDOMEN C/C", studyInstanceUID: "1.2.3.4.5.1", receivedAt: "08:14:22", status: 'received'
  },
  {
    id: "s2", patientName: "SILVA JOAO P.", patientId: "MRN-10933", birthDate: "1982-11-05",
    modality: "MR", studyDate: "2024-05-14", accessionNumber: "ACC-2024-008",
    description: "MR CRANIO", studyInstanceUID: "1.2.3.4.5.2", receivedAt: "08:18:05", status: 'received'
  },
  {
    id: "s3", patientName: "OLIVEIRA MARIA C.", patientId: "MRN-55210", birthDate: "1990-02-15",
    modality: "CR", studyDate: "2024-05-14", accessionNumber: "ACC-2024-012",
    description: "RX TORAX AP/PERFIL", studyInstanceUID: "1.2.3.4.5.3", receivedAt: "08:25:40", status: 'received'
  },
  {
    id: "s4", patientName: "SANTOS PEDRO H.", patientId: "MRN-99124", birthDate: "1975-06-30",
    modality: "US", studyDate: "2024-05-14", accessionNumber: "ACC-2024-015",
    description: "US ABDOMEN TOTAL", studyInstanceUID: "1.2.3.4.5.4", receivedAt: "08:32:11", status: 'received'
  }
];

const mockWorklist: WorklistItem[] = [
  {
    id: "w1", patientName: "COSTA LUCIA M", patientId: "MRN-88421", birthDate: "1954-08-22",
    modality: "CT", scheduledTime: "08:00", accessionNumber: "ACC-2024-005",
    procedure: "TOMOGRAFIA COMPUTADORIZADA DE ABDOMEN", status: 'arrived'
  },
  {
    id: "w2", patientName: "SILVA JOAO P", patientId: "MRN-10933", birthDate: "1982-11-05",
    modality: "MR", scheduledTime: "08:15", accessionNumber: "ACC-2024-008",
    procedure: "RESSONANCIA MAGNETICA DE CRANIO", status: 'arrived'
  },
  {
    id: "w3", patientName: "OLIVEIRA M. CLARA", patientId: "MRN-55210", birthDate: "1990-02-15",
    modality: "CR", scheduledTime: "08:30", accessionNumber: "ACC-2024-012",
    procedure: "RAIO-X DE TORAX", status: 'arrived'
  }
];

const initialLogs: OpsLogEntry[] = [
  { id: "l1", time: "08:00:01", type: "system", text: "SYSTEM STARTUP SEQUENCE INITIATED", level: "info" },
  { id: "l2", time: "08:00:05", type: "system", text: "PACS CONNECTION ESTABLISHED", level: "success" },
  { id: "l3", time: "08:00:08", type: "system", text: "RIS HL7 BROKER CONNECTED", level: "success" },
  { id: "l4", time: "08:14:22", type: "event", text: "INCOMING DICOM: ACC-2024-005 (CT)", level: "info" },
  { id: "l5", time: "08:18:05", type: "event", text: "INCOMING DICOM: ACC-2024-008 (MR)", level: "info" },
  { id: "l6", time: "08:25:40", type: "event", text: "INCOMING DICOM: ACC-2024-012 (CR)", level: "info" }
];

export function AmberOps() {
  const [studies, setStudies] = useState<DicomStudy[]>(mockStudies);
  const [worklist, setWorklist] = useState<WorklistItem[]>(mockWorklist);
  const [logs, setLogs] = useState<OpsLogEntry[]>(initialLogs);
  const [selectedStudyId, setSelectedStudyId] = useState<string | null>(mockStudies[0].id);
  const [manualSearch, setManualSearch] = useState("");
  const [sessionSeconds, setSessionSeconds] = useState(3600 * 2 + 15 * 60 + 42); // 02:15:42

  useEffect(() => {
    const id = setInterval(() => setSessionSeconds(s => s + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const addLog = (text: string, level: "info" | "warn" | "error" | "success" = "info", type: OpsLogEntry["type"] = "event") => {
    const now = new Date();
    const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
    setLogs(prev => [{ id: `l_${Date.now()}`, time, type, text, level }, ...prev]);
  };

  const selectedStudy = studies.find(s => s.id === selectedStudyId) || null;

  // Auto-match logic
  const autoMatch = useMemo(() => {
    if (!selectedStudy) return null;
    const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
    for (const item of worklist) {
      if (item.status === "completed") continue;
      if (selectedStudy.accessionNumber === item.accessionNumber) return item;
      if (selectedStudy.patientId.trim() === item.patientId.trim() && normalize(selectedStudy.patientName) === normalize(item.patientName)) return item;
    }
    return null;
  }, [selectedStudy, worklist]);

  const activeWorklistItem = autoMatch;

  const linkedCount = worklist.filter(w => w.status === "completed").length;
  const pendingCount = worklist.filter(w => w.status !== "completed").length;
  const unmatchedCount = studies.filter(s => !worklist.some(w => w.accessionNumber === s.accessionNumber && w.status === 'completed')).length;

  const handleLink = () => {
    if (!selectedStudy || !activeWorklistItem) return;
    
    setWorklist(prev => prev.map(w => w.id === activeWorklistItem.id ? { ...w, status: 'completed', studyInstanceUID: selectedStudy.studyInstanceUID } : w));
    addLog(`LINK CONFIRMED: ${selectedStudy.accessionNumber} -> ${activeWorklistItem.patientId}`, "success", "link");
    
    // Auto-select next
    const nextUnlinked = studies.find(s => s.id !== selectedStudy.id && !worklist.some(w => w.studyInstanceUID === s.studyInstanceUID));
    if (nextUnlinked) setSelectedStudyId(nextUnlinked.id);
    else setSelectedStudyId(null);
  };

  const formatTime = (sec: number) => {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  // Amber specific colors
  const C = {
    bgApp: "#0D0A05",
    bgPanel: "#1A1408",
    bgPanelActive: "#2A1D0A",
    border: "rgba(180, 83, 9, 0.4)",
    textPrimary: "#F59E0B",     // amber-500
    textSecondary: "#B45309",   // amber-700
    textMuted: "#78350F",       // amber-900
    textBright: "#FEF3C7",      // amber-50
    accent: "#EA580C",          // orange-600
    success: "#84CC16",         // lime-500
    error: "#DC2626",           // red-600
  };

  return (
    <div className="w-full h-screen flex flex-col overflow-hidden font-mono selection:bg-amber-900 selection:text-amber-100" style={{ backgroundColor: C.bgApp, color: C.textPrimary }}>
      
      {/* 1. HEADER BAR */}
      <header className="h-14 flex items-center justify-between px-4 shrink-0 border-b relative" style={{ borderColor: C.border, backgroundColor: C.bgApp }}>
        <div className="absolute inset-0 bg-gradient-to-b from-amber-500/5 to-transparent pointer-events-none" />
        
        <div className="flex items-center gap-4 z-10">
          <Terminal className="w-6 h-6 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]" style={{ color: C.textPrimary }} />
          <h1 className="font-bold tracking-widest text-lg drop-shadow-[0_0_5px_rgba(245,158,11,0.4)]" style={{ color: C.textPrimary }}>AMBER_OPS // RADIOLOGY</h1>
        </div>

        <div className="flex items-center gap-8 z-10 text-xs font-bold tracking-widest">
          <div className="flex items-center gap-2">
            <span style={{ color: C.textSecondary }}>PACS</span>
            <div className="w-2.5 h-2.5 rounded-full shadow-[0_0_8px_rgba(132,204,22,0.8)]" style={{ backgroundColor: C.success }} />
            <span style={{ color: C.success }}>ONLN</span>
          </div>
          <div className="flex items-center gap-2">
            <span style={{ color: C.textSecondary }}>RIS</span>
            <div className="w-2.5 h-2.5 rounded-full shadow-[0_0_8px_rgba(132,204,22,0.8)]" style={{ backgroundColor: C.success }} />
            <span style={{ color: C.success }}>ONLN</span>
          </div>
          <div className="flex items-center gap-2 ml-4">
            <span style={{ color: C.textSecondary }}>UPTIME</span>
            <span className="drop-shadow-[0_0_4px_rgba(245,158,11,0.6)]" style={{ color: C.textPrimary }}>{formatTime(sessionSeconds)}</span>
          </div>
        </div>

        <div className="flex items-center gap-3 z-10">
          <button className="p-2 rounded hover:bg-amber-900/30 transition-colors" style={{ color: C.textSecondary }}>
            <Settings className="w-5 h-5" />
          </button>
          <button className="p-2 rounded hover:bg-amber-900/30 transition-colors" style={{ color: C.textSecondary }}>
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* 2. METRICS RIBBON */}
      <div className="h-10 flex items-center px-4 shrink-0 gap-8 border-b text-xs font-bold" style={{ borderColor: C.border, backgroundColor: '#130e06' }}>
        <div className="flex items-center gap-2"><span style={{ color: C.textSecondary }}>RECEBIDOS:</span> <span style={{ color: C.textPrimary }}>{studies.length}</span></div>
        <div className="flex items-center gap-2"><span style={{ color: C.textSecondary }}>VINCULADOS:</span> <span style={{ color: C.success }}>{linkedCount}</span></div>
        <div className="flex items-center gap-2"><span style={{ color: C.textSecondary }}>PENDENTES:</span> <span style={{ color: C.textPrimary }}>{pendingCount}</span></div>
        <div className="flex items-center gap-2"><span style={{ color: C.textSecondary }}>SEM MATCH:</span> <span style={{ color: unmatchedCount > 0 ? C.accent : C.textPrimary }}>{unmatchedCount}</span></div>
        <div className="flex items-center gap-2 ml-auto"><span style={{ color: C.textSecondary }}>STATUS:</span> <span className="animate-pulse" style={{ color: C.textPrimary }}>ESPERANDO DADOS...</span></div>
        <div className="flex items-center gap-2"><span style={{ color: C.textSecondary }}>TAXA:</span> <span style={{ color: C.textPrimary }}>{Math.round((linkedCount/Math.max(1, worklist.length))*100)}%</span></div>
      </div>

      {/* 3. THREE COLUMNS */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* LEFT: INCOMING */}
        <div className="w-[260px] flex flex-col shrink-0 border-r" style={{ borderColor: C.border, backgroundColor: C.bgPanel }}>
          <div className="h-8 border-b flex items-center px-3 text-xs tracking-wider" style={{ borderColor: C.border, color: C.textSecondary }}>
            <Database className="w-3.5 h-3.5 mr-2" /> INCOMING FEED
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {studies.map(study => {
              const isSelected = selectedStudyId === study.id;
              const isLinked = worklist.some(w => w.studyInstanceUID === study.studyInstanceUID);
              
              return (
                <div 
                  key={study.id} 
                  onClick={() => setSelectedStudyId(study.id)}
                  className="p-2 border cursor-pointer relative transition-all"
                  style={{ 
                    borderColor: isSelected ? C.accent : C.border,
                    backgroundColor: isSelected ? C.bgPanelActive : (isLinked ? 'transparent' : 'rgba(180, 83, 9, 0.05)'),
                    opacity: isLinked ? 0.5 : 1
                  }}
                >
                  {isSelected && <div className="absolute left-0 top-0 bottom-0 w-1" style={{ backgroundColor: C.accent }} />}
                  <div className="flex justify-between text-[10px] mb-1" style={{ color: C.textSecondary }}>
                    <span>{study.receivedAt}</span>
                    <span style={{ color: isSelected ? C.accent : (isLinked ? C.success : C.textPrimary) }}>
                      {isSelected ? 'ACTIVE' : isLinked ? 'LINKED' : 'NEW'}
                    </span>
                  </div>
                  <div className="font-bold text-sm truncate" style={{ color: isSelected ? C.textBright : C.textPrimary }}>
                    {study.patientName}
                  </div>
                  <div className="flex justify-between mt-1 text-[11px]">
                    <span style={{ color: C.textPrimary }}>{study.modality}</span>
                    <span style={{ color: C.textSecondary }}>{study.accessionNumber}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* CENTER: WORKSTATION */}
        <div className="flex-1 flex flex-col relative overflow-hidden">
          {/* CRT Scanline effect overlay */}
          <div className="absolute inset-0 pointer-events-none opacity-5 mix-blend-overlay z-50" 
               style={{ background: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))', backgroundSize: '100% 4px, 3px 100%' }} />

          <div className="h-8 border-b flex items-center px-4 text-xs tracking-wider" style={{ borderColor: C.border, color: C.textSecondary }}>
            <Target className="w-3.5 h-3.5 mr-2" /> WORKSTATION
          </div>

          <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center">
            {selectedStudy ? (
              <div className="w-full max-w-2xl flex flex-col gap-6">
                
                {/* DICOM Card */}
                <div className="border p-4 relative" style={{ borderColor: C.border, backgroundColor: C.bgPanel }}>
                  <div className="absolute top-0 right-0 px-2 py-1 text-[10px] border-b border-l bg-black/40" style={{ borderColor: C.border, color: C.textSecondary }}>DICOM SOURCE</div>
                  
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center justify-center w-16 border bg-black/30" style={{ borderColor: C.border }}>
                      <span className="text-xl font-bold" style={{ color: C.textPrimary }}>{selectedStudy.modality}</span>
                    </div>
                    <div className="flex-1">
                      <div className="text-2xl font-bold tracking-wide mb-1" style={{ color: C.textBright }}>
                        {selectedStudy.patientName}
                      </div>
                      <div className="grid grid-cols-2 gap-y-1 text-xs">
                        <div><span style={{ color: C.textSecondary }}>NASC:</span> {selectedStudy.birthDate}</div>
                        <div><span style={{ color: C.textSecondary }}>ID:</span> <span style={{ color: C.textPrimary }}>{selectedStudy.patientId}</span></div>
                        <div><span style={{ color: C.textSecondary }}>ACC:</span> <span className="font-bold" style={{ color: C.textPrimary }}>{selectedStudy.accessionNumber}</span></div>
                        <div><span style={{ color: C.textSecondary }}>RECV:</span> {selectedStudy.receivedAt}</div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 p-2 border border-dashed bg-black/20 text-xs" style={{ borderColor: C.border }}>
                    <span style={{ color: C.textSecondary }}>DESC:</span> {selectedStudy.description}
                  </div>
                </div>

                {/* Verification Bar */}
                <div className="flex items-center justify-center">
                  <div className="border px-6 py-2 flex gap-6 text-[11px] font-bold tracking-widest bg-black/50" style={{ borderColor: C.border }}>
                    <span className="flex items-center gap-2" style={{ color: activeWorklistItem?.patientName.includes(selectedStudy.patientName.split(' ')[0]) ? C.success : C.textSecondary }}>
                      NOME {activeWorklistItem?.patientName.includes(selectedStudy.patientName.split(' ')[0]) ? <Check className="w-3 h-3" /> : '[ ]'}
                    </span>
                    <span className="flex items-center gap-2" style={{ color: activeWorklistItem?.patientId === selectedStudy.patientId ? C.success : C.textSecondary }}>
                      ID {activeWorklistItem?.patientId === selectedStudy.patientId ? <Check className="w-3 h-3" /> : '[ ]'}
                    </span>
                    <span className="flex items-center gap-2" style={{ color: activeWorklistItem?.accessionNumber === selectedStudy.accessionNumber ? C.success : C.textSecondary }}>
                      ACC {activeWorklistItem?.accessionNumber === selectedStudy.accessionNumber ? <Check className="w-3 h-3" /> : '[ ]'}
                    </span>
                  </div>
                </div>

                {/* RIS Card */}
                {activeWorklistItem ? (
                  <div className="border p-4 relative" style={{ borderColor: C.success, backgroundColor: C.bgPanel }}>
                    <div className="absolute top-0 right-0 px-2 py-1 text-[10px] border-b border-l bg-black/40" style={{ borderColor: C.success, color: C.success }}>RIS MATCH</div>
                    
                    <div className="flex gap-4">
                      <div className="flex flex-col items-center justify-center w-16 border bg-black/30" style={{ borderColor: C.border }}>
                        <span className="text-xl font-bold" style={{ color: C.textPrimary }}>{activeWorklistItem.modality}</span>
                      </div>
                      <div className="flex-1">
                        <div className="text-2xl font-bold tracking-wide mb-1" style={{ color: C.textBright }}>
                          {activeWorklistItem.patientName}
                        </div>
                        <div className="grid grid-cols-2 gap-y-1 text-xs">
                          <div><span style={{ color: C.textSecondary }}>NASC:</span> {activeWorklistItem.birthDate}</div>
                          <div><span style={{ color: C.textSecondary }}>ID:</span> <span style={{ color: C.textPrimary }}>{activeWorklistItem.patientId}</span></div>
                          <div><span style={{ color: C.textSecondary }}>ACC:</span> <span className="font-bold" style={{ color: C.textPrimary }}>{activeWorklistItem.accessionNumber}</span></div>
                          <div><span style={{ color: C.textSecondary }}>SCHED:</span> {activeWorklistItem.scheduledTime}</div>
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 p-2 border border-dashed bg-black/20 text-xs" style={{ borderColor: C.border }}>
                      <span style={{ color: C.textSecondary }}>PROC:</span> {activeWorklistItem.procedure}
                    </div>
                  </div>
                ) : (
                  <div className="border border-dashed p-8 flex flex-col items-center justify-center text-center gap-3 bg-black/20" style={{ borderColor: C.border }}>
                    <AlertTriangle className="w-8 h-8" style={{ color: C.accent }} />
                    <div>
                      <div className="font-bold mb-1" style={{ color: C.accent }}>NO AUTOMATIC MATCH FOUND</div>
                      <div className="text-xs" style={{ color: C.textSecondary }}>SEARCH RIS MANUALLY OR SELECT FROM LIST</div>
                    </div>
                  </div>
                )}

                {/* Confirm Button */}
                <button 
                  onClick={handleLink}
                  disabled={!activeWorklistItem}
                  className="w-full py-4 text-sm font-bold tracking-widest transition-all disabled:opacity-50 disabled:cursor-not-allowed border"
                  style={{ 
                    backgroundColor: activeWorklistItem ? C.textPrimary : 'transparent', 
                    color: activeWorklistItem ? C.bgApp : C.textSecondary,
                    borderColor: activeWorklistItem ? C.textPrimary : C.border,
                    boxShadow: activeWorklistItem ? `0 0 15px ${C.textPrimary}40` : 'none'
                  }}
                >
                  {activeWorklistItem ? 'CONFIRMAR VÍNCULO' : 'AWAITING MATCH'}
                </button>

                {/* Manual Search */}
                <div className="mt-auto border-t pt-4" style={{ borderColor: C.border }}>
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2" style={{ color: C.textSecondary }} />
                    <input 
                      type="text" 
                      placeholder="MANUAL OVERRIDE SEARCH..."
                      value={manualSearch}
                      onChange={e => setManualSearch(e.target.value)}
                      className="w-full bg-black/50 border px-10 py-2 text-xs focus:outline-none focus:ring-1 transition-all"
                      style={{ borderColor: C.border, color: C.textPrimary, outlineColor: C.accent }}
                    />
                  </div>
                </div>

              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center font-bold tracking-widest opacity-50 flex flex-col items-center" style={{ color: C.textSecondary }}>
                  <Terminal className="w-12 h-12 mb-4" />
                  WAITING FOR INPUT
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: OPS LOG */}
        <div className="w-[260px] flex flex-col shrink-0 border-l bg-black/20" style={{ borderColor: C.border }}>
          <div className="h-8 border-b flex items-center px-3 text-xs tracking-wider" style={{ borderColor: C.border, color: C.textSecondary }}>
            <FileText className="w-3.5 h-3.5 mr-2" /> OPS LOG
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-3 text-[10px]">
            {logs.map(log => (
              <div key={log.id} className="flex gap-2">
                <span className="shrink-0" style={{ color: C.textSecondary }}>[{log.time}]</span>
                <span style={{ 
                  color: log.level === 'success' ? C.success : 
                         log.level === 'warn' ? C.accent : 
                         log.level === 'error' ? C.error : C.textPrimary 
                }}>
                  {log.text}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* 4. FOOTER STATUS BAR */}
      <footer className="h-8 border-t flex items-center justify-between px-4 shrink-0 text-[10px] tracking-widest font-bold" style={{ borderColor: C.border, backgroundColor: C.bgApp, color: C.textSecondary }}>
        <div className="flex items-center gap-4">
          <span>NET: SECURE</span>
          <span>DB: SYNCED</span>
        </div>
        <div style={{ color: C.textPrimary }}>
          SISTEMA OPERACIONAL · MODO NORMAL
        </div>
        <div>
          V 3.4.1.9 // AMBER
        </div>
      </footer>

    </div>
  );
}

export default AmberOps;