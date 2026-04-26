
import React, { useState, useEffect, useRef } from 'react';
import { DicomStudy } from '../types';
import { 
  X, ZoomIn, Sun, Move, RotateCcw, 
  FlipVertical, ChevronLeft, ChevronRight,
  Monitor, Grid, Ruler, Circle, Eraser,
  Play, Pause, FastForward, SkipBack, MousePointer2
} from 'lucide-react';

interface ImageViewerModalProps {
  study: DicomStudy;
  onClose: () => void;
}

interface Measurement {
  id: string;
  type: 'ruler' | 'roi';
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  value: number; // simulated mm (diagonal length)
}

// Edit state tracks what part of which measurement is being manipulated
interface ActiveEditState {
  id: string;
  action: 'move' | 'resize-start' | 'resize-end';
}

const IMAGE_SIZE = 512;

export const ImageViewerModal: React.FC<ImageViewerModalProps> = ({ study, onClose }) => {
  // Viewer Basics
  const [currentSlice, setCurrentSlice] = useState(1);
  const totalSlices = study.modality === 'CT' || study.modality === 'MR' ? 64 : 1;
  const viewportRef = useRef<HTMLDivElement>(null);
  
  // Image Manipulations
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [windowWidth, setWindowWidth] = useState(400); // Contrast
  const [windowCenter, setWindowCenter] = useState(40); // Brightness
  const [inverted, setInverted] = useState(false);
  
  // Tools & Interaction
  const [activeTool, setActiveTool] = useState<'pan' | 'zoom' | 'wl' | 'ruler' | 'roi' | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  // Measurement State
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [currentMeasurement, setCurrentMeasurement] = useState<Measurement | null>(null);
  const [activeEdit, setActiveEdit] = useState<ActiveEditState | null>(null);

  // Cine Loop
  const [isPlaying, setIsPlaying] = useState(false);
  const [frameRate, setFrameRate] = useState(10); // fps

  // Reset View
  const handleReset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setWindowWidth(400);
    setWindowCenter(40);
    setInverted(false);
    setCurrentSlice(1);
    setIsPlaying(false);
    setMeasurements([]);
  };

  // Cine Loop Effect
  useEffect(() => {
    let interval: number;
    if (isPlaying && totalSlices > 1) {
      interval = window.setInterval(() => {
        setCurrentSlice(prev => (prev >= totalSlices ? 1 : prev + 1));
      }, 1000 / frameRate);
    }
    return () => clearInterval(interval);
  }, [isPlaying, frameRate, totalSlices]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp') setCurrentSlice(prev => Math.max(prev - 1, 1));
      if (e.key === 'ArrowDown') setCurrentSlice(prev => Math.min(prev + 1, totalSlices));
      if (e.key === 'Escape') onClose();
      if (e.key === ' ') setIsPlaying(p => !p); // Space toggles play
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [totalSlices, onClose]);

  // --- Helper Functions for Coordinates ---
  
  const getImageCoords = (e: React.MouseEvent) => {
    const rect = viewportRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    // Translate screen coordinates to image space accounting for Pan and Zoom
    return {
      x: (e.clientX - rect.left - pan.x) / zoom,
      y: (e.clientY - rect.top - pan.y) / zoom
    };
  };

  const clampToImage = (val: number) => {
    return Math.max(0, Math.min(val, IMAGE_SIZE));
  };

  const isInsideImage = (x: number, y: number) => {
    return x >= 0 && x <= IMAGE_SIZE && y >= 0 && y <= IMAGE_SIZE;
  };

  const calculateDistance = (x1: number, y1: number, x2: number, y2: number) => {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
  };

  // --- Mouse Interaction Handlers ---

  const handleEditMouseDown = (e: React.MouseEvent, id: string, action: ActiveEditState['action']) => {
    e.stopPropagation(); // Critical: Prevent starting a new drawing or panning
    setActiveEdit({ id, action });
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    // If we clicked a handle, activeEdit is already set by handleEditMouseDown propagation stop
    if (activeEdit) return;

    if (!activeTool) return;
    
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });

    // Start NEW measurement
    if (activeTool === 'ruler' || activeTool === 'roi') {
      const { x, y } = getImageCoords(e);
      
      // Only start measurement if click is INSIDE the image
      if (!isInsideImage(x, y)) {
        setIsDragging(false); 
        return;
      }

      setCurrentMeasurement({
        id: Date.now().toString(),
        type: activeTool,
        startX: x,
        startY: y,
        endX: x,
        endY: y,
        value: 0
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    
    // 1. Editing (Moving or Resizing) an EXISTING measurement
    if (activeEdit) {
       const mouseImg = getImageCoords(e);
       
       // For moving whole shape, we use delta from screen coordinates
       const deltaX = (e.clientX - dragStart.x) / zoom;
       const deltaY = (e.clientY - dragStart.y) / zoom;

       setMeasurements(prev => prev.map(m => {
          if (m.id !== activeEdit.id) return m;

          // RESIZE LOGIC (Endpoints)
          if (activeEdit.action === 'resize-start') {
            const newX = clampToImage(mouseImg.x);
            const newY = clampToImage(mouseImg.y);
            return {
              ...m,
              startX: newX,
              startY: newY,
              value: calculateDistance(newX, newY, m.endX, m.endY) * 0.5
            };
          }

          if (activeEdit.action === 'resize-end') {
            const newX = clampToImage(mouseImg.x);
            const newY = clampToImage(mouseImg.y);
            return {
              ...m,
              endX: newX,
              endY: newY,
              value: calculateDistance(m.startX, m.startY, newX, newY) * 0.5
            };
          }

          // MOVE LOGIC (Whole Shape)
          if (activeEdit.action === 'move') {
             let dx = deltaX;
             let dy = deltaY;

             // Collision detection (keep bounding box inside image)
             const minX = Math.min(m.startX, m.endX);
             const maxX = Math.max(m.startX, m.endX);
             const minY = Math.min(m.startY, m.endY);
             const maxY = Math.max(m.startY, m.endY);

             // Check walls and clamp dx/dy if necessary
             if (minX + dx < 0) dx = -minX;
             if (maxX + dx > IMAGE_SIZE) dx = IMAGE_SIZE - maxX;
             if (minY + dy < 0) dy = -minY;
             if (maxY + dy > IMAGE_SIZE) dy = IMAGE_SIZE - maxY;

             return {
                ...m,
                startX: m.startX + dx,
                startY: m.startY + dy,
                endX: m.endX + dx,
                endY: m.endY + dy
             };
          }
          return m;
       }));
       
       // Update drag start for 'move' calculations (delta)
       if (activeEdit.action === 'move') {
         setDragStart({ x: e.clientX, y: e.clientY });
       }
       return;
    }

    // 2. Standard Tool interactions (Pan, Zoom, Create Measurement)
    if (!isDragging) return;

    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;

    if (activeTool === 'pan') {
      setPan(prev => ({ x: prev.x + deltaX, y: prev.y + deltaY }));
      setDragStart({ x: e.clientX, y: e.clientY });
    }
    else if (activeTool === 'zoom') {
      const zoomFactor = -deltaY * 0.01;
      setZoom(prev => Math.max(0.1, Math.min(5, prev + zoomFactor)));
      setDragStart({ x: e.clientX, y: e.clientY });
    }
    else if (activeTool === 'wl') {
      setWindowWidth(prev => Math.max(1, prev + deltaX));
      setWindowCenter(prev => prev + deltaY);
      setDragStart({ x: e.clientX, y: e.clientY });
    }
    else if ((activeTool === 'ruler' || activeTool === 'roi') && currentMeasurement) {
       const { x, y } = getImageCoords(e);
       const clampedX = clampToImage(x);
       const clampedY = clampToImage(y);
       
       setCurrentMeasurement({
         ...currentMeasurement,
         endX: clampedX,
         endY: clampedY,
         value: calculateDistance(currentMeasurement.startX, currentMeasurement.startY, clampedX, clampedY) * 0.5
       });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setActiveEdit(null);
    if (currentMeasurement) {
      if (currentMeasurement.value > 5) { 
        setMeasurements(prev => [...prev, currentMeasurement]);
      }
      setCurrentMeasurement(null);
    }
  };

  // --- Visual Filters & Styles ---
  const contrastPercent = Math.max(0, (400 / windowWidth) * 100); 
  const brightnessPercent = Math.max(0, ((windowCenter + 100) / 200) * 100);

  const getCursor = () => {
    if (activeEdit) return 'cursor-grabbing';
    switch (activeTool) {
      case 'pan': return 'cursor-move';
      case 'zoom': return 'cursor-ns-resize';
      case 'wl': return 'cursor-all-scroll';
      case 'ruler':
      case 'roi': return 'cursor-crosshair';
      default: return 'cursor-default';
    }
  };

  // Handle Size Logic: Constant size in pixels regardless of zoom
  const handleRadius = 6 / zoom; 

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col animate-in fade-in duration-300 select-none">
      
      {/* Top Header */}
      <div className="h-10 bg-[#0a0a0a] border-b border-slate-800 flex justify-between items-center px-4 shrink-0">
        <div className="flex items-center gap-4 text-xs font-medium text-slate-300">
           <span className="text-cyan-500 font-bold tracking-wider">{study.patientName.toUpperCase()}</span>
           <span className="text-slate-500">|</span>
           <span>{study.patientId}</span>
           <span className="text-slate-500">|</span>
           <span>{study.birthDate}</span>
           <span className="bg-cyan-900/30 text-cyan-400 px-1.5 py-0.5 rounded border border-cyan-800">{study.modality}</span>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-red-400 p-1.5 hover:bg-red-900/20 rounded transition-colors">
          <X size={18} />
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Toolbar */}
        <div className="w-14 bg-[#050505] border-r border-slate-800 flex flex-col items-center py-2 gap-2 shrink-0 z-10">
          <ToolButton icon={<MousePointer2 size={18} />} active={activeTool === null} onClick={() => setActiveTool(null)} label="Pointer" />
          <div className="w-8 h-px bg-slate-800 my-1"></div>
          <ToolButton icon={<Sun size={18} />} active={activeTool === 'wl'} onClick={() => setActiveTool('wl')} label="Window/Level (Drag)" />
          <ToolButton icon={<Move size={18} />} active={activeTool === 'pan'} onClick={() => setActiveTool('pan')} label="Pan (Drag)" />
          <ToolButton icon={<ZoomIn size={18} />} active={activeTool === 'zoom'} onClick={() => setActiveTool('zoom')} label="Zoom (Drag Up/Down)" />
          <div className="w-8 h-px bg-slate-800 my-1"></div>
          <ToolButton icon={<Ruler size={18} />} active={activeTool === 'ruler'} onClick={() => setActiveTool('ruler')} label="Ruler" />
          <ToolButton icon={<Circle size={18} />} active={activeTool === 'roi'} onClick={() => setActiveTool('roi')} label="ROI Area" />
          <ToolButton icon={<Eraser size={18} />} onClick={() => setMeasurements([])} label="Clear Annotations" />
          <div className="w-8 h-px bg-slate-800 my-1"></div>
          <ToolButton icon={<FlipVertical size={18} />} active={inverted} onClick={() => setInverted(!inverted)} label="Invert Colors" />
          <ToolButton icon={<RotateCcw size={18} />} onClick={handleReset} label="Reset View" />
          
          <div className="flex-1"></div>
          <div className="mb-2 flex flex-col gap-2">
             <ToolButton icon={<Grid size={18} />} label="Layout 2x2" />
             <ToolButton icon={<Monitor size={18} />} label="Full Screen" />
          </div>
        </div>

        {/* Image Display Area */}
        <div 
           className={`flex-1 bg-black relative overflow-hidden flex items-center justify-center ${getCursor()}`} 
           onWheel={(e) => {
             if (totalSlices > 1) {
                if (e.deltaY > 0) setCurrentSlice(prev => Math.min(prev + 1, totalSlices));
                else setCurrentSlice(prev => Math.max(prev - 1, 1));
             }
           }}
           onMouseDown={handleMouseDown}
           onMouseMove={handleMouseMove}
           onMouseUp={handleMouseUp}
           onMouseLeave={handleMouseUp}
        >
          {/* Viewport Container */}
          <div ref={viewportRef} className="relative w-full h-full flex items-center justify-center overflow-hidden">
            
            {/* Transformed Content */}
            <div 
              className="relative transition-transform duration-0 ease-linear origin-center"
              style={{
                width: `${IMAGE_SIZE}px`,
                height: `${IMAGE_SIZE}px`,
                transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              }}
            >
              {/* Image Layer */}
              <div 
                className="w-full h-full bg-slate-900 border border-slate-800 shadow-2xl relative"
                style={{
                   filter: `contrast(${contrastPercent}%) brightness(${brightnessPercent}%) ${inverted ? 'invert(1)' : ''}`
                }}
              >
                {/* Fake Anatomy */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_var(--tw-gradient-stops))] from-slate-300 via-slate-700 to-black" 
                     style={{
                       transform: `scale(${0.8 + (currentSlice % 15) * 0.01}) rotate(${(currentSlice % 5) - 2}deg)` 
                     }}
                />
                <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"></div>
                <div 
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-200 blur-2xl rounded-full opacity-50"
                  style={{ width: `${150 + Math.sin(currentSlice)*20}px`, height: `${180 + Math.cos(currentSlice)*20}px` }}
                ></div>
              </div>

              {/* Annotation Layer (SVG) */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible z-20">
                 {/* Render Saved Measurements */}
                 {measurements.map(m => {
                   // Area Calculation for ROI: PI * r1 * r2 (in mm)
                   const rx_mm = (Math.abs(m.endX - m.startX) / 2) * 0.5;
                   const ry_mm = (Math.abs(m.endY - m.startY) / 2) * 0.5;
                   const area = Math.PI * rx_mm * ry_mm;

                   return (
                   <g 
                     key={m.id} 
                     className="pointer-events-auto group"
                   >
                      {m.type === 'ruler' ? (
                        <>
                          {/* Invisible Hit Area (Larger) */}
                          <line 
                             x1={m.startX} y1={m.startY} x2={m.endX} y2={m.endY} 
                             stroke="transparent" strokeWidth="20" vectorEffect="non-scaling-stroke" 
                             className="cursor-move"
                             onMouseDown={(e) => handleEditMouseDown(e, m.id, 'move')}
                          />
                          {/* Visible Line */}
                          <line 
                            x1={m.startX} y1={m.startY} x2={m.endX} y2={m.endY} 
                            stroke="#facc15" strokeWidth="2" vectorEffect="non-scaling-stroke" 
                            className="group-hover:stroke-cyan-400 transition-colors"
                          />
                          <line x1={m.startX - 5} y1={m.startY} x2={m.startX + 5} y2={m.startY} stroke="#facc15" strokeWidth="1" vectorEffect="non-scaling-stroke" />
                          <line x1={m.endX - 5} y1={m.endY} x2={m.endX + 5} y2={m.endY} stroke="#facc15" strokeWidth="1" vectorEffect="non-scaling-stroke" />
                        </>
                      ) : (
                        // ROI Ellipse
                        <ellipse 
                          cx={(m.startX + m.endX)/2} 
                          cy={(m.startY + m.endY)/2} 
                          rx={Math.abs(m.endX - m.startX)/2} 
                          ry={Math.abs(m.endY - m.startY)/2} 
                          stroke="#facc15" strokeWidth="2" fill="rgba(250, 204, 21, 0.1)" vectorEffect="non-scaling-stroke"
                          className="cursor-move group-hover:stroke-cyan-400 group-hover:fill-cyan-400/10 transition-colors"
                          onMouseDown={(e) => handleEditMouseDown(e, m.id, 'move')}
                        />
                      )}

                      {/* Handles (Endpoints) - Resize Controls */}
                      <circle 
                        cx={m.startX} cy={m.startY} r={handleRadius} 
                        fill="#fff" stroke="#000" strokeWidth={1/zoom}
                        className="cursor-pointer hover:fill-cyan-400 hover:scale-125 transition-transform"
                        onMouseDown={(e) => handleEditMouseDown(e, m.id, 'resize-start')}
                      />
                       <circle 
                        cx={m.endX} cy={m.endY} r={handleRadius} 
                        fill="#fff" stroke="#000" strokeWidth={1/zoom}
                        className="cursor-pointer hover:fill-cyan-400 hover:scale-125 transition-transform"
                        onMouseDown={(e) => handleEditMouseDown(e, m.id, 'resize-end')}
                      />

                      {/* Text Label */}
                      <text 
                        x={m.endX + 10} 
                        y={m.endY} 
                        fill="#facc15" 
                        fontSize="14" 
                        fontFamily="monospace"
                        style={{ textShadow: '1px 1px 0 #000' }}
                        className="pointer-events-none select-none"
                      >
                        {m.value.toFixed(1)} mm
                        {m.type === 'roi' && ` | Area: ${area.toFixed(0)} mm²`}
                      </text>
                   </g>
                 )})}

                 {/* Render Active Drawing (During Creation) */}
                 {currentMeasurement && (
                    <g>
                       {currentMeasurement.type === 'ruler' ? (
                         <line 
                           x1={currentMeasurement.startX} 
                           y1={currentMeasurement.startY} 
                           x2={currentMeasurement.endX} 
                           y2={currentMeasurement.endY} 
                           stroke="#22d3ee" strokeWidth="2" strokeDasharray="4" vectorEffect="non-scaling-stroke"
                         />
                       ) : (
                         <ellipse 
                            cx={(currentMeasurement.startX + currentMeasurement.endX)/2} 
                            cy={(currentMeasurement.startY + currentMeasurement.endY)/2} 
                            rx={Math.abs(currentMeasurement.endX - currentMeasurement.startX)/2} 
                            ry={Math.abs(currentMeasurement.endY - currentMeasurement.startY)/2} 
                            stroke="#22d3ee" strokeWidth="2" strokeDasharray="4" fill="transparent" vectorEffect="non-scaling-stroke"
                          />
                       )}
                       <circle cx={currentMeasurement.startX} cy={currentMeasurement.startY} r={handleRadius} fill="#22d3ee" />
                       <circle cx={currentMeasurement.endX} cy={currentMeasurement.endY} r={handleRadius} fill="#22d3ee" />
                       
                       <text x={currentMeasurement.endX + 10} y={currentMeasurement.endY} fill="#22d3ee" fontSize="14" fontFamily="monospace">
                          {currentMeasurement.value.toFixed(1)} mm
                       </text>
                    </g>
                 )}
              </svg>

            </div>
          </div>

          <div className="absolute bottom-16 left-4 text-xs font-mono text-white drop-shadow-md pointer-events-none z-30 space-y-1">
              <div>Zoom: {zoom.toFixed(2)}x</div>
              <div>WW: {windowWidth.toFixed(0)} WC: {windowCenter.toFixed(0)}</div>
              {activeTool && <div className="text-cyan-400 uppercase font-bold">TOOL: {activeTool}</div>}
              {activeEdit && <div className="text-yellow-400 uppercase font-bold text-[10px]">EDITING ANNOTATION</div>}
          </div>

          {/* Slice Indicator */}
          <div className="absolute bottom-16 right-4 text-xs font-mono text-white drop-shadow-md text-right pointer-events-none z-30 space-y-1">
              <div>Im: {currentSlice} / {totalSlices}</div>
              <div className="text-[10px] text-slate-400">{study.studyInstanceUID.substring(0, 25)}...</div>
          </div>

          {/* Slice Scrollbar */}
          {totalSlices > 1 && (
            <div className="absolute right-2 top-1/4 bottom-1/4 w-1 bg-slate-800/50 rounded-full overflow-hidden z-20">
               <div 
                 className="w-full bg-cyan-500 transition-all duration-75"
                 style={{ 
                   height: `${(1/totalSlices) * 100}%`,
                   top: `${((currentSlice-1)/totalSlices) * 100}%`,
                   position: 'relative'
                 }}
               />
            </div>
          )}

        </div>

        {/* Right Series Selector */}
        <div className="w-24 bg-[#050505] border-l border-slate-800 flex flex-col overflow-y-auto shrink-0">
          <div className="p-1 text-[9px] text-slate-500 font-bold uppercase tracking-wider text-center border-b border-slate-800">
             Series
          </div>
          {[1, 2, 3, 4].map((series) => (
            <div 
              key={series} 
              className={`
                aspect-square m-1 bg-black border rounded cursor-pointer relative group overflow-hidden
                ${series === 1 ? 'border-cyan-500 shadow-[0_0_10px_-2px_rgba(6,182,212,0.3)]' : 'border-slate-800 hover:border-slate-600'}
              `}
            >
               <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_var(--tw-gradient-stops))] from-slate-700 to-black opacity-50" />
               <div className="absolute bottom-0.5 left-1 text-[8px] text-cyan-500 font-mono">S:{series}</div>
               <div className="absolute top-0.5 right-1 text-[8px] text-slate-300 font-mono">{totalSlices}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Control Bar */}
      <div className="h-14 bg-[#0a0a0a] border-t border-slate-800 flex items-center justify-between px-4 shrink-0 z-40">
         <div className="w-1/3 flex items-center gap-4">
             {totalSlices > 1 && (
               <div className="flex items-center gap-1 bg-slate-900 rounded-lg p-1 border border-slate-800">
                  <button onClick={() => setCurrentSlice(1)} className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded"><SkipBack size={14} /></button>
                  <button onClick={() => setIsPlaying(!isPlaying)} className={`p-1.5 rounded ${isPlaying ? 'text-cyan-400 bg-cyan-900/30' : 'text-slate-300 hover:text-white hover:bg-slate-800'}`}>
                    {isPlaying ? <Pause size={14} /> : <Play size={14} />}
                  </button>
                  <button onClick={() => setCurrentSlice(totalSlices)} className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded"><FastForward size={14} /></button>
               </div>
             )}
             {isPlaying && (
                <div className="flex items-center gap-2 text-[10px] text-slate-400">
                   <span>Speed:</span>
                   <input 
                    type="range" min="1" max="30" value={frameRate} 
                    onChange={(e) => setFrameRate(parseInt(e.target.value))} 
                    className="w-16 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer" 
                   />
                   <span>{frameRate} fps</span>
                </div>
             )}
         </div>

         <div className="w-1/3 flex justify-center">
             {totalSlices > 1 && (
                <div className="flex items-center gap-3">
                    <button onClick={() => setCurrentSlice(s => Math.max(1, s-1))} className="text-slate-500 hover:text-white"><ChevronLeft size={20} /></button>
                    <div className="text-center">
                      <div className="text-lg font-bold text-white font-mono leading-none">{currentSlice}</div>
                      <div className="text-[9px] text-slate-500 uppercase tracking-widest">Image</div>
                    </div>
                    <button onClick={() => setCurrentSlice(s => Math.min(totalSlices, s+1))} className="text-slate-500 hover:text-white"><ChevronRight size={20} /></button>
                </div>
             )}
         </div>
         
         <div className="w-1/3 flex items-center justify-end gap-3 text-xs text-slate-500 font-mono">
            <Monitor size={16} />
         </div>
      </div>
    </div>
  );
};

const ToolButton = ({ icon, active = false, onClick, label }: { icon: React.ReactNode, active?: boolean, onClick?: () => void, label: string }) => (
  <button 
    onClick={onClick}
    className={`
      p-2 rounded-lg transition-all duration-200 group relative w-10 h-10 flex items-center justify-center
      ${active 
        ? 'bg-cyan-600 text-white shadow-[0_0_10px_-2px_rgba(8,145,178,0.5)] border border-cyan-400' 
        : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-transparent'}
    `}
  >
    {icon}
    <div className="absolute left-12 bg-slate-900 text-slate-200 text-[10px] px-2 py-1.5 rounded border border-slate-700 opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-[100] transition-opacity shadow-xl">
       {label}
    </div>
  </button>
);
