import React, { useState, useEffect } from 'react';
import { Asset, AssetType } from '../types';
import { INITIAL_CATEGORIES } from '../constants';
import { ArrowLeft, Save, Sparkles, Wand2 } from 'lucide-react';
import { generateSuggestions, autoCategorize } from '../services/geminiService';

interface AssetFormProps {
  initialAsset?: Asset | null; // If null, creating new
  onSubmit: (asset: Partial<Asset>, changelog?: string) => void;
  onCancel: () => void;
  nextId: string;
}

export const AssetForm: React.FC<AssetFormProps> = ({ initialAsset, onSubmit, onCancel, nextId }) => {
  const isEditing = !!initialAsset;
  
  const [type, setType] = useState<AssetType>(initialAsset?.type || AssetType.PROMPT);
  const [title, setTitle] = useState(initialAsset?.title || '');
  const [category, setCategory] = useState(initialAsset?.category || '');
  const [tags, setTags] = useState(initialAsset?.tags.join(', ') || '');
  const [content, setContent] = useState(initialAsset?.content || '');
  const [changelog, setChangelog] = useState('');
  
  // AI State
  const [isThinking, setIsThinking] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);

  useEffect(() => {
     if (!initialAsset) {
        // Reset when switching modes for new asset if needed, or keeping type sticky
     }
  }, [initialAsset]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const tagArray = tags.split(',').map(t => t.trim()).filter(t => t.length > 0).map(t => t.startsWith('#') ? t : `#${t}`);
    
    onSubmit({
      id: initialAsset ? initialAsset.id : nextId,
      type,
      title,
      category: category || "Uncategorized",
      tags: tagArray,
      content,
    }, changelog);
  };

  const handleAIEnhance = async () => {
    if (!content) return;
    setIsThinking(true);
    setAiSuggestion(null);
    const suggestion = await generateSuggestions(content, type === AssetType.IDEA ? 'IDEA' : 'PROMPT');
    setAiSuggestion(suggestion);
    setIsThinking(false);
  };
  
  const handleAutoMeta = async () => {
      if (!content) return;
      setIsThinking(true);
      const res = await autoCategorize(content, INITIAL_CATEGORIES);
      if (res) {
          if (res.category) setCategory(res.category);
          if (res.tags && Array.isArray(res.tags)) {
             // Merge tags or replace? Let's append unique ones
             const currentTags = tags.split(',').map(t => t.trim()).filter(t => t);
             const newTags = res.tags.filter((t: string) => !currentTags.includes(t));
             setTags([...currentTags, ...newTags].join(', '));
          }
      }
      setIsThinking(false);
  }

  return (
    <div className="h-full flex flex-col animate-fadeIn max-w-5xl mx-auto w-full">
      <div className="flex items-center justify-between mb-6 border-b border-slate-700 pb-4">
        <div className="flex items-center space-x-4">
          <button 
            onClick={onCancel}
            className="p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-400 hover:text-white"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-bold text-slate-100">
            {isEditing ? `Edit ${initialAsset.id}` : `New ${type}`}
          </h1>
        </div>
        <div className="flex items-center space-x-3">
           {/* AI Actions */}
           <button
             type="button"
             onClick={handleAutoMeta}
             disabled={isThinking || !content}
             className="flex items-center space-x-2 px-3 py-2 text-xs font-medium bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 rounded-lg transition-colors disabled:opacity-50"
           >
             <Wand2 size={14} />
             <span>Auto-Tag</span>
           </button>
           <button
             type="button"
             onClick={handleAIEnhance}
             disabled={isThinking || !content}
             className="flex items-center space-x-2 px-3 py-2 text-xs font-medium bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-lg transition-colors disabled:opacity-50"
           >
             <Sparkles size={14} />
             <span>{type === AssetType.IDEA ? 'Suggest Prompt' : 'Analyze Logic'}</span>
           </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 flex gap-6 overflow-hidden">
        <div className="flex-1 flex flex-col gap-4 overflow-y-auto pr-2">
          {/* Top Meta Fields */}
          <div className="grid grid-cols-12 gap-4">
            {!isEditing && (
              <div className="col-span-12 sm:col-span-3">
                 <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Type</label>
                 <select 
                   value={type} 
                   onChange={(e) => setType(e.target.value as AssetType)}
                   className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-slate-200 focus:ring-2 focus:ring-primary-500 focus:outline-none"
                 >
                   <option value={AssetType.PROMPT}>Prompt</option>
                   <option value={AssetType.IDEA}>Idea</option>
                 </select>
              </div>
            )}
            
            <div className={`${isEditing ? 'col-span-12' : 'col-span-12 sm:col-span-9'}`}>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Title</label>
              <input 
                required
                type="text" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Python Code Reviewer"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-slate-200 focus:ring-2 focus:ring-primary-500 focus:outline-none placeholder-slate-500"
              />
            </div>
            
            <div className="col-span-12 sm:col-span-6">
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Category</label>
              <input 
                type="text" 
                list="category-suggestions"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Select or type..."
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-slate-200 focus:ring-2 focus:ring-primary-500 focus:outline-none placeholder-slate-500"
              />
              <datalist id="category-suggestions">
                {INITIAL_CATEGORIES.map(c => <option key={c} value={c} />)}
              </datalist>
            </div>
            
            <div className="col-span-12 sm:col-span-6">
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Tags (comma separated)</label>
              <input 
                type="text" 
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="#v1, #draft"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-slate-200 focus:ring-2 focus:ring-primary-500 focus:outline-none placeholder-slate-500"
              />
            </div>
          </div>

          {/* Content Editor */}
          <div className="flex-1 flex flex-col min-h-[300px]">
            <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
               {type === AssetType.PROMPT ? 'Prompt Content' : 'Idea Description'}
            </label>
            <textarea 
              required
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={type === AssetType.PROMPT ? "You are an expert in..." : "I want a prompt that helps me..."}
              className="flex-1 w-full bg-slate-900 border border-slate-700 rounded-lg p-4 text-slate-200 font-mono text-sm leading-relaxed focus:ring-2 focus:ring-primary-500 focus:outline-none resize-none"
            />
          </div>

          {/* Changelog for Edits */}
          {isEditing && (
            <div>
               <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Version Remarks / Changelog</label>
               <input 
                 required
                 type="text" 
                 value={changelog}
                 onChange={(e) => setChangelog(e.target.value)}
                 placeholder="What changed in this version?"
                 className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-slate-200 focus:ring-2 focus:ring-primary-500 focus:outline-none placeholder-slate-500"
               />
            </div>
          )}

          <div className="flex justify-end pt-4">
             <button
               type="submit"
               className="flex items-center space-x-2 px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors shadow-lg shadow-primary-900/20"
             >
               <Save size={18} />
               <span>{isEditing ? 'Save New Version' : 'Create Asset'}</span>
             </button>
          </div>
        </div>
        
        {/* AI Sidebar */}
        {(isThinking || aiSuggestion) && (
          <div className="w-80 border-l border-slate-700 pl-6 flex flex-col animate-slideInRight">
             <div className="flex items-center gap-2 mb-4 text-amber-400 font-semibold">
               <Sparkles size={18} />
               <h2>Architect Feedback</h2>
             </div>
             
             {isThinking ? (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mb-2"></div>
                  <span className="text-xs">Analyzing...</span>
                </div>
             ) : (
                <div className="flex-1 overflow-y-auto text-sm text-slate-300 space-y-2 bg-slate-800/30 p-3 rounded-lg border border-slate-700/50">
                   <p className="whitespace-pre-wrap leading-relaxed">{aiSuggestion}</p>
                </div>
             )}
          </div>
        )}
      </form>
    </div>
  );
};
