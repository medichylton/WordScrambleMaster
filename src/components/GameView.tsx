import React, { useState, useEffect } from 'react';
import { useGame } from '../hooks/useGame';
import { LetterGrid } from './LetterGrid';

export function GameView() {
  const { gameState, resetGame, selectChallenge, dispatch } = useGame();
  const [currentScore, setCurrentScore] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(120);
  const [wordsFound, setWordsFound] = useState<string[]>([]);

  return (
    <div className="game-container">
      {/* Fixed Header */}
      <div className="game-header">
        <div className="header-content">
          <div className="header-left">
            <h1 className="game-title">WORD SCRAMBLE</h1>
            <div className="round-info">ROUND {gameState.currentRound}/{gameState.totalRounds}</div>
          </div>
          <div className="header-right">
            <div className="coin-display">🪙 {gameState.coins}</div>
            <div className="score-display">⭐ {gameState.totalScore}</div>
          </div>
        </div>
      </div>

      {/* Scrollable Game Content */}
      <div className="game-content">
        {gameState.gamePhase === 'selectingChallenge' && <ChallengeSelection />}
        {gameState.gamePhase === 'playingChallenge' && <PlayingChallenge />}
        {gameState.gamePhase === 'shopping' && <ShopPhase />}
        {gameState.gamePhase === 'gameOver' && <GameOver />}
        {gameState.gamePhase === 'victory' && <Victory />}
      </div>

      {/* Fixed Footer with Menu Button */}
      <div className="game-footer">
        <button 
          onClick={resetGame}
          className="menu-btn"
        >
          ⚙️ MENU
        </button>
      </div>
    </div>
  );
}

function ChallengeSelection() {
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
    <div className="challenge-selection">
      <h2 className="section-title">CHOOSE CHALLENGE</h2>
      <div className="challenge-grid">
        <div onClick={() => handleChallengeSelect('quick')}>
          <ChallengeCard 
            type="quick"
            name="Quick Words"
            description="Find words quickly for bonus coins"
            reward={10}
            color=""
          />
        </div>
        <div onClick={() => handleChallengeSelect('standard')}>
          <ChallengeCard 
            type="standard"
            name="Word Builder"
            description="Build your vocabulary strength"
            reward={20}
            color=""
          />
        </div>
        <div onClick={() => handleChallengeSelect('boss')}>
          <ChallengeCard 
            type="boss"
            name="Boss Challenge"
            description="Face unique mechanics and high stakes"
            reward={40}
            color=""
          />
        </div>
      </div>
    </div>
  );
}

function ChallengeCard({ type, name, description, reward, color }: {
  type: string;
  name: string;
  description: string;
  reward: number;
  color: string;
}) {
  return (
    <div className={`challenge-card ${type}`}>
      <h3 className="text-sm md:text-xl font-bold mb-2">{name.toUpperCase()}</h3>
      <p className="mb-4 text-xs md:text-sm">{description.toUpperCase()}</p>
      <div className="text-sm md:text-lg font-semibold">🪙 {reward} COINS</div>
    </div>
  );
}

function PlayingChallenge() {
  const { gameState, dispatch } = useGame();
  const [currentScore, setCurrentScore] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(gameState.currentChallenge?.timeLimit || 120);
  const [wordsFound, setWordsFound] = useState<string[]>([]);
  
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          // Time's up!
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
  
  const handleChallengeComplete = () => {
    const targetScore = gameState.currentChallenge?.targetScore || 500;
    const coinReward = gameState.currentChallenge?.coinReward || 20;
    
    if (currentScore >= targetScore) {
      // Challenge completed successfully
      dispatch({ 
        type: 'COMPLETE_CHALLENGE', 
        payload: { 
          score: currentScore, 
          coins: coinReward + Math.floor(currentScore / 100) // Bonus coins for high scores
        } 
      });
    } else {
      // Challenge failed
      dispatch({ type: 'GAME_OVER' });
    }
  };
  
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  const targetScore = gameState.currentChallenge?.targetScore || 500;
  const progressPercent = Math.min((currentScore / targetScore) * 100, 100);
  
  return (
    <div className="playing-challenge">
      {/* Progress Bar */}
      <div className="progress-bar">
        <div 
          className="progress-fill" 
          style={{ width: `${progressPercent}%` }}
        />
      </div>
      
      {/* Stats */}
      <div className="challenge-stats">
        <div className="stat-card">
          <div className="stat-value">{currentScore}</div>
          <div className="stat-label">/ {targetScore}</div>
          <div className="stat-label">SCORE</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{wordsFound.length}</div>
          <div className="stat-label">/ {gameState.currentChallenge?.maxWords || 25}</div>
          <div className="stat-label">WORDS</div>
        </div>
        <div className={`stat-card ${timeRemaining < 30 ? 'timer-warning' : ''}`}>
          <div className="stat-value">{formatTime(timeRemaining)}</div>
          <div className="stat-label">TIME</div>
        </div>
      </div>
      
      {/* Letter Grid */}
      <div className="grid-container">
        <LetterGrid 
          onWordFound={handleWordFound}
          onScoreUpdate={handleScoreUpdate}
          timeRemaining={timeRemaining}
        />
      </div>
      
      {/* Complete Challenge Button */}
      {currentScore >= targetScore && (
        <div className="complete-challenge">
          <button 
            onClick={handleChallengeComplete}
            className="btn btn-success"
          >
            🎉 COMPLETE
          </button>
        </div>
      )}
    </div>
  );
}

