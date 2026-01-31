"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Theme = "cyberpunk" | "matrix" | "neon";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("cyberpunk");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Load theme from localStorage
    const stored = localStorage.getItem("sentinel-settings");
    if (stored) {
      try {
        const settings = JSON.parse(stored);
        if (settings.theme) {
          setThemeState(settings.theme);
          document.documentElement.setAttribute("data-theme", settings.theme);
        }
      } catch (e) {
        console.error("Failed to load theme:", e);
      }
    }
  }, []);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
    
    // Update localStorage
    const stored = localStorage.getItem("sentinel-settings");
    if (stored) {
      try {
        const settings = JSON.parse(stored);
        settings.theme = newTheme;
        localStorage.setItem("sentinel-settings", JSON.stringify(settings));
      } catch (e) {
        console.error("Failed to save theme:", e);
      }
    }
  };

  // Prevent flash of unstyled content
  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    // Return default values during SSR or if not in provider
    return {
      theme: "cyberpunk" as Theme,
      setTheme: () => {}
    };
  }
  return context;
}
