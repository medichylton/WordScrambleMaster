import React from 'react';
import { GameProvider } from './contexts/GameContext';
import { MainMenu } from './components/MainMenu';
import { GameView } from './components/GameView';
import { useGame } from './hooks/useGame';
import './App.css';

function AppContent() {
  const { gameState } = useGame();
  
  return (
    <div className="app">
      {gameState.gamePhase === 'menu' ? <MainMenu /> : <GameView />}
    </div>
  );
}

function App() {
  return (
    <GameProvider>
      <AppContent />
    </GameProvider>
  );
}

export default App; 