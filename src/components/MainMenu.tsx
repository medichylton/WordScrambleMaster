import React, { useState, useEffect } from 'react';
import { useGame } from '../hooks/useGame';
import { DifficultyStake } from '../types/game';
import SettingsMenu from './SettingsMenu';

const MainMenu: React.FC = () => {
  const { gameState, startGame, resetGame } = useGame();
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  // Load saved game state on component mount
  useEffect(() => {
    const savedState = localStorage.getItem('wordScrambleGameState');
    if (savedState) {
      try {
        const parsedState = JSON.parse(savedState);
        if (parsedState.gameStarted && parsedState.isGameActive) {
          // Auto-resume if there's an active game
          // The game will automatically load the saved state
        }
      } catch (error) {
        console.error('Failed to parse saved game state:', error);
        localStorage.removeItem('wordScrambleGameState');
      }
    }
  }, []);

  const handleNewGame = () => {
    resetGame();
    startGame('apprentice');
  };

  const handleContinueGame = () => {
    // Game will automatically load from localStorage
    startGame(gameState.difficultyStake || 'apprentice');
  };

  const hasSavedGame = () => {
    const savedState = localStorage.getItem('wordScrambleGameState');
    if (!savedState) return false;
    
    try {
      const parsedState = JSON.parse(savedState);
      return parsedState.gameStarted && parsedState.isGameActive;
    } catch {
      return false;
    }
  };

  // Authentic Game Boy difficulty patterns - using ASCII symbols
  const difficulties = [
    {
      stake: 'apprentice' as DifficultyStake,
      symbol: '>>',
      description: 'Beginner • 1x multiplier • 15 levels',
      color: 'var(--color-text)',
      glow: 'var(--color-text)'
    },
    {
      stake: 'scholar' as DifficultyStake,
      symbol: '**',
      description: 'Intermediate • 1.3x multiplier • 15 levels',
      color: 'var(--color-text)',
      glow: 'var(--color-text)'
    },
    {
      stake: 'expert' as DifficultyStake,
      symbol: '##',
      description: 'Advanced • 1.6x multiplier • 15 levels',
      color: 'var(--color-text)',
      glow: 'var(--color-text)'
    }
  ];

  return (
    <div style={{
      width: '100vw',
      height: 'calc(var(--vh, 1vh) * 100)',
      background: '#9BBB0F', // Game Boy light green
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      paddingTop: `calc(env(safe-area-inset-top, 0px) + 20px)`,
      paddingBottom: `calc(20px + env(safe-area-inset-bottom, 0px))`,
      position: 'fixed',
      top: 0,
      left: 0,
      overflow: 'hidden'
    }}>
      {/* Game Title */}
      <div style={{
        fontSize: '32px',
        fontWeight: 'bold',
        color: '#0F380F',
        textAlign: 'center',
        marginBottom: '40px',
        fontFamily: "'Courier New', 'Monaco', 'Menlo', monospace",
        textTransform: 'uppercase',
        lineHeight: 1.2
      }}>
        Word Scramble<br/>Master
      </div>

      {/* Game Boy Style Frame */}
      <div style={{
        background: '#9BBB0F',
        border: '4px solid #0F380F',
        padding: '32px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        minWidth: '300px',
        maxWidth: '400px',
        width: '100%'
      }}>
        {/* Main Menu Buttons */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          alignItems: 'center'
        }}>
          {hasSavedGame() && (
        <button 
              onClick={handleContinueGame}
              className="gb-button"
              style={{
                width: '100%',
                background: '#0F380F',
                color: '#9BBB0F',
                border: '3px solid #0F380F',
                padding: '16px 24px',
                fontSize: '18px',
                fontWeight: 'bold',
                textTransform: 'uppercase',
                cursor: 'pointer'
              }}
            >
              Continue Game
          </button>
        )}
        
        <button 
            onClick={handleNewGame}
            className="gb-button"
            style={{
              width: '100%',
              background: '#0F380F',
              color: '#9BBB0F',
              border: '3px solid #0F380F',
              padding: '16px 24px',
              fontSize: '18px',
              fontWeight: 'bold',
              textTransform: 'uppercase',
              cursor: 'pointer'
            }}
          >
            New Game
        </button>
        </div>

        {/* Secondary Buttons - Stacked Vertically */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          alignItems: 'center',
          marginTop: '20px'
        }}>
        <button 
          onClick={() => setShowSettings(true)}
            className="gb-button"
            style={{
              background: '#8BAC0F',
              color: '#0F380F',
              border: '2px solid #0F380F',
              padding: '12px 20px',
              fontSize: '16px',
              fontWeight: 'bold',
              textTransform: 'uppercase',
              cursor: 'pointer'
            }}
          >
            Settings
        </button>
          
          <a
            href="https://github.com/yourusername/wordscramblemaster"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: '#0F380F',
              fontSize: '14px',
              fontWeight: 'bold',
              textDecoration: 'underline',
              fontFamily: "'Courier New', 'Monaco', 'Menlo', monospace",
              textTransform: 'uppercase'
            }}
          >
            Help & Info
          </a>
              </div>
              
        {/* Game Stats */}
        {gameState.lifetimeCoins > 0 && (
          <div style={{
            borderTop: '2px solid #0F380F',
            paddingTop: '16px',
            marginTop: '16px',
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: '14px',
              color: '#0F380F',
              fontWeight: 'bold',
              marginBottom: '8px'
            }}>
              Lifetime Stats
              </div>
            <div style={{
              fontSize: '12px',
              color: '#0F380F',
              fontWeight: 'bold'
            }}>
              Coins Earned: ◉ {gameState.lifetimeCoins}
              </div>
            <div style={{
              fontSize: '12px',
              color: '#0F380F',
              fontWeight: 'bold'
            }}>
              Current Run: {gameState.currentRun}
            </div>
          </div>
        )}
      </div>

      {/* Version Info */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        fontSize: '10px',
        color: '#0F380F',
        fontWeight: 'bold',
        opacity: 0.7
      }}>
        v1.0.0 • Game Boy Edition
        </div>

      {/* Settings Modal */}
      {showSettings && (
        <SettingsMenu onClose={() => setShowSettings(false)} />
      )}
    </div>
  );
};

export default MainMenu;

// Additional CSS for authentic Game Boy symbol animations
const additionalStyles = `
@keyframes gb-symbol-pulse {
  0%, 100% { 
    transform: scale(1);
    opacity: 1;
}
  50% { 
    transform: scale(1.1);
    opacity: 0.8;
  }
}
`;

// Inject additional styles
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = additionalStyles;
  document.head.appendChild(styleElement);
} 