
import React, { useState, useEffect } from 'react';
import { User, SavedPage } from '../types';
import { getAllUsers, getRecentGlobalImages } from '../services/storageService';
import { 
  Users, Image as ImageIcon, TrendingUp, DollarSign, 
  Search, ShieldAlert, Loader2, RefreshCw, Crown
} from 'lucide-react';

interface Props {
  currentUser: User;
}

type AdminTab = 'overview' | 'users' | 'moderation';

const AdminDashboard: React.FC<Props> = ({ currentUser }) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [users, setUsers] = useState<User[]>([]);
  const [recentImages, setRecentImages] = useState<SavedPage[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [fetchedUsers, fetchedImages] = await Promise.all([
        getAllUsers(),
        getRecentGlobalImages(30)
      ]);
      setUsers(fetchedUsers);
      setRecentImages(fetchedImages);
    } catch (e) {
      console.error("Failed to load admin data", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filtering users
  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Stats Calculation
  const totalUsers = users.length;
  const proUsers = users.filter(u => u.subscriptionTier === 'pro').length;
  const unlimitedUsers = users.filter(u => u.subscriptionTier === 'unlimited').length;
  const totalRevenue = (proUsers * 9.99) + (unlimitedUsers * 19.99);

  return (
    <div className="min-h-screen bg-slate-50 p-6 animate-fade-in-up">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8 flex justify-between items-center">
        <div>
           <div className="flex items-center gap-2 mb-1">
             <span className="bg-slate-900 text-white px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider">Admin</span>
             <h1 className="text-3xl font-bold text-slate-900 comic-font">Dashboard</h1>
           </div>
           <p className="text-slate-500">Welcome back, Commander {currentUser.name}.</p>
        </div>
        <button 
          onClick={loadData}
          className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600 transition-colors"
          title="Refresh Data"
        >
          {loading ? <Loader2 className="animate-spin" size={20} /> : <RefreshCw size={20} />}
        </button>
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Navigation Tabs */}
        <div className="flex gap-4 border-b border-slate-200 mb-8">
           <button 
             onClick={() => setActiveTab('overview')}
             className={`pb-4 px-4 font-bold text-sm transition-all ${activeTab === 'overview' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
           >
             Overview
           </button>
           <button 
             onClick={() => setActiveTab('users')}
             className={`pb-4 px-4 font-bold text-sm transition-all ${activeTab === 'users' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
           >
             User Management
           </button>
           <button 
             onClick={() => setActiveTab('moderation')}
             className={`pb-4 px-4 font-bold text-sm transition-all ${activeTab === 'moderation' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
           >
             Content Moderation
           </button>
        </div>

        {/* --- OVERVIEW TAB --- */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in-up">
             <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
               <div className="flex justify-between items-start mb-4">
                 <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl"><Users size={24} /></div>
                 <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">+12%</span>
               </div>
               <h3 className="text-slate-500 text-sm font-bold uppercase tracking-wide">Total Users</h3>
               <p className="text-3xl font-extrabold text-slate-900">{totalUsers}</p>
             </div>

             <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
               <div className="flex justify-between items-start mb-4">
                 <div className="p-3 bg-green-50 text-green-600 rounded-xl"><DollarSign size={24} /></div>
               </div>
               <h3 className="text-slate-500 text-sm font-bold uppercase tracking-wide">Monthly Revenue (Est)</h3>
               <p className="text-3xl font-extrabold text-slate-900">${totalRevenue.toFixed(2)}</p>
             </div>

             <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
               <div className="flex justify-between items-start mb-4">
                 <div className="p-3 bg-pink-50 text-pink-600 rounded-xl"><ImageIcon size={24} /></div>
               </div>
               <h3 className="text-slate-500 text-sm font-bold uppercase tracking-wide">Images Generated</h3>
               <p className="text-3xl font-extrabold text-slate-900">~{totalUsers * 5}</p>
             </div>

             <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
               <div className="flex justify-between items-start mb-4">
                 <div className="p-3 bg-orange-50 text-orange-600 rounded-xl"><TrendingUp size={24} /></div>
               </div>
               <h3 className="text-slate-500 text-sm font-bold uppercase tracking-wide">Conversion Rate</h3>
               <p className="text-3xl font-extrabold text-slate-900">
                  {totalUsers > 0 ? ((proUsers + unlimitedUsers) / totalUsers * 100).toFixed(1) : 0}%
               </p>
             </div>
          </div>
        )}

        {/* --- USERS TAB --- */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden animate-fade-in-up">
            <div className="p-4 border-b border-slate-100 flex gap-4">
               <div className="relative flex-1">
                 <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                 <input 
                   type="text" 
                   placeholder="Search users by name or email..."
                   className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-100"
                   value={searchTerm}
                   onChange={(e) => setSearchTerm(e.target.value)}
                 />
               </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-xs">
                  <tr>
                    <th className="px-6 py-4">User</th>
                    <th className="px-6 py-4">Plan</th>
                    <th className="px-6 py-4">Type</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.map(u => (
                    <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900">{u.name}</div>
                        <div className="text-slate-400 text-xs">{u.email}</div>
                      </td>
                      <td className="px-6 py-4">
                         {u.subscriptionTier === 'free' ? (
                           <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs font-bold">Free</span>
                         ) : (
                           <span className="bg-indigo-100 text-indigo-600 px-2 py-1 rounded text-xs font-bold flex items-center gap-1 w-fit">
                             <Crown size={12} fill="currentColor" /> {u.subscriptionTier.toUpperCase()}
                           </span>
                         )}
                      </td>
                      <td className="px-6 py-4 capitalize text-slate-600">{u.accountType}</td>
                      <td className="px-6 py-4">
                        <span className="flex items-center gap-1.5 text-green-600 font-bold text-xs">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Active
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                         <button className="text-indigo-600 hover:text-indigo-800 font-bold text-xs">Edit</button>
                      </td>
                    </tr>
                  ))}
                  {filteredUsers.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-slate-400 italic">
                        No users found matching "{searchTerm}"
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* --- MODERATION TAB --- */}
        {activeTab === 'moderation' && (
          <div className="space-y-6 animate-fade-in-up">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-800">Recent Global Generations</h3>
              <div className="text-xs text-slate-500 flex items-center gap-1">
                 <ShieldAlert size={14} /> Images are monitored for safety
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
               {recentImages.map((page) => (
                 <div key={page.id} className="group relative aspect-[3/4] bg-white rounded-lg border border-slate-200 overflow-hidden hover:shadow-lg transition-all">
                    <img 
                      src={page.thumbnailUrl || page.originalUrl} 
                      alt={page.theme} 
                      className="w-full h-full object-cover p-2"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-2 text-center">
                       <span className="text-white text-xs font-bold mb-2 line-clamp-2">"{page.theme}"</span>
                       <span className="text-slate-300 text-[10px] mb-3">by {page.childName}</span>
                       <button className="bg-red-500 hover:bg-red-600 text-white text-xs px-3 py-1.5 rounded font-bold">
                         Delete
                       </button>
                    </div>
                 </div>
               ))}
               {recentImages.length === 0 && (
                 <div className="col-span-full py-12 text-center text-slate-400 bg-white rounded-2xl border border-dashed border-slate-200">
                    <Loader2 className="mx-auto mb-2 animate-spin" />
                    Loading or no recent images found...
                    <p className="text-xs mt-2">Note: Firestore index might be building.</p>
                 </div>
               )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
