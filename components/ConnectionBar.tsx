
import React from 'react';
import { Wifi, WifiOff, RefreshCw, Server, Activity, ArrowDownUp, Zap, CheckCircle2, AlertTriangle, Unplug } from 'lucide-react';
import { ConnectionStatus } from '../types';

interface ConnectionBarProps {
  status: ConnectionStatus;
  url: string;
  onUrlChange: (url: string) => void;
  onConnect: () => void;
  onDisconnect: () => void;
  ping?: number;
  messageCount?: number;
}

export const ConnectionBar: React.FC<ConnectionBarProps> = ({
  status,
  url,
  onUrlChange,
  onConnect,
  onDisconnect,
  ping = 0,
  messageCount = 0,
}) => {
  const isConnected = status === ConnectionStatus.CONNECTED;
  const isConnecting = status === ConnectionStatus.CONNECTING;

  // Helper to determine status appearance
  const getStatusConfig = () => {
    switch (status) {
      case ConnectionStatus.CONNECTED:
        return {
          bg: 'bg-emerald-500/10',
          text: 'text-emerald-400',
          border: 'border-emerald-500/30',
          shadow: 'shadow-[0_0_10px_rgba(16,185,129,0.2)]',
          icon: <CheckCircle2 size={14} />,
          label: 'ONLINE'
        };
      case ConnectionStatus.CONNECTING:
        return {
          bg: 'bg-amber-500/10',
          text: 'text-amber-400',
          border: 'border-amber-500/30',
          shadow: 'shadow-[0_0_10px_rgba(245,158,11,0.2)]',
          icon: <RefreshCw size={14} className="animate-spin" />,
          label: 'CONNECTING...'
        };
      case ConnectionStatus.ERROR:
        return {
          bg: 'bg-red-500/10',
          text: 'text-red-400',
          border: 'border-red-500/30',
          shadow: 'shadow-[0_0_10px_rgba(239,68,68,0.2)]',
          icon: <AlertTriangle size={14} />,
          label: 'CONNECTION ERROR'
        };
      case ConnectionStatus.DISCONNECTED:
      default:
        return {
          bg: 'bg-slate-800',
          text: 'text-slate-400',
          border: 'border-slate-700',
          shadow: '',
          icon: <Unplug size={14} />,
          label: 'OFFLINE'
        };
    }
  };

  const statusConfig = getStatusConfig();

  return (
    <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-lg p-4 mb-6 shadow-xl shadow-slate-950/50">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        
        <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto no-scrollbar">
          <div className={`
            flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border shrink-0 transition-all duration-300
            ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border} ${statusConfig.shadow}
          `}>
            {statusConfig.icon}
            <span className="uppercase tracking-wider">
              {statusConfig.label}
            </span>
          </div>

          {isConnected && (
            <div className="flex items-center gap-3 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-full text-xs font-mono text-slate-400 shrink-0 animate-in slide-in-from-left-2 fade-in">
                <div className="flex items-center gap-1.5" title="Latência de Rede">
                    <Activity size={12} className={ping < 50 ? "text-emerald-500" : ping < 150 ? "text-yellow-500" : "text-red-500"} />
                    <span className={ping < 50 ? "text-emerald-400" : "text-slate-300"}>{ping}ms</span>
                </div>
                <div className="w-px h-3 bg-slate-800"></div>
                <div className="flex items-center gap-1.5" title="Mensagens Recebidas">
                    <ArrowDownUp size={12} className="text-indigo-500" />
                    <span className="text-indigo-300">{messageCount}</span>
                </div>
                <div className="w-px h-3 bg-slate-800"></div>
                <div className="flex items-center gap-1.5" title="Throughput">
                   <Zap size={12} className="text-amber-500" />
                   <span className="text-amber-300">Live</span>
                </div>
            </div>
          )}

          <span className="text-slate-500 text-xs hidden xl:inline-block border-l border-slate-800 pl-3">DICOM C-STORE SCP Listener</span>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto flex-1 justify-end">
          <div className="relative flex-1 max-w-md group">
            <Server size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
            <input 
              type="text" 
              value={url}
              onChange={(e) => onUrlChange(e.target.value)}
              disabled={isConnected || isConnecting}
              className="w-full bg-slate-950 border border-slate-800 rounded-md py-2 pl-10 pr-4 text-sm text-slate-200 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all disabled:opacity-50 font-mono"
              placeholder="ws://localhost:8080/dicom"
            />
          </div>

          {!isConnected ? (
             <button 
              onClick={onConnect}
              disabled={isConnecting}
              className="bg-cyan-600 hover:bg-cyan-500 text-white px-5 py-2 rounded-md text-sm font-semibold transition-all shadow-lg shadow-cyan-900/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap"
             >
               {isConnecting ? '...' : 'Conectar'}
             </button>
          ) : (
            <button 
              onClick={onDisconnect}
              className="bg-transparent border border-slate-700 hover:border-red-500/50 hover:bg-red-500/10 text-slate-400 hover:text-red-400 px-5 py-2 rounded-md text-sm font-semibold transition-all whitespace-nowrap"
            >
              Desconectar
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
