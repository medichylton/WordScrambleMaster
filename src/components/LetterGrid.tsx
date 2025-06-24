import React, { useState, useEffect } from 'react';
import { generateBoggleGrid, isValidWordSync, isValidWord, calculateWordScore, isValidPath, pathToWord, areAdjacent, getWordDefinition } from '../utils/wordDictionary';
import { useGame } from '../hooks/useGame';

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
    const newGrid = generateBoggleGrid();
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
  }, [hasGoldenLetters]);

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

  // Enhanced score calculation with power-ups
  const calculateEnhancedScore = (word: string): number => {
    const timeBonus = timeRemaining > 60 ? 1.5 : timeRemaining > 30 ? 1.2 : 1.0;
    let baseScore = calculateWordScore(word, timeBonus);
    
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
    
    // Flat Game Boy styling - no gradients or shadows
    let background = 'var(--color-bg)';
    let color = 'var(--color-text)';
    let border = '3px solid var(--color-text)';
    
    if (isSelected) {
      background = 'var(--color-text)';
      color = 'var(--color-bg)';
      border = '3px solid var(--color-text)';
    } else if (isInPath) {
      background = 'var(--color-accent)';
      color = 'var(--color-bg)';
      border = '3px solid var(--color-text)';
    } else if (isGolden || isVowelWithPower) {
      // Special letters get accent background
      background = 'var(--color-accent)';
      color = 'var(--color-text)';
      border = '4px solid var(--color-text)'; // Thicker border for special letters
    }
    
    return {
      background,
      color,
      border,
      fontWeight: (isGolden || isVowelWithPower) ? 'bold' : 'normal'
    };
  };

  const getCellFromPoint = (clientX: number, clientY: number): Position | null => {
    const element = document.elementFromPoint(clientX, clientY);
    if (element && element.hasAttribute('data-row') && element.hasAttribute('data-col')) {
      const row = parseInt(element.getAttribute('data-row') || '0');
      const col = parseInt(element.getAttribute('data-col') || '0');
      return { row, col };
    }
    return null;
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    const cell = getCellFromPoint(touch.clientX, touch.clientY);
    if (cell) {
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
    if (!isSelecting) return;
    
    const touch = e.touches[0];
    const cell = getCellFromPoint(touch.clientX, touch.clientY);
    if (!cell) return;

    const existingIndex = selectedPath.findIndex(pos => pos.row === cell.row && pos.col === cell.col);
    
    if (existingIndex !== -1) {
      // Backtrack to this position
      setSelectedPath(selectedPath.slice(0, existingIndex + 1));
    } else if (selectedPath.length > 0) {
      const lastPos = selectedPath[selectedPath.length - 1];
      // Use enhanced adjacency checking
      if (areAdjacent(lastPos, cell)) {
        setSelectedPath([...selectedPath, cell]);
        
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
    
    setIsSelecting(false);
    await processWordSubmission();
    setSelectedPath([]);
  };

  const handleMouseDown = (row: number, col: number) => {
    setIsSelecting(true);
    setSelectedPath([{ row, col }]);
  };

  const handleMouseEnter = (row: number, col: number) => {
    if (!isSelecting) return;
    
    const cell = { row, col };
    const existingIndex = selectedPath.findIndex(pos => pos.row === row && pos.col === col);
    
    if (existingIndex !== -1) {
      // Backtrack to this position
      setSelectedPath(selectedPath.slice(0, existingIndex + 1));
    } else if (selectedPath.length > 0) {
      const lastPos = selectedPath[selectedPath.length - 1];
      // Use enhanced adjacency checking
      if (areAdjacent(lastPos, cell)) {
        setSelectedPath([...selectedPath, cell]);
      }
    }
  };

  const handleMouseUp = async () => {
    if (!isSelecting) return;
    
    setIsSelecting(false);
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
      {!hideWordDisplay && (
        <div style={{
          fontSize: '24px',
          fontWeight: 'bold',
          fontFamily: "'Courier New', 'Monaco', 'Menlo', monospace",
          textTransform: 'uppercase',
          minHeight: '24px',
          textAlign: 'center',
          padding: '12px 20px',
          background: 'var(--color-accent)',
          color: 'var(--color-bg)',
          border: '3px solid var(--color-text)'
        }}>
          {currentWord || 'SELECT LETTERS'}
          {wordValidationStatus === 'checking' && (
            <span style={{ marginLeft: '8px', fontSize: '16px' }}>[?]</span>
          )}
          {selectedPath.length > 0 && !isValidPath(grid, selectedPath) && (
            <span style={{ marginLeft: '8px', fontSize: '16px' }}>[X]</span>
          )}
        </div>
      )}
      
      <div 
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '8px',
          padding: '20px',
          background: 'var(--color-bg)',
          border: '4px solid var(--color-text)'
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
                  width: '70px',
                  height: '70px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '32px',
                  fontWeight: 'bold',
                  fontFamily: "'Courier New', 'Monaco', 'Menlo', monospace",
                  cursor: 'pointer',
                  userSelect: 'none',
                  textTransform: 'uppercase',
                  position: 'relative'
                }}
                onMouseDown={() => handleMouseDown(rowIndex, colIndex)}
                onMouseEnter={() => handleMouseEnter(rowIndex, colIndex)}
              >
                {letter}
                {selectionOrder > 0 && (
                  <div style={{
                    position: 'absolute',
                    top: '2px',
                    right: '2px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    color: 'var(--color-bg)',
                    background: 'var(--color-text)',
                    borderRadius: '50%',
                    width: '16px',
                    height: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {selectionOrder}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      <div style={{
        display: 'flex',
        gap: '12px',
        justifyContent: 'center',
        marginTop: '20px'
      }}>
        <button 
          onClick={submitWord} 
          className="gb-button"
          disabled={currentWord.length < 2 || allFoundWords.includes(currentWord) || wordValidationStatus === 'invalid' || (selectedPath.length > 0 && !isValidPath(grid, selectedPath))}
          style={{
            fontSize: '16px',
            padding: '12px 20px',
            background: (currentWord.length >= 2 && !allFoundWords.includes(currentWord) && wordValidationStatus !== 'invalid') ? 'var(--color-text)' : 'var(--color-accent)',
            color: (currentWord.length >= 2 && !allFoundWords.includes(currentWord) && wordValidationStatus !== 'invalid') ? 'var(--color-bg)' : 'var(--color-text)',
            border: '3px solid var(--color-text)',
            fontFamily: "'Courier New', 'Monaco', 'Menlo', monospace",
            fontWeight: 'bold',
            textTransform: 'uppercase',
            cursor: 'pointer',
            opacity: (currentWord.length >= 2 && !allFoundWords.includes(currentWord) && wordValidationStatus !== 'invalid') ? 1 : 0.5
          }}
        >
          SUBMIT
        </button>
        <button 
          onClick={clearSelection} 
          className="gb-button"
          style={{
            fontSize: '16px',
            padding: '12px 20px',
            background: 'var(--color-bg)',
            color: 'var(--color-text)',
            border: '3px solid var(--color-text)',
            fontFamily: "'Courier New', 'Monaco', 'Menlo', monospace",
            fontWeight: 'bold',
            textTransform: 'uppercase',
            cursor: 'pointer'
          }}
        >
          CLEAR
        </button>
        <button 
          onClick={shuffleGrid} 
          className="gb-button"
          style={{
            fontSize: '16px',
            padding: '12px 20px',
            background: 'var(--color-bg)',
            color: 'var(--color-text)',
            border: '3px solid var(--color-text)',
            fontFamily: "'Courier New', 'Monaco', 'Menlo', monospace",
            fontWeight: 'bold',
            textTransform: 'uppercase',
            cursor: 'pointer'
          }}
        >
          SHUFFLE
        </button>
      </div>

      {/* Move History Debug (can be removed in production) */}
      {process.env.NODE_ENV === 'development' && moveHistory.length > 0 && (
        <div style={{ 
          position: 'fixed', 
          top: '10px', 
          right: '10px', 
          background: 'rgba(0,0,0,0.8)', 
          color: 'white', 
          padding: '10px', 
          fontSize: '10px',
          maxWidth: '200px',
          maxHeight: '200px',
          overflow: 'auto'
        }}>
          <strong>Move History:</strong>
          {moveHistory.slice(-5).map((move, i) => (
            <div key={i}>
              {move.word} - {move.score}pts
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 