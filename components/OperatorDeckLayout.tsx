import React, { useState, useMemo, useEffect, useCallback } from "react";
import {
  Terminal, Check, AlertTriangle, Zap, Search,
  Clock, Link as LinkIcon, BarChart3, Activity,
  Settings, LogOut, RefreshCw, Eye, GripVertical,
  Inbox, ChevronRight,
} from "lucide-react";
import { DicomStudy, WorklistItem, ConnectionStatus, NetworkState } from "../types";
import { ModalityBadge } from "./ModalityBadge";

export interface OpsLogEntry {
  id: string;
  time: string;
  type: "link" | "unmatched" | "event";
  text: string;
}

interface OperatorDeckLayoutProps {
  studies: DicomStudy[];
  worklist: WorklistItem[];
  selectedStudy: DicomStudy | null;
  selectedWorklist: WorklistItem | null;
  onSelectStudy: (study: DicomStudy) => void;
  onSelectWorklist: (item: WorklistItem) => void;
  onSelectPair: (study: DicomStudy, item: WorklistItem) => void;
  onDetails: (study: DicomStudy) => void;
  draggedStudy: DicomStudy | null;
  onDragStart: (study: DicomStudy) => void;
  onDropStudy: (study: DicomStudy, item: WorklistItem) => void;
  connectionStatus: ConnectionStatus;
  networkStatus: { pacs: NetworkState; ris: NetworkState };
  userDrt: string;
  opsLog: OpsLogEntry[];
  sessionStart: number;
  onOpenSettings: () => void;
  onLogout: () => void;
  onRefresh: () => void;
  pacsAeTitle: string;
}

function computeConfidence(study: DicomStudy, item: WorklistItem): number {
  const accMatch = study.accessionNumber === item.accessionNumber;
  const pidMatch = study.patientId.trim() === item.patientId.trim();
  const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
  const nameMatch = normalize(study.patientName) === normalize(item.patientName);
  if (accMatch) return 100;
  if (pidMatch && nameMatch) return 96;
  if (pidMatch) return 88;
  if (nameMatch) return 72;
  return 0;
}

function formatSessionTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export const OperatorDeckLayout: React.FC<OperatorDeckLayoutProps> = ({
  studies,
  worklist,
  selectedStudy,
  selectedWorklist,
  onSelectStudy,
  onSelectWorklist,
  onSelectPair,
  onDetails,
  draggedStudy,
  onDragStart,
  onDropStudy,
  connectionStatus,
  networkStatus,
  userDrt,
  opsLog,
  sessionStart,
  onOpenSettings,
  onLogout,
  onRefresh,
  pacsAeTitle,
}) => {
  const [sessionSeconds, setSessionSeconds] = useState(0);
  const [manualSearch, setManualSearch] = useState("");

  useEffect(() => {
    if (!sessionStart) return;
    const update = () => setSessionSeconds(Math.floor((Date.now() - sessionStart) / 1000));
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [sessionStart]);

  const autoMatch = useMemo(() => {
    if (!selectedStudy) return null;
    let bestItem: WorklistItem | null = null;
    let bestScore = 0;
    for (const item of worklist) {
      if (item.status === "completed") continue;
      const score = computeConfidence(selectedStudy, item);
      if (score > bestScore) { bestScore = score; bestItem = item; }
    }
    return bestScore >= 60 ? { item: bestItem!, score: bestScore } : null;
  }, [selectedStudy, worklist]);

  const activeWorklistItem = selectedWorklist ?? autoMatch?.item ?? null;
  const autoMatchScore = autoMatch?.score ?? 0;

  const linkedCount = worklist.filter(w => w.status === "completed").length;
  const pendingCount = worklist.filter(w => w.status !== "completed").length;

  const unmatchedStudies = useMemo(() => {
    return studies.filter(s => {
      for (const item of worklist) {
        if (item.status === "completed") continue;
        if (computeConfidence(s, item) >= 60) return false;
      }
      return true;
    });
  }, [studies, worklist]);

  const isLinkedStudy = useCallback((study: DicomStudy) =>
    worklist.some(w => w.status === "completed" && w.studyInstanceUID === study.studyInstanceUID),
    [worklist]);

  const searchResults = useMemo(() => {
    if (!manualSearch.trim()) return [];
    const q = manualSearch.toLowerCase();
    return worklist.filter(w =>
      w.status !== "completed" &&
      (w.patientName.toLowerCase().includes(q) ||
       w.patientId.toLowerCase().includes(q) ||
       w.accessionNumber.toLowerCase().includes(q))
    ).slice(0, 5);
  }, [manualSearch, worklist]);

  const namesMatch = selectedStudy && activeWorklistItem
    ? selectedStudy.patientName.toLowerCase().replace(/[^a-z0-9]/g, "") ===
      activeWorklistItem.patientName.toLowerCase().replace(/[^a-z0-9]/g, "")
    : false;
  const datesMatch = selectedStudy && activeWorklistItem
    ? selectedStudy.birthDate === activeWorklistItem.birthDate
    : false;
  const idMatch = selectedStudy && activeWorklistItem
    ? selectedStudy.patientId.trim() === activeWorklistItem.patientId.trim()
    : false;
  const modalityMatch = selectedStudy && activeWorklistItem
    ? selectedStudy.modality === activeWorklistItem.modality
    : false;
  const hasDiscrepancy = selectedStudy && activeWorklistItem && (!namesMatch || !idMatch);

  return (
    <div className="w-full h-screen bg-[#020817] text-slate-300 font-sans flex flex-col overflow-hidden selection:bg-cyan-900 selection:text-cyan-50">

      {/* HEADER */}
      <header className="h-14 border-b border-slate-700/50 bg-[#020817] flex items-center justify-between px-4 shrink-0 gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <Terminal className="w-5 h-5 text-cyan-500 shrink-0" />
          <span className="font-mono font-bold tracking-wider text-sm text-cyan-400 whitespace-nowrap">
            PRESERVE RECEIVER
          </span>
          <span className="text-slate-600 font-mono hidden sm:block">·</span>
          <span className="font-mono text-xs text-slate-500 tracking-widest uppercase hidden sm:block whitespace-nowrap">
            CONTINGENCY SYSTEM
          </span>
        </div>

        <div className="flex items-center gap-4 font-mono text-xs shrink-0">
          <div className="hidden md:flex items-center gap-5">
            <div className="flex items-center gap-2">
              <div className={`w-2.5 h-2.5 rounded-full ${
                networkStatus.pacs === "online"
                  ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)] animate-pulse"
                  : networkStatus.pacs === "degraded"
                  ? "bg-amber-500 animate-pulse"
                  : "bg-rose-500"
              }`} />
              <span className="text-slate-500">PACS:</span>
              <span className={networkStatus.pacs === "online" ? "text-emerald-400 font-bold" : networkStatus.pacs === "degraded" ? "text-amber-400 font-bold" : "text-rose-400 font-bold"}>
                {networkStatus.pacs === "online" ? "ONLINE" : networkStatus.pacs === "degraded" ? "DEGRADED" : "OFFLINE"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-2.5 h-2.5 rounded-full ${
                networkStatus.ris === "online"
                  ? "bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.6)] animate-pulse"
                  : networkStatus.ris === "degraded"
                  ? "bg-amber-500 animate-pulse"
                  : "bg-rose-500"
              }`} />
              <span className="text-slate-500">RIS:</span>
              <span className={networkStatus.ris === "online" ? "text-indigo-400 font-bold" : networkStatus.ris === "degraded" ? "text-amber-400 font-bold" : "text-rose-400 font-bold"}>
                {networkStatus.ris === "online" ? "ONLINE" : networkStatus.ris === "degraded" ? "DEGRADED" : "OFFLINE"}
              </span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-2 border-l border-slate-700/50 pl-4">
            <span className="text-slate-500">SESSION:</span>
            <span className="text-cyan-400 font-bold tracking-wider">{formatSessionTime(sessionSeconds)}</span>
            <span className="ml-1 px-2 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded text-[10px] font-bold">
              DRT-MODE
            </span>
          </div>

          {userDrt && (
            <div className="hidden lg:flex flex-col items-end border-l border-slate-700/50 pl-4">
              <span className="text-slate-200 font-bold text-[11px]">DRT {userDrt}</span>
              <span className="text-slate-600 text-[9px]">Radiology Tech</span>
            </div>
          )}

          <div className="flex items-center gap-1 border-l border-slate-700/50 pl-3">
            <button onClick={onRefresh} title="Atualizar RIS"
              className="p-2 text-slate-500 hover:text-cyan-400 hover:bg-cyan-500/10 rounded transition-colors">
              <RefreshCw className="w-4 h-4" />
            </button>
            <button onClick={onOpenSettings} title="Configurações"
              className="p-2 text-slate-500 hover:text-slate-200 hover:bg-slate-800 rounded transition-colors">
              <Settings className="w-4 h-4" />
            </button>
            <button onClick={onLogout} title="Sair"
              className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded transition-colors">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* METRICS RIBBON */}
      <div className="h-10 border-b border-slate-700/40 bg-[#0a0f18] flex items-center px-4 font-mono text-xs shrink-0 gap-6 overflow-x-auto">
        <div className="flex items-center gap-2 shrink-0">
          <Inbox className="w-3.5 h-3.5 text-cyan-500" />
          <span className="text-slate-500">RECEBIDOS:</span>
          <span className="text-cyan-400 font-bold">{studies.length}</span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <LinkIcon className="w-3.5 h-3.5 text-emerald-500" />
          <span className="text-slate-500">VINCULADOS:</span>
          <span className="text-emerald-400 font-bold">{linkedCount}</span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Clock className="w-3.5 h-3.5 text-amber-500" />
          <span className="text-slate-500">PENDENTES:</span>
          <span className="text-amber-400 font-bold">{pendingCount}</span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
          <span className="text-slate-500">SEM MATCH:</span>
          <span className="text-rose-400 font-bold">{unmatchedStudies.length}</span>
        </div>
        <div className="flex items-center gap-2 border-l border-slate-700/50 pl-6 shrink-0">
          <Activity className="w-3.5 h-3.5 text-slate-500" />
          <span className="text-slate-500">STATUS:</span>
          <span className={`font-bold ${connectionStatus === ConnectionStatus.CONNECTED ? "text-emerald-400" : connectionStatus === ConnectionStatus.CONNECTING ? "text-amber-400 animate-pulse" : "text-rose-400"}`}>
            {connectionStatus === ConnectionStatus.CONNECTED ? "CONECTADO" : connectionStatus === ConnectionStatus.CONNECTING ? "CONECTANDO..." : "DESCONECTADO"}
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <BarChart3 className="w-3.5 h-3.5 text-slate-500" />
          <span className="text-slate-500">TAXA:</span>
          <span className="text-slate-300 font-bold">
            {studies.length > 0 ? Math.round((linkedCount / Math.max(worklist.length, 1)) * 100) : 0}%
          </span>
        </div>
      </div>

      {/* THREE COLUMNS */}
      <div className="flex-1 flex overflow-hidden min-h-0">

        {/* LEFT: INCOMING FEED */}
        <div className="w-[260px] xl:w-[290px] border-r border-slate-700/50 flex flex-col bg-[#020817] shrink-0">
          <div className="h-9 border-b border-slate-700/40 flex items-center px-4 shrink-0 gap-2">
            <span className="font-mono text-xs font-bold text-cyan-500 tracking-wider">INCOMING</span>
            <span className="w-1.5 h-3 bg-cyan-500 animate-pulse block" />
            <span className="ml-auto font-mono text-[10px] text-slate-600">{studies.length}</span>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1.5" style={{ scrollbarWidth: "thin", scrollbarColor: "#334155 transparent" }}>
            {studies.length === 0 && (
              <div className="flex flex-col items-center justify-center h-32 text-slate-700 text-xs font-mono">
                <Inbox className="w-8 h-8 mb-2 opacity-30" />
                Aguardando estudos...
              </div>
            )}
            {studies.map((study) => {
              const linked = isLinkedStudy(study);
              const isActive = selectedStudy?.id === study.id;
              const matchScore = autoMatch && selectedStudy?.id === study.id ? autoMatchScore : 0;
              return (
                <div
                  key={study.id}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData("application/json", JSON.stringify(study));
                    e.dataTransfer.effectAllowed = "link";
                    onDragStart(study);
                  }}
                  onClick={() => onSelectStudy(study)}
                  className={`p-2.5 rounded border text-xs cursor-pointer flex flex-col gap-1.5 transition-all relative
                    ${isActive
                      ? "bg-cyan-950/30 border-cyan-500/50 shadow-[0_0_12px_rgba(8,145,178,0.15)]"
                      : linked
                      ? "bg-[#0a0f18] border-slate-800/40 opacity-40 hover:opacity-60"
                      : "bg-[#0a0f18] border-slate-800 hover:border-slate-600 hover:bg-slate-900/40"
                    }`}
                >
                  {isActive && <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-cyan-500 rounded-l" />}
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-mono text-[10px] text-slate-600">{study.receivedAt}</span>
                    <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold
                      ${isActive ? "bg-amber-500/20 text-amber-400 border border-amber-500/20"
                      : linked ? "bg-slate-800 text-slate-500"
                      : "bg-cyan-500/10 text-cyan-500 border border-cyan-500/15"}`}>
                      {isActive ? "ACTIVE" : linked ? "DONE" : "NEW"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ModalityBadge modality={study.modality} />
                    <span className={`font-semibold truncate ${isActive ? "text-cyan-50" : linked ? "text-slate-500" : "text-slate-200"}`}>
                      {study.patientName}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-mono text-[10px] text-slate-600 truncate">{study.accessionNumber}</span>
                    <button
                      onClick={(e) => { e.stopPropagation(); onDetails(study); }}
                      className="text-slate-700 hover:text-cyan-400 transition-colors shrink-0"
                      title="Ver detalhes">
                      <Eye className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* CENTER: WORKSTATION */}
        <div className="flex-1 bg-[#070c17] flex flex-col relative min-w-0">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

          <div className="h-9 border-b border-slate-700/40 flex items-center px-5 shrink-0 gap-2 relative z-10">
            <span className="font-mono text-xs font-bold text-slate-400 tracking-wider">WORKSTATION</span>
            {selectedStudy && (
              <span className="ml-2 text-[10px] font-mono text-slate-600">
                · {selectedStudy.patientName}
              </span>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4 relative z-10" style={{ scrollbarWidth: "thin", scrollbarColor: "#334155 transparent" }}>

            {!selectedStudy ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center py-20">
                <div className="w-16 h-16 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mb-4">
                  <ChevronRight className="w-8 h-8 text-slate-700" />
                </div>
                <p className="text-slate-600 font-mono text-sm">Selecione um estudo do painel INCOMING</p>
                <p className="text-slate-700 font-mono text-xs mt-1">para iniciar o vínculo</p>
              </div>
            ) : (
              <>
                {/* PACS Study Card */}
                <div className="border border-slate-700/60 rounded-lg bg-[#020817] p-4 shadow-lg relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-cyan-500 rounded-l" />
                  <div className="absolute top-2 right-3 text-[9px] font-mono text-slate-600 uppercase tracking-wider">PACS / DICOM</div>
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <ModalityBadge modality={selectedStudy.modality} />
                      <div>
                        <h2 className="text-lg font-bold text-white tracking-wide">{selectedStudy.patientName.toUpperCase()}</h2>
                        <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400 mt-0.5">
                          <span>DOB: {selectedStudy.birthDate}</span>
                          <span>·</span>
                          <span>ID: {selectedStudy.patientId}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end shrink-0">
                      <span className="font-mono text-sm text-cyan-400 font-bold">{selectedStudy.accessionNumber}</span>
                      <span className="text-[10px] text-slate-500 font-mono mt-0.5">RECV: {selectedStudy.receivedAt}</span>
                    </div>
                  </div>
                  <div className="bg-[#0a0f18] border border-slate-800 rounded p-2.5 text-[11px]">
                    <span className="text-slate-500 mr-2 font-mono">DESC:</span>
                    <span className="text-slate-300">{(selectedStudy.description || selectedStudy.modality + " Exam").toUpperCase()}</span>
                  </div>
                  {autoMatch && (
                    <div className="mt-2.5 flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono text-[10px] rounded px-2 py-0.5">
                        <Check className="w-3 h-3" /> MATCH AUTOMÁTICO {autoMatchScore}%
                      </span>
                    </div>
                  )}
                </div>

                {/* Verification Row */}
                <div className="flex items-center justify-center">
                  <div className="flex items-center gap-2 font-mono text-[11px] text-slate-400 bg-[#0a0f18] border border-slate-800 rounded-full px-5 py-2 gap-4">
                    <span className={`flex items-center gap-1 ${activeWorklistItem ? (namesMatch ? "text-emerald-400" : "text-rose-400") : "text-slate-600"}`}>
                      {activeWorklistItem ? (namesMatch ? <Check className="w-3 h-3" /> : <span>✗</span>) : null} NOME
                    </span>
                    <span className="text-slate-700">/</span>
                    <span className={`flex items-center gap-1 ${activeWorklistItem ? (datesMatch ? "text-emerald-400" : "text-amber-400") : "text-slate-600"}`}>
                      {activeWorklistItem ? (datesMatch ? <Check className="w-3 h-3" /> : <span>~</span>) : null} NASC
                    </span>
                    <span className="text-slate-700">/</span>
                    <span className={`flex items-center gap-1 ${activeWorklistItem ? (idMatch ? "text-emerald-400" : "text-rose-400") : "text-slate-600"}`}>
                      {activeWorklistItem ? (idMatch ? <Check className="w-3 h-3" /> : <span>✗</span>) : null} ID
                    </span>
                    <span className="text-slate-700">/</span>
                    <span className={`flex items-center gap-1 ${activeWorklistItem ? (modalityMatch ? "text-emerald-400" : "text-amber-400") : "text-slate-600"}`}>
                      {activeWorklistItem ? (modalityMatch ? <Check className="w-3 h-3" /> : <span>~</span>) : null} MOD
                    </span>
                  </div>
                </div>

                {/* RIS Worklist Target */}
                {activeWorklistItem ? (
                  <div className="border border-slate-700/60 rounded-lg bg-[#020817] p-4 shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500 rounded-l" />
                    <div className="absolute top-2 right-3 text-[9px] font-mono text-slate-600 uppercase tracking-wider">RIS WORKLIST TARGET</div>
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3">
                        <ModalityBadge modality={activeWorklistItem.modality} />
                        <div>
                          <h2 className="text-lg font-bold text-white tracking-wide">{activeWorklistItem.patientName.toUpperCase()}</h2>
                          <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400 mt-0.5">
                            <span>DOB: {activeWorklistItem.birthDate}</span>
                            <span>·</span>
                            <span>ID: {activeWorklistItem.patientId}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end shrink-0">
                        <span className="font-mono text-sm text-emerald-400 font-bold">{activeWorklistItem.accessionNumber}</span>
                        <span className="text-[10px] text-slate-500 font-mono mt-0.5">
                          SCHED: {activeWorklistItem.scheduledTime.split(" ")[1] || activeWorklistItem.scheduledTime}
                        </span>
                      </div>
                    </div>
                    <div className="bg-[#0a0f18] border border-slate-800 rounded p-2.5 text-[11px]">
                      <span className="text-slate-500 mr-2 font-mono">PROC:</span>
                      <span className="text-slate-300">{activeWorklistItem.procedure.toUpperCase()}</span>
                    </div>
                  </div>
                ) : (
                  <div className="border border-dashed border-slate-700/40 rounded-lg p-6 flex flex-col items-center justify-center text-center gap-2"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      const data = e.dataTransfer.getData("application/json");
                      if (data && selectedStudy) {
                        try { onDropStudy(selectedStudy, JSON.parse(data) as WorklistItem); } catch {}
                      }
                    }}>
                    <AlertTriangle className="w-5 h-5 text-amber-500/50" />
                    <p className="text-amber-400/70 font-mono text-xs">Nenhuma correspondência automática encontrada</p>
                    <p className="text-slate-600 font-mono text-[10px]">Use a busca manual abaixo</p>
                  </div>
                )}

                {/* Confirm Button */}
                {activeWorklistItem && (
                  <button
                    onClick={() => onSelectPair(selectedStudy, activeWorklistItem)}
                    className={`w-full relative group overflow-hidden rounded-md shadow-lg transition-all border font-mono font-bold tracking-widest
                      ${hasDiscrepancy
                        ? "bg-amber-600 hover:bg-amber-500 text-white shadow-amber-500/20 border-amber-400"
                        : "bg-cyan-600 hover:bg-cyan-500 text-white shadow-cyan-500/25 border-cyan-400"}`}>
                    <div className="px-6 py-3.5 flex items-center justify-center gap-3 text-base">
                      <Zap className="w-5 h-5 fill-current" />
                      {hasDiscrepancy ? "CONFIRMAR COM DIVERGÊNCIA" : "CONFIRMAR VÍNCULO"}
                      {hasDiscrepancy && <AlertTriangle className="w-4 h-4 animate-pulse" />}
                    </div>
                  </button>
                )}

                {/* Manual Search */}
                <div className="border-t border-slate-800 pt-4">
                  <p className="font-mono text-[10px] text-slate-600 mb-2 uppercase tracking-wider">MANUAL OVERRIDE / BUSCA</p>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-600" />
                      <input
                        type="text"
                        placeholder="Buscar por Acc, MRN ou Nome..."
                        value={manualSearch}
                        onChange={e => setManualSearch(e.target.value)}
                        className="w-full bg-[#0a0f18] border border-slate-700 rounded text-xs py-2 pl-9 pr-3 font-mono text-slate-300 focus:outline-none focus:border-cyan-600 focus:ring-1 focus:ring-cyan-600/50 placeholder:text-slate-700"
                      />
                    </div>
                  </div>
                  {searchResults.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {searchResults.map(item => (
                        <div
                          key={item.id}
                          onClick={() => { onSelectWorklist(item); setManualSearch(""); }}
                          className="flex items-center gap-3 p-2.5 bg-[#0a0f18] border border-slate-800 hover:border-slate-600 rounded cursor-pointer transition-colors group">
                          <ModalityBadge modality={item.modality} />
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-semibold text-slate-200 truncate">{item.patientName}</div>
                            <div className="text-[10px] font-mono text-slate-500">{item.patientId} · {item.accessionNumber}</div>
                          </div>
                          <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-300" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* RIGHT: OPS LOG */}
        <div className="w-[260px] xl:w-[290px] border-l border-slate-700/50 flex flex-col bg-[#020817] shrink-0">
          <div className="h-9 border-b border-slate-700/40 flex items-center px-4 shrink-0">
            <span className="font-mono text-xs font-bold text-emerald-500 tracking-wider">OPS LOG</span>
            <span className="ml-auto font-mono text-[10px] text-slate-600">{opsLog.length} events</span>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-0.5 font-mono text-[11px]" style={{ scrollbarWidth: "thin", scrollbarColor: "#334155 transparent" }}>
            {opsLog.length === 0 && (
              <div className="flex flex-col items-center justify-center h-24 text-slate-700 text-xs text-center">
                <Activity className="w-6 h-6 mb-2 opacity-30" />
                Aguardando operações...
              </div>
            )}
            {opsLog.map(entry => (
              <div key={entry.id} className="flex gap-2 py-1.5 border-b border-slate-800/40">
                <span className="text-slate-700 shrink-0">{entry.time}</span>
                <span className={
                  entry.type === "link" ? "text-emerald-400/90"
                  : entry.type === "event" ? "text-cyan-400/90"
                  : "text-amber-400/90"
                }>
                  {entry.text}
                </span>
              </div>
            ))}
            {opsLog.length > 0 && (
              <div className="pt-3 text-slate-700 text-center text-[10px]">
                -- END OF LOG --
              </div>
            )}
          </div>
        </div>
      </div>

      {/* BOTTOM STATUS BAR */}
      <footer className="h-8 bg-[#000000] border-t border-slate-800 flex items-center justify-between px-4 font-mono text-[10px] text-slate-500 shrink-0">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <div className={`w-1.5 h-1.5 rounded-full ${connectionStatus === ConnectionStatus.CONNECTED ? "bg-emerald-500" : "bg-rose-500"}`} />
            PACS: {pacsAeTitle}
          </span>
          <span className="flex items-center gap-1.5">
            <div className={`w-1.5 h-1.5 rounded-full ${networkStatus.ris === "online" ? "bg-indigo-500" : "bg-rose-500"}`} />
            RIS: {networkStatus.ris === "online" ? "HTTP 200" : "HTTP 503"}
          </span>
        </div>
        <div className={`font-bold tracking-widest flex items-center gap-1.5 ${networkStatus.pacs !== "online" || networkStatus.ris !== "online" ? "text-amber-400" : "text-slate-600"}`}>
          {(networkStatus.pacs !== "online" || networkStatus.ris !== "online") && (
            <AlertTriangle className="w-3 h-3" />
          )}
          {networkStatus.pacs !== "online" || networkStatus.ris !== "online"
            ? "CONTINGÊNCIA ATIVA · SISTEMA OPERANDO EM MODO DE RECUPERAÇÃO"
            : "SISTEMA OPERACIONAL · MODO NORMAL"}
        </div>
        <div>v2.4.1 · BUILD 20260506</div>
      </footer>
    </div>
  );
};
