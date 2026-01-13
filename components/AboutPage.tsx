
import React from 'react';
import { ArrowLeft, Heart, Lightbulb, Users, Sparkles, BrainCircuit } from 'lucide-react';

interface Props {
  onBack: () => void;
}

const AboutPage: React.FC<Props> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-white animate-fade-in-up">
      {/* Header */}
      <nav className="border-b border-slate-100 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors font-medium"
          >
            <ArrowLeft size={20} /> Back
          </button>
          <span className="ml-auto font-bold text-xl comic-font text-slate-800">About Us</span>
        </div>
      </nav>

      <main>
        {/* Hero Section */}
        <section className="bg-indigo-600 py-20 text-white relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
          <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
            <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-6">
              <Lightbulb size={40} className="text-yellow-300" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 comic-font">Sparking Imagination,<br />One Page at a Time</h1>
            <p className="text-indigo-100 text-xl max-w-2xl mx-auto leading-relaxed">
              Welcome to <span className="text-indigo-600">KiddoDraw</span>. We're on a mission to combine the magic of AI with the timeless joy of coloring, giving every child the power to create their own world.
            </p>
          </div>
        </section>

        {/* Our Story */}
        <section className="py-20 px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-slate-900 mb-6 comic-font text-center">Our Story</h2>
            <div className="prose prose-lg prose-slate mx-auto text-slate-600 leading-relaxed space-y-6">
              <p>
                KiddoDraw is more than just an app; it's a magical gateway to creativity for children around the world. Born from the belief that every child is an artist, we've harnessed the power of advanced Artificial Intelligence to create infinite, personalized coloring adventures.
              </p>
              <p>
                We realized that while children's imaginations are limitless, traditional coloring books are static. What if we could build a tool that could draw <em>anything</em> a child could dream up?
              </p>
              <p>
                Leveraging the latest advancements in Generative AI, specifically Google's Gemini models, we built KiddoDraw. It's not just an app; it's a creative companion that listens to a child's ideas and brings them to life in seconds.
              </p>
            </div>
          </div>
        </section>

        {/* Values Grid */}
        <section className="bg-slate-50 py-20 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 text-center">
                <div className="w-14 h-14 bg-pink-100 text-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Heart size={28} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Creativity First</h3>
                <p className="text-slate-600">
                  We believe technology should enhance creativity, not replace it. Our goal is to provide the outline, letting the child provide the color and life.
                </p>
              </div>

              <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 text-center">
                <div className="w-14 h-14 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <BrainCircuit size={28} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Safe AI</h3>
                <p className="text-slate-600">
                  Safety is paramount. We utilize advanced filtering and prompting techniques to ensure every generated image is age-appropriate and positive.
                </p>
              </div>

              <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 text-center">
                <div className="w-14 h-14 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Users size={28} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Accessible Fun</h3>
                <p className="text-slate-600">
                  Whether you have a professional printer or just an old tablet, we optimize our output so every family can enjoy the magic of coloring.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Team / Closing */}
        <section className="py-20 px-4 text-center">
          <div className="max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 px-4 py-2 rounded-full font-bold text-sm mb-6">
              <Sparkles size={16} />
              <span>Powered by Google Gemini</span>
            </div>
            <h2 className="text-3xl font-bold text-slate-900 mb-6 comic-font">Join the Adventure</h2>
            <p className="text-slate-600 mb-8">
              We are constantly improving and adding new features based on feedback from parents like you. Thank you for being part of our colorful journey.
            </p>
            <button
              onClick={onBack}
              className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full font-bold shadow-lg shadow-indigo-200 transition-all hover:-translate-y-1"
            >
              Start Creating Now
            </button>
          </div>
        </section>
      </main>

      <footer className="bg-slate-900 text-slate-400 py-12">
        <div className="max-w-4xl mx-auto px-4 text-center text-sm">
          <p>© {new Date().getFullYear()} KiddoDraw. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default AboutPage;
