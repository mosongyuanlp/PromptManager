import React, { useState } from 'react';
import { login, register } from '../services/authService';
import { User } from '../types';
import { KeyRound, UserPlus, LogIn, Command, Globe } from 'lucide-react';
import { useTranslation } from '../contexts/LanguageContext';

interface AuthScreenProps {
  onAuthSuccess: (user: User) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onAuthSuccess }) => {
  const { t, language, setLanguage } = useTranslation();
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!username || !password) {
      setError(t('fillFields'));
      return;
    }

    try {
      if (isLogin) {
        const user = login(username, password);
        onAuthSuccess(user);
      } else {
        const user = register(username, password);
        onAuthSuccess(user);
      }
    } catch (err: any) {
      setError(err.message || "Authentication failed");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="absolute top-4 right-4 flex gap-2">
         <button 
           onClick={() => setLanguage(language === 'en' ? 'zh' : 'en')}
           className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-slate-400 hover:text-white text-xs font-medium transition-colors"
         >
           <Globe size={14} />
           {language === 'en' ? 'EN' : '中文'}
         </button>
      </div>

      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-fadeIn">
        
        {/* Header */}
        <div className="p-8 pb-0 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary-600 text-white mb-4 shadow-lg shadow-primary-600/20">
            <Command size={24} />
          </div>
          <h1 className="text-2xl font-bold text-slate-100 mb-2">{t('appName')}</h1>
          <p className="text-slate-400 text-sm">{t('appDesc')}</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-4">
          
          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
              {error}
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-400 uppercase">{t('username')}</label>
            <input 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-slate-200 focus:ring-2 focus:ring-primary-500 focus:outline-none"
              placeholder={t('username')}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-400 uppercase">{t('password')}</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-slate-200 focus:ring-2 focus:ring-primary-500 focus:outline-none"
              placeholder="••••••••"
            />
          </div>

          <button 
            type="submit"
            className="w-full flex items-center justify-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white py-3 rounded-lg font-medium transition-all shadow-lg shadow-primary-900/20 mt-6"
          >
            {isLogin ? <LogIn size={18} /> : <UserPlus size={18} />}
            <span>{isLogin ? t('signIn') : t('createAccount')}</span>
          </button>
        </form>

        {/* Footer Toggle */}
        <div className="bg-slate-950/50 p-4 text-center border-t border-slate-800">
          <p className="text-sm text-slate-400">
            {isLogin ? t('noAccount') : t('haveAccount')}
            <button 
              onClick={() => { setIsLogin(!isLogin); setError(''); }}
              className="ml-2 text-primary-400 hover:text-primary-300 font-medium transition-colors"
            >
              {isLogin ? t('register') : t('logIn')}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
