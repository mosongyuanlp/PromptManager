import React, { useState, useMemo } from 'react';
import { Asset, Version } from '../types';
import { ArrowLeft, Copy, Edit2, History, Check, GitCompare, X, Split } from 'lucide-react';
import { diffWords } from 'diff';
import { useTranslation } from '../contexts/LanguageContext';

interface AssetDetailProps {
  asset: Asset;
  onBack: () => void;
  onEdit: (asset: Asset) => void;
}

export const AssetDetail: React.FC<AssetDetailProps> = ({ asset, onBack, onEdit }) => {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);
  
  // State for viewing
  const [viewVersion, setViewVersion] = useState<Version | null>(null);
  
  // State for comparison
  const [isComparing, setIsComparing] = useState(false);
  const [compareVersion, setCompareVersion] = useState<Version | null>(null);

  // Resolve the primary version object
  const currentVersionObj = asset.versions.find(v => v.version === asset.currentVersion) || {
      version: asset.currentVersion,
      content: asset.content,
      changelog: "Current Head",
      timestamp: asset.updatedAt
  };

  const primaryVersion = viewVersion || currentVersionObj;

  // Determine comparison pair (Older vs Newer)
  const comparisonData = useMemo(() => {
    if (!isComparing || !compareVersion) return null;

    const v1 = primaryVersion;
    const v2 = compareVersion;
    
    // Sort by timestamp to correctly identify "From" (Older) and "To" (Newer)
    const sorted = [v1, v2].sort((a, b) => a.timestamp - b.timestamp);
    const older = sorted[0];
    const newer = sorted[1];

    // Compute diffs
    const contentDiff = diffWords(older.content, newer.content);
    
    return { older, newer, contentDiff };
  }, [isComparing, compareVersion, primaryVersion]);


  const handleCopy = () => {
    navigator.clipboard.writeText(primaryVersion.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleCompareMode = () => {
    if (isComparing) {
      setIsComparing(false);
      setCompareVersion(null);
    } else {
      setIsComparing(true);
      // Don't auto-select a version, let user pick from list
    }
  };

  const handleVersionClick = (ver: Version) => {
    if (isComparing) {
      if (ver.version === primaryVersion.version) return; // Prevent comparing same
      setCompareVersion(ver);
    } else {
      setViewVersion(ver.version === asset.currentVersion ? null : ver);
    }
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
          <div className="flex flex-col">
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
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
           <button 
             onClick={toggleCompareMode}
             className={`flex items-center space-x-2 px-3 py-2 rounded-lg border transition-all text-sm font-medium ${
               isComparing 
                 ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300' 
                 : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
             }`}
           >
             {isComparing ? <X size={16} /> : <GitCompare size={16} />}
             <span>{isComparing ? t('exitCompare') : t('compare')}</span>
           </button>
           
           {!isComparing && (
             <button 
               onClick={() => onEdit(asset)}
               className="flex items-center space-x-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg text-slate-200 transition-all text-sm"
             >
               <Edit2 size={16} />
               <span>{t('edit')}</span>
             </button>
           )}
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden gap-6">
        
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          
          {comparisonData ? (
            // COMPARISON VIEW
            <div className="flex-1 flex gap-4 overflow-hidden">
               {/* LEFT PANE (Older) */}
               <div className="flex-1 flex flex-col min-w-0">
                  <div className="flex items-center justify-between mb-2 px-1">
                    <div className="flex items-center gap-2">
                       <span className="text-xs font-bold text-red-400 bg-red-900/20 border border-red-500/30 px-2 py-0.5 rounded">
                         v{comparisonData.older.version}
                       </span>
                       <span className="text-xs text-slate-500">
                         {new Date(comparisonData.older.timestamp).toLocaleDateString()}
                       </span>
                    </div>
                    <span className="text-xs text-slate-500 font-mono">{t('original')}</span>
                  </div>
                  
                  <div className="flex-1 bg-slate-900 border border-slate-700 rounded-lg overflow-auto p-4 text-sm font-mono text-slate-400 leading-relaxed whitespace-pre-wrap">
                    {comparisonData.contentDiff.map((part, index) => {
                      if (part.added) return null; // Don't show added parts in old version
                      return (
                        <span key={index} className={part.removed ? "bg-red-900/40 text-red-200 line-through decoration-red-500/50 decoration-2" : ""}>
                          {part.value}
                        </span>
                      );
                    })}
                  </div>
                  <div className="mt-2 text-xs text-slate-500 px-1">
                     <span className="font-semibold">Log:</span> {comparisonData.older.changelog}
                  </div>
               </div>

               {/* RIGHT PANE (Newer) */}
               <div className="flex-1 flex flex-col min-w-0">
                  <div className="flex items-center justify-between mb-2 px-1">
                    <div className="flex items-center gap-2">
                       <span className="text-xs font-bold text-green-400 bg-green-900/20 border border-green-500/30 px-2 py-0.5 rounded">
                         v{comparisonData.newer.version}
                       </span>
                       <span className="text-xs text-slate-500">
                         {new Date(comparisonData.newer.timestamp).toLocaleDateString()}
                       </span>
                    </div>
                    <span className="text-xs text-slate-500 font-mono">{t('modified')}</span>
                  </div>
                  
                  <div className="flex-1 bg-slate-900 border border-slate-700 rounded-lg overflow-auto p-4 text-sm font-mono text-slate-300 leading-relaxed whitespace-pre-wrap">
                    {comparisonData.contentDiff.map((part, index) => {
                      if (part.removed) return null; // Don't show removed parts in new version
                      return (
                        <span key={index} className={part.added ? "bg-green-900/40 text-green-200 border-b border-green-500/50" : ""}>
                          {part.value}
                        </span>
                      );
                    })}
                  </div>
                   <div className="mt-2 text-xs text-slate-500 px-1">
                     <span className="font-semibold">Log:</span> {comparisonData.newer.changelog}
                  </div>
               </div>
            </div>
          ) : (
            // STANDARD SINGLE VIEW
            <>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
                  {t('content')} ({primaryVersion.version})
                </h3>
                <button 
                  onClick={handleCopy}
                  className="flex items-center space-x-1 text-xs text-primary-400 hover:text-primary-300 transition-colors"
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  <span>{copied ? t('copied') : t('copy')}</span>
                </button>
              </div>
              
              <div className="flex-1 bg-slate-900 border border-slate-700 rounded-lg overflow-hidden relative group">
                 <pre className="w-full h-full p-4 overflow-auto text-sm font-mono text-slate-300 leading-relaxed whitespace-pre-wrap">
                   {primaryVersion.content}
                 </pre>
              </div>
              
              <div className="mt-4 p-4 bg-slate-800/30 border border-slate-700/50 rounded-lg">
                 <h4 className="text-sm font-semibold text-slate-400 mb-1">{t('changelog')}</h4>
                 <p className="text-slate-300 text-sm">{primaryVersion.changelog}</p>
              </div>
            </>
          )}
        </div>

        {/* Sidebar History */}
        <div className="w-72 border-l border-slate-700 pl-6 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between mb-4">
             <div className="flex items-center gap-2 text-slate-100 font-semibold">
                <History size={18} />
                <h2>{t('history')}</h2>
             </div>
          </div>
          
          {isComparing && !compareVersion && (
            <div className="mb-4 p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-xs text-indigo-300 animate-pulse">
              {t('selectToCompare')} <strong>v{primaryVersion.version}</strong>
            </div>
          )}
          
          <div className="flex-1 overflow-y-auto pr-2 space-y-3">
             {[...asset.versions].reverse().map((ver) => {
               const isPrimary = primaryVersion.version === ver.version;
               const isCompareTarget = compareVersion?.version === ver.version;
               
               let stateClass = 'bg-slate-800/50 border-slate-700 text-slate-300';
               
               if (isComparing) {
                   if (isPrimary) stateClass = 'bg-slate-700 border-slate-500 ring-1 ring-slate-500 opacity-50 cursor-not-allowed';
                   else if (isCompareTarget) stateClass = 'bg-indigo-900/20 border-indigo-500 ring-1 ring-indigo-500 text-indigo-300';
                   else stateClass = 'bg-slate-800/50 border-slate-700 hover:border-indigo-500/50 hover:bg-slate-800 cursor-pointer';
               } else {
                   if (isPrimary) stateClass = 'bg-primary-900/20 border-primary-500 ring-1 ring-primary-500 text-primary-400';
                   else stateClass = 'bg-slate-800/50 border-slate-700 hover:bg-slate-800 hover:border-slate-600 cursor-pointer';
               }

               return (
                 <div 
                   key={ver.version}
                   onClick={() => handleVersionClick(ver)}
                   className={`p-3 rounded-lg border transition-all relative ${stateClass}`}
                 >
                   {isComparing && isCompareTarget && (
                       <div className="absolute top-2 right-2 text-indigo-400">
                           <Split size={14} />
                       </div>
                   )}
                   <div className="flex justify-between items-center mb-1">
                     <span className="font-mono text-sm font-bold">
                       {ver.version}
                     </span>
                     <span className="text-[10px] opacity-70">
                       {new Date(ver.timestamp).toLocaleDateString()}
                     </span>
                   </div>
                   <p className="text-xs opacity-80 line-clamp-2">
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