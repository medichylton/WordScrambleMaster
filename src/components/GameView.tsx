import React, { useState, useEffect } from 'react';
import { useGame } from '../hooks/useGame';
import { GameState, Challenge, PerkEffect, PerkEffectType, InventoryItem, Rarity } from '../types/game';
import { LetterGrid } from './LetterGrid';
import MainMenu from './MainMenu';
import { generateRandomPowerCard, getPerkEmoji, convertPerkEffectToItemEffect } from '../utils/gameUtils';
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

  // Generate current level challenge (only this one is playable)
  const generateCurrentLevelChallenge = () => {
    const level = gameState.currentLevel;
    const baseScore = 30 + (level * 5);
    
    return {
      type: 'standard',
      name: 'WORD HUNT',
      description: 'Find words in the grid',
      icon: '>>',
      targetScore: calculateTargetScore(baseScore),
      timeLimit: 120,
      coinReward: Math.floor(15 + (level * 2)),
      disadvantages: [
        'No time extensions',
        'Limited word length bonus'
      ],
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
      
      const baseScore = 30 + (level * 5);
      futureLevels.push({
        level,
        name: getLevelName(level),
        description: getLevelDescription(level),
        icon: getLevelIcon(level),
        targetScore: calculateTargetScore(baseScore),
        timeLimit: 120 - (i * 10),
        coinReward: Math.floor(15 + (level * 2)),
        disadvantages: getLevelDisadvantages(level),
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
    // Apply power card effects to the word
    const powerCardContext: PowerCardContext = {
      currentWord: word,
      currentScore: currentScore,
      totalScore: gameState.totalScore,
      wordsFound: wordsFound,
      timeRemaining: timeRemaining,
      grid: [], // We don't have grid data here, but power cards can still work
      coins: gameState.coins,
      activePerks: gameState.activePerks || [],
      level: gameState.currentLevel
    };

    const powerCardResult = applyPowerCardEffects(word, score, powerCardContext);
    
    // Apply the power card modifications
    const finalScore = Math.floor(score * powerCardResult.scoreModifier);
    const coinBonus = powerCardResult.coinBonus;
    const timeBonus = powerCardResult.timeBonus;
    
    // Show power card messages if any
    if (powerCardResult.messages.length > 0) {
      setPowerCardMessages(powerCardResult.messages);
      // Clear messages after 3 seconds
      setTimeout(() => setPowerCardMessages([]), 3000);
    }

    setWordsFound(prev => [...prev, word]);
    setCurrentScore(prev => {
      const newScore = prev + finalScore;
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
    
    // Add coin bonus if any
    if (coinBonus > 0) {
      dispatch({ type: 'SPEND_COINS', payload: -coinBonus }); // Negative to add coins
    }
    
    // Add time bonus if any
    if (timeBonus > 0) {
      setTimeRemaining(prev => prev + timeBonus);
    }
    
    // Enhanced score bonus animation based on word length and score
    setShowScoreBonus(finalScore);
    
    // Different animation duration based on score magnitude
    const animationDuration = finalScore >= 11 ? 1500 : finalScore >= 5 ? 1200 : 1000;
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
          key={shuffleKey}
          onWordFound={handleWordFound}
          onScoreUpdate={handleScoreUpdate}
          onCurrentWordChange={handleCurrentWordChange}
          timeRemaining={timeRemaining}
          hideWordDisplay={true}
          foundWords={wordsFound}
        />
      </div>

      {/* Power Card Effects Display */}
      {powerCardMessages.length > 0 && (
        <div style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 1000,
          background: 'var(--color-bg)',
          border: '3px solid var(--color-text)',
          padding: '16px',
          borderRadius: '0',
          maxWidth: '300px',
          textAlign: 'center',
          fontFamily: "'Courier New', 'Monaco', 'Menlo', monospace"
        }}>
          <div style={{
            fontSize: '16px',
            fontWeight: 'bold',
            color: 'var(--color-text)',
            marginBottom: '8px',
            textTransform: 'uppercase'
          }}>
            POWER CARD EFFECTS!
          </div>
          {powerCardMessages.map((message, index) => (
            <div key={index} style={{
              fontSize: '14px',
              color: 'var(--color-accent)',
              marginBottom: '4px',
              fontWeight: 'bold'
            }}>
              {message}
            </div>
          ))}
        </div>
      )}

      {/* Bottom Status Panel - Flat design */}
      <div style={{
        background: 'var(--color-bg)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
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
      
      <div style={{
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        width: '100%',
        marginTop: '24px',
        padding: '0 24px',
      }}>
        {/* Shuffle Button */}
        <button
          onClick={handleShuffle}
          disabled={gameState.coins < 10}
          style={{
            fontSize: '18px',
            padding: '12px 24px',
            background: gameState.coins >= 10 ? 'var(--color-accent)' : 'var(--color-bg)',
            color: gameState.coins >= 10 ? 'var(--color-bg)' : 'var(--color-text)',
            border: '3px solid var(--color-text)',
            fontFamily: "'Courier New', 'Monaco', 'Menlo', monospace",
            fontWeight: 'bold',
            textTransform: 'uppercase',
            cursor: gameState.coins >= 10 ? 'pointer' : 'not-allowed',
            opacity: gameState.coins >= 10 ? 1 : 0.5,
            minWidth: '120px',
            minHeight: '60px',
            borderRadius: '0',
            marginBottom: '8px'
          }}
        >
          SHUFFLE [-10C]
        </button>

        {/* Power Cards Display (centered, icons in boxes, label below) */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0' }}>
          <div style={{ display: 'flex', gap: '12px', marginBottom: '4px' }}>
            {gameState.activePerks && gameState.activePerks.length > 0 ? (
              gameState.activePerks.slice(0, 3).map((perk, idx) => (
                <div key={perk.id} style={{
                  width: '48px',
                  height: '48px',
                  border: '2px solid var(--color-text)',
                  background: 'var(--color-bg)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '32px',
                  borderRadius: '0',
                  margin: 0
                }}>
                  {getPerkEmoji(perk.name)}
                </div>
              ))
            ) : (
              <div style={{ width: '48px', height: '48px', border: '2px solid var(--color-text)', background: 'var(--color-bg)' }} />
            )}
          </div>
          <span style={{ fontSize: '14px', color: 'var(--color-text)', fontFamily: "'Courier New', 'Monaco', 'Menlo', monospace", marginTop: '0', letterSpacing: '1px' }}>Power Cards</span>
        </div>

        {/* Words Counter (right) */}
        <div style={{ fontSize: '18px', color: 'var(--color-text)', fontFamily: "'Courier New', 'Monaco', 'Menlo', monospace", fontWeight: 'bold', minWidth: '100px', textAlign: 'right', marginBottom: '8px' }}>
          Words: {wordsFound.length}
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
  const [shopItems, setShopItems] = useState<any[]>([]);
  const [rerollCost, setRerollCost] = useState(3);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCard, setSelectedCard] = useState<any>(null);
  const [showCardDetails, setShowCardDetails] = useState(false);

  useEffect(() => {
    // Generate shop items when component mounts
    setShopItems(generateShopItems());
    setIsLoading(false);
  }, []);

  const generateShopItems = () => {
    const items: any[] = [];
    const acquiredPerkNames = new Set(gameState.inventory.map(item => item.name));
    
    // Generate 6 unique items
    for (let i = 0; i < 6; i++) {
      let attempts = 0;
      let perk: PerkEffect;
      
      // Try to generate a unique perk
      do {
        perk = generateRandomPowerCard(gameState.currentLevel);
        attempts++;
        if (attempts > 50) break; // Prevent infinite loop
      } while (acquiredPerkNames.has(perk.name));
      
      if (attempts <= 50) {
        acquiredPerkNames.add(perk.name);
      }
      
      const rarity = getRandomRarity();
      const cost = calculateCost(rarity, gameState.currentLevel);
      
      items.push({
        id: perk.id,
        name: perk.name,
        description: perk.description,
        rarity,
        cost,
        sellValue: Math.floor(cost * 0.5),
        effect: convertPerkEffectToItemEffect(perk.effect),
        emoji: getPerkEmoji(perk.name),
        purchaseLevel: gameState.currentLevel,
        timesUsed: 0,
        stackCount: 1,
        perkEffect: perk.effect // Store the actual perk effect
      });
    }
    
    return items;
  };

  const handleCardClick = (item: any) => {
    setSelectedCard(item);
    setShowCardDetails(true);
  };

  const handleCloseCardDetails = () => {
    setShowCardDetails(false);
    setSelectedCard(null);
  };

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
      
      // Close card details if this card was selected
      if (selectedCard && selectedCard.id === item.id) {
        handleCloseCardDetails();
      }
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
    // For now, return 0 since synergy system isn't fully implemented
    // In the future, this could check for matching power card types or effects
    return 0;
  };

  // Helper functions
  const getRandomRarity = (): Rarity => {
    const rand = Math.random();
    if (rand < 0.7) return 'common';
    if (rand < 0.95) return 'uncommon';
    if (rand < 0.99) return 'rare';
    return 'legendary';
  };

  const calculateCost = (rarity: Rarity, level: number): number => {
    const baseCosts = { common: 10, uncommon: 25, rare: 60, legendary: 150 };
    return Math.floor(baseCosts[rarity] * (1 + level * 0.2));
  };

  const getPerkEmoji = (perkName: string): string => {
    const emojiMap: { [key: string]: string } = {
      'Letter Alchemist': '🔮',
      'Vowel Vampire': '🧛',
      'Consonant Crusher': '💪',
      'Golden Vowels': '✨',
      'Length Lord': '📏',
      'Short Stack': '📦',
      'Long Shot': '🎯',
      'Perfect Length': '⭐',
      'Time Warp': '⏰',
      'Speed Demon': '⚡',
      'Time Bank': '🏦',
      'Frozen Time': '❄️',
      'Palindrome Prince': '👑',
      'Anagram King': '🎭',
      'Rhyme Master': '🎵',
      'Alliteration Ace': '🎪',
      'Diagonal Dancer': '💃',
      'Pathfinder': '🗺️',
      'Grid Master': '🎮',
      'Spiral Seeker': '🌀',
      'Score Doubler': '🎲',
      'Chain Master': '⛓️',
      'Combo King': '👑',
      'Streak Seeker': '🔥',
      'Noun Hunter': '🏹',
      'Verb Virtuoso': '🎭',
      'Adjective Ace': '🎨',
      'Plural Power': '📚',
      'Word Echo': '🔄',
      'Letter God': '👑',
      'Infinite Loop': '♾️',
      'Reality Hack': '💻',
      'Coin Magnet': '🧲',
      'Rich Words': '💰',
      'Investment Banker': '🏛️',
      'Lucky Strike': '🍀',
      'Synergy Master': '🔗',
      'Power Collector': '🃏',
      'Perfect Pair': '💕',
      'Trinity Force': '☯️',
      'Risk Taker': '🎲',
      'Speed Runner': '🏃',
      'Perfectionist': '✨',
      'Underdog': '🐕',
      'Wild Card': '🃏',
      'Power Wild': '🎭',
      'Chaos Theory': '🌪️',
      'Quantum Leap': '🚀',
      'Meta Master': '🧠',
      'Power Power': '🎪',
      'Infinite Power': '♾️',
      'Power God': '👑'
    };
    return emojiMap[perkName] || '🎯';
  };

  const convertPerkEffectToItemEffect = (perkEffect: PerkEffectType): any => {
    // Convert PerkEffectType to ItemEffect - this is a simplified conversion
    // In a real implementation, you'd want to map each effect type properly
    switch (perkEffect.type) {
      case 'timeBonus':
        return { type: 'timeExtender', seconds: perkEffect.seconds };
      case 'scoreMultiplier':
        return { type: 'letterMultiplier', value: perkEffect.value };
      case 'coinMultiplier':
        return { type: 'coinMultiplier', value: perkEffect.value };
      default:
        return { type: 'letterMultiplier', value: 1.5 }; // Default fallback
    }
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
        paddingLeft: '12px',
        paddingRight: '12px',
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
          
          {isLoading ? (
            <div style={{
              textAlign: 'center',
              padding: '40px',
              color: 'var(--color-text)',
              fontFamily: "'Courier New', 'Monaco', 'Menlo', monospace",
              fontSize: '16px'
            }}>
              LOADING SHOP ITEMS...
            </div>
          ) : shopItems.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '40px',
              color: 'var(--color-accent)',
              fontFamily: "'Courier New', 'Monaco', 'Menlo', monospace",
              fontSize: '16px'
            }}>
              NO ITEMS AVAILABLE
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '16px',
              maxWidth: '1200px',
              margin: '0 auto'
            }}>
              {shopItems.map((item, index) => (
                <div 
                  key={index}
                  className="gb-button"
                  style={{
                    cursor: 'pointer',
                    minHeight: '280px',
                    display: 'flex',
                    flexDirection: 'column',
                    background: 'var(--color-bg)',
                    color: 'var(--color-text)',
                    border: item.rarity === 'legendary' ? '4px solid var(--color-text)' : 
                           item.rarity === 'rare' ? '3px solid var(--color-text)' : '2px solid var(--color-text)',
                    padding: '16px',
                    fontFamily: "'Courier New', 'Monaco', 'Menlo', monospace",
                    textAlign: 'center',
                    position: 'relative',
                    transition: 'transform 0.1s ease'
                  }}
                  onClick={() => handleCardClick(item)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.02)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  {/* Card Header - Flat */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '12px'
                  }}>
                    <div style={{
                      fontSize: '12px',
                      fontWeight: 'bold',
                      textTransform: 'uppercase',
                      color: 'var(--color-text)'
                    }}>
                      {item.rarity}
                    </div>
                    <div style={{
                      fontSize: '14px',
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
                    fontSize: '48px',
                    textAlign: 'center',
                    marginBottom: '12px',
                    fontWeight: 'bold',
                    color: 'var(--color-text)'
                  }}>
                    {item.emoji}
                  </div>

                  {/* Card Title - Flat */}
                  <div style={{
                    fontSize: '16px',
                    fontWeight: 'bold',
                    color: 'var(--color-text)',
                    marginBottom: '8px',
                    textTransform: 'uppercase',
                    lineHeight: 1.2
                  }}>
                    {item.name}
                  </div>

                  {/* Card Description - Flat */}
                  <div style={{
                    fontSize: '12px',
                    color: 'var(--color-text)',
                    lineHeight: 1.3,
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {item.description}
                  </div>

                  {/* Click to view details hint */}
                  <div style={{
                    fontSize: '10px',
                    color: 'var(--color-accent)',
                    marginTop: '8px',
                    fontStyle: 'italic'
                  }}>
                    CLICK TO VIEW DETAILS
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Inventory Section */}
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
            [I] INVENTORY [I]
          </h2>
          
          {gameState.inventory.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '40px',
              color: 'var(--color-accent)',
              fontFamily: "'Courier New', 'Monaco', 'Menlo', monospace",
              fontSize: '16px'
            }}>
              NO ITEMS OWNED
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '16px',
              maxWidth: '1200px',
              margin: '0 auto'
            }}>
              {gameState.inventory.map((item, index) => (
                <div 
                  key={index}
                  style={{
                    minHeight: '200px',
                    display: 'flex',
                    flexDirection: 'column',
                    background: 'var(--color-accent)',
                    color: 'var(--color-bg)',
                    border: '2px solid var(--color-text)',
                    padding: '16px',
                    fontFamily: "'Courier New', 'Monaco', 'Menlo', monospace",
                    textAlign: 'center',
                    position: 'relative'
                  }}
                >
                  {/* Inventory Item Header */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '12px'
                  }}>
                    <div style={{
                      fontSize: '12px',
                      fontWeight: 'bold',
                      textTransform: 'uppercase'
                    }}>
                      OWNED
                    </div>
                    <div style={{
                      fontSize: '14px',
                      fontWeight: 'bold',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      <span>[S]</span>
                      <span>{item.sellValue}</span>
                    </div>
                  </div>

                  {/* Inventory Item Icon */}
                  <div style={{
                    fontSize: '36px',
                    textAlign: 'center',
                    marginBottom: '12px',
                    fontWeight: 'bold'
                  }}>
                    {item.emoji}
                  </div>

                  {/* Inventory Item Title */}
                  <div style={{
                    fontSize: '14px',
                    fontWeight: 'bold',
                    marginBottom: '8px',
                    textTransform: 'uppercase',
                    lineHeight: 1.2
                  }}>
                    {item.name}
                  </div>

                  {/* Stack Count */}
                  {item.stackCount > 1 && (
                    <div style={{
                      fontSize: '12px',
                      marginTop: '8px',
                      fontWeight: 'bold'
                    }}>
                      STACK: {item.stackCount}
                    </div>
                  )}

                  {/* Sell Button */}
                  <button
                    onClick={() => handleSell(item.id)}
                    style={{
                      marginTop: '12px',
                      padding: '8px 16px',
                      background: 'var(--color-bg)',
                      color: 'var(--color-text)',
                      border: '2px solid var(--color-text)',
                      fontFamily: "'Courier New', 'Monaco', 'Menlo', monospace",
                      fontSize: '12px',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      textTransform: 'uppercase'
                    }}
                  >
                    SELL
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          gap: '16px',
          justifyContent: 'center',
          marginTop: '20px'
        }}>
          <button
            onClick={handleReroll}
            disabled={gameState.coins < rerollCost}
            style={{
              padding: '12px 24px',
              background: gameState.coins >= rerollCost ? 'var(--color-accent)' : 'var(--color-bg)',
              color: gameState.coins >= rerollCost ? 'var(--color-bg)' : 'var(--color-text)',
              border: '3px solid var(--color-text)',
              fontFamily: "'Courier New', 'Monaco', 'Menlo', monospace",
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: gameState.coins >= rerollCost ? 'pointer' : 'not-allowed',
              textTransform: 'uppercase'
            }}
          >
            REROLL [C] {rerollCost}
          </button>
          
          <button
            onClick={handleContinue}
            style={{
              padding: '12px 24px',
              background: 'var(--color-accent)',
              color: 'var(--color-bg)',
              border: '3px solid var(--color-text)',
              fontFamily: "'Courier New', 'Monaco', 'Menlo', monospace",
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer',
              textTransform: 'uppercase'
            }}
          >
            CONTINUE
          </button>
        </div>
      </div>

      {/* Card Details Modal */}
      {showCardDetails && selectedCard && (
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
            background: 'var(--color-bg)',
            border: '4px solid var(--color-text)',
            padding: '24px',
            maxWidth: '400px',
            width: '100%',
            fontFamily: "'Courier New', 'Monaco', 'Menlo', monospace",
            textAlign: 'center'
          }}>
            {/* Card Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '16px'
            }}>
              <div style={{
                fontSize: '14px',
                fontWeight: 'bold',
                textTransform: 'uppercase',
                color: 'var(--color-text)'
              }}>
                {selectedCard.rarity}
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
                <span>{selectedCard.cost}</span>
              </div>
            </div>

            {/* Card Icon */}
            <div style={{
              fontSize: '64px',
              textAlign: 'center',
              marginBottom: '16px',
              fontWeight: 'bold',
              color: 'var(--color-text)'
            }}>
              {selectedCard.emoji}
            </div>

            {/* Card Title */}
            <div style={{
              fontSize: '20px',
              fontWeight: 'bold',
              color: 'var(--color-text)',
              marginBottom: '12px',
              textTransform: 'uppercase',
              lineHeight: 1.2
            }}>
              {selectedCard.name}
            </div>

            {/* Card Description */}
            <div style={{
              fontSize: '14px',
              color: 'var(--color-text)',
              lineHeight: 1.4,
              marginBottom: '20px'
            }}>
              {selectedCard.description}
            </div>

            {/* Detailed Effect Description */}
            <div style={{
              fontSize: '12px',
              color: 'var(--color-accent)',
              lineHeight: 1.3,
              marginBottom: '20px',
              padding: '12px',
              background: 'var(--color-bg)',
              border: '2px solid var(--color-text)'
            }}>
              {getDetailedEffectDescription(selectedCard.perkEffect)}
            </div>

            {/* Action Buttons */}
            <div style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'center'
            }}>
              <button
                onClick={handleCloseCardDetails}
                style={{
                  padding: '8px 16px',
                  background: 'var(--color-bg)',
                  color: 'var(--color-text)',
                  border: '2px solid var(--color-text)',
                  fontFamily: "'Courier New', 'Monaco', 'Menlo', monospace",
                  fontSize: '14px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  textTransform: 'uppercase'
                }}
              >
                CLOSE
              </button>
              
              <button
                onClick={() => handlePurchase(selectedCard)}
                disabled={gameState.coins < selectedCard.cost}
                style={{
                  padding: '8px 16px',
                  background: gameState.coins >= selectedCard.cost ? 'var(--color-accent)' : 'var(--color-bg)',
                  color: gameState.coins >= selectedCard.cost ? 'var(--color-bg)' : 'var(--color-text)',
                  border: '2px solid var(--color-text)',
                  fontFamily: "'Courier New', 'Monaco', 'Menlo', monospace",
                  fontSize: '14px',
                  fontWeight: 'bold',
                  cursor: gameState.coins >= selectedCard.cost ? 'pointer' : 'not-allowed',
                  textTransform: 'uppercase'
                }}
              >
                PURCHASE
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