import React, { useState } from "react";

const MODALITY_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  CT: { bg: "bg-cyan-500/20", text: "text-cyan-300", label: "CT" },
  MR: { bg: "bg-indigo-500/20", text: "text-indigo-300", label: "MR" },
  US: { bg: "bg-amber-500/20", text: "text-amber-300", label: "US" },
  XR: { bg: "bg-slate-500/20", text: "text-slate-300", label: "XR" },
  DX: { bg: "bg-orange-500/20", text: "text-orange-300", label: "DX" },
};

const pacsStudies = [
  { id: "p1", patient: "Silva, Maria J.", dob: "14/03/1978", pid: "P-10023", modality: "CT", acc: "ACC-2024-001", desc: "CT Torax S/C", time: "08:00", date: "2024-05-20" },
  { id: "p2", patient: "Oliveira, Carlos", dob: "22/07/1965", pid: "P-10045", modality: "MR", acc: "ACC-2024-002", desc: "RM Cranio", time: "08:45", date: "2024-05-20" },
  { id: "p3", patient: "Santos, Ana P.", dob: "05/11/1990", pid: "P-10089", modality: "US", acc: "ACC-2024-003", desc: "US Abdomen Total", time: "09:15", date: "2024-05-20" },
  { id: "p4", patient: "Ferreira, Roberto", dob: "30/01/1955", pid: "P-10112", modality: "XR", acc: "ACC-2024-004", desc: "RX Torax PA/P", time: "09:30", date: "2024-05-20" },
  { id: "p5", patient: "Costa, Lucia M.", dob: "17/09/1982", pid: "P-10156", modality: "CT", acc: "ACC-2024-005", desc: "CT Abdomen C/C", time: "10:00", date: "2024-05-20" },
];

const risWorklist = [
  { id: "r1", patient: "Silva, Maria J.", dob: "14/03/1978", pid: "P-10023", modality: "CT", acc: "RIS-88821", proc: "CT Torax S/C", time: "08:00", status: "scheduled" },
  { id: "r2", patient: "Oliveira, Carlos", dob: "22/07/1965", pid: "P-10045", modality: "MR", acc: "RIS-88822", proc: "RM Cranio", time: "08:45", status: "scheduled" },
  { id: "r3", patient: "Santos, Ana P.", dob: "05/11/1990", pid: "P-10089", modality: "US", acc: "RIS-88823", proc: "US Abdomen Total", time: "09:15", status: "scheduled" },
  { id: "r4", patient: "Ferreira, R.", dob: "30/01/1955", pid: "P-10112", modality: "XR", acc: "RIS-88824", proc: "RX Torax PA/P", time: "09:30", status: "scheduled" },
  { id: "r5", patient: "Lima, Pedro A.", dob: "12/06/1971", pid: "P-10200", modality: "CT", acc: "RIS-88825", proc: "CT Coluna L-S", time: "10:30", status: "scheduled" },
  { id: "r6", patient: "Costa, Lucia M.", dob: "17/09/1982", pid: "P-10156", modality: "CT", acc: "RIS-88826", proc: "CT Abdomen C/C", time: "10:00", status: "scheduled" },
];

const linked = [
  { pacs: "ACC-2024-001 / Silva, Maria J.", ris: "RIS-88821", mod: "CT" },
];

function ModalityBadge({ mod }: { mod: string }) {
  const c = MODALITY_COLORS[mod] ?? { bg: "bg-slate-700", text: "text-slate-300", label: mod };
  return (
    <span className={`inline-flex items-center justify-center rounded px-1.5 py-0.5 text-[10px] font-bold tracking-wider ${c.bg} ${c.text}`}>
      {c.label}
    </span>
  );
}

function MatchRow({ label, a, b, match }: { label: string; a: string; b: string; match: boolean }) {
  return (
    <div className="flex items-center gap-2 text-[11px]">
      <span className="text-slate-500 w-16 shrink-0">{label}</span>
      <span className="text-slate-200 flex-1 truncate">{a}</span>
      <span className={`text-lg font-bold w-6 text-center ${match ? "text-emerald-400" : "text-red-400"}`}>{match ? "✓" : "✗"}</span>
      <span className="text-slate-200 flex-1 truncate">{b}</span>
    </div>
  );
}

