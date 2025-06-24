import React, { useState, useEffect } from 'react';
import { useGame } from '../hooks/useGame';
import { LetterGrid } from './LetterGrid';

export function GameView() {
  const { gameState, resetGame, selectChallenge, dispatch } = useGame();

  return (
    <div className="game-interface">
      {gameState.gamePhase === 'selectingChallenge' && <ChallengeSelection />}
      {gameState.gamePhase === 'playingChallenge' && <PlayingChallenge />}
      {gameState.gamePhase === 'shopping' && <ShopView />}
      {gameState.gamePhase === 'gameOver' && <GameOver />}
      {gameState.gamePhase === 'victory' && <Victory />}
    </div>
  );
}

function ChallengeSelection() {
  const { selectChallenge } = useGame();
  const [selectedType, setSelectedType] = useState<string>('');
  
  const challengeTypes = [
    {
      type: 'quick',
      name: 'QUICK BLITZ',
      description: 'Fast-paced word hunting',
      icon: '>>',
      targetScore: 30,
      timeLimit: 90,
      coinReward: 15,
      color: 'var(--pyxel-yellow)'
    },
    {
      type: 'standard',
      name: 'WORD MASTER',
      description: 'Balanced challenge',
      icon: '**',
      targetScore: 50,
      timeLimit: 120,
      coinReward: 25,
      color: 'var(--pyxel-blue)'
    },
    {
      type: 'boss',
      name: 'ULTIMATE TEST',
      description: 'Maximum difficulty',
      icon: '##',
      targetScore: 75,
      timeLimit: 180,
      coinReward: 50,
      color: 'var(--pyxel-red)'
    }
  ];
  
  const handleChallengeSelect = (challengeData: any) => {
    const challenge = {
      id: `${challengeData.type}-${Date.now()}`,
      type: challengeData.type as any,
      name: challengeData.name,
      description: challengeData.description,
      targetScore: challengeData.targetScore,
      maxWords: challengeData.type === 'quick' ? 15 : challengeData.type === 'standard' ? 25 : 35,
      timeLimit: challengeData.timeLimit,
      coinReward: challengeData.coinReward,
      specialRule: null,
      canSkip: true
    };
    
    selectChallenge(challenge);
  };
  
  return (
    <div style={{ 
      padding: '20px', 
      textAlign: 'center',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      background: 'var(--gradient-primary)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Animated background elements */}
      <div style={{
        position: 'absolute',
        top: '10%',
        left: '10%',
        width: '20px',
        height: '20px',
        background: 'var(--pyxel-yellow)',
        borderRadius: '50%',
        animation: 'pixelFloat 3s ease-in-out infinite',
        opacity: 0.6
      }} />
      <div style={{
        position: 'absolute',
        top: '20%',
        right: '15%',
        width: '15px',
        height: '15px',
        background: 'var(--pyxel-green)',
        borderRadius: '50%',
        animation: 'pixelFloat 4s ease-in-out infinite reverse',
        opacity: 0.6
      }} />
      <div style={{
        position: 'absolute',
        bottom: '15%',
        left: '20%',
        width: '18px',
        height: '18px',
        background: 'var(--pyxel-pink)',
        borderRadius: '50%',
        animation: 'pixelFloat 3.5s ease-in-out infinite',
        opacity: 0.6
      }} />
      
      <div className="modal-title" style={{ 
        marginBottom: '30px',
        fontSize: 'clamp(14px, 5vw, 20px)',
        animation: 'titlePulse 2s ease-in-out infinite'
      }}>
        [&gt;] CHOOSE YOUR CHALLENGE [&lt;]
      </div>
      
      <div className="difficulty-select" style={{ zIndex: 1, position: 'relative' }}>
        {challengeTypes.map((challenge, index) => (
          <div
            key={challenge.type}
            className={`difficulty-button ${selectedType === challenge.type ? 'selected' : ''}`}
            onClick={() => {
              setSelectedType(challenge.type);
              setTimeout(() => handleChallengeSelect(challenge), 200);
            }}
            style={{
              background: selectedType === challenge.type ? 'var(--glow-green)' : 'var(--gradient-secondary)',
              borderColor: challenge.color,
              position: 'relative',
              overflow: 'hidden',
              animationDelay: `${index * 0.1}s`
            }}
          >
            {/* Challenge icon */}
            <div style={{
              fontSize: '20px',
              marginBottom: '8px',
              filter: 'drop-shadow(2px 2px 0px rgba(0,0,0,0.5))'
            }}>
              {challenge.icon}
            </div>
            
            <div style={{ fontSize: 'clamp(10px, 3vw, 12px)', marginBottom: '4px' }}>
              {challenge.name}
            </div>
            
            <div style={{ 
              fontSize: 'clamp(6px, 2vw, 8px)', 
              opacity: 0.8,
              marginBottom: '8px'
            }}>
              {challenge.description}
            </div>
            
            <div style={{ 
              fontSize: 'clamp(6px, 2vw, 8px)',
              display: 'flex',
              justifyContent: 'space-between',
              width: '100%',
              opacity: 0.9
            }}>
              <span>[*] {challenge.targetScore}pts</span>
              <span>[T] {Math.floor(challenge.timeLimit / 60)}:{(challenge.timeLimit % 60).toString().padStart(2, '0')}</span>
              <span>[C] {challenge.coinReward}</span>
            </div>
            
            {/* Hover effect overlay */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: '-100%',
              width: '100%',
              height: '100%',
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
              transition: 'left 0.5s',
              pointerEvents: 'none'
            }} />
          </div>
        ))}
      </div>
    </div>
  );
}

function PlayingChallenge() {
  const { gameState, dispatch } = useGame();
  const [currentScore, setCurrentScore] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(gameState.currentChallenge?.timeLimit || 120);
  const [wordsFound, setWordsFound] = useState<string[]>([]);
  const [currentWord, setCurrentWord] = useState('');
  const [showScoreBonus, setShowScoreBonus] = useState<number | null>(null);
  
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
    setCurrentScore(prev => {
      const newScore = prev + score;
      // Check if we've reached the target score
      const targetScore = gameState.currentChallenge?.targetScore || 500;
      if (newScore >= targetScore) {
        // Delay completion slightly to show the final score
        setTimeout(() => {
          handleChallengeComplete(newScore);
        }, 1000);
      }
      return newScore;
    });
    
    // Enhanced score bonus animation based on word length and score
    setShowScoreBonus(score);
    
    // Different animation duration based on score magnitude
    const animationDuration = score >= 11 ? 1500 : score >= 5 ? 1200 : 1000;
    setTimeout(() => setShowScoreBonus(null), animationDuration);
  };
  
  const handleScoreUpdate = (score: number) => {
    // Score is already handled in handleWordFound
  };
  
  const handleCurrentWordChange = (word: string) => {
    setCurrentWord(word);
  };
  
  const handleChallengeComplete = (finalScore?: number) => {
    const scoreToUse = finalScore || currentScore;
    const targetScore = gameState.currentChallenge?.targetScore || 500;
    const coinReward = gameState.currentChallenge?.coinReward || 20;
    
    if (scoreToUse >= targetScore) {
      dispatch({ 
        type: 'COMPLETE_CHALLENGE', 
        payload: { 
          score: scoreToUse, 
          coins: coinReward + Math.floor(scoreToUse / 100)
        } 
      });
    } else {
      dispatch({ type: 'GAME_OVER' });
    }
  };
  
  const getTimeColor = () => {
    if (timeRemaining > 60) return 'var(--pyxel-green)';
    if (timeRemaining > 30) return 'var(--pyxel-yellow)';
    return 'var(--pyxel-red)';
  };
  
  const getProgressPercentage = () => {
    const targetScore = gameState.currentChallenge?.targetScore || 500;
    return Math.min((currentScore / targetScore) * 100, 100);
  };

  const getScoreBonusClass = (score: number) => {
    if (score >= 11) return 'score-bonus-large';
    if (score >= 5) return 'score-bonus-medium';
    return 'score-bonus-small';
  };

  const getWordLengthClass = (word: string) => {
    const length = word.length;
    if (length >= 8) return 'super-long-word';
    if (length === 7) return 'long-word';
    if (length === 6) return 'medium-word';
    if (length >= 3) return 'short-word';
    return '';
  };
  
      return (
    <div style={{ 
      width: '100vw',
      height: 'calc(var(--vh, 1vh) * 100)',
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--color-bg)',
      overflow: 'hidden',
      position: 'fixed',
      top: 0,
      left: 0
    }}>
      {/* Top Header - Flat design */}
      <div style={{
        background: 'var(--color-bg)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '3px solid var(--color-text)',
        zIndex: 2,
        flexShrink: 0,
        paddingTop: `calc(env(safe-area-inset-top, 0px) + 12px)`,
        paddingBottom: '12px',
        paddingLeft: '12px',
        paddingRight: '12px',
        minHeight: '60px'
      }}>
        <div style={{
          fontSize: '18px', /* Much larger */
          color: 'var(--color-text)',
          width: '70px',
          textAlign: 'left',
          lineHeight: 1.2,
          fontWeight: 'bold'
        }}>
          [C] {gameState.coins}
        </div>
        
        {/* MASSIVE Score Display - flat design */}
        <div style={{ 
          position: 'relative',
          fontSize: '32px', /* Much larger */
          color: 'var(--color-text)',
          fontWeight: 'bold',
          textAlign: 'center',
          minWidth: '90px',
          lineHeight: 1
        }}>
          {currentScore}
          {showScoreBonus && (
            <div style={{
              position: 'absolute',
              top: '-25px',
              right: '-10px',
              color: 'var(--color-accent)',
              fontSize: '20px', /* Much larger */
              pointerEvents: 'none',
              fontWeight: 'bold'
            }}>
              +{showScoreBonus}
            </div>
          )}
        </div>

        <div style={{
          fontSize: '18px', /* Much larger */
          color: 'var(--color-text)',
          width: '70px',
          textAlign: 'right',
          lineHeight: 1.2,
          fontWeight: 'bold'
        }}>
          [*] {gameState.currentChallenge?.targetScore}
        </div>
      </div>

      {/* Current Word Display - Flat design */}
      <div style={{
        height: '60px', /* Bigger */
        background: 'var(--color-accent)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderBottom: '3px solid var(--color-text)',
        zIndex: 2,
        overflow: 'hidden',
        flexShrink: 0
      }}>
        <div style={{
            fontSize: '28px', /* Much larger */
            fontWeight: 'bold',
            height: '28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            maxWidth: '90%',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            color: 'var(--color-bg)',
            textTransform: 'uppercase'
          }}>
          {currentWord || 'SELECT LETTERS'}
          {/* Word length indicator - flat design */}
          {currentWord.length >= 3 && (
            <span style={{
              marginLeft: '8px',
              fontSize: '16px', /* Much larger */
              color: 'var(--color-accent)',
              flexShrink: 0,
              fontWeight: 'bold'
            }}>
              ({currentWord.length})
            </span>
          )}
        </div>
      </div>

      {/* Letter Grid - MUCH BIGGER NOW - Takes most of the screen */}
      <div style={{ 
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        zIndex: 1,
        minHeight: 0,
        /* Ensure perfect centering */
        flexDirection: 'column'
      }}>
        <LetterGrid 
          onWordFound={handleWordFound}
          onScoreUpdate={handleScoreUpdate}
          onCurrentWordChange={handleCurrentWordChange}
          timeRemaining={timeRemaining}
          hideWordDisplay={true}
          foundWords={wordsFound}
        />
      </div>

      {/* Bottom Status Panel - Flat design */}
      <div style={{
        background: 'var(--color-bg)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        borderTop: '3px solid var(--color-text)',
        zIndex: 2,
        flexShrink: 0,
        paddingTop: '16px',
        paddingBottom: `calc(env(safe-area-inset-bottom, 0px) + 16px)`,
        paddingLeft: '16px',
        paddingRight: '16px',
        minHeight: `calc(100px + env(safe-area-inset-bottom, 0px))` /* Bigger */
      }}>
        {/* Challenge Info */}
        <div style={{
          textAlign: 'center',
          flex: 1
        }}>
          <div style={{
            fontSize: '16px', /* Much larger */
            color: 'var(--color-text)',
            marginBottom: '4px',
            fontWeight: 'bold'
          }}>
            CHALLENGE
          </div>
          <div style={{
            fontSize: '20px', /* Much larger */
            color: 'var(--color-accent)',
            fontWeight: 'bold'
          }}>
            {gameState.currentChallenge?.name || 'CHALLENGE'}
          </div>
        </div>

        {/* Progress - Horizontal Bar */}
        <div style={{
          textAlign: 'center',
          flex: 2
        }}>
          <div style={{
            fontSize: '16px', /* Much larger */
            color: 'var(--color-text)',
            marginBottom: '4px',
            fontWeight: 'bold'
          }}>
            PROGRESS {Math.round(getProgressPercentage())}%
          </div>
          <div style={{
            width: '100%',
            height: '12px',
            background: 'var(--pyxel-dark-grey)',
            border: '2px solid var(--pyxel-light-grey)',
            borderRadius: '6px',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              position: 'absolute',
              left: 0,
              top: 0,
              bottom: 0,
              width: `${getProgressPercentage()}%`,
              background: getProgressPercentage() >= 100 
                ? 'var(--glow-green)' 
                : 'linear-gradient(to right, var(--pyxel-red), var(--pyxel-orange), var(--pyxel-yellow), var(--pyxel-green))',
              transition: 'width 0.5s ease',
              borderRadius: '4px',
              boxShadow: getProgressPercentage() >= 100 
                ? '0 0 10px var(--glow-green)' 
                : '0 0 5px rgba(255,236,39,0.5)'
            }} />
          </div>
        </div>

        {/* Words Found Count */}
        <div style={{
          textAlign: 'center',
          flex: 1
        }}>
          <div style={{
            fontSize: '16px', /* Much larger */
            color: 'var(--color-text)',
            marginBottom: '4px',
            fontWeight: 'bold'
          }}>
            WORDS
          </div>
          <div style={{
            fontSize: '20px', /* Much larger */
            color: 'var(--color-accent)',
            fontWeight: 'bold'
          }}>
            {wordsFound.length}
          </div>
        </div>

        {/* Time Remaining */}
        <div style={{
          textAlign: 'center',
          flex: 1
        }}>
          <div style={{
            fontSize: '16px', /* Much larger */
            color: 'var(--color-text)',
            marginBottom: '4px',
            fontWeight: 'bold'
          }}>
            TIME
          </div>
          <div style={{
            fontSize: '20px', /* Much larger */
            color: 'var(--color-text)',
            fontWeight: 'bold'
          }}>
            {formatTime(timeRemaining)}
          </div>
        </div>
      </div>
      

    </div>
  );
}

