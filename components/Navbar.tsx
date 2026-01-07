import React from 'react';
import { User } from '../types.ts';
import { ICONS } from '../constants.tsx';

interface NavbarProps {
  user: User | null;
  onLogout: () => void;
  onLoginClick: () => void;
  onGoHome: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ user, onLogout, onLoginClick, onGoHome }) => {
  return (
    <nav className="bg-white/80 backdrop-blur-xl border-b border-slate-200/50 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="flex justify-between h-20 items-center">
          <div 
            className="flex items-center space-x-4 cursor-pointer group" 
            onClick={(e) => {
              e.preventDefault();
              onGoHome();
            }}
          >
            <div className="w-12 h-12 bg-gradient-to-br from-sky-500 to-sky-700 rounded-[1rem] flex items-center justify-center text-white shadow-xl shadow-sky-500/30 group-hover:scale-105 group-hover:rotate-2 transition-all duration-500 ease-out">
              <ICONS.Logo />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black tracking-tight text-slate-900 leading-none">
                BlueCarbon
              </span>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-sky-600/60 mt-0.5">
                Protocol Ledger
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-6 lg:space-x-10">
            {user ? (
              <div className="flex items-center space-x-5">
                <div className="hidden md:flex flex-col text-right">
                  <span className="text-sm font-bold text-slate-900">{user.name}</span>
                  <div className="flex items-center justify-end space-x-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                    <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest">
                      {user.role} Verified
                    </span>
                  </div>
                </div>
                <div className="h-10 w-px bg-slate-200 hidden md:block"></div>
                <button 
                  onClick={onLogout}
                  className="bg-slate-50 text-slate-400 hover:text-red-500 hover:bg-red-50 p-2.5 rounded-xl transition-all duration-300 active:scale-90"
                  title="Logout"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <button 
                  onClick={onLoginClick}
                  className="bg-slate-900 text-white px-10 py-3 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] hover:bg-sky-600 hover:shadow-2xl hover:shadow-sky-500/20 transition-all duration-500 active:scale-95"
                >
                  Login
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;