import React, { useState, useMemo } from "react";
import { DicomStudy, WorklistItem } from "../types";
import {
  CheckCircle2,
  Link as LinkIcon,
  AlertCircle,
  Server,
  Activity,
  Search,
  Eye,
  GripVertical,
} from "lucide-react";
import { ModalityBadge } from "./ModalityBadge";

interface AlignedRow {
  study: DicomStudy | null;
  worklist: WorklistItem;
  confidence: number;
  isLinked: boolean;
}

interface MatchAlignedLayoutProps {
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
  mobileTab: "pacs" | "ris";
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

function computeAlignedRows(
  studies: DicomStudy[],
  worklist: WorklistItem[]
): { rows: AlignedRow[]; unmatched: DicomStudy[] } {
  const matchedStudyIds = new Set<string>();
  const rows: AlignedRow[] = [];

  for (const item of worklist) {
    let best: DicomStudy | null = null;
    let bestScore = 0;

    for (const s of studies) {
      if (matchedStudyIds.has(s.id)) continue;
      const score = computeConfidence(s, item);
      if (score > bestScore) {
        bestScore = score;
        best = s;
      }
    }

    const threshold = 60;
    const matched = bestScore >= threshold ? best : null;
    if (matched) matchedStudyIds.add(matched.id);

    rows.push({
      study: matched,
      worklist: item,
      confidence: matched ? bestScore : 0,
      isLinked: item.status === "completed",
    });
  }

  const unmatched = studies.filter((s) => !matchedStudyIds.has(s.id));
  return { rows, unmatched };
}

export const MatchAlignedLayout: React.FC<MatchAlignedLayoutProps> = ({
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
  mobileTab,
}) => {
  const [searchPacs, setSearchPacs] = useState("");
  const [searchRis, setSearchRis] = useState("");
  const [filterMod, setFilterMod] = useState("");

  const { rows, unmatched } = useMemo(
    () => computeAlignedRows(studies, worklist),
    [studies, worklist]
  );

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      const pacsMatch =
        !searchPacs ||
        (row.study &&
          (row.study.patientName.toLowerCase().includes(searchPacs.toLowerCase()) ||
            row.study.accessionNumber.toLowerCase().includes(searchPacs.toLowerCase()) ||
            row.study.patientId.toLowerCase().includes(searchPacs.toLowerCase())));
      const risMatch =
        !searchRis ||
        row.worklist.patientName.toLowerCase().includes(searchRis.toLowerCase()) ||
        row.worklist.accessionNumber.toLowerCase().includes(searchRis.toLowerCase()) ||
        row.worklist.patientId.toLowerCase().includes(searchRis.toLowerCase());
      const modMatch =
        !filterMod ||
        row.worklist.modality === filterMod ||
        (row.study && row.study.modality === filterMod);
      return (pacsMatch !== false) && risMatch && modMatch;
    });
  }, [rows, searchPacs, searchRis, filterMod]);

  const allModalities = useMemo(() => {
    const mods = new Set([
      ...studies.map((s) => s.modality),
      ...worklist.map((w) => w.modality),
    ]);
    return [...mods].filter(Boolean).sort();
  }, [studies, worklist]);

  const filteredUnmatched = useMemo(() => {
    if (!searchPacs && !filterMod) return unmatched;
    return unmatched.filter((s) => {
      const sMatch =
        !searchPacs ||
        s.patientName.toLowerCase().includes(searchPacs.toLowerCase()) ||
        s.accessionNumber.toLowerCase().includes(searchPacs.toLowerCase());
      const mMatch = !filterMod || s.modality === filterMod;
      return sMatch && mMatch;
    });
  }, [unmatched, searchPacs, filterMod]);

  const ROW_HEIGHT = 108;
  const ROW_GAP = 16;
  const CELL_H = ROW_HEIGHT + ROW_GAP;

  return (
    <div className="flex-1 min-h-0 flex flex-col relative overflow-hidden rounded-2xl border border-white/10 bg-[#0a0f18] shadow-2xl ring-1 ring-white/5">
      {/* Background alignment grid */}
      <div
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: `linear-gradient(to bottom, transparent ${CELL_H - 1}px, rgba(30,41,59,0.25) ${CELL_H}px)`,
          backgroundSize: `100% ${CELL_H}px`,
          backgroundPositionY: "60px",
        }}
      />

      {/* Three-column header bar */}
      <div className="relative z-20 flex shrink-0 border-b border-slate-800/80 bg-[#0f1522]/95 h-12">
        {/* PACS header */}
        <div
          className={`flex-1 flex items-center justify-between px-4 border-r border-slate-800 ${mobileTab === "ris" ? "hidden lg:flex" : "flex"}`}
        >
          <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
            <Server className="w-4 h-4 text-blue-400" />
            RECEIVED STUDIES
          </h2>
          <span className="text-[10px] font-mono bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-full border border-blue-500/20">
            {studies.length}
          </span>
        </div>

        {/* Match Zone header */}
        <div className="w-28 lg:w-32 shrink-0 flex items-center justify-center border-r border-slate-800 hidden lg:flex">
          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">
            Match
          </span>
        </div>

        {/* RIS header */}
        <div
          className={`flex-1 flex items-center justify-between px-4 ${mobileTab === "pacs" ? "hidden lg:flex" : "flex"}`}
        >
          <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-400" />
            RIS WORKLIST
          </h2>
          <span className="text-[10px] font-mono bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20">
            {worklist.length}
          </span>
        </div>
      </div>

      {/* Three-column filter bar */}
      <div className="relative z-20 flex shrink-0 border-b border-slate-800/60 bg-[#0f1522]/60 h-10">
        {/* PACS search */}
        <div
          className={`flex-1 flex items-center px-3 gap-2 border-r border-slate-800 ${mobileTab === "ris" ? "hidden lg:flex" : "flex"}`}
        >
          <Search className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          <input
            type="text"
            placeholder="Buscar estudo..."
            value={searchPacs}
            onChange={(e) => setSearchPacs(e.target.value)}
            className="flex-1 bg-transparent text-[11px] text-slate-300 placeholder:text-slate-600 focus:outline-none"
          />
          <select
            value={filterMod}
            onChange={(e) => setFilterMod(e.target.value)}
            className="bg-transparent text-[10px] text-slate-400 focus:outline-none cursor-pointer border border-slate-700 rounded px-1"
          >
            <option value="">Todos</option>
            {allModalities.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>

        {/* Match Zone filter spacer */}
        <div className="w-28 lg:w-32 shrink-0 border-r border-slate-800 hidden lg:block" />

        {/* RIS search */}
        <div
          className={`flex-1 flex items-center px-3 gap-2 ${mobileTab === "pacs" ? "hidden lg:flex" : "flex"}`}
        >
          <Search className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          <input
            type="text"
            placeholder="Buscar worklist..."
            value={searchRis}
            onChange={(e) => setSearchRis(e.target.value)}
            className="flex-1 bg-transparent text-[11px] text-slate-300 placeholder:text-slate-600 focus:outline-none"
          />
        </div>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 min-h-0 flex overflow-hidden relative z-10">
        {/* PACS Column */}
        <div
          className={`flex-1 min-w-0 overflow-y-auto border-r border-slate-800 relative ${mobileTab === "ris" ? "hidden lg:block" : "block"}`}
          style={{ scrollbarWidth: "none" }}
        >
          <div className="flex flex-col px-4 pt-3 pb-28" style={{ gap: ROW_GAP }}>
            {filteredRows.map((row, i) => (
              <div key={`pacs-${row.worklist.id}`} style={{ height: ROW_HEIGHT }} className="flex items-center">
                {row.study ? (
                  <StudyCard
                    study={row.study}
                    isLinked={row.isLinked}
                    hasPendingMatch={!row.isLinked && row.confidence > 0}
                    isSelected={selectedStudy?.id === row.study.id}
                    onSelect={() => onSelectStudy(row.study!)}
                    onDetails={() => onDetails(row.study!)}
                    onDragStart={() => onDragStart(row.study!)}
                  />
                ) : (
                  <div
                    className="w-full h-full border border-dashed border-slate-800 rounded-xl flex items-center justify-center bg-slate-900/20"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      const data = e.dataTransfer.getData("application/json");
                      if (data) {
                        try { onDropStudy(JSON.parse(data) as DicomStudy, row.worklist); } catch {}
                      } else if (draggedStudy) {
                        onDropStudy(draggedStudy, row.worklist);
                      }
                    }}
                  >
                    <span className="text-slate-700 text-xs">Aguardando estudo...</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Match Zone Column */}
        <div className="w-28 lg:w-32 shrink-0 overflow-y-auto hidden lg:block" style={{ scrollbarWidth: "none" }}>
          {/* Center spine line */}
          <div className="absolute left-[calc(50%-2px)] top-0 bottom-0 w-px bg-slate-800 pointer-events-none" style={{ zIndex: 0 }} />
          <div className="flex flex-col px-2 pt-3 pb-28 relative z-10" style={{ gap: ROW_GAP }}>
            {filteredRows.map((row) => (
              <div key={`match-${row.worklist.id}`} style={{ height: ROW_HEIGHT }} className="flex items-center justify-center">
                {row.study && (
                  <MatchConnector
                    isLinked={row.isLinked}
                    confidence={row.confidence}
                    onClick={() => {
                      if (!row.isLinked && row.study) {
                        onSelectPair(row.study, row.worklist);
                      }
                    }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* RIS Column */}
        <div
          className={`flex-1 min-w-0 overflow-y-auto border-l border-slate-800 ${mobileTab === "pacs" ? "hidden lg:block" : "block"}`}
          style={{ scrollbarWidth: "none" }}
        >
          <div className="flex flex-col px-4 pt-3 pb-28" style={{ gap: ROW_GAP }}>
            {filteredRows.map((row) => (
              <div key={`ris-${row.worklist.id}`} style={{ height: ROW_HEIGHT }} className="flex items-center">
                <WorklistCard
                  item={row.worklist}
                  isLinked={row.isLinked}
                  isSelected={selectedWorklist?.id === row.worklist.id}
                  isDragTarget={draggedStudy !== null}
                  isPotentialDrop={
                    draggedStudy !== null &&
                    (draggedStudy.patientId === row.worklist.patientId ||
                      draggedStudy.patientName.toLowerCase() === row.worklist.patientName.toLowerCase())
                  }
                  onSelect={() => onSelectWorklist(row.worklist)}
                  onDrop={(study) => onDropStudy(study, row.worklist)}
                  draggedStudy={draggedStudy}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Unmatched Studies Tray */}
      {filteredUnmatched.length > 0 && (
        <div className="absolute bottom-0 left-0 right-0 z-30 pointer-events-none">
          <div className="pointer-events-auto mx-4 mb-4">
            <div className="bg-[#121927]/95 backdrop-blur-md border border-amber-500/30 rounded-xl p-3 shadow-2xl">
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-2 text-amber-400">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-xs font-semibold">
                    Estudos sem correspondência ({filteredUnmatched.length})
                  </span>
                </div>
              </div>
              <div className="flex gap-3 overflow-x-auto pb-0.5" style={{ scrollbarWidth: "none" }}>
                {filteredUnmatched.map((study) => (
                  <div
                    key={study.id}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData("application/json", JSON.stringify(study));
                      e.dataTransfer.effectAllowed = "link";
                      onDragStart(study);
                    }}
                    onClick={() => onSelectStudy(study)}
                    className={`flex-none w-[260px] bg-[#0a0f18] border rounded-lg p-3 cursor-pointer transition-all hover:border-slate-600 flex flex-col gap-1.5 group
                      ${selectedStudy?.id === study.id ? "border-cyan-500/60 bg-cyan-950/20" : "border-slate-700/60"}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-slate-200 text-sm truncate flex-1 mr-2">
                        {study.patientName}
                      </span>
                      <ModalityBadge modality={study.modality} />
                    </div>
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-slate-500 font-mono">{study.patientId}</span>
                      <span className="text-slate-600">{study.receivedAt}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <GripVertical className="w-3 h-3 text-slate-700 group-hover:text-slate-500" />
                      <span className="text-[10px] text-slate-600 italic">
                        Arraste para vincular manualmente
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

function StudyCard({
  study,
  isLinked,
  hasPendingMatch,
  isSelected,
  onSelect,
  onDetails,
  onDragStart,
}: {
  study: DicomStudy;
  isLinked: boolean;
  hasPendingMatch: boolean;
  isSelected: boolean;
  onSelect: () => void;
  onDetails: () => void;
  onDragStart: () => void;
}) {
  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData("application/json", JSON.stringify(study));
        e.dataTransfer.effectAllowed = "link";
        onDragStart();
      }}
      onClick={onSelect}
      className={`w-full h-full rounded-xl border p-3.5 flex flex-col justify-between cursor-pointer transition-all relative group overflow-hidden
        ${isSelected
          ? "bg-blue-950/30 border-blue-500/50 shadow-[0_0_20px_rgba(59,130,246,0.15)]"
          : isLinked
          ? "bg-slate-900/30 border-slate-800/60 opacity-55 hover:opacity-75"
          : hasPendingMatch
          ? "bg-blue-950/15 border-blue-500/30 shadow-[0_0_12px_rgba(59,130,246,0.08)] hover:border-blue-400/50"
          : "bg-slate-900/60 border-slate-700/60 hover:border-slate-600 hover:bg-slate-900/80"
        }`}
    >
      {hasPendingMatch && !isLinked && (
        <div className="absolute top-0 right-0 bottom-0 w-0.5 bg-gradient-to-b from-transparent via-blue-500/60 to-transparent rounded-r-xl" />
      )}
      <div className="flex items-start justify-between gap-2 z-10">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className={`font-semibold text-sm truncate ${isLinked ? "text-slate-500" : "text-slate-100"}`}>
              {study.patientName}
            </span>
            {hasPendingMatch && !isLinked && (
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shadow-[0_0_6px_rgba(59,130,246,0.8)] animate-pulse shrink-0" />
            )}
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-mono mt-0.5">
            <span>{study.patientId}</span>
            <span className="text-slate-700">·</span>
            <span>{study.accessionNumber}</span>
          </div>
        </div>
        <ModalityBadge modality={study.modality} />
      </div>

      <div className="flex items-end justify-between z-10">
        <span className="text-[11px] text-slate-400 truncate max-w-[70%]">
          {study.description || study.modality + " Exam"}
        </span>
        <div className="flex items-center gap-1.5">
          <button
            onClick={(e) => { e.stopPropagation(); onDetails(); }}
            className="p-1 rounded text-slate-600 hover:text-cyan-400 hover:bg-cyan-950/40 transition-colors"
            title="Ver detalhes"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
          <span className="text-[10px] font-mono text-slate-600 bg-slate-900/60 px-1.5 py-0.5 rounded">
            {study.receivedAt}
          </span>
        </div>
      </div>
    </div>
  );
}

function WorklistCard({
  item,
  isLinked,
  isSelected,
  isDragTarget,
  isPotentialDrop,
  onSelect,
  onDrop,
  draggedStudy,
}: {
  item: WorklistItem;
  isLinked: boolean;
  isSelected: boolean;
  isDragTarget: boolean;
  isPotentialDrop: boolean;
  onSelect: () => void;
  onDrop: (study: DicomStudy) => void;
  draggedStudy: DicomStudy | null;
}) {
  const [isDragOver, setIsDragOver] = useState(false);

  const [, timePart] = item.scheduledTime.split(" ");

  return (
    <div
      onClick={onSelect}
      onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragOver(false);
        const data = e.dataTransfer.getData("application/json");
        if (data) {
          try { onDrop(JSON.parse(data) as DicomStudy); } catch {}
        } else if (draggedStudy) {
          onDrop(draggedStudy);
        }
      }}
      className={`w-full h-full rounded-xl border p-3.5 flex flex-col justify-between cursor-pointer transition-all relative
        ${isDragOver
          ? "bg-indigo-900/40 border-indigo-400/60 shadow-lg shadow-indigo-500/20"
          : isSelected
          ? "bg-indigo-950/30 border-indigo-500/40"
          : isLinked
          ? "bg-slate-900/20 border-slate-800/40 opacity-50"
          : isDragTarget && isPotentialDrop
          ? "bg-emerald-900/30 border-emerald-500/50 shadow-lg shadow-emerald-500/15"
          : isDragTarget && !isPotentialDrop
          ? "opacity-35 grayscale-[0.7]"
          : "bg-[#121927]/80 border-slate-700/60 hover:border-slate-600"
        }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className={`font-semibold text-sm truncate ${isLinked ? "text-slate-500" : isDragTarget && isPotentialDrop ? "text-emerald-300" : "text-slate-200"}`}>
            {item.patientName}
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-mono mt-0.5">
            <span>{item.patientId}</span>
            <span className="text-slate-700">·</span>
            <span>{item.accessionNumber}</span>
          </div>
        </div>
        <ModalityBadge modality={item.modality} />
      </div>

      <div className="flex items-end justify-between">
        <span className="text-[11px] text-slate-400 truncate max-w-[65%]">{item.procedure}</span>
        <div className="flex items-center gap-1.5">
          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border font-mono
            ${item.status === "arrived"     ? "text-blue-400   bg-blue-500/5   border-blue-500/20"   : ""}
            ${item.status === "in-progress" ? "text-amber-400  bg-amber-500/5  border-amber-500/20"  : ""}
            ${item.status === "scheduled"   ? "text-slate-500  bg-slate-800/50 border-slate-700"     : ""}
            ${item.status === "completed"   ? "text-emerald-400 bg-emerald-500/5 border-emerald-500/20" : ""}
          `}>
            {item.status === "in-progress" ? "WIP" : item.status.toUpperCase().slice(0, 4)}
          </span>
          {timePart && (
            <span className="text-[10px] font-mono text-slate-600 bg-slate-900/60 px-1.5 py-0.5 rounded">
              {timePart}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function MatchConnector({
  isLinked,
  confidence,
  onClick,
}: {
  isLinked: boolean;
  confidence: number;
  onClick: () => void;
}) {
  if (isLinked) {
    return (
      <div className="w-full flex items-center justify-center relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full h-px bg-slate-700/80" />
        </div>
        <div className="w-8 h-8 rounded-full bg-[#0a0f18] border border-emerald-700/50 flex items-center justify-center z-10">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
        </div>
      </div>
    );
  }

  const isHigh = confidence >= 90;
  const isMed = confidence >= 70 && confidence < 90;

  return (
    <div className="w-full flex items-center justify-center relative group">
      {/* Gradient connection line */}
      <div className="absolute inset-0 flex items-center pointer-events-none">
        <div
          className={`w-full h-[2px] ${
            isHigh
              ? "bg-gradient-to-r from-blue-500/50 via-blue-400 to-emerald-500/50"
              : isMed
              ? "bg-gradient-to-r from-blue-500/30 via-blue-400/60 to-emerald-500/30"
              : "bg-slate-700/50"
          }`}
        />
      </div>

      {/* Glow */}
      <div
        className={`absolute left-0 right-0 h-10 blur-md -z-10 transition-opacity ${
          isHigh
            ? "bg-gradient-to-r from-blue-500/15 via-blue-400/25 to-emerald-500/15 opacity-50 group-hover:opacity-100"
            : "opacity-0"
        }`}
      />

      {/* Link button */}
      <button
        onClick={onClick}
        title={`Vincular (${confidence}% compatível)`}
        className={`w-12 h-12 rounded-full border-[3px] border-[#0a0f18] flex flex-col items-center justify-center gap-0 z-10 transition-all hover:scale-110 active:scale-95 shadow-lg
          ${isHigh
            ? "bg-blue-600 hover:bg-blue-500 shadow-[0_0_16px_rgba(59,130,246,0.45)]"
            : isMed
            ? "bg-slate-700 hover:bg-slate-600 shadow-[0_0_10px_rgba(99,102,241,0.25)]"
            : "bg-slate-800 hover:bg-slate-700"
          }`}
      >
        <LinkIcon className="w-3.5 h-3.5 text-white" />
        <span className={`text-[9px] font-bold leading-none mt-0.5 ${isHigh ? "text-blue-100" : "text-slate-300"}`}>
          {confidence}%
        </span>
      </button>
    </div>
  );
}