export function StagingZone() {
  const [selPacs, setSelPacs] = useState<string | null>("p1");
  const [selRis, setSelRis] = useState<string | null>("r1");
  const [confirmed, setConfirmed] = useState<string[]>([]);

  const pacs = pacsStudies.find(s => s.id === selPacs);
  const ris = risWorklist.find(r => r.id === selRis);

  const nameMatch = pacs && ris ? pacs.patient.toLowerCase().replace(/[^a-z]/g, "").startsWith(ris.patient.toLowerCase().replace(/[^a-z]/g, "").slice(0, 6)) : false;
  const dobMatch = pacs && ris ? pacs.dob === ris.dob : false;
  const pidMatch = pacs && ris ? pacs.pid === ris.pid : false;
  const modMatch = pacs && ris ? pacs.modality === ris.modality : false;
  const allMatch = nameMatch && dobMatch && pidMatch && modMatch;
  const hasDiscrepancy = pacs && ris && !(nameMatch && dobMatch && pidMatch);

  function handleConfirm() {
    if (pacs && ris) {
      setConfirmed(prev => [...prev, `${pacs.acc} → ${ris.acc}`]);
      setSelPacs(null);
      setSelRis(null);
    }
  }

  return (
    <div className="min-h-screen w-full flex flex-col bg-[#020617] text-slate-200 font-['Inter',sans-serif] overflow-hidden" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-2.5 bg-slate-900/60 border-b border-white/10 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <path d="M9 12l2 2 4-4" />
            </svg>
          </div>
          <div>
            <span className="text-sm font-bold text-white">Preserve</span>
            <span className="text-sm font-light text-cyan-400 ml-1">Receiver</span>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_rgba(34,211,238,0.8)]" />
              <span className="text-[10px] font-mono text-slate-400">PACS ONLINE</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 shadow-[0_0_6px_rgba(129,140,248,0.8)]" />
              <span className="text-[10px] font-mono text-slate-400">RIS ONLINE</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs font-bold text-slate-200">DRT 3000063</div>
            <div className="text-[10px] text-slate-500">Radiology Technician</div>
          </div>
          <div className="flex gap-1">
            <button className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
          </div>
        </div>
      </header>

      {/* Three-column body */}
      <div className="flex flex-1 overflow-hidden">
        {/* LEFT: PACS Arrivals */}
        <div className="w-[260px] shrink-0 flex flex-col border-r border-white/10 overflow-hidden">
          <div className="flex items-center justify-between px-3 py-2 border-b border-white/10 bg-slate-900/30 shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">PACS Recebidos</span>
            </div>
            <span className="text-[10px] font-mono text-slate-500">{pacsStudies.length}</span>
          </div>
          <div className="flex-1 overflow-y-auto">
            {pacsStudies.map(study => {
              const isLinked = confirmed.some(c => c.startsWith(study.acc));
              return (
                <button
                  key={study.id}
                  onClick={() => !isLinked && setSelPacs(study.id)}
                  disabled={isLinked}
                  className={`w-full text-left px-3 py-2.5 border-b border-white/5 transition-all ${
                    isLinked
                      ? "opacity-40 cursor-default"
                      : selPacs === study.id
                      ? "bg-cyan-500/10 border-l-2 border-l-cyan-500"
                      : "hover:bg-slate-800/50 border-l-2 border-l-transparent"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <ModalityBadge mod={study.modality} />
                    <span className="text-[10px] font-mono text-slate-500">{study.time}</span>
                  </div>
                  <div className="text-[11px] font-semibold text-slate-200 truncate">{study.patient}</div>
                  <div className="text-[10px] text-slate-500 truncate">{study.desc}</div>
                  <div className="text-[10px] font-mono text-slate-600 truncate">{study.acc}</div>
                  {isLinked && <span className="text-[9px] text-emerald-400 font-bold">VINCULADO</span>}
                </button>
              );
            })}
          </div>
        </div>

        {/* CENTER: Staging / Comparison Zone */}
        <div className="flex-1 flex flex-col overflow-hidden bg-[#030918]">
          <div className="flex items-center justify-between px-4 py-2 border-b border-white/10 bg-slate-900/20 shrink-0">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Zona de Vinculação</span>
            <span className="text-[10px] text-slate-600">Selecione um estudo e um item da worklist</span>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center p-6 overflow-y-auto">
            {!pacs && !ris ? (
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-slate-600" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <p className="text-slate-500 text-sm font-medium">Selecione um estudo PACS e um item da worklist para vincular</p>
              </div>
            ) : (
              <div className="w-full max-w-xl space-y-4">
                {/* Two cards side by side */}
                <div className="grid grid-cols-2 gap-3">
                  {/* PACS card */}
                  <div className={`rounded-xl border p-3.5 ${pacs ? "border-cyan-500/30 bg-cyan-500/5" : "border-slate-700 bg-slate-800/30"}`}>
                    <div className="text-[9px] font-bold uppercase tracking-widest text-cyan-500 mb-2">Estudo PACS</div>
                    {pacs ? (
                      <>
                        <div className="flex items-center gap-2 mb-2">
                          <ModalityBadge mod={pacs.modality} />
                          <span className="text-[10px] font-mono text-slate-500">{pacs.time}</span>
                        </div>
                        <div className="text-sm font-semibold text-white truncate">{pacs.patient}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">{pacs.desc}</div>
                        <div className="mt-2 space-y-0.5">
                          <div className="text-[10px] text-slate-500">DOB: <span className="text-slate-300">{pacs.dob}</span></div>
                          <div className="text-[10px] text-slate-500">ID: <span className="text-slate-300 font-mono">{pacs.pid}</span></div>
                          <div className="text-[10px] text-slate-500">ACC: <span className="text-slate-300 font-mono">{pacs.acc}</span></div>
                        </div>
                      </>
                    ) : (
                      <div className="text-slate-600 text-xs">Nenhum estudo selecionado</div>
                    )}
                  </div>

                  {/* RIS card */}
                  <div className={`rounded-xl border p-3.5 ${ris ? "border-indigo-500/30 bg-indigo-500/5" : "border-slate-700 bg-slate-800/30"}`}>
                    <div className="text-[9px] font-bold uppercase tracking-widest text-indigo-400 mb-2">Item Worklist RIS</div>
                    {ris ? (
                      <>
                        <div className="flex items-center gap-2 mb-2">
                          <ModalityBadge mod={ris.modality} />
                          <span className="text-[10px] font-mono text-slate-500">{ris.time}</span>
                        </div>
                        <div className="text-sm font-semibold text-white truncate">{ris.patient}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">{ris.proc}</div>
                        <div className="mt-2 space-y-0.5">
                          <div className="text-[10px] text-slate-500">DOB: <span className="text-slate-300">{ris.dob}</span></div>
                          <div className="text-[10px] text-slate-500">ID: <span className="text-slate-300 font-mono">{ris.pid}</span></div>
                          <div className="text-[10px] text-slate-500">ACC: <span className="text-slate-300 font-mono">{ris.acc}</span></div>
                        </div>
                      </>
                    ) : (
                      <div className="text-slate-600 text-xs">Nenhum item selecionado</div>
                    )}
                  </div>
                </div>

                {/* Comparison grid */}
                {pacs && ris && (
                  <div className="rounded-xl border border-white/10 bg-slate-900/40 p-4">
                    <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-3">Verificação de Dados</div>
                    <div className="space-y-2">
                      <MatchRow label="Paciente" a={pacs.patient} b={ris.patient} match={nameMatch} />
                      <MatchRow label="Nasc." a={pacs.dob} b={ris.dob} match={dobMatch} />
                      <MatchRow label="ID" a={pacs.pid} b={ris.pid} match={pidMatch} />
                      <MatchRow label="Modal." a={pacs.modality} b={ris.modality} match={modMatch} />
                    </div>
                  </div>
                )}

                {/* Discrepancy warning */}
                {hasDiscrepancy && (
                  <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-3 flex items-start gap-2">
                    <svg className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
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
                        ? "bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-[0_0_20px_rgba(6,182,212,0.3)]"
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
              <span className="text-[9px] font-mono text-emerald-500">{confirmed.length + linked.length} confirmados</span>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {[...linked.map(l => `${l.pacs} → ${l.ris}`), ...confirmed].map((c, i) => (
                <div key={i} className="shrink-0 flex items-center gap-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1">
                  <div className="w-1 h-1 rounded-full bg-emerald-400" />
                  <span className="text-[10px] font-mono text-emerald-300 whitespace-nowrap">{c}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT: RIS Worklist */}
        <div className="w-[260px] shrink-0 flex flex-col border-l border-white/10 overflow-hidden">
          <div className="flex items-center justify-between px-3 py-2 border-b border-white/10 bg-slate-900/30 shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
              <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">RIS Worklist</span>
            </div>
            <span className="text-[10px] font-mono text-slate-500">{risWorklist.length}</span>
          </div>
          <div className="flex-1 overflow-y-auto">
            {risWorklist.map(item => {
              const isLinked = confirmed.some(c => c.endsWith(item.acc));
              return (
                <button
                  key={item.id}
                  onClick={() => !isLinked && setSelRis(item.id)}
                  disabled={isLinked}
                  className={`w-full text-left px-3 py-2.5 border-b border-white/5 transition-all ${
                    isLinked
                      ? "opacity-40 cursor-default"
                      : selRis === item.id
                      ? "bg-indigo-500/10 border-r-2 border-r-indigo-500"
                      : "hover:bg-slate-800/50 border-r-2 border-r-transparent"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <ModalityBadge mod={item.modality} />
                    <span className="text-[10px] font-mono text-slate-500">{item.time}</span>
                  </div>
                  <div className="text-[11px] font-semibold text-slate-200 truncate">{item.patient}</div>
                  <div className="text-[10px] text-slate-500 truncate">{item.proc}</div>
                  <div className="text-[10px] font-mono text-slate-600 truncate">{item.acc}</div>
                  {isLinked && <span className="text-[9px] text-emerald-400 font-bold">VINCULADO</span>}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
