import React, { createContext, useContext, useState, useEffect } from 'react';

export interface GameSettings {
  // Visual Settings
  crtEffect: boolean;
  animations: boolean;
  colorScheme: 'gameboy' | 'monochrome';
  
  // Gameplay Settings
  difficulty: 'apprentice' | 'scholar' | 'expert' | 'master' | 'grandmaster';
  
  // Audio Settings
  soundEnabled: boolean;
  musicEnabled: boolean;
  
  // Fun Tweaks
  pixelPerfect: boolean;
  scanlines: boolean;
  flicker: boolean;
  glitchEffect: boolean;
  retroMode: boolean;
  
  // Accessibility
  highContrast: boolean;
  largeText: boolean;
  reducedMotion: boolean;
}

interface SettingsContextType {
  settings: GameSettings;
  updateSetting: <K extends keyof GameSettings>(key: K, value: GameSettings[K]) => void;
  resetSettings: () => void;
}

const defaultSettings: GameSettings = {
  crtEffect: true,
  animations: true,
  colorScheme: 'gameboy',
  difficulty: 'apprentice',
  soundEnabled: true,
  musicEnabled: true,
  pixelPerfect: true,
  scanlines: true,
  flicker: false,
  glitchEffect: false,
  retroMode: false,
  highContrast: false,
  largeText: false,
  reducedMotion: false,
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<GameSettings>(() => {
    // Load settings from localStorage on initialization
    const savedSettings = localStorage.getItem('gameSettings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        return { ...defaultSettings, ...parsed };
      } catch (error) {
        console.error('Failed to parse saved settings:', error);
      }
    }
    return defaultSettings;
  });

  // Save settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('gameSettings', JSON.stringify(settings));
    
    // Apply settings to CSS custom properties
    applySettingsToCSS(settings);
  }, [settings]);

  const updateSetting = <K extends keyof GameSettings>(key: K, value: GameSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
  };

  const applySettingsToCSS = (currentSettings: GameSettings) => {
    const root = document.documentElement;
    
    // Apply color scheme
    if (currentSettings.colorScheme === 'monochrome') {
      root.style.setProperty('--color-bg', '#000000');
      root.style.setProperty('--color-text', '#ffffff');
      root.style.setProperty('--color-accent', '#888888');
      root.setAttribute('data-color-scheme', 'monochrome');
    } else {
      root.style.setProperty('--color-bg', '#0f380f');
      root.style.setProperty('--color-text', '#9bbc0f');
      root.style.setProperty('--color-accent', '#306230');
      root.removeAttribute('data-color-scheme');
    }
    
    // Apply CRT effect
    if (currentSettings.crtEffect) {
      root.style.setProperty('--crt-effect', 'block');
    } else {
      root.style.setProperty('--crt-effect', 'none');
    }
    
    // Apply animations
    if (currentSettings.animations) {
      root.style.setProperty('--animations-enabled', '1');
      root.setAttribute('data-animations', '1');
    } else {
      root.style.setProperty('--animations-enabled', '0');
      root.setAttribute('data-animations', '0');
    }
    
    // Apply scanlines
    if (currentSettings.scanlines) {
      root.style.setProperty('--scanlines-enabled', 'block');
    } else {
      root.style.setProperty('--scanlines-enabled', 'none');
    }
    
    // Apply flicker
    if (currentSettings.flicker) {
      root.style.setProperty('--flicker-enabled', '1');
      root.setAttribute('data-flicker', '1');
    } else {
      root.style.setProperty('--flicker-enabled', '0');
      root.removeAttribute('data-flicker');
    }
    
    // Apply glitch effect
    if (currentSettings.glitchEffect) {
      root.style.setProperty('--glitch-enabled', '1');
      root.setAttribute('data-glitch', '1');
    } else {
      root.style.setProperty('--glitch-enabled', '0');
      root.removeAttribute('data-glitch');
    }
    
    // Apply pixel perfect
    if (currentSettings.pixelPerfect) {
      root.style.setProperty('--pixel-perfect', 'pixelated');
    } else {
      root.style.setProperty('--pixel-perfect', 'auto');
    }
    
    // Apply high contrast
    if (currentSettings.highContrast) {
      root.style.setProperty('--high-contrast', '1');
      root.setAttribute('data-high-contrast', '1');
    } else {
      root.style.setProperty('--high-contrast', '0');
      root.removeAttribute('data-high-contrast');
    }
    
    // Apply large text
    if (currentSettings.largeText) {
      root.style.setProperty('--text-scale', '1.2');
      root.setAttribute('data-large-text', '1');
    } else {
      root.style.setProperty('--text-scale', '1');
      root.removeAttribute('data-large-text');
    }
    
    // Apply reduced motion
    if (currentSettings.reducedMotion) {
      root.style.setProperty('--reduced-motion', '1');
      root.setAttribute('data-reduced-motion', '1');
    } else {
      root.style.setProperty('--reduced-motion', '0');
      root.removeAttribute('data-reduced-motion');
    }
    
    // Apply retro mode
    if (currentSettings.retroMode) {
      root.setAttribute('data-retro', '1');
    } else {
      root.removeAttribute('data-retro');
    }
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSetting, resetSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}; 