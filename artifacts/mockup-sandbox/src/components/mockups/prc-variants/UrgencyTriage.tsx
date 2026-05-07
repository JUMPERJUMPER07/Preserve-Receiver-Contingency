import React from "react";
import { Activity, Settings, User, Link as LinkIcon, CheckCircle2, AlertCircle, Clock, Check } from "lucide-react";

export function UrgencyTriage() {
  return (
    <div className="flex flex-col h-[800px] w-[1280px] bg-[#0a0f18] text-slate-300 font-sans overflow-hidden border border-slate-800 shadow-2xl rounded-xl mx-auto my-8">
      {/* Header */}
      <header className="h-12 bg-[#0a0f18] border-b border-slate-800 flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-cyan-500" />
            <span className="font-semibold text-slate-200 tracking-wide text-sm">PRESERVE RECEIVER</span>
          </div>
          <div className="h-4 w-px bg-slate-800"></div>
          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
              <span className="text-slate-400">PACS</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
              <span className="text-slate-400">RIS</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <User className="w-4 h-4" />
            <span>DRT 48291</span>
          </div>
          <button className="text-slate-400 hover:text-slate-200 transition-colors">
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Session triage bar */}
      <div className="h-10 bg-[#0f1522] border-b border-slate-800 flex items-center px-4 text-xs font-medium shrink-0 shadow-sm">
        <div className="flex gap-6 w-full">
          <div className="flex items-center gap-2">
            <span className="text-slate-500">SESSÃO ATUAL</span>
          </div>
          <div className="h-4 w-px bg-slate-800"></div>
          <div className="flex gap-4">
            <div className="flex items-center gap-1.5">
              <div className="flex items-center justify-center bg-red-500/20 text-red-400 border border-red-500/30 rounded px-1.5 py-0.5 min-w-[20px]">2</div>
              <span className="text-red-400 uppercase tracking-wider">Crítico {'>'}15m</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="flex items-center justify-center bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded px-1.5 py-0.5 min-w-[20px]">2</div>
              <span className="text-amber-400 uppercase tracking-wider">Pendente 5-15m</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="flex items-center justify-center bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded px-1.5 py-0.5 min-w-[20px]">1</div>
              <span className="text-cyan-400 uppercase tracking-wider">Recente {'<'}5m</span>
            </div>
            <div className="flex items-center gap-1.5 ml-4">
              <div className="flex items-center justify-center bg-slate-800 text-slate-400 border border-slate-700 rounded px-1.5 py-0.5 min-w-[20px]">2</div>
              <span className="text-slate-500 uppercase tracking-wider">Vinculado</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Area */}
      <div className="flex-1 flex overflow-hidden bg-[#0a0f18]">
        {/* PACS Column */}
        <div className="flex-1 flex flex-col border-r border-slate-800/50 relative overflow-y-auto">
          <div className="sticky top-0 z-10 bg-[#0a0f18]/90 backdrop-blur text-xs font-semibold text-slate-500 uppercase tracking-wider py-2 px-4 border-b border-slate-800">
            PACS Studies (Incoming)
          </div>
          
          <div className="flex flex-col">
            {/* CRITICAL BAND */}
            <div className="bg-red-950/20 border-l-2 border-red-500/50 pb-4">
              <div className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-red-500/80 uppercase tracking-wider">
                <AlertCircle className="w-3.5 h-3.5" />
                Crítico (2)
              </div>
              <div className="px-3 flex flex-col gap-3">
                {/* Critical Card 1 */}
                <div className="bg-[#0f1522] border border-red-500/40 rounded-md p-3 h-[110px] flex flex-col justify-between relative shadow-[0_0_15px_rgba(239,68,68,0.1)] group">
                  <div className="absolute inset-0 border border-red-500/20 rounded-md animate-pulse pointer-events-none"></div>
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium text-slate-200 text-sm">Gomes, Eduardo</div>
                      <div className="text-xs text-slate-500 mt-0.5">ID: 8849201 • M • 45y</div>
                    </div>
                    <div className="bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-[10px] font-bold px-1.5 py-0.5 rounded">CT</div>
                  </div>
                  <div className="text-xs text-slate-400">CT Abdomen s/ Contraste</div>
                  <div className="flex items-center gap-1.5 text-xs font-medium text-red-400 bg-red-500/10 self-start px-2 py-1 rounded">
                    <Clock className="w-3.5 h-3.5" />
                    24 min aguardando
                  </div>
                </div>
                
                {/* Critical Card 2 */}
                <div className="bg-[#0f1522] border border-red-500/40 rounded-md p-3 h-[110px] flex flex-col justify-between relative shadow-[0_0_15px_rgba(239,68,68,0.1)]">
                  <div className="absolute inset-0 border border-red-500/20 rounded-md animate-pulse pointer-events-none" style={{ animationDelay: '0.5s' }}></div>
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium text-slate-200 text-sm">Pereira, Clara</div>
                      <div className="text-xs text-slate-500 mt-0.5">ID: 7738291 • F • 32y</div>
                    </div>
                    <div className="bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 text-[10px] font-bold px-1.5 py-0.5 rounded">MR</div>
                  </div>
                  <div className="text-xs text-slate-400">MR Cranio</div>
                  <div className="flex items-center gap-1.5 text-xs font-medium text-red-400 bg-red-500/10 self-start px-2 py-1 rounded">
                    <Clock className="w-3.5 h-3.5" />
                    18 min aguardando
                  </div>
                </div>
              </div>
            </div>

            {/* PENDING BAND */}
            <div className="bg-amber-950/10 border-l-2 border-amber-500/30 pb-4 pt-2">
              <div className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-amber-500/80 uppercase tracking-wider">
                <Clock className="w-3.5 h-3.5" />
                Pendente (2)
              </div>
              <div className="px-3 flex flex-col gap-3">
                {/* Pending Card 1 */}
                <div className="bg-[#0f1522] border border-amber-500/30 rounded-md p-3 h-[100px] flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium text-slate-200 text-sm">Ramos, Thiago</div>
                      <div className="text-xs text-slate-500 mt-0.5">ID: 6627182 • M • 58y</div>
                    </div>
                    <div className="bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] font-bold px-1.5 py-0.5 rounded">US</div>
                  </div>
                  <div className="text-xs text-slate-400">US Pelvis</div>
                  <div className="flex items-center gap-1.5 text-xs font-medium text-amber-400">
                    11 min aguardando
                  </div>
                </div>
                
                {/* Pending Card 2 */}
                <div className="bg-[#0f1522] border border-amber-500/30 rounded-md p-3 h-[100px] flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium text-slate-200 text-sm">Lima, Beatriz</div>
                      <div className="text-xs text-slate-500 mt-0.5">ID: 5516073 • F • 29y</div>
                    </div>
                    <div className="bg-slate-500/20 text-slate-400 border border-slate-500/30 text-[10px] font-bold px-1.5 py-0.5 rounded">XR</div>
                  </div>
                  <div className="text-xs text-slate-400">XR Torax</div>
                  <div className="flex items-center gap-1.5 text-xs font-medium text-amber-400">
                    7 min aguardando
                  </div>
                </div>
              </div>
            </div>

            {/* RECENT BAND */}
            <div className="bg-blue-950/10 border-l-2 border-cyan-500/30 pb-4 pt-2">
              <div className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-cyan-500/80 uppercase tracking-wider">
                <Activity className="w-3.5 h-3.5" />
                Recente (1)
              </div>
              <div className="px-3 flex flex-col gap-3">
                {/* Recent Card */}
                <div className="bg-[#0f1522] border border-blue-500/30 rounded-md p-3 h-[96px] flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium text-slate-200 text-sm">Souza, Rafael</div>
                      <div className="text-xs text-slate-500 mt-0.5">ID: 4405964 • M • 41y</div>
                    </div>
                    <div className="bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-[10px] font-bold px-1.5 py-0.5 rounded">CT</div>
                  </div>
                  <div className="text-xs text-slate-400">CT Torax</div>
                  <div className="flex items-center gap-1.5 text-xs font-medium text-cyan-400">
                    Recebido agora
                  </div>
                </div>
              </div>
            </div>
            
            {/* DONE BAND */}
            <div className="pb-4 pt-2 opacity-60">
              <div className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Vinculado (2)
              </div>
              <div className="px-3 flex flex-col gap-2">
                {/* Done Card 1 */}
                <div className="bg-[#0f1522] border border-slate-800 rounded-md px-3 h-[44px] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span className="font-medium text-slate-400 text-sm line-through decoration-slate-600">Silva, Maria J.</span>
                  </div>
                  <div className="text-[10px] text-slate-500 font-medium">CT Torax</div>
                </div>
                {/* Done Card 2 */}
                <div className="bg-[#0f1522] border border-slate-800 rounded-md px-3 h-[44px] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span className="font-medium text-slate-400 text-sm line-through decoration-slate-600">Chen, David</span>
                  </div>
                  <div className="text-[10px] text-slate-500 font-medium">MR Brain</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* MATCH ZONE */}
        <div className="w-32 bg-[#0a0f18] border-r border-slate-800/50 flex flex-col items-center py-10 relative">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMSIgZmlsbD0icmdiYSgyNTUsIDI1NSwgMjU1LCAwLjA1KSIvPjwvc3ZnPg==')] opacity-50"></div>
          
          {/* Critical Matches */}
          <div className="absolute top-[85px] w-full flex justify-center">
            <button className="h-10 w-20 bg-red-500/10 hover:bg-red-500/20 border border-red-500/40 rounded-full flex items-center justify-center text-red-400 transition-all shadow-[0_0_15px_rgba(239,68,68,0.15)] z-10 group relative">
              <div className="absolute inset-0 rounded-full border border-red-500/30 animate-ping opacity-20"></div>
              <LinkIcon className="w-4 h-4 group-hover:scale-110 transition-transform" />
            </button>
          </div>
          <div className="absolute top-[205px] w-full flex justify-center">
            <button className="h-10 w-20 bg-red-500/10 hover:bg-red-500/20 border border-red-500/40 rounded-full flex items-center justify-center text-red-400 transition-all shadow-[0_0_15px_rgba(239,68,68,0.15)] z-10 group relative">
              <div className="absolute inset-0 rounded-full border border-red-500/30 animate-ping opacity-20" style={{ animationDelay: '0.5s' }}></div>
              <LinkIcon className="w-4 h-4 group-hover:scale-110 transition-transform" />
            </button>
          </div>

          {/* Pending Matches */}
          <div className="absolute top-[355px] w-full flex justify-center">
            <button className="h-10 w-20 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-full flex items-center justify-center text-amber-400 transition-all z-10 group">
              <LinkIcon className="w-4 h-4 group-hover:scale-110 transition-transform" />
            </button>
          </div>
          <div className="absolute top-[465px] w-full flex justify-center">
            <button className="h-10 w-20 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-full flex items-center justify-center text-amber-400 transition-all z-10 group">
              <LinkIcon className="w-4 h-4 group-hover:scale-110 transition-transform" />
            </button>
          </div>

          {/* Recent Match */}
          <div className="absolute top-[605px] w-full flex justify-center">
            <button className="h-10 w-20 bg-blue-500/10 hover:bg-blue-500/20 border border-cyan-500/30 rounded-full flex items-center justify-center text-cyan-400 transition-all z-10 group">
              <LinkIcon className="w-4 h-4 group-hover:scale-110 transition-transform" />
            </button>
          </div>
          
          {/* Done Matches */}
          <div className="absolute top-[715px] w-full flex justify-center">
            <div className="h-6 w-6 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center text-emerald-500 z-10">
              <Check className="w-3 h-3" />
            </div>
          </div>
          <div className="absolute top-[765px] w-full flex justify-center">
            <div className="h-6 w-6 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center text-emerald-500 z-10">
              <Check className="w-3 h-3" />
            </div>
          </div>
        </div>

        {/* RIS Column */}
        <div className="flex-1 flex flex-col relative overflow-y-auto">
          <div className="sticky top-0 z-10 bg-[#0a0f18]/90 backdrop-blur text-xs font-semibold text-slate-500 uppercase tracking-wider py-2 px-4 border-b border-slate-800">
            RIS Worklist (Destinations)
          </div>
          
          <div className="flex flex-col">
            {/* CRITICAL BAND */}
            <div className="bg-red-950/20 border-r-2 border-red-500/50 pb-4">
              <div className="flex items-center justify-end gap-2 px-4 py-2 text-xs font-bold text-red-500/80 uppercase tracking-wider">
                Crítico (2)
                <AlertCircle className="w-3.5 h-3.5" />
              </div>
              <div className="px-3 flex flex-col gap-3">
                {/* Critical Card 1 */}
                <div className="bg-[#0f1522] border border-red-500/40 rounded-md p-3 h-[110px] flex flex-col justify-between relative shadow-[0_0_15px_rgba(239,68,68,0.1)] opacity-90">
                  <div className="flex justify-between items-start">
                    <div className="bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-[10px] font-bold px-1.5 py-0.5 rounded">CT</div>
                    <div className="text-right">
                      <div className="font-medium text-slate-200 text-sm">Gomes, Eduardo</div>
                      <div className="text-xs text-slate-500 mt-0.5">Acc: ACC8849201 • Ward B</div>
                    </div>
                  </div>
                  <div className="text-xs text-slate-400 text-right">CT Abdomen s/ Contraste</div>
                  <div className="flex items-center justify-end gap-1.5 text-xs text-slate-500">
                    Order: <span className="text-slate-300">Routine</span>
                  </div>
                </div>
                
                {/* Critical Card 2 */}
                <div className="bg-[#0f1522] border border-red-500/40 rounded-md p-3 h-[110px] flex flex-col justify-between relative shadow-[0_0_15px_rgba(239,68,68,0.1)] opacity-90">
                  <div className="flex justify-between items-start">
                    <div className="bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 text-[10px] font-bold px-1.5 py-0.5 rounded">MR</div>
                    <div className="text-right">
                      <div className="font-medium text-slate-200 text-sm">Pereira, Clara</div>
                      <div className="text-xs text-slate-500 mt-0.5">Acc: ACC7738291 • ER</div>
                    </div>
                  </div>
                  <div className="text-xs text-slate-400 text-right">MR Cranio</div>
                  <div className="flex items-center justify-end gap-1.5 text-xs text-red-400 font-medium">
                    Order: <span className="text-red-400">STAT</span>
                  </div>
                </div>
              </div>
            </div>

            {/* PENDING BAND */}
            <div className="bg-amber-950/10 border-r-2 border-amber-500/30 pb-4 pt-2">
              <div className="flex items-center justify-end gap-2 px-4 py-2 text-xs font-bold text-amber-500/80 uppercase tracking-wider">
                Pendente (2)
                <Clock className="w-3.5 h-3.5" />
              </div>
              <div className="px-3 flex flex-col gap-3">
                {/* Pending Card 1 */}
                <div className="bg-[#0f1522] border border-amber-500/30 rounded-md p-3 h-[100px] flex flex-col justify-between opacity-90">
                  <div className="flex justify-between items-start">
                    <div className="bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] font-bold px-1.5 py-0.5 rounded">US</div>
                    <div className="text-right">
                      <div className="font-medium text-slate-200 text-sm">Ramos, Thiago</div>
                      <div className="text-xs text-slate-500 mt-0.5">Acc: ACC6627182 • Outpatient</div>
                    </div>
                  </div>
                  <div className="text-xs text-slate-400 text-right">US Pelvis</div>
                  <div className="flex items-center justify-end gap-1.5 text-xs text-slate-500">
                    Order: <span className="text-slate-300">Routine</span>
                  </div>
                </div>
                
                {/* Pending Card 2 */}
                <div className="bg-[#0f1522] border border-amber-500/30 rounded-md p-3 h-[100px] flex flex-col justify-between opacity-90">
                  <div className="flex justify-between items-start">
                    <div className="bg-slate-500/20 text-slate-400 border border-slate-500/30 text-[10px] font-bold px-1.5 py-0.5 rounded">XR</div>
                    <div className="text-right">
                      <div className="font-medium text-slate-200 text-sm">Lima, Beatriz</div>
                      <div className="text-xs text-slate-500 mt-0.5">Acc: ACC5516073 • ER</div>
                    </div>
                  </div>
                  <div className="text-xs text-slate-400 text-right">XR Torax</div>
                  <div className="flex items-center justify-end gap-1.5 text-xs text-amber-400 font-medium">
                    Order: <span className="text-amber-400">Urgent</span>
                  </div>
                </div>
              </div>
            </div>

            {/* RECENT BAND */}
            <div className="bg-blue-950/10 border-r-2 border-cyan-500/30 pb-4 pt-2">
              <div className="flex items-center justify-end gap-2 px-4 py-2 text-xs font-bold text-cyan-500/80 uppercase tracking-wider">
                Recente (1)
                <Activity className="w-3.5 h-3.5" />
              </div>
              <div className="px-3 flex flex-col gap-3">
                {/* Recent Card */}
                <div className="bg-[#0f1522] border border-blue-500/30 rounded-md p-3 h-[96px] flex flex-col justify-between opacity-90">
                  <div className="flex justify-between items-start">
                    <div className="bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-[10px] font-bold px-1.5 py-0.5 rounded">CT</div>
                    <div className="text-right">
                      <div className="font-medium text-slate-200 text-sm">Souza, Rafael</div>
                      <div className="text-xs text-slate-500 mt-0.5">Acc: ACC4405964 • Outpatient</div>
                    </div>
                  </div>
                  <div className="text-xs text-slate-400 text-right">CT Torax</div>
                  <div className="flex items-center justify-end gap-1.5 text-xs text-slate-500">
                    Order: <span className="text-slate-300">Routine</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* DONE BAND */}
            <div className="pb-4 pt-2 opacity-60">
              <div className="flex items-center justify-end gap-2 px-4 py-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
                Vinculado (2)
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
              <div className="px-3 flex flex-col gap-2">
                {/* Done Card 1 */}
                <div className="bg-[#0f1522] border border-slate-800 rounded-md px-3 h-[44px] flex items-center justify-between">
                  <div className="text-[10px] text-slate-500 font-medium">Acc: ACC3394855</div>
                  <div className="flex items-center gap-3">
                    <span className="font-medium text-slate-400 text-sm line-through decoration-slate-600">Silva, Maria J.</span>
                  </div>
                </div>
                {/* Done Card 2 */}
                <div className="bg-[#0f1522] border border-slate-800 rounded-md px-3 h-[44px] flex items-center justify-between">
                  <div className="text-[10px] text-slate-500 font-medium">Acc: ACC2283744</div>
                  <div className="flex items-center gap-3">
                    <span className="font-medium text-slate-400 text-sm line-through decoration-slate-600">Chen, David</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="h-8 bg-[#0a0f18] border-t border-slate-800 flex items-center justify-between px-4 text-[10px] text-slate-500 shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
            <span>Sistema Saudável</span>
          </div>
          <span>Última sincronização: Agora</span>
        </div>
        <div className="flex items-center gap-4">
          <span>Auto-match ativo</span>
          <span>v2.4.1</span>
        </div>
      </footer>
    </div>
  );
}
