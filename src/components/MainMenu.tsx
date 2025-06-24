import React, { useState } from 'react';
import { useGame } from '../hooks/useGame';
import { useSettings } from '../contexts/SettingsContext';
import { DifficultyStake } from '../types/game';
import SettingsMenu from './SettingsMenu';

const MainMenu: React.FC = () => {
  const { dispatch } = useGame();
  const { settings } = useSettings();
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  // Check if there's a saved game
  const hasSavedGame = localStorage.getItem('wordScrambleGameState') !== null;
  
  const handleStartGame = (stake: DifficultyStake) => {
    dispatch({ type: 'START_NEW_RUN', payload: { stake } });
  };
  
  const continueGame = () => {
    // Load saved state
    const savedState = localStorage.getItem('wordScrambleGameState');
    if (savedState) {
      try {
        const parsedState = JSON.parse(savedState);
        dispatch({ type: 'LOAD_GAME', payload: parsedState });
      } catch (error) {
        console.error('Failed to load saved game:', error);
        handleStartGame('apprentice');
      }
    } else {
      handleStartGame('apprentice');
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
    <div 
      className="crt-screen"
      style={{
        width: '100vw',
        height: 'calc(var(--vh, 1vh) * 100)',
        background: 'var(--color-bg)',
        position: 'fixed',
        top: 0,
        left: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'Courier New', 'Monaco', 'Menlo', monospace",
        color: 'var(--color-text)',
        padding: '20px',
        boxSizing: 'border-box',
        overflow: 'hidden'
      }}
    >
      {/* Power LED - completely flat */}
      <div 
        className="power-led"
        style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          width: '12px',
          height: '12px',
          background: 'var(--color-text)'
        }}
      />

      {/* LETTRO Logo - much larger and flat */}
      <div 
        style={{
          textAlign: 'center',
          marginBottom: '40px'
        }}
      >
        <h1 
          style={{
            fontSize: '48px', /* Much larger */
            fontWeight: 'bold',
            color: 'var(--color-text)',
            margin: '0 0 16px 0',
            fontFamily: "'Courier New', 'Monaco', 'Menlo', monospace",
            letterSpacing: '4px',
            textTransform: 'uppercase',
            lineHeight: '1'
          }}
        >
          LETTRO
        </h1>
        
        <div 
          style={{
            fontSize: '20px', /* Much larger */
            fontWeight: 'bold',
            background: 'var(--color-accent)',
            color: 'var(--color-bg)',
            padding: '8px 16px',
            border: '2px solid var(--color-text)',
            display: 'inline-block',
            textTransform: 'uppercase',
            letterSpacing: '2px'
          }}
        >
          WORD SCRAMBLE MASTER
        </div>
      </div>

      {/* Challenge Selection - much larger buttons */}
      <div 
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          width: '100%',
          maxWidth: '400px',
          alignItems: 'center'
        }}
      >
        <h2 
          style={{
            fontSize: '24px', /* Much larger */
            fontWeight: 'bold',
            color: 'var(--color-text)',
            margin: '0 0 20px 0',
            textAlign: 'center',
            textTransform: 'uppercase',
            letterSpacing: '2px'
          }}
        >
          SELECT CHALLENGE
        </h2>

        <button
          className="gb-button"
          onClick={() => handleStartGame('apprentice')}
          style={{
            width: '100%',
            fontSize: '20px', /* Much larger */
            padding: '16px 24px',
            background: 'var(--color-bg)',
            border: '3px solid var(--color-text)',
            color: 'var(--color-text)',
            fontFamily: "'Courier New', 'Monaco', 'Menlo', monospace",
            fontWeight: 'bold',
            textTransform: 'uppercase',
            letterSpacing: '2px',
            cursor: 'pointer'
          }}
        >
          &gt;&gt; APPRENTICE - BEGINNER
        </button>

        <button
          className="gb-button"
          onClick={() => handleStartGame('scholar')}
          style={{
            width: '100%',
            fontSize: '20px', /* Much larger */
            padding: '16px 24px',
            background: 'var(--color-bg)',
            border: '3px solid var(--color-text)',
            color: 'var(--color-text)',
            fontFamily: "'Courier New', 'Monaco', 'Menlo', monospace",
            fontWeight: 'bold',
            textTransform: 'uppercase',
            letterSpacing: '2px',
            cursor: 'pointer'
          }}
        >
          ** SCHOLAR - INTERMEDIATE
        </button>

        <button
          className="gb-button"
          onClick={() => handleStartGame('expert')}
          style={{
            width: '100%',
            fontSize: '20px', /* Much larger */
            padding: '16px 24px',
            background: 'var(--color-bg)',
            border: '3px solid var(--color-text)',
            color: 'var(--color-text)',
            fontFamily: "'Courier New', 'Monaco', 'Menlo', monospace",
            fontWeight: 'bold',
            textTransform: 'uppercase',
            letterSpacing: '2px',
            cursor: 'pointer'
          }}
        >
          ## EXPERT - ADVANCED
        </button>
      </div>

      {/* Game Info - larger text */}
      <div 
        style={{
          position: 'absolute',
          bottom: '20px',
          left: '20px',
          right: '20px',
          textAlign: 'center'
        }}
      >
        <div 
          style={{
            fontSize: '16px', /* Much larger */
            color: 'var(--color-text)',
            fontWeight: 'bold',
            textTransform: 'uppercase',
            letterSpacing: '1px'
          }}
        >
          FIND WORDS IN THE GRID
        </div>
        <div 
          style={{
            fontSize: '14px', /* Larger */
            color: 'var(--color-accent)',
            fontWeight: 'bold',
            marginTop: '8px',
            textTransform: 'uppercase'
          }}
        >
          CONNECT ADJACENT LETTERS
        </div>
      </div>

      {/* Menu Options - Stacked Vertically */}
      <div style={{
        position: 'absolute',
        bottom: '80px',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '12px',
        zIndex: 5,
        paddingBottom: `calc(env(safe-area-inset-bottom, 0px) + 20px)`
      }}>
        <button
          onClick={() => setShowSettings(true)}
          className="gb-button"
          style={{
            padding: '12px 20px',
            fontSize: '16px',
            background: 'var(--color-bg)',
            color: 'var(--color-text)',
            border: '3px solid var(--color-text)',
            fontFamily: "'Courier New', 'Monaco', 'Menlo', monospace",
            fontWeight: 'bold',
            textTransform: 'uppercase',
            cursor: 'pointer',
            minWidth: '140px'
          }}
        >
          [*] SETTINGS
        </button>
        
        <button
          onClick={() => setShowHowToPlay(true)}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--color-accent)',
            fontFamily: "'Courier New', 'Monaco', 'Menlo', monospace",
            fontSize: '14px',
            fontWeight: 'bold',
            textTransform: 'uppercase',
            cursor: 'pointer',
            textDecoration: 'underline',
            padding: '4px 8px'
          }}
        >
          [?] HOW TO PLAY
        </button>
      </div>

      {/* How to Play Modal - Authentic Game Boy Style */}
      {showHowToPlay && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            maxWidth: '400px',
            maxHeight: '80vh',
            overflow: 'auto',
            background: 'var(--color-bg)',
            border: '3px solid var(--color-text)',
            padding: '20px'
          }}>
            <h2 style={{
              fontSize: '18px',
              marginBottom: '16px',
              textAlign: 'center',
              color: 'var(--color-text)',
              fontFamily: "'Courier New', 'Monaco', 'Menlo', monospace",
              fontWeight: 'bold',
              textTransform: 'uppercase'
            }}>
              [?] HOW TO PLAY
            </h2>
            
            <div style={{
              fontSize: '14px',
              lineHeight: '1.4',
              marginBottom: '16px',
              color: 'var(--color-text)',
              fontFamily: "'Courier New', 'Monaco', 'Menlo', monospace"
            }}>
              <div style={{ marginBottom: '12px' }}>
                <strong>OBJECTIVE:</strong><br/>
                Find words by connecting adjacent letters on the grid.
              </div>
              
              <div style={{ marginBottom: '12px' }}>
                <strong>CONTROLS:</strong><br/>
                • Tap letters to select them<br/>
                • Connect adjacent letters (including diagonals)<br/>
                • Tap the last letter again to submit word
              </div>
              
              <div style={{ marginBottom: '12px' }}>
                <strong>SCORING:</strong><br/>
                • 2-letter words: 3 points<br/>
                • 3-4 letter words: 5 points<br/>
                • 5+ letter words: 8-25 points
              </div>
              
              <div>
                <strong>TIPS:</strong><br/>
                • Longer words score more points<br/>
                • Look for common word patterns<br/>
                • Use all available time wisely
              </div>
            </div>
            
            <button
              onClick={() => setShowHowToPlay(false)}
              className="gb-button"
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '16px',
                background: 'var(--color-accent)',
                color: 'var(--color-bg)',
                border: '3px solid var(--color-text)',
                fontFamily: "'Courier New', 'Monaco', 'Menlo', monospace",
                fontWeight: 'bold',
                textTransform: 'uppercase',
                cursor: 'pointer'
              }}
            >
              [B] BACK
            </button>
          </div>
        </div>
      )}

      {/* Settings Menu */}
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