function GameOver() {
  const { resetGame, gameState } = useGame();
  
  return (
    <div className="game-over" style={{
      background: 'var(--gradient-primary)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Sad face animation */}
      <div style={{
        fontSize: '48px',
        marginBottom: '20px',
        animation: 'sadFace 2s ease-in-out infinite'
      }}>
        😞
      </div>
      
      <div className="game-over-title" style={{
        color: 'var(--pyxel-red)',
        textShadow: '3px 3px 0px var(--pyxel-dark-purple), 6px 6px 0px rgba(0,0,0,0.8)'
      }}>
        GAME OVER
      </div>
      
      <div className="final-score" style={{
        marginBottom: '20px'
      }}>
        Better luck next time!
      </div>
      
      <div style={{
        fontSize: 'clamp(8px, 2.5vw, 10px)',
        color: 'var(--pyxel-light-grey)',
        marginBottom: '30px',
        opacity: 0.8
      }}>
        You needed {gameState.currentChallenge?.targetScore} points to win
      </div>
      
      <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
        <button 
          onClick={resetGame}
          className="menu-button"
          style={{
            background: 'var(--gradient-accent)',
            borderColor: 'var(--pyxel-red)'
          }}
        >
          🔄 TRY AGAIN
        </button>
        
        <button 
          onClick={() => window.location.reload()}
          className="menu-button"
          style={{
            background: 'var(--gradient-secondary)',
            borderColor: 'var(--pyxel-blue)'
          }}
        >
          🏠 MAIN MENU
        </button>
      </div>
    </div>
  );
}

function Victory() {
  const { gameState, resetGame } = useGame();
  const [showConfetti, setShowConfetti] = useState(true);
  
  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 3000);
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <div className="game-over" style={{
      background: 'var(--gradient-primary)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Confetti effect */}
      {showConfetti && (
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none' }}>
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                width: '8px',
                height: '8px',
                background: ['var(--pyxel-yellow)', 'var(--pyxel-green)', 'var(--pyxel-pink)', 'var(--pyxel-blue)'][i % 4],
                left: `${Math.random() * 100}%`,
                animation: `confetti 3s ease-out forwards`,
                animationDelay: `${Math.random() * 2}s`
              }}
            />
          ))}
        </div>
      )}
      
      {/* Trophy animation */}
      <div style={{
        fontSize: '64px',
        marginBottom: '20px',
        animation: 'trophy 2s ease-in-out infinite'
      }}>
        [!]
      </div>
      
      <div className="game-over-title" style={{
        color: 'var(--glow-green)',
        textShadow: '3px 3px 0px var(--pyxel-dark-green), 6px 6px 0px rgba(0,0,0,0.8)'
      }}>
        VICTORY!
      </div>
      
      <div className="final-score">
        [*] Challenge Complete! [*]
      </div>
      
      <div style={{ 
        fontSize: 'clamp(10px, 3vw, 12px)', 
        margin: '20px 0',
        color: 'var(--pyxel-yellow)',
        textShadow: '0 0 8px var(--pyxel-yellow)'
      }}>
        [C] COINS EARNED: {gameState.currentChallenge?.coinReward || 20}
      </div>
      
      <div style={{
        fontSize: 'clamp(8px, 2.5vw, 10px)',
        color: 'var(--pyxel-light-grey)',
        marginBottom: '30px',
        opacity: 0.8
      }}>
        Ready for the next challenge?
      </div>
      
      <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
        <button 
          onClick={resetGame}
          className="menu-button"
          style={{
            background: 'var(--glow-green)',
            color: 'var(--pyxel-black)',
            borderColor: 'var(--pyxel-yellow)'
          }}
        >
          [&gt;] CONTINUE
        </button>
        
        <button 
          onClick={() => window.location.reload()}
          className="menu-button"
          style={{
            background: 'var(--gradient-secondary)',
            borderColor: 'var(--pyxel-blue)'
          }}
        >
          [H] MAIN MENU
        </button>
      </div>
    </div>
  );
}

