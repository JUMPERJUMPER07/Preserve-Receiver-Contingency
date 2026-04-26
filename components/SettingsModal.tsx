
import React, { useState, useEffect, useRef } from 'react';
import { AppSettings } from '../types';
import { X, Server, Save, Activity, Database, Settings, ShieldCheck, Zap, Network, AlertTriangle, CheckCircle2, RefreshCcw, Wifi } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onSave: (newSettings: AppSettings) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSave,
}) => {
  const [localSettings, setLocalSettings] = useState<AppSettings>(settings);
  const [activeTab, setActiveTab] = useState<'pacs' | 'ris' | 'workflow'>('pacs');
  const [isTestingRis, setIsTestingRis] = useState(false);
  const [risConnectionStatus, setRisConnectionStatus] = useState<'idle' | 'success' | 'failed'>('idle');
  const timeoutRef = useRef<number | null>(null);

  // Reset state when opening
  useEffect(() => {
    if (isOpen) {
        setLocalSettings(settings);
        setRisConnectionStatus('idle');
    }
  }, [isOpen, settings]);

  useEffect(() => {
    return () => {
        if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    }
  }, []);

  if (!isOpen) return null;

  // --- Validation Helpers ---
  const isValidPort = (port: number) => port > 0 && port <= 65535;
  const isValidAETitle = (ae: string) => /^[A-Z0-9_]{1,16}$/.test(ae); // DICOM Standard: Max 16 chars, Uppercase, alphanumeric + underscore
  const isValidHost = (host: string) => host.length > 0 && !/\s/.test(host);

  const hasErrors = () => {
     if (!isValidAETitle(localSettings.pacs.aeTitle)) return true;
     if (!isValidPort(localSettings.pacs.port)) return true;
     
     if (localSettings.ris.enabled) {
         if (!isValidHost(localSettings.ris.host)) return true;
         if (!isValidPort(localSettings.ris.port)) return true;
         if (!isValidAETitle(localSettings.ris.aeTitle)) return true;
     }
     return false;
  };

  const handleSave = () => {
    if (!hasErrors()) {
        onSave(localSettings);
        onClose();
    }
  };

  const handleTestRisConnection = () => {
     if (hasErrors()) return;
     setIsTestingRis(true);
     setRisConnectionStatus('idle');
     if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
     
     // Simulate C-ECHO
     setTimeout(() => {
         setIsTestingRis(false);
         // Simulate success mostly, 10% fail chance for demo
         setRisConnectionStatus(Math.random() > 0.1 ? 'success' : 'failed');

         timeoutRef.current = window.setTimeout(() => {
             setRisConnectionStatus('idle');
         }, 3000);
     }, 1500);
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-3xl bg-[#0b1121] border border-slate-700 rounded-xl shadow-2xl flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200 overflow-hidden ring-1 ring-white/10">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-950">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg flex items-center justify-center border border-slate-700 shadow-inner">
              <Settings size={20} className="text-slate-200" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Administração do Sistema</h2>
              <p className="text-slate-400 text-xs font-mono mt-0.5">DICOM Network & Workflow Configuration</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-800/80 rounded-lg text-slate-500 hover:text-white transition-all active:scale-[0.95] hover:shadow-[0_2px_10px_rgba(255,255,255,0.05)]"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-900/50">
          {[
            { id: 'pacs', label: 'PACS Listener', icon: Server, color: 'cyan' },
            { id: 'ris', label: 'RIS Integration', icon: Database, color: 'indigo' },
            { id: 'workflow', label: 'Workflow Rules', icon: Zap, color: 'emerald' },
          ].map((tab) => (
             <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`
                  flex-1 py-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-all flex items-center justify-center gap-2
                  ${activeTab === tab.id 
                    ? `border-${tab.color}-500 text-${tab.color}-400 bg-${tab.color}-500/5` 
                    : 'border-transparent text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'}
                `}
              >
                <tab.icon size={16} />
                {tab.label}
              </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto bg-[#0b1121]">
          
          {activeTab === 'pacs' && (
            <div className="space-y-6 animate-in slide-in-from-left-2 duration-300">
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                 {/* Identity Section */}
                 <div className="bg-slate-900/50 p-5 rounded-xl border border-slate-800 relative group">
                    <div className="absolute top-0 left-0 w-1 h-full bg-cyan-500 rounded-l-xl"></div>
                    <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                       <Activity size={16} className="text-cyan-500" /> Identidade DICOM (Local)
                    </h3>
                    
                    <div className="space-y-4">
                        <InputGroup 
                           label="AE Title (Application Entity)"
                           value={localSettings.pacs.aeTitle}
                           onChange={(v) => setLocalSettings({...localSettings, pacs: {...localSettings.pacs, aeTitle: v.toUpperCase().trim()}})}
                           placeholder="PRESERVER_SCP"
                           helperText="Identificador único deste receptor na rede DICOM (Max 16 chars)."
                           isValid={isValidAETitle(localSettings.pacs.aeTitle)}
                           errorMessage="Formato inválido (A-Z, 0-9, _)"
                        />
                        
                        <div className="p-3 bg-cyan-950/20 border border-cyan-900/50 rounded-lg flex gap-3 items-start">
                            <Network size={16} className="text-cyan-400 mt-0.5 shrink-0" />
                            <div className="space-y-1">
                                <span className="text-xs font-bold text-cyan-200 block">Endereço de Rede</span>
                                <div className="font-mono text-xs text-slate-400 bg-slate-950 p-1.5 rounded border border-slate-800">
                                   IP: 0.0.0.0 (All Interfaces)
                                </div>
                            </div>
                        </div>
                    </div>
                 </div>

                 {/* Connection Section */}
                 <div className="bg-slate-900/50 p-5 rounded-xl border border-slate-800">
                    <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                       <Server size={16} className="text-slate-400" /> Parâmetros de Escuta
                    </h3>

                    <div className="space-y-4">
                        <InputGroup 
                           label="Porta TCP"
                           value={localSettings.pacs.port}
                           type="number"
                           onChange={(v) => setLocalSettings({...localSettings, pacs: {...localSettings.pacs, port: parseInt(v) || 0}})}
                           placeholder="104"
                           helperText="Porta padrão DICOM: 104 ou 11112."
                           isValid={isValidPort(localSettings.pacs.port)}
                           errorMessage="Porta inválida (1-65535)"
                        />

                         <div className="pt-2">
                           <label className="text-[10px] uppercase font-bold text-slate-500 mb-1.5 block">WebSocket Gateway</label>
                           <div className="flex">
                              <span className="inline-flex items-center px-3 text-xs text-slate-400 bg-slate-950 border border-r-0 border-slate-700 rounded-l-md font-mono">
                                ws://
                              </span>
                              <input 
                                type="text"
                                value={localSettings.pacs.wsUrl.replace('ws://', '')}
                                onChange={(e) => setLocalSettings({...localSettings, pacs: {...localSettings.pacs, wsUrl: `ws://${e.target.value}`}})}
                                className="flex-1 min-w-0 block w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-r-md text-xs text-cyan-300 font-mono focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 focus:outline-none transition-all"
                              />
                           </div>
                           <p className="mt-1 text-[10px] text-slate-500">Endpoint para stream de dados em tempo real.</p>
                        </div>
                    </div>
                 </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-amber-500/5 border border-amber-500/20 rounded-lg text-xs">
                 <ShieldCheck size={16} className="text-amber-500 shrink-0 mt-0.5" />
                 <div className="text-slate-400">
                   <strong className="text-amber-400 block mb-0.5">Requisito de Segurança</strong>
                   Alterações no <strong>AE Title</strong> ou <strong>Porta</strong> exigem reinicialização do serviço de backend para revalidar as regras de firewall e bind de portas.
                 </div>
              </div>
            </div>
          )}

          {activeTab === 'ris' && (
            <div className="space-y-6 animate-in slide-in-from-right-2 duration-300">
                
                {/* Master Toggle */}
                <div className="flex items-center justify-between p-4 bg-slate-900 border border-slate-800 rounded-xl">
                   <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${localSettings.ris.enabled ? 'bg-indigo-500/20 text-indigo-400' : 'bg-slate-800 text-slate-600'}`}>
                         <Database size={20} />
                      </div>
                      <div>
                         <h3 className="text-sm font-bold text-white">Integração Modality Worklist</h3>
                         <p className="text-xs text-slate-400">Consultar agendamentos em servidor RIS externo</p>
                      </div>
                   </div>
                   <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={localSettings.ris.enabled}
                        onChange={(e) => setLocalSettings({...localSettings, ris: {...localSettings.ris, enabled: e.target.checked}})}
                        className="sr-only peer" 
                      />
                      <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                   </label>
                </div>

                <div className={`space-y-6 transition-all duration-300 ${!localSettings.ris.enabled ? 'opacity-40 pointer-events-none grayscale' : ''}`}>
                    
                    {/* Connection Details */}
                    <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-800 relative">
                       <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500 rounded-l-xl"></div>
                       <h3 className="text-sm font-bold text-white mb-6 flex items-center justify-between">
                          <span className="flex items-center gap-2"><Network size={16} className="text-indigo-400"/> Servidor Remoto (Provider)</span>
                          {risConnectionStatus === 'success' && <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1"><CheckCircle2 size={12}/> ONLINE</span>}
                          {risConnectionStatus === 'failed' && <span className="text-[10px] text-red-400 font-bold flex items-center gap-1"><AlertTriangle size={12}/> OFFLINE</span>}
                       </h3>

                       <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                           <div className="md:col-span-8">
                               <InputGroup 
                                  label="Hostname / IP Address"
                                  value={localSettings.ris.host}
                                  onChange={(v) => setLocalSettings({...localSettings, ris: {...localSettings.ris, host: v}})}
                                  placeholder="192.168.1.50"
                                  isValid={isValidHost(localSettings.ris.host)}
                               />
                           </div>
                           <div className="md:col-span-4">
                               <InputGroup 
                                  label="Porta"
                                  type="number"
                                  value={localSettings.ris.port}
                                  onChange={(v) => setLocalSettings({...localSettings, ris: {...localSettings.ris, port: parseInt(v) || 0}})}
                                  placeholder="104"
                                  isValid={isValidPort(localSettings.ris.port)}
                               />
                           </div>
                           <div className="md:col-span-6">
                               <InputGroup 
                                  label="Called AE Title (Servidor)"
                                  value={localSettings.ris.aeTitle}
                                  onChange={(v) => setLocalSettings({...localSettings, ris: {...localSettings.ris, aeTitle: v.toUpperCase().trim()}})}
                                  placeholder="RIS_SERVER"
                                  isValid={isValidAETitle(localSettings.ris.aeTitle)}
                               />
                           </div>
                           <div className="md:col-span-6">
                               <InputGroup 
                                  label="Polling Interval (Segundos)"
                                  type="number"
                                  value={localSettings.ris.pollingInterval}
                                  onChange={(v) => setLocalSettings({...localSettings, ris: {...localSettings.ris, pollingInterval: parseInt(v) || 30}})}
                                  placeholder="30"
                                  isValid={localSettings.ris.pollingInterval >= 5}
                                  helperText="Mínimo de 5 segundos."
                               />
                           </div>
                       </div>
                       
                       <div className="mt-6 flex justify-end border-t border-slate-800 pt-4">
                          <button 
                            type="button"
                            onClick={handleTestRisConnection}
                            disabled={isTestingRis || hasErrors()}
                            className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 hover:bg-slate-700/80 text-slate-200 text-xs font-bold rounded-lg border border-slate-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] hover:shadow-[0_4px_16px_rgba(255,255,255,0.05)]"
                          >
                            {isTestingRis ? <RefreshCcw size={14} className="animate-spin text-indigo-400" /> : <Wifi size={14} />}
                            {isTestingRis ? 'Testando Conexão...' : 'Testar Conectividade C-ECHO'}
                          </button>
                       </div>
                    </div>
                </div>
            </div>
          )}

          {activeTab === 'workflow' && (
            <div className="space-y-6 animate-in slide-in-from-right-2 duration-300">
               <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-800 relative">
                 <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500 rounded-l-xl"></div>
                 <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                    <Zap size={16} className="text-emerald-500" />
                    Automação e Comportamento
                  </h3>

                  <div className="space-y-4">
                      <div className="flex items-start justify-between p-4 rounded-lg bg-[#0b1121] border border-slate-800 hover:border-slate-700 transition-colors">
                        <div className="flex gap-3">
                           <div className="mt-1 p-1 bg-emerald-500/10 rounded">
                              <CheckCircle2 size={16} className="text-emerald-500" />
                           </div>
                           <div>
                             <span className="text-sm font-bold text-slate-200 block">Ocultar estudos após vínculo</span>
                             <span className="text-xs text-slate-500 block mt-1 leading-relaxed max-w-md">
                               Remove automaticamente o estudo da lista "PACS Received" assim que o usuário confirmar o vínculo com um item da Worklist, mantendo a lista limpa.
                             </span>
                           </div>
                        </div>
                         <label className="relative inline-flex items-center cursor-pointer mt-1">
                          <input 
                            type="checkbox" 
                            checked={localSettings.workflow?.autoHideLinked}
                            onChange={(e) => setLocalSettings({
                              ...localSettings, 
                              workflow: { ...localSettings.workflow, autoHideLinked: e.target.checked }
                            })}
                            className="sr-only peer" 
                          />
                          <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                        </label>
                      </div>
                  </div>
               </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-5 border-t border-slate-800 bg-slate-950 flex justify-between items-center z-10">
          <div className="flex items-center gap-2 text-[10px] text-slate-600 font-mono">
             <div className={`w-2 h-2 rounded-full ${hasErrors() ? 'bg-red-500' : 'bg-emerald-500'}`}></div>
             {hasErrors() ? 'CONFIGURATION INVALID' : 'SYSTEM READY'}
          </div>
          <div className="flex gap-3">
            <button 
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800/80 rounded-lg transition-all active:scale-[0.95] hover:shadow-[0_2px_10px_rgba(255,255,255,0.05)] border border-transparent hover:border-slate-700/50"
            >
              CANCELAR
            </button>
            <button 
              onClick={handleSave}
              disabled={hasErrors()}
              className="px-6 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 border border-white/10 text-white disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-br from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 shadow-[0_4px_16px_rgba(6,182,212,0.3)] hover:shadow-[0_8px_24px_rgba(6,182,212,0.4)] disabled:shadow-none active:scale-[0.98]"
            >
              <Save size={14} />
              SALVAR PARÂMETROS
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Reusable Input Component ---
interface InputGroupProps {
    label: string;
    value: string | number;
    onChange: (val: any) => void;
    type?: 'text' | 'number';
    placeholder?: string;
    helperText?: string;
    isValid?: boolean;
    errorMessage?: string;
}

const InputGroup: React.FC<InputGroupProps> = ({ 
    label, value, onChange, type = 'text', placeholder, helperText, isValid = true, errorMessage 
}) => {
    return (
        <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-bold text-slate-500 ml-0.5">{label}</label>
            <div className="relative">
                <input 
                    type={type}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    className={`
                        w-full bg-[#0b1121] border text-xs text-white rounded-lg px-3 py-2.5 outline-none transition-all font-mono
                        ${isValid 
                            ? 'border-slate-700 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50' 
                            : 'border-red-500/50 focus:border-red-500 focus:ring-1 focus:ring-red-500/50 text-red-100'}
                    `}
                />
                {!isValid && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500">
                        <AlertTriangle size={14} />
                    </div>
                )}
            </div>
            {(!isValid && errorMessage) ? (
                <p className="text-[10px] text-red-400 animate-pulse ml-0.5">{errorMessage}</p>
            ) : helperText && (
                <p className="text-[10px] text-slate-600 ml-0.5">{helperText}</p>
            )}
        </div>
    );
};
