import React, { useState } from 'react';
import { login, register } from '../services/authService';
import { User } from '../types';
import { KeyRound, UserPlus, LogIn, Command } from 'lucide-react';

interface AuthScreenProps {
  onAuthSuccess: (user: User) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!username || !password) {
      setError("Please fill in all fields");
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
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-fadeIn">
        
        {/* Header */}
        <div className="p-8 pb-0 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary-600 text-white mb-4 shadow-lg shadow-primary-600/20">
            <Command size={24} />
          </div>
          <h1 className="text-2xl font-bold text-slate-100 mb-2">Prompt Lifecycle Architect</h1>
          <p className="text-slate-400 text-sm">Manage your prompts and ideas with AI-powered version control.</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-4">
          
          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
              {error}
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-400 uppercase">Username</label>
            <input 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-slate-200 focus:ring-2 focus:ring-primary-500 focus:outline-none"
              placeholder="Enter username"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-400 uppercase">Password</label>
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
            <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
          </button>
        </form>

        {/* Footer Toggle */}
        <div className="bg-slate-950/50 p-4 text-center border-t border-slate-800">
          <p className="text-sm text-slate-400">
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            <button 
              onClick={() => { setIsLogin(!isLogin); setError(''); }}
              className="ml-2 text-primary-400 hover:text-primary-300 font-medium transition-colors"
            >
              {isLogin ? 'Register' : 'Log In'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
