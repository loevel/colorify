import React, { useState } from 'react';
import { Sparkles, Printer, Palette, Zap, Shield, ArrowRight, Heart, Star, Check, ChevronDown, ChevronUp, PlayCircle } from 'lucide-react';
import { PLANS } from '../services/subscriptionService';
import { ViewMode } from '../types';

interface Props {
  onGetStarted: () => void;
  onNavigate: (view: ViewMode) => void;
}

const FAQItem: React.FC<{ question: string; answer: string }> = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-slate-200">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-6 flex items-center justify-between text-left focus:outline-none"
      >
        <span className="text-lg font-bold text-slate-800">{question}</span>
        {isOpen ? <ChevronUp className="text-indigo-600" /> : <ChevronDown className="text-slate-400" />}
      </button>
      <div 
        className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-96 pb-6' : 'max-h-0'}`}
      >
        <p className="text-slate-600 leading-relaxed">{answer}</p>
      </div>
    </div>
  );
};

const LandingPage: React.FC<Props> = ({ onGetStarted, onNavigate }) => {
  return (
    <div className="min-h-screen bg-white font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Navigation */}
      <nav className="fixed w-full bg-white/90 backdrop-blur-md z-50 border-b border-slate-100 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="bg-gradient-to-br from-pink-500 to-indigo-600 text-white p-2 rounded-xl shadow-lg shadow-indigo-200">
              <Palette size={24} />
            </div>
            <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-600 to-indigo-600 comic-font tracking-tight">
              ColorCraft
            </span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <button onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })} className="text-slate-600 hover:text-indigo-600 font-medium text-sm transition-colors">Features</button>
            <button onClick={() => document.getElementById('showcase')?.scrollIntoView({ behavior: 'smooth' })} className="text-slate-600 hover:text-indigo-600 font-medium text-sm transition-colors">Showcase</button>
            <button onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })} className="text-slate-600 hover:text-indigo-600 font-medium text-sm transition-colors">Pricing</button>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={onGetStarted}
              className="text-slate-600 hover:text-indigo-600 font-bold text-sm transition-colors hidden sm:block"
            >
              Log In
            </button>
            <button 
              onClick={onGetStarted}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full font-bold text-sm shadow-xl shadow-indigo-200 transition-all hover:scale-105 active:scale-95"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-indigo-50 via-white to-white overflow-hidden relative">
        {/* Background Elements */}
        <div className="absolute top-20 right-0 -mr-20 opacity-10 hidden lg:block pointer-events-none animate-pulse">
           <svg width="600" height="600" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
             <path fill="#4F46E5" d="M44.7,-76.4C58.9,-69.2,71.8,-59.1,79.6,-46.3C87.4,-33.5,90.1,-18,88.5,-3.3C86.9,11.4,81,25.3,71.5,36.4C62,47.5,48.9,55.8,35.6,63.1C22.3,70.4,8.8,76.7,-3.7,83.1C-16.2,89.5,-27.7,96,-38.3,92.5C-48.9,89,-58.6,75.5,-66.6,61.9C-74.6,48.3,-80.9,34.6,-83.1,20.2C-85.3,5.8,-83.4,-9.3,-76.3,-22.3C-69.2,-35.3,-56.9,-46.2,-44.1,-53.9C-31.3,-61.6,-18,-66.1,-3.5,-60.1C11,-54,22,-37.4,30.5,-32.8" transform="translate(100 100)" />
           </svg>
        </div>
        <div className="absolute top-40 left-0 -ml-20 opacity-10 hidden lg:block pointer-events-none">
           <div className="w-64 h-64 rounded-full bg-pink-400 blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 shadow-sm text-slate-600 text-xs font-bold mb-8 animate-fade-in-up hover:scale-105 transition-transform cursor-default">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            <span>New: AI Coloring Studio is Live!</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold text-slate-900 mb-8 comic-font leading-[1.1] animate-fade-in-up tracking-tight">
            Dream it. <br className="md:hidden"/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500">
              Draw it.
            </span> <br/>
            Color it.
          </h1>
          
          <p className="text-xl md:text-2xl text-slate-600 max-w-3xl mx-auto mb-12 leading-relaxed animate-fade-in-up animation-delay-100">
            The world's most magical coloring book generator. Instantly turn your child's wildest imagination into professional-quality, printable coloring pages using AI.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up animation-delay-200">
            <button 
              onClick={onGetStarted}
              className="w-full sm:w-auto px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold text-lg shadow-xl shadow-indigo-200 transition-all transform hover:-translate-y-1 flex items-center justify-center gap-2 group"
            >
              Start Creating for Free 
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button 
               onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
               className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-2 hover:shadow-lg"
            >
               <PlayCircle size={20} className="text-indigo-500" />
               See How It Works
            </button>
          </div>

          {/* Social Proof Bar */}
          <div className="mt-16 pt-8 border-t border-slate-200/60 max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16 text-slate-400 grayscale opacity-80 animate-fade-in-up animation-delay-300">
             <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                   {[1,2,3,4].map(i => (
                     <div key={i} className="w-8 h-8 rounded-full bg-slate-200 border-2 border-white overflow-hidden">
                       <img src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="User" />
                     </div>
                   ))}
                </div>
                <div className="text-sm">
                   <span className="block font-bold text-slate-600">10,000+</span>
                   <span>Happy Parents</span>
                </div>
             </div>
             <div className="h-8 w-px bg-slate-200 hidden md:block"></div>
             <div className="flex items-center gap-2">
               <div className="flex text-yellow-400">
                 {[1,2,3,4,5].map(i => <Star key={i} size={16} fill="currentColor" />)}
               </div>
               <span className="font-bold text-slate-600">4.9/5 Rating</span>
             </div>
             <div className="h-8 w-px bg-slate-200 hidden md:block"></div>
             <div className="flex items-center gap-2">
               <Shield size={20} className="text-green-500" />
               <span className="font-bold text-slate-600">Kid-Safe Certified</span>
             </div>
          </div>
        </div>
      </div>

      {/* Image Showcase Validation */}
      <div id="showcase" className="py-24 bg-slate-50 relative overflow-hidden">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
               <span className="text-indigo-600 font-bold tracking-wider uppercase text-sm">Visual Validation</span>
               <h2 className="text-4xl font-bold text-slate-900 mt-2 mb-6 comic-font">Endless Possibilities</h2>
               <p className="text-slate-600 max-w-2xl mx-auto text-lg">
                 From space adventures to underwater castles, see what our AI can create in seconds. High-resolution, crisp lines, ready to print.
               </p>
            </div>

            {/* Gallery Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
               <div className="space-y-4 md:space-y-6">
                  <div className="rounded-3xl overflow-hidden shadow-lg border-4 border-white transform hover:scale-[1.02] transition-transform duration-300">
                     <img src="https://images.unsplash.com/photo-1544383835-bda2bc66a55d?q=80&w=400&auto=format&fit=crop" alt="Coloring 1" className="w-full h-auto object-cover grayscale hover:grayscale-0 transition-all duration-500" />
                  </div>
                  <div className="rounded-3xl overflow-hidden shadow-lg border-4 border-white transform hover:scale-[1.02] transition-transform duration-300">
                     <img src="https://images.unsplash.com/photo-1629196914375-f7e48f477b6d?q=80&w=400&auto=format&fit=crop" alt="Coloring 2" className="w-full h-auto object-cover" />
                  </div>
               </div>
               <div className="space-y-4 md:space-y-6 md:mt-12">
                  <div className="rounded-3xl overflow-hidden shadow-lg border-4 border-white transform hover:scale-[1.02] transition-transform duration-300">
                     <img src="https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80&w=400&auto=format&fit=crop" alt="Coloring 3" className="w-full h-auto object-cover" />
                  </div>
                  <div className="rounded-3xl overflow-hidden shadow-lg border-4 border-white transform hover:scale-[1.02] transition-transform duration-300">
                     <img src="https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?q=80&w=400&auto=format&fit=crop" alt="Coloring 4" className="w-full h-auto object-cover grayscale hover:grayscale-0 transition-all duration-500" />
                  </div>
               </div>
               <div className="space-y-4 md:space-y-6">
                  <div className="rounded-3xl overflow-hidden shadow-lg border-4 border-white transform hover:scale-[1.02] transition-transform duration-300">
                     <img src="https://images.unsplash.com/photo-1515965885000-31db4b4b054c?q=80&w=400&auto=format&fit=crop" alt="Coloring 5" className="w-full h-auto object-cover grayscale hover:grayscale-0 transition-all duration-500" />
                  </div>
                  <div className="rounded-3xl overflow-hidden shadow-lg border-4 border-white transform hover:scale-[1.02] transition-transform duration-300">
                     <img src="https://images.unsplash.com/photo-1618331835717-801e976710b2?q=80&w=400&auto=format&fit=crop" alt="Coloring 6" className="w-full h-auto object-cover" />
                  </div>
               </div>
               <div className="space-y-4 md:space-y-6 md:mt-12">
                  <div className="rounded-3xl overflow-hidden shadow-lg border-4 border-white transform hover:scale-[1.02] transition-transform duration-300">
                     <img src="https://images.unsplash.com/photo-1543536448-d209d2d13a1c?q=80&w=400&auto=format&fit=crop" alt="Coloring 7" className="w-full h-auto object-cover" />
                  </div>
                  <div className="rounded-3xl overflow-hidden shadow-lg border-4 border-white transform hover:scale-[1.02] transition-transform duration-300">
                     <img src="https://images.unsplash.com/photo-1596464716127-f9a0639b936f?q=80&w=400&auto=format&fit=crop" alt="Coloring 8" className="w-full h-auto object-cover grayscale hover:grayscale-0 transition-all duration-500" />
                  </div>
               </div>
            </div>
            
            <div className="text-center mt-12">
               <button onClick={onGetStarted} className="inline-flex items-center gap-2 text-indigo-600 font-bold hover:text-indigo-700 transition-colors border-b-2 border-indigo-200 hover:border-indigo-600 pb-1">
                  View Full Gallery <ArrowRight size={16} />
               </button>
            </div>
         </div>
      </div>

      {/* Feature Grid */}
      <div id="features" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4 comic-font">Why Parents Choose ColorCraft</h2>
            <p className="text-slate-500 max-w-xl mx-auto text-lg">We've built the perfect tool for creative kids and busy parents, packed with powerful features.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="group p-8 rounded-[2rem] bg-white border border-slate-100 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-indigo-200/50 hover:-translate-y-2 transition-all duration-300">
              <div className="w-14 h-14 bg-pink-100 text-pink-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Zap size={28} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Instant Generation</h3>
              <p className="text-slate-600 leading-relaxed">
                Describe a scene and watch as our advanced AI generates a professional-grade coloring outline in seconds. No waiting, just creating.
              </p>
            </div>
            
            <div className="group p-8 rounded-[2rem] bg-white border border-slate-100 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-indigo-200/50 hover:-translate-y-2 transition-all duration-300">
              <div className="w-14 h-14 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Printer size={28} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Print & PDF Export</h3>
              <p className="text-slate-600 leading-relaxed">
                Download high-quality PDFs formatted perfectly for standard letter or A4 paper. Create entire books in minutes.
              </p>
            </div>

            <div className="group p-8 rounded-[2rem] bg-white border border-slate-100 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-indigo-200/50 hover:-translate-y-2 transition-all duration-300">
              <div className="w-14 h-14 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Palette size={28} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Digital Studio</h3>
              <p className="text-slate-600 leading-relaxed">
                No printer? No problem. Use our built-in digital coloring studio with crayons, markers, and glitter effects on any tablet.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="py-24 bg-indigo-900 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-600 rounded-full blur-[100px] opacity-30"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4 comic-font">Loved by Families</h2>
            <p className="text-indigo-200 max-w-xl mx-auto text-lg">Join thousands of parents fostering creativity with ColorCraft.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-indigo-800/50 backdrop-blur-sm p-8 rounded-3xl border border-indigo-700">
              <div className="flex text-yellow-400 mb-4">
                {[1,2,3,4,5].map(i => <Star key={i} size={16} fill="currentColor" />)}
              </div>
              <p className="text-indigo-100 text-lg mb-6 italic">"My daughter wanted a coloring page of a 'Ballerina T-Rex'. I couldn't find it anywhere. ColorCraft made it in 5 seconds. Incredible!"</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center font-bold text-white">SM</div>
                <div>
                  <div className="text-white font-bold">Sarah M.</div>
                  <div className="text-indigo-300 text-sm">Mom of 2</div>
                </div>
              </div>
            </div>

            <div className="bg-indigo-800/50 backdrop-blur-sm p-8 rounded-3xl border border-indigo-700 transform md:-translate-y-4 shadow-2xl">
              <div className="flex text-yellow-400 mb-4">
                {[1,2,3,4,5].map(i => <Star key={i} size={16} fill="currentColor" />)}
              </div>
              <p className="text-indigo-100 text-lg mb-6 italic">"The digital coloring studio is a lifesaver for long car rides. We save so much paper, and the 'glitter' brush is a huge hit."</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-pink-500 flex items-center justify-center font-bold text-white">JL</div>
                <div>
                  <div className="text-white font-bold">Jason L.</div>
                  <div className="text-indigo-300 text-sm">Dad of 3</div>
                </div>
              </div>
            </div>

            <div className="bg-indigo-800/50 backdrop-blur-sm p-8 rounded-3xl border border-indigo-700">
              <div className="flex text-yellow-400 mb-4">
                {[1,2,3,4,5].map(i => <Star key={i} size={16} fill="currentColor" />)}
              </div>
              <p className="text-indigo-100 text-lg mb-6 italic">"I use this for my kindergarten class. We create pages based on what we learn that week. The kids absolutely love seeing their ideas come to life."</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center font-bold text-white">EW</div>
                <div>
                  <div className="text-white font-bold">Emily W.</div>
                  <div className="text-indigo-300 text-sm">Teacher</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* How it Works */}
      <div id="how-it-works" className="py-24 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
           <div className="flex flex-col md:flex-row items-center gap-16">
             <div className="flex-1">
               <span className="text-indigo-600 font-bold tracking-wider uppercase text-sm">Simple Process</span>
               <h2 className="text-4xl font-bold mb-6 mt-2 comic-font text-slate-900">How Magic Happens</h2>
               <p className="text-slate-600 text-lg mb-10">Three simple steps to endless creativity. No artistic skills required.</p>
               
               <div className="space-y-8">
                 <div className="flex gap-6">
                   <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex-shrink-0 flex items-center justify-center font-bold text-xl shadow-sm">1</div>
                   <div>
                     <h4 className="font-bold text-xl text-slate-800 mb-2">Enter a Theme</h4>
                     <p className="text-slate-600">Type anything like "A cat riding a skateboard in space" or "Underwater Castle".</p>
                   </div>
                 </div>
                 <div className="flex gap-6">
                   <div className="w-12 h-12 rounded-2xl bg-pink-50 text-pink-600 flex-shrink-0 flex items-center justify-center font-bold text-xl shadow-sm">2</div>
                   <div>
                     <h4 className="font-bold text-xl text-slate-800 mb-2">AI Creates the Art</h4>
                     <p className="text-slate-600">Our advanced Gemini AI drafts unique, high-quality outlines instantly.</p>
                   </div>
                 </div>
                 <div className="flex gap-6">
                   <div className="w-12 h-12 rounded-2xl bg-green-50 text-green-600 flex-shrink-0 flex items-center justify-center font-bold text-xl shadow-sm">3</div>
                   <div>
                     <h4 className="font-bold text-xl text-slate-800 mb-2">Print or Color</h4>
                     <p className="text-slate-600">Save to your library, print it out as a PDF, or color on your tablet.</p>
                   </div>
                 </div>
               </div>
               
               <button 
                onClick={onGetStarted}
                className="mt-12 px-8 py-4 bg-slate-900 text-white rounded-2xl font-bold shadow-lg hover:bg-slate-800 transition-colors flex items-center gap-2"
               >
                 Try it Now <ArrowRight size={20} />
               </button>
             </div>
             
             <div className="flex-1 relative">
                <div className="absolute inset-0 bg-gradient-to-tr from-indigo-200 to-pink-200 blur-[60px] opacity-60 rounded-full"></div>
                <div className="relative bg-white rounded-[2.5rem] p-6 shadow-2xl border border-slate-100 transform rotate-2 hover:rotate-0 transition-transform duration-500">
                  <div className="aspect-[3/4] bg-slate-50 rounded-2xl flex items-center justify-center border-2 border-dashed border-slate-200 overflow-hidden relative group">
                     <img 
                      src="https://images.unsplash.com/photo-1629196914375-f7e48f477b6d?q=80&w=600&auto=format&fit=crop" 
                      className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700"
                      alt="Demo"
                     />
                     <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent opacity-90"></div>
                     <div className="absolute bottom-8 left-8 right-8">
                       <div className="bg-white/80 backdrop-blur p-4 rounded-xl shadow-lg border border-white/50">
                         <div className="h-2 w-24 bg-slate-200 rounded mb-2"></div>
                         <div className="h-2 w-16 bg-slate-200 rounded"></div>
                       </div>
                     </div>
                  </div>
                </div>
             </div>
           </div>
        </div>
      </div>

      {/* Pricing Section */}
      <div id="pricing" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4 comic-font">Simple Pricing for Every Family</h2>
            <p className="text-slate-500 max-w-xl mx-auto text-lg">Start for free, upgrade for unlimited magic.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {PLANS.map((plan) => (
              <div 
                key={plan.id}
                className={`relative p-8 rounded-[2rem] bg-white transition-all duration-300 hover:translate-y-[-8px] ${plan.highlight ? 'border-2 border-indigo-500 shadow-2xl scale-105 z-10 ring-4 ring-indigo-50' : 'border border-slate-200 shadow-lg hover:shadow-xl'}`}
              >
                {plan.highlight && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide shadow-lg">
                    Most Popular
                  </div>
                )}
                
                <h3 className="text-2xl font-bold text-slate-800 mb-2">{plan.name}</h3>
                <div className="flex items-baseline mb-6">
                  <span className="text-5xl font-extrabold text-slate-900 tracking-tight">${plan.price / 100}</span>
                  <span className="text-slate-500 ml-1 font-medium">/month</span>
                </div>
                <p className="text-slate-500 text-sm mb-8 pb-8 border-b border-slate-100 leading-relaxed">{plan.description}</p>
                
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm">
                      <div className={`mt-0.5 rounded-full p-0.5 flex-shrink-0 ${feature.included ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-300'}`}>
                        <Check size={14} strokeWidth={3} />
                      </div>
                      <span className={feature.included ? 'text-slate-700 font-medium' : 'text-slate-400 line-through'}>{feature.text}</span>
                    </li>
                  ))}
                </ul>

                <button 
                  onClick={onGetStarted}
                  className={`w-full py-4 rounded-xl font-bold transition-all ${
                    plan.highlight 
                      ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200 hover:shadow-xl' 
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900'
                  }`}
                >
                  {plan.price === 0 ? 'Start for Free' : 'Choose ' + plan.name}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="py-24 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
           <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-slate-900 mb-4 comic-font">Frequently Asked Questions</h2>
              <p className="text-slate-500">Everything you need to know about ColorCraft.</p>
           </div>
           
           <div className="space-y-2">
             <FAQItem 
               question="Is the content safe for children?" 
               answer="Absolutely. We use strict safety filters on our AI models to ensure all generated images and text are appropriate for all ages. We also have manual reporting tools."
             />
             <FAQItem 
               question="Can I print the coloring pages?" 
               answer="Yes! You can download any generated page as a high-quality PDF or PNG file, formatted for standard letter/A4 paper, ready for your home printer."
             />
             <FAQItem 
               question="How does the subscription work?" 
               answer="You can start for free with a limited number of daily generations. Our Pro and Unlimited plans offer more generations, higher resolution (2K/4K), and priority processing."
             />
             <FAQItem 
               question="Do I own the images I generate?" 
               answer="Yes, you have full commercial rights to the coloring pages you generate using our paid plans. Free plan users have personal usage rights."
             />
           </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 px-4">
         <div className="max-w-5xl mx-auto bg-gradient-to-r from-indigo-600 to-purple-600 rounded-[3rem] p-8 md:p-16 text-center text-white relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
            <div className="relative z-10">
               <h2 className="text-4xl md:text-5xl font-bold mb-6 comic-font">Ready to Unleash Creativity?</h2>
               <p className="text-indigo-100 text-lg md:text-xl max-w-2xl mx-auto mb-10">
                 Join thousands of parents and teachers creating magic today. No credit card required to start.
               </p>
               <button 
                  onClick={onGetStarted}
                  className="px-10 py-5 bg-white text-indigo-600 rounded-full font-bold text-lg shadow-xl hover:bg-indigo-50 hover:scale-105 transition-all"
               >
                  Create Your First Book
               </button>
            </div>
         </div>
      </div>

      {/* Safety Badge Section */}
      <div className="py-12 bg-slate-50 border-t border-slate-200">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="flex justify-center gap-8 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
             {/* Placeholder Logos for Trust */}
             <div className="flex items-center gap-2 font-bold text-slate-400"><Shield size={24} /> KidSafe+</div>
             <div className="flex items-center gap-2 font-bold text-slate-400"><Heart size={24} /> ParentChoice</div>
             <div className="flex items-center gap-2 font-bold text-slate-400"><Zap size={24} /> FastAI</div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-100 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start gap-12">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-6">
                <div className="bg-indigo-600 text-white p-1.5 rounded-lg">
                  <Palette size={20} />
                </div>
                <span className="font-bold text-xl text-slate-800 comic-font">ColorCraft</span>
              </div>
              <p className="text-slate-500 leading-relaxed max-w-xs">
                Empowering children's imagination through AI-powered creativity tools. Safe, fun, and magical.
              </p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-12">
               <div>
                  <h4 className="font-bold text-slate-900 mb-4">Product</h4>
                  <ul className="space-y-3 text-sm text-slate-500">
                     <li><button onClick={onGetStarted} className="hover:text-indigo-600">Generator</button></li>
                     <li><button onClick={onGetStarted} className="hover:text-indigo-600">Studio</button></li>
                     <li><button onClick={() => document.getElementById('pricing')?.scrollIntoView()} className="hover:text-indigo-600">Pricing</button></li>
                  </ul>
               </div>
               <div>
                  <h4 className="font-bold text-slate-900 mb-4">Company</h4>
                  <ul className="space-y-3 text-sm text-slate-500">
                     <li><button onClick={() => onNavigate('contact')} className="hover:text-indigo-600">Contact</button></li>
                     <li><button className="hover:text-indigo-600">About Us</button></li>
                     <li><button className="hover:text-indigo-600">Blog</button></li>
                  </ul>
               </div>
               <div>
                  <h4 className="font-bold text-slate-900 mb-4">Legal</h4>
                  <ul className="space-y-3 text-sm text-slate-500">
                     <li><button onClick={() => onNavigate('privacy')} className="hover:text-indigo-600">Privacy Policy</button></li>
                     <li><button onClick={() => onNavigate('terms')} className="hover:text-indigo-600">Terms of Service</button></li>
                  </ul>
               </div>
            </div>
          </div>
          
          <div className="border-t border-slate-100 mt-12 pt-8 text-center text-slate-400 text-sm flex flex-col md:flex-row justify-between items-center gap-4">
            <p>© {new Date().getFullYear()} ColorCraft. All rights reserved.</p>
            <div className="flex gap-4">
               {/* Social placeholders */}
               <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center hover:bg-indigo-100 hover:text-indigo-600 transition-colors cursor-pointer">X</div>
               <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center hover:bg-indigo-100 hover:text-indigo-600 transition-colors cursor-pointer">in</div>
               <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center hover:bg-indigo-100 hover:text-indigo-600 transition-colors cursor-pointer">Ig</div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;