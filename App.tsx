import React, { useState, useEffect, useCallback, useRef } from "react";
import { Header } from "./components/Header";
import { StudyDetails } from "./components/StudyDetails";
import { LinkConfirmationModal } from "./components/LinkConfirmationModal";
import { SettingsModal } from "./components/SettingsModal";
import { Login } from "./components/Login";
import { IntroSplash } from "./components/IntroSplash";
import { ToastContainer, ToastMessage } from "./components/Toast";
import { ConnectionStatus, DicomStudy, WorklistItem, AppSettings, NetworkState } from "./types";
import { MOCK_RECEIVED, MOCK_WORKLIST } from "./constants";
import { useLocalStorage } from "./hooks/useLocalStorage";
import { useSound } from "./hooks/useSound";
import { Activity, Link2, AlertTriangle, ArrowRight, X, Radio, Layers } from "lucide-react";
import { MatchAlignedLayout } from "./components/MatchAlignedLayout";

const generateId = () => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    try { return crypto.randomUUID(); } catch {}
  }
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

const DEFAULT_SETTINGS: AppSettings = {
  pacs: { aeTitle: "PRESERVER_SCP", port: 104, wsUrl: "ws://localhost:8080/dicom-receiver" },
  ris:  { enabled: true, aeTitle: "RIS_SERVER", host: "192.168.1.10", port: 104, pollingInterval: 30 },
  workflow: { autoHideLinked: false },
};

