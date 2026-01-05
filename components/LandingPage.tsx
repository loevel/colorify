
import React from 'react';
import { Sparkles, Printer, Palette, Zap, Shield, ArrowRight, Heart, Star, Check } from 'lucide-react';
import { PLANS } from '../services/subscriptionService';
import { ViewMode } from '../types';

interface Props {
  onGetStarted: () => void;
  onNavigate: (view: ViewMode) => void;
}

const LandingPage: React.FC<Props> = ({ onGetStarted, onNavigate }) => {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed w-full bg-white/80 backdrop-blur-md z-50 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-br from-pink-500 to-indigo-600 text-white p-1.5 rounded-lg shadow-sm">
              <Palette size={20} />
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-600 to-indigo-600 comic-font tracking-wide">
              ColorCraft
            </span>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={onGetStarted}
              className="text-slate-600 hover:text-indigo-600 font-medium text-sm transition-colors"
            >
              Log In
            </button>
            <button 
              onClick={onGetStarted}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full font-bold text-sm shadow-md shadow-indigo-200 transition-all hover:scale-105"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-indigo-50 via-white to-white overflow-hidden relative">
        <div className="absolute top-20 right-0 -mr-20 opacity-20 hidden lg:block pointer-events-none">
           <svg width="400" height="400" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
             <path fill="#4F46E5" d="M44.7,-76.4C58.9,-69.2,71.8,-59.1,79.6,-46.3C87.4,-33.5,90.1,-18,88.5,-3.3C86.9,11.4,81,25.3,71.5,36.4C62,47.5,48.9,55.8,35.6,63.1C22.3,70.4,8.8,76.7,-3.7,83.1C-16.2,89.5,-27.7,96,-38.3,92.5C-48.9,89,-58.6,75.5,-66.6,61.9C-74.6,48.3,-80.9,34.6,-83.1,20.2C-85.3,5.8,-83.4,-9.3,-76.3,-22.3C-69.2,-35.3,-56.9,-46.2,-44.1,-53.9C-31.3,-61.6,-18,-66.1,-3.5,-60.1C11,-54,22,-37.4,30.5,-32.8" transform="translate(100 100)" />
           </svg>
        </div>

        <div className="max-w-7xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-100 text-pink-700 text-xs font-bold mb-6 animate-fade-in-up">
            <Sparkles size={12} />
            <span>AI-Powered Imagination</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 mb-6 comic-font leading-tight animate-fade-in-up">
            Infinite Coloring Books,<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500">
              Powered by Magic
            </span>
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-in-up animation-delay-100">
            Turn your child's wildest ideas into custom, printable coloring pages in seconds. From "Space Dinosaurs" to "Underwater Unicorns," if they can dream it, we can draw it.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up animation-delay-200">
            <button 
              onClick={onGetStarted}
              className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-lg shadow-xl shadow-indigo-200 transition-all transform hover:-translate-y-1 flex items-center gap-2"
            >
              Start Creating for Free <ArrowRight size={20} />
            </button>
            <button 
               onClick={onGetStarted} // Simplified for demo
               className="px-8 py-4 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl font-bold text-lg transition-all flex items-center gap-2"
            >
               View Gallery
            </button>
          </div>

          {/* Social Proof */}
          <div className="mt-12 flex items-center justify-center gap-8 text-slate-400 grayscale opacity-70">
             <div className="flex items-center gap-1"><Star size={16} fill="currentColor" /> 4.9/5 Rating</div>
             <div className="w-1 h-1 bg-slate-300 rounded-full"></div>
             <div>Trusted by 10,000+ Parents</div>
          </div>
        </div>
      </div>

      {/* Feature Grid */}
      <div className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4 comic-font">Everything You Need</h2>
            <p className="text-slate-500 max-w-xl mx-auto">We've built the perfect tool for creative kids and busy parents.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-pink-100 text-pink-600 rounded-2xl flex items-center justify-center mb-6">
                <Zap size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">Instant Generation</h3>
              <p className="text-slate-600">
                Describe a scene and watch as AI generates a professional-grade coloring outline in seconds.
              </p>
            </div>
            
            <div className="p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mb-6">
                <Printer size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">Print & PDF Export</h3>
              <p className="text-slate-600">
                Download high-quality PDFs formatted perfectly for standard letter or A4 paper.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center mb-6">
                <Palette size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">Digital Studio</h3>
              <p className="text-slate-600">
                No printer? No problem. Use our built-in digital coloring studio with crayons, markers, and glitter.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      <div className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4 comic-font">Simple Pricing for Every Family</h2>
            <p className="text-slate-500 max-w-xl mx-auto">Choose the perfect plan to unleash your child's creativity.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {PLANS.map((plan) => (
              <div 
                key={plan.id}
                className={`relative p-8 rounded-3xl bg-white transition-all duration-300 hover:translate-y-[-8px] ${plan.highlight ? 'border-2 border-indigo-500 shadow-xl scale-105 z-10' : 'border border-slate-200 shadow-sm hover:shadow-md'}`}
              >
                {plan.highlight && (
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-indigo-600 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                    Most Popular
                  </div>
                )}
                
                <h3 className="text-xl font-bold text-slate-800 mb-2">{plan.name}</h3>
                <div className="flex items-baseline mb-4">
                  <span className="text-4xl font-extrabold text-slate-900">${plan.price / 100}</span>
                  <span className="text-slate-500 ml-1">/month</span>
                </div>
                <p className="text-slate-500 text-sm mb-6 pb-6 border-b border-slate-100">{plan.description}</p>
                
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm">
                      <div className={`mt-0.5 rounded-full p-0.5 ${feature.included ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-300'}`}>
                        <Check size={12} strokeWidth={3} />
                      </div>
                      <span className={feature.included ? 'text-slate-700' : 'text-slate-400 line-through'}>{feature.text}</span>
                    </li>
                  ))}
                </ul>

                <button 
                  onClick={onGetStarted}
                  className={`w-full py-3 rounded-xl font-bold transition-colors ${
                    plan.highlight 
                      ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200' 
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  {plan.price === 0 ? 'Start for Free' : 'Choose ' + plan.name}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* How it Works */}
      <div className="py-24 bg-indigo-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
           <div className="flex flex-col md:flex-row items-center gap-12">
             <div className="flex-1">
               <h2 className="text-3xl md:text-4xl font-bold mb-6 comic-font">How it Works</h2>
               <div className="space-y-8">
                 <div className="flex gap-4">
                   <div className="w-8 h-8 rounded-full bg-indigo-500 flex-shrink-0 flex items-center justify-center font-bold border border-indigo-400">1</div>
                   <div>
                     <h4 className="font-bold text-lg">Enter a Theme</h4>
                     <p className="text-indigo-200 text-sm">Type anything like "A cat riding a skateboard in space".</p>
                   </div>
                 </div>
                 <div className="flex gap-4">
                   <div className="w-8 h-8 rounded-full bg-indigo-500 flex-shrink-0 flex items-center justify-center font-bold border border-indigo-400">2</div>
                   <div>
                     <h4 className="font-bold text-lg">AI Creates the Art</h4>
                     <p className="text-indigo-200 text-sm">Our advanced Gemini AI drafts unique outlines instantly.</p>
                   </div>
                 </div>
                 <div className="flex gap-4">
                   <div className="w-8 h-8 rounded-full bg-indigo-500 flex-shrink-0 flex items-center justify-center font-bold border border-indigo-400">3</div>
                   <div>
                     <h4 className="font-bold text-lg">Print or Color</h4>
                     <p className="text-indigo-200 text-sm">Save to your library, print it out, or color on your tablet.</p>
                   </div>
                 </div>
               </div>
               <button 
                onClick={onGetStarted}
                className="mt-10 px-8 py-3 bg-white text-indigo-900 rounded-xl font-bold shadow-lg hover:bg-indigo-50 transition-colors"
               >
                 Try it Now
               </button>
             </div>
             
             <div className="flex-1 relative">
                <div className="absolute inset-0 bg-indigo-500 blur-3xl opacity-20 rounded-full"></div>
                <div className="relative bg-white rounded-2xl p-4 shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-500">
                  <div className="aspect-[3/4] bg-slate-100 rounded-lg flex items-center justify-center border-2 border-dashed border-slate-300">
                    <div className="text-center p-8">
                       <Sparkles className="mx-auto text-indigo-400 mb-2" size={48} />
                       <p className="text-slate-400 font-bold">Your Image Here</p>
                    </div>
                  </div>
                </div>
             </div>
           </div>
        </div>
      </div>

      {/* Safety Section */}
      <div className="py-20 bg-slate-50">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <Shield className="w-12 h-12 text-green-500 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-slate-800 mb-4 comic-font">Safe & Kid-Friendly</h2>
          <p className="text-slate-600 mb-8">
            We use advanced filters to ensure all generated content is appropriate for children. 
            No ads, no tracking, just pure creativity.
          </p>
          <div className="flex justify-center gap-4">
            <div className="flex items-center gap-2 text-slate-500 bg-white px-4 py-2 rounded-lg shadow-sm">
              <Heart size={16} className="text-red-400" /> Parent Approved
            </div>
            <div className="flex items-center gap-2 text-slate-500 bg-white px-4 py-2 rounded-lg shadow-sm">
              <Shield size={16} className="text-green-400" /> Secure Data
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 text-white p-1 rounded">
              <Palette size={16} />
            </div>
            <span className="font-bold text-slate-800 comic-font">ColorCraft</span>
          </div>
          <div className="text-slate-400 text-sm">
            © {new Date().getFullYear()} ColorCraft. All rights reserved.
          </div>
          <div className="flex gap-6 text-slate-500 text-sm">
            <button onClick={() => onNavigate('privacy')} className="hover:text-indigo-600 transition-colors">Privacy</button>
            <button onClick={() => onNavigate('terms')} className="hover:text-indigo-600 transition-colors">Terms</button>
            <button onClick={() => onNavigate('contact')} className="hover:text-indigo-600 transition-colors">Contact</button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
