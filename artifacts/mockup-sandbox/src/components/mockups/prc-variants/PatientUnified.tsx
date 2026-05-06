import React, { useState } from "react";
import { 
  Check, 
  CheckCircle2, 
  ChevronDown, 
  CircleDashed, 
  Clock, 
  Filter, 
  Link as LinkIcon, 
  Lock, 
  Search, 
  Server, 
  Settings, 
  ShieldAlert, 
  User 
} from "lucide-react";
import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";
import { Input } from "../../ui/input";

// --- Mock Data ---
type Modality = "CT" | "MR" | "US" | "XR" | "DX";
type Status = "LINKED" | "PENDING" | "SCHEDULED" | "IN-PROGRESS";

interface PatientRow {
  id: string;
  status: Status;
  modality: Modality;
  patientName: string;
  accession: string;
  studyDate: string;
  procedure: string;
  pacsArrived?: string;
  risScheduled?: string;
  hasPacs: boolean;
  hasRis: boolean;
}

const mockData: PatientRow[] = [
  {
    id: "1",
    status: "PENDING",
    modality: "CT",
    patientName: "MARIA SILVA SANTOS",
    accession: "AC-2023-0891",
    studyDate: "24 Oct 2023",
    procedure: "TC DE CRANIO",
    pacsArrived: "14:23",
    hasPacs: true,
    hasRis: false,
  },
  {
    id: "2",
    status: "PENDING",
    modality: "MR",
    patientName: "JOÃO PEDRO ALVES",
    accession: "AC-2023-0892",
    studyDate: "24 Oct 2023",
    procedure: "RM DE JOELHO DIREITO",
    pacsArrived: "14:15",
    risScheduled: "14:00",
    hasPacs: true,
    hasRis: true,
  },
  {
    id: "3",
    status: "LINKED",
    modality: "US",
    patientName: "ANA CLARA LIMA",
    accession: "AC-2023-0885",
    studyDate: "24 Oct 2023",
    procedure: "USG ABDOME TOTAL",
    pacsArrived: "13:45",
    risScheduled: "13:30",
    hasPacs: true,
    hasRis: true,
  },
  {
    id: "4",
    status: "IN-PROGRESS",
    modality: "XR",
    patientName: "CARLOS EDUARDO COSTA",
    accession: "AC-2023-0888",
    studyDate: "24 Oct 2023",
    procedure: "RX TORAX PA/PERFIL",
    pacsArrived: "14:05",
    risScheduled: "14:10",
    hasPacs: true,
    hasRis: true,
  },
  {
    id: "5",
    status: "SCHEDULED",
    modality: "CT",
    patientName: "BEATRIZ FERREIRA",
    accession: "AC-2023-0895",
    studyDate: "24 Oct 2023",
    procedure: "TC DE TORAX",
    risScheduled: "15:00",
    hasPacs: false,
    hasRis: true,
  },
  {
    id: "6",
    status: "LINKED",
    modality: "MR",
    patientName: "ROBERTO GOMES",
    accession: "AC-2023-0880",
    studyDate: "24 Oct 2023",
    procedure: "RM DE COLUNA LOMBAR",
    pacsArrived: "11:30",
    risScheduled: "11:00",
    hasPacs: true,
    hasRis: true,
  }
];

// --- Components ---

const ModalityBadge = ({ modality }: { modality: Modality }) => {
  const colors = {
    CT: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
    MR: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
    US: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    XR: "bg-orange-500/20 text-orange-400 border-orange-500/30",
    DX: "bg-slate-500/20 text-slate-400 border-slate-500/30",
  };
  
  return (
    <span className={`px-2 py-0.5 text-xs font-bold rounded border ${colors[modality]}`}>
      {modality}
    </span>
  );
};

