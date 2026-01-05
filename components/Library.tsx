import React, { useState } from 'react';
import { SavedPage } from '../types';
import { Pencil, Printer, Trash2, Clock, Loader2 } from 'lucide-react';
import { deletePage } from '../services/storageService';
import { printColoringBookPDF } from '../services/pdfService';

interface Props {
  pages: SavedPage[];
  onOpenStudio: (page: SavedPage) => void;
  onRefresh: () => void;
  userId: string;
}

const Library: React.FC<Props> = ({ pages, onOpenStudio, onRefresh, userId }) => {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this drawing from the cloud?")) {
      setDeletingId(id);
      try {
        await deletePage(userId, id);
        onRefresh();
      } catch (error) {
        alert("Failed to delete page.");
      } finally {
        setDeletingId(null);
      }
    }
  };

  const handlePrint = (page: SavedPage, e: React.MouseEvent) => {
    e.stopPropagation();
    // Wrap generic format for pdf service
    printColoringBookPDF(page.childName, page.theme, [{
      id: page.id,
      url: page.originalUrl,
      prompt: page.theme,
      loading: false
    }]);
  };

  if (pages.length === 0) {
    return (
      <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-300">
        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
           <Pencil size={32} />
        </div>
        <h3 className="text-xl font-bold text-slate-800 comic-font">Your library is empty</h3>
        <p className="text-slate-500 mt-2">Generate some pages to start your collection!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in-up">
      {pages.map((page) => (
        <div 
          key={page.id} 
          className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden group hover:shadow-lg transition-all cursor-pointer"
          onClick={() => onOpenStudio(page)}
        >
          <div className="aspect-[3/4] relative bg-slate-100">
            <img 
              src={page.thumbnailUrl || page.originalUrl} 
              alt={page.theme} 
              className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
            {/* Overlay Actions */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
              <button className="bg-white text-indigo-600 px-4 py-2 rounded-full font-bold flex items-center gap-2 transform hover:scale-110 transition-transform">
                <Pencil size={16} /> Color Now
              </button>
            </div>
          </div>
          
          <div className="p-4">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-bold text-slate-800 truncate pr-2" title={page.theme}>{page.theme}</h3>
              <div className="flex gap-1">
                 <button 
                  onClick={(e) => handlePrint(page, e)}
                  className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"
                  title="Print"
                 >
                   <Printer size={16} />
                 </button>
                 <button 
                  onClick={(e) => handleDelete(page.id, e)}
                  disabled={deletingId === page.id}
                  className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                  title="Delete"
                 >
                   {deletingId === page.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                 </button>
              </div>
            </div>
            <div className="flex justify-between items-center text-xs text-slate-400">
              <span className="flex items-center gap-1">
                For {page.childName}
              </span>
              <span className="flex items-center gap-1">
                <Clock size={12} />
                {new Date(page.lastModified).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Library;
