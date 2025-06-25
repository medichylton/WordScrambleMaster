import React, { useState, useEffect } from 'react';
import { useGame } from '../hooks/useGame';
import { GameState, Challenge, PerkEffect, PerkEffectType, InventoryItem, Rarity } from '../types/game';
import { LetterGrid } from './LetterGrid';
import MainMenu from './MainMenu';
import { generateRandomPowerCard, getPerkEmoji, convertPerkEffectToItemEffect, getLevelTimeLimit, getLevelEffects } from '../utils/gameUtils';
import { applyPowerCardEffects, PowerCardContext } from '../utils/powerCardEffects';

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
  const { selectChallenge, gameState, dispatch } = useGame();
  const [selectedType, setSelectedType] = useState<string>('');
  const [expandedLevel, setExpandedLevel] = useState<number | null>(null);
  
  // Calculate target scores based on current level progression
  const calculateTargetScore = (level: number) => {
    // Much more aggressive difficulty scaling - exponential growth
    const difficultyMultiplier = {
      'apprentice': 1.0,
      'scholar': 1.4,
      'expert': 1.8,
      'master': 2.3,
      'grandmaster': 3.0
    }[gameState.difficulty] || 1;
    
    // Exponential base score growth that requires power cards
    let baseScore;
    if (level === 1) baseScore = 75;         // Level 1: 75 points (doable without power cards)
    else if (level === 2) baseScore = 150;   // Level 2: 150 points (challenging)
    else if (level === 3) baseScore = 275;   // Level 3: 275 points (need 1-2 power cards)
    else if (level === 4) baseScore = 450;   // Level 4: 450 points (need power card synergy)
    else if (level === 5) baseScore = 700;   // Level 5: 700 points (seriously challenging)
    else {
      // Level 6+: Exponential scaling that REQUIRES good power card builds
      baseScore = 700 * Math.pow(1.6, level - 5); 
    }
    
    return Math.floor(baseScore * difficultyMultiplier);
  };

  // Generate current level challenge (only this one is playable)
  const generateCurrentLevelChallenge = () => {
    const level = gameState.currentLevel;
    const levelEffects = getLevelEffects(level);
    const baseTimeLimit = 120;
    const timeLimit = Math.max(60, baseTimeLimit - levelEffects.timeReduction);
    
    // Progressive time pressure
    const adjustedTimeLimit = Math.max(45, timeLimit - Math.floor(level / 3) * 15);
    
    return {
      type: 'standard',
      name: getLevelName(level),
      description: getLevelDescription(level),
      icon: getLevelIcon(level),
      targetScore: calculateTargetScore(level),
      timeLimit: adjustedTimeLimit,
      coinReward: Math.floor(25 + (level * 3)), // Better coin rewards for harder challenges
      disadvantages: [
        levelEffects.vowelReduction > 0 ? `${Math.round(levelEffects.vowelReduction * 100)}% fewer vowels` : '',
        levelEffects.diagonalBlocked ? 'No diagonal connections' : '',
        levelEffects.minWordLength > 3 ? `Minimum ${levelEffects.minWordLength}-letter words` : '',
        levelEffects.timeReduction > 0 ? `Time reduced by ${levelEffects.timeReduction}s` : '',
        levelEffects.consonantBonus > 0 ? `Consonants worth +${levelEffects.consonantBonus} points` : '',
        levelEffects.palindromeBonus > 1 ? `Palindromes worth ${levelEffects.palindromeBonus}x points` : '',
        `Target: ${calculateTargetScore(level)} points in ${adjustedTimeLimit}s`,
        level >= 3 ? 'Power cards recommended' : '',
        level >= 5 ? 'Power card synergy required' : '',
        level >= 8 ? 'Master-level challenge' : ''
      ].filter(Boolean),
      skipPerk: generateRandomPowerCard(gameState.currentLevel)
    };
  };

  // Generate preview of future levels (accordion style)
  const generateFutureLevels = () => {
    const futureLevels: Array<{
      level: number;
      name: string;
      description: string;
      icon: string;
      targetScore: number;
      timeLimit: number;
      coinReward: number;
      disadvantages: string[];
      skipPerk: PerkEffect;
    }> = [];
    const maxPreview = 3; // Show next 3 levels as preview
    
    for (let i = 1; i <= maxPreview; i++) {
      const level = gameState.currentLevel + i;
      if (level > gameState.maxLevel) break;
      
      const levelEffects = getLevelEffects(level);
      const baseTimeLimit = 120;
      const timeLimit = Math.max(60, baseTimeLimit - levelEffects.timeReduction);
      const adjustedTimeLimit = Math.max(45, timeLimit - Math.floor(level / 3) * 15);
      
      futureLevels.push({
        level,
        name: getLevelName(level),
        description: getLevelDescription(level),
        icon: getLevelIcon(level),
        targetScore: calculateTargetScore(level),
        timeLimit: adjustedTimeLimit,
        coinReward: Math.floor(25 + (level * 3)),
        disadvantages: [
          ...getLevelDisadvantages(level),
          `Target: ${calculateTargetScore(level)} points`,
          level >= 3 ? 'Power cards recommended' : '',
          level >= 5 ? 'Power card synergy required' : '',
          level >= 8 ? 'Master-level challenge' : ''
        ].filter(Boolean),
        skipPerk: generateRandomPowerCard(level)
      });
    }
    
    return futureLevels;
  };

  // Helper functions for level generation
  const getLevelName = (level: number): string => {
    const names = [
      'WORD HUNT', 'VOWEL VOID', 'LETTER LOCKDOWN', 'CONSONANT CHAOS',
      'TIME PRESSURE', 'LENGTH LIMIT', 'DIAGONAL DENIAL', 'SYMMETRY SEEKER',
      'PALINDROME PUSH', 'ANAGRAM ATTACK', 'RHYME TIME', 'ALLITERATION ALLEY',
      'SYLLABLE SURGE', 'PREFIX POWER', 'SUFFIX STORM', 'COMPOUND CRAZE'
    ];
    return names[(level - 1) % names.length];
  };

  const getLevelDescription = (level: number): string => {
    const descriptions = [
      'Find words in the grid',
      'Reduced vowel frequency',
      'Restricted letter movement',
      'Consonant-heavy grid',
      'Shorter time limits',
      'Minimum word length required',
      'No diagonal connections',
      'Symmetrical word patterns',
      'Palindromes score bonus',
      'Anagram challenges',
      'Rhyming word pairs',
      'Alliteration bonuses',
      'Syllable counting',
      'Prefix-focused words',
      'Suffix combinations',
      'Compound word building'
    ];
    return descriptions[(level - 1) % descriptions.length];
  };

  const getLevelIcon = (level: number): string => {
    const icons = ['>>', 'AE', '##', 'CC', '||', 'LL', 'DD', 'SS', 'PP', 'AA', 'RR', 'AL', 'SY', 'PF', 'SF', 'CP'];
    return icons[(level - 1) % icons.length];
  };

  const getLevelDisadvantages = (level: number): string[] => {
    const disadvantageSets = [
      ['No time extensions', 'Limited word length bonus'],
      ['30% fewer vowels', 'Vowels worth +1 point each'],
      ['Can only move horizontally/vertically', 'No diagonal connections'],
      ['80% consonants', 'Consonant chains required'],
      ['Time limit reduced by 30s', 'Speed bonus required'],
      ['Minimum 4-letter words only', 'Short words penalized'],
      ['Grid movement restricted', 'Linear paths only'],
      ['Words must be symmetrical', 'Pattern matching required'],
      ['Palindromes score 3x', 'Other words penalized'],
      ['Anagrams score bonus', 'Word scrambling required'],
      ['Rhyming pairs bonus', 'Sound matching needed'],
      ['Alliteration required', 'Same letter starts'],
      ['Syllable counting', 'Complex word structures'],
      ['Prefix-focused scoring', 'Word beginnings matter'],
      ['Suffix combinations', 'Word endings important'],
      ['Compound words only', 'Multi-word combinations']
    ];
    return disadvantageSets[(level - 1) % disadvantageSets.length];
  };

  const currentChallenge = generateCurrentLevelChallenge();
  const futureLevels = generateFutureLevels();
  
  const handleChallengeSelect = (challengeData: any) => {
    const challenge = {
      id: `${challengeData.type}-${Date.now()}`,
      type: challengeData.type as any,
      name: challengeData.name,
      description: challengeData.description,
      targetScore: challengeData.targetScore,
      maxWords: 20,
      timeLimit: challengeData.timeLimit,
      coinReward: challengeData.coinReward,
      disadvantages: challengeData.disadvantages,
      skipPerk: challengeData.skipPerk,
      specialRule: null,
      canSkip: true
    };
    
    selectChallenge(challenge);
  };

  const handleSkipLevel = () => {
    dispatch({ 
      type: 'SKIP_LEVEL', 
      payload: { 
        level: gameState.currentLevel,
        perk: currentChallenge.skipPerk
      } 
    });
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
        [&gt;] LEVEL {gameState.currentLevel} [&lt;]
      </div>

      {/* Run & Level Info */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        width: '100%',
        maxWidth: '500px',
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

      {/* Active Power Cards Display */}
      {gameState.activePerks && gameState.activePerks.length > 0 && (
        <div style={{
          background: 'var(--color-accent)',
          borderBottom: '3px solid var(--color-text)',
          padding: '8px 12px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          overflowX: 'auto',
          flexShrink: 0
        }}>
          <div style={{
            fontSize: '14px',
            color: 'var(--color-bg)',
            fontWeight: 'bold',
            textTransform: 'uppercase',
            flexShrink: 0
          }}>
            POWER CARDS:
          </div>
          {gameState.activePerks.map((perk, index) => (
            <div key={perk.id} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              background: 'var(--color-bg)',
              border: '2px solid var(--color-text)',
              padding: '4px 8px',
              borderRadius: '0',
              flexShrink: 0,
              fontSize: '12px',
              color: 'var(--color-text)',
              fontWeight: 'bold'
            }}>
              <span>{getPerkEmoji(perk.name)}</span>
              <span style={{ fontSize: '10px' }}>{perk.name}</span>
            </div>
          ))}
        </div>
      )}

      {/* Current Level - Playable */}
      <div style={{ 
        width: '100%',
        maxWidth: '500px',
        marginBottom: '20px'
      }}>
        <div
          className="gb-button"
          onClick={() => {
            setSelectedType(currentChallenge.type);
            setTimeout(() => handleChallengeSelect(currentChallenge), 100);
          }}
          style={{
            background: selectedType === currentChallenge.type ? 'var(--color-text)' : 'var(--color-bg)',
            color: selectedType === currentChallenge.type ? 'var(--color-bg)' : 'var(--color-text)',
            border: '4px solid var(--color-text)',
            padding: '20px',
            fontSize: '16px',
            fontFamily: "'Courier New', 'Monaco', 'Menlo', monospace",
            fontWeight: 'bold',
            textTransform: 'uppercase',
            cursor: 'pointer',
            textAlign: 'left',
            width: '100%'
          }}
        >
          {/* Challenge Header */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '12px'
          }}>
            <div style={{ fontSize: '20px', fontWeight: 'bold' }}>
              {currentChallenge.icon} {currentChallenge.name}
            </div>
            <div style={{ fontSize: '14px' }}>
              [C] {currentChallenge.coinReward}
            </div>
          </div>
          
          <div style={{ 
            fontSize: '14px', 
            marginBottom: '12px',
            fontWeight: 'normal'
          }}>
            {currentChallenge.description}
          </div>
          
          {/* Challenge Stats */}
          <div style={{ 
            fontSize: '12px',
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '12px'
          }}>
            <div>Target: {currentChallenge.targetScore} pts</div>
            <div>Time: {currentChallenge.timeLimit}s</div>
          </div>

          {/* Disadvantages */}
          <div style={{
            marginBottom: '12px'
          }}>
            <div style={{
              fontSize: '12px',
              fontWeight: 'bold',
              marginBottom: '4px',
              color: 'var(--color-accent)'
            }}>
              DISADVANTAGES:
            </div>
            {currentChallenge.disadvantages.map((disadvantage, i) => (
              <div key={i} style={{
                fontSize: '11px',
                marginBottom: '2px',
                color: 'var(--color-accent)'
              }}>
                • {disadvantage}
              </div>
            ))}
          </div>

          {/* Skip Perk */}
          <div style={{
            background: 'var(--color-accent)',
            padding: '8px',
            border: '2px solid var(--color-text)'
          }}>
            <div style={{
              fontSize: '12px',
              fontWeight: 'bold',
              marginBottom: '4px',
              color: 'var(--color-bg)'
            }}>
              SKIP PERK: {currentChallenge.skipPerk.name}
            </div>
            <div style={{
              fontSize: '11px',
              color: 'var(--color-bg)'
            }}>
              {currentChallenge.skipPerk.description}
            </div>
          </div>
        </div>
      </div>

      {/* Future Levels Preview - Accordion Style */}
      <div style={{
        width: '100%',
        maxWidth: '500px',
        marginBottom: '20px'
      }}>
        <div style={{
          fontSize: '16px',
          fontWeight: 'bold',
          color: 'var(--color-text)',
          marginBottom: '10px',
          textAlign: 'center'
        }}>
          FUTURE LEVELS:
        </div>
        
        {futureLevels.map((level, index) => (
          <div key={level.level} style={{ marginBottom: '8px' }}>
            {/* Collapsed Level */}
            <div
              className="gb-button"
              onClick={() => setExpandedLevel(expandedLevel === level.level ? null : level.level)}
              style={{
                background: 'var(--color-bg)',
                color: 'var(--color-text)',
                border: '2px solid var(--color-text)',
                padding: '8px 12px',
                fontSize: '12px',
                fontFamily: "'Courier New', 'Monaco', 'Menlo', monospace",
                fontWeight: 'bold',
                textTransform: 'uppercase',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <div>LEVEL {level.level}: {level.name}</div>
              <div>{expandedLevel === level.level ? '[-]' : '[+]'}</div>
            </div>
            
            {/* Expanded Level Details */}
            {expandedLevel === level.level && (
              <div style={{
                background: 'var(--color-accent)',
                border: '2px solid var(--color-text)',
                padding: '12px',
                marginTop: '2px',
                fontSize: '11px',
                color: 'var(--color-bg)'
              }}>
                <div style={{ marginBottom: '8px' }}>
                  <strong>{level.description}</strong>
                </div>
                <div style={{ marginBottom: '8px' }}>
                  Target: {level.targetScore} pts | Time: {level.timeLimit}s | Coins: {level.coinReward}
                </div>
                <div style={{ marginBottom: '8px' }}>
                  <strong>Disadvantages:</strong>
                  {level.disadvantages.map((dis, i) => (
                    <div key={i} style={{ marginLeft: '8px' }}>• {dis}</div>
                  ))}
                </div>
                <div>
                  <strong>Skip Perk:</strong> {level.skipPerk.name} - {level.skipPerk.description}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Skip Level Option */}
      <div style={{
        textAlign: 'center'
      }}>
        <button
          className="gb-button"
          onClick={handleSkipLevel}
          style={{
            padding: '12px 24px',
            fontSize: '14px',
            background: 'var(--color-accent)',
            color: 'var(--color-bg)',
            border: '3px solid var(--color-text)',
            fontFamily: "'Courier New', 'Monaco', 'Menlo', monospace",
            fontWeight: 'bold',
            textTransform: 'uppercase',
            cursor: 'pointer'
          }}
        >
          [!] SKIP LEVEL (Get Perk, No Coins)
        </button>
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
  const [powerCardMessages, setPowerCardMessages] = useState<string[]>([]);
  const [shuffleKey, setShuffleKey] = useState(0);
  const [wordFoundMessage, setWordFoundMessage] = useState('');
  
  // Power card visual effects state
  const [activatedCards, setActivatedCards] = useState<{[cardId: string]: {
    isActive: boolean;
    bonusPoints: number;
    message: string;
    timestamp: number;
  }}>({});
  const [cardBonusDisplay, setCardBonusDisplay] = useState<{[cardId: string]: number}>({});
  
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
    if (gameState.currentChallenge && wordsFound.includes(word)) {
      setWordFoundMessage('Word already found!');
      setTimeout(() => setWordFoundMessage(''), 2000);
      return;
    }

    // Dispatch word submission to apply power card effects
    dispatch({
      type: 'SUBMIT_WORD',
      payload: {
        word,
        positions: [], // Would need to pass actual positions from LetterGrid
        timeTaken: 0 // Would calculate actual time taken
      }
    });

    const newWordsFound = [...wordsFound, word];
    setWordsFound(newWordsFound);
    
    // Get the actual final score from game state (after power card effects)
    const finalScore = gameState.challengeProgress?.currentScore || 0;
    setCurrentScore(finalScore);
    
    // Display power card effects if any
    if (gameState.lastWordEffects && gameState.lastWordEffects.length > 0) {
      setWordFoundMessage(`${word.toUpperCase()} found! ${gameState.lastWordEffects.join(' ')}`);
    } else {
      setWordFoundMessage(`${word.toUpperCase()} found! +${score} points`);
    }
    
    setTimeout(() => setWordFoundMessage(''), 3000);

    // Check if challenge is complete
    if (gameState.currentChallenge && finalScore >= gameState.currentChallenge.targetScore) {
      handleChallengeComplete(finalScore);
    }
  };
  
  const handleScoreUpdate = (score: number) => {
    // Score is already handled in handleWordFound
  };
  
  const handleCurrentWordChange = (word: string) => {
    setCurrentWord(word);
  };
  
  const handlePowerCardTriggered = (cardId: string, bonusPoints: number, message: string) => {
    // Activate visual effect for this card
    setActivatedCards(prev => ({
      ...prev,
      [cardId]: {
        isActive: true,
        bonusPoints,
        message,
        timestamp: Date.now()
      }
    }));
    
    // Show bonus points
    setCardBonusDisplay(prev => ({
      ...prev,
      [cardId]: bonusPoints
    }));
    
    // Clear effects after animation
    setTimeout(() => {
      setActivatedCards(prev => ({
        ...prev,
        [cardId]: { ...prev[cardId], isActive: false }
      }));
    }, 600);
    
    setTimeout(() => {
      setCardBonusDisplay(prev => {
        const newDisplay = { ...prev };
        delete newDisplay[cardId];
        return newDisplay;
      });
    }, 2000);
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
  
  const handleShuffle = () => {
    if (gameState.coins >= 10) {
      dispatch({ type: 'SPEND_COINS', payload: 10 });
      setShuffleKey(prev => prev + 1); // This will force the LetterGrid to re-render with a new board
    }
  };
  
  return (
    <div style={{ 
      width: '100vw',
      height: 'calc(var(--vh, 1vh) * 100)',
      display: 'flex',
      flexDirection: 'column',
      background: '#9BBB0F', // Game Boy screen green - lighter green from screenshot
      overflow: 'hidden',
      position: 'fixed',
      top: 0,
      left: 0
    }}>
      {/* Top Header - Game Boy style */}
      <div style={{
        background: 'transparent',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        paddingTop: `calc(env(safe-area-inset-top, 0px) + 20px)`,
        paddingBottom: '10px',
        paddingLeft: '12px',
        paddingRight: '12px',
        minHeight: '120px'
      }}>
        {/* Level Title */}
        <div style={{
          fontSize: '16px',
          color: '#0F380F',
          fontWeight: 'bold',
          marginBottom: '8px',
          textAlign: 'center'
        }}>
          Word Hunt
        </div>
        
        {/* Level Number */}
        <div style={{
          fontSize: '24px',
          color: '#0F380F',
          fontWeight: 'bold',
          marginBottom: '16px',
          textAlign: 'center'
        }}>
          Level {gameState.currentLevel}
        </div>
        
        {/* Stats Row */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          maxWidth: '320px',
          marginBottom: '12px'
        }}>
          <div style={{
            fontSize: '18px',
            color: '#0F380F',
            fontWeight: 'bold'
          }}>
            ◉{gameState.coins}
          </div>
          
          {/* MASSIVE Score Display */}
          <div style={{ 
            fontSize: '48px',
            color: '#0F380F',
            fontWeight: 'bold',
            textAlign: 'center'
          }}>
            {currentScore}
          </div>

          <div style={{
            fontSize: '18px',
            color: '#0F380F',
            fontWeight: 'bold'
          }}>
            {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
          </div>
        </div>
        
        {/* Progress Bar */}
        <div style={{
          width: '200px',
          height: '12px',
          background: '#0F380F',
          border: '2px solid #0F380F',
          position: 'relative'
        }}>
          <div style={{
            width: `${Math.min(100, (currentScore / (gameState.currentChallenge?.targetScore || 1)) * 100)}%`,
            height: '100%',
            background: '#9BBB0F',
            transition: 'width 0.3s ease'
          }} />
        </div>
      </div>

      {/* Letter Grid - MUCH BIGGER NOW - Takes most of the screen */}
      <div style={{ 
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        minHeight: 0
      }}>
        <LetterGrid 
          key={shuffleKey}
          onWordFound={handleWordFound}
          onScoreUpdate={handleScoreUpdate}
          onCurrentWordChange={handleCurrentWordChange}
          onPowerCardTriggered={handlePowerCardTriggered}
          timeRemaining={timeRemaining}
          hideWordDisplay={true}
          foundWords={wordsFound}
        />
      </div>

      {/* Bottom Section */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 20px',
        paddingBottom: `calc(16px + env(safe-area-inset-bottom, 0px))`,
        background: 'transparent'
      }}>
        {/* Power Cards Section */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start'
        }}>
          <div style={{
            fontSize: '14px',
            color: '#0F380F',
            fontWeight: 'bold',
            marginBottom: '8px'
          }}>
            Power Cards
          </div>
          <div style={{
            display: 'flex',
            gap: '8px'
          }}>
            {/* Show active power cards */}
            {gameState.inventory.slice(0, 3).map((item, index) => {
              const isActivated = activatedCards[item.id]?.isActive;
              const bonusPoints = cardBonusDisplay[item.id];
              
              return (
                <div key={item.id} style={{ position: 'relative' }}>
                  <div 
                    style={{
                      width: '40px',
                      height: '40px',
                      background: isActivated ? '#9BBB0F' : '#0F380F',
                      border: '2px solid #0F380F',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '20px',
                      color: isActivated ? '#0F380F' : '#9BBB0F',
                      transform: isActivated ? 'scale(1.2) rotate(5deg)' : 'scale(1)',
                      transition: 'all 0.3s ease',
                      animation: isActivated ? 'powerCardPulse 0.6s ease-in-out' : 'none',
                      boxShadow: isActivated ? '0 0 10px rgba(15, 56, 15, 0.5)' : 'none'
                    }}
                  >
                    {getPerkEmoji(item.name)}
                  </div>
                  
                  {/* Bonus points display */}
                  {bonusPoints && (
                    <div style={{
                      position: 'absolute',
                      bottom: '-20px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      color: '#0F380F',
                      background: '#9BBB0F',
                      padding: '2px 6px',
                      border: '1px solid #0F380F',
                      animation: 'bonusPointsFloat 2s ease-out forwards',
                      zIndex: 10
                    }}>
                      +{bonusPoints}
                    </div>
                  )}
                </div>
              );
            })}
            {/* Empty slots */}
            {Array.from({ length: Math.max(0, 3 - gameState.inventory.length) }).map((_, index) => (
              <div key={`empty-${index}`} style={{
                width: '40px',
                height: '40px',
                background: '#0F380F',
                border: '2px solid #0F380F',
                opacity: 0.3
              }} />
            ))}
          </div>
        </div>

        {/* Shuffle Button */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '8px'
        }}>
          <button
            onClick={handleShuffle}
            disabled={gameState.coins < 10}
            style={{
              background: gameState.coins >= 10 ? '#0F380F' : '#666',
              color: gameState.coins >= 10 ? '#9BBB0F' : '#999',
              border: '2px solid #0F380F',
              padding: '8px 16px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: gameState.coins >= 10 ? 'pointer' : 'not-allowed'
            }}
          >
            ⟲ 10◉
          </button>
        </div>

        {/* Words Counter */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end'
        }}>
          <div style={{
            fontSize: '14px',
            color: '#0F380F',
            fontWeight: 'bold',
            marginBottom: '8px'
          }}>
            Words:
          </div>
          <div style={{
            fontSize: '24px',
            color: '#0F380F',
            fontWeight: 'bold'
          }}>
            {wordsFound.length}
          </div>
        </div>
      </div>

      {/* Word Found Message Display - FIXED: Move to top and make non-blocking */}
      {wordFoundMessage && (
        <div style={{
          position: 'fixed',
          top: `calc(env(safe-area-inset-top, 0px) + 80px)`, // Position below header
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 1000,
          background: '#0F380F',
          color: '#9BBB0F',
          border: '2px solid #0F380F',
          padding: '8px 16px',
          fontSize: '14px',
          fontWeight: 'bold',
          textAlign: 'center',
          maxWidth: '80%',
          borderRadius: '0',
          animation: 'fadeInOut 3s ease-in-out',
          pointerEvents: 'none' // Don't block touch events
        }}>
          {wordFoundMessage}
        </div>
      )}
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
  const { gameState, purchaseInventoryItem, sellInventoryItem, dispatch } = useGame();
  const [selectedCard, setSelectedCard] = useState<any>(null);
  const [showCardDetails, setShowCardDetails] = useState(false);
  const [shopItems, setShopItems] = useState<any[]>([]);
  const [rerollCost, setRerollCost] = useState(5);

  const generateShopItems = () => {
    const items: InventoryItem[] = [];
    const level = gameState.currentLevel;
    
    // Define unique power cards with fixed rarities and costs based on power level
    const powerCardTemplates = [
      // COMMON CARDS (15-20 coins) - Basic utility effects
      {
        name: 'Letter Alchemy',
        description: 'Rare letters (J,Q,X,Z) add +10 points each',
        effect: { type: 'rareLetterBonus' as const, value: 10 },
        emoji: '🔮',
        rarity: 'common' as const,
        baseCost: 15
      },
      {
        name: 'Coin Storm',
        description: 'Each word gives +5 coins + length bonus',
        effect: { type: 'coinMultiplier' as const, value: 2.0 },
        emoji: '💰',
        rarity: 'common' as const,
        baseCost: 18
      },
      {
        name: 'Time Warp',
        description: 'Adds 45 seconds + freezes time for first 10 words',
        effect: { type: 'timeExtender' as const, seconds: 45 },
        emoji: '⏰',
        rarity: 'common' as const,
        baseCost: 20
      },
      
      // UNCOMMON CARDS (25-40 coins) - Solid scoring improvements
      {
        name: 'Perfect Storm',
        description: 'Short words (3-4 letters) score 3x (stack with other bonuses)',
        effect: { type: 'shortWordMultiplier' as const, maxLength: 4, multiplier: 3.0 },
        emoji: '🌪️',
        rarity: 'uncommon' as const,
        baseCost: 25
      },
      {
        name: 'Vowel Crusher',
        description: 'Each vowel adds +25 points to word score + 3x multiplier',
        effect: { type: 'vowelBonus' as const, value: 3.0 },
        emoji: '🎯',
        rarity: 'uncommon' as const,
        baseCost: 30
      },
      {
        name: 'Chain Lightning',
        description: 'Each consecutive word: 1st=+50%, 2nd=+100%, 3rd=+200%',
        effect: { type: 'chainMultiplier' as const, value: 1.5 },
        emoji: '⛓️',
        rarity: 'uncommon' as const,
        baseCost: 35
      },
      {
        name: 'Golden Touch',
        description: '40% chance for 3x score multiplier',
        effect: { type: 'goldenLetters' as const, enabled: true },
        emoji: '✨',
        rarity: 'uncommon' as const,
        baseCost: 40
      },
      
      // RARE CARDS (50-80 coins) - Powerful game-changing effects
      {
        name: 'Word Mirage',
        description: '35% chance to score the word TWICE',
        effect: { type: 'wordEcho' as const, chance: 0.35 },
        emoji: '🔄',
        rarity: 'rare' as const,
        baseCost: 50
      },
      {
        name: 'Word Titan',
        description: '6+ letter words score 4x points (essential for late game)',
        effect: { type: 'longWordMultiplier' as const, minLength: 6, multiplier: 4.0 },
        emoji: '📚',
        rarity: 'rare' as const,
        baseCost: 65
      },
      {
        name: 'Score Doubler',
        description: 'ALL word scores multiplied by 2.5x',
        effect: { type: 'letterMultiplier' as const, value: 2.5 },
        emoji: '⚡',
        rarity: 'rare' as const,
        baseCost: 75
      },
      
      // LEGENDARY CARDS (100+ coins) - Ultimate power effects
      {
        name: 'Score Avalanche',
        description: 'Every 3rd word scored gets 5x multiplier',
        effect: { type: 'avalancheBonus' as const, interval: 3, multiplier: 5.0 },
        emoji: '🏔️',
        rarity: 'legendary' as const,
        baseCost: 100
      },
      {
        name: 'Word God',
        description: 'ALL words get +100 base points before multipliers',
        effect: { type: 'baseScoreBonus' as const, value: 100 },
        emoji: '👑',
        rarity: 'legendary' as const,
        baseCost: 150
      }
    ];
    
    // Generate 6 unique shop items with fixed costs
    const shuffledTemplates = [...powerCardTemplates].sort(() => Math.random() - 0.5);
    
    for (let i = 0; i < 6; i++) {
      const template = shuffledTemplates[i % shuffledTemplates.length];
      // Use fixed cost with slight level scaling
      const cost = Math.floor(template.baseCost * (1 + level * 0.1));
      const sellValue = Math.floor(cost * 0.6);
      
      const item: InventoryItem = {
        id: `shop-${Date.now()}-${i}-${Math.random()}`, // Ensure unique IDs
        name: template.name,
        description: template.description,
        rarity: template.rarity,
        cost: cost,
        sellValue: sellValue,
        effect: template.effect,
        emoji: template.emoji,
        purchaseLevel: level,
        timesUsed: 0,
        stackCount: 1
      };
      
      items.push(item);
    }
    
    setShopItems(items);
  };

  useEffect(() => {
    generateShopItems();
  }, [gameState.currentLevel]);

  const handleCardClick = (item: any) => {
    setSelectedCard(item);
    setShowCardDetails(true);
  };

  const handleCloseCardDetails = () => {
    setShowCardDetails(false);
    setSelectedCard(null);
  };

  const handlePurchase = (item: any) => {
    if (gameState.coins >= item.cost) {
      const success = purchaseInventoryItem(item);
      if (success) {
        // Remove item from shop after purchase
        setShopItems(prev => prev.filter(shopItem => shopItem.id !== item.id));
        handleCloseCardDetails();
      }
    }
  };

  const handleSell = (itemId) => {
    const success = sellInventoryItem(itemId);
    if (success) {
      // Item sold successfully
    }
  };

  const handleReroll = () => {
    if (gameState.coins >= rerollCost) {
      dispatch({ type: 'SPEND_COINS', payload: rerollCost });
      generateShopItems();
      setRerollCost(prev => prev + 2); // Increase reroll cost
    }
  };

  const handleContinue = () => {
    dispatch({ type: 'LEAVE_SHOP' });
  };

  return (
    <div style={{ 
      width: '100vw',
      height: 'calc(var(--vh, 1vh) * 100)',
      background: '#9BBB0F', // Game Boy light green
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      position: 'fixed',
      top: 0,
      left: 0
    }}>
      {/* Header */}
      <div style={{
        background: '#9BBB0F',
        padding: '20px',
        paddingTop: `calc(env(safe-area-inset-top, 0px) + 20px)`,
        borderBottom: '3px solid #0F380F',
        flexShrink: 0
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px'
        }}>
          <div style={{
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#0F380F'
          }}>
            POWER SHOP
          </div>
          <div style={{
            fontSize: '20px',
            fontWeight: 'bold',
            color: '#0F380F'
          }}>
            ◉ {gameState.coins}
          </div>
        </div>
        
        <div style={{
          fontSize: '16px',
          color: '#0F380F',
          fontWeight: 'bold',
          textAlign: 'center'
        }}>
          Level {gameState.currentLevel} • Choose your power cards wisely
        </div>
      </div>

      {/* Main Content - Flex container */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        minHeight: 0
      }}>
        {/* Shop Items Grid */}
        <div style={{
          flex: 1,
          padding: '20px',
          overflow: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '16px',
            width: '100%'
          }}>
            {shopItems.map((item, index) => (
              <div
                key={item.id}
                onClick={() => handleCardClick(item)}
                style={{
                  background: '#9BBB0F',
                  border: '3px solid #0F380F',
                  padding: '16px',
                  cursor: 'pointer',
                  minHeight: '120px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div style={{
                    fontSize: '16px',
                    fontWeight: 'bold',
                    color: '#0F380F',
                    marginBottom: '8px'
                  }}>
                    {getPerkEmoji(item.name)} {item.name}
                  </div>
                  <div style={{
                    fontSize: '12px',
                    color: '#0F380F',
                    marginBottom: '12px',
                    lineHeight: 1.3
                  }}>
                    {item.description}
                  </div>
                </div>
                
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div style={{
                    fontSize: '14px',
                    fontWeight: 'bold',
                    color: '#0F380F'
                  }}>
                    ◉ {item.cost}
                  </div>
                  <div style={{
                    fontSize: '12px',
                    fontWeight: 'bold',
                    color: '#0F380F',
                    textTransform: 'uppercase'
                  }}>
                    {item.rarity}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Inventory Section */}
        {gameState.inventory.length > 0 && (
          <div style={{
            background: '#8BAC0F',
            borderTop: '3px solid #0F380F',
            padding: '16px',
            flexShrink: 0
          }}>
            <div style={{
              fontSize: '16px',
              fontWeight: 'bold',
              color: '#0F380F',
              marginBottom: '12px'
            }}>
              Your Power Cards
            </div>
            <div style={{
              display: 'flex',
              gap: '12px',
              overflowX: 'auto',
              paddingBottom: '8px'
            }}>
              {gameState.inventory.map((item, index) => (
                <div
                  key={item.id}
                  style={{
                    background: '#9BBB0F',
                    border: '2px solid #0F380F',
                    padding: '12px',
                    minWidth: '150px',
                    flexShrink: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px'
                  }}
                >
                  <div style={{
                    fontSize: '14px',
                    fontWeight: 'bold',
                    color: '#0F380F'
                  }}>
                    {getPerkEmoji(item.name)} {item.name}
                  </div>
                  <button
                    onClick={() => handleSell(item.id)}
                    style={{
                      background: '#0F380F',
                      color: '#9BBB0F',
                      border: '2px solid #0F380F',
                      padding: '4px 8px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      cursor: 'pointer'
                    }}
                  >
                    SELL ◉{item.sellValue}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Actions */}
      <div style={{
        background: '#9BBB0F',
        borderTop: '3px solid #0F380F',
        padding: '16px',
        paddingBottom: `calc(16px + env(safe-area-inset-bottom, 0px))`,
        display: 'flex',
        gap: '12px',
        justifyContent: 'center',
        flexShrink: 0
      }}>
        <button
          onClick={handleReroll}
          disabled={gameState.coins < rerollCost}
          className="gb-button"
          style={{
            background: gameState.coins >= rerollCost ? '#0F380F' : '#8BAC0F',
            color: gameState.coins >= rerollCost ? '#9BBB0F' : '#0F380F',
            opacity: gameState.coins >= rerollCost ? 1 : 0.5
          }}
        >
          REROLL ◉{rerollCost}
        </button>
        
        <button
          onClick={handleContinue}
          className="gb-button"
          style={{
            background: '#0F380F',
            color: '#9BBB0F'
          }}
        >
          CONTINUE
        </button>
      </div>

      {/* Card Details Modal */}
      {showCardDetails && selectedCard && (
        <div className="gb-modal">
          <div className="gb-modal-content" style={{
            background: '#9BBB0F',
            border: '4px solid #0F380F',
            maxWidth: '400px',
            width: '90%'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: '16px'
            }}>
              <div style={{
                fontSize: '20px',
                fontWeight: 'bold',
                color: '#0F380F'
              }}>
                {getPerkEmoji(selectedCard.name)} {selectedCard.name}
              </div>
              <button
                onClick={handleCloseCardDetails}
                style={{
                  background: 'transparent',
                  border: 'none',
                  fontSize: '20px',
                  color: '#0F380F',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                ✕
              </button>
            </div>
            
            <div style={{
              fontSize: '14px',
              color: '#0F380F',
              marginBottom: '16px',
              lineHeight: 1.4
            }}>
              {selectedCard.description}
            </div>
            
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px'
            }}>
              <div style={{
                fontSize: '16px',
                fontWeight: 'bold',
                color: '#0F380F'
              }}>
                Cost: ◉ {selectedCard.cost}
              </div>
              <div style={{
                fontSize: '14px',
                fontWeight: 'bold',
                color: '#0F380F',
                textTransform: 'uppercase'
              }}>
                {selectedCard.rarity}
              </div>
            </div>
            
            <div style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'center'
            }}>
              <button
                onClick={() => handlePurchase(selectedCard)}
                disabled={gameState.coins < selectedCard.cost}
                className="gb-button"
                style={{
                  background: gameState.coins >= selectedCard.cost ? '#0F380F' : '#8BAC0F',
                  color: gameState.coins >= selectedCard.cost ? '#9BBB0F' : '#0F380F',
                  opacity: gameState.coins >= selectedCard.cost ? 1 : 0.5
                }}
              >
                BUY ◉{selectedCard.cost}
              </button>
              
              <button
                onClick={handleCloseCardDetails}
                className="gb-button"
                style={{
                  background: '#8BAC0F',
                  color: '#0F380F'
                }}
              >
                CANCEL
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper function to get detailed effect descriptions
const getDetailedEffectDescription = (effect: any): string => {
  switch (effect.type) {
    case 'scoreMultiplier':
      return `This power card multiplies ALL your word scores by ${effect.value}x. This is a powerful effect that works on every word you find!`;
    case 'timeBonus':
      return `Adds ${effect.seconds} seconds to your time limit. Perfect for when you need more time to find those long words!`;
    case 'vowelTheft':
      return `Has a ${Math.floor(effect.chance * 100)}% chance to steal a vowel from unused words, giving you a 1.5x score bonus. Vowels are precious!`;
    case 'consonantMultiplier':
      return `All consonants in your words are worth ${effect.value}x points. Great for consonant-heavy words!`;
    case 'goldenVowels':
      return `All vowels become golden and worth 3x points. Vowels are now your best friends!`;
    case 'lengthBonus':
      return `Each letter in your words adds +${effect.value}% to the score. Longer words get bigger bonuses!`;
    case 'shortWordMultiplier':
      return `Short words (2-3 letters) score ${effect.value}x. Perfect for quick scoring!`;
    case 'longWordMultiplier':
      return `Long words (8+ letters) score ${effect.value}x. Rewards your word-finding skills!`;
    case 'perfectLength':
      return `5-letter words score ${effect.value}x. The perfect length gets the perfect bonus!`;
    case 'palindromeMultiplier':
      return `Palindromes (words that read the same forwards and backwards) score ${effect.value}x. Racecar!`;
    case 'anagramMultiplier':
      return `Anagrams (words with the same letters rearranged) score ${effect.value}x. Find word families!`;
    case 'rhymeMultiplier':
      return `Rhyming words score ${effect.value}x. Sound patterns matter!`;
    case 'alliterationMultiplier':
      return `Alliterations (words starting with the same letter) score ${effect.value}x. All about that alliteration!`;
    case 'wordEcho':
      return `Has a ${Math.floor(effect.chance * 100)}% chance to duplicate your word, giving you double the score!`;
    case 'coinPerWord':
      return `Gives you +${effect.value} coins for every word you find. Build your wealth!`;
    case 'wordToCoins':
      return `Longer words give you bonus coins. More letters = more money!`;
    case 'luckyCoins':
      return `Has a ${Math.floor(effect.chance * 100)}% chance to give you +10 coins. Lady luck smiles upon you!`;
    case 'jokerMultiplier':
      return `Each power card you own adds +0.5x to your score multiplier. Collect them all!`;
    default:
      return `This power card has a special effect that will help you score more points and progress further in the game!`;
  }
};

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function getRandomRarity(): Rarity {
  const rand = Math.random();
  if (rand < 0.7) return 'common';
  if (rand < 0.95) return 'uncommon';
  if (rand < 0.99) return 'rare';
  return 'legendary';
}

function calculateCost(rarity: Rarity, level: number): number {
  const baseCosts = { common: 10, uncommon: 25, rare: 60, legendary: 150 };
  return Math.floor(baseCosts[rarity] * (1 + level * 0.2));
} 