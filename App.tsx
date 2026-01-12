
import React, { useState, useEffect, Suspense, lazy } from 'react';
import { GeneratorConfig, GeneratedImage, SavedPage, ViewMode, User } from './types';
import GeneratorForm from './components/GeneratorForm';
import ImageGallery from './components/ImageGallery';
import ChatBot from './components/ChatBot';
// Lazy load components to save initial bandwidth
const ColoringStudio = lazy(() => import('./components/ColoringStudio'));
const Library = lazy(() => import('./components/Library'));
const SubscriptionPage = lazy(() => import('./components/SubscriptionPage'));
const PrivacyPage = lazy(() => import('./components/PrivacyPage'));
const TermsPage = lazy(() => import('./components/TermsPage'));
const ContactPage = lazy(() => import('./components/ContactPage'));
const AboutPage = lazy(() => import('./components/AboutPage'));
const AdminDashboard = lazy(() => import('./components/AdminDashboard'));

import Auth from './components/Auth';
import LandingPage from './components/LandingPage';
import { generateScenes, generateColoringPage } from './services/geminiService';
import { createColoringBookPDF, printColoringBookPDF } from './services/pdfService';
import { saveToLibrary, getLibrary } from './services/storageService';
import { subscribeToAuthChanges, logout } from './services/authService';
import { Pencil, Grid, PlusCircle, LogOut, Loader2, Crown, Shield } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from './services/firebaseConfig';

