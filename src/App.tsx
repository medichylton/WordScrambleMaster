import React, { useEffect } from 'react';
import { GameProvider } from './contexts/GameContext';
import { MainMenu } from './components/MainMenu';
import { GameView } from './components/GameView';
import { useGame } from './hooks/useGame';
import { testDictionaryAPI } from './utils/wordDictionary';
import './App.css';

function AppContent() {
  const { gameState } = useGame();
  
  useEffect(() => {
    // Test the dictionary API on app load
    testDictionaryAPI().then(result => {
      // Only log in development mode
      if (process.env.NODE_ENV === 'development') {
        if (result.success) {
          console.log('✅ Dictionary API test passed:', result.message);
        } else {
          console.warn('❌ Dictionary API test failed:', result.message);
        }
      }
    });
    
    // Apply retro theme
    document.documentElement.setAttribute('data-theme', 'retro');
    
    // iOS PWA viewport fix
    const setViewportHeight = () => {
      // Use the full window height - safe areas will be handled by CSS
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
      
      // Also set safe area values for debugging
      const safeTop = getComputedStyle(document.documentElement).getPropertyValue('--safe-area-inset-top') || '0px';
      const safeBottom = getComputedStyle(document.documentElement).getPropertyValue('--safe-area-inset-bottom') || '0px';
      
      if (process.env.NODE_ENV === 'development') {
        console.log('Viewport height:', window.innerHeight, 'Safe areas:', safeTop, safeBottom);
      }
    };
    
    // Set initial height
    setViewportHeight();
    
    // Update on resize/orientation change
    window.addEventListener('resize', setViewportHeight);
    window.addEventListener('orientationchange', setViewportHeight);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', setViewportHeight);
      window.removeEventListener('orientationchange', setViewportHeight);
    };
  }, []);

  // Show menu if game hasn't started or is in menu phase
  if (!gameState.gameStarted || gameState.gamePhase === 'menu') {
    return (
      <div className="game-screen crt-effect">
        <div className="pixel-container">
          <MainMenu />
        </div>
      </div>
    );
  }

  // Show game view for all other phases
  return (
    <div className="game-screen crt-effect">
      <div className="pixel-container">
        <GameView />
      </div>
    </div>
  );
}

function App() {
  return (
    <div className="app">
      <GameProvider>
        <AppContent />
      </GameProvider>
    </div>
  );
}

export default App; 