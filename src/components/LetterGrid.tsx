import React, { useState, useEffect } from 'react';
import { generateBoggleGrid, isValidWordSync, isValidWord, calculateWordScore, isValidPath, pathToWord, areAdjacent, getWordDefinition } from '../utils/wordDictionary';
import { useGame } from '../hooks/useGame';
import { generateLevelAdjustedGrid, isValidLevelMove, applyLevelScoring, getLevelEffects, getLevelTimeLimit } from '../utils/gameUtils';

interface Position {
  row: number;
  col: number;
}

interface LetterGridProps {
  onWordFound: (word: string, score: number) => void;
  onScoreUpdate: (score: number) => void;
  onCurrentWordChange?: (word: string) => void;
  timeRemaining: number;
  hideWordDisplay?: boolean;
  foundWords?: string[];
}

export function LetterGrid({ onWordFound, onScoreUpdate, onCurrentWordChange, timeRemaining, hideWordDisplay = false, foundWords = [] }: LetterGridProps) {
  const { gameState } = useGame();
  const [grid, setGrid] = useState<string[][]>([]);
  const [selectedPath, setSelectedPath] = useState<Position[]>([]);
  const [currentWord, setCurrentWord] = useState('');
  const [localFoundWords, setLocalFoundWords] = useState<string[]>([]);
  const [isSelecting, setIsSelecting] = useState(false);
  const [wordValidationStatus, setWordValidationStatus] = useState<'checking' | 'valid' | 'invalid' | 'unknown' | 'already-found'>('unknown');
  const [moveHistory, setMoveHistory] = useState<{word: string, path: Position[], score: number, timestamp: number}[]>([]);
  const [chainCount, setChainCount] = useState(0);
  const [goldenLetters, setGoldenLetters] = useState<Set<string>>(new Set());
  const [touchStartTime, setTouchStartTime] = useState(0);
  const [lastTouchPosition, setLastTouchPosition] = useState<Position | null>(null);
  const [touchThreshold, setTouchThreshold] = useState(50); // Minimum distance for touch movement

  // Use foundWords prop if provided, otherwise use local state
  const allFoundWords = foundWords.length > 0 ? foundWords : localFoundWords;

  // Power-up effect helpers
  const hasGoldenLetters = gameState.powerUps.some(p => p.effect.type === 'goldenLetters');
  const hasVowelPower = gameState.powerUps.some(p => p.effect.type === 'vowelBonus');
  const hasLetterGod = gameState.powerUps.some(p => p.effect.type === 'letterGod');
  const chainMultiplier = gameState.powerUps.find(p => p.effect.type === 'chainMultiplier')?.effect.value || 0;
  const letterMultiplier = gameState.powerUps.find(p => p.effect.type === 'letterMultiplier')?.effect.value || 0;
  const longWordMultiplier = gameState.powerUps.find(p => p.effect.type === 'longWordMultiplier');
  const exponentialGrowth = gameState.powerUps.find(p => p.effect.type === 'exponentialGrowth');

  useEffect(() => {
    // Use level-adjusted grid generation instead of basic Boggle grid
    const newGrid = generateLevelAdjustedGrid(gameState.currentLevel);
    setGrid(newGrid);
    
    // Initialize golden letters if power-up is active
    if (hasGoldenLetters) {
      const goldenCount = gameState.powerUps.find(p => p.effect.type === 'goldenLetters')?.effect.count || 3;
      const flatLetters = newGrid.flat();
      const randomGolden = new Set<string>();
      
      for (let i = 0; i < goldenCount && i < flatLetters.length; i++) {
        const randomIndex = Math.floor(Math.random() * flatLetters.length);
        randomGolden.add(`${Math.floor(randomIndex / 4)}-${randomIndex % 4}`);
      }
      setGoldenLetters(randomGolden);
    }
  }, [hasGoldenLetters, gameState.currentLevel]);

  useEffect(() => {
    if (selectedPath.length > 0) {
      const word = pathToWord(grid, selectedPath);
      setCurrentWord(word);
      onCurrentWordChange?.(word);
      
      // Validate path first
      if (!isValidPath(grid, selectedPath)) {
        setWordValidationStatus('invalid');
        return;
      }
      
      if (word.length >= 2) {
        // Check if word was already found
        if (allFoundWords.includes(word)) {
          setWordValidationStatus('already-found');
        } else {
          const syncResult = isValidWordSync(word);
          if (syncResult === true) {
            setWordValidationStatus('valid');
          } else if (syncResult === false) {
            setWordValidationStatus('invalid');
          } else {
            setWordValidationStatus('checking');
            isValidWord(word).then(isValid => {
              setWordValidationStatus(isValid ? 'valid' : 'invalid');
            });
          }
        }
      } else {
        setWordValidationStatus('unknown');
      }
    } else {
      setCurrentWord('');
      setWordValidationStatus('unknown');
      onCurrentWordChange?.('');
    }
  }, [selectedPath, grid, onCurrentWordChange, allFoundWords]);

  // Enhanced score calculation with power-ups AND level effects
  const calculateEnhancedScore = (word: string): number => {
    const timeBonus = timeRemaining > 60 ? 1.5 : timeRemaining > 30 ? 1.2 : 1.0;
    let baseScore = calculateWordScore(word, timeBonus);
    
    // Apply level effects first
    baseScore = applyLevelScoring(gameState.currentLevel, word, baseScore, allFoundWords);
    
    // If level effects invalidate the word, return 0
    if (baseScore === 0) {
      return 0;
    }
    
    // Apply letter multiplier
    if (letterMultiplier > 0) {
      baseScore += word.length * letterMultiplier;
    }
    
    // Apply vowel bonus
    if (hasVowelPower) {
      const vowelBonus = gameState.powerUps.find(p => p.effect.type === 'vowelBonus')?.effect.value || 2;
      const vowelCount = word.split('').filter(letter => 'aeiouAEIOU'.includes(letter)).length;
      baseScore += vowelCount * vowelBonus;
    }
    
    // Apply chain multiplier
    if (chainMultiplier > 0) {
      baseScore += chainCount * chainMultiplier;
    }
    
    // Apply long word multiplier
    if (longWordMultiplier && word.length >= longWordMultiplier.minLength) {
      baseScore *= longWordMultiplier.multiplier;
    }
    
    // Apply golden letter bonus
    const pathGoldenCount = selectedPath.filter(pos => 
      goldenLetters.has(`${pos.row}-${pos.col}`)
    ).length;
    if (pathGoldenCount > 0) {
      baseScore *= (1 + pathGoldenCount * 2); // 3x per golden letter
    }
    
    // Apply exponential growth
    if (exponentialGrowth) {
      const growthFactor = Math.pow(exponentialGrowth.multiplier, allFoundWords.length);
      baseScore *= growthFactor;
    }
    
    return Math.round(baseScore);
  };

  const isVowel = (letter: string): boolean => {
    return 'aeiouAEIOU'.includes(letter);
  };

  const isGoldenLetter = (row: number, col: number): boolean => {
    return goldenLetters.has(`${row}-${col}`);
  };

  const getLetterStyle = (row: number, col: number, letter: string) => {
    const isSelected = isCellSelected(row, col);
    const isInPath = isCellInPath(row, col);
    const isGolden = isGoldenLetter(row, col);
    const isVowelWithPower = hasVowelPower && isVowel(letter);
    
    // Game Boy styling - consistent colors
    let background = '#9BBB0F'; // Light green background
    let color = '#0F380F'; // Dark green text
    let border = '3px solid #0F380F'; // Dark green border
    
    if (isSelected) {
      background = '#0F380F'; // Dark green background when selected
      color = '#9BBB0F'; // Light green text when selected
      border = '3px solid #0F380F';
    } else if (isInPath) {
      background = '#8BAC0F'; // Medium green for path
      color = '#0F380F';
      border = '3px solid #0F380F';
    } else if (isGolden || isVowelWithPower) {
      // Special letters get slightly different styling
      background = '#8BAC0F'; // Medium green
      color = '#0F380F';
      border = '4px solid #0F380F'; // Thicker border for special letters
    }
    
    return {
      background,
      color,
      border,
      fontWeight: (isGolden || isVowelWithPower) ? 'bold' : 'bold' // All letters bold
    };
  };

  // Improved cell detection with better accuracy
  const getCellFromPoint = (clientX: number, clientY: number): Position | null => {
    const element = document.elementFromPoint(clientX, clientY);
    if (element && element.hasAttribute('data-row') && element.hasAttribute('data-col')) {
      const row = parseInt(element.getAttribute('data-row') || '0');
      const col = parseInt(element.getAttribute('data-col') || '0');
      return { row, col };
    }
    return null;
  };

  // Calculate distance between two positions
  const getDistance = (pos1: Position, pos2: Position): number => {
    return Math.sqrt(Math.pow(pos1.row - pos2.row, 2) + Math.pow(pos1.col - pos2.col, 2));
  };

  // Check if a touch movement is significant enough to register
  const isSignificantMovement = (startPos: Position, currentPos: Position): boolean => {
    return getDistance(startPos, currentPos) >= 0.5; // Minimum 0.5 cell distance
  };

  // Improved touch handling with smart barriers
  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    const cell = getCellFromPoint(touch.clientX, touch.clientY);
    
    if (cell) {
      setTouchStartTime(Date.now());
      setLastTouchPosition(cell);
      setIsSelecting(true);
      setSelectedPath([cell]);
      
      // Add haptic feedback for mobile
      if (navigator.vibrate) {
        navigator.vibrate(10);
      }
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    if (!isSelecting || !lastTouchPosition) return;
    
    const touch = e.touches[0];
    const cell = getCellFromPoint(touch.clientX, touch.clientY);
    if (!cell) return;

    // Check if movement is significant enough
    if (!isSignificantMovement(lastTouchPosition, cell)) {
      return;
    }

    const existingIndex = selectedPath.findIndex(pos => pos.row === cell.row && pos.col === cell.col);
    
    if (existingIndex !== -1) {
      // Backtrack to this position
      setSelectedPath(selectedPath.slice(0, existingIndex + 1));
    } else if (selectedPath.length > 0) {
      const lastPos = selectedPath[selectedPath.length - 1];
      // Use enhanced adjacency checking
      if (areAdjacent(lastPos, cell)) {
        setSelectedPath([...selectedPath, cell]);
        setLastTouchPosition(cell);
        
        // Light haptic feedback for each new letter
        if (navigator.vibrate) {
          navigator.vibrate(5);
        }
      }
    }
  };

  const handleTouchEnd = async (e: React.TouchEvent) => {
    e.preventDefault();
    if (!isSelecting) return;
    
    // Check if this was a quick tap (potential accidental touch)
    const touchDuration = Date.now() - touchStartTime;
    if (touchDuration < 100 && selectedPath.length === 1) {
      // Quick single tap - might be accidental, don't submit
      setIsSelecting(false);
      setSelectedPath([]);
      setLastTouchPosition(null);
      return;
    }
    
    setIsSelecting(false);
    setLastTouchPosition(null);
    await processWordSubmission();
    setSelectedPath([]);
  };

  const handleMouseDown = (row: number, col: number) => {
    setIsSelecting(true);
    setSelectedPath([{ row, col }]);
    setLastTouchPosition({ row, col });
  };

  const handleMouseEnter = (row: number, col: number) => {
    if (isSelecting) {
      const newPos = { row, col };
      
      // Check if this is a valid level move
      if (selectedPath.length > 0) {
        const lastPos = selectedPath[selectedPath.length - 1];
        if (!isValidLevelMove(gameState.currentLevel, lastPos, newPos)) {
          return; // Invalid move for this level
        }
      }
      
      // Check if cell is already in path
      const existingIndex = selectedPath.findIndex(pos => pos.row === row && pos.col === col);
      
      if (existingIndex === -1) {
        // Add new cell if adjacent to last cell or if it's the first cell
        if (selectedPath.length === 0 || areAdjacent(selectedPath[selectedPath.length - 1], newPos)) {
          setSelectedPath([...selectedPath, newPos]);
        }
      } else if (existingIndex === selectedPath.length - 2) {
        // Backtrack to previous cell
        setSelectedPath(selectedPath.slice(0, -1));
      }
    }
  };

  const handleMouseUp = async () => {
    if (!isSelecting) return;
    
    setIsSelecting(false);
    setLastTouchPosition(null);
    await processWordSubmission();
    setSelectedPath([]);
  };

  const processWordSubmission = async () => {
    if (currentWord.length >= 2 && !allFoundWords.includes(currentWord)) {
      // Validate path first
      if (!isValidPath(grid, selectedPath)) {
        // Error haptic feedback for invalid path
        if (navigator.vibrate) {
          navigator.vibrate(100);
        }
        return;
      }

      let isValid = false;
      if (wordValidationStatus === 'checking') {
        isValid = await isValidWord(currentWord);
      } else {
        isValid = wordValidationStatus === 'valid';
      }
      
      if (isValid) {
        const score = calculateEnhancedScore(currentWord);
        
        // Update chain count for chain multiplier power-up
        if (chainMultiplier > 0) {
          setChainCount(prev => prev + 1);
        }
        
        // Add to move history
        const move = {
          word: currentWord,
          path: [...selectedPath],
          score,
          timestamp: Date.now()
        };
        setMoveHistory(prev => [...prev, move]);
        
        if (foundWords.length === 0) {
          setLocalFoundWords([...localFoundWords, currentWord]);
        }
        onWordFound(currentWord, score);
        onScoreUpdate(score);
        
        // Success haptic feedback
        if (navigator.vibrate) {
          navigator.vibrate([50, 50, 50]);
        }
      } else {
        // Error haptic feedback
        if (navigator.vibrate) {
          navigator.vibrate(100);
        }
      }
    }
  };

  const isCellSelected = (row: number, col: number): boolean => {
    return selectedPath.some(pos => pos.row === row && pos.col === col);
  };

  const getCellSelectionOrder = (row: number, col: number): number => {
    const index = selectedPath.findIndex(pos => pos.row === row && pos.col === col);
    return index !== -1 ? index + 1 : 0;
  };

  const isCellInPath = (row: number, col: number): boolean => {
    const index = selectedPath.findIndex(pos => pos.row === row && pos.col === col);
    return index !== -1 && index < selectedPath.length - 1;
  };

  const shuffleGrid = () => {
    setGrid(generateBoggleGrid());
    if (foundWords.length === 0) {
      setLocalFoundWords([]);
    }
    setSelectedPath([]);
    setCurrentWord('');
    setWordValidationStatus('unknown');
    setMoveHistory([]);
  };

  const clearSelection = () => {
    setSelectedPath([]);
    setIsSelecting(false);
    setCurrentWord('');
    setWordValidationStatus('unknown');
  };

  const submitWord = async () => {
    if (currentWord.length >= 2 && !allFoundWords.includes(currentWord)) {
      await processWordSubmission();
    }
    
    setSelectedPath([]);
    setCurrentWord('');
    setWordValidationStatus('unknown');
  };

  const getWordValidationClass = () => {
    if (currentWord.length < 2) return '';
    
    // Check path validity first
    if (selectedPath.length > 0 && !isValidPath(grid, selectedPath)) {
      return 'invalid';
    }
    
    switch (wordValidationStatus) {
      case 'valid': return 'valid';
      case 'invalid': return 'invalid';
      case 'checking': return 'checking';
      case 'already-found': return 'already-found';
      default: return '';
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '20px'
    }}>
      {/* Remove the word display completely - it's handled in GameView now */}
      
      <div 
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '12px',
          padding: '24px',
          background: '#9BBB0F', // Light green background
          border: '4px solid #0F380F', // Dark green border
          borderRadius: '0',
          position: 'relative',
          touchAction: 'none',
          userSelect: 'none'
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseUp={handleMouseUp}
      >
        {grid.map((row, rowIndex) =>
          row.map((letter, colIndex) => {
            const isSelected = isCellSelected(rowIndex, colIndex);
            const isInPath = isCellInPath(rowIndex, colIndex);
            const selectionOrder = getCellSelectionOrder(rowIndex, colIndex);
            const letterStyle = getLetterStyle(rowIndex, colIndex, letter);
            
            return (
              <div
                key={`${rowIndex}-${colIndex}`}
                data-row={rowIndex}
                data-col={colIndex}
                style={{
                  ...letterStyle,
                  width: '80px',
                  height: '80px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '36px',
                  fontWeight: 'bold',
                  fontFamily: "'Courier New', 'Monaco', 'Menlo', monospace",
                  cursor: 'pointer',
                  userSelect: 'none',
                  textTransform: 'uppercase',
                  position: 'relative',
                }}
                onMouseDown={() => handleMouseDown(rowIndex, colIndex)}
                onMouseEnter={() => handleMouseEnter(rowIndex, colIndex)}
                onTouchStart={(e) => {
                  e.stopPropagation();
                  handleMouseDown(rowIndex, colIndex);
                }}
              >
                {letter}
                {selectionOrder > 0 && (
                  <div style={{
                    position: 'absolute',
                    top: '4px',
                    right: '4px',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    color: '#9BBB0F', // Light green text
                    background: '#0F380F', // Dark green background
                    borderRadius: '50%',
                    width: '20px',
                    height: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '2px solid #9BBB0F' // Light green border
                  }}>
                    {selectionOrder}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Remove all buttons and extra UI elements - keep it clean like the screenshot */}
    </div>
  );
} 