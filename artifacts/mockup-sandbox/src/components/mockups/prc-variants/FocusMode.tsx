import React from 'react';
import { LucideActivity, LucideCheckCircle, LucideChevronLeft, LucideChevronRight, LucideCircle, LucideDatabase, LucideSearch, LucideShield } from 'lucide-react';

export function FocusMode() {
  return (
    <div className="flex flex-col h-screen w-full bg-[#020617] text-slate-200 font-sans overflow-hidden">
      {/* Header */}
      <header className="h-12 border-b border-slate-800/60 bg-[#060b14] flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <LucideShield className="w-5 h-5 text-indigo-400" />
            <span className="font-semibold text-slate-100 text-sm tracking-wide">PRESERVE RECEIVER</span>
          </div>
          <div className="w-px h-4 bg-slate-700 mx-2"></div>
          <div className="flex items-center gap-2 text-xs">
            <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              DRT ONLINE
            </span>
          </div>
        </div>
        <div className="flex items-center gap-6 text-[10px] font-mono text-slate-500">
          <div className="flex items-center gap-1.5"><span className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">↵</span> Confirmar</div>
          <div className="flex items-center gap-1.5"><span className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">→</span> Próximo</div>
          <div className="flex items-center gap-1.5"><span className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">←</span> Anterior</div>
        </div>
      </header>

      {/* Queue progress bar */}
      <div className="h-8 bg-[#0a0f18] border-b border-slate-800/40 flex items-center px-4 shrink-0 gap-4">
        <span className="text-xs font-medium text-slate-400 w-24">Estudo 1 de 4</span>
        <div className="flex-1 flex gap-1 h-2 max-w-md">
          <div className="flex-1 rounded-sm bg-emerald-500/80"></div>
          <div className="flex-1 rounded-sm bg-emerald-500/80"></div>
          <div className="flex-1 rounded-sm bg-indigo-500 relative">
            <div className="absolute inset-0 rounded-sm bg-indigo-400 animate-pulse opacity-40"></div>
          </div>
          <div className="flex-1 rounded-sm bg-slate-800"></div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 flex min-h-0 relative p-6 gap-8 max-w-7xl mx-auto w-full">
        
        {/* Left Column: Focus Study */}
        <div className="w-[480px] flex flex-col gap-4">
          <h2 className="text-xs font-bold tracking-widest text-slate-500 uppercase flex items-center gap-2">
            Estudo em Análise
            <div className="h-px flex-1 bg-slate-800"></div>
          </h2>

          <div className="flex-1 flex flex-col justify-center">
            {/* Main Study Card */}
            <div className="bg-[#0a0f18] rounded-xl border border-indigo-500/30 shadow-[0_0_40px_-10px_rgba(99,102,241,0.15)] flex flex-col overflow-hidden relative">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500"></div>
              
              <div className="p-8 flex flex-col gap-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center justify-center w-14 h-14 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-bold text-xl">
                    CT
                  </div>
                  <div className="text-right flex flex-col items-end">
                    <span className="text-xs text-slate-500 font-mono">RECEBIDO HOJE</span>
                    <span className="text-sm text-slate-300 font-medium">09:14 AM</span>
                  </div>
                </div>

                <div>
                  <h1 className="text-3xl font-bold text-slate-100 tracking-tight mb-2">Gomes, Eduardo</h1>
                  <p className="text-slate-400 text-sm flex items-center gap-2">
                    <span className="text-slate-300">CT Abdomen</span>
                    <span className="text-slate-600">•</span>
                    <span>14/05/1982 (42a)</span>
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-800/50">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Patient ID</span>
                    <span className="font-mono text-sm text-slate-200 bg-[#0f1522] px-2 py-1 rounded border border-slate-800 inline-block w-max">MRN-44521</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Accession No.</span>
                    <span className="font-mono text-sm text-slate-200 bg-[#0f1522] px-2 py-1 rounded border border-slate-800 inline-block w-max">ACC-2025-089</span>
                  </div>
                </div>
              </div>

              {/* Fingerprint */}
              <div className="bg-[#0f1522] px-8 py-3 border-t border-slate-800/50 flex items-center justify-between">
                <span className="text-[10px] text-slate-500 uppercase font-semibold tracking-wider">Study Fingerprint</span>
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-indigo-400" title="Modality: CT"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-400" title="Name Hash"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" title="ID Format"></div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-[auto_auto_1fr] gap-3 mt-6">
              <div className="flex flex-col gap-1.5">
                <button className="h-12 px-5 rounded-lg bg-[#0f1522] border border-slate-700/50 text-slate-300 font-medium hover:bg-slate-800 transition-colors flex items-center gap-2">
                  <LucideChevronLeft className="w-4 h-4" />
                  Anterior
                </button>
              </div>
              <div className="flex flex-col gap-1.5">
                <button className="h-12 px-5 rounded-lg bg-[#0f1522] border border-slate-700/50 text-slate-300 font-medium hover:bg-slate-800 transition-colors flex items-center gap-2">
                  Pular
                  <LucideChevronRight className="w-4 h-4" />
                </button>
              </div>
              <div className="flex flex-col gap-1.5">
                <button className="h-12 px-6 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition-colors shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2">
                  <LucideCheckCircle className="w-5 h-5" />
                  Confirmar Match
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Candidates */}
        <div className="flex-1 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold tracking-widest text-slate-500 uppercase flex items-center gap-2">
              Correspondências Possíveis
            </h2>
            <span className="text-xs text-slate-500">5 candidatos encontrados — ordenados por compatibilidade</span>
          </div>

          <div className="flex-1 overflow-y-auto pr-2 space-y-3 pb-20">
            {/* Candidate 1 - 100% */}
            <div className="bg-[#0f1522] rounded-lg border border-indigo-500/40 shadow-[0_0_15px_rgba(99,102,241,0.1)] relative overflow-hidden flex transition-all hover:bg-[#121929] cursor-pointer">
              <div className="w-1.5 bg-emerald-500 shrink-0"></div>
              <div className="flex-1 p-4 flex items-center gap-4">
                <div className="flex flex-col items-center justify-center w-12 shrink-0">
                  <span className="text-xs font-bold text-emerald-400">100%</span>
                  <span className="text-[10px] text-slate-500">#1</span>
                </div>
                
                <div className="flex-1 grid grid-cols-[1.5fr_1fr_1fr] gap-4 items-center">
                  <div className="flex flex-col gap-0.5">
                    <span className="font-bold text-slate-100">Gomes, Eduardo</span>
                    <span className="text-xs text-slate-400 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-indigo-400/50"></span> CT Abdomen
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-slate-500 uppercase">Patient ID</span>
                    <span className="text-xs font-mono text-emerald-400">MRN-44521</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-slate-500 uppercase">Accession</span>
                    <span className="text-xs font-mono text-slate-300">RIS-55332</span>
                  </div>
                </div>

                <div className="shrink-0">
                  <button className="px-4 py-2 bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 rounded text-xs font-medium transition-colors border border-indigo-500/30">
                    Selecionar
                  </button>
                </div>
              </div>
            </div>

            {/* Candidate 2 - 87% */}
            <div className="bg-[#0a0f18] rounded-lg border border-slate-800 relative overflow-hidden flex transition-all hover:bg-[#0f1522] cursor-pointer">
              <div className="w-1 bg-cyan-400 shrink-0"></div>
              <div className="flex-1 p-4 flex items-center gap-4 opacity-80 hover:opacity-100 transition-opacity">
                <div className="flex flex-col items-center justify-center w-12 shrink-0">
                  <span className="text-xs font-bold text-cyan-400">87%</span>
                  <span className="text-[10px] text-slate-600">#2</span>
                </div>
                
                <div className="flex-1 grid grid-cols-[1.5fr_1fr_1fr] gap-4 items-center">
                  <div className="flex flex-col gap-0.5">
                    <span className="font-medium text-slate-200">Gomes, Eduardo R.</span>
                    <span className="text-xs text-slate-400 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-indigo-400/50"></span> CT Thorax
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-slate-500 uppercase">Patient ID</span>
                    <span className="text-xs font-mono text-emerald-400">MRN-44521</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-slate-500 uppercase">Accession</span>
                    <span className="text-xs font-mono text-amber-400">RIS-55290</span>
                  </div>
                </div>

                <div className="shrink-0">
                  <button className="px-4 py-2 bg-slate-800 text-slate-300 hover:bg-slate-700 rounded text-xs font-medium transition-colors border border-slate-700">
                    Selecionar
                  </button>
                </div>
              </div>
            </div>

            {/* Candidate 3 - 72% */}
            <div className="bg-[#0a0f18] rounded-lg border border-slate-800 relative overflow-hidden flex transition-all hover:bg-[#0f1522] cursor-pointer">
              <div className="w-1 bg-amber-400 shrink-0"></div>
              <div className="flex-1 p-4 flex items-center gap-4 opacity-70 hover:opacity-100 transition-opacity">
                <div className="flex flex-col items-center justify-center w-12 shrink-0">
                  <span className="text-xs font-bold text-amber-400">72%</span>
                  <span className="text-[10px] text-slate-600">#3</span>
                </div>
                
                <div className="flex-1 grid grid-cols-[1.5fr_1fr_1fr] gap-4 items-center">
                  <div className="flex flex-col gap-0.5">
                    <span className="font-medium text-slate-300">Gomes, E.</span>
                    <span className="text-xs text-slate-400 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-indigo-400/50"></span> CT Abdomen
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-slate-500 uppercase">Patient ID</span>
                    <span className="text-xs font-mono text-amber-400">MRN-44600</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-slate-500 uppercase">Accession</span>
                    <span className="text-xs font-mono text-slate-400">RIS-55410</span>
                  </div>
                </div>

                <div className="shrink-0">
                  <button className="px-4 py-2 bg-slate-800 text-slate-300 hover:bg-slate-700 rounded text-xs font-medium transition-colors border border-slate-700">
                    Selecionar
                  </button>
                </div>
              </div>
            </div>

            {/* Candidate 4 - 45% */}
            <div className="bg-[#0a0f18]/50 rounded-lg border border-slate-800/50 relative overflow-hidden flex transition-all hover:bg-[#0f1522] cursor-pointer">
              <div className="w-1 bg-slate-600 shrink-0"></div>
              <div className="flex-1 p-4 flex items-center gap-4 opacity-50 hover:opacity-100 transition-opacity">
                <div className="flex flex-col items-center justify-center w-12 shrink-0">
                  <span className="text-xs font-bold text-slate-400">45%</span>
                  <span className="text-[10px] text-slate-600">#4</span>
                </div>
                
                <div className="flex-1 grid grid-cols-[1.5fr_1fr_1fr] gap-4 items-center">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-slate-400">Gomez, Eduardo</span>
                    <span className="text-xs text-slate-500 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-indigo-400/30"></span> CT Pelvis
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-slate-600 uppercase">Patient ID</span>
                    <span className="text-xs font-mono text-red-400/70">MRN-38901</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-slate-600 uppercase">Accession</span>
                    <span className="text-xs font-mono text-slate-500">RIS-55121</span>
                  </div>
                </div>

                <div className="shrink-0">
                  <button className="px-4 py-2 bg-slate-800/50 text-slate-400 hover:bg-slate-700 rounded text-xs font-medium transition-colors border border-slate-700/50">
                    Selecionar
                  </button>
                </div>
              </div>
            </div>

            {/* Candidate 5 - 22% */}
            <div className="bg-[#0a0f18]/30 rounded-lg border border-slate-800/30 relative overflow-hidden flex transition-all hover:bg-[#0f1522] cursor-pointer">
              <div className="w-1 bg-slate-700 shrink-0"></div>
              <div className="flex-1 p-4 flex items-center gap-4 opacity-40 hover:opacity-100 transition-opacity">
                <div className="flex flex-col items-center justify-center w-12 shrink-0">
                  <span className="text-xs font-bold text-slate-500">22%</span>
                  <span className="text-[10px] text-slate-700">#5</span>
                </div>
                
                <div className="flex-1 grid grid-cols-[1.5fr_1fr_1fr] gap-4 items-center">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-slate-500 line-through decoration-red-500/50">Gomes, Patricia</span>
                    <span className="text-xs text-slate-600 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-slate-700"></span> MR Brain
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-slate-700 uppercase">Patient ID</span>
                    <span className="text-xs font-mono text-red-500/50">MRN-44501</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-slate-700 uppercase">Accession</span>
                    <span className="text-xs font-mono text-slate-600">RIS-54990</span>
                  </div>
                </div>

                <div className="shrink-0">
                  <button className="px-4 py-2 bg-slate-800/30 text-slate-500 hover:bg-slate-700/50 rounded text-xs font-medium transition-colors border border-slate-800">
                    Selecionar
                  </button>
                </div>
              </div>
            </div>

          </div>
          
          {/* Bottom Manual Search */}
          <div className="absolute bottom-6 right-6 left-[528px]">
            <button className="w-full py-4 rounded-lg border border-dashed border-slate-700 text-slate-400 hover:text-slate-300 hover:border-slate-500 hover:bg-slate-800/30 transition-all text-sm font-medium flex items-center justify-center gap-2">
              <LucideSearch className="w-4 h-4" />
              Não encontrou? Buscar na worklist completa →
            </button>
          </div>
        </div>

      </main>
    </div>
  );
}
