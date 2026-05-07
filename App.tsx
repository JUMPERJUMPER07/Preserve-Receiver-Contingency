import React, { useState, useEffect, useCallback, useRef } from "react";
import { StudyDetails } from "./components/StudyDetails";
import { SettingsModal } from "./components/SettingsModal";
import { Login } from "./components/Login";
import { IntroSplash } from "./components/IntroSplash";
import { ToastContainer, ToastMessage } from "./components/Toast";
import { ConnectionStatus, DicomStudy, WorklistItem, AppSettings, NetworkState } from "./types";
import { MOCK_RECEIVED, MOCK_WORKLIST } from "./constants";
import { useLocalStorage } from "./hooks/useLocalStorage";
import { useSound } from "./hooks/useSound";
import { StagingZoneLayout, OpsLogEntry } from "./components/StagingZoneLayout";

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
  const [sessionStart, setSessionStart] = useState(0);

  const [appSettings, setAppSettings] = useLocalStorage<AppSettings>("prc_settings", DEFAULT_SETTINGS);
  const [studies, setStudies]         = useLocalStorage<DicomStudy[]>("prc_studies_v2", MOCK_RECEIVED);
  const [worklist, setWorklist]       = useLocalStorage<WorklistItem[]>("prc_worklist_v2", MOCK_WORKLIST);

  const [soundEnabled] = useLocalStorage<boolean>("prc_sound", true);
  const { play: playSound } = useSound(soundEnabled);

  const [networkStatus, setNetworkStatus] = useState<{ pacs: NetworkState; ris: NetworkState }>({
    pacs: "online",
    ris: "online",
  });

  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>(ConnectionStatus.DISCONNECTED);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [selectedStudy, setSelectedStudy] = useState<DicomStudy | null>(null);
  const [selectedWorklist, setSelectedWorklist] = useState<WorklistItem | null>(null);
  const [previewStudy, setPreviewStudy] = useState<DicomStudy | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [opsLog, setOpsLog] = useState<OpsLogEntry[]>([]);

  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);
  const retryCountRef = useRef<number>(0);

  const addToast = (message: string, type: "success" | "error" | "info") => {
    const id = generateId();
    setToasts(prev => [...prev, { id, message, type }]);
  };
  const removeToast = (id: string) => setToasts(prev => prev.filter(t => t.id !== id));

  const addOpsEntry = useCallback((type: OpsLogEntry["type"], text: string) => {
    setOpsLog(prev => [{
      id: generateId(),
      time: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
      type,
      text,
    }, ...prev].slice(0, 100));
  }, []);

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
      addOpsEntry("event", `RIS SYNC: ${newItem.patientName} adicionado`);
    }, 1200);
  }, [isAuthenticated, appSettings.ris.enabled, generateMockRisItem, addOpsEntry]);

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
          addOpsEntry("event", "PACS: Conexão estabelecida");
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
            addOpsEntry("event", `RECV: ${newStudy.patientName} (${newStudy.modality}) → ${newStudy.accessionNumber}`);
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
          addOpsEntry("event", `RECV: ${simulatedStudy.patientName} (${simulatedStudy.modality})`);
          playSound("receive");
        }
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [connectionStatus, isAuthenticated]);

  // Network Monitor
  useEffect(() => {
    if (!isAuthenticated) return;
    const interval = setInterval(() => {
      if (Math.random() > 0.95 && networkStatus.pacs === "online") {
        setNetworkStatus({ pacs: "offline", ris: "offline" });
        addToast("ALERTA: Conexão com servidores externos perdida (MODO CONTINGÊNCIA)", "error");
        addOpsEntry("unmatched", "ALERTA: Servidores PACS/RIS offline — MODO CONTINGÊNCIA ATIVO");
        playSound("error");
      } else if (networkStatus.pacs === "offline" && Math.random() > 0.7) {
        setNetworkStatus({ pacs: "online", ris: "online" });
        addToast("REDE RESTABELECIDA: Detectando servidores disponíveis...", "success");
        addOpsEntry("event", "REDE: Conexão restabelecida — servidores disponíveis");
        setTimeout(handleRisRefresh, 1000);
      } else if (networkStatus.pacs === "online" && Math.random() > 0.9) {
        setNetworkStatus(prev => ({ ...prev, pacs: "degraded" }));
        setTimeout(() => setNetworkStatus(prev => ({ ...prev, pacs: "online" })), 3000);
      }
    }, 15000);
    return () => clearInterval(interval);
  }, [isAuthenticated, networkStatus.pacs, handleRisRefresh]);

  // Demo RIS polling
  useEffect(() => {
    if (!isAuthenticated || !appSettings.ris.enabled || networkStatus.ris !== "online") return;
    const pollInterval = Math.max(5000, (appSettings.ris.pollingInterval || 30) * 1000);
    const interval = setInterval(() => {
      if (Math.random() > 0.6) {
        const newItem = generateMockRisItem();
        setWorklist(prev => [newItem, ...prev]);
        addToast(`RIS: Lista atualizada (${newItem.patientName})`, "info");
        addOpsEntry("event", `RIS SYNC: ${newItem.patientName} adicionado`);
      }
    }, pollInterval);
    return () => clearInterval(interval);
  }, [isAuthenticated, appSettings.ris.enabled, appSettings.ris.pollingInterval, generateMockRisItem, networkStatus.ris]);

  const handleConfirmLink = useCallback((study: DicomStudy, item: WorklistItem) => {
    setWorklist(prev => prev.map(w =>
      w.id === item.id
        ? { ...w, status: "completed" as const, studyInstanceUID: study.studyInstanceUID }
        : w
    ));
    if (appSettings.workflow.autoHideLinked) setStudies(prev => prev.filter(s => s.id !== study.id));
    addToast(`Vínculo confirmado: ${study.patientName} → ${item.accessionNumber}`, "success");
    addOpsEntry("link", `LINKED: ${study.patientName} → ${item.accessionNumber}`);
    setSelectedStudy(null);
    setSelectedWorklist(null);
  }, [appSettings.workflow.autoHideLinked, addOpsEntry]);

  const handleSaveSettings = (newSettings: AppSettings) => {
    setAppSettings(newSettings);
    addToast("Configurações salvas com sucesso", "success");
  };

  const handleLogin = (user: string, drt: string) => {
    setCurrentUser(user);
    setCurrentDrt(drt);
    setIsAuthenticated(true);
    setSessionStart(Date.now());
    setOpsLog([{
      id: generateId(),
      time: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
      type: "event",
      text: `SESSION: DRT ${drt || user} autenticado — sistema pronto`,
    }]);
    addToast("Login realizado com sucesso", "success");
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser("");
    setCurrentDrt("");
    setSessionStart(0);
    setOpsLog([]);
    setConnectionStatus(ConnectionStatus.DISCONNECTED);
    if (socketRef.current) socketRef.current.close();
  };

  if (showSplash) return <IntroSplash onComplete={() => setShowSplash(false)} />;
  if (!isAuthenticated) return (
    <>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <Login onLogin={handleLogin} />
    </>
  );

  return (
    <div className="h-screen overflow-hidden">
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      <StagingZoneLayout
        studies={studies}
        worklist={worklist}
        selectedStudy={selectedStudy}
        selectedWorklist={selectedWorklist}
        onSelectStudy={(study) => {
          setSelectedStudy(study);
          if (!study) setSelectedWorklist(null);
        }}
        onSelectWorklist={setSelectedWorklist}
        onConfirmLink={handleConfirmLink}
        onDetails={setPreviewStudy}
        connectionStatus={connectionStatus}
        networkStatus={networkStatus}
        userDrt={currentDrt || currentUser}
        sessionStart={sessionStart}
        onOpenSettings={() => setShowSettings(true)}
        onLogout={handleLogout}
        onRefresh={handleRisRefresh}
      />

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
    </div>
  );
};

export default App;