const StatusChip = ({ status }: { status: Status }) => {
  const config = {
    "LINKED": { color: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20", icon: <Lock className="w-3 h-3 mr-1" />, label: "VINCULADO" },
    "PENDING": { color: "bg-amber-500/10 text-amber-400 border-amber-500/20 animate-pulse", icon: <CircleDashed className="w-3 h-3 mr-1" />, label: "PENDENTE" },
    "SCHEDULED": { color: "bg-slate-500/10 text-slate-400 border-slate-700", icon: <Clock className="w-3 h-3 mr-1" />, label: "AGENDADO" },
    "IN-PROGRESS": { color: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20", icon: <Search className="w-3 h-3 mr-1" />, label: "EM EXAME" },
  };
  
  const { color, icon, label } = config[status];
  
  return (
    <div className={`flex items-center px-2 py-1 rounded-full border text-[10px] font-semibold tracking-wide ${color}`}>
      {icon}
      {label}
    </div>
  );
};

export function PatientUnified() {
  const [data, setData] = useState<PatientRow[]>(mockData);

  const handleConfirm = (id: string) => {
    setData(prev => prev.map(row => 
      row.id === id ? { ...row, status: "LINKED" as Status } : row
    ));
  };

  const pendingCount = data.filter(d => d.status === "PENDING").length;
  const linkedCount = data.filter(d => d.status === "LINKED").length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans flex flex-col selection:bg-cyan-500/30">
      {/* Header */}
      <header className="h-14 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-cyan-500 rounded flex items-center justify-center">
              <LinkIcon className="w-4 h-4 text-slate-950" />
            </div>
            <span className="font-semibold text-slate-100 tracking-tight">Preserve Receiver</span>
          </div>
          <div className="h-4 w-px bg-slate-800" />
          <div className="flex items-center gap-4 text-xs font-medium">
            <div className="flex items-center gap-1.5 text-emerald-400">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              PACS Connected
            </div>
            <div className="flex items-center gap-1.5 text-emerald-400">
              <div className="w-2 h-2 rounded-full bg-emerald-400" />
              RIS Connected
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="text-slate-400 hover:text-slate-200">
            <Settings className="w-4 h-4" />
          </Button>
          <div className="flex items-center gap-3 pl-4 border-l border-slate-800">
            <div className="text-right">
              <div className="text-sm font-medium text-slate-200">Dr. Roberto Lima</div>
              <div className="text-xs text-slate-500">DRT: 84920-SP</div>
            </div>
            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center">
              <User className="w-4 h-4 text-slate-400" />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col p-6 gap-4 overflow-hidden max-w-[1400px] mx-auto w-full">
        {/* Toolbar */}
        <div className="flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-semibold text-white">Worklist Unificada</h1>
            <Badge variant="outline" className="bg-amber-500/10 text-amber-400 border-amber-500/20 font-medium">
              {pendingCount} pendentes
            </Badge>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <Input 
                placeholder="Buscar paciente ou accession..." 
                className="w-64 pl-9 bg-slate-900/50 border-slate-800 text-sm focus-visible:ring-cyan-500/50"
              />
            </div>
            <Button variant="outline" className="bg-slate-900/50 border-slate-800 text-slate-300 gap-2">
              <Filter className="w-4 h-4" />
              Filtros
            </Button>
          </div>
        </div>

        {/* Unified List */}
        <div className="flex-1 overflow-auto rounded-lg border border-slate-800 bg-slate-900/30">
          <div className="min-w-[1000px]">
            {/* List Header */}
            <div className="grid grid-cols-[1fr_40px_1fr] sticky top-0 z-10 bg-slate-900/90 backdrop-blur-sm border-b border-slate-800 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              <div className="px-6 py-3 flex items-center gap-2">
                <Server className="w-4 h-4 text-cyan-500" />
                Recebido do PACS
              </div>
              <div className="flex justify-center items-center">
                <LinkIcon className="w-4 h-4 text-slate-600" />
              </div>
              <div className="px-6 py-3 flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-400" />
                Agendado no RIS
              </div>
            </div>

            {/* List Body */}
            <div className="divide-y divide-slate-800/50">
              {data.map((row) => (
                <div 
                  key={row.id} 
                  className={`grid grid-cols-[1fr_40px_1fr] group transition-colors hover:bg-slate-800/30
                    ${row.status === 'PENDING' ? 'bg-amber-500/[0.02]' : ''}
                  `}
                >
                  {/* Left: PACS */}
                  <div className="px-6 py-4 flex flex-col gap-2">
                    {row.hasPacs ? (
                      <>
                        <div className="flex items-center gap-3">
                          <ModalityBadge modality={row.modality} />
                          <span className="font-semibold text-slate-200">{row.patientName}</span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-slate-500">
                          <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {row.pacsArrived}</span>
                          <span>ACC: {row.accession}</span>
                          <span>{row.procedure}</span>
                        </div>
                      </>
                    ) : (
                      <div className="h-full flex items-center text-sm text-slate-600 italic">
                        Aguardando chegada no PACS...
                      </div>
                    )}
                  </div>

                  {/* Middle: Divider & Link */}
                  <div className="relative flex justify-center items-center">
                    <div className="absolute inset-y-0 w-px bg-slate-800/50 group-hover:bg-slate-700/50 transition-colors" />
                    
                    <div className="relative z-10 bg-slate-950 p-1 rounded-full">
                      {row.status === "LINKED" && (
                        <div className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
                          <Lock className="w-3 h-3" />
                        </div>
                      )}
                      {row.status === "PENDING" && (
                        <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30 animate-pulse">
                          <LinkIcon className="w-3 h-3" />
                        </div>
                      )}
                      {row.status === "SCHEDULED" && (
                        <div className="w-6 h-6 rounded-full bg-slate-800 text-slate-500 flex items-center justify-center border border-slate-700">
                          <LinkIcon className="w-3 h-3 opacity-50" />
                        </div>
                      )}
                      {row.status === "IN-PROGRESS" && (
                        <div className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
                          <Lock className="w-3 h-3" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right: RIS */}
                  <div className="px-6 py-4 flex flex-col gap-2">
                    {row.hasRis ? (
                      <>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="font-semibold text-slate-200">{row.patientName}</span>
                          </div>
                          <StatusChip status={row.status} />
                        </div>
                        <div className="flex items-center justify-between text-sm text-slate-500">
                          <div className="flex items-center gap-4">
                            <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {row.risScheduled}</span>
                            <span>{row.procedure}</span>
                          </div>
                          {row.status === "PENDING" && (
                            <Button 
                              size="sm" 
                              onClick={() => handleConfirm(row.id)}
                              className="h-7 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-3 shadow-[0_0_15px_rgba(6,182,212,0.3)] hover:shadow-[0_0_20px_rgba(6,182,212,0.5)] transition-all"
                            >
                              Confirmar Vínculo
                            </Button>
                          )}
                        </div>
                      </>
                    ) : (
                      <div className="h-full flex items-center text-sm text-amber-500/70 italic gap-2 bg-amber-500/[0.02] -mx-6 px-6 border-y border-transparent">
                        <ShieldAlert className="w-4 h-4" />
                        Aguardando vinculação com RIS...
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Summary */}
        <div className="flex items-center justify-between text-xs text-slate-500 shrink-0 bg-slate-900/30 p-3 rounded-lg border border-slate-800">
          <div className="flex items-center gap-6">
            <span>Total: <strong className="text-slate-300">{data.length}</strong> estudos</span>
            <span className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-cyan-500" />
              Vinculados: <strong className="text-slate-300">{linkedCount}</strong>
            </span>
            <span className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-amber-500" />
              Pendentes: <strong className="text-slate-300">{pendingCount}</strong>
            </span>
          </div>
          <div className="flex items-center gap-2">
            Última atualização: <strong className="text-slate-300">Agora mesmo</strong>
          </div>
        </div>
      </main>
    </div>
  );
}