function ShopPhase() {
  const { gameState, dispatch, leaveShop } = useGame();
  
  const shopItems = [
    {
      id: 'vowel-virtuoso',
      name: 'Vowel Virtuoso',
      description: 'Vowels worth 2x points',
      cost: 8,
      artwork: '🎵',
      type: 'letterEnhancer'
    },
    {
      id: 'speed-demon',
      name: 'Speed Demon', 
      description: 'Quick words get +50% score',
      cost: 6,
      artwork: '⚡',
      type: 'wordMultiplier'
    },
    {
      id: 'letter-shuffle',
      name: 'Letter Shuffle',
      description: 'Shuffle the grid (3 uses)',
      cost: 4,
      artwork: '🔄',
      type: 'consumable'
    },
    {
      id: 'word-wizard',
      name: 'Word Wizard',
      description: '7+ letter words score 3x points',
      cost: 12,
      artwork: '🧙‍♂️',
      type: 'letterEnhancer'
    },
    {
      id: 'time-master',
      name: 'Time Master',
      description: 'Add 30 seconds to timer',
      cost: 5,
      artwork: '⏰',
      type: 'consumable'
    }
  ];
  
  const handlePurchase = (item: any) => {
    if (gameState.coins >= item.cost) {
      dispatch({
        type: 'PURCHASE_ITEM',
        payload: { item }
      });
    }
  };
  
  const handleContinue = () => {
    dispatch({ type: 'NEXT_ROUND' });
  };
  
  return (
    <div className="text-center space-y-6">
      <h2 className="text-2xl md:text-3xl font-bold">POWER-UP SHOP</h2>
      
      <div className="text-lg">
        <span className="coin-display">🪙 {gameState.coins} COINS</span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {shopItems.map(item => (
          <ShopItemCard 
            key={item.id}
            name={item.name}
            description={item.description}
            cost={item.cost}
            artwork={item.artwork}
            canAfford={gameState.coins >= item.cost}
            onPurchase={() => handlePurchase(item)}
          />
        ))}
      </div>
      
      <button 
        onClick={handleContinue}
        className="btn btn-primary text-lg px-8 py-4"
      >
        CONTINUE TO ROUND {gameState.currentRound + 1}
      </button>
    </div>
  );
}

function ShopItemCard({ name, description, cost, artwork, canAfford, onPurchase }: {
  name: string;
  description: string;
  cost: number;
  artwork: string;
  canAfford: boolean;
  onPurchase: () => void;
}) {
  return (
    <div className="card-hover p-4 border border-gray-600 bg-gray-800">
      <div className="text-3xl mb-2">{artwork}</div>
      <h3 className="font-bold text-white text-sm md:text-base">{name.toUpperCase()}</h3>
      <p className="text-xs md:text-sm text-gray-300 mb-4">{description.toUpperCase()}</p>
      <button 
        onClick={onPurchase}
        disabled={!canAfford}
        className={`btn text-xs md:text-sm ${canAfford ? 'btn-success' : 'btn-disabled'}`}
      >
        🪙 {cost} COINS
      </button>
    </div>
  );
}

function GameOver() {
  const { resetGame } = useGame();
  
  return (
    <div className="text-center space-y-6">
      <h2 className="text-4xl font-bold text-red-600">Game Over</h2>
      <p className="text-xl">Better luck next time!</p>
      <button onClick={resetGame} className="btn btn-primary">
        Play Again
      </button>
    </div>
  );
}

function Victory() {
  const { resetGame } = useGame();
  
  return (
    <div className="text-center space-y-6">
      <h2 className="text-4xl font-bold text-yellow-600">Victory! 🎉</h2>
      <p className="text-xl">You've mastered all challenges!</p>
      <button onClick={resetGame} className="btn btn-primary">
        Play Again
      </button>
    </div>
  );
} 