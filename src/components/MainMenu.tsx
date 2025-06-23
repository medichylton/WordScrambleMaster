import React, { useState } from 'react';
import { useGame } from '../hooks/useGame';

export function MainMenu() {
  const { gameState, dispatch } = useGame();
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  // Check if there's a saved game
  const hasSavedGame = localStorage.getItem('wordScrambleGameState') !== null;
  
  const startNewGame = () => {
    // Clear any saved state
    localStorage.removeItem('wordScrambleGameState');
    dispatch({ type: 'START_GAME' });
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
        startNewGame();
      }
    } else {
      startNewGame();
    }
  };

  return (
    <div className="main-menu">
      {/* Retro Game Logo */}
      <div className="menu-title">
        WORD SCRAMBLE<br/>
        MASTER
      </div>

      {/* Retro Menu Buttons */}
      <div className="menu-options">
        <button 
          onClick={startNewGame}
          className="menu-button"
        >
          NEW GAME
        </button>
        
        {hasSavedGame && (
          <button 
            onClick={continueGame}
            className="menu-button"
          >
            CONTINUE
          </button>
        )}
        
        <button 
          onClick={() => setShowHowToPlay(true)}
          className="menu-button"
        >
          HOW TO PLAY
        </button>
        
        <button 
          onClick={() => setShowSettings(true)}
          className="menu-button"
        >
          SETTINGS
        </button>
      </div>

      {/* How To Play Modal */}
      {showHowToPlay && (
        <div className="modal-overlay" onClick={() => setShowHowToPlay(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2 className="modal-title">HOW TO PLAY</h2>
            
            <div style={{ textAlign: 'left', lineHeight: '1.4' }}>
              <div style={{ marginBottom: '12px' }}>
                <strong style={{ color: 'var(--pyxel-yellow)' }}>OBJECTIVE:</strong><br/>
                Find words by connecting adjacent letters. Complete challenges to earn coins!
              </div>
              
              <div style={{ marginBottom: '12px' }}>
                <strong style={{ color: 'var(--pyxel-yellow)' }}>CONTROLS:</strong><br/>
                • Tap letters to select<br/>
                • Letters must be adjacent<br/>
                • Tap SUBMIT to score word<br/>
                • Words need 3+ letters
              </div>
              
              <div style={{ marginBottom: '12px' }}>
                <strong style={{ color: 'var(--pyxel-yellow)' }}>SCORING:</strong><br/>
                • 3-4 letters: 1 point<br/>
                • 5 letters: 2 points<br/>
                • 6 letters: 3 points<br/>
                • 7 letters: 5 points<br/>
                • 8+ letters: 11 points
              </div>
            </div>
            
            <button 
              className="modal-close" 
              onClick={() => setShowHowToPlay(false)}
            >
              CLOSE
            </button>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div className="modal-overlay" onClick={() => setShowSettings(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2 className="modal-title">SETTINGS</h2>
            
            <div>
              <div className="settings-group">
                <div className="settings-label">DIFFICULTY</div>
                <DifficultySelector />
              </div>
              
              <div className="settings-group">
                <div className="settings-label">SOUND</div>
                <GameOptions />
              </div>
              
              <div className="settings-group">
                <div className="settings-label">STATS</div>
                <GameStats />
              </div>
            </div>
            
            <button 
              className="modal-close" 
              onClick={() => setShowSettings(false)}
            >
              CLOSE
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function DifficultySelector() {
  const [difficulty, setDifficulty] = useState(() => 
    localStorage.getItem('gameDifficulty') || 'medium'
  );
  
  const handleDifficultyChange = (newDifficulty: string) => {
    setDifficulty(newDifficulty);
    localStorage.setItem('gameDifficulty', newDifficulty);
  };
  
  return (
    <div className="settings-options">
      <button 
        className={`setting-option ${difficulty === 'easy' ? 'active' : ''}`}
        onClick={() => handleDifficultyChange('easy')}
      >
        EASY
      </button>
      <button 
        className={`setting-option ${difficulty === 'medium' ? 'active' : ''}`}
        onClick={() => handleDifficultyChange('medium')}
      >
        MEDIUM
      </button>
      <button 
        className={`setting-option ${difficulty === 'hard' ? 'active' : ''}`}
        onClick={() => handleDifficultyChange('hard')}
      >
        HARD
      </button>
    </div>
  );
}

function GameOptions() {
  const [soundEnabled, setSoundEnabled] = useState(() => 
    localStorage.getItem('soundEnabled') !== 'false'
  );
  
  const handleToggle = (value: boolean) => {
    setSoundEnabled(value);
    localStorage.setItem('soundEnabled', value.toString());
  };
  
  return (
    <div className="settings-options">
      <button 
        className={`setting-option ${soundEnabled ? 'active' : ''}`}
        onClick={() => handleToggle(true)}
      >
        ON
      </button>
      <button 
        className={`setting-option ${!soundEnabled ? 'active' : ''}`}
        onClick={() => handleToggle(false)}
      >
        OFF
      </button>
    </div>
  );
}

function GameStats() {
  const stats = {
    gamesPlayed: parseInt(localStorage.getItem('gamesPlayed') || '0'),
    totalScore: parseInt(localStorage.getItem('totalScore') || '0'),
    wordsFound: parseInt(localStorage.getItem('wordsFound') || '0'),
    longestWord: localStorage.getItem('longestWord') || 'NONE'
  };
  
  return (
    <div style={{ fontSize: 'clamp(5px, 1.5vw, 7px)', lineHeight: '1.6' }}>
      <div>GAMES: {stats.gamesPlayed}</div>
      <div>SCORE: {stats.totalScore}</div>
      <div>WORDS: {stats.wordsFound}</div>
      <div>LONGEST: {stats.longestWord}</div>
    </div>
  );
} 