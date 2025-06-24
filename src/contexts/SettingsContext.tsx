import React, { createContext, useContext, useState, useEffect } from 'react';

export interface GameSettings {
  // Display Settings
  crtEffect: boolean;
  blackWhiteMode: boolean;
  
  // Gameplay Settings
  animations: boolean;
  difficulty: 'apprentice' | 'scholar' | 'expert' | 'master' | 'grandmaster';
  autoSave: boolean;
  
  // Audio Settings
  soundEffects: boolean;
  backgroundMusic: boolean;
  
  // Fun Tweaks
  retroMode: boolean;
  screenShake: boolean;
}

interface SettingsContextType {
  settings: GameSettings;
  updateSetting: <K extends keyof GameSettings>(key: K, value: GameSettings[K]) => void;
  updateSettings: (newSettings: Partial<GameSettings>) => void;
  resetSettings: () => void;
}

const defaultSettings: GameSettings = {
  crtEffect: true,
  blackWhiteMode: false,
  animations: true,
  difficulty: 'apprentice',
  autoSave: true,
  soundEffects: true,
  backgroundMusic: false,
  retroMode: false,
  screenShake: true,
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

  const updateSettings = (newSettings: Partial<GameSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
  };

  const applySettingsToCSS = (currentSettings: GameSettings) => {
    const root = document.documentElement;
    
    // Apply color scheme
    if (currentSettings.blackWhiteMode) {
      root.style.setProperty('--color-bg', '#000000');
      root.style.setProperty('--color-text', '#ffffff');
      root.style.setProperty('--color-accent', '#888888');
      root.setAttribute('data-color-scheme', 'monochrome');
    } else {
      root.style.setProperty('--color-bg', '#9BBB0F');
      root.style.setProperty('--color-text', '#0F380F');
      root.style.setProperty('--color-accent', '#8BAC0F');
      root.removeAttribute('data-color-scheme');
    }
    
    // Apply CRT effect
    if (currentSettings.crtEffect) {
      root.style.setProperty('--crt-effect', 'block');
      root.setAttribute('data-crt', '1');
    } else {
      root.style.setProperty('--crt-effect', 'none');
      root.removeAttribute('data-crt');
    }
    
    // Apply animations
    if (currentSettings.animations) {
      root.style.setProperty('--animations-enabled', '1');
      root.setAttribute('data-animations', '1');
    } else {
      root.style.setProperty('--animations-enabled', '0');
      root.setAttribute('data-animations', '0');
    }
    
    // Apply retro mode
    if (currentSettings.retroMode) {
      root.setAttribute('data-retro', '1');
      root.style.setProperty('--pixel-perfect', 'pixelated');
    } else {
      root.removeAttribute('data-retro');
      root.style.setProperty('--pixel-perfect', 'auto');
    }
    
    // Apply screen shake
    if (currentSettings.screenShake) {
      root.setAttribute('data-screen-shake', '1');
    } else {
      root.removeAttribute('data-screen-shake');
    }
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSetting, updateSettings, resetSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}; 