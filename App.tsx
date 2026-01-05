import React, { useState, useEffect } from 'react';
import { GeneratorConfig, GeneratedImage, SavedPage, ViewMode, User } from './types';
import GeneratorForm from './components/GeneratorForm';
import ImageGallery from './components/ImageGallery';
import ChatBot from './components/ChatBot';
import ColoringStudio from './components/ColoringStudio';
import Library from './components/Library';
import Auth from './components/Auth';
import { generateScenes, generateColoringPage } from './services/geminiService';
import { createColoringBookPDF, printColoringBookPDF } from './services/pdfService';
import { saveToLibrary, getLibrary } from './services/storageService';
import { getCurrentUser, logout } from './services/authService';
import { Pencil, Grid, PlusCircle, LogOut, User as UserIcon } from 'lucide-react';

const App: React.FC = () => {
  // Auth State
  const [user, setUser] = useState<User | null>(null);

  // Navigation State
  const [view, setView] = useState<ViewMode>('generator');
  
  // Data State
  const [config, setConfig] = useState<GeneratorConfig>({
    childName: '',
    theme: '',
    imageSize: '1K',
  });
  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [libraryPages, setLibraryPages] = useState<SavedPage[]>([]);
  const [selectedPageForStudio, setSelectedPageForStudio] = useState<SavedPage | null>(null);

  // Status State
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [needsApiKey, setNeedsApiKey] = useState(false);

  // Check for API key presence and User
  const checkApiKey = async () => {
    if (window.aistudio && window.aistudio.hasSelectedApiKey) {
      const hasKey = await window.aistudio.hasSelectedApiKey();
      setNeedsApiKey(!hasKey);
      return hasKey;
    }
    return true; 
  };

  useEffect(() => {
    checkApiKey();
    const currentUser = getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
      setLibraryPages(getLibrary(currentUser.id));
    }
  }, []);

  useEffect(() => {
    if (user) {
      loadLibrary();
    }
  }, [user]);

  const loadLibrary = () => {
    if (user) {
      setLibraryPages(getLibrary(user.id));
    }
  };

  const handleSelectKey = async () => {
    if (window.aistudio && window.aistudio.openSelectKey) {
      await window.aistudio.openSelectKey();
      setNeedsApiKey(false);
    }
  };

  const handleLogout = () => {
    logout();
    setUser(null);
    setImages([]);
    setLibraryPages([]);
    setConfig({ childName: '', theme: '', imageSize: '1K' });
  };

  const handleGenerate = async () => {
    if (!user) return;
    const hasKey = await checkApiKey();
    if (!hasKey) return;

    if (!config.theme || !config.childName) return;

    setIsGenerating(true);
    setImages([]);

    try {
      // 1. Generate Scenes
      const sceneConcepts = await generateScenes(config.theme);
      
      const placeholders: GeneratedImage[] = sceneConcepts.map((concept, i) => ({
        id: `img-${Date.now()}-${i}`, // Unique ID for storage later
        url: '',
        prompt: concept.description,
        palette: concept.palette,
        loading: true,
      }));
      setImages(placeholders);

      // 2. Generate Images in parallel
      const imagePromises = sceneConcepts.map(async (concept, index) => {
        try {
          const url = await generateColoringPage(concept.description, config.imageSize);
          
          setImages(prev => prev.map(img => 
             img.prompt === concept.description ? { ...img, url, loading: false } : img
          ));
          
          // Auto-save to library immediately when successful
          saveToLibrary(user.id, config.childName, config.theme, {
            id: placeholders[index].id,
            url,
            prompt: concept.description,
            palette: concept.palette,
            loading: false
          });
          loadLibrary(); // Refresh library count

          return url;
        } catch (error) {
          console.error(`Failed to generate image ${index}:`, error);
          setImages(prev => prev.map(img => 
            img.prompt === concept.description ? { 
              ...img, 
              loading: false, 
              error: "Unable to draw this page." 
            } : img
          ));
          return null;
        }
      });

      await Promise.all(imagePromises);

    } catch (error) {
      console.error("Generation failed:", error);
      if (error instanceof Error && error.message.includes("Requested entity was not found")) {
         setNeedsApiKey(true);
      } else {
         alert("Something went wrong generating the book. Please try again.");
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadPDF = async () => {
    setIsDownloading(true);
    try {
      const validImages = images.filter(img => img.url && !img.loading && !img.error);
      if (validImages.length === 0) {
        alert("No pages were successfully generated to create a book.");
        return;
      }
      await createColoringBookPDF(config.childName, config.theme, validImages);
    } catch (error) {
      console.error("PDF generation failed:", error);
      alert("Failed to generate PDF.");
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePrintPDF = async () => {
    const validImages = images.filter(img => img.url && !img.loading && !img.error);
    if (validImages.length === 0) return;
    try {
      printColoringBookPDF(config.childName, config.theme, validImages);
    } catch (error) {
      console.error("Print failed:", error);
    }
  };

  // Studio Handlers
  const handleOpenStudio = (page: SavedPage) => {
    setSelectedPageForStudio(page);
    setView('studio');
  };

  const handleColorGeneratedImage = (img: GeneratedImage) => {
    if (!user) return;
    // Ensure it's saved first
    const saved = saveToLibrary(user.id, config.childName, config.theme, img);
    loadLibrary();
    handleOpenStudio(saved);
  };

  if (!user) {
    return <Auth onLogin={setUser} />;
  }

  // Render Studio Full Screen
  if (view === 'studio' && selectedPageForStudio) {
    return (
      <ColoringStudio 
        page={selectedPageForStudio} 
        onBack={() => {
          setView('library');
          loadLibrary();
        }}
        onSave={() => loadLibrary()}
        userId={user.id}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setView('generator')}>
            <div className="bg-gradient-to-br from-pink-500 to-indigo-600 text-white p-2 rounded-lg shadow-sm">
              <Pencil size={20} />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-600 to-indigo-600 comic-font tracking-wide">
              ColorCraft
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex bg-slate-100 p-1 rounded-full hidden md:flex">
              <button 
                onClick={() => setView('generator')}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all flex items-center gap-2 ${view === 'generator' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <PlusCircle size={16} /> New Book
              </button>
              <button 
                onClick={() => {
                  loadLibrary();
                  setView('library');
                }}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all flex items-center gap-2 ${view === 'library' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <Grid size={16} /> My Library
              </button>
            </div>

            <div className="h-6 w-px bg-slate-200 hidden md:block"></div>

            <div className="flex items-center gap-3">
              <div className="flex flex-col items-end hidden sm:flex">
                <span className="text-sm font-bold text-slate-700">{user.name}</span>
                <span className="text-xs text-slate-400">Artist</span>
              </div>
              <button 
                onClick={handleLogout}
                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                title="Log Out"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Nav */}
      <div className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t border-slate-200 z-50 p-2 flex justify-around">
          <button 
            onClick={() => setView('generator')}
            className={`flex flex-col items-center p-2 rounded-lg ${view === 'generator' ? 'text-indigo-600' : 'text-slate-400'}`}
          >
            <PlusCircle size={24} />
            <span className="text-[10px] font-bold">New</span>
          </button>
          <button 
            onClick={() => setView('library')}
            className={`flex flex-col items-center p-2 rounded-lg ${view === 'library' ? 'text-indigo-600' : 'text-slate-400'}`}
          >
            <Grid size={24} />
            <span className="text-[10px] font-bold">Library</span>
          </button>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-24 md:pb-10">
        {view === 'generator' && (
          <>
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4 comic-font">
                Make Your Own Coloring Book!
              </h1>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                Turn any idea into a printable coloring adventure. Just type a theme, and our magic AI will draw it for you.
              </p>
            </div>

            <GeneratorForm
              config={config}
              setConfig={setConfig}
              onGenerate={handleGenerate}
              isGenerating={isGenerating}
              needsApiKey={needsApiKey}
              onSelectKey={handleSelectKey}
            />

            <ImageGallery 
              images={images} 
              onDownloadPDF={handleDownloadPDF} 
              onPrintPDF={handlePrintPDF}
              onColorImage={handleColorGeneratedImage}
              isDownloading={isDownloading}
              childName={config.childName}
            />
          </>
        )}

        {view === 'library' && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold text-slate-800 comic-font">My Collection</h2>
              <span className="text-slate-500">{libraryPages.length} Drawings</span>
            </div>
            
            <Library 
              pages={libraryPages} 
              onOpenStudio={handleOpenStudio}
              onRefresh={loadLibrary}
              userId={user.id}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="text-center py-8 text-slate-400 text-sm hidden md:block">
        <p>© {new Date().getFullYear()} ColorCraft. Powered by Gemini.</p>
      </footer>

      <ChatBot />
    </div>
  );
};

export default App;
