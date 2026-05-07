import React, { useState, useEffect } from 'react';
import { Check, AlertTriangle, Zap, Search, Clock, Inbox, Link as LinkIcon, BarChart3, ChevronRight, Activity, Terminal, ArrowRight, XCircle } from 'lucide-react';

export function OperatorDeck() {
  const [time, setTime] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setTime((t) => t + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatSessionTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const incomingStudies = [
    { id: '1', time: '14:22:05', modality: 'CT', patient: 'Silva, Maria J.', acc: 'ACC-8821', status: 'PROCESSING', active: true },
    { id: '2', time: '14:21:42', modality: 'MR', patient: 'Santos, Roberto', acc: 'ACC-8820', status: 'NEW', active: false },
    { id: '3', time: '14:19:15', modality: 'CR', patient: 'Oliveira, Ana', acc: 'ACC-8819', status: 'DONE', active: false },
    { id: '4', time: '14:15:30', modality: 'US', patient: 'Costa, João P.', acc: 'ACC-8818', status: 'DONE', active: false },
    { id: '5', time: '14:12:08', modality: 'CT', patient: 'Ferreira, L.', acc: 'ACC-8817', status: 'DONE', active: false },
    { id: '6', time: '14:08:55', modality: 'CR', patient: 'Rodrigues, M.', acc: 'ACC-8816', status: 'DONE', active: false },
    { id: '7', time: '14:05:22', modality: 'US', patient: 'Almeida, C.', acc: 'ACC-8815', status: 'DONE', active: false },
    { id: '8', time: '14:01:10', modality: 'MR', patient: 'Gomes, T.', acc: 'ACC-8814', status: 'DONE', active: false },
  ];

  const opsLog = [
    { id: 'l1', time: '14:19:16', type: 'link', text: 'LINKED: Oliveira, Ana → ACC-8819' },
    { id: 'l2', time: '14:18:02', type: 'event', text: 'RIS SYNC: 2 new items received' },
    { id: 'l3', time: '14:15:35', type: 'link', text: 'LINKED: Costa, João P. → ACC-8818' },
    { id: 'l4', time: '14:14:20', type: 'unmatched', text: 'UNMATCHED: Patient Unknown (CR)' },
    { id: 'l5', time: '14:12:10', type: 'link', text: 'LINKED: Ferreira, L. → ACC-8817' },
    { id: 'l6', time: '14:09:00', type: 'link', text: 'LINKED: Rodrigues, M. → ACC-8816' },
    { id: 'l7', time: '14:05:25', type: 'link', text: 'LINKED: Almeida, C. → ACC-8815' },
    { id: 'l8', time: '14:01:12', type: 'link', text: 'LINKED: Gomes, T. → ACC-8814' },
  ];

  return (
    <div className="w-full min-h-screen bg-[#020817] text-slate-300 font-sans flex flex-col overflow-hidden selection:bg-cyan-900 selection:text-cyan-50">
      
      {/* HEADER */}
      <header className="h-14 border-b border-slate-700/50 bg-[#020817] flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-cyan-500">
            <Terminal className="w-5 h-5" />
            <span className="font-mono font-bold tracking-wider text-sm">PRESERVE RECEIVER <span className="text-slate-500">·</span> CONTINGENCY SYSTEM</span>
          </div>
        </div>

        <div className="flex items-center gap-8 font-mono text-xs">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse" />
              <span className="text-slate-400">PACS:</span>
              <span className="text-emerald-500 font-bold">ONLINE</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]" />
              <span className="text-slate-400">RIS:</span>
              <span className="text-rose-500 font-bold">OFFLINE</span>
            </div>
          </div>

          <div className="flex items-center gap-3 border-l border-slate-700/50 pl-8">
            <span className="text-slate-400">SESSION:</span>
            <span className="text-cyan-400 font-bold tracking-wider">{formatSessionTime(time + 5025)}</span>
            <div className="ml-2 px-2 py-0.5 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded text-[10px] font-bold">
              DRT-MODE
            </div>
          </div>
        </div>
      </header>

      {/* METRICS RIBBON */}
      <div className="h-10 border-b border-slate-700/50 bg-[#0a0f18] flex items-center px-4 font-mono text-xs shrink-0 overflow-x-auto gap-8">
        <div className="flex items-center gap-2">
          <Inbox className="w-4 h-4 text-cyan-500" />
          <span className="text-slate-400">RECEBIDOS:</span>
          <span className="text-cyan-400 font-bold">12</span>
        </div>
        <div className="flex items-center gap-2">
          <LinkIcon className="w-4 h-4 text-emerald-500" />
          <span className="text-slate-400">VINCULADOS:</span>
          <span className="text-emerald-400 font-bold">8</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-amber-500" />
          <span className="text-slate-400">PENDENTES:</span>
          <span className="text-amber-400 font-bold">4</span>
        </div>
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-500" />
          <span className="text-slate-400">SEM MATCH:</span>
          <span className="text-rose-400 font-bold">1</span>
        </div>
        <div className="flex items-center gap-2 border-l border-slate-700/50 pl-8">
          <Activity className="w-4 h-4 text-slate-400" />
          <span className="text-slate-400">TEMPO MÉDIO:</span>
          <span className="text-slate-200">2m34s</span>
        </div>
        <div className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-slate-400" />
          <span className="text-slate-400">TAXA:</span>
          <span className="text-slate-200">78%</span>
        </div>
      </div>

      {/* THREE COLUMNS */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* LEFT COLUMN - INCOMING */}
        <div className="w-[280px] border-r border-slate-700/50 flex flex-col bg-[#020817] shrink-0">
          <div className="h-10 border-b border-slate-700/50 flex items-center px-4 shrink-0">
            <span className="font-mono text-xs font-bold text-cyan-500 tracking-wider flex items-center gap-2">
              INCOMING <span className="w-1.5 h-3 bg-cyan-500 animate-pulse block" />
            </span>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar">
            {incomingStudies.map((study) => (
              <div 
                key={study.id}
                className={`
                  p-3 rounded-md border text-sm relative flex flex-col gap-2
                  ${study.active 
                    ? 'bg-cyan-950/20 border-cyan-500/50' 
                    : 'bg-[#0a0f18] border-slate-800 hover:border-slate-700'}
                  ${study.status === 'NEW' ? 'border-l-2 border-l-cyan-400' : ''}
                `}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-slate-500">{study.time}</span>
                  <span className={`
                    text-[10px] font-mono px-1.5 py-0.5 rounded
                    ${study.status === 'NEW' ? 'bg-cyan-500/20 text-cyan-400' : 
                      study.status === 'PROCESSING' ? 'bg-amber-500/20 text-amber-400' : 
                      'bg-slate-800 text-slate-500'}
                  `}>
                    {study.status}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`
                    text-[10px] font-bold px-1.5 py-0.5 rounded-sm
                    ${study.modality === 'CT' ? 'bg-purple-500/20 text-purple-400' : 
                      study.modality === 'MR' ? 'bg-blue-500/20 text-blue-400' :
                      study.modality === 'CR' ? 'bg-emerald-500/20 text-emerald-400' :
                      'bg-orange-500/20 text-orange-400'}
                  `}>
                    {study.modality}
                  </span>
                  <span className={`font-semibold truncate ${study.active ? 'text-cyan-50' : 'text-slate-200'}`}>
                    {study.patient}
                  </span>
                </div>
                <span className="font-mono text-[10px] text-slate-500">{study.acc}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CENTER COLUMN - WORKSTATION */}
        <div className="flex-1 min-w-[580px] bg-[#070c17] flex flex-col relative">
          {/* Subtle grid background for terminal feel */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
          
          <div className="flex-1 overflow-y-auto p-6 flex flex-col z-10">
            
            {/* Mission Card: Incoming DICOM */}
            <div className="border border-slate-700/50 rounded-lg bg-[#020817] p-5 shadow-lg relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-cyan-500" />
              
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="px-2 py-1 bg-purple-500/20 text-purple-400 text-sm font-bold rounded-sm border border-purple-500/30">
                    CT
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white tracking-wide">SILVA, MARIA J.</h2>
                    <div className="flex items-center gap-3 text-xs font-mono text-slate-400 mt-1">
                      <span>DOB: 1980-05-12 (44Y)</span>
                      <span>•</span>
                      <span>ID: MRN-99281</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <span className="font-mono text-sm text-cyan-400 font-bold">ACC-8821</span>
                  <span className="text-xs text-slate-500 font-mono mt-1">RECV: 14:22:05</span>
                </div>
              </div>

              <div className="bg-[#0a0f18] border border-slate-800 rounded p-3 text-sm">
                <span className="text-slate-500 mr-2">DESC:</span>
                <span className="text-slate-300">CT TORAX COM CONTRASTE</span>
              </div>
              
              <div className="mt-4 flex items-center gap-2">
                <span className="inline-flex items-center bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 font-mono text-[10px] rounded px-2 py-1">
                  <Check className="w-3 h-3 mr-1" /> MATCH AUTOMÁTICO
                </span>
              </div>
            </div>

            {/* Verification Row */}
            <div className="flex items-center justify-center py-6">
              <div className="flex items-center gap-2 font-mono text-xs text-slate-400 bg-[#0a0f18] border border-slate-800 rounded-full px-6 py-2 shadow-inner">
                <span className="flex items-center text-emerald-400"><Check className="w-3 h-3 mr-1"/>NAME</span>
                <span className="text-slate-700 mx-1">/</span>
                <span className="flex items-center text-emerald-400"><Check className="w-3 h-3 mr-1"/>DOB</span>
                <span className="text-slate-700 mx-1">/</span>
                <span className="flex items-center text-emerald-400"><Check className="w-3 h-3 mr-1"/>ID</span>
                <span className="text-slate-700 mx-1">/</span>
                <span className="flex items-center text-emerald-400"><Check className="w-3 h-3 mr-1"/>MOD</span>
              </div>
            </div>

            {/* RIS Worklist Match */}
            <div className="border border-slate-700/50 rounded-lg bg-[#020817] p-5 shadow-lg relative overflow-hidden">
               <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500" />
               <div className="absolute right-0 top-0 bg-slate-800 text-[10px] font-mono px-2 py-1 rounded-bl text-slate-400">
                 RIS WORKLIST TARGET
               </div>
               
               <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="px-2 py-1 bg-slate-800 text-slate-300 text-sm font-bold rounded-sm border border-slate-700">
                    CT
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white tracking-wide">SILVA, MARIA J.</h2>
                    <div className="flex items-center gap-3 text-xs font-mono text-slate-400 mt-1">
                      <span>DOB: 1980-05-12 (44Y)</span>
                      <span>•</span>
                      <span>ID: MRN-99281</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <span className="font-mono text-sm text-emerald-400 font-bold">RIS-88821</span>
                  <span className="text-xs text-slate-500 font-mono mt-1">SCHED: 14:30</span>
                </div>
              </div>

              <div className="bg-[#0a0f18] border border-slate-800 rounded p-3 text-sm">
                <span className="text-slate-500 mr-2">PROC:</span>
                <span className="text-slate-300">TOMOGRAFIA DE TORAX C/ CONTRASTE</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-8">
              <button className="w-full relative group overflow-hidden rounded-md bg-cyan-600 hover:bg-cyan-500 text-white shadow-[0_0_20px_rgba(8,145,178,0.3)] transition-all border border-cyan-400">
                <div className="absolute inset-0 w-1/4 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                <div className="px-6 py-4 flex items-center justify-center gap-3 font-mono font-bold text-lg tracking-widest">
                  <Zap className="w-5 h-5 fill-current" />
                  CONFIRMAR VÍNCULO
                </div>
              </button>
            </div>

            {/* Manual Search */}
            <div className="mt-12 pt-6 border-t border-slate-800">
              <h3 className="text-xs font-mono text-slate-500 mb-3 tracking-wider">MANUAL OVERRIDE / SEARCH</h3>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input 
                    type="text" 
                    placeholder="Search by Accession, MRN, or Name..." 
                    className="w-full bg-[#0a0f18] border border-slate-700 rounded text-sm py-2 pl-10 pr-4 font-mono text-slate-300 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                  />
                </div>
                <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded text-sm font-mono text-slate-300 transition-colors">
                  SEARCH
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* RIGHT COLUMN - OPS LOG */}
        <div className="w-[280px] border-l border-slate-700/50 flex flex-col bg-[#020817] shrink-0">
          <div className="h-10 border-b border-slate-700/50 flex items-center px-4 shrink-0">
            <span className="font-mono text-xs font-bold text-emerald-500 tracking-wider">
              OPS LOG
            </span>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-1 custom-scrollbar font-mono text-[11px]">
            {opsLog.map((log) => (
              <div key={log.id} className="flex gap-2 py-1.5 border-b border-slate-800/50">
                <span className="text-slate-600 shrink-0">{log.time}</span>
                <span className={`
                  ${log.type === 'link' ? 'text-emerald-400/90' : 
                    log.type === 'event' ? 'text-cyan-400/90' : 
                    'text-amber-400/90'}
                `}>
                  {log.text}
                </span>
              </div>
            ))}
            <div className="pt-4 text-slate-600 text-center flex flex-col items-center">
              <span>-- END OF LOG --</span>
              <Activity className="w-4 h-4 mt-2 opacity-50" />
            </div>
          </div>
        </div>

      </div>

      {/* BOTTOM STATUS BAR */}
      <footer className="h-8 bg-[#000000] border-t border-slate-800 flex items-center justify-between px-4 font-mono text-[10px] text-slate-500 shrink-0">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            PACS: ws://localhost:8080
          </span>
          <span className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            RIS: HTTP 503
          </span>
        </div>
        <div className="text-amber-500 font-bold tracking-widest flex items-center gap-2">
          <AlertTriangle className="w-3 h-3" />
          CONTINGÊNCIA ATIVA · SISTEMA OPERANDO EM MODO DE RECUPERAÇÃO
        </div>
        <div>
          v2.4.1 · BUILD 20260506
        </div>
      </footer>
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes shimmer {
          100% { transform: translateX(400%) skewX(-12deg); }
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #334155;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #475569;
        }
      `}} />
    </div>
  );
}