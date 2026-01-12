
import React from 'react';
import { User, Child } from '../types';
import { Plus, User as UserIcon, Smile, Star, Heart, Zap } from 'lucide-react';

interface Props {
  user: User;
  onSelectProfile: (childId: string | 'parent') => void;
  onManageProfiles: () => void;
}

// Fun avatars/icons for kids
const ICONS = [Smile, Star, Heart, Zap, UserIcon];

const ProfileSelector: React.FC<Props> = ({ user, onSelectProfile, onManageProfiles }) => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 animate-fade-in-up">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4 comic-font">Who is coloring?</h1>
        <p className="text-slate-500 text-lg">Choose your profile to enter your studio.</p>
      </div>

      <div className="flex flex-wrap justify-center gap-8 max-w-4xl">
        {/* Children Profiles */}
        {user.children.map((child, index) => {
          const Icon = ICONS[index % ICONS.length];
          // Generate a consistent color based on index
          const colors = ['bg-pink-500', 'bg-indigo-500', 'bg-green-500', 'bg-orange-500', 'bg-purple-500'];
          const color = colors[index % colors.length];

          return (
            <button
              key={child.id}
              onClick={() => onSelectProfile(child.id)}
              className="group flex flex-col items-center gap-4 transition-all hover:-translate-y-2"
            >
              <div className={`w-32 h-32 rounded-3xl ${color} shadow-xl shadow-slate-200 group-hover:shadow-2xl flex items-center justify-center text-white transition-transform group-hover:scale-105 border-4 border-white`}>
                <Icon size={48} strokeWidth={2.5} />
              </div>
              <span className="text-xl font-bold text-slate-700 group-hover:text-indigo-600 transition-colors">
                {child.name}
              </span>
            </button>
          );
        })}

        {/* Add Profile Button (Redirects to Subscription/Settings) */}
        {user.children.length < 4 && (
           <button
             onClick={onManageProfiles}
             className="group flex flex-col items-center gap-4 transition-all hover:-translate-y-2"
           >
             <div className="w-32 h-32 rounded-3xl bg-white border-4 border-dashed border-slate-300 flex items-center justify-center text-slate-300 hover:text-indigo-400 hover:border-indigo-300 transition-all">
               <Plus size={40} />
             </div>
             <span className="text-xl font-bold text-slate-400 group-hover:text-indigo-500 transition-colors">
               Add Kid
             </span>
           </button>
        )}
      </div>

      {/* Parent/Admin Link (Optional, for now manageable via the main UI once inside) 
          If you wanted a specific "Parent Mode" you could add it here.
      */}
    </div>
  );
};

export default ProfileSelector;
