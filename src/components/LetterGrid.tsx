import React, { useState, useEffect } from 'react';
import { generateBoggleGrid, isValidWordSync, isValidWord, calculateWordScore, isValidPath, pathToWord, areAdjacent, getWordDefinition } from '../utils/wordDictionary';

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
  const [grid, setGrid] = useState<string[][]>([]);
  const [selectedPath, setSelectedPath] = useState<Position[]>([]);
  const [currentWord, setCurrentWord] = useState('');
  const [localFoundWords, setLocalFoundWords] = useState<string[]>([]);
  const [isSelecting, setIsSelecting] = useState(false);
  const [wordValidationStatus, setWordValidationStatus] = useState<'checking' | 'valid' | 'invalid' | 'unknown' | 'already-found'>('unknown');
  const [moveHistory, setMoveHistory] = useState<{word: string, path: Position[], score: number, timestamp: number}[]>([]);

  // Use foundWords prop if provided, otherwise use local state
  const allFoundWords = foundWords.length > 0 ? foundWords : localFoundWords;

  useEffect(() => {
    setGrid(generateBoggleGrid());
  }, []);

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
      
      if (word.length >= 3) {
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

  const getCellFromPoint = (clientX: number, clientY: number): Position | null => {
    const element = document.elementFromPoint(clientX, clientY);
    if (element && element.classList.contains('letter-cell')) {
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
    if (currentWord.length >= 3 && !allFoundWords.includes(currentWord)) {
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
        const timeBonus = timeRemaining > 60 ? 1.5 : timeRemaining > 30 ? 1.2 : 1.0;
        const score = calculateWordScore(currentWord, timeBonus);
        
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
    if (currentWord.length >= 3 && !allFoundWords.includes(currentWord)) {
      await processWordSubmission();
    }
    
    setSelectedPath([]);
    setCurrentWord('');
    setWordValidationStatus('unknown');
  };

  const getWordValidationClass = () => {
    if (currentWord.length < 3) return '';
    
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
    <div className="letter-grid-container">
      {!hideWordDisplay && (
        <div className={`current-word ${getWordValidationClass()}`}>
          {currentWord || 'Swipe to form words...'}
          {wordValidationStatus === 'checking' && (
            <span style={{ marginLeft: '8px', fontSize: '8px' }}>⏳</span>
          )}
          {selectedPath.length > 0 && !isValidPath(grid, selectedPath) && (
            <span style={{ marginLeft: '8px', fontSize: '8px', color: 'var(--pyxel-red)' }}>❌</span>
          )}
        </div>
      )}
      
      <div 
        className="letter-grid"
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
            
            return (
              <div
                key={`${rowIndex}-${colIndex}`}
                className={`letter-cell ${isSelected ? 'selected' : ''} ${isInPath ? 'path' : ''}`}
                data-row={rowIndex}
                data-col={colIndex}
                onMouseDown={() => handleMouseDown(rowIndex, colIndex)}
                onMouseEnter={() => handleMouseEnter(rowIndex, colIndex)}
              >
                {letter}
                {selectionOrder > 0 && (
                  <div className="selection-order">
                    {selectionOrder}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      <div className="action-buttons">
        <button 
          onClick={submitWord} 
          className="action-button"
          disabled={currentWord.length < 3 || allFoundWords.includes(currentWord) || wordValidationStatus === 'invalid' || (selectedPath.length > 0 && !isValidPath(grid, selectedPath))}
        >
          SUBMIT
        </button>
        <button onClick={clearSelection} className="action-button">
          CLEAR
        </button>
        <button onClick={shuffleGrid} className="action-button">
          SHUFFLE
        </button>
      </div>

      {allFoundWords.length > 0 && (
        <div className="found-words">
          <div style={{ 
            color: 'var(--pyxel-yellow)', 
            fontSize: 'clamp(8px, 2vw, 10px)', 
            marginBottom: '8px',
            textAlign: 'center',
            fontWeight: 'bold'
          }}>
            FOUND WORDS ({allFoundWords.length})
          </div>
          {allFoundWords.map((word, index) => (
            <div key={index} className="word-item">
              <span>{word.toUpperCase()}</span>
              <span style={{ color: 'var(--pyxel-yellow)' }}>
                {calculateWordScore(word, 1)}pts
              </span>
            </div>
          ))}
        </div>
      )}

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