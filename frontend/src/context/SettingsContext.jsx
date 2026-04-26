import React, { createContext, useContext, useState, useEffect } from 'react';

/**
 * SettingsContext manages the globally persistent user preferences:
 * Theme (Dark/Light) and Language.
 */
const SettingsContext = createContext(null);

export const SettingsProvider = ({ children }) => {
  // Initialize from localStorage or default to dark
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'dark';
  });

  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('language') || 'en';
  });

  // Automatically apply theme attribute to DOM root for global.css hooks
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <SettingsContext.Provider value={{ theme, setTheme, toggleTheme, language, setLanguage }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be within SettingsProvider');
  return ctx;
};
