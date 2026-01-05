import React, { useRef, useState, useEffect } from 'react';
import { 
  ArrowLeft, Save, Undo, Redo, ZoomIn, ZoomOut, 
  Eraser, Paintbrush, Download, Highlighter, PenTool, Sparkles, Plus, Trash2, X, AlertTriangle, Layers
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
  { label: 'Screen', value: 'screen' },
  { label: 'Overlay', value: 'overlay' },
];

const ColoringStudio: React.FC<Props> = ({ page, onBack, onSave, userId }) => {
  // Canvas refs
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const autoSaveRef = useRef<() => void>(() => {});
  
  // State
  const [activeColor, setActiveColor] = useState<string>(page.palette[0] || '#FF5733');
  const [tool, setTool] = useState<'brush' | 'eraser'>('brush');
  const [brushType, setBrushType] = useState<BrushType>('marker');
  const [brushSize, setBrushSize] = useState(10);
  const [zoomIndex, setZoomIndex] = useState(2); // Start at 100% (index 2)
  const [isDrawing, setIsDrawing] = useState(false);
  const [blendMode, setBlendMode] = useState<GlobalCompositeOperation>('source-over');
  
  // Palette State
  const [customPalette, setCustomPalette] = useState<string[]>([]);
  const [recentColors, setRecentColors] = useState<string[]>([]);
  const [draggedColorIndex, setDraggedColorIndex] = useState<number | null>(null);
  
  // History State
  const [history, setHistory] = useState<ImageData[]>([]);
  const [redoStack, setRedoStack] = useState<ImageData[]>([]);
  
  const [isSaving, setIsSaving] = useState(false);
  
  // Unsaved Changes State
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showExitDialog, setShowExitDialog] = useState(false);

  // Storage Keys (Still local for preferences)
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

  const removeColorFromPalette = (colorToRemove: string, e: React.MouseEvent) => {
    e.stopPropagation();
    saveCustomPalette(customPalette.filter(c => c !== colorToRemove));
  };

  // Drag and Drop Handlers for Palette
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedColorIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // Necessary to allow dropping
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedColorIndex === null) return;
    
    const newPalette = [...customPalette];
    const [movedItem] = newPalette.splice(draggedColorIndex, 1);
    newPalette.splice(dropIndex, 0, movedItem);
    
    saveCustomPalette(newPalette);
    setDraggedColorIndex(null);
  };

  // Initialize Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    // Load initial state
    const img = new Image();
    // Use coloredUrl if it exists (progress), otherwise original
    img.src = page.coloredUrl || page.originalUrl; 
    img.crossOrigin = "anonymous";
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      
      if (page.coloredUrl) {
         // If we have previous work, draw it
         ctx.drawImage(img, 0, 0);
      } else {
        // If new, clear canvas (transparent) because the line art is an overlay
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
      
      // Save initial state to history without clearing redo (as it's init)
      const initialState = ctx.getImageData(0, 0, canvas.width, canvas.height);
      setHistory([initialState]);
      setRedoStack([]);
      setHasUnsavedChanges(false);
    };
  }, [page.id]);

  const saveHistory = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const newState = ctx.getImageData(0, 0, canvas.width, canvas.height);

    setHistory(prev => {
      // Limit history to 20 steps
      const newHistory = [...prev, newState];
      if (newHistory.length > 20) {
        return newHistory.slice(newHistory.length - 20);
      }
      return newHistory;
    });
    
    // Clear redo stack when new action is performed
    setRedoStack([]);
  };

  const handleUndo = () => {
    if (history.length <= 1) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    // Current state (to be moved to redo)
    const currentState = history[history.length - 1];
    
    // Previous state (to be restored)
    const previousState = history[history.length - 2];
    
    // Move current to redo stack
    setRedoStack(prev => [...prev, currentState]);
    
    // Remove current from history
    setHistory(prev => prev.slice(0, -1));
    
    // Restore canvas
    ctx.putImageData(previousState, 0, 0);
    setHasUnsavedChanges(true);
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    // State to restore
    const stateToRestore = redoStack[redoStack.length - 1];

    // Add to history
    setHistory(prev => [...prev, stateToRestore]);

    // Remove from redo
    setRedoStack(prev => prev.slice(0, -1));

    // Restore canvas
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

    // Fill background with color
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, size, size);

    if (type === 'crayon') {
      // Rough paper texture effect
      // Add noise
      for (let i = 0; i < 600; i++) {
        // White specs
        ctx.fillStyle = `rgba(255,255,255,${0.2 + Math.random() * 0.3})`;
        const w = Math.random() * 2;
        ctx.fillRect(Math.random() * size, Math.random() * size, w, w);
      }
      for (let i = 0; i < 300; i++) {
        // Dark specs for texture depth
        ctx.fillStyle = `rgba(0,0,0,${0.1 + Math.random() * 0.1})`;
        ctx.fillRect(Math.random() * size, Math.random() * size, 1, 1);
      }
    } else if (type === 'glitter') {
      // Sparkles
      for (let i = 0; i < 80; i++) {
        ctx.fillStyle = `rgba(255, 255, 255, ${0.5 + Math.random() * 0.5})`;
        const x = Math.random() * size;
        const y = Math.random() * size;
        const r = 1 + Math.random() * 1.5;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
        
        // Star shape occasionally
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

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
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
      
      // Apply texture brushes
      if (brushType === 'marker') {
        ctx.globalAlpha = 0.6; // Marker transparency
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

  // Saving Logic (Composite Layer)
  const handleSave = async (download = false, exitAfter = false) => {
    setIsSaving(true);
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Create a composite canvas
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const ctx = tempCanvas.getContext('2d');
    if (!ctx) return;

    // 1. Fill white background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

    // 2. Draw user artwork
    ctx.drawImage(canvas, 0, 0);

    // 3. Draw Line Art on top with Multiply
    const lineArtImg = new Image();
    lineArtImg.crossOrigin = "anonymous";
    lineArtImg.src = page.originalUrl;
    
    await new Promise<void>((resolve) => {
      lineArtImg.onload = () => {
        ctx.globalCompositeOperation = 'multiply';
        ctx.drawImage(lineArtImg, 0, 0, tempCanvas.width, tempCanvas.height);
        resolve();
      };
      // Fallback in case of error
      lineArtImg.onerror = () => resolve();
    });

    const finalDataUrl = tempCanvas.toDataURL('image/png');

    if (download) {
      const link = document.createElement('a');
      link.download = `ColorCraft_${page.childName}_${page.theme}.png`;
      link.href = finalDataUrl;
      link.click();
      setIsSaving(false);
      return;
    }

    // Save to Cloud Storage
    try {
        // Updated to pass the theme name as required by new storage logic
        await updatePageWork(userId, page.theme, page.id, finalDataUrl);
        setHasUnsavedChanges(false);
        onSave(); // Notify parent
    } catch (e) {
        alert("Failed to save work to cloud");
    } finally {
        setIsSaving(false);
    }

    if (exitAfter) {
      onBack();
    }
  };

  const handleBack = () => {
    if (hasUnsavedChanges) {
      setShowExitDialog(true);
    } else {
      onBack();
    }
  };

  // Auto-save Implementation
  useEffect(() => {
    autoSaveRef.current = () => {
      if (hasUnsavedChanges && !isSaving) {
        handleSave(false, false);
      }
    };
  }); // Updates on every render to capture latest state closure

  useEffect(() => {
    const interval = setInterval(() => {
      if (autoSaveRef.current) {
        autoSaveRef.current();
      }
    }, 120000); // 2 minutes

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-slate-100 flex flex-col h-screen">
      {/* Header Toolbar */}
      <div className="bg-white border-b border-slate-200 px-4 py-3 flex justify-between items-center shadow-sm z-10">
        <div className="flex items-center gap-3">
          <button onClick={handleBack} className="p-2 hover:bg-slate-100 rounded-full text-slate-600 transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="font-bold text-slate-800 leading-tight comic-font">{page.theme}</h2>
            <p className="text-xs text-slate-500">Artist: {page.childName}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={handleUndo} 
            disabled={history.length <= 1}
            className="p-2 text-slate-600 disabled:opacity-30 hover:bg-slate-100 rounded-lg"
            title="Undo"
          >
            <Undo size={20} />
          </button>
          <button 
            onClick={handleRedo} 
            disabled={redoStack.length === 0}
            className="p-2 text-slate-600 disabled:opacity-30 hover:bg-slate-100 rounded-lg"
            title="Redo"
          >
            <Redo size={20} />
          </button>
          <div className="h-6 w-px bg-slate-300 mx-1"></div>
          <button 
            onClick={() => handleSave(false)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full font-medium text-sm transition-colors"
          >
             {isSaving ? <span className="animate-spin">⌛</span> : <Save size={16} />}
             <span>Save</span>
          </button>
          <button 
            onClick={() => handleSave(true)}
            className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-full border border-indigo-200"
            title="Download Image"
          >
             <Download size={20} />
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar: Tools */}
        <div className="w-20 bg-white border-r border-slate-200 flex flex-col items-center py-4 gap-4 z-10 shadow-sm overflow-y-auto scrollbar-hide">
          {/* Tools */}
          <div className="flex flex-col gap-3 w-full px-2">
            <button
              onClick={() => { setTool('brush'); setBrushType('marker'); }}
              className={`p-3 rounded-xl flex flex-col items-center gap-1 transition-all ${tool === 'brush' && brushType === 'marker' ? 'bg-indigo-100 text-indigo-700 ring-2 ring-indigo-500 ring-offset-1' : 'text-slate-500 hover:bg-slate-50'}`}
              title="Marker: Semi-transparent ink for coloring"
            >
              <PenTool size={24} />
              <span className="text-[10px] font-bold">Marker</span>
            </button>
            
            <button
              onClick={() => { setTool('brush'); setBrushType('crayon'); }}
              className={`p-3 rounded-xl flex flex-col items-center gap-1 transition-all ${tool === 'brush' && brushType === 'crayon' ? 'bg-orange-100 text-orange-700 ring-2 ring-orange-500 ring-offset-1' : 'text-slate-500 hover:bg-slate-50'}`}
              title="Crayon: Rough, textured wax look"
            >
              <Highlighter size={24} />
              <span className="text-[10px] font-bold">Crayon</span>
            </button>

            <button
              onClick={() => { setTool('brush'); setBrushType('glitter'); }}
              className={`p-3 rounded-xl flex flex-col items-center gap-1 transition-all ${tool === 'brush' && brushType === 'glitter' ? 'bg-purple-100 text-purple-700 ring-2 ring-purple-500 ring-offset-1' : 'text-slate-500 hover:bg-slate-50'}`}
              title="Glitter: Sparkles and shines"
            >
              <Sparkles size={24} />
              <span className="text-[10px] font-bold">Glitter</span>
            </button>

            {/* Blend Mode Selection */}
            <div className="w-full px-1">
               <label className="text-[9px] font-bold text-slate-400 uppercase block text-center mb-1" title="How color interacts with the layer below">Blending</label>
               <div className="relative">
                 <select 
                   value={blendMode}
                   onChange={(e) => setBlendMode(e.target.value as GlobalCompositeOperation)}
                   className="w-full p-1 text-[10px] border border-slate-200 rounded bg-white text-slate-700 focus:outline-none focus:border-indigo-500 appearance-none text-center font-semibold"
                 >
                   {BLEND_MODES.map(m => (
                     <option key={m.value} value={m.value}>{m.label}</option>
                   ))}
                 </select>
               </div>
            </div>

            <div className="w-12 h-px bg-slate-200 my-1 mx-auto"></div>

            <button
              onClick={() => setTool('eraser')}
              className={`p-3 rounded-xl flex flex-col items-center gap-1 transition-all ${tool === 'eraser' ? 'bg-pink-100 text-pink-700 ring-2 ring-pink-500 ring-offset-1' : 'text-slate-500 hover:bg-slate-50'}`}
              title="Eraser: Remove mistakes"
            >
              <Eraser size={24} />
              <span className="text-[10px] font-bold">Eraser</span>
            </button>
          </div>

          <div className="w-12 h-px bg-slate-200"></div>

          {/* Size */}
          <div className="flex flex-col gap-2 items-center w-full">
            <span className="text-[10px] font-bold text-slate-400">SIZE</span>
            {BRUSH_SIZES.map(size => (
              <button
                key={size}
                onClick={() => setBrushSize(size)}
                title={`Brush Size: ${size}px`}
                className={`rounded-full bg-slate-800 transition-all ${brushSize === size ? 'ring-2 ring-indigo-500 ring-offset-2 scale-110' : 'opacity-40 hover:opacity-70'}`}
                style={{ width: Math.max(8, size/1.5), height: Math.max(8, size/1.5) }}
              />
            ))}
          </div>
          
           <div className="w-12 h-px bg-slate-200"></div>

           {/* Zoom Controls */}
           <div className="flex flex-col gap-2">
              <button 
                onClick={() => setZoomIndex(Math.min(ZOOM_LEVELS.length - 1, zoomIndex + 1))} 
                className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg active:scale-95 transition-transform"
                title="Zoom In"
              >
                <ZoomIn size={20} />
              </button>
              <span className="text-xs text-center font-medium text-slate-400">
                {Math.round(ZOOM_LEVELS[zoomIndex] * 100)}%
              </span>
              <button 
                onClick={() => setZoomIndex(Math.max(0, zoomIndex - 1))} 
                className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg active:scale-95 transition-transform"
                title="Zoom Out"
              >
                <ZoomOut size={20} />
              </button>
           </div>
        </div>

        {/* Main Canvas Area */}
        <div 
          ref={containerRef}
          className="flex-1 bg-slate-200/50 overflow-auto flex items-center justify-center p-8 relative cursor-crosshair touch-none"
        >
          <div 
            className="relative shadow-2xl bg-white"
            style={{ 
              transform: `scale(${ZOOM_LEVELS[zoomIndex]})`,
              transformOrigin: 'center center',
              transition: 'transform 0.2s ease-out'
            }}
          >
            {/* The Drawing Layer */}
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
            {/* The Outline Overlay (Interactions pass through to canvas) */}
            <img 
              src={page.originalUrl} 
              alt="outline" 
              className="absolute inset-0 w-full h-full pointer-events-none select-none"
              style={{ mixBlendMode: 'multiply' }}
              crossOrigin="anonymous"
            />
          </div>
        </div>

        {/* Right Sidebar: Colors */}
        <div className="w-64 bg-white border-l border-slate-200 flex flex-col z-10 shadow-sm">
          <div className="p-4 flex-1 overflow-y-auto">
             
             {/* Recent Colors */}
             {recentColors.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider mb-3">Recent</h3>
                  <div className="grid grid-cols-5 gap-2">
                    {recentColors.map((color, i) => (
                      <button
                        key={`recent-${i}`}
                        onClick={() => { setActiveColor(color); setTool('brush'); }}
                        className={`w-8 h-8 rounded-full shadow-sm border border-slate-200 transition-transform ${activeColor === color && tool === 'brush' ? 'ring-2 ring-indigo-500 ring-offset-2 scale-110' : 'hover:scale-105'}`}
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>
                </div>
             )}

             <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider mb-3">Suggestion</h3>
             <div className="grid grid-cols-4 gap-3 mb-6">
              {page.palette.map((color, i) => (
                <button
                  key={`pal-${i}`}
                  onClick={() => { setActiveColor(color); setTool('brush'); }}
                  className={`w-10 h-10 rounded-full shadow-sm border border-slate-200 transition-transform ${activeColor === color && tool === 'brush' ? 'ring-2 ring-indigo-500 ring-offset-2 scale-110' : 'hover:scale-105'}`}
                  style={{ backgroundColor: color }}
                  title="Suggested color"
                />
              ))}
             </div>

             {/* My Palette */}
             <div className="mb-6">
               <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider mb-3 flex items-center gap-2">
                 My Colors
               </h3>
               {customPalette.length === 0 ? (
                  <p className="text-xs text-slate-400 italic mb-2">Save custom colors below</p>
               ) : (
                 <div className="grid grid-cols-4 gap-3">
                    {customPalette.map((color, i) => (
                      <div 
                        key={`cust-${i}`} 
                        className="relative group"
                        draggable
                        onDragStart={(e) => handleDragStart(e, i)}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, i)}
                      >
                        <button
                          onClick={() => { setActiveColor(color); setTool('brush'); }}
                          className={`w-10 h-10 rounded-full shadow-sm border border-slate-200 transition-transform ${activeColor === color && tool === 'brush' ? 'ring-2 ring-indigo-500 ring-offset-2 scale-110' : 'hover:scale-105'} cursor-move`}
                          style={{ backgroundColor: color }}
                          title="Drag to reorder"
                        />
                        <button 
                          onClick={(e) => removeColorFromPalette(color, e)}
                          className="absolute -top-1 -right-1 bg-white text-slate-500 hover:text-red-500 rounded-full p-0.5 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity border border-slate-200 z-10"
                          title="Remove color"
                        >
                          <X size={10} />
                        </button>
                      </div>
                    ))}
                 </div>
               )}
             </div>

             <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider mb-3">Classic</h3>
             <div className="grid grid-cols-4 gap-3 pb-20">
               {['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FFA500', '#800080', '#00FFFF', '#FFC0CB', '#8B4513', '#000000', '#808080', '#FFFFFF'].map(c => (
                 <button
                   key={c}
                   onClick={() => { setActiveColor(c); setTool('brush'); }}
                   className={`w-10 h-10 rounded-full shadow-sm border border-slate-200 transition-transform ${activeColor === c && tool === 'brush' ? 'ring-2 ring-indigo-500 ring-offset-2 scale-110' : 'hover:scale-105'}`}
                   style={{ backgroundColor: c }}
                   title={c}
                 />
               ))}
             </div>
          </div>
          
          <div className="p-4 bg-slate-50 border-t border-slate-200">
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">Mixer</label>
                  <button 
                    onClick={addCurrentColorToPalette}
                    disabled={customPalette.includes(activeColor)}
                    className="text-xs flex items-center gap-1 text-indigo-600 font-bold hover:text-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Add current color to 'My Colors'"
                  >
                    <Plus size={12} /> Save Color
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <input 
                    type="color" 
                    value={activeColor}
                    onChange={(e) => { setActiveColor(e.target.value); setTool('brush'); }}
                    className="flex-1 h-10 rounded-lg cursor-pointer border-0 bg-transparent p-0"
                    title="Pick any color"
                  />
                </div>
          </div>
        </div>
      </div>
      
      {/* Confirmation Dialog */}
      {showExitDialog && (
        <div className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 animate-fade-in-up">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Unsaved Changes</h3>
              <p className="text-slate-600 mb-6">
                You have unsaved work. If you leave now, your masterpiece will be lost! Do you want to save it?
              </p>
              <div className="flex flex-col w-full gap-2">
                <button
                  onClick={() => handleSave(false, true)}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-colors"
                >
                  Save & Exit
                </button>
                <button
                  onClick={() => { setShowExitDialog(false); onBack(); }}
                  className="w-full py-3 bg-white border border-slate-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200 text-slate-700 rounded-xl font-bold transition-colors"
                >
                  Discard Changes
                </button>
                <button
                  onClick={() => setShowExitDialog(false)}
                  className="w-full py-3 text-slate-500 hover:text-slate-700 font-medium text-sm"
                >
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