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