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
      {gameState.gamePhase === 'runComplete' && <RunCompleteView />}
      {gameState.gamePhase === 'gameOver' && <GameOver />}
      {gameState.gamePhase === 'victory' && <Victory />}
    </div>
  );
}

function ChallengeSelection() {
  const { selectChallenge, gameState } = useGame();
  const [selectedType, setSelectedType] = useState<string>('');
  
      // Calculate target scores based on current level progression
    const calculateTargetScore = (baseScore: number) => {
      const level = gameState.currentLevel;
      const difficultyMultiplier = {
        'apprentice': 1,
        'scholar': 1.3,
        'expert': 1.6,
        'master': 2.0,
        'grandmaster': 2.5
      }[gameState.difficulty] || 1;
      
      return Math.floor(baseScore * Math.pow(1.15, level - 1) * difficultyMultiplier);
    };

    const challengeTypes = [
    {
      type: 'quick',
      name: 'QUICK BLITZ',
      description: 'Fast-paced word hunting',
      icon: '>>',
      targetScore: calculateTargetScore(30),
      timeLimit: 90,
      coinReward: Math.floor(15 + (gameState.currentLevel * 2)),
      color: 'var(--color-text)'
    },
    {
      type: 'standard',
      name: 'WORD MASTER',
      description: 'Balanced challenge',
      icon: '**',
      targetScore: calculateTargetScore(40),
      timeLimit: 120,
      coinReward: Math.floor(20 + (gameState.currentLevel * 3)),
      color: 'var(--color-text)'
    },
    {
      type: 'boss',
      name: 'ULTIMATE TEST',
      description: 'Maximum difficulty',
      icon: '##',
      targetScore: calculateTargetScore(50),
      timeLimit: 180,
      coinReward: Math.floor(30 + (gameState.currentLevel * 5)),
      color: 'var(--color-text)'
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
      width: '100vw',
      height: 'calc(var(--vh, 1vh) * 100)',
      background: 'var(--color-bg)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      position: 'fixed',
      top: 0,
      left: 0
    }}>
      
      <div style={{ 
        marginBottom: '20px',
        fontSize: '24px',
        fontWeight: 'bold',
        color: 'var(--color-text)',
        fontFamily: "'Courier New', 'Monaco', 'Menlo', monospace",
        textTransform: 'uppercase',
        textAlign: 'center'
      }}>
        [&gt;] CHOOSE YOUR CHALLENGE [&lt;]
      </div>

      {/* Run & Level Info */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        width: '100%',
        maxWidth: '400px',
        marginBottom: '20px',
        fontSize: '16px',
        fontWeight: 'bold',
        color: 'var(--color-text)',
        fontFamily: "'Courier New', 'Monaco', 'Menlo', monospace"
      }}>
        <div>RUN: {gameState.currentRun}</div>
        <div>LEVEL: {gameState.currentLevel}/{gameState.maxLevel}</div>
        <div>[C] {gameState.coins}</div>
      </div>

      {/* Inventory Count */}
      <div style={{
        marginBottom: '30px',
        fontSize: '14px',
        color: 'var(--color-text)',
        fontFamily: "'Courier New', 'Monaco', 'Menlo', monospace",
        textAlign: 'center'
      }}>
        INVENTORY: {gameState.inventory.length} ITEMS
      </div>
      
      <div style={{ 
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        width: '100%',
        maxWidth: '400px'
      }}>
        {challengeTypes.map((challenge, index) => (
          <button
            key={challenge.type}
            className="gb-button"
            onClick={() => {
              setSelectedType(challenge.type);
              setTimeout(() => handleChallengeSelect(challenge), 100);
            }}
            style={{
              background: selectedType === challenge.type ? 'var(--color-text)' : 'var(--color-bg)',
              color: selectedType === challenge.type ? 'var(--color-bg)' : 'var(--color-text)',
              border: '4px solid var(--color-text)',
              padding: '20px',
              fontSize: '18px',
              fontFamily: "'Courier New', 'Monaco', 'Menlo', monospace",
              fontWeight: 'bold',
              textTransform: 'uppercase',
              cursor: 'pointer',
              textAlign: 'center',
              width: '100%'
            }}
          >
            {/* Challenge icon */}
            <div style={{
              fontSize: '24px',
              marginBottom: '12px',
              fontWeight: 'bold'
            }}>
              {challenge.icon}
            </div>
            
            <div style={{ 
              fontSize: '20px', 
              marginBottom: '8px',
              fontWeight: 'bold'
            }}>
              {challenge.name}
            </div>
            
            <div style={{ 
              fontSize: '14px', 
              marginBottom: '12px',
              fontWeight: 'normal'
            }}>
              {challenge.description}
            </div>
            
            <div style={{ 
              fontSize: '14px',
              display: 'flex',
              justifyContent: 'space-between',
              width: '100%',
              fontWeight: 'bold'
            }}>
              <span>[*] {challenge.targetScore}PTS</span>
              <span>[T] {Math.floor(challenge.timeLimit / 60)}:{(challenge.timeLimit % 60).toString().padStart(2, '0')}</span>
              <span>[C] {challenge.coinReward}</span>
            </div>
          </button>
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
    const baseCoinReward = gameState.currentChallenge?.coinReward || 20;
    
    if (scoreToUse >= targetScore) {
      // Level completed! Award coins and advance progression
      const coinReward = baseCoinReward + Math.floor(scoreToUse / 100);
      dispatch({ 
        type: 'COMPLETE_LEVEL', 
        payload: { 
          score: scoreToUse, 
          coins: coinReward
        } 
      });
    } else {
      dispatch({ type: 'GAME_OVER' });
    }
  };
  
  const getTimeColor = () => {
    if (timeRemaining > 60) return 'var(--color-text)';
    if (timeRemaining > 30) return 'var(--color-accent)';
    return 'var(--color-text)';
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
            background: 'var(--color-bg)',
            border: '2px solid var(--color-text)',
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
                ? 'var(--color-text)' 
                : 'var(--color-accent)',
              transition: 'width 0.5s ease'
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
    <div style={{
      width: '100vw',
      height: 'calc(var(--vh, 1vh) * 100)',
      background: 'var(--color-bg)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'fixed',
      top: 0,
      left: 0,
      padding: '20px',
      fontFamily: "'Courier New', 'Monaco', 'Menlo', monospace"
    }}>
      {/* Game Boy style game over */}
      <div style={{
        fontSize: '48px',
        marginBottom: '20px',
        color: 'var(--color-text)',
        fontWeight: 'bold'
      }}>
        [X]
      </div>
      
      <div style={{
        fontSize: '32px',
        color: 'var(--color-text)',
        marginBottom: '20px',
        fontWeight: 'bold',
        textTransform: 'uppercase'
      }}>
        GAME OVER
      </div>
      
      <div style={{
        fontSize: '18px',
        color: 'var(--color-text)',
        marginBottom: '20px',
        fontWeight: 'bold',
        textAlign: 'center'
      }}>
        BETTER LUCK NEXT TIME!
      </div>
      
      <div style={{
        fontSize: '14px',
        color: 'var(--color-text)',
        marginBottom: '30px',
        textAlign: 'center'
      }}>
        YOU NEEDED {gameState.currentChallenge?.targetScore} POINTS TO WIN
      </div>
      
      <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
        <button 
          onClick={resetGame}
          className="gb-button"
          style={{
            fontSize: '16px',
            padding: '12px 20px'
          }}
        >
          [R] TRY AGAIN
        </button>
        
        <button 
          onClick={() => window.location.reload()}
          className="gb-button"
          style={{
            fontSize: '16px',
            padding: '12px 20px'
          }}
        >
          [H] MAIN MENU
        </button>
      </div>
    </div>
  );
}

function Victory() {
  const { gameState, resetGame } = useGame();
  
  return (
    <div style={{
      width: '100vw',
      height: 'calc(var(--vh, 1vh) * 100)',
      background: 'var(--color-bg)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'fixed',
      top: 0,
      left: 0,
      padding: '20px',
      fontFamily: "'Courier New', 'Monaco', 'Menlo', monospace"
    }}>
      
      {/* Game Boy style victory */}
      <div style={{
        fontSize: '64px',
        marginBottom: '20px',
        color: 'var(--color-text)',
        fontWeight: 'bold'
      }}>
        [!]
      </div>
      
      <div style={{
        fontSize: '32px',
        color: 'var(--color-text)',
        marginBottom: '20px',
        fontWeight: 'bold',
        textTransform: 'uppercase'
      }}>
        VICTORY!
      </div>
      
      <div style={{
        fontSize: '18px',
        color: 'var(--color-text)',
        marginBottom: '20px',
        fontWeight: 'bold',
        textAlign: 'center'
      }}>
        [*] CHALLENGE COMPLETE! [*]
      </div>
      
      <div style={{ 
        fontSize: '16px', 
        margin: '20px 0',
        color: 'var(--color-text)',
        fontWeight: 'bold'
      }}>
        [C] COINS EARNED: {gameState.currentChallenge?.coinReward || 20}
      </div>
      
      <div style={{
        fontSize: '14px',
        color: 'var(--color-text)',
        marginBottom: '30px',
        textAlign: 'center'
      }}>
        READY FOR THE NEXT CHALLENGE?
      </div>
      
      <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
        <button 
          onClick={resetGame}
          className="gb-button"
          style={{
            fontSize: '16px',
            padding: '12px 20px',
            background: 'var(--color-text)',
            color: 'var(--color-bg)'
          }}
        >
          [&gt;] CONTINUE
        </button>
        
        <button 
          onClick={() => window.location.reload()}
          className="gb-button"
          style={{
            fontSize: '16px',
            padding: '12px 20px'
          }}
        >
          [H] MAIN MENU
        </button>
      </div>
    </div>
  );
}

function RunCompleteView() {
  const { gameState, dispatch } = useGame();
  
  const startNewRun = () => {
    dispatch({ 
      type: 'START_NEW_RUN', 
      payload: { stake: gameState.difficultyStake } 
    });
  };

  const backToMenu = () => {
    dispatch({ type: 'RESET_GAME' });
  };

  return (
    <div style={{ 
      width: '100vw',
      height: 'calc(var(--vh, 1vh) * 100)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--color-bg)',
      padding: '20px',
      position: 'fixed',
      top: 0,
      left: 0
    }}>
      {/* Run Complete Header */}
      <div style={{ 
        marginBottom: '40px',
        fontSize: '32px',
        fontWeight: 'bold',
        color: 'var(--color-text)',
        fontFamily: "'Courier New', 'Monaco', 'Menlo', monospace",
        textTransform: 'uppercase',
        textAlign: 'center'
      }}>
        [!] RUN COMPLETE [!]
      </div>

      {/* Run Stats */}
      <div style={{
        background: 'var(--color-accent)',
        border: '3px solid var(--color-text)',
        padding: '30px',
        marginBottom: '40px',
        textAlign: 'center',
        fontFamily: "'Courier New', 'Monaco', 'Menlo', monospace",
        color: 'var(--color-bg)',
        minWidth: '300px'
      }}>
        <div style={{ fontSize: '18px', marginBottom: '20px', fontWeight: 'bold' }}>
          RUN #{gameState.currentRun} COMPLETED
        </div>
        <div style={{ fontSize: '16px', marginBottom: '10px' }}>
          LEVELS COMPLETED: {gameState.maxLevel}
        </div>
        <div style={{ fontSize: '16px', marginBottom: '10px' }}>
          FINAL SCORE: {gameState.totalScore}
        </div>
        <div style={{ fontSize: '16px', marginBottom: '10px' }}>
          COINS EARNED: {gameState.coins}
        </div>
        <div style={{ fontSize: '16px', marginBottom: '10px' }}>
          INVENTORY: {gameState.inventory.length} ITEMS
        </div>
        <div style={{ fontSize: '16px' }}>
          DIFFICULTY: {gameState.difficultyStake.toUpperCase()}
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{
        display: 'flex',
        gap: '20px',
        flexDirection: 'column',
        alignItems: 'center'
      }}>
        <button
          className="gb-button"
          onClick={startNewRun}
          style={{
            fontSize: '18px',
            padding: '16px 32px',
            background: 'var(--color-text)',
            color: 'var(--color-bg)',
            border: '3px solid var(--color-text)',
            fontFamily: "'Courier New', 'Monaco', 'Menlo', monospace",
            fontWeight: 'bold',
            textTransform: 'uppercase',
            cursor: 'pointer',
            minWidth: '200px'
          }}
        >
          NEW RUN [&gt;]
        </button>

        <button
          className="gb-button"
          onClick={backToMenu}
          style={{
            fontSize: '16px',
            padding: '12px 24px',
            background: 'var(--color-bg)',
            color: 'var(--color-text)',
            border: '3px solid var(--color-text)',
            fontFamily: "'Courier New', 'Monaco', 'Menlo', monospace",
            fontWeight: 'bold',
            textTransform: 'uppercase',
            cursor: 'pointer',
            minWidth: '200px'
          }}
        >
          MAIN MENU
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
      items.push(generateInventoryItem(rarity, i));
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
  
  function generateInventoryItem(rarity, index) {
    const itemTemplates = {
      common: [
        {
          name: 'Letter Boost',
          description: '+3 points per letter in words',
          effect: { type: 'letterMultiplier', value: 3 },
          cost: 8,
          emoji: 'AB'
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
      // Convert shop item to inventory item format
      const inventoryItem = {
        ...item,
        sellValue: Math.floor(item.cost * 0.5), // Sell for half the purchase price
        purchaseLevel: gameState.currentLevel,
        timesUsed: 0,
        stackCount: 1
      };

      dispatch({
        type: 'PURCHASE_INVENTORY_ITEM',
        payload: { item: inventoryItem }
      });
      
      // Remove purchased item from shop
      setShopItems(prev => prev.filter(shopItem => shopItem.id !== item.id));
    }
  };

  const handleSell = (itemId) => {
    dispatch({
      type: 'SELL_INVENTORY_ITEM',
      payload: { itemId }
    });
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
    dispatch({ type: 'NEXT_LEVEL' });
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
      background: 'var(--color-bg)',
      overflow: 'hidden',
      position: 'fixed',
      top: 0,
      left: 0
    }}>
      
      {/* Header Section - Flat Game Boy */}
      <div style={{
        width: '100%',
        height: '80px',
        background: 'var(--color-bg)',
        border: '3px solid var(--color-text)',
        borderBottom: '3px solid var(--color-text)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: `calc(env(safe-area-inset-top, 0px) + 12px)`,
        paddingLeft: '16px',
        paddingRight: '16px',
        position: 'relative'
      }}>
        <h1 style={{
          fontSize: '24px',
          fontWeight: 'bold',
          textAlign: 'center',
          margin: 0,
          color: 'var(--color-text)',
          fontFamily: "'Courier New', 'Monaco', 'Menlo', monospace",
          textTransform: 'uppercase'
        }}>
          [S] POWER-UP SHOP [S]
        </h1>
        
        {/* Power LED indicator - flat */}
        <div style={{
          position: 'absolute',
          top: '16px',
          right: '16px',
          width: '8px',
          height: '8px',
          background: 'var(--color-text)'
        }} />
      </div>

      {/* Coins Display - Flat Game Boy */}
      <div style={{
        width: '100%',
        height: '60px',
        background: 'var(--color-accent)',
        border: '3px solid var(--color-text)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 20px'
      }}>
        <div style={{
          fontSize: '22px',
          fontWeight: 'bold',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          color: 'var(--color-bg)',
          fontFamily: "'Courier New', 'Monaco', 'Menlo', monospace",
          textTransform: 'uppercase'
        }}>
          <span style={{ fontSize: '24px' }}>[C]</span>
          <span>{gameState.coins}</span>
          <span style={{ fontSize: '18px' }}>COINS</span>
        </div>
      </div>

      {/* Shop & Inventory Container - Flat Game Boy */}
      <div style={{
        flex: 1,
        padding: '16px',
        overflowY: 'auto',
        background: 'var(--color-bg)',
        border: '3px solid var(--color-text)'
      }}>
        {/* Shop Items */}
        <div style={{
          marginBottom: '30px'
        }}>
          <h2 style={{
            fontSize: '20px',
            fontWeight: 'bold',
            color: 'var(--color-text)',
            fontFamily: "'Courier New', 'Monaco', 'Menlo', monospace",
            textAlign: 'center',
            marginBottom: '20px',
            textTransform: 'uppercase'
          }}>
            [S] SHOP ITEMS [S]
          </h2>
          
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
              className="gb-button"
              style={{
                cursor: gameState.coins >= item.cost ? 'pointer' : 'not-allowed',
                opacity: gameState.coins >= item.cost ? 1 : 0.5,
                minHeight: '200px',
                display: 'flex',
                flexDirection: 'column',
                background: gameState.coins >= item.cost ? 'var(--color-bg)' : 'var(--color-accent)',
                color: 'var(--color-text)',
                border: item.rarity === 'legendary' ? '4px solid var(--color-text)' : 
                       item.rarity === 'rare' ? '3px solid var(--color-text)' : '2px solid var(--color-text)',
                padding: '16px',
                fontFamily: "'Courier New', 'Monaco', 'Menlo', monospace",
                textAlign: 'center'
              }}
              onClick={() => gameState.coins >= item.cost && handlePurchase(item)}
            >
              {/* Card Header - Flat */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '12px'
              }}>
                <div style={{
                  fontSize: '14px',
                  fontWeight: 'bold',
                  textTransform: 'uppercase',
                  color: 'var(--color-text)'
                }}>
                  {item.rarity}
                </div>
                <div style={{
                  fontSize: '16px',
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  color: 'var(--color-text)'
                }}>
                  <span>[C]</span>
                  <span>{item.cost}</span>
                </div>
              </div>

              {/* Card Icon - Flat */}
              <div style={{
                fontSize: '36px',
                textAlign: 'center',
                marginBottom: '12px',
                fontWeight: 'bold',
                color: 'var(--color-text)'
              }}>
                {item.emoji}
              </div>

              {/* Card Title - Flat */}
              <div style={{
                fontSize: '18px',
                fontWeight: 'bold',
                textAlign: 'center',
                marginBottom: '12px',
                textTransform: 'uppercase',
                color: 'var(--color-text)'
              }}>
                {item.name}
              </div>

              {/* Card Description - Flat */}
              <div style={{
                fontSize: '14px',
                textAlign: 'center',
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0 8px',
                lineHeight: '1.4',
                color: 'var(--color-text)'
              }}>
                {item.description}
              </div>

              {/* Synergy Tags - Flat */}
              {item.synergies && item.synergies.length > 0 && (
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '4px',
                  marginTop: '12px',
                  justifyContent: 'center'
                }}>
                  {item.synergies.map((synergy, i) => (
                    <span 
                      key={i}
                      style={{
                        fontSize: '12px',
                        background: 'var(--color-accent)',
                        color: 'var(--color-bg)',
                        padding: '4px 8px',
                        border: '1px solid var(--color-text)',
                        textTransform: 'uppercase',
                        fontWeight: 'bold',
                        fontFamily: "'Courier New', 'Monaco', 'Menlo', monospace"
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

        {/* Inventory Section */}
        {gameState.inventory.length > 0 && (
          <div style={{
            marginBottom: '20px'
          }}>
            <h2 style={{
              fontSize: '20px',
              fontWeight: 'bold',
              color: 'var(--color-text)',
              fontFamily: "'Courier New', 'Monaco', 'Menlo', monospace",
              textAlign: 'center',
              marginBottom: '20px',
              textTransform: 'uppercase'
            }}>
              [I] YOUR INVENTORY [I]
            </h2>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '16px',
              maxWidth: '800px',
              margin: '0 auto'
            }}>
              {gameState.inventory.map((item, index) => (
                <div 
                  key={index}
                  className="gb-button"
                  style={{
                    minHeight: '200px',
                    display: 'flex',
                    flexDirection: 'column',
                    background: 'var(--color-accent)',
                    color: 'var(--color-text)',
                    border: '3px solid var(--color-text)',
                    padding: '16px',
                    fontFamily: "'Courier New', 'Monaco', 'Menlo', monospace",
                    textAlign: 'center',
                    cursor: 'pointer'
                  }}
                  onClick={() => handleSell(item.id)}
                >
                  {/* Owned Item Header */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '12px'
                  }}>
                    <div style={{
                      fontSize: '14px',
                      fontWeight: 'bold',
                      textTransform: 'uppercase'
                    }}>
                      OWNED x{item.stackCount}
                    </div>
                    <div style={{
                      fontSize: '16px',
                      fontWeight: 'bold',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      <span>SELL: [C]</span>
                      <span>{item.sellValue}</span>
                    </div>
                  </div>

                  {/* Item Details */}
                  <div style={{
                    fontSize: '24px',
                    textAlign: 'center',
                    marginBottom: '8px',
                    fontWeight: 'bold'
                  }}>
                    {item.emoji}
                  </div>

                  <div style={{
                    fontSize: '16px',
                    fontWeight: 'bold',
                    textAlign: 'center',
                    marginBottom: '8px',
                    textTransform: 'uppercase'
                  }}>
                    {item.name}
                  </div>

                  <div style={{
                    fontSize: '12px',
                    textAlign: 'center',
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '0 8px',
                    lineHeight: '1.4'
                  }}>
                    {item.description}
                  </div>

                  <div style={{
                    fontSize: '12px',
                    marginTop: '8px',
                    opacity: 0.8
                  }}>
                    BOUGHT: LVL {item.purchaseLevel}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Controls - Flat Game Boy */}
      <div style={{
        width: '100%',
        height: '80px',
        background: 'var(--color-bg)',
        border: '3px solid var(--color-text)',
        borderTop: '3px solid var(--color-text)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 20px',
        paddingBottom: `calc(env(safe-area-inset-bottom, 0px) + 12px)`
      }}>
        <button 
          className="gb-button"
          onClick={handleReroll}
          disabled={gameState.coins < rerollCost}
          style={{
            fontSize: '16px',
            padding: '12px 20px',
            background: gameState.coins >= rerollCost ? 'var(--color-bg)' : 'var(--color-accent)',
            color: 'var(--color-text)',
            border: '3px solid var(--color-text)',
            fontFamily: "'Courier New', 'Monaco', 'Menlo', monospace",
            fontWeight: 'bold',
            textTransform: 'uppercase',
            cursor: gameState.coins >= rerollCost ? 'pointer' : 'not-allowed',
            opacity: gameState.coins >= rerollCost ? 1 : 0.5
          }}
        >
          [R] REROLL ({rerollCost}[C])
        </button>
        
        <button 
          className="gb-button"
          onClick={handleContinue}
          style={{
            fontSize: '16px',
            padding: '12px 24px',
            background: 'var(--color-text)',
            color: 'var(--color-bg)',
            border: '3px solid var(--color-text)',
            fontFamily: "'Courier New', 'Monaco', 'Menlo', monospace",
            fontWeight: 'bold',
            textTransform: 'uppercase',
            cursor: 'pointer'
          }}
        >
          {gameState.currentLevel >= gameState.maxLevel ? 'COMPLETE RUN [!]' : `LEVEL ${gameState.currentLevel + 1} [>]`}
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