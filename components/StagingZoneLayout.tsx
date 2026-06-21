import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Settings, LogOut, RefreshCw, Clock, AlertTriangle, CheckCircle2, Eye, EyeOff, Shield, ShieldAlert } from "lucide-react";
import { DicomStudy, WorklistItem, ConnectionStatus, NetworkState } from "../types";
import { Logo } from "./Logo";
import { ModalityBadge } from "./ModalityBadge";

export interface OpsLogEntry {
  id: string;
  time: string;
  type: "link" | "unmatched" | "event";
  text: string;
}

interface StagingZoneLayoutProps {
  studies: DicomStudy[];
  worklist: WorklistItem[];
  selectedStudy: DicomStudy | null;
  selectedWorklist: WorklistItem | null;
  onSelectStudy: (study: DicomStudy | null) => void;
  onSelectWorklist: (item: WorklistItem | null) => void;
  onConfirmLink: (study: DicomStudy, item: WorklistItem) => void;
  onDetails: (study: DicomStudy) => void;
  connectionStatus: ConnectionStatus;
  networkStatus: { pacs: NetworkState; ris: NetworkState };
  userDrt: string;
  sessionStart: number;
  onOpenSettings: () => void;
  onLogout: () => void;
  onRefresh: () => void;
  privacyMode: boolean;
  onTogglePrivacy: () => void;
}

function formatSessionTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function normalize(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]/g, "");
}

// LGPD Masking Helpers
export function maskPII(name: string, active: boolean): string {
  if (!active) return name;
  if (!name) return "";
  const parts = name.split(" ");
  return parts.map((p) => {
    if (p.toLowerCase() === "da" || p.toLowerCase() === "de" || p.toLowerCase() === "do" || p.toLowerCase() === "dos" || p.toLowerCase() === "e") return p;
    if (p.length > 0) {
      return p[0] + "*".repeat(Math.max(1, p.length - 1));
    }
    return p;
  }).join(" ");
}

export function maskBirthDate(date: string, active: boolean): string {
  if (!active) return date;
  if (!date) return "";
  return date.replace(/^\d{2}\/\d{2}/, "**/**");
}

export function maskPatientId(id: string, active: boolean): string {
  if (!active) return id;
  if (!id) return "";
  const parts = id.split("-");
  if (parts.length > 1) {
    return parts[0] + "-" + "*".repeat(parts[1].length);
  }
  return "*".repeat(id.length);
}

function MatchRow({ label, a, b, match, privacyMode }: { label: string; a: string; b: string; match: boolean; privacyMode: boolean }) {
  let valA = a;
  let valB = b;
  if (privacyMode) {
    if (label === "Paciente") {
      valA = maskPII(a, true);
      valB = maskPII(b, true);
    } else if (label === "Nasc.") {
      valA = maskBirthDate(a, true);
      valB = maskBirthDate(b, true);
    } else if (label === "ID") {
      valA = maskPatientId(a, true);
      valB = maskPatientId(b, true);
    }
  }
  return (
    <div className="flex items-center gap-2 text-[11px]">
      <span className="text-slate-500 w-16 shrink-0">{label}</span>
      <span className="text-slate-200 flex-1 truncate">{valA}</span>
      <span className={`text-base font-bold w-6 text-center ${match ? "text-emerald-400" : "text-red-400"}`}>
        {match ? "✓" : "✗"}
      </span>
      <span className="text-slate-200 flex-1 truncate">{valB}</span>
    </div>
  );
}

function NetworkLed({ state, label }: { state: NetworkState; label: string }) {
  const color =
    state === "online"   ? "bg-cyan-400 shadow-[0_0_6px_rgba(34,211,238,0.8)]" :
    state === "degraded" ? "bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.8)]" :
                           "bg-red-500  shadow-[0_0_6px_rgba(239,68,68,0.8)]";
  return (
    <div className="flex items-center gap-1.5">
      <div className={`w-1.5 h-1.5 rounded-full ${color}`} />
      <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wide">{label}</span>
    </div>
  );
}

