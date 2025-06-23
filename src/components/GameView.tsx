import React, { useState, useEffect } from 'react';
import { useGame } from '../hooks/useGame';
import { LetterGrid } from './LetterGrid';

export function GameView() {
  const { gameState, resetGame, selectChallenge, dispatch } = useGame();
  const [currentScore, setCurrentScore] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(120);
  const [wordsFound, setWordsFound] = useState<string[]>([]);
  const [showMenu, setShowMenu] = useState(false);
  const [showShop, setShowShop] = useState(false);

  return (
    <div className="mobile-game-container">
      {/* Compact Mobile Header */}
      <div className="mobile-header">
        <div className="mobile-header-content">
          <div className="timer-display">
            <div className="timer-icon">⏱️</div>
            <div className="timer-text">{formatTime(timeRemaining)}</div>
          </div>
          
          <div className="score-display-mobile">
            <div className="score-number">{gameState.totalScore}</div>
            <div className="target-score">/ {gameState.currentChallenge?.targetScore || 500}</div>
          </div>
          
          <div className="coins-display-mobile">
            <div className="coin-icon">🪙</div>
            <div className="coin-count">{gameState.coins}</div>
          </div>
          
          <button 
            onClick={() => setShowMenu(true)}
            className="mobile-menu-btn"
          >
            ⚙️
          </button>
        </div>
        
        {/* Progress Bar */}
        <div className="mobile-progress-bar">
          <div 
            className="mobile-progress-fill" 
            style={{ width: `${Math.min((gameState.totalScore / (gameState.currentChallenge?.targetScore || 500)) * 100, 100)}%` }}
          />
        </div>
      </div>

      {/* Main Game Content */}
      <div className="mobile-game-content">
        {gameState.gamePhase === 'selectingChallenge' && <MobileChallengeSelection />}
        {gameState.gamePhase === 'playingChallenge' && <MobilePlayingChallenge />}
        {gameState.gamePhase === 'shopping' && <MobileShopPhase />}
        {gameState.gamePhase === 'gameOver' && <MobileGameOver />}
        {gameState.gamePhase === 'victory' && <MobileVictory />}
      </div>

      {/* Modal Overlays */}
      {showMenu && (
        <MobileModal onClose={() => setShowMenu(false)}>
          <MobileMenuContent onClose={() => setShowMenu(false)} />
        </MobileModal>
      )}
      
      {showShop && (
        <MobileModal onClose={() => setShowShop(false)}>
          <MobileShopContent onClose={() => setShowShop(false)} />
        </MobileModal>
      )}
    </div>
  );
}

function MobileChallengeSelection() {
  const { selectChallenge } = useGame();
  
  const handleChallengeSelect = (type: 'quick' | 'standard' | 'boss') => {
    const challenge = {
      id: `${type}-${Date.now()}`,
      type: type as any,
      name: type === 'quick' ? 'Quick Words' : type === 'standard' ? 'Word Builder' : 'Boss Challenge',
      description: type === 'quick' ? 'Find words quickly for bonus coins' : 
                   type === 'standard' ? 'Build your vocabulary strength' : 
                   'Face unique mechanics and high stakes',
      targetScore: type === 'quick' ? 300 : type === 'standard' ? 500 : 800,
      maxWords: type === 'quick' ? 15 : type === 'standard' ? 25 : 35,
      timeLimit: type === 'quick' ? 90 : type === 'standard' ? 120 : 180,
      coinReward: type === 'quick' ? 10 : type === 'standard' ? 20 : 40,
      specialRule: null,
      canSkip: true
    };
    
    selectChallenge(challenge);
  };
  
  return (
    <div className="mobile-challenge-selection">
      <h2 className="mobile-section-title">CHOOSE CHALLENGE</h2>
      <div className="mobile-challenge-grid">
        <div onClick={() => handleChallengeSelect('quick')} className="mobile-challenge-card quick">
          <div className="challenge-card-header">
            <span className="challenge-icon">⚡</span>
            <span className="challenge-name">QUICK WORDS</span>
          </div>
          <div className="challenge-description">Find words quickly for bonus coins</div>
          <div className="challenge-reward">🪙 10 COINS</div>
        </div>
        
        <div onClick={() => handleChallengeSelect('standard')} className="mobile-challenge-card standard">
          <div className="challenge-card-header">
            <span className="challenge-icon">🎯</span>
            <span className="challenge-name">WORD BUILDER</span>
          </div>
          <div className="challenge-description">Build your vocabulary strength</div>
          <div className="challenge-reward">🪙 20 COINS</div>
        </div>
        
        <div onClick={() => handleChallengeSelect('boss')} className="mobile-challenge-card boss">
          <div className="challenge-card-header">
            <span className="challenge-icon">🔥</span>
            <span className="challenge-name">BOSS CHALLENGE</span>
          </div>
          <div className="challenge-description">Face unique mechanics and high stakes</div>
          <div className="challenge-reward">🪙 40 COINS</div>
        </div>
      </div>
    </div>
  );
}