const App: React.FC = () => {
  // Auth State
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [showAuth, setShowAuth] = useState(false);

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
  const [processingId, setProcessingId] = useState<string | null>(null); // For specific image actions
  const [isDownloading, setIsDownloading] = useState(false);
  const [needsApiKey, setNeedsApiKey] = useState(false);
  const [libraryLoading, setLibraryLoading] = useState(false);

  // Check for API key presence
  const checkApiKey = async () => {
    if (window.aistudio && window.aistudio.hasSelectedApiKey) {
      const hasKey = await window.aistudio.hasSelectedApiKey();
      setNeedsApiKey(!hasKey);
      return hasKey;
    }
    return true; 
  };

  // Initialize Auth Listener
  useEffect(() => {
    checkApiKey();
    const unsubscribe = subscribeToAuthChanges((currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Load Library when user logs in
  useEffect(() => {
    if (user) {
      loadLibrary();
    } else {
      setLibraryPages([]);
    }
  }, [user]);

  const loadLibrary = async () => {
    if (user) {
      setLibraryLoading(true);
      try {
        const pages = await getLibrary(user.id);
        setLibraryPages(pages);
      } catch (e) {
        console.error("Error loading library", e);
      } finally {
        setLibraryLoading(false);
      }
    }
  };

  const refreshUserProfile = async () => {
    if (!user) return;
    try {
      const userDoc = await getDoc(doc(db, "users", user.id));
      if (userDoc.exists()) {
        const data = userDoc.data();
        setUser(prev => prev ? { 
          ...prev, 
          subscriptionTier: data.subscriptionTier || 'free',
          subscriptionStatus: data.subscriptionStatus || 'active',
          accountType: data.accountType || 'personal',
          children: data.children || []
        } : null);
      }
    } catch (e) {
      console.error("Failed to refresh user profile", e);
    }
  };

  const handleSelectKey = async () => {
    if (window.aistudio && window.aistudio.openSelectKey) {
      await window.aistudio.openSelectKey();
      setNeedsApiKey(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    setUser(null);
    setShowAuth(false); // Reset to landing page on logout
    setImages([]);
    setLibraryPages([]);
    setConfig({ childName: '', theme: '', imageSize: '1K' });
    setView('generator'); // Reset view
  };

  const handleGenerate = async () => {
    if (!user) return;
    const hasKey = await checkApiKey();
    if (!hasKey) return;

    if (!config.theme || !config.childName) return;

    // Basic Subscription Check (In a real app, strict limits would be backend enforced)
    if (user.subscriptionTier === 'free' && images.length > 0 && view === 'generator') {
       // Just a soft UX hint, not a hard block for this demo
       console.log("Free tier user generating images");
    }

    setIsGenerating(true);
    setImages([]);

    try {
      // 1. Generate Scenes
      const sceneConcepts = await generateScenes(config.theme);
      
      const placeholders: GeneratedImage[] = sceneConcepts.map((concept, i) => ({
        id: `img-${Date.now()}-${i}`,
        url: '',
        prompt: concept.description,
        palette: concept.palette,
        loading: true,
      }));
      setImages(placeholders);

      // 2. Generate Images in parallel
      const imagePromises = sceneConcepts.map(async (concept, index) => {
        try {
          // If user is Pro/Unlimited, they can request higher quality. 
          // If Free, force 1K or handle in generateColoringPage logic.
          const url = await generateColoringPage(concept.description, config.imageSize);
          
          setImages(prev => prev.map(img => 
             img.prompt === concept.description ? { ...img, url, loading: false } : img
          ));
          
          // Auto-save to Firebase
          await saveToLibrary(user.id, config.childName, config.theme, {
            id: placeholders[index].id,
            url,
            prompt: concept.description,
            palette: concept.palette,
            loading: false
          });
          
          // Refresh library in background (don't await strictly)
          loadLibrary(); 

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
    if (user?.subscriptionTier === 'free') {
       alert("Downloading PDFs is a premium feature. Please upgrade to Pro!");
       setView('subscription');
       return;
    }
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

  const handleColorGeneratedImage = async (img: GeneratedImage) => {
    if (!user) return;
    setProcessingId(img.id); // Show specific loading on the button
    try {
        const saved = await saveToLibrary(user.id, config.childName, config.theme, img);
        
        // Use the base64 url from 'img' to ensure it loads instantly in studio and bypasses CORS/Network issues for this session
        const pageWithLocalUrl: SavedPage = { ...saved, originalUrl: img.url };
        
        await loadLibrary();
        handleOpenStudio(pageWithLocalUrl);
    } catch(e) {
        console.error("Studio open error", e);
        alert("Could not start coloring session. Cloud save failed.");
    } finally {
        setProcessingId(null);
    }
  };

  // Navigation Helper
  const navigateBack = () => {
    if (user) {
      setView('generator');
    } else {
      // If logged out, essentially "reload" LandingPage state by falling through
      setView('generator'); 
    }
  };

  const FullPageLoader = () => (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <Loader2 className="animate-spin text-indigo-600 w-10 h-10" />
    </div>
  );

  if (authLoading) {
    return <FullPageLoader />;
  }

  // Public Routes (Accessible regardless of Auth, but typically triggered from footer)
  if (view === 'privacy') return <Suspense fallback={<FullPageLoader />}><PrivacyPage onBack={navigateBack} /></Suspense>;
  if (view === 'terms') return <Suspense fallback={<FullPageLoader />}><TermsPage onBack={navigateBack} /></Suspense>;
  if (view === 'contact') return <Suspense fallback={<FullPageLoader />}><ContactPage onBack={navigateBack} /></Suspense>;
  if (view === 'about') return <Suspense fallback={<FullPageLoader />}><AboutPage onBack={navigateBack} /></Suspense>;

  // Not logged in routing
  if (!user) {
    if (showAuth) {
      return (
        <Auth 
          onLogin={() => {}} // Auth state handled by Firebase listener
          onBack={() => setShowAuth(false)} 
        />
      );
    }
    return <LandingPage onGetStarted={() => setShowAuth(true)} onNavigate={setView} />;
  }

  // Render Studio Full Screen
  if (view === 'studio' && selectedPageForStudio) {
    return (
      <Suspense fallback={<FullPageLoader />}>
        <ColoringStudio 
          page={selectedPageForStudio} 
          onBack={() => {
            setView('library');
            loadLibrary();
          }}
          onSave={() => loadLibrary()}
          userId={user.id}
        />
      </Suspense>
    );
  }

  // Admin Route
  if (view === 'admin' && user.isAdmin) {
    return (
      <Suspense fallback={<FullPageLoader />}>
        <div>
          {/* Simple header for admin to get back */}
          <div className="bg-slate-900 text-slate-400 p-2 text-xs flex justify-between px-6">
             <span>Admin Mode Active</span>
             <button onClick={() => setView('generator')} className="hover:text-white">Exit to App</button>
          </div>
          <AdminDashboard currentUser={user} />
        </div>
      </Suspense>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20 flex flex-col">
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
              <button 
                onClick={() => setView('subscription')}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all flex items-center gap-2 ${view === 'subscription' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <Crown size={16} className={user.subscriptionTier !== 'free' ? 'text-yellow-500 fill-yellow-500' : ''} /> 
                {user.subscriptionTier === 'free' ? 'Upgrade' : 'My Plan'}
              </button>
            </div>

            <div className="h-6 w-px bg-slate-200 hidden md:block"></div>

            <div className="flex items-center gap-3">
              {user.isAdmin && (
                <button 
                  onClick={() => setView('admin')}
                  className="p-2 bg-slate-900 text-white rounded-lg hover:bg-slate-700 shadow-sm transition-colors"
                  title="Admin Dashboard"
                >
                  <Shield size={18} />
                </button>
              )}
              
              <div className="flex flex-col items-end hidden sm:flex">
                <span className="text-sm font-bold text-slate-700">{user.name}</span>
                <span className="text-xs text-slate-400 capitalize">{user.accountType === 'family' ? 'Family Plan' : 'Personal'}</span>
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
          <button 
            onClick={() => setView('subscription')}
            className={`flex flex-col items-center p-2 rounded-lg ${view === 'subscription' ? 'text-indigo-600' : 'text-slate-400'}`}
          >
            <Crown size={24} className={user.subscriptionTier !== 'free' ? 'text-yellow-500 fill-yellow-500' : ''} />
            <span className="text-[10px] font-bold">Plan</span>
          </button>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-24 md:pb-10 flex-1 w-full">
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
              user={user}
            />

            <ImageGallery 
              images={images} 
              onDownloadPDF={handleDownloadPDF} 
              onPrintPDF={handlePrintPDF}
              onColorImage={handleColorGeneratedImage}
              isDownloading={isDownloading}
              processingId={processingId}
              childName={config.childName}
            />
          </>
        )}

        {view === 'library' && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold text-slate-800 comic-font">My Collection</h2>
              <span className="text-slate-500">
                  {libraryLoading ? 'Loading...' : `${libraryPages.length} Drawings`}
              </span>
            </div>
            
            {libraryLoading ? (
                 <div className="flex justify-center py-20">
                    <Loader2 className="animate-spin text-indigo-400 w-8 h-8" />
                 </div>
            ) : (
                <Suspense fallback={<Loader2 className="animate-spin" />}>
                  <Library 
                    pages={libraryPages} 
                    onOpenStudio={handleOpenStudio}
                    onRefresh={loadLibrary}
                    userId={user.id}
                  />
                </Suspense>
            )}
          </div>
        )}

        {view === 'subscription' && (
           <Suspense fallback={<Loader2 className="animate-spin" />}>
             <SubscriptionPage user={user} onUpdateUser={refreshUserProfile} />
           </Suspense>
        )}
      </main>

      {/* Footer */}
      <footer className="text-center py-8 text-slate-400 text-sm hidden md:block bg-slate-50 mt-auto">
        <div className="flex justify-center gap-6 mb-4">
            <button onClick={() => setView('about')} className="hover:text-indigo-600 transition-colors">About Us</button>
            <button onClick={() => setView('privacy')} className="hover:text-indigo-600 transition-colors">Privacy</button>
            <button onClick={() => setView('terms')} className="hover:text-indigo-600 transition-colors">Terms</button>
            <button onClick={() => setView('contact')} className="hover:text-indigo-600 transition-colors">Contact</button>
        </div>
        <p>© {new Date().getFullYear()} ColorCraft. Powered by Gemini & Firebase.</p>
      </footer>

      <ChatBot />
    </div>
  );
};

export default App;
