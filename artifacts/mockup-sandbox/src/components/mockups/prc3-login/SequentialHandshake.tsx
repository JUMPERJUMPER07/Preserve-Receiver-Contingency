import React from 'react';
import { Check } from 'lucide-react';

export function SequentialHandshake() {
  return (
    <div 
      className="bg-[#020817] text-slate-300 font-mono flex flex-col items-center justify-between selection:bg-cyan-900/50 relative"
      style={{ height: '100vh', overflow: 'hidden' }}
    >
      {/* Background Dot Grid */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
          backgroundSize: '24px 24px'
        }}
      />
      
      {/* Subtle Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-cyan-900/10 rounded-full blur-[120px] pointer-events-none opacity-50" />

      {/* Header / Progress Indicator */}
      <div className="w-full flex justify-center pt-12 z-10">
        <div className="flex items-center gap-4 text-xs tracking-[0.2em] uppercase">
          <div className="flex items-center gap-2 opacity-40">
            <div className="w-4 h-4 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/50">
              <Check size={10} className="text-emerald-400" />
            </div>
            <span>[I] Sistema</span>
          </div>
          <span className="opacity-30">·</span>
          <div className="flex items-center gap-2 text-cyan-400">
            <div className="w-4 h-4 rounded-full border border-cyan-400 flex items-center justify-center animate-pulse">
              <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full" />
            </div>
            <span className="border-b border-cyan-400/50 pb-0.5">[II] Operador</span>
          </div>
          <span className="opacity-30">·</span>
          <div className="flex items-center gap-2 opacity-30">
            <div className="w-4 h-4 rounded-full border border-slate-600 flex items-center justify-center">
            </div>
            <span>[III] Credencial</span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-col items-center justify-center flex-1 w-full max-w-3xl px-8 z-10">
        
        {/* Step 1 Resolution (Muted Context) */}
        <div className="w-full mb-16 opacity-60 flex flex-col items-center">
          <div className="text-emerald-400 text-[10px] tracking-widest uppercase mb-2 flex items-center gap-2">
            <Check size={12} /> Sistema Identificado
          </div>
          <div className="text-sm tracking-widest text-slate-400 mb-4">
            PRESERVE RECEIVER <span className="opacity-50">·</span> PRC-RECEIVER-2.5.0
          </div>
          <div className="flex items-center gap-6 text-[11px] text-emerald-500/80 tracking-widest">
            <span className="flex items-center gap-1.5"><Check size={12}/> PACS</span>
            <span className="flex items-center gap-1.5"><Check size={12}/> RIS</span>
            <span className="flex items-center gap-1.5"><Check size={12}/> REDE</span>
          </div>
        </div>

        {/* Active Challenge (Step 2) */}
        <div className="w-full flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-700">
          <label className="text-xs uppercase tracking-[0.3em] text-slate-500 mb-6">
            Identificação do Operador
          </label>
          
          <div className="relative w-full max-w-sm">
            <input 
              type="text" 
              defaultValue="ADMIN"
              className="w-full bg-transparent border-none border-b-2 border-cyan-500/30 focus:border-cyan-400 text-center text-4xl py-4 text-cyan-400 outline-none tracking-widest transition-colors focus:ring-0 placeholder:text-slate-700"
              placeholder="Ex: ADMIN"
              autoFocus
            />
            {/* Blinking cursor simulation via CSS if empty, or we just rely on native cursor */}
          </div>
          
          <div className="mt-4 text-[11px] text-slate-500 tracking-wider">
            ID de Usuário
          </div>

          <button className="mt-12 text-cyan-500 text-sm tracking-[0.2em] uppercase hover:text-cyan-300 transition-colors flex items-center gap-2 group">
            Continuar <span className="group-hover:translate-x-1 transition-transform">→</span>
          </button>
          
          <div className="mt-8 text-[10px] text-slate-600 tracking-widest">
            Padrão: admin / admin
          </div>
        </div>

      </div>

      {/* Footer */}
      <div className="w-full pb-8 flex justify-center z-10">
        <div className="text-[10px] tracking-[0.2em] text-slate-600 flex items-center gap-3 opacity-60">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          CONEXÃO SEGURA · 256-BIT · PRC-RECEIVER
        </div>
      </div>
    </div>
  );
}
