import React from 'react';
import { Search, Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import './Header.css';

const Header: React.FC = () => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <header className="header">
      <div className="search-container">
        <Search className="search-icon" size={20} />
        <input 
          type="text" 
          className="search-input text-body-md" 
          placeholder="Search modems, serials, clients..." 
        />
      </div>

      <div className="header-actions">
        <button 
          className="notification-btn" 
          onClick={toggleTheme}
          title={isDarkMode ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
        >
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>
    </header>
  );
};

export default Header;
