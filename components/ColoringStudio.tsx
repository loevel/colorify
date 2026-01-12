
import React, { useRef, useState, useEffect } from 'react';
import { 
  ArrowLeft, Save, Undo, Redo, ZoomIn, ZoomOut, 
  Eraser, Download, Highlighter, PenTool, Sparkles, Plus, X, AlertTriangle, Loader2, Lock, Palette, Maximize2, Minimize2
} from 'lucide-react';
import { SavedPage } from '../types';
import { updatePageWork } from '../services/storageService';

interface Props {
  page: SavedPage;
  onBack: () => void;
  onSave: () => void;
  userId: string;
}

const BRUSH_SIZES = [5, 10, 20, 40];
const ZOOM_LEVELS = [0.5, 0.75, 1, 1.25, 1.5, 2, 2.5, 3];
type BrushType = 'marker' | 'crayon' | 'glitter';

const BLEND_MODES: { label: string; value: GlobalCompositeOperation }[] = [
  { label: 'Normal', value: 'source-over' },
  { label: 'Multiply', value: 'multiply' },
];

const ColoringStudio: React.FC<Props> = ({ page, onBack, onSave, userId }) => {
  // Canvas refs
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const lineArtRef = useRef<HTMLImageElement>(null); // Reference to the visible line art image
  const autoSaveRef = useRef<() => void>(() => {});
  
  // State
  const [activeColor, setActiveColor] = useState<string>(page.palette[0] || '#FF5733');
  const [tool, setTool] = useState<'brush' | 'eraser'>('brush');
  const [brushType, setBrushType] = useState<BrushType>('marker');
  const [brushSize, setBrushSize] = useState(10);
  const [zoomIndex, setZoomIndex] = useState(2); // Start at 100% (index 2)
  const [isDrawing, setIsDrawing] = useState(false);
  const [blendMode, setBlendMode] = useState<GlobalCompositeOperation>('source-over');
  
  const [isCanvasReady, setIsCanvasReady] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [isTainted, setIsTainted] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);

  // UI State
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showBrushSettings, setShowBrushSettings] = useState(false);

  // Palette State
  const [customPalette, setCustomPalette] = useState<string[]>([]);
  const [recentColors, setRecentColors] = useState<string[]>([]);
  
  // History State
  const [history, setHistory] = useState<ImageData[]>([]);
  const [redoStack, setRedoStack] = useState<ImageData[]>([]);
  
  const [isSaving, setIsSaving] = useState(false);
  
  // Unsaved Changes State
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showExitDialog, setShowExitDialog] = useState(false);

  // Storage Keys
  const customPaletteKey = `colorcraft_custom_palette_${userId}`;
  const recentColorsKey = `colorcraft_recent_colors_${userId}`;

  // Load Palettes
  useEffect(() => {
    try {
      const storedCustom = localStorage.getItem(customPaletteKey);
      if (storedCustom) setCustomPalette(JSON.parse(storedCustom));
      
      const storedRecent = localStorage.getItem(recentColorsKey);
      if (storedRecent) setRecentColors(JSON.parse(storedRecent));
    } catch (e) {
      console.error("Failed to load palettes", e);
    }
  }, [customPaletteKey, recentColorsKey]);

  // Handle ESC key to exit full screen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullScreen) {
        setIsFullScreen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullScreen]);

  // Save Custom Palette Helper
  const saveCustomPalette = (colors: string[]) => {
    setCustomPalette(colors);
    localStorage.setItem(customPaletteKey, JSON.stringify(colors));
  };
  
  const addToRecent = (color: string) => {
    setRecentColors(prev => {
      const filtered = prev.filter(c => c !== color);
      const updated = [color, ...filtered].slice(0, 10); // Keep last 10
      localStorage.setItem(recentColorsKey, JSON.stringify(updated));
      return updated;
    });
  };

  const addCurrentColorToPalette = () => {
    if (!customPalette.includes(activeColor)) {
      saveCustomPalette([...customPalette, activeColor]);
    }
  };

  // Initialize Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    setIsCanvasReady(false);
    setLoadError(false);
    setIsTainted(false);

    let base = page.coloredUrl || page.originalUrl;
    const symbol = base.includes('?') ? '&' : '?';
    const isDataUrl = base.startsWith('data:');
    const urlToLoad = isDataUrl ? base : `${base}${symbol}v=${page.lastModified}`;

    const setupCanvas = (img: HTMLImageElement, isTaintedMode: boolean) => {
      canvas.width = img.width;
      canvas.height = img.height;
      
      if (page.coloredUrl) {
         ctx.drawImage(img, 0, 0);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
      
      try {
        const initialState = ctx.getImageData(0, 0, canvas.width, canvas.height);
        setHistory([initialState]);
        setRedoStack([]);
        setHasUnsavedChanges(false);
        setIsTainted(isTaintedMode);
        setIsCanvasReady(true);
      } catch (e) {
        console.warn("Canvas tainted, saving disabled");
        setIsTainted(true);
        setIsCanvasReady(true);
      }
    };

    const imgSecure = new Image();
    if (!isDataUrl) imgSecure.crossOrigin = "anonymous";
    imgSecure.src = urlToLoad;

    imgSecure.onload = () => setupCanvas(imgSecure, false);
    imgSecure.onerror = () => {
      const imgInsecure = new Image();
      imgInsecure.src = urlToLoad;
      imgInsecure.onload = () => setupCanvas(imgInsecure, true);
      imgInsecure.onerror = () => {
        setLoadError(true);
        setIsCanvasReady(true);
      };
    };

  }, [page.id, page.coloredUrl, page.originalUrl, page.lastModified]);

  const saveHistory = () => {
    if (isTainted) return; 
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    try {
      const newState = ctx.getImageData(0, 0, canvas.width, canvas.height);
      setHistory(prev => {
        const newHistory = [...prev, newState];
        return newHistory.length > 20 ? newHistory.slice(newHistory.length - 20) : newHistory;
      });
      setRedoStack([]);
    } catch (e) { console.error(e); }
  };

  const handleUndo = () => {
    if (history.length <= 1) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    const previousState = history[history.length - 2];
    setRedoStack(prev => [...prev, history[history.length - 1]]);
    setHistory(prev => prev.slice(0, -1));
    ctx.putImageData(previousState, 0, 0);
    setHasUnsavedChanges(true);
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    const stateToRestore = redoStack[redoStack.length - 1];
    setHistory(prev => [...prev, stateToRestore]);
    setRedoStack(prev => prev.slice(0, -1));
    ctx.putImageData(stateToRestore, 0, 0);
    setHasUnsavedChanges(true);
  };

  // --- Texture Generation ---
  const createTexturePattern = (type: 'crayon' | 'glitter', color: string): HTMLCanvasElement | null => {
    const size = 64;
    const cvs = document.createElement('canvas');
    cvs.width = size;
    cvs.height = size;
    const ctx = cvs.getContext('2d');
    if (!ctx) return null;

    ctx.fillStyle = color;
    ctx.fillRect(0, 0, size, size);

    if (type === 'crayon') {
      for (let i = 0; i < 600; i++) {
        ctx.fillStyle = `rgba(255,255,255,${0.2 + Math.random() * 0.3})`;
        const w = Math.random() * 2;
        ctx.fillRect(Math.random() * size, Math.random() * size, w, w);
      }
      for (let i = 0; i < 300; i++) {
        ctx.fillStyle = `rgba(0,0,0,${0.1 + Math.random() * 0.1})`;
        ctx.fillRect(Math.random() * size, Math.random() * size, 1, 1);
      }
    } else if (type === 'glitter') {
      for (let i = 0; i < 80; i++) {
        ctx.fillStyle = `rgba(255, 255, 255, ${0.5 + Math.random() * 0.5})`;
        const x = Math.random() * size;
        const y = Math.random() * size;
        const r = 1 + Math.random() * 1.5;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
        if (i % 12 === 0) {
           ctx.fillStyle = '#FFFFFF';
           ctx.save();
           ctx.translate(x, y);
           ctx.rotate(Math.random() * Math.PI);
           const l = 3 + Math.random() * 3;
           ctx.fillRect(-l/2, -0.5, l, 1);
           ctx.fillRect(-0.5, -l/2, 1, l);
           ctx.restore();
        }
      }
    }
    return cvs;
  };

  // Drawing Handlers
  const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }
    return { x: (clientX - rect.left) * scaleX, y: (clientY - rect.top) * scaleY };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isCanvasReady) return;
    if ('touches' in e) e.preventDefault();
    setIsDrawing(true);
    const { x, y } = getCoordinates(e);
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = brushSize;
    
    if (tool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.globalAlpha = 1.0;
      ctx.strokeStyle = '#000000';
    } else {
      ctx.globalCompositeOperation = blendMode;
      if (brushType === 'marker') {
        ctx.globalAlpha = 0.6;
        ctx.strokeStyle = activeColor;
      } else {
        ctx.globalAlpha = 1.0;
        const texture = createTexturePattern(brushType, activeColor);
        if (texture) {
          const pattern = ctx.createPattern(texture, 'repeat');
          ctx.strokeStyle = pattern || activeColor;
        } else {
          ctx.strokeStyle = activeColor;
        }
      }
    }
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    if ('touches' in e) e.preventDefault();
    const { x, y } = getCoordinates(e);
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      saveHistory();
      setHasUnsavedChanges(true);
      if (tool === 'brush') {
        addToRecent(activeColor);
      }
    }
  };

  const handleSave = async (download = false, exitAfter = false) => {
    if (isTainted) {
      alert("Cannot save: Image loaded in restricted mode.");
      return;
    }

    setIsSaving(true);
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Create a temporary canvas for compositing
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const ctx = tempCanvas.getContext('2d');
    if (!ctx) return;

    // 1. Fill white background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
    
    // 2. Draw the colored layer (User's work)
    ctx.drawImage(canvas, 0, 0);

    // 3. Draw the Line Art on top (Multiply mode)
    // We use the already loaded image ref to avoid fetching issues and race conditions
    if (lineArtRef.current && lineArtRef.current.complete) {
        ctx.save();
        ctx.globalCompositeOperation = 'multiply';
        ctx.drawImage(lineArtRef.current, 0, 0, tempCanvas.width, tempCanvas.height);
        ctx.restore();
    } else {
        // Fallback: If for some reason ref isn't ready (unlikely), try to load again
        const lineArtImg = new Image();
        lineArtImg.crossOrigin = "anonymous";
        const base = page.originalUrl;
        const symbol = base.includes('?') ? '&' : '?';
        lineArtImg.src = `${base}${symbol}v=${page.lastModified}`;
        
        await new Promise<void>((resolve) => {
          lineArtImg.onload = () => {
            ctx.globalCompositeOperation = 'multiply';
            ctx.drawImage(lineArtImg, 0, 0, tempCanvas.width, tempCanvas.height);
            resolve();
          };
          lineArtImg.onerror = () => {
             console.error("Failed to load line art for save fallback");
             resolve();
          };
        });
    }

    try {
      const finalDataUrl = tempCanvas.toDataURL('image/webp', 0.85);
      if (download) {
        const link = document.createElement('a');
        link.download = `ColorCraft_${page.childName}_${page.theme}.webp`;
        link.href = finalDataUrl;
        link.click();
        setIsSaving(false);
        return;
      }
      await updatePageWork(userId, page.theme, page.id, finalDataUrl);
      setHasUnsavedChanges(false);
      onSave(); 
    } catch (e) {
      console.error(e);
      alert("Failed to save work.");
    } finally {
      setIsSaving(false);
    }
    if (exitAfter) onBack();
  };

  const handleBack = () => {
    if (hasUnsavedChanges && !isTainted) setShowExitDialog(true);
    else onBack();
  };

  useEffect(() => {
    autoSaveRef.current = () => {
      if (hasUnsavedChanges && !isSaving && !isTainted) handleSave(false, false);
    };
  });

  useEffect(() => {
    const interval = setInterval(() => { if (autoSaveRef.current) autoSaveRef.current(); }, 120000); 
    return () => clearInterval(interval);
  }, []);

  // --- UI Components ---

  const FloatingDock = () => (
    <div className={`absolute bottom-6 left-1/2 transform -translate-x-1/2 flex flex-col items-center gap-4 z-40 w-full px-4 max-w-2xl pointer-events-none transition-all duration-300 ${isFullScreen ? 'opacity-80 hover:opacity-100' : 'opacity-100'}`}>
      
      {/* Color Picker Popover */}
      {showColorPicker && (
        <div className="bg-white/90 backdrop-blur-xl border border-white/20 p-4 rounded-3xl shadow-2xl animate-fade-in-up w-full pointer-events-auto max-w-md mx-auto">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase">Colors</span>
            <button onClick={() => setShowColorPicker(false)}><X size={16} className="text-slate-400" /></button>
          </div>
          
          <div className="grid grid-cols-6 gap-3 mb-4">
             {page.palette.map((c, i) => (
                <button key={`pal-${i}`} onClick={() => { setActiveColor(c); setTool('brush'); }} className={`w-8 h-8 rounded-full border-2 transition-transform ${activeColor === c ? 'border-indigo-500 scale-110' : 'border-transparent'}`} style={{ backgroundColor: c }} />
             ))}
             {recentColors.slice(0, 6).map((c, i) => (
                <button key={`rec-${i}`} onClick={() => { setActiveColor(c); setTool('brush'); }} className={`w-8 h-8 rounded-full border-2 transition-transform ${activeColor === c ? 'border-indigo-500 scale-110' : 'border-transparent'}`} style={{ backgroundColor: c }} />
             ))}
          </div>
          
          <div className="h-px bg-slate-200 my-2"></div>
          
          <div className="flex items-center gap-3">
             <div className="relative flex-1 h-10 rounded-full overflow-hidden border border-slate-200">
               <input type="color" value={activeColor} onChange={(e) => setActiveColor(e.target.value)} className="absolute -top-4 -left-4 w-32 h-32 cursor-pointer" />
               <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-xs font-bold text-slate-500 mix-blend-difference text-white">Custom Mix</div>
             </div>
             <button onClick={addCurrentColorToPalette} className="p-2 bg-slate-100 rounded-full text-indigo-600"><Plus size={20}/></button>
          </div>
        </div>
      )}

      {/* Main Dock */}
      <div className="bg-white/80 backdrop-blur-xl border border-white/40 shadow-2xl shadow-slate-200/50 rounded-full p-2 flex items-center gap-2 pointer-events-auto">
         {/* Drawing Tools */}
         <div className="flex items-center gap-1 bg-slate-100/50 rounded-full p-1">
            <button onClick={() => { setTool('brush'); setBrushType('marker'); }} className={`p-3 rounded-full transition-all ${tool === 'brush' && brushType === 'marker' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:bg-white'}`}>
               <PenTool size={20} />
            </button>
            <button onClick={() => { setTool('brush'); setBrushType('crayon'); }} className={`p-3 rounded-full transition-all ${tool === 'brush' && brushType === 'crayon' ? 'bg-orange-500 text-white shadow-lg' : 'text-slate-500 hover:bg-white'}`}>
               <Highlighter size={20} />
            </button>
            <button onClick={() => { setTool('brush'); setBrushType('glitter'); }} className={`p-3 rounded-full transition-all ${tool === 'brush' && brushType === 'glitter' ? 'bg-purple-500 text-white shadow-lg' : 'text-slate-500 hover:bg-white'}`}>
               <Sparkles size={20} />
            </button>
            <button onClick={() => setTool('eraser')} className={`p-3 rounded-full transition-all ${tool === 'eraser' ? 'bg-slate-700 text-white shadow-lg' : 'text-slate-500 hover:bg-white'}`}>
               <Eraser size={20} />
            </button>
         </div>

         <div className="w-px h-8 bg-slate-300 mx-1"></div>

         {/* Color Trigger */}
         <button 
           onClick={() => setShowColorPicker(!showColorPicker)}
           className="w-12 h-12 rounded-full border-4 border-white shadow-md transition-transform active:scale-95 relative"
           style={{ backgroundColor: activeColor }}
         >
           <span className="absolute -top-1 -right-1 bg-white rounded-full p-1 shadow-sm">
             <Palette size={10} className="text-slate-600" />
           </span>
         </button>

         <div className="w-px h-8 bg-slate-300 mx-1"></div>

         {/* Size & Settings */}
         <div className="flex items-center gap-1">
             <div className="flex flex-col gap-1 mx-2">
                {BRUSH_SIZES.map(size => (
                   <button 
                     key={size}
                     onClick={() => setBrushSize(size)}
                     className={`rounded-full transition-all ${brushSize === size ? 'bg-slate-800' : 'bg-slate-300'}`}
                     style={{ width: Math.max(4, size/3), height: Math.max(4, size/3) }} 
                   />
                ))}
             </div>
         </div>
         
         <div className="w-px h-8 bg-slate-300 mx-1"></div>

         {/* Undo/Redo */}
         <div className="flex items-center gap-1">
           <button onClick={handleUndo} disabled={history.length <= 1} className="p-3 text-slate-600 hover:text-slate-900 disabled:opacity-30">
              <Undo size={20} />
           </button>
           <button onClick={handleRedo} disabled={redoStack.length === 0} className="p-3 text-slate-600 hover:text-slate-900 disabled:opacity-30">
              <Redo size={20} />
           </button>
         </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 bg-slate-50 flex flex-col h-screen overflow-hidden">
      {/* Top Floating Header */}
      {!isFullScreen && (
        <header className="absolute top-0 left-0 right-0 z-40 p-4 pointer-events-none">
           <div className="max-w-7xl mx-auto flex justify-between items-center">
              {/* Back & Title */}
              <div className="bg-white/80 backdrop-blur-md shadow-sm border border-white/50 rounded-full px-4 py-2 flex items-center gap-3 pointer-events-auto">
                 <button onClick={handleBack} className="p-1.5 hover:bg-slate-100 rounded-full text-slate-600 transition-colors">
                   <ArrowLeft size={20} />
                 </button>
                 <div className="h-4 w-px bg-slate-200"></div>
                 <h2 className="font-bold text-slate-800 text-sm">{page.theme}</h2>
              </div>

              {/* Actions */}
              <div className="bg-white/80 backdrop-blur-md shadow-sm border border-white/50 rounded-full p-1 flex items-center gap-1 pointer-events-auto">
                 <button onClick={() => setZoomIndex(Math.max(0, zoomIndex - 1))} className="p-2 text-slate-500 hover:bg-slate-100 rounded-full">
                    <ZoomOut size={18} />
                 </button>
                 <span className="text-xs font-bold text-slate-400 w-8 text-center">{Math.round(ZOOM_LEVELS[zoomIndex] * 100)}%</span>
                 <button onClick={() => setZoomIndex(Math.min(ZOOM_LEVELS.length - 1, zoomIndex + 1))} className="p-2 text-slate-500 hover:bg-slate-100 rounded-full">
                    <ZoomIn size={18} />
                 </button>
                 <div className="h-4 w-px bg-slate-200 mx-1"></div>
                 <button onClick={() => setIsFullScreen(true)} className="p-2 text-slate-500 hover:bg-slate-100 rounded-full" title="Full Screen">
                    <Maximize2 size={18} />
                 </button>
                 <div className="h-4 w-px bg-slate-200 mx-1"></div>
                 {isTainted ? (
                   <div className="px-3 flex items-center gap-1 text-amber-600 text-xs font-bold"><Lock size={12}/> View Only</div>
                 ) : (
                   <>
                     <button onClick={() => handleSave(false)} className="px-4 py-2 bg-slate-900 text-white rounded-full font-bold text-sm hover:bg-slate-800 transition-colors flex items-center gap-2">
                        {isSaving ? <Loader2 size={16} className="animate-spin" /> : "Save"}
                     </button>
                     <button onClick={() => handleSave(true)} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-full" title="Download">
                        <Download size={20} />
                     </button>
                   </>
                 )}
              </div>
           </div>
        </header>
      )}

      {/* Exit Full Screen Button */}
      {isFullScreen && (
        <button 
          onClick={() => setIsFullScreen(false)}
          className="absolute top-4 right-4 z-50 bg-white/80 backdrop-blur shadow-sm border border-slate-200 p-2 rounded-full text-slate-600 hover:bg-white hover:text-slate-900 transition-colors"
          title="Exit Full Screen"
        >
          <Minimize2 size={24} />
        </button>
      )}

      {/* Main Canvas Area */}
      <div 
        ref={containerRef}
        className={`flex-1 overflow-auto flex items-center justify-center relative cursor-crosshair touch-none bg-slate-50 transition-all duration-500 ${isFullScreen ? 'p-0' : 'p-8'}`}
      >
        {!isCanvasReady && !loadError && (
           <div className="absolute inset-0 flex flex-col items-center justify-center z-50 bg-slate-50/80 backdrop-blur-sm">
              <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
              <p className="font-bold text-slate-600 animate-pulse">Opening Studio...</p>
           </div>
        )}
        
        {loadError && (
           <div className="absolute inset-0 flex flex-col items-center justify-center z-50">
              <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
              <p className="text-slate-600 mb-6">Failed to load drawing.</p>
              <button onClick={onBack} className="px-6 py-3 bg-white border rounded-xl font-bold">Go Back</button>
           </div>
        )}

        <div 
          className="relative shadow-2xl shadow-slate-300/50 bg-white transition-all duration-300 rounded-lg overflow-hidden ring-1 ring-slate-900/5"
          style={{ 
            transform: `scale(${ZOOM_LEVELS[zoomIndex]})`,
            transformOrigin: 'center center',
            opacity: isCanvasReady ? 1 : 0
          }}
        >
          <canvas
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
            className="block"
          />
          <img 
            ref={lineArtRef}
            src={page.originalUrl} 
            alt="outline" 
            className="absolute inset-0 w-full h-full pointer-events-none select-none"
            style={{ mixBlendMode: 'multiply' }}
            crossOrigin={isTainted ? undefined : "anonymous"} 
          />
        </div>
      </div>

      <FloatingDock />
      
      {/* Confirmation Dialog */}
      {showExitDialog && (
        <div className="fixed inset-0 z-[100] bg-black/20 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-6 animate-fade-in-up border border-slate-100">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Unsaved Changes</h3>
              <p className="text-slate-600 mb-6">
                You have unsaved work. If you leave now, your masterpiece will be lost!
              </p>
              <div className="flex flex-col w-full gap-2">
                <button onClick={() => handleSave(false, true)} className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold transition-colors">
                  Save & Exit
                </button>
                <button onClick={() => { setShowExitDialog(false); onBack(); }} className="w-full py-3 bg-white border border-slate-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200 text-slate-700 rounded-2xl font-bold transition-colors">
                  Discard Changes
                </button>
                <button onClick={() => setShowExitDialog(false)} className="w-full py-3 text-slate-500 hover:text-slate-700 font-medium text-sm">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ColoringStudio;
