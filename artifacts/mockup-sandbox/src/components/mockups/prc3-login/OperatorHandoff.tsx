import React from "react";
import { ArrowRight, User, Lock, Activity, ShieldAlert, Monitor, Server, Database, Clock, Calendar } from "lucide-react";

export function OperatorHandoff() {
  return (
    <div style={{ height: '100vh', overflow: 'hidden' }} className="flex w-full bg-[#06111E] text-slate-300 font-sans selection:bg-cyan-500/30">
      
      {/* LEFT PANEL: System Status Briefing (40%) */}
      <div className="w-[40%] flex flex-col border-r border-slate-700/30 bg-[#06111E] relative overflow-hidden">
        {/* Subtle grid background */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDQwIEwgNDAgNDAgNDAgMCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDIpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-50 pointer-events-none" />

        <div className="p-8 flex-1 flex flex-col z-10 relative">
          
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-cyan-400 font-mono font-bold text-lg tracking-wider flex items-center gap-2">
              <ShieldAlert size={20} className="text-cyan-500" />
              PRESERVE RECEIVER
            </h1>
            <p className="text-slate-500 font-mono text-xs uppercase tracking-widest mt-1">
              Contingency System
            </p>
          </div>

          <div className="w-full h-px bg-gradient-to-r from-slate-700/50 to-transparent mb-8" />

          {/* TURNO */}
          <div className="mb-10">
            <p className="text-slate-500 font-mono text-xs uppercase tracking-wider mb-2">Turno Atual</p>
            <div className="flex items-center gap-3">
              <Clock className="text-amber-500 opacity-80" size={24} />
              <div className="text-amber-400 font-mono text-4xl tracking-tight">07:00 – 15:00</div>
            </div>
          </div>

          {/* System Status Indicators */}
          <div className="mb-10">
            <p className="text-slate-500 font-mono text-xs uppercase tracking-wider mb-4">System Status</p>
            <div className="flex flex-col gap-3 font-mono text-sm">
              <div className="flex items-center justify-between bg-slate-900/40 p-3 rounded border border-slate-800/50">
                <div className="flex items-center gap-3 text-slate-300">
                  <Server size={16} className="text-slate-500" />
                  PACS
                </div>
                <div className="flex items-center gap-2 text-emerald-400 font-medium">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                  ONLINE
                </div>
              </div>
              <div className="flex items-center justify-between bg-slate-900/40 p-3 rounded border border-slate-800/50">
                <div className="flex items-center gap-3 text-slate-300">
                  <Database size={16} className="text-slate-500" />
                  RIS
                </div>
                <div className="flex items-center gap-2 text-emerald-400 font-medium">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" style={{ animationDelay: '300ms' }} />
                  ONLINE
                </div>
              </div>
              <div className="flex items-center justify-between bg-slate-900/40 p-3 rounded border border-slate-800/50">
                <div className="flex items-center gap-3 text-slate-300">
                  <Activity size={16} className="text-slate-500" />
                  REDE
                </div>
                <div className="flex items-center gap-2 text-emerald-400 font-medium">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                  ESTÁVEL
                </div>
              </div>
            </div>
          </div>

          {/* Estudos Pendentes */}
          <div className="mb-10">
            <p className="text-slate-500 font-mono text-xs uppercase tracking-wider mb-4">Estudos Pendentes</p>
            <div className="flex items-end gap-6 mb-4">
              <div className="text-white font-mono text-5xl leading-none">12</div>
              <div className="text-slate-500 font-mono text-sm uppercase tracking-wider pb-1">Total</div>
            </div>
            <div className="flex gap-4 font-mono text-sm">
              <div className="flex items-center gap-2 bg-slate-800/30 px-3 py-1.5 rounded border border-slate-700/30">
                <span className="text-slate-400">CT:</span>
                <span className="text-white font-bold">7</span>
              </div>
              <div className="flex items-center gap-2 bg-slate-800/30 px-3 py-1.5 rounded border border-slate-700/30">
                <span className="text-slate-400">MR:</span>
                <span className="text-white font-bold">3</span>
              </div>
              <div className="flex items-center gap-2 bg-slate-800/30 px-3 py-1.5 rounded border border-slate-700/30">
                <span className="text-slate-400">CR:</span>
                <span className="text-white font-bold">2</span>
              </div>
            </div>
          </div>

          <div className="flex-1" />

          {/* Last Session */}
          <div className="mt-auto bg-slate-900/40 border border-slate-800 p-4 rounded text-xs font-mono text-slate-400 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">ÚLTIMO OPERADOR:</span>
              <span className="text-slate-300">ADMIN</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">DURAÇÃO:</span>
              <span className="text-slate-300">08:32:17</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">ENCERRADO:</span>
              <span className="text-slate-300">06:47:23</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-4 bg-[#040C16] border-t border-slate-800/50 text-[10px] font-mono text-slate-600 flex justify-between items-center z-10 relative">
          <span>PRC-RECEIVER-2.5.0</span>
          <span>BUILD: 20260426</span>
        </div>
      </div>

      {/* RIGHT PANEL: Authentication (60%) */}
      <div className="w-[60%] bg-[#081321] flex flex-col items-center justify-center relative shadow-[inset_20px_0_40px_rgba(0,0,0,0.2)]">
        
        <div className="w-full max-w-md px-8">
          <div className="mb-10 text-center">
            <h2 className="text-slate-500 font-mono text-xs uppercase tracking-[0.2em] mb-2 flex items-center justify-center gap-2">
              <Monitor size={14} />
              Identificação do Operador
            </h2>
          </div>

          <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono text-slate-400 uppercase tracking-widest pl-1">
                Operador
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
                  <User size={20} />
                </div>
                <input 
                  type="text" 
                  defaultValue="admin"
                  className="w-full bg-[#0B1A2C] border-2 border-slate-800 text-white text-lg rounded-xl block pl-12 p-4 placeholder-slate-600 focus:border-cyan-500/50 focus:ring-4 focus:ring-cyan-500/10 transition-all outline-none font-mono tracking-wider"
                  placeholder="ID do Operador"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-mono text-slate-400 uppercase tracking-widest pl-1">
                Senha
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
                  <Lock size={20} />
                </div>
                <input 
                  type="password" 
                  defaultValue="admin"
                  className="w-full bg-[#0B1A2C] border-2 border-slate-800 text-white text-lg rounded-xl block pl-12 p-4 placeholder-slate-600 focus:border-cyan-500/50 focus:ring-4 focus:ring-cyan-500/10 transition-all outline-none font-mono tracking-widest"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="pt-4">
              <button 
                type="button"
                className="w-full flex items-center justify-center gap-3 bg-cyan-600 hover:bg-cyan-500 text-white font-mono font-bold text-sm tracking-wider rounded-xl p-4 transition-all hover:shadow-[0_0_20px_rgba(8,145,178,0.4)] active:scale-[0.98]"
              >
                ASSUMIR TURNO
                <ArrowRight size={18} />
              </button>
              <p className="text-center text-[10px] font-mono text-slate-600 mt-4 tracking-wider">
                Padrão: admin / admin
              </p>
            </div>
          </form>

          <div className="mt-16 text-center">
            <a href="#" className="text-xs font-mono text-slate-500 hover:text-cyan-400 transition-colors tracking-wide border-b border-transparent hover:border-cyan-400/50 pb-0.5">
              Primeiro Acesso
            </a>
          </div>
        </div>

      </div>

    </div>
  );
}
