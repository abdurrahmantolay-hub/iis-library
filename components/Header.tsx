import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';

interface HeaderProps {
  currentView: 'library' | 'news';
  setCurrentView: (view: 'library' | 'news') => void;
}

const Header: React.FC<HeaderProps> = ({ currentView, setCurrentView }) => {
  const { theme, setThemeName, availableThemes } = useTheme();
  const { user, signOut } = useAuth();

  return (
    <header className="bg-gradient-to-r from-gradient-start to-gradient-end text-text-inverted shadow-lg sticky top-0 z-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center">
            <img src="/assets/logo.svg" alt="School Logo" className="h-12 w-12 mr-4" />
            <div>
              <h1 className="text-xl font-bold">Istanbul Int. School</h1>
              <p className="text-sm opacity-80">Library & News Portal</p>
            </div>
             <nav className="ml-10 flex items-baseline space-x-4">
                <button 
                  onClick={() => setCurrentView('library')}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${currentView === 'library' ? 'bg-white/20' : 'hover:bg-white/10'}`}
                  aria-current={currentView === 'library' ? 'page' : undefined}
                >
                  Library
                </button>
                <button 
                  onClick={() => setCurrentView('news')}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${currentView === 'news' ? 'bg-white/20' : 'hover:bg-white/10'}`}
                  aria-current={currentView === 'news' ? 'page' : undefined}
                >
                  School News
                </button>
              </nav>
          </div>
          <div className="flex items-center space-x-4">
             <div>
              <label htmlFor="theme" className="sr-only">Theme</label>
              <select
                id="theme"
                value={theme.name}
                onChange={(e) => setThemeName(e.target.value)}
                className="block pl-3 pr-10 py-2 text-base bg-white/20 border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50 sm:text-sm rounded-md"
              >
                {Object.keys(availableThemes).map(themeName => (
                  <option className="text-black" key={themeName} value={themeName}>{themeName}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center">
                <div className="text-right mr-3">
                    <p className="text-sm font-semibold">{user?.name}</p>
                    <p className="text-xs opacity-80">{user?.role}</p>
                </div>
                 <button 
                  onClick={signOut}
                  className="px-3 py-2 rounded-md text-sm font-medium bg-white/10 hover:bg-white/20"
                >
                  Sign Out
                </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;