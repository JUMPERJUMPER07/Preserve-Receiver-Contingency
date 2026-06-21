import React, { useState } from 'react';
import { DicomStudy } from '../types';
import { X, FileText, Hash, Calendar, User, Building, Stethoscope, Clock, Database, Info, FileCode } from 'lucide-react';
import { maskPII, maskBirthDate, maskPatientId } from './StagingZoneLayout';

interface StudyDetailsProps {
  study: DicomStudy | null;
  onClose?: () => void;
  privacyMode?: boolean;
}

export const StudyDetails: React.FC<StudyDetailsProps> = ({ study, onClose, privacyMode = false }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'dicom'>('overview');

  if (!study) {
    return (
      <div className="h-full bg-slate-900/50 border border-slate-800 rounded-lg p-8 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4">
          <FileText size={32} className="text-slate-600" />
        </div>
        <h3 className="text-lg font-medium text-slate-300">Nenhum Estudo Selecionado</h3>
        <p className="text-slate-500 text-sm mt-2 max-w-xs">
          Selecione um item da lista de PACS recebidos para inspecionar os metadados e realizar a conferência.
        </p>
      </div>
    );
  }

  return (
    <div className="h-full bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col shadow-2xl shadow-black/50 relative max-h-[85vh]">
      
      {/* Header Panel */}
      <div className="p-5 border-b border-slate-800 bg-slate-950 relative overflow-hidden shrink-0">
        <div className="absolute top-0 right-0 w-64 h-full bg-gradient-to-l from-slate-900 to-transparent pointer-events-none" />
        
        <div className="flex justify-between items-start relative z-10">
           <div className="flex gap-4">
             <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 flex items-center justify-center text-xl font-bold text-cyan-400 shadow-inner">
               {study.modality}
             </div>
             <div>
               <h2 className="text-xl font-bold text-white leading-tight">
                 {maskPII(study.patientName, privacyMode)}
               </h2>
               <div className="flex items-center gap-3 mt-1 text-xs font-mono text-slate-400">
                  <span className="flex items-center gap-1"><User size={10} /> {maskPatientId(study.patientId, privacyMode)}</span>
                  <span className="w-px h-3 bg-slate-700"></span>
                  <span className="flex items-center gap-1"><Calendar size={10} /> {maskBirthDate(study.birthDate, privacyMode)}</span>
               </div>
             </div>
           </div>
           
           {onClose && (
            <button 
              onClick={onClose}
              className="p-2 bg-transparent hover:bg-slate-800 text-slate-500 hover:text-white rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
           )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center border-b border-slate-800 bg-slate-900/50 px-2 shrink-0">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'overview' ? 'border-cyan-500 text-cyan-400 bg-cyan-500/5' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
        >
          <Info size={14} /> Dados Clínicos
        </button>
        <button
          onClick={() => setActiveTab('dicom')}
          className={`px-4 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'dicom' ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
        >
          <Hash size={14} /> Tags DICOM (Header)
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-5 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
        
        {activeTab === 'overview' && (
          <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-300">
            
            {/* Clinical Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoCard label="Accession Number" value={study.accessionNumber} icon={<Hash size={12} />} highlight />
              <InfoCard label="Data do Estudo" value={study.studyDate} icon={<Calendar size={12} />} />
              <InfoCard label="Horário Recebimento" value={study.receivedAt} icon={<Clock size={12} />} />
              <InfoCard label="Descrição" value={study.description || 'Não informada'} icon={<FileText size={12} />} fullWidth />
            </div>

            {/* Mocked Context Data */}
            <div className="pt-4 border-t border-slate-800">
               <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Building size={12} /> Contexto Institucional
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <InfoCard label="Instituição" value="Hospital Central (Main)" />
                 <InfoCard label="Médico Solicitante" value="Dr. MOCK (Sistema Externo)" icon={<Stethoscope size={12} />} />
              </div>
            </div>
            
            <div className="pt-4 border-t border-slate-800">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Database size={12} /> Status do Arquivo
              </h4>
               <div className="bg-emerald-950/20 border border-emerald-900/50 rounded-lg p-3 flex items-center justify-between">
                 <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                    <div>
                      <span className="text-sm text-emerald-400 font-bold block">Arquivo Recebido com Sucesso</span>
                      <span className="text-[10px] text-emerald-600 block">Pronto para vinculação com RIS</span>
                    </div>
                 </div>
                 <span className="text-xs font-mono text-emerald-500/70 flex items-center gap-1"><FileCode size={12}/> DICOM P10</span>
               </div>
            </div>
          </div>
        )}

        {activeTab === 'dicom' && (
          <div className="space-y-4 animate-in slide-in-from-bottom-2 duration-300">
             <div className="bg-slate-950 rounded-lg border border-slate-800 overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 uppercase font-mono">
                    <tr>
                      <th className="px-4 py-2 w-32">Tag</th>
                      <th className="px-4 py-2">VR</th>
                      <th className="px-4 py-2">Valor</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50 text-slate-300 font-mono">
                    <TableRow tag="(0010,0010)" vr="PN" value={maskPII(study.patientName, privacyMode)} />
                    <TableRow tag="(0010,0020)" vr="LO" value={maskPatientId(study.patientId, privacyMode)} />
                    <TableRow tag="(0010,0030)" vr="DA" value={maskBirthDate(study.birthDate, privacyMode).replace(/\//g, '')} />
                    <TableRow tag="(0008,0020)" vr="DA" value={study.studyDate.replace(/-/g, '')} />
                    <TableRow tag="(0008,0050)" vr="SH" value={study.accessionNumber} />
                    <TableRow tag="(0008,0060)" vr="CS" value={study.modality} />
                    <TableRow tag="(0008,1030)" vr="LO" value={study.description} />
                    <TableRow tag="(0020,000D)" vr="UI" value={study.studyInstanceUID} copyable />
                    <TableRow tag="(0002,0010)" vr="UI" value="1.2.840.10008.1.2.4.70" />
                    <TableRow tag="(0008,0080)" vr="LO" value="PRESERVER_SCP" />
                  </tbody>
                </table>
             </div>
             <p className="text-[10px] text-slate-600 text-center mt-4">
               Conferência de metadados para garantir integridade antes da vinculação.
             </p>
          </div>
        )}

      </div>
    </div>
  );
};

// Sub-components for cleaner code
const InfoCard = ({ label, value, icon, fullWidth = false, highlight = false }: { label: string, value: string, icon?: React.ReactNode, fullWidth?: boolean, highlight?: boolean }) => (
  <div className={`bg-slate-950 border border-slate-800 rounded-lg p-3 ${fullWidth ? 'md:col-span-2' : ''} ${highlight ? 'border-l-2 border-l-cyan-500' : ''}`}>
    <label className="text-[10px] text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1.5 font-bold">
      {icon} {label}
    </label>
    <div className={`text-sm font-medium truncate ${highlight ? 'text-cyan-100' : 'text-slate-300'}`} title={value}>
      {value}
    </div>
  </div>
);

const TableRow = ({ tag, vr, value, copyable }: { tag: string, vr: string, value: string, copyable?: boolean }) => (
  <tr className="hover:bg-slate-900/50 transition-colors group">
    <td className="px-4 py-2 text-slate-500">{tag}</td>
    <td className="px-4 py-2 text-slate-600">{vr}</td>
    <td className="px-4 py-2 break-all">
      <div className="flex items-center gap-2">
        <span>{value}</span>
        {copyable && (
          <button 
             onClick={() => navigator.clipboard.writeText(value)}
             className="opacity-0 group-hover:opacity-100 text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded hover:text-white transition-opacity"
          >
            Copy
          </button>
        )}
      </div>
    </td>
  </tr>
);

