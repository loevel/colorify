import React, { useState } from 'react';
import { ArrowLeft, Mail, MessageSquare, Send } from 'lucide-react';

interface Props {
  onBack: () => void;
}

const ContactPage: React.FC<Props> = ({ onBack }) => {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate API call
    setTimeout(() => {
      setSubmitted(true);
    }, 1000);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4 animate-fade-in-up">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Send size={40} />
          </div>
          <h2 className="text-3xl font-bold text-slate-900 mb-4 comic-font">Message Sent!</h2>
          <p className="text-slate-600 mb-8">
            Thanks for reaching out to the ColorCraft team. We'll get back to you as soon as our artists finish their latest masterpiece!
          </p>
          <button 
            onClick={onBack}
            className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-colors"
          >
            Return Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white animate-fade-in-up">
      <nav className="border-b border-slate-100 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors font-medium"
          >
            <ArrowLeft size={20} /> Back
          </button>
          <span className="ml-auto font-bold text-xl comic-font text-slate-800">Contact Us</span>
        </div>
      </nav>

      <main className="max-w-2xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-slate-900 mb-4 comic-font">We'd Love to Hear From You</h1>
          <p className="text-slate-600">Have a question, suggestion, or just want to say hi?</p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Your Name</label>
                <input 
                  type="text" 
                  required
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                  placeholder="Leonardo da Vinci"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Email Address</label>
                <input 
                  type="email" 
                  required
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                  placeholder="leo@art.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Subject</label>
              <select className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all bg-white">
                <option>General Inquiry</option>
                <option>Support Request</option>
                <option>Feature Suggestion</option>
                <option>Billing Question</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Message</label>
              <textarea 
                required
                rows={5}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all resize-none"
                placeholder="Tell us what's on your mind..."
              />
            </div>

            <button 
              type="submit"
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2"
            >
              <Mail size={20} /> Send Message
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-slate-100 flex flex-col md:flex-row justify-center gap-8 text-sm text-slate-500 text-center">
            <div className="flex items-center justify-center gap-2">
              <Mail size={16} /> support@colorcraft.app
            </div>
            <div className="flex items-center justify-center gap-2">
              <MessageSquare size={16} /> Live Chat (9am - 5pm EST)
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ContactPage;