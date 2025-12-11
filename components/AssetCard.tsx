import React from 'react';
import { Asset, AssetType } from '../types';
import { FileText, Lightbulb, Clock, Tag } from 'lucide-react';

interface AssetCardProps {
  asset: Asset;
  onClick: (asset: Asset) => void;
}

export const AssetCard: React.FC<AssetCardProps> = ({ asset, onClick }) => {
  const isIdea = asset.type === AssetType.IDEA;

  return (
    <div 
      onClick={() => onClick(asset)}
      className={`
        relative group p-5 rounded-xl border border-slate-700 bg-slate-800/50 hover:bg-slate-800 
        hover:border-primary-500/50 transition-all cursor-pointer shadow-sm hover:shadow-md overflow-hidden
      `}
    >
      <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
        {isIdea ? <Lightbulb size={64} /> : <FileText size={64} />}
      </div>

      <div className="flex justify-between items-start mb-3 relative z-10">
        <div className="flex items-center space-x-2">
          <span className={`px-2 py-0.5 text-xs font-bold rounded-md border ${
            isIdea 
              ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' 
              : 'bg-primary-500/10 text-primary-400 border-primary-500/20'
          }`}>
            {asset.id}
          </span>
          <span className="text-xs text-slate-400 font-mono">{asset.currentVersion}</span>
        </div>
        <span className="text-xs text-slate-500 flex items-center gap-1">
          <Clock size={12} />
          {new Date(asset.updatedAt).toLocaleDateString()}
        </span>
      </div>

      <h3 className="text-lg font-semibold text-slate-100 mb-2 truncate pr-8 relative z-10">
        {asset.title}
      </h3>

      <div className="text-sm text-slate-400 mb-4 line-clamp-2 min-h-[2.5rem] relative z-10 font-mono bg-slate-900/50 p-2 rounded border border-slate-700/50">
        {asset.content}
      </div>

      <div className="flex items-center justify-between relative z-10">
        <div className="flex flex-wrap gap-2">
           <span className="text-xs text-slate-300 bg-slate-700/50 px-2 py-1 rounded-md">
             {asset.category}
           </span>
           {asset.tags.slice(0, 2).map(tag => (
             <span key={tag} className="flex items-center text-xs text-slate-400">
               <Tag size={10} className="mr-1" /> {tag.replace('#', '')}
             </span>
           ))}
           {asset.tags.length > 2 && (
             <span className="text-xs text-slate-500">+{asset.tags.length - 2}</span>
           )}
        </div>
      </div>
    </div>
  );
};
