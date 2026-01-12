
import React, { useState, useEffect } from 'react';
import { User, SavedPage } from '../types';
import { getAllUsers, getRecentGlobalImages } from '../services/storageService';
import { 
  Users, Image as ImageIcon, TrendingUp, DollarSign, 
  Search, ShieldAlert, Loader2, RefreshCw, Crown,
  Activity, Server, Zap, Ban, Eye, MoreHorizontal, BarChart3
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

  // Simulated System Stats
  const [systemHealth, setSystemHealth] = useState({
    apiStatus: 'Operational',
    avgLatency: '1.2s',
    errorRate: '0.5%',
    quotaUsage: '42%'
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [fetchedUsers, fetchedImages] = await Promise.all([
        getAllUsers(),
        getRecentGlobalImages(50) // Increased fetch limit for better stats
      ]);
      setUsers(fetchedUsers);
      setRecentImages(fetchedImages);
      
      // Simulate refreshing system health
      setSystemHealth({
        apiStatus: Math.random() > 0.1 ? 'Operational' : 'Degraded',
        avgLatency: (0.8 + Math.random()).toFixed(2) + 's',
        errorRate: (Math.random()).toFixed(1) + '%',
        quotaUsage: Math.floor(30 + Math.random() * 40) + '%'
      });

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

  // Calculate Trending Themes (Simple word frequency)
  const getTrendingThemes = () => {
    const wordMap: Record<string, number> = {};
    recentImages.forEach(img => {
      const words = img.theme.toLowerCase().split(/\s+/);
      words.forEach(w => {
        if (w.length > 3 && !['with', 'drawing', 'page', 'cute'].includes(w)) {
           wordMap[w] = (wordMap[w] || 0) + 1;
        }
      });
    });
    return Object.entries(wordMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  };

  const trendingThemes = getTrendingThemes();

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
          <div className="space-y-6 animate-fade-in-up">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                <h3 className="text-slate-500 text-sm font-bold uppercase tracking-wide">Monthly Revenue</h3>
                <p className="text-3xl font-extrabold text-slate-900">${totalRevenue.toFixed(2)}</p>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-pink-50 text-pink-600 rounded-xl"><ImageIcon size={24} /></div>
                </div>
                <h3 className="text-slate-500 text-sm font-bold uppercase tracking-wide">Images Generated</h3>
                <p className="text-3xl font-extrabold text-slate-900">~{totalUsers * 5 + recentImages.length}</p>
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

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* System Health Panel */}
              <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-lg col-span-1">
                 <div className="flex items-center gap-2 mb-6 border-b border-slate-700 pb-4">
                    <Activity className="text-green-400" />
                    <h3 className="text-lg font-bold">System Health</h3>
                 </div>
                 
                 <div className="space-y-6">
                    <div className="flex justify-between items-center">
                       <span className="text-slate-400 flex items-center gap-2"><Server size={16}/> API Status</span>
                       <span className={`px-2 py-1 rounded text-xs font-bold ${systemHealth.apiStatus === 'Operational' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                          {systemHealth.apiStatus}
                       </span>
                    </div>
                    <div className="flex justify-between items-center">
                       <span className="text-slate-400 flex items-center gap-2"><Zap size={16}/> Avg Latency</span>
                       <span className="font-mono">{systemHealth.avgLatency}</span>
                    </div>
                    <div className="flex justify-between items-center">
                       <span className="text-slate-400 flex items-center gap-2"><ShieldAlert size={16}/> Error Rate</span>
                       <span className="font-mono text-orange-300">{systemHealth.errorRate}</span>
                    </div>
                    
                    <div className="pt-2">
                       <div className="flex justify-between text-xs mb-1">
                          <span className="text-slate-400">Monthly AI Quota</span>
                          <span className="text-slate-300">{systemHealth.quotaUsage}</span>
                       </div>
                       <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                          <div className="h-full bg-indigo-500 transition-all duration-1000" style={{ width: systemHealth.quotaUsage }}></div>
                       </div>
                    </div>
                 </div>
              </div>

              {/* Trending Themes Panel */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 col-span-1 lg:col-span-2">
                 <div className="flex items-center gap-2 mb-6">
                    <BarChart3 className="text-indigo-600" />
                    <h3 className="text-lg font-bold text-slate-800">Trending Concepts</h3>
                 </div>
                 
                 <div className="space-y-4">
                    {trendingThemes.length > 0 ? trendingThemes.map(([word, count], i) => (
                      <div key={word} className="flex items-center gap-4">
                         <span className="w-6 text-center font-bold text-slate-300">#{i + 1}</span>
                         <div className="flex-1">
                            <div className="flex justify-between text-sm mb-1">
                               <span className="font-bold text-slate-700 capitalize">{word}</span>
                               <span className="text-slate-400 text-xs">{count} gens</span>
                            </div>
                            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                               <div 
                                 className="h-full rounded-full bg-gradient-to-r from-indigo-400 to-purple-400" 
                                 style={{ width: `${Math.min(100, (count / trendingThemes[0][1]) * 100)}%` }}
                               ></div>
                            </div>
                         </div>
                      </div>
                    )) : (
                      <p className="text-slate-400 italic">Not enough data to determine trends yet.</p>
                    )}
                 </div>
              </div>
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
                    <th className="px-6 py-4">Account</th>
                    <th className="px-6 py-4">Children</th>
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
                      <td className="px-6 py-4 capitalize text-slate-600">
                         <span className={`px-2 py-1 rounded text-xs font-bold ${u.accountType === 'family' ? 'bg-purple-100 text-purple-600' : 'bg-slate-100 text-slate-600'}`}>
                           {u.accountType}
                         </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-slate-600 font-medium">{u.children?.length || 0}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                         <div className="flex justify-end gap-2">
                           <button className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded" title="View Details">
                             <Eye size={16} />
                           </button>
                           <button className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded" title="Suspend User">
                             <Ban size={16} />
                           </button>
                           <button className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded" title="More">
                             <MoreHorizontal size={16} />
                           </button>
                         </div>
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
