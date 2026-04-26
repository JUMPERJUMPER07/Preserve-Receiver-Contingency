import React, { useState, useEffect } from "react";
import { DicomStudy, WorklistItem } from "../types";
import {
  X,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  User,
  Calendar,
  FileText,
  Loader2,
  Database,
  Wifi,
} from "lucide-react";

interface LinkConfirmationModalProps {
  study: DicomStudy;
  worklistItem: WorklistItem;
  onConfirm: () => void;
  onCancel: () => void;
}

export const LinkConfirmationModal: React.FC<LinkConfirmationModalProps> = ({
  study,
  worklistItem,
  onConfirm,
  onCancel,
}) => {
  const [status, setStatus] = useState<"idle" | "processing" | "completed">(
    "idle",
  );
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState(
    "Iniciando transferência...",
  );

  // Normalization for comparison
  const normalize = (str: string) =>
    str.toLowerCase().replace(/[^a-z0-9]/g, "");

  const namesMatch =
    normalize(study.patientName) === normalize(worklistItem.patientName);
  const dobMatch = study.birthDate === worklistItem.birthDate;
  const idMatch = study.patientId.trim() === worklistItem.patientId.trim();

  const hasDiscrepancy = !namesMatch || !dobMatch || !idMatch;

  // Animation Logic
  useEffect(() => {
    if (status === "processing") {
      const interval = setInterval(() => {
        setProgress((prev) => {
          const next = prev + Math.random() * 3; // Random increment for realism

          if (next >= 100) {
            clearInterval(interval);
            setStatus("completed");
            return 100;
          }

          // Update messages based on progress
          if (next > 20 && next < 50)
            setStatusMessage("Sincronizando Tags DICOM...");
          if (next >= 50 && next < 80)
            setStatusMessage("Atualizando RIS Worklist...");
          if (next >= 80) setStatusMessage("Finalizando vínculo...");

          return next;
        });
      }, 50); // Speed of update

      return () => clearInterval(interval);
    }
  }, [status]);

  // Handle completion
  useEffect(() => {
    if (status === "completed") {
      const timer = setTimeout(() => {
        onConfirm();
      }, 800); // Wait a bit at 100% before closing
      return () => clearTimeout(timer);
    }
  }, [status, onConfirm]);

  const handleConfirmClick = () => {
    setStatus("processing");
  };

  // SVG Configuration for Circle
  const radius = 60;
  const stroke = 8;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-4xl bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh] relative">
        {/* --- PROCESSING VIEW --- */}
        {status !== "idle" && (
          <div className="absolute inset-0 z-20 bg-slate-950 flex flex-col items-center justify-center animate-in fade-in duration-300">
            {/* Circular Progress */}
            <div className="relative flex items-center justify-center mb-8">
              {/* Background Circle */}
              <svg
                height={radius * 2}
                width={radius * 2}
                className="rotate-[-90deg]"
              >
                <circle
                  stroke="#1e293b"
                  strokeWidth={stroke}
                  fill="transparent"
                  r={normalizedRadius}
                  cx={radius}
                  cy={radius}
                />
                {/* Progress Circle */}
                <circle
                  stroke={status === "completed" ? "#10b981" : "#06b6d4"}
                  strokeWidth={stroke}
                  strokeDasharray={circumference + " " + circumference}
                  style={{
                    strokeDashoffset,
                    transition: "stroke-dashoffset 0.1s linear",
                  }}
                  strokeLinecap="round"
                  fill="transparent"
                  r={normalizedRadius}
                  cx={radius}
                  cy={radius}
                />
              </svg>

              {/* Center Text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span
                  className={`text-2xl font-bold font-mono ${status === "completed" ? "text-emerald-400" : "text-cyan-400"}`}
                >
                  {Math.round(progress)}%
                </span>
              </div>

              {/* Orbiting Particles Effect */}
              <div
                className={`absolute w-full h-full rounded-full border border-cyan-500/20 animate-[spin_3s_linear_infinite] ${status === "completed" ? "opacity-0" : "opacity-100"}`}
              ></div>
              <div
                className={`absolute w-[120%] h-[120%] rounded-full border border-cyan-500/10 animate-[spin_5s_linear_infinite_reverse] ${status === "completed" ? "opacity-0" : "opacity-100"}`}
              ></div>
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-xl font-bold text-white tracking-wide animate-pulse">
                {status === "completed"
                  ? "Vínculo Confirmado!"
                  : "Processando..."}
              </h3>
              <p className="text-slate-400 font-mono text-sm uppercase tracking-widest flex items-center justify-center gap-2">
                {status !== "completed" && (
                  <Loader2 size={12} className="animate-spin" />
                )}
                {statusMessage}
              </p>
            </div>

            {/* Connection Viz */}
            <div className="mt-12 flex items-center gap-8 opacity-50">
              <div className="flex flex-col items-center gap-2">
                <div
                  className={`p-3 rounded-full bg-slate-900 border ${progress > 20 ? "border-cyan-500 text-cyan-500" : "border-slate-700 text-slate-600"} transition-colors`}
                >
                  <Database size={20} />
                </div>
                <span className="text-[10px] uppercase font-bold text-slate-500">
                  PACS
                </span>
              </div>

              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${progress > i * 15 ? "bg-cyan-500" : "bg-slate-800"}`}
                  ></div>
                ))}
              </div>

              <div className="flex flex-col items-center gap-2">
                <div
                  className={`p-3 rounded-full bg-slate-900 border ${progress > 80 ? "border-indigo-500 text-indigo-500" : "border-slate-700 text-slate-600"} transition-colors`}
                >
                  <Wifi size={20} />
                </div>
                <span className="text-[10px] uppercase font-bold text-slate-500">
                  RIS
                </span>
              </div>
            </div>
          </div>
        )}

        {/* --- CONFIRMATION VIEW (IDLE) --- */}
        <div
          className={
            status !== "idle" ? "opacity-0 pointer-events-none" : "opacity-100"
          }
        >
          {/* Header */}
          <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-950/50">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                Confirmação de Vínculo
              </h2>
              <p className="text-slate-400 text-sm mt-1">
                Verifique os dados do paciente antes de vincular as imagens ao
                pedido.
              </p>
            </div>
            <button
              onClick={onCancel}
              className="p-2 hover:bg-slate-800/80 rounded-full text-slate-500 hover:text-white transition-all active:scale-[0.95] hover:shadow-[0_2px_10px_rgba(255,255,255,0.05)]"
            >
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto">
            {hasDiscrepancy && (
              <div className="mb-6 bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex gap-3 items-start">
                <AlertTriangle
                  className="text-red-500 shrink-0 mt-0.5"
                  size={20}
                />
                <div>
                  <h4 className="text-red-400 font-bold text-sm">
                    Atenção: Discrepância de Dados Detectada
                  </h4>
                  <p className="text-red-300/80 text-xs mt-1">
                    Os dados do paciente no PACS não correspondem exatamente aos
                    dados do pedido no RIS. Verifique cuidadosamente antes de
                    prosseguir.
                  </p>
                </div>
              </div>
            )}

            <div className="flex flex-col md:flex-row gap-4 items-stretch justify-between relative z-0">
              {/* PACS Card */}
              <div className="flex-1 bg-slate-950 rounded-lg border border-slate-800 p-5 relative group z-10">
                <div className="absolute top-0 left-0 w-full h-1 bg-cyan-500 rounded-t-lg" />
                <div className="mb-4 flex justify-between items-center">
                  <span className="text-xs font-bold text-cyan-500 uppercase tracking-wider bg-cyan-500/10 px-2 py-1 rounded">
                    Origem (PACS)
                  </span>
                  <span className="text-xs text-slate-500 font-mono">
                    {study.receivedAt}
                  </span>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] uppercase text-slate-500 font-bold mb-1 block flex items-center gap-1">
                      <User size={10} /> Paciente
                    </label>
                    <div
                      className={`text-base font-medium truncate p-2 rounded ${!namesMatch ? "bg-red-500/10 text-red-300 border border-red-500/30" : "bg-slate-900 text-slate-200"}`}
                    >
                      {study.patientName}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] uppercase text-slate-500 font-bold mb-1 block">
                        ID Paciente
                      </label>
                      <div
                        className={`text-sm font-mono p-2 rounded border ${!idMatch ? "bg-red-500/10 text-red-300 border-red-500/30" : "bg-slate-900 text-slate-300 border-slate-800/50"}`}
                      >
                        {study.patientId}
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] uppercase text-slate-500 font-bold mb-1 block flex items-center gap-1">
                        <Calendar size={10} /> Data Nasc.
                      </label>
                      <div
                        className={`text-sm font-mono p-2 rounded border ${!dobMatch ? "bg-red-500/10 text-red-300 border-red-500/30" : "bg-slate-900 text-slate-300 border-slate-800/50"}`}
                      >
                        {study.birthDate}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-800/50">
                    <div>
                      <label className="text-[10px] uppercase text-slate-500 font-bold block mb-1">
                        Accession Number
                      </label>
                      <div className="text-xs font-mono bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-2 py-1 rounded inline-block">
                        {study.accessionNumber}
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] uppercase text-slate-500 font-bold block mb-1">
                        Modalidade
                      </label>
                      <div className="text-xs font-bold text-slate-300 bg-slate-800 border border-slate-700/50 px-2 py-1 rounded inline-block">
                        {study.modality}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] uppercase text-slate-500 font-bold block mb-1">
                      Data Exame
                    </label>
                    <div className="text-sm text-slate-300">
                      {study.studyDate}
                    </div>
                  </div>
                </div>
              </div>

              {/* Arrow Divider */}
              <div className="flex items-center justify-center md:px-2 z-0 hidden md:flex">
                <div className="bg-slate-800 p-2 rounded-full border border-slate-700 shadow-xl z-20 relative">
                  <ArrowRight size={24} className="text-slate-400" />
                </div>
                <div className="absolute top-1/2 left-0 right-0 h-px bg-slate-800 z-0" />
              </div>

              {/* RIS Card */}
              <div className="flex-1 bg-slate-950 rounded-lg border border-slate-800 p-5 relative z-10">
                <div className="absolute top-0 left-0 w-full h-1 bg-indigo-500 rounded-t-lg" />
                <div className="mb-4 flex justify-between items-center">
                  <span className="text-xs font-bold text-indigo-500 uppercase tracking-wider bg-indigo-500/10 px-2 py-1 rounded">
                    Destino (RIS)
                  </span>
                  <span className="text-xs text-slate-500">
                    {worklistItem.status}
                  </span>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] uppercase text-slate-500 font-bold mb-1 block flex items-center gap-1">
                      <User size={10} /> Paciente
                    </label>
                    <div
                      className={`text-base font-medium truncate p-2 rounded ${!namesMatch ? "bg-red-500/10 text-red-300 border border-red-500/30" : "bg-slate-900 text-slate-200"}`}
                    >
                      {worklistItem.patientName}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] uppercase text-slate-500 font-bold mb-1 block">
                        ID Paciente
                      </label>
                      <div
                        className={`text-sm font-mono p-2 rounded border ${!idMatch ? "bg-red-500/10 text-red-300 border-red-500/30" : "bg-slate-900 text-slate-300 border-slate-800/50"}`}
                      >
                        {worklistItem.patientId}
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] uppercase text-slate-500 font-bold mb-1 block flex items-center gap-1">
                        <Calendar size={10} /> Data Nasc.
                      </label>
                      <div
                        className={`text-sm font-mono p-2 rounded border ${!dobMatch ? "bg-red-500/10 text-red-300 border-red-500/30" : "bg-slate-900 text-slate-300 border-slate-800/50"}`}
                      >
                        {worklistItem.birthDate}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-800/50">
                    <div>
                      <label className="text-[10px] uppercase text-slate-500 font-bold block mb-1">
                        Accession Number
                      </label>
                      <div className="text-xs font-mono bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-1 rounded inline-block">
                        {worklistItem.accessionNumber}
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] uppercase text-slate-500 font-bold block mb-1">
                        Mod / Procedimento
                      </label>
                      <div
                        className="text-xs font-bold text-slate-300 bg-slate-800 border border-slate-700/50 px-2 py-1 rounded inline-block truncate max-w-full"
                        title={worklistItem.procedure}
                      >
                        <span className="text-indigo-400 mr-2">
                          {worklistItem.modality}
                        </span>
                        {worklistItem.procedure}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] uppercase text-slate-500 font-bold block mb-1">
                      Data Agendada
                    </label>
                    <div className="text-sm text-slate-300">
                      {worklistItem.scheduledTime}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 flex items-center justify-center text-xs text-slate-500">
              <FileText size={12} className="mr-1" />A imagem será vinculada
              permanentemente ao Accession Number{" "}
              <span className="text-indigo-400 font-mono ml-1">
                {worklistItem.accessionNumber}
              </span>
            </div>
          </div>

          {/* Footer */}
          <div className="p-5 border-t border-slate-800 bg-slate-950/50 flex justify-end gap-3">
            <button
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800/80 rounded-lg transition-all active:scale-[0.95] hover:shadow-[0_2px_10px_rgba(255,255,255,0.05)] border border-transparent hover:border-slate-700/50"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirmClick}
              className={`
                px-6 py-2 text-sm font-bold text-white rounded-lg flex items-center gap-2 transition-all active:scale-[0.98] border border-white/10
                ${
                  hasDiscrepancy
                    ? "bg-gradient-to-br from-red-500 to-red-600 hover:from-red-400 hover:to-red-500 shadow-[0_4px_16px_rgba(239,68,68,0.3)] hover:shadow-[0_8px_24px_rgba(239,68,68,0.4)]"
                    : "bg-gradient-to-br from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 shadow-[0_4px_16px_rgba(6,182,212,0.3)] hover:shadow-[0_8px_24px_rgba(6,182,212,0.4)]"
                }
              `}
            >
              <CheckCircle2 size={16} />
              {hasDiscrepancy ? "Confirmar Mesmo Assim" : "Confirmar Vínculo"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
