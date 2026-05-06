import React from "react";
import { NetworkState } from "../types";
import { Settings, LogOut, RefreshCw, Activity, Globe } from "lucide-react";
import { Logo } from "./Logo";

interface HeaderProps {
  onOpenSettings: () => void;
  onLogout?: () => void;
  onRefresh?: () => void;
  userDrt?: string;
  networkStatus?: {
    pacs: NetworkState;
    ris: NetworkState;
  };
}

export const Header: React.FC<HeaderProps> = ({
  onOpenSettings,
  onLogout,
  onRefresh,
  userDrt,
  networkStatus,
}) => {
  return (
    <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/40 border border-white/10 backdrop-blur-xl p-3 md:p-4 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] relative overflow-hidden shrink-0 ring-1 ring-white/5">
      {/* Decorative Glow */}
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-cyan-500/5 via-indigo-500/5 to-transparent pointer-events-none" />

      <div className="flex items-center gap-4 relative z-10 pl-2">
        <div className="flex items-center justify-center">
          <Logo size={40} />
        </div>
        <div>
          <h1 className="text-lg font-bold text-white tracking-tight leading-none flex items-center gap-2">
            Preserve{" "}
            <span className="text-cyan-400 font-normal opacity-80">
              Receiver
            </span>
          </h1>
        </div>
      </div>

      {/* Network Monitor (Phase 2) */}
      <div className="flex items-center gap-6 bg-slate-950/40 px-5 py-2 rounded-2xl border border-white/5 relative z-10 mx-auto lg:mx-0">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 min-w-[80px]">
              <Globe size={12} className={networkStatus?.pacs === 'online' ? "text-cyan-400" : "text-slate-600"} />
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter">PACS Central</span>
            </div>
            <div className="flex items-center gap-1">
              <div className={`h-1.5 w-1.5 rounded-full ${
                networkStatus?.pacs === 'online' ? "bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.6)]" : 
                networkStatus?.pacs === 'degraded' ? "bg-amber-500 animate-pulse" : "bg-red-500"
              }`} />
              <span className={`text-[10px] font-mono font-bold ${
                networkStatus?.pacs === 'online' ? "text-cyan-400" : "text-slate-500"
              }`}>
                {networkStatus?.pacs === 'online' ? "ONLINE" : networkStatus?.pacs === 'degraded' ? "LATENCY" : "OFFLINE"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 min-w-[80px]">
              <Activity size={12} className={networkStatus?.ris === 'online' ? "text-indigo-400" : "text-slate-600"} />
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter">RIS Server</span>
            </div>
            <div className="flex items-center gap-1">
              <div className={`h-1.5 w-1.5 rounded-full ${
                networkStatus?.ris === 'online' ? "bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.6)]" : 
                networkStatus?.ris === 'degraded' ? "bg-amber-500 animate-pulse" : "bg-red-500"
              }`} />
              <span className={`text-[10px] font-mono font-bold ${
                networkStatus?.ris === 'online' ? "text-indigo-400" : "text-slate-500"
              }`}>
                {networkStatus?.ris === 'online' ? "ONLINE" : networkStatus?.ris === 'degraded' ? "LATENCY" : "OFFLINE"}
              </span>
            </div>
          </div>
        </div>
        
        <div className="h-8 w-px bg-white/5" />
        
        <div className="flex flex-col items-center justify-center">
          <span className="text-[8px] font-bold text-slate-600 uppercase tracking-widest mb-0.5">Ping</span>
          <span className="text-[11px] font-mono text-emerald-400 font-bold">32ms</span>
        </div>
      </div>

      <div className="flex items-center gap-3 relative z-10 pr-1">
        {userDrt && (
          <div className="flex flex-col items-end mr-2 pr-4 border-r border-white/10">
            <span className="text-xs font-bold text-slate-200 tracking-tight">
              DRT {userDrt}
            </span>
            <span className="text-[10px] text-slate-500">
              Radiology Technician
            </span>
          </div>
        )}

        <div className="flex items-center gap-1 bg-black/20 p-1 rounded-xl border border-white/5 backdrop-blur-sm">
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="p-2 text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/10 hover:shadow-[0_2px_10px_rgba(6,182,212,0.2)] rounded-lg transition-all active:scale-[0.95] group"
              title="Atualizar Worklist"
            >
              <RefreshCw
                size={18}
                className="group-hover:rotate-180 transition-transform duration-500"
              />
            </button>
          )}

          <button
            onClick={onOpenSettings}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800/80 hover:shadow-[0_2px_10px_rgba(255,255,255,0.05)] border border-transparent hover:border-slate-700/50 rounded-lg transition-all active:scale-[0.95]"
            title="Configurações"
          >
            <Settings size={18} />
          </button>

          {onLogout && (
            <button
              onClick={onLogout}
              className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 hover:shadow-[0_2px_10px_rgba(239,68,68,0.2)] rounded-lg transition-all active:scale-[0.95]"
              title="Sair"
            >
              <LogOut size={18} />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
