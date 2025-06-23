import React, { useState, useEffect } from 'react';
import { generateBoggleGrid, isValidWord, calculateWordScore, isValidPath, pathToWord } from '../utils/wordDictionary';

interface Position {
  row: number;
  col: number;
}

interface LetterGridProps {
  onWordFound: (word: string, score: number) => void;
  onScoreUpdate: (score: number) => void;
  timeRemaining: number;
}

export function LetterGrid({ onWordFound, onScoreUpdate, timeRemaining }: LetterGridProps) {
  const [grid, setGrid] = useState<string[][]>([]);
  const [selectedPath, setSelectedPath] = useState<Position[]>([]);
  const [currentWord, setCurrentWord] = useState('');
  const [foundWords, setFoundWords] = useState<string[]>([]);
  const [isSelecting, setIsSelecting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    // Generate new grid when component mounts
    setGrid(generateBoggleGrid());
  }, []);

  useEffect(() => {
    // Update current word when path changes
    if (selectedPath.length > 0) {
      const word = pathToWord(grid, selectedPath);
      setCurrentWord(word);
    } else {
      setCurrentWord('');
    }
  }, [selectedPath, grid]);

  const handleStart = (row: number, col: number) => {
    setIsDragging(true);
    setIsSelecting(true);
    setSelectedPath([{ row, col }]);
  };

  const handleMove = (row: number, col: number) => {
    if (!isDragging || !isSelecting) return;
    
    const newPosition = { row, col };
    
    // Check if already selected
    const existingIndex = selectedPath.findIndex(pos => pos.row === row && pos.col === col);
    
    if (existingIndex !== -1) {
      // Backtrack to this position
      setSelectedPath(selectedPath.slice(0, existingIndex + 1));
      return;
    }

    // Check if adjacent to last selected
    if (selectedPath.length > 0) {
      const lastPos = selectedPath[selectedPath.length - 1];
      const rowDiff = Math.abs(newPosition.row - lastPos.row);
      const colDiff = Math.abs(newPosition.col - lastPos.col);
      
      if (rowDiff <= 1 && colDiff <= 1 && !(rowDiff === 0 && colDiff === 0)) {
        setSelectedPath([...selectedPath, newPosition]);
      }
    }
  };

  const handleEnd = () => {
    if (!isDragging) return;
    
    setIsDragging(false);
    setIsSelecting(false);
    
    // Auto-submit word if valid
    if (currentWord.length >= 3 && isValidWord(currentWord) && !foundWords.includes(currentWord)) {
      const timeBonus = timeRemaining > 60 ? 1.5 : timeRemaining > 30 ? 1.2 : 1.0;
      const score = calculateWordScore(currentWord, timeBonus);
      
      setFoundWords([...foundWords, currentWord]);
      onWordFound(currentWord, score);
      onScoreUpdate(score);
    }
    
    // Clear selection
    setSelectedPath([]);
    setCurrentWord('');
  };

  const getCellFromEvent = (e: React.TouchEvent | React.MouseEvent): Position | null => {
    const touch = 'touches' in e ? e.touches[0] : e;
    const element = document.elementFromPoint(touch.clientX, touch.clientY);
    
    if (element && element.classList.contains('letter-cell')) {
      const row = parseInt(element.getAttribute('data-row') || '0');
      const col = parseInt(element.getAttribute('data-col') || '0');
      return { row, col };
    }
    
    return null;
  };

  const clearSelection = () => {
    setSelectedPath([]);
    setCurrentWord('');
    setIsSelecting(false);
    setIsDragging(false);
  };

  const isCellSelected = (row: number, col: number): boolean => {
    return selectedPath.some(pos => pos.row === row && pos.col === col);
  };

  const getCellSelectionOrder = (row: number, col: number): number => {
    const index = selectedPath.findIndex(pos => pos.row === row && pos.col === col);
    return index !== -1 ? index + 1 : 0;
  };

  const shuffleGrid = () => {
    setGrid(generateBoggleGrid());
    setFoundWords([]);
    clearSelection();
  };

  return (
    <div className="space-y-4">
      {/* Current Word Display */}
      <div className="text-center">
        <div className="text-lg md:text-2xl font-bold text-white mb-2">
          {currentWord || 'SELECT LETTERS TO FORM WORDS'}
        </div>
        <div className="text-sm text-gray-300">
          {currentWord.length >= 3 ? (
            isValidWord(currentWord) ? (
              foundWords.includes(currentWord) ? (
                <span className="text-yellow-400">ALREADY FOUND!</span>
              ) : (
                <span className="text-green-400">✓ VALID WORD! RELEASE TO SUBMIT</span>
              )
            ) : (
              <span className="text-red-400">✗ NOT A VALID WORD</span>
            )
          ) : (
            isDragging ? 'KEEP SWIPING...' : 'SWIPE THROUGH LETTERS TO FORM WORDS'
          )}
        </div>
      </div>

      {/* Letter Grid */}
      <div 
        className="letter-grid"
        onMouseLeave={handleEnd}
        onTouchEnd={handleEnd}
        onTouchCancel={handleEnd}
      >
        {grid.map((row, rowIndex) =>
          row.map((letter, colIndex) => {
            const isSelected = isCellSelected(rowIndex, colIndex);
            const selectionOrder = getCellSelectionOrder(rowIndex, colIndex);
            
            return (
              <div
                key={`${rowIndex}-${colIndex}`}
                className={`letter-cell ${isSelected ? 'selected' : ''}`}
                data-row={rowIndex}
                data-col={colIndex}
                onMouseDown={() => handleStart(rowIndex, colIndex)}
                onMouseEnter={() => handleMove(rowIndex, colIndex)}
                onMouseUp={handleEnd}
                onTouchStart={(e) => {
                  e.preventDefault();
                  handleStart(rowIndex, colIndex);
                }}
                onTouchMove={(e) => {
                  e.preventDefault();
                  const pos = getCellFromEvent(e);
                  if (pos) handleMove(pos.row, pos.col);
                }}
              >
                {letter}
                {isSelected && selectionOrder > 0 && (
                  <div className="selection-order">
                    {selectionOrder}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Controls */}
      <div className="flex justify-center gap-4">
        <button 
          onClick={shuffleGrid}
          className="btn btn-primary"
        >
          NEW GRID
        </button>
      </div>

      {/* Found Words */}
      {foundWords.length > 0 && (
        <div className="card">
          <h4 className="text-lg font-bold mb-2">WORDS FOUND ({foundWords.length})</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {foundWords.map((word, index) => (
              <div key={index} className="word-found text-center p-2 bg-gray-700 border border-green-400">
                {word.toUpperCase()}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 