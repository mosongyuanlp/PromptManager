import React, { useState, useEffect } from 'react';
import { Asset, AssetType, User } from './types';
import { getAssets, saveAssets, exportData } from './services/storageService';
import { getCurrentUser, logout } from './services/authService';
import { AssetCard } from './components/AssetCard';
import { AssetDetail } from './components/AssetDetail';
import { AssetForm } from './components/AssetForm';
import { AuthScreen } from './components/AuthScreen';
import { SettingsModal } from './components/SettingsModal';
import { Layout, Plus, Search, Download, Terminal, Command, LogOut, Settings } from 'lucide-react';

const App: React.FC = () => {
  // Auth State
  const [user, setUser] = useState<User | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  // Navigation State
  const [view, setView] = useState<'LIST' | 'DETAIL' | 'FORM'>('LIST');
  const [activeTab, setActiveTab] = useState<'ALL' | 'PROMPTS' | 'IDEAS'>('ALL');
  
  // Data State
  const [assets, setAssets] = useState<Asset[]>([]);
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Initialization - Check Auth
  useEffect(() => {
    const currentUser = getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }
  }, []);

  // Load Assets when User changes
  useEffect(() => {
    if (user) {
      setAssets(getAssets(user.id));
      setView('LIST'); // Reset view on login
    } else {
      setAssets([]);
    }
  }, [user]);

  // Persistence
  useEffect(() => {
    if (user && assets.length > 0) {
      saveAssets(assets, user.id);
    } else if (user && assets.length === 0) {
       // Also save empty state to avoid reverting to mocks if logic changes
       saveAssets([], user.id);
    }
  }, [assets, user]);

  const handleLogout = () => {
    logout();
    setUser(null);
  };

  if (!user) {
    return <AuthScreen onAuthSuccess={setUser} />;
  }

  // Derived State
  const filteredAssets = assets.filter(asset => {
    const matchesTab = 
      activeTab === 'ALL' ? true :
      activeTab === 'PROMPTS' ? asset.type === AssetType.PROMPT :
      asset.type === AssetType.IDEA;
    
    const matchesSearch = 
      asset.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
      asset.id.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesTab && matchesSearch;
  }).sort((a, b) => b.updatedAt - a.updatedAt);

  const selectedAsset = assets.find(a => a.id === selectedAssetId);

  // Actions
  const handleCreate = () => {
    setSelectedAssetId(null);
    setView('FORM');
  };

  const handleEdit = (asset: Asset) => {
    setSelectedAssetId(asset.id);
    setView('FORM');
  };

  const handleView = (asset: Asset) => {
    setSelectedAssetId(asset.id);
    setView('DETAIL');
  };

  const handleSave = (formAsset: Partial<Asset>, changelog: string = 'Initial version') => {
    if (selectedAssetId && selectedAsset) {
       // Update existing
       const updatedAssets = assets.map(a => {
         if (a.id === selectedAssetId) {
           const newVersionNum = (parseFloat(a.currentVersion.replace('v', '')) + 0.1).toFixed(1);
           const newVersionString = `v${newVersionNum}`;
           
           return {
             ...a,
             ...formAsset,
             currentVersion: newVersionString,
             updatedAt: Date.now(),
             versions: [
               ...a.versions,
               {
                 version: newVersionString,
                 content: formAsset.content!,
                 changelog: changelog,
                 timestamp: Date.now()
               }
             ]
           } as Asset;
         }
         return a;
       });
       setAssets(updatedAssets);
    } else {
       // Create new
       const newAsset: Asset = {
         ...formAsset,
         id: formAsset.id!,
         versions: [{
           version: "v1.0",
           content: formAsset.content!,
           changelog: "Initial creation",
           timestamp: Date.now()
         }],
         currentVersion: "v1.0",
         createdAt: Date.now(),
         updatedAt: Date.now(),
       } as Asset;
       setAssets([newAsset, ...assets]);
    }
    setView('LIST');
    setSelectedAssetId(null);
  };

  const generateNextId = (type: AssetType) => {
    const prefix = type === AssetType.PROMPT ? 'P' : 'I';
    const count = assets.filter(a => a.type === type).length + 1;
    return `${prefix}-${String(count).padStart(3, '0')}`;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-primary-500/30">
      
      {showSettings && (
        <SettingsModal 
          user={user} 
          onClose={() => setShowSettings(false)} 
          onUpdateUser={setUser}
        />
      )}

      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-slate-900 border-r border-slate-800 flex flex-col z-20 hidden md:flex">
        <div className="p-6 border-b border-slate-800 flex items-center gap-3">
          <div className="bg-primary-600 p-2 rounded-lg text-white">
             <Command size={20} />
          </div>
          <div>
            <h1 className="font-bold text-sm text-slate-100 tracking-wide">LIFECYCLE</h1>
            <p className="text-[10px] text-slate-500 uppercase tracking-wider">Prompt Architect</p>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <button 
            onClick={() => { setView('LIST'); setActiveTab('ALL'); }}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${activeTab === 'ALL' && view === 'LIST' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'}`}
          >
            <Layout size={18} />
            <span>Dashboard</span>
          </button>
          <button 
            onClick={() => { setView('LIST'); setActiveTab('PROMPTS'); }}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${activeTab === 'PROMPTS' && view === 'LIST' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'}`}
          >
            <Terminal size={18} />
            <span>Prompts</span>
          </button>
          <button 
             onClick={() => { setView('LIST'); setActiveTab('IDEAS'); }}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${activeTab === 'IDEAS' && view === 'LIST' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'}`}
          >
            <div className="relative">
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
              <Terminal size={18} />
            </div>
            <span>Ideas</span>
          </button>
        </nav>

        {/* User Info & Settings */}
        <div className="p-4 border-t border-slate-800 space-y-2">
            <div className="flex items-center gap-3 px-2 mb-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary-500 to-indigo-600 flex items-center justify-center text-xs font-bold text-white uppercase">
                    {user.username.substring(0,2)}
                </div>
                <div className="flex-1 overflow-hidden">
                    <p className="text-sm font-medium text-slate-200 truncate">{user.username}</p>
                    <p className="text-[10px] text-slate-500">Free Plan</p>
                </div>
            </div>
            
           <button 
             onClick={() => setShowSettings(true)}
             className="w-full flex items-center space-x-3 px-4 py-2 rounded-lg text-xs font-medium text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors"
           >
             <Settings size={14} />
             <span>Settings & API Key</span>
           </button>
           <button 
             onClick={() => exportData(assets)}
             className="w-full flex items-center space-x-3 px-4 py-2 rounded-lg text-xs font-medium text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors"
           >
             <Download size={14} />
             <span>Export Data</span>
           </button>
           <button 
             onClick={handleLogout}
             className="w-full flex items-center space-x-3 px-4 py-2 rounded-lg text-xs font-medium text-red-400 hover:bg-red-500/10 transition-colors"
           >
             <LogOut size={14} />
             <span>Sign Out</span>
           </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="md:ml-64 min-h-screen flex flex-col relative">
        
        {/* Top Mobile Bar */}
        <div className="md:hidden p-4 border-b border-slate-800 bg-slate-900 flex justify-between items-center sticky top-0 z-30">
          <span className="font-bold text-sm">Prompt Architect</span>
          <div className="flex gap-2">
             <button onClick={() => setShowSettings(true)} className="p-2"><Settings size={18}/></button>
             <button onClick={() => setView('LIST')} className="p-2"><Layout size={18}/></button>
          </div>
        </div>

        <div className="flex-1 p-6 md:p-10 max-w-7xl w-full mx-auto">
          
          {view === 'LIST' && (
            <div className="space-y-8 animate-fadeIn">
               {/* Header Actions */}
               <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h2 className="text-3xl font-bold text-slate-100">
                      {activeTab === 'ALL' ? 'Overview' : activeTab === 'PROMPTS' ? 'Prompts Library' : 'Idea Board'}
                    </h2>
                    <p className="text-slate-400 text-sm mt-1">
                      Managing {filteredAssets.length} assets
                    </p>
                  </div>
                  <button 
                    onClick={handleCreate}
                    className="flex items-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white px-5 py-2.5 rounded-lg font-medium transition-all shadow-lg shadow-primary-900/20 active:scale-95"
                  >
                    <Plus size={20} />
                    <span>New Entry</span>
                  </button>
               </div>

               {/* Search */}
               <div className="relative group">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary-400 transition-colors" size={20} />
                 <input 
                   type="text" 
                   placeholder="Search by title, tag, or ID..."
                   value={searchQuery}
                   onChange={(e) => setSearchQuery(e.target.value)}
                   className="w-full bg-slate-900 border border-slate-800 rounded-xl py-4 pl-12 pr-4 text-slate-200 focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 outline-none transition-all placeholder-slate-600 shadow-sm"
                 />
               </div>

               {/* Grid */}
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {filteredAssets.length > 0 ? (
                   filteredAssets.map(asset => (
                     <AssetCard key={asset.id} asset={asset} onClick={handleView} />
                   ))
                 ) : (
                   <div className="col-span-full py-20 text-center text-slate-500 border-2 border-dashed border-slate-800 rounded-xl bg-slate-900/30">
                     <p>No assets found. Start by creating a new prompt or idea.</p>
                   </div>
                 )}
               </div>
            </div>
          )}

          {view === 'DETAIL' && selectedAsset && (
            <AssetDetail 
              asset={selectedAsset} 
              onBack={() => setView('LIST')} 
              onEdit={handleEdit}
            />
          )}

          {view === 'FORM' && (
            <AssetForm 
              initialAsset={selectedAssetId ? selectedAsset : null}
              nextId={selectedAssetId ? selectedAssetId : generateNextId(AssetType.PROMPT)} // Temporary ID logic for display, actual logic in save
              onSubmit={handleSave}
              onCancel={() => setView('LIST')}
            />
          )}

        </div>
      </main>
    </div>
  );
};

export default App;
