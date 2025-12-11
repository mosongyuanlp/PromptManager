import React, { useState } from 'react';
import { User } from '../types';
import { updateUserApiKey } from '../services/authService';
import { X, Save, Key, User as UserIcon } from 'lucide-react';

interface SettingsModalProps {
  user: User;
  onClose: () => void;
  onUpdateUser: (user: User) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ user, onClose, onUpdateUser }) => {
  const [apiKey, setApiKey] = useState(user.apiKey || '');
  const [msg, setMsg] = useState('');

  const handleSave = () => {
    const updated = updateUserApiKey(apiKey);
    if (updated) {
      onUpdateUser(updated);
      setMsg('Settings saved successfully');
      setTimeout(() => onClose(), 1000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden m-4">
        
        <div className="flex items-center justify-between p-6 border-b border-slate-800">
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <UserIcon size={20} className="text-primary-500"/> 
            User Settings
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="flex items-center gap-4 p-4 bg-slate-800/50 rounded-lg border border-slate-700">
            <div className="bg-primary-500/20 p-3 rounded-full text-primary-400">
               <UserIcon size={24} />
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase font-semibold">Logged in as</p>
              <p className="text-lg font-medium text-slate-200">{user.username}</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
              <Key size={16} className="text-amber-400" />
              Google Gemini API Key
            </label>
            <p className="text-xs text-slate-500 mb-3">
              Enter your own API key to use the AI features. This key is stored locally in your browser.
            </p>
            <input 
              type="password" 
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-slate-200 focus:ring-2 focus:ring-primary-500 focus:outline-none font-mono text-sm"
            />
          </div>

          {msg && (
             <div className="text-green-400 text-sm font-medium flex items-center gap-2 bg-green-900/20 p-2 rounded">
               <Save size={14} /> {msg}
             </div>
          )}
        </div>

        <div className="p-6 border-t border-slate-800 flex justify-end">
          <button 
            onClick={handleSave}
            className="flex items-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            <Save size={18} />
            <span>Save Changes</span>
          </button>
        </div>

      </div>
    </div>
  );
};
