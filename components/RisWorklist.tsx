
import React, { useState } from 'react';
import { WorklistItem, DicomStudy } from '../types';
import { Calendar, User, CheckCircle2, UploadCloud, Search, ArrowRight, Database, ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react';

interface RisWorklistProps {
  worklist: WorklistItem[];
  onSelect: (item: WorklistItem) => void;
  selectedId?: string;
  draggedStudy: DicomStudy | null;
  onDropStudy: (study: DicomStudy, target: WorklistItem) => void;
}

type SortField = 'scheduledTime' | 'modality' | 'patientName';
type SortDirection = 'asc' | 'desc';

export const RisWorklist: React.FC<RisWorklistProps> = ({ 
  worklist, 
  onSelect, 
  selectedId, 
  draggedStudy,
  onDropStudy 
}) => {
  const normalize = (str: string) => str.toLowerCase().replace(/[^a-z0-9]/g, '');

  // Filtering State
  const [searchTerm, setSearchTerm] = useState('');
  const [filterModality, setFilterModality] = useState('');
  const [filterDateStart, setFilterDateStart] = useState('');
  const [filterDateEnd, setFilterDateEnd] = useState('');

  // Sorting State
  const [sortField, setSortField] = useState<SortField>('scheduledTime');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const filteredWorklist = worklist.filter(item => {
    const [datePart] = item.scheduledTime.split(' '); 

    const matchesSearch = 
      item.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.accessionNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.procedure.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.patientId.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesModality = filterModality ? item.modality === filterModality : true;
    
    const matchesDate = 
      (!filterDateStart || datePart >= filterDateStart) &&
      (!filterDateEnd || datePart <= filterDateEnd);

    return matchesSearch && matchesModality && matchesDate;
  });

  const sortedWorklist = [...filteredWorklist].sort((a, b) => {
    let comparison = 0;
    switch (sortField) {
      case 'patientName':
        comparison = a.patientName.localeCompare(b.patientName);
        break;
      case 'scheduledTime':
        comparison = a.scheduledTime.localeCompare(b.scheduledTime);
        break;
      case 'modality':
        comparison = a.modality.localeCompare(b.modality);
        break;
      default:
        comparison = 0;
    }
    return sortDirection === 'asc' ? comparison : -comparison;
  });

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown size={10} className="text-slate-700 group-hover:text-slate-500 transition-colors" />;
    return sortDirection === 'asc' 
      ? <ArrowUp size={10} className="text-indigo-500" /> 
      : <ArrowDown size={10} className="text-indigo-500" />;
  };

  return (
    <div className="flex flex-col h-full bg-slate-900/0 relative">
      
      {/* Overlay when dragging */}
      {draggedStudy && (
        <div className="absolute top-2 right-2 z-20 pointer-events-none animate-in fade-in zoom-in duration-300">
          <div className="bg-indigo-600/90 backdrop-blur border border-indigo-400/50 text-white text-[10px] font-bold px-3 py-1.5 rounded-full shadow-lg shadow-indigo-500/20 flex items-center gap-2">
            <UploadCloud size={12} className="animate-bounce" />
            Drop to Link
          </div>
        </div>
      )}

      {/* Toolbar */}
      <div className="p-3 border-b border-white/5 flex flex-col gap-2 bg-white/5">
        <div className="relative w-full group">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
          <input 
            type="text" 
            placeholder="Buscar Paciente, Procedimento..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-black/20 border border-white/10 rounded-full py-1.5 pl-9 pr-4 text-xs text-slate-200 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all placeholder:text-slate-500"
          />
        </div>
        
        <div className="flex gap-2">
          <div className="flex gap-1 flex-1 items-center bg-black/20 border border-white/10 rounded-full px-3 py-1 focus-within:border-indigo-500/50 focus-within:ring-1 focus-within:ring-indigo-500/50 transition-all">
            <Calendar size={12} className="text-slate-500" />
            <input 
              type="date"
              value={filterDateStart}
              onChange={(e) => setFilterDateStart(e.target.value)}
              className="bg-transparent border-none text-[10px] text-slate-300 focus:ring-0 w-full [color-scheme:dark]" 
            />
            <span className="text-slate-500 text-[10px]">&rarr;</span>
            <input 
              type="date"
              value={filterDateEnd}
              onChange={(e) => setFilterDateEnd(e.target.value)}
              className="bg-transparent border-none text-[10px] text-slate-300 focus:ring-0 w-full [color-scheme:dark]" 
            />
          </div>

          <select 
            value={filterModality}
            onChange={(e) => setFilterModality(e.target.value)}
            className="bg-black/20 border border-white/10 rounded-full py-1.5 px-3 text-xs text-slate-300 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 w-20 cursor-pointer hover:bg-black/40 transition-all"
          >
            <option value="">Mod</option>
            <option value="CT">CT</option>
            <option value="MR">MR</option>
            <option value="US">US</option>
            <option value="XR">XR</option>
            <option value="DX">DX</option>
          </select>
        </div>
      </div>

      {/* Table Header (Sticky) */}
      <div className="sticky top-0 z-10 grid grid-cols-12 gap-2 px-3 py-2 bg-slate-950/80 backdrop-blur-md border-b border-white/5 text-[10px] font-bold text-slate-400 uppercase tracking-wider select-none shadow-sm">
        <div 
          onClick={() => handleSort('scheduledTime')}
          className="col-span-1 flex items-center gap-1 cursor-pointer hover:text-indigo-400 transition-colors group"
        >
          Hora
          <SortIcon field="scheduledTime" />
        </div>
        <div className="col-span-2 text-center">Data</div>
        <div 
          onClick={() => handleSort('modality')}
          className="col-span-1 flex items-center gap-1 cursor-pointer hover:text-indigo-400 transition-colors group"
        >
          Mod
          <SortIcon field="modality" />
        </div>
        <div 
           onClick={() => handleSort('patientName')}
           className="col-span-4 flex items-center gap-1 cursor-pointer hover:text-indigo-400 transition-colors group"
        >
          Paciente / ID
          <SortIcon field="patientName" />
        </div>
        <div className="col-span-3">Procedimento</div>
        <div className="col-span-1 text-right">Status</div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
        {sortedWorklist.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full min-h-[200px] text-slate-600">
            <Database size={40} className="mb-3 opacity-20" />
            <p className="text-xs font-medium">Nenhum agendamento</p>
             {(searchTerm || filterDateStart || filterDateEnd || filterModality) && (
               <button 
                 onClick={() => {setSearchTerm(''); setFilterDateStart(''); setFilterDateEnd(''); setFilterModality('');}}
                 className="mt-2 text-[10px] text-indigo-500 hover:text-indigo-400 hover:underline"
               >
                 Limpar filtros
               </button>
            )}
          </div>
        ) : (
          <div className="pb-2">
            {sortedWorklist.map((item) => {
              const [datePart, timePart] = item.scheduledTime.split(' ');
              
              let isMatch = false;
              if (draggedStudy) {
                 const nameMatch = normalize(draggedStudy.patientName) === normalize(item.patientName);
                 isMatch = nameMatch;
              }

              return (
                <div 
                  key={item.id}
                  onClick={() => onSelect(item)}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.currentTarget.classList.add('bg-indigo-500/20');
                  }}
                  onDragLeave={(e) => {
                    e.currentTarget.classList.remove('bg-indigo-500/20');
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.currentTarget.classList.remove('bg-indigo-500/20');
                    if (draggedStudy) {
                      onDropStudy(draggedStudy, item);
                    } else {
                      try {
                        const data = e.dataTransfer.getData('application/json');
                        if (data) {
                          const study = JSON.parse(data) as DicomStudy;
                          onDropStudy(study, item);
                        }
                      } catch (err) {
                        console.error("Drop error", err);
                      }
                    }
                  }}
                  className={`
                    grid grid-cols-12 gap-2 px-3 py-2.5 border-b border-white/5 text-xs cursor-pointer transition-all duration-200 items-center relative
                    ${selectedId === item.id 
                      ? 'bg-indigo-500/10 border-l-2 border-l-indigo-500 shadow-[inset_0_0_20px_rgba(99,102,241,0.1)]' 
                      : 'hover:bg-white/5 border-l-2 border-l-transparent hover:border-l-indigo-500/50'}
                    
                    ${draggedStudy && isMatch 
                      ? 'bg-emerald-900/40 border border-emerald-500/50 shadow-lg shadow-emerald-500/20 z-10' 
                      : ''}
                    
                    ${draggedStudy && !isMatch 
                      ? 'opacity-40 grayscale-[0.8]' 
                      : ''}
                  `}
                >
                  <div className="col-span-1 text-slate-400 font-mono tabular-nums">
                    {timePart}
                  </div>
                   <div className="col-span-2 text-slate-500 tabular-nums text-center">
                     {datePart}
                  </div>
                  <div className="col-span-1 font-bold text-slate-300">
                     {item.modality}
                  </div>
                  <div className="col-span-4 min-w-0 pr-2">
                     <div className={`font-medium truncate transition-colors ${draggedStudy && isMatch ? 'text-emerald-400 font-bold' : 'text-slate-200'}`} title={item.patientName}>
                        {item.patientName}
                     </div>
                     <div className="text-[10px] text-slate-500 font-mono truncate">
                        {item.patientId} <span className="text-slate-700">|</span> {item.accessionNumber}
                     </div>
                  </div>
                  <div className="col-span-3 text-slate-400 truncate opacity-80" title={item.procedure}>
                    {item.procedure}
                  </div>
                  <div className="col-span-1 text-right">
                    <span className={`
                      text-[9px] font-bold px-1.5 py-0.5 rounded border
                      ${item.status === 'arrived' ? 'text-blue-400 bg-blue-500/5 border-blue-500/20' : ''}
                      ${item.status === 'in-progress' ? 'text-yellow-400 bg-yellow-500/5 border-yellow-500/20' : ''}
                      ${item.status === 'scheduled' ? 'text-slate-500 bg-slate-800/50 border-slate-700' : ''}
                      ${item.status === 'completed' ? 'text-emerald-400 bg-emerald-500/5 border-emerald-500/20' : ''}
                    `}>
                      {item.status === 'in-progress' ? 'WIP' : item.status.toUpperCase().slice(0,4)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <div className="p-1.5 border-t border-white/5 bg-slate-950/50 text-[9px] text-slate-500 text-center uppercase tracking-widest font-medium">
        Drop here
      </div>
    </div>
  );
};
