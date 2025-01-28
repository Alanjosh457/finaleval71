import { useState, useEffect } from 'react';

// Hook to manage dark/light theme
const useTheme = () => {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  useEffect(() => {
    // Apply theme to the document body
    document.body.classList.remove('light', 'dark');
    document.body.classList.add(theme);

    // Save theme in localStorage
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  return { theme, toggleTheme };
};

export default useTheme;
