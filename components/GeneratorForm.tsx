
import React from 'react';
import { Sparkles, Palette, Users } from 'lucide-react';
import { GeneratorConfig, ImageSize, User } from '../types';

interface Props {
  config: GeneratorConfig;
  setConfig: React.Dispatch<React.SetStateAction<GeneratorConfig>>;
  onGenerate: () => void;
  isGenerating: boolean;
  needsApiKey: boolean;
  onSelectKey: () => void;
  user: User | null;
}

const POPULAR_THEMES = [
  "Space Dinosaurs",
  "Magical Unicorns",
  "Underwater City",
  "Robot Superheroes",
  "Enchanted Forest Animals",
  "Race Cars on Mars"
];

const GeneratorForm: React.FC<Props> = ({ config, setConfig, onGenerate, isGenerating, needsApiKey, onSelectKey, user }) => {
  const handleChange = (field: keyof GeneratorConfig, value: string) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl p-8 max-w-2xl mx-auto border border-slate-100 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500"></div>
      
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-indigo-100 p-3 rounded-full text-indigo-600">
          <Palette size={24} />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 comic-font">Create Your Book</h2>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Child's Name</label>
          
          {/* Family Account Child Selector */}
          {user && user.accountType === 'family' && user.children.length > 0 && (
             <div className="flex flex-wrap gap-2 mb-3">
               {user.children.map(child => (
                 <button
                   key={child.id}
                   onClick={() => handleChange('childName', child.name)}
                   className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${config.childName === child.name ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-indigo-300'}`}
                 >
                    {child.name}
                 </button>
               ))}
               <div className="h-6 w-px bg-slate-200 mx-1"></div>
             </div>
          )}

          <input
            type="text"
            value={config.childName}
            onChange={(e) => handleChange('childName', e.target.value)}
            placeholder="e.g. Leo"
            className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 transition-all outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Theme</label>
          <input
            type="text"
            value={config.theme}
            onChange={(e) => handleChange('theme', e.target.value)}
            placeholder="e.g. Space Dinosaurs, Underwater Unicorns"
            className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 transition-all outline-none"
          />
          <div className="mt-3">
             <span className="text-xs text-slate-500 font-medium mr-2">Popular Ideas:</span>
             <div className="flex flex-wrap gap-2 mt-2">
               {POPULAR_THEMES.map(theme => (
                 <button
                   key={theme}
                   type="button"
                   onClick={() => handleChange('theme', theme)}
                   className="text-xs bg-slate-100 hover:bg-indigo-100 text-slate-600 hover:text-indigo-700 px-3 py-1.5 rounded-full transition-colors border border-slate-200"
                 >
                   {theme}
                 </button>
               ))}
             </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Image Quality</label>
          <div className="grid grid-cols-3 gap-3">
            {(['1K', '2K', '4K'] as ImageSize[]).map((size) => (
              <button
                key={size}
                onClick={() => handleChange('imageSize', size)}
                className={`py-2 px-4 rounded-xl border transition-all font-medium ${
                  config.imageSize === size
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-md transform scale-105'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
          <p className="text-xs text-slate-400 mt-2">
            Higher quality images (2K/4K) take longer to generate.
          </p>
        </div>

        {needsApiKey ? (
           <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mt-4">
             <p className="text-yellow-800 text-sm mb-3">
               To generate high-quality images with this model, you need to select a billing-enabled API key.
             </p>
             <button
                onClick={onSelectKey}
                className="w-full py-3 bg-yellow-600 hover:bg-yellow-700 text-white rounded-xl font-bold shadow-lg shadow-yellow-200 transition-all flex items-center justify-center gap-2"
             >
               Select API Key
             </button>
             <div className="mt-2 text-center">
                <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noreferrer" className="text-xs text-yellow-700 underline">
                  Learn more about billing
                </a>
             </div>
           </div>
        ) : (
          <button
            onClick={onGenerate}
            disabled={isGenerating || !config.childName || !config.theme}
            className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-bold text-lg shadow-lg shadow-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:-translate-y-1 active:translate-y-0 flex items-center justify-center gap-2 mt-4"
          >
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Creating Magic...
              </>
            ) : (
              <>
                <Sparkles size={20} />
                Generate Coloring Book
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default GeneratorForm;
