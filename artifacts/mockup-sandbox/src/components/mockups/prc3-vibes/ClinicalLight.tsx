import React, { useState, useMemo, useEffect } from "react";
import {
  Terminal, Check, AlertTriangle, Search,
  Clock, Link as LinkIcon, BarChart3, Activity,
  Settings, LogOut, RefreshCw, Eye,
  Inbox, ChevronRight, CheckCircle2, Server, Database
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

export interface OpsLogEntry {
  id: string;
  time: string;
  type: "link" | "unmatched" | "event";
  text: string;
}

const mockStudies: DicomStudy[] = [
  {
    id: "s1",
    patientName: "COSTA LUCIA M.",
    patientId: "MRN-88492",
    birthDate: "1965-04-12",
    modality: "CT",
    studyDate: "2024-10-24",
    accessionNumber: "ACC-2024-005",
    description: "CT ABDOMEN C/C",
    studyInstanceUID: "1.2.840.113619.2.55.3.123456",
    receivedAt: "14:22:05",
    status: 'received'
  },
  {
    id: "s2",
    patientName: "SILVA JOAO P.",
    patientId: "MRN-10293",
    birthDate: "1982-11-05",
    modality: "MR",
    studyDate: "2024-10-24",
    accessionNumber: "ACC-2024-008",
    description: "RM CRANIO",
    studyInstanceUID: "1.2.840.113619.2.55.3.123457",
    receivedAt: "14:25:11",
    status: 'received'
  },
  {
    id: "s3",
    patientName: "ALMEIDA CARLOS",
    patientId: "MRN-55312",
    birthDate: "1990-08-20",
    modality: "CR",
    studyDate: "2024-10-24",
    accessionNumber: "ACC-2024-010",
    description: "RX TORAX PA/PERFIL",
    studyInstanceUID: "1.2.840.113619.2.55.3.123458",
    receivedAt: "14:28:40",
    status: 'received'
  }
];

const mockWorklist: WorklistItem[] = [
  {
    id: "w1",
    patientName: "COSTA LUCIA M.",
    patientId: "MRN-88492",
    birthDate: "1965-04-12",
    modality: "CT",
    scheduledTime: "2024-10-24 14:00",
    accessionNumber: "ACC-2024-005",
    procedure: "TOMOGRAFIA ABDOMEN TOTAL",
    status: 'arrived'
  },
  {
    id: "w2",
    patientName: "SILVA JOAO P.",
    patientId: "MRN-10293",
    birthDate: "1982-11-05",
    modality: "MR",
    scheduledTime: "2024-10-24 14:30",
    accessionNumber: "ACC-2024-008",
    procedure: "RESSONANCIA MAGNETICA CRANIO",
    status: 'scheduled'
  },
  {
    id: "w3",
    patientName: "SANTOS MARIA",
    patientId: "MRN-99821",
    birthDate: "1975-02-18",
    modality: "US",
    scheduledTime: "2024-10-24 15:00",
    accessionNumber: "ACC-2024-012",
    procedure: "USG ABDOMEN TOTAL",
    status: 'scheduled'
  }
];

const mockLogs: OpsLogEntry[] = [
  { id: "l1", time: "14:22:05", type: "event", text: "Study Received: CT [ACC-2024-005]" },
  { id: "l2", time: "14:22:06", type: "event", text: "Auto-matching ACC-2024-005..." },
  { id: "l3", time: "14:22:06", type: "unmatched", text: "Match Confidence: 100% (ACC Match)" },
  { id: "l4", time: "14:25:11", type: "event", text: "Study Received: MR [ACC-2024-008]" },
  { id: "l5", time: "14:28:40", type: "event", text: "Study Received: CR [ACC-2024-010]" },
];

export function ClinicalLight() {
  const [selectedStudy, setSelectedStudy] = useState<DicomStudy | null>(mockStudies[0]);
  const [sessionSeconds, setSessionSeconds] = useState(0);
  const [manualSearch, setManualSearch] = useState("");

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

  const activeWorklistItem = mockWorklist.find(w => w.accessionNumber === selectedStudy?.accessionNumber) || null;

  return (
    <div className="w-full h-screen bg-[#F8FAFC] text-slate-800 font-sans flex flex-col overflow-hidden selection:bg-blue-100 selection:text-blue-900">
      
      {/* HEADER BAR */}
      <header className="h-14 border-b border-slate-200 bg-white flex items-center justify-between px-6 shrink-0 gap-4 shadow-sm z-20">
        <div className="flex items-center gap-3 min-w-0">
          <Activity className="w-5 h-5 text-blue-600 shrink-0" />
          <span className="font-semibold text-sm text-slate-800 whitespace-nowrap">
            ClinicalFlow<span className="text-slate-400 font-normal ml-1">Radiology</span>
          </span>
        </div>

        <div className="flex items-center gap-6 text-sm shrink-0">
          <div className="flex items-center gap-4 text-slate-600">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="font-medium text-slate-700">PACS Online</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="font-medium text-slate-700">RIS Online</span>
            </div>
          </div>

          <div className="flex items-center gap-2 border-l border-slate-200 pl-6 text-slate-500">
            <Clock className="w-4 h-4" />
            <span className="font-mono text-slate-700">{formatSessionTime(sessionSeconds)}</span>
          </div>

          <div className="flex items-center gap-3 border-l border-slate-200 pl-6">
            <button className="text-slate-500 hover:text-blue-600 transition-colors p-1.5 rounded hover:bg-slate-50">
              <RefreshCw className="w-4 h-4" />
            </button>
            <button className="text-slate-500 hover:text-blue-600 transition-colors p-1.5 rounded hover:bg-slate-50">
              <Settings className="w-4 h-4" />
            </button>
            <button className="text-slate-500 hover:text-rose-600 transition-colors p-1.5 rounded hover:bg-slate-50">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* METRICS RIBBON */}
      <div className="h-10 border-b border-slate-200 bg-white/50 flex items-center px-6 text-xs shrink-0 gap-8 overflow-x-auto shadow-sm z-10 font-medium">
        <div className="flex items-center gap-2 shrink-0">
          <Inbox className="w-4 h-4 text-blue-500" />
          <span className="text-slate-500">RECEBIDOS:</span>
          <span className="text-slate-800 font-bold text-sm">3</span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <LinkIcon className="w-4 h-4 text-emerald-500" />
          <span className="text-slate-500">VINCULADOS:</span>
          <span className="text-slate-800 font-bold text-sm">12</span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Clock className="w-4 h-4 text-amber-500" />
          <span className="text-slate-500">PENDENTES:</span>
          <span className="text-slate-800 font-bold text-sm">2</span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <AlertTriangle className="w-4 h-4 text-rose-500" />
          <span className="text-slate-500">SEM MATCH:</span>
          <span className="text-slate-800 font-bold text-sm">1</span>
        </div>
        <div className="flex items-center gap-2 border-l border-slate-200 pl-8 shrink-0">
          <BarChart3 className="w-4 h-4 text-slate-400" />
          <span className="text-slate-500">TAXA:</span>
          <span className="text-slate-800 font-bold text-sm">92%</span>
        </div>
      </div>

      {/* THREE COLUMNS */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        
        {/* LEFT: INCOMING */}
        <div className="w-[280px] border-r border-slate-200 flex flex-col bg-white shrink-0">
          <div className="h-12 border-b border-slate-100 flex items-center px-4 shrink-0 justify-between">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">INCOMING</span>
            <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-full">{mockStudies.length}</span>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {mockStudies.map((study) => {
              const isActive = selectedStudy?.id === study.id;
              return (
                <div
                  key={study.id}
                  onClick={() => setSelectedStudy(study)}
                  className={`p-3 rounded-lg border text-sm cursor-pointer flex flex-col gap-2 transition-all relative
                    ${isActive
                      ? "bg-blue-50 border-blue-200 shadow-sm"
                      : "bg-white border-slate-200 hover:border-blue-300 hover:bg-slate-50 shadow-sm"
                    }`}
                >
                  {isActive && <div className="absolute left-0 top-2 bottom-2 w-1 bg-blue-600 rounded-r" />}
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-500 font-medium">{study.receivedAt}</span>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase
                      ${isActive ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-500"}`}>
                      {isActive ? "SELECIONADO" : "NOVO"}
                    </span>
                  </div>
                  <div>
                    <div className={`font-semibold truncate ${isActive ? "text-blue-900" : "text-slate-800"}`}>
                      {study.patientName}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5 font-mono">
                      <span className="font-bold text-blue-600">{study.modality}</span>
                      <span>·</span>
                      <span className="truncate">{study.accessionNumber}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* CENTER: WORKSTATION */}
        <div className="flex-1 bg-[#F8FAFC] flex flex-col relative min-w-0">
          <div className="flex-1 overflow-y-auto p-6 md:p-10 flex flex-col gap-6 max-w-4xl mx-auto w-full">
            
            {/* PACS CARD */}
            {selectedStudy && (
              <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div className="bg-slate-50 border-b border-slate-100 px-5 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Server className="w-4 h-4 text-slate-400" />
                    <span className="text-xs font-bold text-slate-600 tracking-wider">FONTE DICOM (PACS)</span>
                  </div>
                  <span className="text-xs text-slate-400 font-mono">{selectedStudy.receivedAt}</span>
                </div>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h2 className="text-2xl font-bold text-slate-800 tracking-tight">{selectedStudy.patientName}</h2>
                      <div className="flex items-center gap-4 text-sm text-slate-500 mt-2">
                        <span>Nasc: <span className="font-semibold text-slate-700">{selectedStudy.birthDate}</span></span>
                        <span>ID: <span className="font-mono text-slate-700">{selectedStudy.patientId}</span></span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-slate-500 mb-1">Acession Number</div>
                      <div className="font-mono text-lg font-bold text-blue-600">{selectedStudy.accessionNumber}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 bg-slate-50 rounded-lg p-4 border border-slate-100">
                    <div className="bg-blue-100 text-blue-700 font-bold px-3 py-1 rounded text-sm">{selectedStudy.modality}</div>
                    <div className="text-slate-700 font-medium">{selectedStudy.description}</div>
                  </div>
                </div>
              </div>
            )}

            {/* VERIFICATION ROW */}
            <div className="flex items-center justify-center my-2">
              <div className="flex items-center gap-6 bg-white border border-slate-200 rounded-full px-8 py-3 shadow-sm text-sm font-medium text-slate-500">
                <span className="flex items-center gap-2 text-emerald-600"><CheckCircle2 className="w-4 h-4" /> NOME MATCH</span>
                <span className="w-1 h-1 rounded-full bg-slate-300" />
                <span className="flex items-center gap-2 text-emerald-600"><CheckCircle2 className="w-4 h-4" /> NASCIMENTO</span>
                <span className="w-1 h-1 rounded-full bg-slate-300" />
                <span className="flex items-center gap-2 text-emerald-600"><CheckCircle2 className="w-4 h-4" /> ID</span>
                <span className="w-1 h-1 rounded-full bg-slate-300" />
                <span className="flex items-center gap-2 text-emerald-600"><CheckCircle2 className="w-4 h-4" /> MODALIDADE</span>
              </div>
            </div>

            {/* RIS CARD */}
            {activeWorklistItem ? (
              <div className="bg-white border border-emerald-200 rounded-xl shadow-sm overflow-hidden ring-1 ring-emerald-50">
                <div className="bg-emerald-50/50 border-b border-emerald-100 px-5 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Database className="w-4 h-4 text-emerald-500" />
                    <span className="text-xs font-bold text-emerald-700 tracking-wider">DESTINO RIS (WORKLIST)</span>
                  </div>
                  <span className="text-xs text-emerald-600 font-mono font-medium">Agendado: {activeWorklistItem.scheduledTime}</span>
                </div>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h2 className="text-2xl font-bold text-slate-800 tracking-tight">{activeWorklistItem.patientName}</h2>
                      <div className="flex items-center gap-4 text-sm text-slate-500 mt-2">
                        <span>Nasc: <span className="font-semibold text-slate-700">{activeWorklistItem.birthDate}</span></span>
                        <span>ID: <span className="font-mono text-slate-700">{activeWorklistItem.patientId}</span></span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-slate-500 mb-1">Acession Number</div>
                      <div className="font-mono text-lg font-bold text-emerald-600">{activeWorklistItem.accessionNumber}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 bg-slate-50 rounded-lg p-4 border border-slate-100">
                    <div className="bg-slate-200 text-slate-700 font-bold px-3 py-1 rounded text-sm">{activeWorklistItem.modality}</div>
                    <div className="text-slate-700 font-medium">{activeWorklistItem.procedure}</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white border border-dashed border-slate-300 rounded-xl p-10 flex flex-col items-center justify-center text-center">
                <Search className="w-8 h-8 text-slate-300 mb-4" />
                <h3 className="text-slate-800 font-bold mb-1">Nenhum item do RIS correspondente</h3>
                <p className="text-slate-500 text-sm max-w-sm">O sistema não encontrou um agendamento automático. Use a busca manual abaixo para localizar o paciente.</p>
              </div>
            )}

            {/* ACTION BUTTON */}
            <div className="mt-4 flex justify-center">
              <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg px-12 py-4 rounded-xl shadow-md transition-all flex items-center gap-3 hover:shadow-lg active:scale-[0.98]">
                <LinkIcon className="w-5 h-5" />
                CONFIRMAR VÍNCULO
              </button>
            </div>

            {/* MANUAL SEARCH */}
            <div className="mt-8 border-t border-slate-200 pt-8">
              <div className="max-w-md mx-auto relative">
                <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input 
                  type="text" 
                  placeholder="Busca manual no RIS (Nome, ID, Accession)..."
                  value={manualSearch}
                  onChange={(e) => setManualSearch(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg pl-12 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-shadow text-slate-800"
                />
              </div>
            </div>

          </div>
        </div>

        {/* RIGHT: OPS LOG */}
        <div className="w-[280px] border-l border-slate-200 bg-white flex flex-col shrink-0">
          <div className="h-12 border-b border-slate-100 flex items-center px-4 shrink-0">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">SYSTEM LOGS</span>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-1">
            {mockLogs.map((log) => (
              <div key={log.id} className="flex gap-3 text-[11px] p-2 hover:bg-slate-50 rounded">
                <span className="font-mono text-slate-400 shrink-0">{log.time}</span>
                <span className={`font-mono leading-relaxed ${
                  log.type === "event" ? "text-slate-600" :
                  log.type === "unmatched" ? "text-blue-600" :
                  "text-emerald-600"
                }`}>
                  {log.text}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* FOOTER */}
      <footer className="h-8 border-t border-slate-200 bg-slate-50 flex items-center justify-between px-6 text-[10px] font-medium text-slate-500 shrink-0 z-20">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> PACS AE: RADIOLOGY_PACS</span>
          <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> RIS AE: WORKLIST_SERVER</span>
        </div>
        <div>
          ClinicalFlow Operator Console
        </div>
        <div>
          v2.4.1 (Stable)
        </div>
      </footer>

    </div>
  );
}
