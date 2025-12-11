import React, { useState } from 'react';
import { Asset, Version } from '../types';
import { ArrowLeft, Copy, Edit2, History, Check } from 'lucide-react';

interface AssetDetailProps {
  asset: Asset;
  onBack: () => void;
  onEdit: (asset: Asset) => void;
}

export const AssetDetail: React.FC<AssetDetailProps> = ({ asset, onBack, onEdit }) => {
  const [copied, setCopied] = useState(false);
  
  // State for selected history version to view. Default is null (showing current).
  const [viewVersion, setViewVersion] = useState<Version | null>(null);

  const displayContent = viewVersion ? viewVersion.content : asset.content;
  const displayVer = viewVersion ? viewVersion.version : asset.currentVersion;
  const displayChangelog = viewVersion ? viewVersion.changelog : asset.versions[asset.versions.length - 1]?.changelog || "Current Head";

  const handleCopy = () => {
    navigator.clipboard.writeText(displayContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="h-full flex flex-col animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 border-b border-slate-700 pb-4">
        <div className="flex items-center space-x-4">
          <button 
            onClick={onBack}
            className="p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-400 hover:text-white"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
              {asset.title}
              <span className="text-sm font-mono bg-slate-800 text-slate-300 px-2 py-1 rounded border border-slate-700">
                {asset.id}
              </span>
            </h1>
            <div className="flex items-center gap-3 mt-1 text-sm text-slate-400">
              <span className="bg-primary-500/10 text-primary-400 px-2 py-0.5 rounded text-xs font-semibold uppercase tracking-wider">
                {asset.type}
              </span>
              <span>•</span>
              <span>{asset.category}</span>
              <span>•</span>
              <div className="flex gap-2">
                {asset.tags.map(tag => (
                  <span key={tag} className="text-slate-500">{tag}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
           <button 
             onClick={() => onEdit(asset)}
             className="flex items-center space-x-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg text-slate-200 transition-all"
           >
             <Edit2 size={16} />
             <span>Edit / New Version</span>
           </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden gap-6">
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
              Prompt Content ({displayVer})
            </h3>
            <button 
              onClick={handleCopy}
              className="flex items-center space-x-1 text-xs text-primary-400 hover:text-primary-300 transition-colors"
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              <span>{copied ? 'Copied' : 'Copy Code'}</span>
            </button>
          </div>
          
          <div className="flex-1 bg-slate-900 border border-slate-700 rounded-lg overflow-hidden relative group">
             <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                {/* Optional floating actions */}
             </div>
             <pre className="w-full h-full p-4 overflow-auto text-sm font-mono text-slate-300 leading-relaxed whitespace-pre-wrap">
               {displayContent}
             </pre>
          </div>
          
          <div className="mt-4 p-4 bg-slate-800/30 border border-slate-700/50 rounded-lg">
             <h4 className="text-sm font-semibold text-slate-400 mb-1">Changelog / Notes</h4>
             <p className="text-slate-300 text-sm">{displayChangelog}</p>
          </div>
        </div>

        {/* Sidebar History */}
        <div className="w-72 border-l border-slate-700 pl-6 flex flex-col overflow-hidden">
          <div className="flex items-center gap-2 mb-4 text-slate-100 font-semibold">
            <History size={18} />
            <h2>Version History</h2>
          </div>
          
          <div className="flex-1 overflow-y-auto pr-2 space-y-3">
             {/* Current Head (if different from saved versions list logic) */}
             {/* In our data model, current state is separate or appended. 
                 Let's assume `versions` contains ALL history including initial. 
                 We iterate through `versions` array reversed. 
             */}
             {[...asset.versions].reverse().map((ver) => {
               const isSelected = viewVersion ? viewVersion.version === ver.version : ver.version === asset.currentVersion;
               return (
                 <div 
                   key={ver.version}
                   onClick={() => setViewVersion(ver.version === asset.currentVersion ? null : ver)}
                   className={`
                     p-3 rounded-lg border cursor-pointer transition-all
                     ${isSelected 
                       ? 'bg-primary-900/20 border-primary-500/50 ring-1 ring-primary-500/20' 
                       : 'bg-slate-800/50 border-slate-700 hover:bg-slate-800 hover:border-slate-600'
                     }
                   `}
                 >
                   <div className="flex justify-between items-center mb-1">
                     <span className={`font-mono text-sm font-bold ${isSelected ? 'text-primary-400' : 'text-slate-300'}`}>
                       {ver.version}
                     </span>
                     <span className="text-[10px] text-slate-500">
                       {new Date(ver.timestamp).toLocaleDateString()}
                     </span>
                   </div>
                   <p className="text-xs text-slate-400 line-clamp-2">
                     {ver.changelog || "No remarks."}
                   </p>
                 </div>
               );
             })}
          </div>
        </div>
      </div>
    </div>
  );
};
