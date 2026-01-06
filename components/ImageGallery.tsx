
import React, { useState, useEffect } from 'react';
import { Download, Palette, AlertCircle, Printer, Paintbrush, Loader2 } from 'lucide-react';
import { GeneratedImage } from '../types';

interface Props {
  images: GeneratedImage[];
  onDownloadPDF: () => void;
  onPrintPDF: () => void;
  onColorImage: (img: GeneratedImage) => void;
  isDownloading: boolean;
  processingId: string | null;
  childName: string;
}

const LOADING_STEPS = [
  "Preparing canvas...",
  "Sketching outlines...",
  "Refining shapes...",
  "Adding details...",
  "Cleaning up lines...",
  "Finalizing page..."
];

const LoadingPlaceholder: React.FC<{ prompt: string }> = ({ prompt }) => {
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    // Advance status message every 2 seconds, but don't loop indefinitely on the last step
    const interval = setInterval(() => {
      setStepIndex((prev) => (prev < LOADING_STEPS.length - 1 ? prev + 1 : prev));
    }, 2000); 
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50 text-slate-400 p-4 text-center">
      <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
      <p className="text-sm font-bold text-indigo-600 animate-pulse transition-all duration-500">
        {LOADING_STEPS[stepIndex]}
      </p>
      <p className="text-xs mt-2 opacity-60 max-w-[90%] truncate">
        {prompt}
      </p>
    </div>
  );
};

const ImageGallery: React.FC<Props> = ({ images, onDownloadPDF, onPrintPDF, onColorImage, isDownloading, processingId, childName }) => {
  if (images.length === 0) return null;

  // Check if at least one image loaded successfully
  const hasSuccessfulImages = images.some(img => img.url && !img.loading && !img.error);
  const allFinished = images.every(img => !img.loading);

  return (
    <div className="mt-12 animate-fade-in-up">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <h2 className="text-3xl font-bold text-slate-800 comic-font">Preview Pages</h2>
        
        {allFinished && hasSuccessfulImages && (
          <div className="flex gap-3">
            <button
              onClick={onPrintPDF}
              disabled={isDownloading}
              className="px-6 py-3 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 hover:border-indigo-300 rounded-full font-bold shadow-sm transition-all flex items-center gap-2 transform hover:scale-105"
            >
              <Printer size={20} />
              Print Book
            </button>
            <button
              onClick={onDownloadPDF}
              disabled={isDownloading}
              className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-full font-bold shadow-lg shadow-green-200 transition-all flex items-center gap-2 transform hover:scale-105"
            >
              {isDownloading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <Download size={20} />
              )}
              Download PDF
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {images.map((img) => (
          <div key={img.id} className="flex flex-col gap-3">
            <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-slate-100 group relative aspect-[3/4] flex items-center justify-center">
              {img.loading ? (
                <LoadingPlaceholder prompt={img.prompt} />
              ) : img.error ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50 p-6 text-center border-2 border-slate-100 border-dashed m-2 rounded-xl">
                  <div className="w-12 h-12 bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-3">
                     <AlertCircle size={24} />
                  </div>
                  <p className="text-slate-600 font-bold mb-1">Drawing Failed</p>
                  <p className="text-slate-400 text-xs">{img.error}</p>
                </div>
              ) : (
                <>
                  <img 
                    src={img.url} 
                    alt="Coloring Page" 
                    className="w-full h-full object-contain p-4 transition-transform duration-500 group-hover:scale-105" 
                  />
                  {/* Overlay for actions - Ensure z-index is high enough to be clickable */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors pointer-events-none flex items-center justify-center z-10">
                      <button 
                        onClick={() => onColorImage(img)}
                        disabled={processingId !== null}
                        className={`bg-white text-indigo-600 px-6 py-3 rounded-full font-bold shadow-lg transform transition-all duration-300 flex items-center gap-2 pointer-events-auto hover:bg-indigo-50 border border-indigo-100 ${
                          processingId === img.id ? 'opacity-100 translate-y-0' : 'translate-y-10 group-hover:translate-y-0 opacity-0 group-hover:opacity-100'
                        }`}
                      >
                         {processingId === img.id ? (
                           <>
                             <Loader2 size={20} className="animate-spin" />
                             Opening Studio...
                           </>
                         ) : (
                           <>
                             <Paintbrush size={20} /> Color Now
                           </>
                         )}
                      </button>
                  </div>
                </>
              )}
            </div>
            
            {/* Show palette even if error, as the concept was valid */}
            {!img.loading && img.palette && (
              <div className={`bg-white rounded-xl p-3 shadow-sm border border-slate-100 flex items-center justify-between ${img.error ? 'opacity-50 grayscale' : ''}`}>
                <div className="flex items-center gap-2 text-slate-500 text-xs font-medium">
                  <Palette size={14} />
                  <span>Idea</span>
                </div>
                <div className="flex gap-2">
                  {img.palette.map((color, i) => (
                    <div
                      key={i}
                      className="w-6 h-6 rounded-full border border-slate-200 shadow-sm"
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ImageGallery;
