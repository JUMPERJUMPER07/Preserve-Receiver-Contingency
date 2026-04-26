import React, { useState, useEffect, useCallback, useRef } from "react";
import { Header } from "./components/Header";
import { StudyList } from "./components/StudyList";
import { RisWorklist } from "./components/RisWorklist";
import { StudyDetails } from "./components/StudyDetails";
import { LinkConfirmationModal } from "./components/LinkConfirmationModal";
import { SettingsModal } from "./components/SettingsModal";
import { Login } from "./components/Login";
import { IntroSplash } from "./components/IntroSplash";
import { ToastContainer, ToastMessage } from "./components/Toast";
import {
  ConnectionStatus,
  DicomStudy,
  WorklistItem,
  AppSettings,
} from "./types";
import { MOCK_RECEIVED, MOCK_WORKLIST } from "./constants";
import {
  Activity,
  Link2,
  AlertTriangle,
  ArrowRight,
  Layers,
  X,
} from "lucide-react";

// Utility for safe ID generation
const generateId = () => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    try {
      return crypto.randomUUID();
    } catch (e) {}
  }
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

const App: React.FC = () => {
  // Intro State
  const [showSplash, setShowSplash] = useState(true);

  // Auth State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<string>("");

  // Config State
  const [appSettings, setAppSettings] = useState<AppSettings>({
    pacs: {
      aeTitle: "PRESERVER_SCP",
      port: 104,
      wsUrl: "ws://localhost:8080/dicom-receiver",
    },
    ris: {
      enabled: true,
      aeTitle: "RIS_SERVER",
      host: "192.168.1.10",
      port: 104,
      pollingInterval: 30,
    },
    workflow: {
      autoHideLinked: false,
    },
  });

  // State
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>(
    ConnectionStatus.DISCONNECTED,
  );
  const [studies, setStudies] = useState<DicomStudy[]>(MOCK_RECEIVED);
  const [worklist, setWorklist] = useState<WorklistItem[]>(MOCK_WORKLIST);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Selection Logic
  const [selectedStudy, setSelectedStudy] = useState<DicomStudy | null>(null);
  const [selectedWorklist, setSelectedWorklist] = useState<WorklistItem | null>(
    null,
  );

  // Drag and Drop State
  const [draggedStudy, setDraggedStudy] = useState<DicomStudy | null>(null);

  // Modal State
  const [previewStudy, setPreviewStudy] = useState<DicomStudy | null>(null);
  const [showLinkConfirmation, setShowLinkConfirmation] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // WebSocket References
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);
  const retryCountRef = useRef<number>(0);

  // Toast Helpers
  const addToast = (message: string, type: "success" | "error" | "info") => {
    const id = generateId();
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Helper to generate a mock RIS item
  const generateMockRisItem = useCallback(() => {
    const procedures = [
      "CT Head",
      "MR Knee",
      "US Abdomen",
      "XR Chest",
      "CT Spine",
      "DX Forearm",
    ];
    const randProc = procedures[Math.floor(Math.random() * procedures.length)];
    const randMod = randProc.split(" ")[0];

    const firstNames = [
      "Carlos",
      "Maria",
      "Jose",
      "Ana",
      "Paulo",
      "Julia",
      "Lucas",
      "Beatriz",
    ];
    const lastNames = [
      "Silva",
      "Santos",
      "Oliveira",
      "Souza",
      "Rodrigues",
      "Almeida",
    ];
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
    } as WorklistItem;
  }, []);

  // WebSocket Connection Logic
  useEffect(() => {
    if (!isAuthenticated) return;
    retryCountRef.current = 0;

    const connect = () => {
      if (
        socketRef.current?.readyState === WebSocket.OPEN ||
        socketRef.current?.readyState === WebSocket.CONNECTING
      ) {
        return;
      }

      setConnectionStatus(ConnectionStatus.CONNECTING);

      try {
        const ws = new WebSocket(appSettings.pacs.wsUrl);
        socketRef.current = ws;

        ws.onopen = () => {
          setConnectionStatus(ConnectionStatus.CONNECTED);
          addToast("Conectado ao servidor PACS com sucesso", "success");
          retryCountRef.current = 0;
          if (reconnectTimeoutRef.current) {
            window.clearTimeout(reconnectTimeoutRef.current);
            reconnectTimeoutRef.current = null;
          }
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
              studyDate:
                data.studyDate || new Date().toISOString().split("T")[0],
              accessionNumber:
                data.accessionNumber || data.AccessionNumber || "N/A",
              description: data.description || data.StudyDescription || "",
              studyInstanceUID:
                data.studyInstanceUID || data.StudyInstanceUID || "",
              receivedAt: new Date().toLocaleTimeString(),
              status: "received",
            };
            setStudies((prev) => [newStudy, ...prev]);
            addToast(`Novo estudo recebido: ${newStudy.patientName}`, "info");
          } catch (e) {
            console.error("Failed to parse DICOM event", e);
          }
        };

        ws.onerror = (e) => {
          setConnectionStatus(ConnectionStatus.ERROR);
        };

        ws.onclose = () => {
          if (connectionStatus === ConnectionStatus.CONNECTED) {
            addToast("Conexão perdida com o servidor PACS", "error");
          }
          setConnectionStatus(ConnectionStatus.DISCONNECTED);
          socketRef.current = null;
          const delay = Math.min(
            30000,
            1000 * Math.pow(2, retryCountRef.current),
          );
          retryCountRef.current += 1;
          reconnectTimeoutRef.current = window.setTimeout(() => {
            connect();
          }, delay);
        };
      } catch (e) {
        setConnectionStatus(ConnectionStatus.ERROR);
        const delay = Math.min(
          30000,
          1000 * Math.pow(2, retryCountRef.current),
        );
        retryCountRef.current += 1;
        reconnectTimeoutRef.current = window.setTimeout(() => {
          connect();
        }, delay);
      }
    };

    connect();

    return () => {
      if (socketRef.current) {
        socketRef.current.onclose = null;
        socketRef.current.close();
        socketRef.current = null;
      }
      if (reconnectTimeoutRef.current) {
        window.clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [appSettings.pacs.wsUrl, isAuthenticated]);

  const handleLinkClick = useCallback(() => {
    if (!selectedStudy || !selectedWorklist) return;
    setShowLinkConfirmation(true);
  }, [selectedStudy, selectedWorklist]);

  const handleCancelSelection = useCallback(() => {
    setSelectedStudy(null);
    setSelectedWorklist(null);
  }, []);

  const handleDropStudy = useCallback(
    (study: DicomStudy, worklistItem: WorklistItem) => {
      setSelectedStudy(study);
      setSelectedWorklist(worklistItem);
      setShowLinkConfirmation(true);
      setDraggedStudy(null);
    },
    [],
  );

  const handleConfirmLink = useCallback(() => {
    if (!selectedStudy || !selectedWorklist) return;

    setWorklist((prev) =>
      prev.map((item) =>
        item.id === selectedWorklist.id
          ? {
              ...item,
              status: "completed",
              studyInstanceUID: selectedStudy.studyInstanceUID,
            }
          : item,
      ),
    );

    if (appSettings.workflow.autoHideLinked) {
      setStudies((prev) => prev.filter((s) => s.id !== selectedStudy.id));
    }

    addToast(
      `Vínculo confirmado: ${selectedStudy.patientName} -> ${selectedWorklist.accessionNumber}`,
      "success",
    );
    setShowLinkConfirmation(false);
    setSelectedStudy(null);
    setSelectedWorklist(null);
  }, [selectedStudy, selectedWorklist, appSettings.workflow.autoHideLinked]);

  const handleSaveSettings = (newSettings: AppSettings) => {
    setAppSettings(newSettings);
    addToast("Configurações salvas com sucesso", "success");
  };

  const handleRisRefresh = useCallback(() => {
    if (!isAuthenticated || !appSettings.ris.enabled) {
      addToast(
        "Integração RIS desativada ou usuário não autenticado.",
        "error",
      );
      return;
    }

    addToast("Sincronizando com servidor RIS...", "info");

    // Simulate Network Delay and Fetch
    setTimeout(() => {
      // High probability of finding a new item on manual refresh for demo purposes
      const newItem = generateMockRisItem();
      setWorklist((prev) => [newItem, ...prev]);
      addToast(
        `Sincronização concluída. 1 novo agendamento encontrado.`,
        "success",
      );
    }, 1200);
  }, [isAuthenticated, appSettings.ris.enabled, generateMockRisItem]);

  // Demo Simulation: PACS
  useEffect(() => {
    let interval: number;
    if (connectionStatus === ConnectionStatus.CONNECTED && isAuthenticated) {
      interval = window.setInterval(() => {
        if (Math.random() > 0.95) {
          const modalities = ["CT", "MR", "DX", "US"];
          const names = [
            "Souza, Joao",
            "Lima, Pedro",
            "Gomes, Ana",
            "Ferreira, Clara",
          ];
          const birthYears = [1960, 1975, 1988, 1995, 2001];

          const randMod =
            modalities[Math.floor(Math.random() * modalities.length)];
          const randName = names[Math.floor(Math.random() * names.length)];
          const randYear =
            birthYears[Math.floor(Math.random() * birthYears.length)];
          const randMonth = Math.floor(Math.random() * 12) + 1;
          const randDay = Math.floor(Math.random() * 28) + 1;
          const birthDate = `${randDay.toString().padStart(2, "0")}/${randMonth.toString().padStart(2, "0")}/${randYear}`;

          const simulatedStudy: DicomStudy = {
            id: generateId(),
            patientName: randName,
            patientId: `P-${Math.floor(Math.random() * 10000)}`,
            birthDate: birthDate,
            modality: randMod,
            studyDate: new Date().toISOString().split("T")[0],
            accessionNumber: `ACC-2024-${Math.floor(Math.random() * 999)}`,
            description: `${randMod} Exam Routine`,
            studyInstanceUID: `1.2.3.4.5.${Date.now()}`,
            receivedAt: new Date().toLocaleTimeString(),
            status: "received",
          };
          setStudies((prev) => [simulatedStudy, ...prev]);
          addToast(
            `Estudo recebido: ${simulatedStudy.patientName} (${simulatedStudy.modality})`,
            "info",
          );
        }
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [connectionStatus, isAuthenticated]);

  // Demo Simulation: RIS Worklist Polling
  useEffect(() => {
    if (!isAuthenticated || !appSettings.ris.enabled) return;

    // Use setting, default 30s, min 5s
    const pollInterval = Math.max(
      5000,
      (appSettings.ris.pollingInterval || 30) * 1000,
    );

    const interval = setInterval(() => {
      // Simulation logic: Randomly decide if a new item appears
      if (Math.random() > 0.6) {
        const newItem = generateMockRisItem();
        setWorklist((prev) => [newItem, ...prev]);
        addToast(`RIS: Lista atualizada (${newItem.patientName})`, "info");
      }
    }, pollInterval);

    return () => clearInterval(interval);
  }, [
    isAuthenticated,
    appSettings.ris.enabled,
    appSettings.ris.pollingInterval,
    generateMockRisItem,
  ]);

  const namesMatch =
    selectedStudy && selectedWorklist
      ? selectedStudy.patientName.toLowerCase().replace(/[^a-z0-9]/g, "") ===
        selectedWorklist.patientName.toLowerCase().replace(/[^a-z0-9]/g, "")
      : false;

  const birthDatesMatch =
    selectedStudy && selectedWorklist
      ? selectedStudy.birthDate === selectedWorklist.birthDate
      : false;

  const idMatch =
    selectedStudy && selectedWorklist
      ? selectedStudy.patientId.trim() === selectedWorklist.patientId.trim()
      : false;

  const hasDiscrepancy = !namesMatch || !birthDatesMatch || !idMatch;

  const handleLogin = (user: string) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
    addToast("Login realizado com sucesso", "success");
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser("");
    setConnectionStatus(ConnectionStatus.DISCONNECTED);
    if (socketRef.current) {
      socketRef.current.close();
    }
  };

  if (showSplash) {
    return <IntroSplash onComplete={() => setShowSplash(false)} />;
  }

  if (!isAuthenticated) {
    return (
      <>
        <ToastContainer toasts={toasts} removeToast={removeToast} />
        <Login onLogin={handleLogin} />
      </>
    );
  }

  return (
    <div
      className="min-h-screen flex flex-col relative animate-in fade-in duration-500 bg-[#020617] text-slate-200"
      onDragOver={(e) => e.preventDefault()}
      onDragEnd={() => setDraggedStudy(null)}
    >
      {/* Background Grid Pattern */}
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      ></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900/20 via-slate-950/80 to-slate-950 pointer-events-none z-0"></div>

      <ToastContainer toasts={toasts} removeToast={removeToast} />

      <div className="relative z-10 flex flex-col h-screen overflow-hidden p-4 md:p-6 gap-6 max-w-[1920px] mx-auto w-full">
        <Header
          userDrt={currentUser}
          onOpenSettings={() => setShowSettings(true)}
          onLogout={handleLogout}
          onRefresh={handleRisRefresh}
        />

        {/* Main Content: Split Screen */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-0">
          {/* Left Panel: PACS Received */}
          <div className="flex flex-col h-full bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 ring-1 ring-white/5">
            <div className="p-4 border-b border-white/5 bg-white/5 flex items-center justify-between shrink-0">
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.6)]"></span>
                PACS Received
              </h2>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                  Total
                </span>
                <span className="text-xs bg-slate-950/50 text-cyan-400 px-2.5 py-0.5 rounded-full border border-white/10 font-mono">
                  {studies.length}
                </span>
              </div>
            </div>
            <div
              className={`flex-1 overflow-hidden relative transition-opacity ${draggedStudy ? "opacity-60 grayscale-[0.5]" : "opacity-100"}`}
            >
              <StudyList
                studies={studies}
                onSelect={setSelectedStudy}
                onDetails={setPreviewStudy}
                selectedId={selectedStudy?.id}
                onDragStart={setDraggedStudy}
              />
            </div>
          </div>

          {/* Right Panel: RIS Worklist */}
          <div className="flex flex-col h-full bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden ring-1 ring-white/5">
            <div className="p-4 border-b border-white/5 bg-white/5 flex items-center justify-between shrink-0">
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.6)]"></span>
                RIS Worklist
              </h2>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                  Scheduled
                </span>
                <span className="text-xs bg-slate-950/50 text-indigo-400 px-2.5 py-0.5 rounded-full border border-white/10 font-mono">
                  {worklist.length}
                </span>
              </div>
            </div>
            <div
              className={`flex-1 overflow-hidden relative transition-all ${draggedStudy ? "ring-2 ring-indigo-500/50 shadow-[inset_0_0_40px_rgba(99,102,241,0.1)]" : ""}`}
            >
              <RisWorklist
                worklist={worklist}
                onSelect={setSelectedWorklist}
                selectedId={selectedWorklist?.id}
                draggedStudy={draggedStudy}
                onDropStudy={handleDropStudy}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Floating Action Bar for Linking */}
      {selectedStudy &&
        selectedWorklist &&
        !showLinkConfirmation &&
        !draggedStudy && (
          <div className="fixed bottom-12 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-4 fade-in duration-300 w-[90%] max-w-2xl">
            <div className="bg-slate-900/90 backdrop-blur-xl border border-white/10 p-1.5 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.5)] flex items-stretch justify-between relative overflow-hidden ring-1 ring-black/50">
              {/* Content Container */}
              <div className="flex flex-1 items-center gap-4 px-4 py-2">
                {/* Source Info */}
                <div className="flex flex-col items-end flex-1 min-w-0">
                  <div className="text-[10px] font-bold text-cyan-500 uppercase tracking-wider mb-0.5 flex items-center gap-1">
                    PACS{" "}
                    <span className="w-1 h-1 rounded-full bg-cyan-500"></span>
                  </div>
                  <div className="text-sm font-bold text-white truncate w-full text-right">
                    {selectedStudy.patientName}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    {selectedStudy.patientId}
                  </div>
                </div>

                {/* Central Icon */}
                <div className="flex items-center justify-center px-2">
                  <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400">
                    <ArrowRight size={14} />
                  </div>
                </div>

                {/* Dest Info */}
                <div className="flex flex-col items-start flex-1 min-w-0">
                  <div className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider mb-0.5 flex items-center gap-1">
                    <span className="w-1 h-1 rounded-full bg-indigo-500"></span>{" "}
                    RIS
                  </div>
                  <div className="text-sm font-bold text-white truncate w-full text-left">
                    {selectedWorklist.patientName}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    {selectedWorklist.accessionNumber}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pl-2 border-l border-white/5">
                <button
                  onClick={handleCancelSelection}
                  className="p-3 h-full aspect-square flex items-center justify-center rounded-xl bg-slate-800/50 hover:bg-slate-800/80 text-slate-400 hover:text-red-400 transition-all border border-transparent hover:border-slate-700 hover:shadow-lg active:scale-[0.95]"
                  title="Cancelar Seleção"
                >
                  <X size={20} />
                </button>

                <button
                  onClick={handleLinkClick}
                  className={`
                     px-6 h-full rounded-xl font-bold text-sm transition-all flex items-center gap-2 active:scale-[0.98] border border-white/10
                     ${
                       hasDiscrepancy
                         ? "bg-gradient-to-br from-red-500 to-red-600 hover:from-red-400 hover:to-red-500 text-white shadow-[0_4px_16px_rgba(239,68,68,0.3)] hover:shadow-[0_8px_24px_rgba(239,68,68,0.4)]"
                         : "bg-gradient-to-br from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white shadow-[0_4px_16px_rgba(6,182,212,0.3)] hover:shadow-[0_8px_24px_rgba(6,182,212,0.4)]"
                     }
                  `}
                >
                  <Link2 size={16} />
                  <span>Vincular</span>
                  {hasDiscrepancy && (
                    <AlertTriangle size={14} className="animate-pulse" />
                  )}
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
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm transition-opacity animate-in fade-in duration-200">
          <div className="w-full max-w-2xl h-[80vh] md:h-auto md:max-h-[85vh] animate-in zoom-in-95 duration-200">
            <StudyDetails
              study={previewStudy}
              onClose={() => setPreviewStudy(null)}
            />
          </div>
        </div>
      )}

      {/* Footer Status Indicator */}
      <div className="fixed bottom-3 right-4 z-40 group">
        <div
          className={`
           bg-slate-900/90 backdrop-blur border px-3 py-1.5 rounded-full shadow-lg text-[10px] font-medium font-mono flex items-center gap-2 transition-colors
           ${
             connectionStatus === ConnectionStatus.ERROR
               ? "border-red-500/50 text-red-400 bg-red-950/20"
               : "border-slate-800 text-slate-400 group-hover:text-slate-200 group-hover:border-slate-700"
           }
         `}
        >
          <div className="relative flex h-2 w-2">
            {connectionStatus === ConnectionStatus.CONNECTED && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            )}
            <span
              className={`relative inline-flex rounded-full h-2 w-2 ${connectionStatus === ConnectionStatus.CONNECTED ? "bg-emerald-500" : connectionStatus === ConnectionStatus.ERROR ? "bg-red-500" : "bg-slate-600"}`}
            ></span>
          </div>
          {connectionStatus === ConnectionStatus.CONNECTED
            ? `CONNECTED: ${appSettings.pacs.aeTitle}`
            : connectionStatus === ConnectionStatus.ERROR
              ? "CONNECTION FAILED"
              : "DISCONNECTED"}
        </div>
      </div>
    </div>
  );
};

export default App;