const App: React.FC = () => {
  const [showSplash, setShowSplash] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState("");
  const [currentDrt, setCurrentDrt] = useState("");

  // Persisted state
  const [appSettings, setAppSettings] = useLocalStorage<AppSettings>("prc_settings", DEFAULT_SETTINGS);
  const [studies, setStudies]         = useLocalStorage<DicomStudy[]>("prc_studies_v2", MOCK_RECEIVED);
  const [worklist, setWorklist]       = useLocalStorage<WorklistItem[]>("prc_worklist_v2", MOCK_WORKLIST);

  // Sound (enabled by default)
  const [soundEnabled] = useLocalStorage<boolean>("prc_sound", true);
  const { play: playSound } = useSound(soundEnabled);

  // Network Monitor (Phase 2)
  const [networkStatus, setNetworkStatus] = useState<{ pacs: NetworkState; ris: NetworkState }>({
    pacs: 'online',
    ris: 'online'
  });

  // Mobile tab
  const [mobileTab, setMobileTab] = useState<"pacs" | "ris">("pacs");

  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>(ConnectionStatus.DISCONNECTED);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [selectedStudy, setSelectedStudy] = useState<DicomStudy | null>(null);
  const [selectedWorklist, setSelectedWorklist] = useState<WorklistItem | null>(null);
  const [draggedStudy, setDraggedStudy] = useState<DicomStudy | null>(null);
  const [previewStudy, setPreviewStudy] = useState<DicomStudy | null>(null);
  const [showLinkConfirmation, setShowLinkConfirmation] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);
  const retryCountRef = useRef<number>(0);

  const addToast = (message: string, type: "success" | "error" | "info") => {
    const id = generateId();
    setToasts(prev => [...prev, { id, message, type }]);
  };
  const removeToast = (id: string) => setToasts(prev => prev.filter(t => t.id !== id));

  const generateMockRisItem = useCallback((): WorklistItem => {
    const procedures = ["CT Head", "MR Knee", "US Abdomen", "XR Chest", "CT Spine", "DX Forearm"];
    const firstNames = ["Carlos", "Maria", "Jose", "Ana", "Paulo", "Julia", "Lucas", "Beatriz"];
    const lastNames  = ["Silva", "Santos", "Oliveira", "Souza", "Rodrigues", "Almeida"];
    const randProc = procedures[Math.floor(Math.random() * procedures.length)];
    const randMod  = randProc.split(" ")[0];
    const randName = `${lastNames[Math.floor(Math.random() * lastNames.length)]}, ${firstNames[Math.floor(Math.random() * firstNames.length)]}`;
    return {
      id: generateId(),
      patientName: randName,
      patientId: `P-${Math.floor(Math.random() * 99999)}`,
      birthDate: `${Math.floor(Math.random() * 28) + 1}/${Math.floor(Math.random() * 12) + 1}/${1960 + Math.floor(Math.random() * 40)}`,
      modality: randMod,
      scheduledTime: new Date().toISOString().slice(0, 16).replace("T", " "),
      accessionNumber: `RIS-${Math.floor(Math.random() * 100000)}`,
      procedure: randProc,
      status: "scheduled",
    };
  }, []);

  const handleRisRefresh = useCallback(() => {
    if (!isAuthenticated || !appSettings.ris.enabled) { addToast("Integração RIS desativada.", "error"); return; }
    addToast("Sincronizando com servidor RIS...", "info");
    setTimeout(() => {
      const newItem = generateMockRisItem();
      setWorklist(prev => [newItem, ...prev]);
      addToast("Sincronização concluída. 1 novo agendamento encontrado.", "success");
    }, 1200);
  }, [isAuthenticated, appSettings.ris.enabled, generateMockRisItem]);

  // WebSocket
  useEffect(() => {
    if (!isAuthenticated) return;
    retryCountRef.current = 0;

    const connect = () => {
      if (socketRef.current?.readyState === WebSocket.OPEN ||
          socketRef.current?.readyState === WebSocket.CONNECTING) return;

      setConnectionStatus(ConnectionStatus.CONNECTING);
      try {
        const ws = new WebSocket(appSettings.pacs.wsUrl);
        socketRef.current = ws;

        ws.onopen = () => {
          setConnectionStatus(ConnectionStatus.CONNECTED);
          addToast("Conectado ao servidor PACS com sucesso", "success");
          retryCountRef.current = 0;
          if (reconnectTimeoutRef.current) { window.clearTimeout(reconnectTimeoutRef.current); reconnectTimeoutRef.current = null; }
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            const newStudy: DicomStudy = {
              id: generateId(),
              patientName: data.patientName || data.PatientName || "Unknown",
              patientId: data.patientId || data.PatientID || "N/A",
              birthDate: data.birthDate || data.PatientBirthDate || "N/A",
              modality: data.modality || data.Modality || "OT",
              studyDate: data.studyDate || new Date().toISOString().split("T")[0],
              accessionNumber: data.accessionNumber || data.AccessionNumber || "N/A",
              description: data.description || data.StudyDescription || "",
              studyInstanceUID: data.studyInstanceUID || data.StudyInstanceUID || "",
              receivedAt: new Date().toLocaleTimeString(),
              status: "received",
            };
            setStudies(prev => [newStudy, ...prev]);
            addToast(`Novo estudo recebido: ${newStudy.patientName}`, "info");
            playSound("receive");
          } catch { }
        };

        ws.onerror = () => setConnectionStatus(ConnectionStatus.ERROR);
        ws.onclose = () => {
          setConnectionStatus(ConnectionStatus.DISCONNECTED);
          socketRef.current = null;
          const delay = Math.min(30000, 1000 * Math.pow(2, retryCountRef.current));
          retryCountRef.current += 1;
          reconnectTimeoutRef.current = window.setTimeout(connect, delay);
        };
      } catch {
        setConnectionStatus(ConnectionStatus.ERROR);
        const delay = Math.min(30000, 1000 * Math.pow(2, retryCountRef.current));
        retryCountRef.current += 1;
        reconnectTimeoutRef.current = window.setTimeout(connect, delay);
      }
    };

    connect();
    return () => {
      if (socketRef.current) { socketRef.current.onclose = null; socketRef.current.close(); socketRef.current = null; }
      if (reconnectTimeoutRef.current) window.clearTimeout(reconnectTimeoutRef.current);
    };
  }, [appSettings.pacs.wsUrl, isAuthenticated]);

  // Demo PACS simulation
  useEffect(() => {
    let interval: number;
    if (connectionStatus === ConnectionStatus.CONNECTED && isAuthenticated) {
      interval = window.setInterval(() => {
        if (Math.random() > 0.95) {
          const modalities = ["CT", "MR", "DX", "US"];
          const names = ["Souza, Joao", "Lima, Pedro", "Gomes, Ana", "Ferreira, Clara"];
          const randMod  = modalities[Math.floor(Math.random() * modalities.length)];
          const randName = names[Math.floor(Math.random() * names.length)];
          const simulatedStudy: DicomStudy = {
            id: generateId(),
            patientName: randName,
            patientId: `P-${Math.floor(Math.random() * 10000)}`,
            birthDate: "01/01/1985",
            modality: randMod,
            studyDate: new Date().toISOString().split("T")[0],
            accessionNumber: `ACC-2026-${Math.floor(Math.random() * 999)}`,
            description: `${randMod} Exam Routine`,
            studyInstanceUID: `1.2.3.4.5.${Date.now()}`,
            receivedAt: new Date().toLocaleTimeString(),
            status: "received",
          };
          setStudies(prev => [simulatedStudy, ...prev]);
          addToast(`Estudo recebido: ${simulatedStudy.patientName} (${simulatedStudy.modality})`, "info");
          playSound("receive");
        }
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [connectionStatus, isAuthenticated]);

  // Network Monitor Simulation (Phase 2)
  useEffect(() => {
    if (!isAuthenticated) return;
    
    const interval = setInterval(() => {
      // 5% chance of network drop
      if (Math.random() > 0.95 && networkStatus.pacs === 'online') {
        setNetworkStatus({ pacs: 'offline', ris: 'offline' });
        addToast("ALERTA: Conexão com servidores externos perdida (MODO CONTINGÊNCIA)", "error");
        playSound("error");
      } 
      // If offline, 30% chance of recovery (Simulating Phase 2)
      else if (networkStatus.pacs === 'offline' && Math.random() > 0.7) {
        setNetworkStatus({ pacs: 'online', ris: 'online' });
        addToast("REDE RESTABELECIDA: Detectando servidores disponíveis...", "success");
        // Trigger Phase 2: Auto-refresh RIS when network returns
        setTimeout(handleRisRefresh, 1000);
      }
      // 10% chance of latency/degraded
      else if (networkStatus.pacs === 'online' && Math.random() > 0.9) {
        setNetworkStatus(prev => ({ ...prev, pacs: 'degraded' }));
        setTimeout(() => setNetworkStatus(prev => ({ ...prev, pacs: 'online' })), 3000);
      }
    }, 15000); // Check every 15s

    return () => clearInterval(interval);
  }, [isAuthenticated, networkStatus.pacs, handleRisRefresh]);

  // Demo RIS polling (only if network is online)
  useEffect(() => {
    if (!isAuthenticated || !appSettings.ris.enabled || networkStatus.ris !== 'online') return;
    const pollInterval = Math.max(5000, (appSettings.ris.pollingInterval || 30) * 1000);
    const interval = setInterval(() => {
      if (Math.random() > 0.6) {
        const newItem = generateMockRisItem();
        setWorklist(prev => [newItem, ...prev]);
        addToast(`RIS: Lista atualizada (${newItem.patientName})`, "info");
      }
    }, pollInterval);
    return () => clearInterval(interval);
  }, [isAuthenticated, appSettings.ris.enabled, appSettings.ris.pollingInterval, generateMockRisItem, networkStatus.ris]);

  const namesMatch       = selectedStudy && selectedWorklist ? selectedStudy.patientName.toLowerCase().replace(/[^a-z0-9]/g, "") === selectedWorklist.patientName.toLowerCase().replace(/[^a-z0-9]/g, "") : false;
  const birthDatesMatch  = selectedStudy && selectedWorklist ? selectedStudy.birthDate === selectedWorklist.birthDate : false;
  const idMatch          = selectedStudy && selectedWorklist ? selectedStudy.patientId.trim() === selectedWorklist.patientId.trim() : false;
  const hasDiscrepancy   = !namesMatch || !birthDatesMatch || !idMatch;

  const handleLinkClick        = useCallback(() => { if (!selectedStudy || !selectedWorklist) return; setShowLinkConfirmation(true); }, [selectedStudy, selectedWorklist]);
  const handleCancelSelection  = useCallback(() => { setSelectedStudy(null); setSelectedWorklist(null); }, []);
  const handleDropStudy        = useCallback((study: DicomStudy, worklistItem: WorklistItem) => { setSelectedStudy(study); setSelectedWorklist(worklistItem); setShowLinkConfirmation(true); setDraggedStudy(null); }, []);

  const handleConfirmLink = useCallback(() => {
    if (!selectedStudy || !selectedWorklist) return;
    setWorklist(prev => prev.map(item =>
      item.id === selectedWorklist.id ? { ...item, status: "completed", studyInstanceUID: selectedStudy.studyInstanceUID } : item
    ));
    if (appSettings.workflow.autoHideLinked) setStudies(prev => prev.filter(s => s.id !== selectedStudy.id));
    addToast(`Vínculo confirmado: ${selectedStudy.patientName} → ${selectedWorklist.accessionNumber}`, "success");
    setShowLinkConfirmation(false);
    setSelectedStudy(null);
    setSelectedWorklist(null);
  }, [selectedStudy, selectedWorklist, appSettings.workflow.autoHideLinked]);

  const handleSaveSettings = (newSettings: AppSettings) => {
    setAppSettings(newSettings);
    addToast("Configurações salvas com sucesso", "success");
  };

  const handleLogin  = (user: string, drt: string) => { setCurrentUser(user); setCurrentDrt(drt); setIsAuthenticated(true); addToast("Login realizado com sucesso", "success"); };
  const handleLogout = () => { setIsAuthenticated(false); setCurrentUser(""); setCurrentDrt(""); setConnectionStatus(ConnectionStatus.DISCONNECTED); if (socketRef.current) socketRef.current.close(); };

  if (showSplash) return <IntroSplash onComplete={() => setShowSplash(false)} />;
  if (!isAuthenticated) return (
    <>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <Login onLogin={handleLogin} />
    </>
  );

  return (
    <div
      className="min-h-screen flex flex-col relative bg-[#020617] text-slate-200"
      onDragOver={(e) => e.preventDefault()}
      onDragEnd={() => setDraggedStudy(null)}
    >
      {/* Background grid */}
      <div className="absolute inset-0 z-0 pointer-events-none"
        style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg,rgba(255,255,255,0.03) 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900/20 via-slate-950/80 to-slate-950 pointer-events-none z-0" />

      <ToastContainer toasts={toasts} removeToast={removeToast} />

      <div className="relative z-10 flex flex-col h-screen overflow-hidden p-3 md:p-6 gap-4 max-w-[1920px] mx-auto w-full pb-20 lg:pb-6">
        <Header
          userDrt={currentDrt || currentUser}
          onOpenSettings={() => setShowSettings(true)}
          onLogout={handleLogout}
          onRefresh={handleRisRefresh}
          networkStatus={networkStatus}
        />

        {/* Match-Aligned three-column layout */}
        <MatchAlignedLayout
          studies={studies}
          worklist={worklist}
          selectedStudy={selectedStudy}
          selectedWorklist={selectedWorklist}
          onSelectStudy={setSelectedStudy}
          onSelectWorklist={setSelectedWorklist}
          onSelectPair={(study, item) => {
            setSelectedStudy(study);
            setSelectedWorklist(item);
            setShowLinkConfirmation(true);
          }}
          onDetails={setPreviewStudy}
          draggedStudy={draggedStudy}
          onDragStart={setDraggedStudy}
          onDropStudy={handleDropStudy}
          mobileTab={mobileTab}
        />
      </div>

      {/* Mobile Tab Bar */}
      <div className="mobile-tab-bar">
        <button className={`mobile-tab-btn ${mobileTab === "pacs" ? "active" : ""}`} onClick={() => setMobileTab("pacs")}>
          <Radio size={18} />
          PACS
          <span className="text-[8px] font-mono bg-slate-800 px-1.5 rounded-full">{studies.length}</span>
        </button>
        <button className={`mobile-tab-btn ${mobileTab === "ris" ? "active" : ""}`} onClick={() => setMobileTab("ris")}>
          <Layers size={18} />
          RIS
          <span className="text-[8px] font-mono bg-slate-800 px-1.5 rounded-full">{worklist.length}</span>
        </button>
      </div>

      {/* Floating Link Bar */}
      {selectedStudy && selectedWorklist && !showLinkConfirmation && !draggedStudy && (
        <div className="fixed bottom-20 lg:bottom-12 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-4 fade-in duration-300 w-[90%] max-w-2xl">
          <div className="bg-slate-900/90 backdrop-blur-xl border border-white/10 p-1.5 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.5)] flex items-stretch justify-between relative overflow-hidden ring-1 ring-black/50">
            <div className="flex flex-1 items-center gap-4 px-4 py-2">
              <div className="flex flex-col items-end flex-1 min-w-0">
                <div className="text-[10px] font-bold text-cyan-500 uppercase tracking-wider mb-0.5">PACS</div>
                <div className="text-sm font-bold text-white truncate w-full text-right">{selectedStudy.patientName}</div>
                <div className="text-[10px] text-slate-400 font-mono">{selectedStudy.patientId}</div>
              </div>
              <div className="flex items-center justify-center px-2">
                <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400">
                  <ArrowRight size={14} />
                </div>
              </div>
              <div className="flex flex-col items-start flex-1 min-w-0">
                <div className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider mb-0.5">RIS</div>
                <div className="text-sm font-bold text-white truncate w-full">{selectedWorklist.patientName}</div>
                <div className="text-[10px] text-slate-400 font-mono">{selectedWorklist.accessionNumber}</div>
              </div>
            </div>
            <div className="flex items-center gap-2 pl-2 border-l border-white/5">
              <button onClick={handleCancelSelection}
                className="p-3 h-full aspect-square flex items-center justify-center rounded-xl bg-slate-800/50 hover:bg-slate-800/80 text-slate-400 hover:text-red-400 transition-all border border-transparent hover:border-slate-700 active:scale-[0.95]"
                title="Cancelar Seleção">
                <X size={20} />
              </button>
              <button onClick={handleLinkClick}
                className={`px-6 h-full rounded-xl font-bold text-sm transition-all flex items-center gap-2 active:scale-[0.98] border border-white/10
                  ${hasDiscrepancy
                    ? "bg-gradient-to-br from-red-500 to-red-600 hover:from-red-400 hover:to-red-500 text-white shadow-[0_4px_16px_rgba(239,68,68,0.3)]"
                    : "bg-gradient-to-br from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white shadow-[0_4px_16px_rgba(6,182,212,0.3)]"}`}>
                <Link2 size={16} />
                <span>Vincular</span>
                {hasDiscrepancy && <AlertTriangle size={14} className="animate-pulse" />}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      {showLinkConfirmation && selectedStudy && selectedWorklist && (
        <LinkConfirmationModal
          study={selectedStudy}
          worklistItem={selectedWorklist}
          onConfirm={handleConfirmLink}
          onCancel={() => setShowLinkConfirmation(false)}
        />
      )}

      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        settings={appSettings}
        onSave={handleSaveSettings}
      />

      {previewStudy && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-2xl h-[80vh] md:h-auto md:max-h-[85vh] animate-in zoom-in-95 duration-200">
            <StudyDetails study={previewStudy} onClose={() => setPreviewStudy(null)} />
          </div>
        </div>
      )}

      {/* Footer status */}
      <div className="fixed bottom-[4.5rem] lg:bottom-3 right-4 z-40 group">
        <div className={`bg-slate-900/90 backdrop-blur border px-3 py-1.5 rounded-full shadow-lg text-[10px] font-medium font-mono flex items-center gap-2 transition-colors
          ${connectionStatus === ConnectionStatus.ERROR ? "border-red-500/50 text-red-400 bg-red-950/20" : "border-slate-800 text-slate-400 group-hover:text-slate-200 group-hover:border-slate-700"}`}>
          <div className="relative flex h-2 w-2">
            {connectionStatus === ConnectionStatus.CONNECTED && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            )}
            <span className={`relative inline-flex rounded-full h-2 w-2
              ${connectionStatus === ConnectionStatus.CONNECTED ? "bg-emerald-500" : connectionStatus === ConnectionStatus.ERROR ? "bg-red-500" : "bg-slate-600"}`} />
          </div>
          {connectionStatus === ConnectionStatus.CONNECTED ? `CONNECTED: ${appSettings.pacs.aeTitle}` : connectionStatus === ConnectionStatus.ERROR ? "CONNECTION FAILED" : "DISCONNECTED"}
        </div>
      </div>
    </div>
  );
};

export default App;
