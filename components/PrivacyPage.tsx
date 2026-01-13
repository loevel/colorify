import React from 'react';
import { ArrowLeft, Shield, Lock, Eye } from 'lucide-react';

interface Props {
  onBack: () => void;
}

const PrivacyPage: React.FC<Props> = ({ onBack }) => {
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
          <span className="ml-auto font-bold text-xl comic-font text-slate-800">Privacy Policy</span>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Shield size={32} />
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-4 comic-font">We Protect Your Creativity</h1>
          <p className="text-lg text-slate-600">Last Updated: October 2025</p>
        </div>

        <div className="prose prose-slate max-w-none space-y-12">
          <section>
            <div className="flex items-start gap-4 mb-4">
              <div className="mt-1 bg-indigo-50 p-2 rounded-lg text-indigo-600">
                <Lock size={20} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-800 mb-2">1. Data Collection</h2>
                <p className="text-slate-600 leading-relaxed">
                  At KiddoDraw, we believe in collecting only what is strictly necessary. We collect:
                </p>
                <ul className="list-disc pl-5 mt-2 space-y-1 text-slate-600">
                  <li>Account information (name, email) to manage your subscription and library.</li>
                  <li>Generated images and user uploaded content (colored pages) to provide the service.</li>
                  <li>Usage data to improve our AI models and application performance.</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <div className="flex items-start gap-4 mb-4">
              <div className="mt-1 bg-indigo-50 p-2 rounded-lg text-indigo-600">
                <Eye size={20} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-800 mb-2">2. How We Use Your Data</h2>
                <p className="text-slate-600 leading-relaxed">
                  We allow you to generate, save, and print coloring pages. We do not sell your personal data to advertisers.
                  We use your data exclusively to:
                </p>
                <ul className="list-disc pl-5 mt-2 space-y-1 text-slate-600">
                  <li>Provide and maintain the Service.</li>
                  <li>Notify you about changes to our Service.</li>
                  <li>Provide customer support.</li>
                  <li>Monitor the usage of the Service to detect, prevent and address technical issues.</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-800 mb-4">3. AI & Content Safety</h2>
            <p className="text-slate-600 leading-relaxed mb-4">
              Our application uses Google Gemini API to generate content. We implement strict safety filters to ensure
              all generated imagery and text are appropriate for children. However, AI can be unpredictable.
              If you encounter inappropriate content, please report it immediately.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-800 mb-4">4. Children's Privacy</h2>
            <p className="text-slate-600 leading-relaxed">
              Our Service is intended to be used by parents and guardians. We do not knowingly collect personally identifiable information from children under 13 without parental consent. If you are a parent or guardian and you are aware that your Children has provided us with Personal Data, please contact us.
            </p>
          </section>
        </div>
      </main>

      <footer className="bg-slate-50 border-t border-slate-200 py-12 mt-12">
        <div className="max-w-4xl mx-auto px-4 text-center text-slate-500 text-sm">
          <p>© {new Date().getFullYear()} KiddoDraw. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default PrivacyPage;