export const StagingZoneLayout: React.FC<StagingZoneLayoutProps> = ({
  studies,
  worklist,
  selectedStudy,
  selectedWorklist,
  onSelectStudy,
  onSelectWorklist,
  onConfirmLink,
  onDetails,
  connectionStatus,
  networkStatus,
  userDrt,
  sessionStart,
  onOpenSettings,
  onLogout,
  onRefresh,
  privacyMode,
  onTogglePrivacy,
}) => {
  const [sessionSeconds, setSessionSeconds] = useState(0);

  useEffect(() => {
    if (!sessionStart) return;
    const update = () => setSessionSeconds(Math.floor((Date.now() - sessionStart) / 1000));
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [sessionStart]);

  const isLinkedStudy = useCallback((study: DicomStudy) =>
    worklist.some(w =>
      w.status === "completed" &&
      (w.studyInstanceUID === study.studyInstanceUID ||
       w.accessionNumber === study.accessionNumber)
    ), [worklist]);

  const isLinkedWorklist = (item: WorklistItem) => item.status === "completed";

  const linkedItems = useMemo(() =>
    worklist.filter(w => w.status === "completed"),
    [worklist]
  );

  const pacs = selectedStudy;
  const ris = selectedWorklist;

  const nameMatch  = pacs && ris ? normalize(pacs.patientName).startsWith(normalize(ris.patientName).slice(0, 6)) || normalize(ris.patientName).startsWith(normalize(pacs.patientName).slice(0, 6)) : false;
  const dobMatch   = pacs && ris ? pacs.birthDate === ris.birthDate : false;
  const pidMatch   = pacs && ris ? pacs.patientId.trim() === ris.patientId.trim() : false;
  const modMatch   = pacs && ris ? pacs.modality === ris.modality : false;
  const allMatch   = nameMatch && dobMatch && pidMatch && modMatch;
  const hasDiscrep = pacs && ris && !(nameMatch && dobMatch && pidMatch);

  const pacsStatus = networkStatus.pacs;
  const risStatus  = networkStatus.ris;
  const contingency = pacsStatus === "offline" || risStatus === "offline";

  function handleConfirm() {
    if (pacs && ris) onConfirmLink(pacs, ris);
  }

  return (
    <div className="w-full h-screen bg-[#020617] text-slate-200 flex flex-col overflow-hidden">

      {/* ── HEADER ───────────────────────────────────────── */}
      <header className="h-14 flex items-center justify-between px-4 bg-slate-900/60 border-b border-white/10 shrink-0 gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <Logo size={32} />
          <div className="leading-none">
            <div className="text-sm font-bold text-white">
              Preserve <span className="text-cyan-400 font-light">Receiver</span>
            </div>
            <div className="text-[9px] font-mono text-slate-500 uppercase tracking-widest mt-0.5">
              Contingency System
            </div>
          </div>
        </div>

        <div className="flex items-center gap-5">
          <div className="flex items-center gap-4">
            <NetworkLed state={pacsStatus} label="PACS" />
            <NetworkLed state={risStatus}  label="RIS" />
          </div>

          {sessionStart > 0 && (
            <div className="flex items-center gap-1.5 text-slate-500">
              <Clock size={11} />
              <span className="text-[10px] font-mono tracking-wider">{formatSessionTime(sessionSeconds)}</span>
            </div>
          )}

          <div className="text-right leading-none">
            <div className="text-xs font-bold text-slate-200">DRT {userDrt}</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Radiology Technician</div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={onTogglePrivacy}
              title={privacyMode ? "Desativar Modo de Privacidade (LGPD)" : "Ativar Modo de Privacidade (LGPD)"}
              className={`p-1.5 rounded-lg transition-all duration-200 flex items-center justify-center ${
                privacyMode
                  ? "text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20"
                  : "text-slate-500 hover:text-slate-300 hover:bg-slate-800 border border-transparent"
              }`}
            >
              {privacyMode ? <Shield size={14} /> : <ShieldAlert size={14} />}
            </button>
            <button
              onClick={onRefresh}
              title="Sincronizar RIS"
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-colors"
            >
              <RefreshCw size={14} />
            </button>
            <button
              onClick={onOpenSettings}
              title="Configurações"
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-colors"
            >
              <Settings size={14} />
            </button>
            <button
              onClick={onLogout}
              title="Sair"
              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
            >
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </header>

      {/* ── CONTINGENCY BANNER ───────────────────────────── */}
      {contingency && (
        <div className="shrink-0 bg-amber-500/10 border-b border-amber-500/30 px-4 py-1.5 flex items-center gap-2">
          <AlertTriangle size={12} className="text-amber-400 shrink-0" />
          <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-widest">
            CONTINGÊNCIA ATIVA — Servidores externos indisponíveis
          </span>
        </div>
      )}

      {/* ── THREE-COLUMN BODY ────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">

        {/* LEFT: PACS Recebidos */}
        <div className="w-[260px] shrink-0 flex flex-col border-r border-white/10 overflow-hidden">
          <div className="flex items-center justify-between px-3 py-2 border-b border-white/10 bg-slate-900/30 shrink-0">
            <div className="flex items-center gap-2">
              <div className={`w-1.5 h-1.5 rounded-full ${pacsStatus === "online" ? "bg-cyan-400" : "bg-slate-600"}`} />
              <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">PACS Recebidos</span>
            </div>
            <span className="text-[10px] font-mono text-slate-500">{studies.length}</span>
          </div>
          <div className="flex-1 overflow-y-auto">
            {studies.map(study => {
              const linked = isLinkedStudy(study);
              const active = selectedStudy?.id === study.id;
              return (
                <button
                  key={study.id}
                  onClick={() => !linked && onSelectStudy(active ? null : study)}
                  disabled={linked}
                  className={`w-full text-left px-3 py-2.5 border-b border-white/5 transition-all group ${
                    linked
                      ? "opacity-40 cursor-default"
                      : active
                      ? "bg-cyan-500/10 border-l-2 border-l-cyan-500"
                      : "hover:bg-slate-800/50 border-l-2 border-l-transparent"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <ModalityBadge modality={study.modality} />
                    <div className="flex items-center gap-1">
                      {!linked && (
                        <button
                          onClick={(e) => { e.stopPropagation(); onDetails(study); }}
                          className="p-0.5 rounded text-slate-600 hover:text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Eye size={10} />
                        </button>
                      )}
                      <span className="text-[10px] font-mono text-slate-500">{study.receivedAt}</span>
                    </div>
                  </div>
                  <div className="text-[11px] font-semibold text-slate-200 truncate">
                    {maskPII(study.patientName, privacyMode)}
                  </div>
                  <div className="text-[10px] text-slate-500 truncate">{study.description}</div>
                  <div className="text-[10px] font-mono text-slate-600 truncate">{study.accessionNumber}</div>
                  {linked && (
                    <div className="flex items-center gap-1 mt-0.5">
                      <CheckCircle2 size={9} className="text-emerald-400" />
                      <span className="text-[9px] text-emerald-400 font-bold">VINCULADO</span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* CENTER: Zona de Vinculação */}
        <div className="flex-1 flex flex-col overflow-hidden bg-[#030918]">
          <div className="flex items-center justify-between px-4 py-2 border-b border-white/10 bg-slate-900/20 shrink-0">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Zona de Vinculação</span>
            <span className="text-[10px] text-slate-600">Selecione um estudo e um item da worklist</span>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center p-6 overflow-y-auto">
            {!pacs && !ris ? (
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-7 h-7 text-slate-600" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <p className="text-slate-500 text-sm font-medium">Selecione um estudo PACS e um item da worklist para vincular</p>
                <p className="text-slate-600 text-xs mt-1">Use as colunas laterais para escolher os itens</p>
              </div>
            ) : (
              <div className="w-full max-w-xl space-y-4">

                {/* Side-by-side cards */}
                <div className="grid grid-cols-2 gap-3">
                  {/* PACS card */}
                  <div className={`rounded-xl border p-3.5 transition-all ${pacs ? "border-cyan-500/30 bg-cyan-500/5" : "border-slate-700 bg-slate-800/30"}`}>
                    <div className="text-[9px] font-bold uppercase tracking-widest text-cyan-500 mb-2">Estudo PACS</div>
                    {pacs ? (
                      <>
                        <div className="flex items-center gap-2 mb-2">
                          <ModalityBadge modality={pacs.modality} />
                          <span className="text-[10px] font-mono text-slate-500">{pacs.receivedAt}</span>
                        </div>
                        <div className="text-sm font-semibold text-white truncate">
                          {maskPII(pacs.patientName, privacyMode)}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">{pacs.description}</div>
                        <div className="mt-2 space-y-0.5">
                          <div className="text-[10px] text-slate-500">DOB: <span className="text-slate-300">{maskBirthDate(pacs.birthDate, privacyMode)}</span></div>
                          <div className="text-[10px] text-slate-500">ID: <span className="text-slate-300 font-mono">{maskPatientId(pacs.patientId, privacyMode)}</span></div>
                          <div className="text-[10px] text-slate-500">ACC: <span className="text-slate-300 font-mono">{pacs.accessionNumber}</span></div>
                        </div>
                      </>
                    ) : (
                      <div className="text-slate-600 text-xs">Nenhum estudo selecionado</div>
                    )}
                  </div>

                  {/* RIS card */}
                  <div className={`rounded-xl border p-3.5 transition-all ${ris ? "border-indigo-500/30 bg-indigo-500/5" : "border-slate-700 bg-slate-800/30"}`}>
                    <div className="text-[9px] font-bold uppercase tracking-widest text-indigo-400 mb-2">Item Worklist RIS</div>
                    {ris ? (
                      <>
                        <div className="flex items-center gap-2 mb-2">
                          <ModalityBadge modality={ris.modality} />
                          <span className="text-[10px] font-mono text-slate-500">{ris.scheduledTime?.slice(11, 16) ?? ""}</span>
                        </div>
                        <div className="text-sm font-semibold text-white truncate">
                          {maskPII(ris.patientName, privacyMode)}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">{ris.procedure}</div>
                        <div className="mt-2 space-y-0.5">
                          <div className="text-[10px] text-slate-500">DOB: <span className="text-slate-300">{maskBirthDate(ris.birthDate, privacyMode)}</span></div>
                          <div className="text-[10px] text-slate-500">ID: <span className="text-slate-300 font-mono">{maskPatientId(ris.patientId, privacyMode)}</span></div>
                          <div className="text-[10px] text-slate-500">ACC: <span className="text-slate-300 font-mono">{ris.accessionNumber}</span></div>
                        </div>
                      </>
                    ) : (
                      <div className="text-slate-600 text-xs">Nenhum item selecionado</div>
                    )}
                  </div>
                </div>

                {/* Verification table */}
                {pacs && ris && (
                  <div className="rounded-xl border border-white/10 bg-slate-900/40 p-4">
                    <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-3">Verificação de Dados</div>
                    <div className="space-y-2.5">
                      <MatchRow label="Paciente" a={pacs.patientName}    b={ris.patientName}    match={nameMatch} privacyMode={privacyMode} />
                      <MatchRow label="Nasc."    a={pacs.birthDate}      b={ris.birthDate}      match={dobMatch}  privacyMode={privacyMode} />
                      <MatchRow label="ID"       a={pacs.patientId}      b={ris.patientId}      match={pidMatch}  privacyMode={privacyMode} />
                      <MatchRow label="Modal."   a={pacs.modality}       b={ris.modality}       match={modMatch}  privacyMode={privacyMode} />
                    </div>
                  </div>
                )}

                {/* Discrepancy warning */}
                {hasDiscrep && (
                  <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-3 flex items-start gap-2">
                    <AlertTriangle size={14} className="text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-[11px] font-bold text-amber-400">Divergência detectada</div>
                      <div className="text-[10px] text-amber-300/70 mt-0.5">Revise os dados antes de confirmar o vínculo.</div>
                    </div>
                  </div>
                )}

                {/* Confirm button */}
                {pacs && ris && (
                  <button
                    onClick={handleConfirm}
                    className={`w-full py-3 rounded-xl text-sm font-bold tracking-wide transition-all ${
                      allMatch
                        ? "bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_28px_rgba(6,182,212,0.45)]"
                        : "bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30"
                    }`}
                  >
                    {allMatch ? "✓ CONFIRMAR VÍNCULO" : "⚠ CONFIRMAR COM DIVERGÊNCIA"}
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Linked history strip */}
          <div className="border-t border-white/10 bg-slate-900/30 px-4 py-2 shrink-0">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[9px] font-bold uppercase tracking-widest text-slate-600">Histórico de Vínculos</span>
              <span className="text-[9px] font-mono text-emerald-500">{linkedItems.length} confirmados</span>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1 min-h-[24px]">
              {linkedItems.length === 0 ? (
                <span className="text-[10px] text-slate-700 font-mono">Nenhum vínculo confirmado nesta sessão</span>
              ) : (
                linkedItems.map(item => (
                  <div key={item.id} className="shrink-0 flex items-center gap-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1">
                    <div className="w-1 h-1 rounded-full bg-emerald-400" />
                    <span className="text-[10px] font-mono text-emerald-300 whitespace-nowrap">
                      {item.accessionNumber} · {maskPII(item.patientName, privacyMode)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* RIGHT: RIS Worklist */}
        <div className="w-[260px] shrink-0 flex flex-col border-l border-white/10 overflow-hidden">
          <div className="flex items-center justify-between px-3 py-2 border-b border-white/10 bg-slate-900/30 shrink-0">
            <div className="flex items-center gap-2">
              <div className={`w-1.5 h-1.5 rounded-full ${risStatus === "online" ? "bg-indigo-400" : "bg-slate-600"}`} />
              <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">RIS Worklist</span>
            </div>
            <span className="text-[10px] font-mono text-slate-500">{worklist.filter(w => w.status !== "completed").length}</span>
          </div>
          <div className="flex-1 overflow-y-auto">
            {worklist.map(item => {
              const linked = isLinkedWorklist(item);
              const active = selectedWorklist?.id === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => !linked && onSelectWorklist(active ? null : item)}
                  disabled={linked}
                  className={`w-full text-left px-3 py-2.5 border-b border-white/5 transition-all ${
                    linked
                      ? "opacity-40 cursor-default"
                      : active
                      ? "bg-indigo-500/10 border-r-2 border-r-indigo-500"
                      : "hover:bg-slate-800/50 border-r-2 border-r-transparent"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <ModalityBadge modality={item.modality} />
                    <span className="text-[10px] font-mono text-slate-500">
                      {item.scheduledTime?.slice(11, 16) ?? ""}
                    </span>
                  </div>
                  <div className="text-[11px] font-semibold text-slate-200 truncate">
                    {maskPII(item.patientName, privacyMode)}
                  </div>
                  <div className="text-[10px] text-slate-500 truncate">{item.procedure}</div>
                  <div className="text-[10px] font-mono text-slate-600 truncate">{item.accessionNumber}</div>
                  {linked && (
                    <div className="flex items-center gap-1 mt-0.5">
                      <CheckCircle2 size={9} className="text-emerald-400" />
                      <span className="text-[9px] text-emerald-400 font-bold">VINCULADO</span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};
