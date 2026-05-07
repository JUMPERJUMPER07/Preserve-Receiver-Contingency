import React from "react";
import { User, Lock, ArrowRight } from "lucide-react";

export function SystemReady() {
  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#020817] text-slate-200 select-none font-sans flex items-center justify-center">
      {/* Ghosted Background Dashboard */}
      <div className="absolute inset-0 z-0 opacity-15 blur-[2px] pointer-events-none flex flex-col p-4 gap-4">
        {/* Top metrics ribbon */}
        <div className="flex w-full gap-4 h-12">
          <div className="h-full w-48 bg-slate-800 rounded-md"></div>
          <div className="h-full w-32 bg-slate-800 rounded-md"></div>
          <div className="h-full w-32 bg-slate-800 rounded-md"></div>
          <div className="h-full flex-1 bg-slate-800/50 rounded-md"></div>
          <div className="h-full w-24 bg-slate-800 rounded-md"></div>
        </div>

        <div className="flex flex-1 gap-4 overflow-hidden">
          {/* INCOMING Column */}
          <div className="w-1/4 h-full flex flex-col gap-3">
            <div className="h-8 w-1/2 bg-slate-700/50 rounded"></div>
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-20 w-full bg-slate-800 rounded-lg flex flex-col p-3 gap-2">
                <div className="h-4 w-3/4 bg-slate-700 rounded"></div>
                <div className="h-3 w-1/2 bg-slate-700/50 rounded"></div>
              </div>
            ))}
          </div>

          {/* WORKSTATION Column */}
          <div className="flex-1 h-full flex flex-col gap-4">
            <div className="h-8 w-1/3 bg-slate-700/50 rounded"></div>
            <div className="flex-1 w-full bg-slate-800 rounded-xl flex flex-col p-6 gap-4">
              <div className="h-8 w-1/4 bg-slate-700 rounded"></div>
              <div className="h-4 w-full bg-slate-700/50 rounded"></div>
              <div className="h-4 w-5/6 bg-slate-700/50 rounded"></div>
              <div className="h-4 w-4/6 bg-slate-700/50 rounded"></div>
              <div className="flex-1 flex gap-4 mt-8">
                <div className="w-1/2 h-full bg-slate-700/30 rounded-lg"></div>
                <div className="w-1/2 h-full bg-slate-700/30 rounded-lg"></div>
              </div>
            </div>
          </div>

          {/* OPS LOG Column */}
          <div className="w-1/4 h-full flex flex-col gap-3">
            <div className="h-8 w-1/2 bg-slate-700/50 rounded"></div>
            <div className="flex-1 w-full bg-slate-800 rounded-lg p-3 flex flex-col gap-3">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <div className="h-3 w-12 bg-slate-700/50 rounded"></div>
                  <div className="h-3 flex-1 bg-slate-700 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Translucent Overlay */}
      <div className="absolute inset-0 z-10 bg-black/75"></div>

      {/* Authentication Panel */}
      <div className="z-20 w-[360px] bg-slate-900/80 backdrop-blur-xl border border-slate-700/40 rounded-xl shadow-2xl flex flex-col overflow-hidden">
        
        {/* Status Strip */}
        <div className="px-4 py-2 border-b border-slate-800/60 flex items-center justify-center gap-2 bg-slate-950/50">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
          <span className="text-[10px] font-mono font-bold text-emerald-400 tracking-wider">
            SISTEMA OPERACIONAL · 5 ESTUDOS AGUARDANDO
          </span>
        </div>

        <div className="p-8 flex flex-col">
          {/* Header */}
          <div className="flex flex-col items-center mb-8">
            <h1 className="text-2xl font-bold text-white tracking-tight text-center">
              Preserve Receiver
            </h1>
            <p className="text-[10px] font-mono text-slate-400 uppercase tracking-widest mt-1">
              Contingency System
            </p>
          </div>

          {/* Form */}
          <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
            <div className="space-y-1.5 group">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">
                Operador
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 group-focus-within:text-cyan-400 transition-colors">
                  <User size={16} />
                </div>
                <input 
                  type="text" 
                  value="admin"
                  readOnly
                  className="w-full bg-slate-950/50 border border-slate-700 text-slate-200 text-sm rounded-lg block pl-10 p-3 shadow-inner outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20"
                />
              </div>
            </div>

            <div className="space-y-1.5 group">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">
                Senha
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 group-focus-within:text-cyan-400 transition-colors">
                  <Lock size={16} />
                </div>
                <input 
                  type="password" 
                  value="admin"
                  readOnly
                  className="w-full bg-slate-950/50 border border-slate-700 text-slate-200 text-sm rounded-lg block pl-10 p-3 shadow-inner outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20"
                />
              </div>
            </div>

            <button 
              type="button"
              className="w-full flex items-center justify-center gap-2 text-white font-bold rounded-lg text-sm px-5 py-3.5 mt-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 shadow-[0_4px_16px_rgba(6,182,212,0.3)] transition-all"
            >
              <span className="tracking-wide uppercase text-xs">Entrar no Sistema</span>
              <ArrowRight size={16} />
            </button>
            
            <p className="text-[10px] text-slate-600 font-mono text-center pt-2">
              Padrão: admin / admin
            </p>
          </form>
        </div>

        {/* Footer */}
        <div className="bg-slate-950/90 p-3 text-center border-t border-slate-800/60">
          <p className="text-[9px] text-slate-600 font-mono tracking-widest uppercase">
            PRC-RECEIVER-2.5.0
          </p>
        </div>
      </div>
    </div>
  );
}
