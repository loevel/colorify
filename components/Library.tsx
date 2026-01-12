
import React, { useState, useEffect } from 'react';
import { SavedPage } from '../types';
import { Pencil, Printer, Trash2, Clock, Loader2, Filter, User } from 'lucide-react';
import { deletePage } from '../services/storageService';
import { printColoringBookPDF } from '../services/pdfService';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../services/firebaseConfig';
import { User as AppUser } from '../types';

interface Props {
  pages: SavedPage[];
  onOpenStudio: (page: SavedPage) => void;
  onRefresh: () => void;
  userId: string;
  activeProfileId?: string | null;
}

const Library: React.FC<Props> = ({ pages, onOpenStudio, onRefresh, userId, activeProfileId }) => {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [user, setUser] = useState<AppUser | null>(null);
  const [selectedChildFilter, setSelectedChildFilter] = useState<string>('all');

  // Fetch user details to get children list for filtering
  useEffect(() => {
    const fetchUser = async () => {
       try {
         const snap = await getDoc(doc(db, "users", userId));
         if (snap.exists()) {
            const userData = { id: snap.id, ...snap.data() } as AppUser;
            setUser(userData);
            
            // If activeProfileId is passed (we are in a specific child's space), 
            // set the filter to that child's name automatically.
            if (activeProfileId && userData.children) {
               const activeChild = userData.children.find(c => c.id === activeProfileId);
               if (activeChild) {
                 setSelectedChildFilter(activeChild.name);
               }
            }
         }
       } catch (e) {
         console.error(e);
       }
    };
    fetchUser();
  }, [userId, activeProfileId]);

  const handleDelete = async (page: SavedPage, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this drawing from the cloud?")) {
      setDeletingId(page.id);
      try {
        await deletePage(userId, page.theme, page.id);
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
    printColoringBookPDF(page.childName, page.theme, [{
      id: page.id,
      url: page.originalUrl,
      prompt: page.theme,
      loading: false
    }]);
  };

  const filteredPages = selectedChildFilter === 'all' 
     ? pages 
     : pages.filter(p => p.childName === selectedChildFilter);

  // Get unique names from pages just in case user deleted a child profile but kept drawings
  const childrenWithDrawings = Array.from(new Set(pages.map(p => p.childName)));

  // If we are in a specific child space, we don't show the filter UI or empty state for "all",
  // we just show their specific empty state.
  const isChildSpace = !!activeProfileId;

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
    <div className="animate-fade-in-up">
      {/* Family Filter Bar - Only show if NOT in a specific child space */}
      {!isChildSpace && user && user.accountType === 'family' && childrenWithDrawings.length > 0 && (
         <div className="mb-8 flex items-center gap-3 overflow-x-auto pb-2">
            <div className="flex items-center gap-2 text-slate-400 text-sm font-bold mr-2">
               <Filter size={16} /> Filter:
            </div>
            <button 
               onClick={() => setSelectedChildFilter('all')}
               className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all ${selectedChildFilter === 'all' ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}
            >
               All Drawings
            </button>
            {user.children && user.children.map(child => (
               <button 
                 key={child.id}
                 onClick={() => setSelectedChildFilter(child.name)}
                 className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap flex items-center gap-2 transition-all ${selectedChildFilter === child.name ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}
               >
                 <User size={14} /> {child.name}
               </button>
            ))}
            {/* Handle drawings from names not currently in children list (deleted profiles) */}
            {childrenWithDrawings.filter(name => !user.children?.find(c => c.name === name)).map(name => (
               <button 
                 key={name}
                 onClick={() => setSelectedChildFilter(name)}
                 className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap flex items-center gap-2 opacity-70 transition-all ${selectedChildFilter === name ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}
               >
                 <User size={14} /> {name}
               </button>
            ))}
         </div>
      )}

      {filteredPages.length === 0 ? (
         <div className="text-center py-20 bg-slate-50 rounded-3xl">
            <p className="text-slate-500">No drawings found for {selectedChildFilter}.</p>
            {!isChildSpace && (
               <button onClick={() => setSelectedChildFilter('all')} className="text-indigo-600 font-bold text-sm mt-2 hover:underline">View All</button>
            )}
         </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPages.map((page) => (
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
                      onClick={(e) => handleDelete(page, e)}
                      disabled={deletingId === page.id}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                      title="Delete"
                    >
                      {deletingId === page.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                    </button>
                  </div>
                </div>
                <div className="flex justify-between items-center text-xs text-slate-400">
                  <span className="flex items-center gap-1 font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                    <User size={10} /> {page.childName}
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
      )}
    </div>
  );
};

export default Library;
