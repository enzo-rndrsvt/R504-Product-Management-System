import React from 'react';
import { useTheme } from '../context/ThemeContext';

const ThemeToggle = () => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="fixed right-4 top-4 rounded-lg bg-white p-2 text-neutral-900 shadow-md transition-colors duration-200 hover:shadow-lg dark:bg-neutral-800 dark:text-white"
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-label="Toggle dark mode"
    >
      <span className="select-none text-lg leading-none">{isDark ? '💡' : '🌙'}</span>
    </button>
  );
};

export default ThemeToggle;