function MobilePlayingChallenge() {
  const { gameState, dispatch } = useGame();
  const [currentScore, setCurrentScore] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(gameState.currentChallenge?.timeLimit || 120);
  const [wordsFound, setWordsFound] = useState<string[]>([]);
  const [currentWord, setCurrentWord] = useState('');
  
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          handleChallengeComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);
  
  const handleWordFound = (word: string, score: number) => {
    setWordsFound(prev => [...prev, word]);
    setCurrentScore(prev => prev + score);
  };
  
  const handleScoreUpdate = (score: number) => {
    // Score is already handled in handleWordFound
  };
  
  const handleCurrentWordChange = (word: string) => {
    setCurrentWord(word);
  };
  
  const handleChallengeComplete = () => {
    const targetScore = gameState.currentChallenge?.targetScore || 500;
    const coinReward = gameState.currentChallenge?.coinReward || 20;
    
    if (currentScore >= targetScore) {
      dispatch({ 
        type: 'COMPLETE_CHALLENGE', 
        payload: { 
          score: currentScore, 
          coins: coinReward + Math.floor(currentScore / 100)
        } 
      });
    } else {
      dispatch({ type: 'GAME_OVER' });
    }
  };
  
  return (
    <div className="mobile-playing-challenge">
      {/* Fixed Current Word Display */}
      <div className="mobile-current-word">
        <div className="current-word-text">
          {currentWord || 'SELECT LETTERS TO FORM WORDS'}
        </div>
        <div className="words-found-count">{wordsFound.length} WORDS FOUND</div>
      </div>

      {/* Fixed Letter Grid Container */}
      <div className="mobile-grid-container">
        <LetterGrid 
          onWordFound={handleWordFound}
          onScoreUpdate={handleScoreUpdate}
          onCurrentWordChange={handleCurrentWordChange}
          timeRemaining={timeRemaining}
          hideWordDisplay={true}
        />
      </div>

      {/* Fixed Action Buttons */}
      <div className="mobile-game-actions">
        <button className="mobile-action-btn shuffle">
          🔄 NEW GRID
        </button>
        <button className="mobile-action-btn hint">
          💡 HINT
        </button>
      </div>
    </div>
  );
}

function MobileShopPhase() {
  return <div>Shop Coming Soon</div>;
}

function MobileGameOver() {
  return <div>Game Over</div>;
}

function MobileVictory() {
  return <div>Victory!</div>;
}

function MobileModal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="mobile-modal-overlay" onClick={onClose}>
      <div className="mobile-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="mobile-modal-close" onClick={onClose}>✕</button>
        {children}
      </div>
    </div>
  );
}

function MobileMenuContent({ onClose }: { onClose: () => void }) {
  const { resetGame } = useGame();
  
  return (
    <div className="mobile-menu-content">
      <h2>GAME MENU</h2>
      <div className="mobile-menu-buttons">
        <button onClick={() => { resetGame(); onClose(); }} className="mobile-menu-btn">
          🏠 MAIN MENU
        </button>
        <button onClick={onClose} className="mobile-menu-btn">
          ▶️ RESUME
        </button>
        <button className="mobile-menu-btn">
          🔊 SOUND: ON
        </button>
        <button className="mobile-menu-btn">
          ❓ HOW TO PLAY
        </button>
      </div>
    </div>
  );
}

function MobileShopContent({ onClose }: { onClose: () => void }) {
  return (
    <div className="mobile-shop-content">
      <h2>POWER-UP SHOP</h2>
      <div className="mobile-shop-items">
        <div className="mobile-shop-item">
          <span className="shop-item-icon">⚡</span>
          <span className="shop-item-name">LETTER BOOST</span>
          <span className="shop-item-cost">🪙 15</span>
        </div>
      </div>
    </div>
  );
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
} 