function ShopView() {
  const { gameState, dispatch } = useGame();
  const [rerollCost, setRerollCost] = useState(2);
  const [shopItems, setShopItems] = useState(() => generateShopItems());
  
  // Generate random shop items with proper rarity distribution
  function generateShopItems() {
    const items = [];
    const rarityWeights = { common: 70, uncommon: 25, rare: 4, legendary: 1 };
    
    // Generate 4-6 items based on current round
    const itemCount = Math.min(6, 4 + Math.floor(gameState.currentRound / 3));
    
    for (let i = 0; i < itemCount; i++) {
      const rarity = getRandomRarity(rarityWeights);
      items.push(generatePowerUpCard(rarity, i));
    }
    
    return items;
  }
  
  function getRandomRarity(weights) {
    const total = Object.values(weights).reduce((a, b) => a + b, 0);
    let random = Math.random() * total;
    
    for (const [rarity, weight] of Object.entries(weights)) {
      random -= weight;
      if (random <= 0) return rarity;
    }
    return 'common';
  }
  
  function generatePowerUpCard(rarity, index) {
    const powerUps = {
      common: [
        {
          id: `letter_boost_${index}`,
          name: 'Letter Boost',
          description: '+3 points per letter in words',
          effect: { type: 'letterMultiplier', value: 3 },
          cost: 8,
          rarity: 'common',
          emoji: 'AB',
          synergy: ['word_length']
        },
        {
          id: `quick_hands_${index}`,
          name: 'Quick Hands',
          description: '+1 Hand per round',
          effect: { type: 'extraHands', value: 1 },
          cost: 10,
          rarity: 'common',
          emoji: '>>',
          synergy: ['efficiency']
        },
        {
          id: `coin_magnet_${index}`,
          name: 'Coin Magnet',
          description: '+2 coins per word found',
          effect: { type: 'coinPerWord', value: 2 },
          cost: 6,
          rarity: 'common',
          emoji: '<>',
          synergy: ['economy']
        },
        {
          id: `vowel_power_${index}`,
          name: 'Vowel Power',
          description: 'Vowels glow and give +2 points',
          effect: { type: 'vowelBonus', value: 2 },
          cost: 12,
          rarity: 'common',
          emoji: 'AE',
          synergy: ['letter_type']
        }
      ],
      uncommon: [
        {
          id: `word_chain_${index}`,
          name: 'Word Chain',
          description: 'Each consecutive word: +5 points',
          effect: { type: 'chainMultiplier', value: 5 },
          cost: 18,
          rarity: 'uncommon',
          emoji: '++',
          synergy: ['combo']
        },
        {
          id: `double_score_${index}`,
          name: 'Double Score',
          description: '2x points for 6+ letter words',
          effect: { type: 'longWordMultiplier', minLength: 6, multiplier: 2 },
          cost: 25,
          rarity: 'uncommon',
          emoji: 'x2',
          synergy: ['word_length']
        },
        {
          id: `time_warp_${index}`,
          name: 'Time Warp',
          description: '+45 seconds, but -1 Hand',
          effect: { type: 'timeTradeoff', time: 45, hands: -1 },
          cost: 20,
          rarity: 'uncommon',
          emoji: '||',
          synergy: ['efficiency']
        },
        {
          id: `letter_thief_${index}`,
          name: 'Letter Thief',
          description: 'Steal random letters from unused words',
          effect: { type: 'letterTheft', chance: 0.3 },
          cost: 22,
          rarity: 'uncommon',
          emoji: '..',
          synergy: ['manipulation']
        }
      ],
      rare: [
        {
          id: `word_forge_${index}`,
          name: 'Word Forge',
          description: 'Combine 2 short words → 1 super word',
          effect: { type: 'wordForge', enabled: true },
          cost: 35,
          rarity: 'rare',
          emoji: '[]',
          synergy: ['combo', 'word_length']
        },
        {
          id: `golden_letters_${index}`,
          name: 'Golden Letters',
          description: 'Random letters become golden (3x points)',
          effect: { type: 'goldenLetters', count: 3 },
          cost: 40,
          rarity: 'rare',
          emoji: '**',
          synergy: ['letter_type', 'multiplier']
        },
        {
          id: `word_echo_${index}`,
          name: 'Word Echo',
          description: 'Finding a word grants a "ghost" copy',
          effect: { type: 'wordEcho', chance: 0.5 },
          cost: 45,
          rarity: 'rare',
          emoji: '~~',
          synergy: ['combo']
        },
        {
          id: `score_vampire_${index}`,
          name: 'Score Vampire',
          description: 'Gain health equal to 10% of score',
          effect: { type: 'scoreToHealth', ratio: 0.1 },
          cost: 38,
          rarity: 'rare',
          emoji: '@@',
          synergy: ['survival']
        }
      ],
      legendary: [
        {
          id: `letter_god_${index}`,
          name: 'Letter God',
          description: 'All letters become any letter you need',
          effect: { type: 'letterGod', enabled: true },
          cost: 80,
          rarity: 'legendary',
          emoji: '##',
          synergy: ['manipulation', 'godlike']
        },
        {
          id: `word_singularity_${index}`,
          name: 'Word Singularity',
          description: 'Each word multiplies ALL future words by 1.1x',
          effect: { type: 'exponentialGrowth', multiplier: 1.1 },
          cost: 100,
          rarity: 'legendary',
          emoji: '88',
          synergy: ['combo', 'multiplier']
        },
        {
          id: `reality_hack_${index}`,
          name: 'Reality Hack',
          description: 'Break one game rule permanently',
          effect: { type: 'ruleBreaker', enabled: true },
          cost: 120,
          rarity: 'legendary',
          emoji: '!!',
          synergy: ['godlike']
        }
      ]
    };
    
    const pool = powerUps[rarity];
    return pool[Math.floor(Math.random() * pool.length)];
  }
  
  const handlePurchase = (item) => {
    if (gameState.coins >= item.cost) {
      dispatch({
        type: 'PURCHASE_POWERUP',
        payload: item
      });
      
      // Remove purchased item from shop
      setShopItems(prev => prev.filter(shopItem => shopItem.id !== item.id));
    }
  };
  
  const handleReroll = () => {
    if (gameState.coins >= rerollCost) {
      dispatch({
        type: 'SPEND_COINS',
        payload: rerollCost
      });
      
      setShopItems(generateShopItems());
      setRerollCost(prev => Math.min(10, prev + 1)); // Rerolls get more expensive
    }
  };
  
  const handleContinue = () => {
    dispatch({ type: 'LEAVE_SHOP' });
  };
  
  const getRarityColor = (rarity) => {
    const colors = {
      common: '#6b7280',
      uncommon: '#10b981', 
      rare: '#3b82f6',
      legendary: '#8b5cf6'
    };
    return colors[rarity] || colors.common;
  };
  
  const getRarityGlow = (rarity) => {
    const glows = {
      common: '0 0 10px rgba(107, 114, 128, 0.5)',
      uncommon: '0 0 15px rgba(16, 185, 129, 0.6)',
      rare: '0 0 20px rgba(59, 130, 246, 0.7)',
      legendary: '0 0 25px rgba(139, 92, 246, 0.8)'
    };
    return glows[rarity] || glows.common;
  };
  
  // Calculate synergy bonuses
  const calculateSynergies = (item) => {
    const ownedSynergies = gameState.powerUps.flatMap(p => p.synergy || []);
    const itemSynergies = item.synergy || [];
    const matches = itemSynergies.filter(s => ownedSynergies.includes(s));
    return matches.length;
  };

  return (
    <div style={{ 
      width: '100vw',
      height: 'calc(var(--vh, 1vh) * 100)',
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--gb-darkest)',
      overflow: 'hidden',
      position: 'fixed',
      top: 0,
      left: 0
    }}>
      
      {/* Header Section */}
      <div style={{
        width: '100%',
        height: '80px',
        background: 'var(--gb-screen-bg)',
        border: '3px solid var(--gb-darkest)',
        borderRadius: '8px 8px 0 0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: `calc(env(safe-area-inset-top, 0px) + 12px)`,
        paddingLeft: '16px',
        paddingRight: '16px',
        position: 'relative',
        boxShadow: 'inset 2px 2px 0px var(--gb-lightest), inset -2px -2px 0px var(--gb-dark)'
      }}>
        <h1 className="gb-text" style={{
          fontSize: 'clamp(16px, 4vw, 24px)',
          fontWeight: 'bold',
          textAlign: 'center',
          margin: 0,
          animation: 'gb-title-pulse 2s ease-in-out infinite',
          textShadow: '2px 2px 0px var(--gb-darkest)'
        }}>
          🛍️ POWER-UP SHOP 🛍️
        </h1>
        
        {/* Power LED indicator */}
        <div className="power-led" style={{
          position: 'absolute',
          top: '16px',
          right: '16px'
        }} />
      </div>

      {/* Coins Display */}
      <div style={{
        width: '100%',
        height: '60px',
        background: 'var(--gb-dark)',
        border: '2px solid var(--gb-darkest)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 20px',
        boxShadow: 'inset 1px 1px 0px var(--gb-light)'
      }}>
        <div className="gb-text-light" style={{
          fontSize: 'clamp(18px, 5vw, 24px)',
          fontWeight: 'bold',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span style={{ fontSize: '20px' }}>[C]</span>
          <span>{gameState.coins}</span>
          <span style={{ fontSize: '14px', opacity: 0.8 }}>COINS</span>
        </div>
      </div>

      {/* Shop Items Grid */}
      <div style={{
        flex: 1,
        padding: '16px',
        overflowY: 'auto',
        background: 'var(--gb-screen-bg)',
        border: '2px solid var(--gb-darkest)',
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '16px',
          maxWidth: '800px',
          margin: '0 auto'
        }}>
          {shopItems.map((item, index) => (
            <div 
              key={index}
              className={`gb-card gb-card-${item.rarity}`}
              style={{
                cursor: gameState.coins >= item.cost ? 'pointer' : 'not-allowed',
                opacity: gameState.coins >= item.cost ? 1 : 0.6,
                animation: `cardFloat ${2 + index * 0.2}s ease-in-out infinite`,
                minHeight: '180px',
                display: 'flex',
                flexDirection: 'column'
              }}
              onClick={() => gameState.coins >= item.cost && handlePurchase(item)}
            >
              {/* Card Header */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '8px'
              }}>
                <div className="gb-text" style={{
                  fontSize: '14px',
                  fontWeight: 'bold',
                  textTransform: 'uppercase'
                }}>
                  {item.rarity}
                </div>
                <div className="gb-text" style={{
                  fontSize: '16px',
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <span>[C]</span>
                  <span>{item.cost}</span>
                </div>
              </div>

              {/* Card Icon */}
              <div style={{
                fontSize: '32px',
                textAlign: 'center',
                marginBottom: '8px',
                animation: 'gb-symbol-pulse 2s ease-in-out infinite'
              }}>
                {item.emoji}
              </div>

              {/* Card Title */}
              <div className="gb-text" style={{
                fontSize: '16px',
                fontWeight: 'bold',
                textAlign: 'center',
                marginBottom: '8px',
                textTransform: 'uppercase'
              }}>
                {item.name}
              </div>

              {/* Card Description */}
              <div className="gb-text" style={{
                fontSize: '12px',
                textAlign: 'center',
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0 8px',
                lineHeight: '1.3'
              }}>
                {item.description}
              </div>

              {/* Synergy Tags */}
              {item.synergies && item.synergies.length > 0 && (
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '4px',
                  marginTop: '8px',
                  justifyContent: 'center'
                }}>
                  {item.synergies.map((synergy, i) => (
                    <span 
                      key={i}
                      className="gb-text"
                      style={{
                        fontSize: '10px',
                        background: 'var(--gb-dark)',
                        color: 'var(--gb-lightest)',
                        padding: '2px 6px',
                        borderRadius: '2px',
                        border: '1px solid var(--gb-darkest)',
                        textTransform: 'uppercase'
                      }}
                    >
                      {synergy}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Controls */}
      <div style={{
        width: '100%',
        height: '80px',
        background: 'var(--gb-dark)',
        border: '3px solid var(--gb-darkest)',
        borderRadius: '0 0 8px 8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 20px',
        paddingBottom: `calc(env(safe-area-inset-bottom, 0px) + 12px)`,
        boxShadow: 'inset 2px 2px 0px var(--gb-light)'
      }}>
        <button 
          className="gb-button"
          onClick={handleReroll}
          disabled={gameState.coins < rerollCost}
          style={{
            fontSize: '14px',
            padding: '10px 16px'
          }}
        >
          [R] REROLL ({rerollCost}[C])
        </button>
        
        <button 
          className="gb-button"
          onClick={handleContinue}
          style={{
            fontSize: '14px',
            padding: '10px 20px',
            background: 'var(--gradient-accent)'
          }}
        >
          CONTINUE [&gt;]
        </button>
      </div>
    </div>
  );
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
} 