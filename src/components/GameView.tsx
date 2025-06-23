import React, { useState, useEffect } from 'react';
import { useGame } from '../hooks/useGame';
import { LetterGrid } from './LetterGrid';

export function GameView() {
  const { gameState, resetGame, selectChallenge, dispatch } = useGame();

  return (
    <div className="game-interface">
      {gameState.gamePhase === 'selectingChallenge' && <ChallengeSelection />}
      {gameState.gamePhase === 'playingChallenge' && <PlayingChallenge />}
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
      icon: '⚡',
      targetScore: 30,
      timeLimit: 90,
      coinReward: 15,
      color: 'var(--pyxel-yellow)'
    },
    {
      type: 'standard',
      name: 'WORD MASTER',
      description: 'Balanced challenge',
      icon: '🎯',
      targetScore: 50,
      timeLimit: 120,
      coinReward: 25,
      color: 'var(--pyxel-blue)'
    },
    {
      type: 'boss',
      name: 'ULTIMATE TEST',
      description: 'Maximum difficulty',
      icon: '👑',
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
        🎮 CHOOSE YOUR CHALLENGE 🎮
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
              <span>🎯 {challenge.targetScore}pts</span>
              <span>⏱️ {Math.floor(challenge.timeLimit / 60)}:{(challenge.timeLimit % 60).toString().padStart(2, '0')}</span>
              <span>💰 {challenge.coinReward}</span>
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
    setCurrentScore(prev => prev + score);
    
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
      background: '#000000',
      overflow: 'hidden',
      position: 'fixed',
      top: 0,
      left: 0
    }}>
      {/* Top Header - Extends behind Dynamic Island */}
      <div style={{
        background: '#000000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '3px solid var(--pyxel-dark-grey)',
        zIndex: 2,
        flexShrink: 0,
        /* Extend behind Dynamic Island but pad content */
        paddingTop: `calc(env(safe-area-inset-top, 0px) + 12px)`,
        paddingBottom: '12px',
        paddingLeft: '12px',
        paddingRight: '12px',
        minHeight: '60px'
      }}>
        <div style={{
          fontSize: 'clamp(7px, 1.8vw, 9px)',
          color: 'var(--pyxel-light-grey)',
          width: '70px',
          textAlign: 'left',
          lineHeight: 1.2
        }}>
          💰 {gameState.coins}
        </div>
        
        {/* MASSIVE Score Display */}
        <div style={{ 
          position: 'relative',
          fontSize: 'clamp(14px, 4.5vw, 22px)',
          color: 'var(--pyxel-yellow)',
          fontWeight: 'bold',
          textShadow: '2px 2px 4px var(--pyxel-black), 0 0 10px var(--pyxel-yellow)',
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
              color: 'var(--glow-green)',
              fontSize: 'clamp(10px, 2.5vw, 14px)',
              animation: 'scoreBonus 1s ease-out forwards',
              pointerEvents: 'none',
              textShadow: '0 0 10px var(--glow-green)'
            }}>
              +{showScoreBonus}
            </div>
          )}
        </div>

        <div style={{
          fontSize: 'clamp(7px, 1.8vw, 9px)',
          color: 'var(--pyxel-light-grey)',
          width: '70px',
          textAlign: 'right',
          lineHeight: 1.2
        }}>
          🎯 {gameState.currentChallenge?.targetScore}
        </div>
      </div>

      {/* Current Word Display - FIXED HEIGHT */}
      <div style={{
        height: '50px',
        background: '#000000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderBottom: '2px solid var(--pyxel-dark-grey)',
        zIndex: 2,
        overflow: 'hidden',
        flexShrink: 0
      }}>
        <div className={`current-word ${currentWord.length >= 2 ? 
          (wordsFound.includes(currentWord) ? 'already-found' : 
           currentWord.length >= 2 ? 'valid' : '') : ''} ${getWordLengthClass(currentWord)}`} 
          style={{
            fontSize: 'clamp(12px, 4vw, 18px)',
            fontWeight: 'bold',
            height: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            maxWidth: '90%',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}>
          {currentWord || 'Swipe to form words...'}
          {/* Word length indicator */}
          {currentWord.length >= 3 && (
            <span style={{
              marginLeft: '8px',
              fontSize: 'clamp(8px, 2vw, 10px)',
              opacity: 0.8,
              color: currentWord.length >= 8 ? 'var(--glow-pink)' : 
                     currentWord.length === 7 ? 'var(--glow-green)' :
                     currentWord.length === 6 ? 'var(--pyxel-yellow)' : 'var(--pyxel-orange)',
              flexShrink: 0
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

      {/* Bottom Status Panel - Extends behind home indicator using full space */}
      <div style={{
        background: '#000000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        borderTop: '3px solid var(--pyxel-dark-grey)',
        zIndex: 2,
        flexShrink: 0,
        /* Use the full bottom space including safe area */
        paddingTop: '16px',
        paddingBottom: `calc(env(safe-area-inset-bottom, 0px) + 16px)`,
        paddingLeft: '16px',
        paddingRight: '16px',
        minHeight: `calc(80px + env(safe-area-inset-bottom, 0px))`
      }}>
        {/* Challenge Info */}
        <div style={{
          textAlign: 'center',
          flex: 1
        }}>
          <div style={{
            fontSize: 'clamp(8px, 2vw, 10px)',
            color: 'var(--pyxel-light-grey)',
            marginBottom: '4px'
          }}>
            CHALLENGE
          </div>
          <div style={{
            fontSize: 'clamp(10px, 2.5vw, 12px)',
            color: 'var(--pyxel-yellow)',
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
            fontSize: 'clamp(8px, 2vw, 10px)',
            color: 'var(--pyxel-light-grey)',
            marginBottom: '4px'
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
            fontSize: 'clamp(8px, 2vw, 10px)',
            color: 'var(--pyxel-light-grey)',
            marginBottom: '4px'
          }}>
            WORDS
          </div>
          <div style={{
            fontSize: 'clamp(12px, 3vw, 14px)',
            color: 'var(--pyxel-green)',
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
            fontSize: 'clamp(8px, 2vw, 10px)',
            color: 'var(--pyxel-light-grey)',
            marginBottom: '4px'
          }}>
            TIME
          </div>
          <div style={{
            fontSize: 'clamp(14px, 3.5vw, 16px)',
            color: getTimeColor(),
            fontWeight: 'bold',
            textShadow: `0 0 8px ${getTimeColor()}`
          }}>
            {formatTime(timeRemaining)}
          </div>
        </div>
      </div>
      
      {/* Enhanced floating particles effect with score-based animation */}
      {showScoreBonus && (
        <div style={{
          position: 'fixed',
          top: '30px',
          right: 'calc(50% - 40px)',
          transform: 'translate(-50%, -50%)',
          pointerEvents: 'none',
          zIndex: 100
        }}>
          <div className={getScoreBonusClass(showScoreBonus)} style={{
            fontSize: showScoreBonus >= 11 ? 'clamp(16px, 4vw, 20px)' : 
                     showScoreBonus >= 5 ? 'clamp(14px, 3.5vw, 18px)' : 'clamp(12px, 3vw, 16px)',
            fontWeight: 'bold',
            textShadow: '2px 2px 4px var(--pyxel-black)'
          }}>
            +{showScoreBonus}
            {showScoreBonus >= 11 && '🎉'}
            {showScoreBonus >= 5 && showScoreBonus < 11 && '⭐'}
          </div>
          
          {/* Enhanced particle system based on score */}
          {[...Array(showScoreBonus >= 11 ? 8 : showScoreBonus >= 5 ? 6 : 4)].map((_, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                width: showScoreBonus >= 11 ? '8px' : '6px',
                height: showScoreBonus >= 11 ? '8px' : '6px',
                background: showScoreBonus >= 11 ? 'var(--glow-pink)' : 
                           showScoreBonus >= 5 ? 'var(--pyxel-yellow)' : 'var(--glow-green)',
                borderRadius: '50%',
                animation: `particle${i} ${showScoreBonus >= 11 ? 1.5 : showScoreBonus >= 5 ? 1.2 : 1}s ease-out forwards`,
                animationDelay: `${i * 0.1}s`,
                boxShadow: `0 0 4px ${showScoreBonus >= 11 ? 'var(--glow-pink)' : 
                                     showScoreBonus >= 5 ? 'var(--pyxel-yellow)' : 'var(--glow-green)'}`
              }}
            />
          ))}
        </div>
      )}
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
        🏆
      </div>
      
      <div className="game-over-title" style={{
        color: 'var(--glow-green)',
        textShadow: '3px 3px 0px var(--pyxel-dark-green), 6px 6px 0px rgba(0,0,0,0.8)'
      }}>
        VICTORY!
      </div>
      
      <div className="final-score">
        🎉 Challenge Complete! 🎉
      </div>
      
      <div style={{ 
        fontSize: 'clamp(10px, 3vw, 12px)', 
        margin: '20px 0',
        color: 'var(--pyxel-yellow)',
        textShadow: '0 0 8px var(--pyxel-yellow)'
      }}>
        💰 COINS EARNED: {gameState.currentChallenge?.coinReward || 20}
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
          🚀 CONTINUE
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

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
} 