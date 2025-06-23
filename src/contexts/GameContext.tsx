import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { GameState, GamePhase, DifficultyStake, Challenge, LetterEnhancer, WordMultiplier, ConsumableBoost, ShopItem, GameAction } from '../types/game';
import { gameReducer } from '../reducers/gameReducer';

const initialGameState: GameState = {
  currentRound: 1,
  coins: 10,
  totalScore: 0,
  currentChallenge: null,
  letterEnhancers: [],
  wordMultipliers: [],
  consumableBoosts: [],
  challengeProgress: {
    currentScore: 0,
    wordsFound: [],
    timeRemaining: 0,
    wordsRemaining: 0,
    isCompleted: false,
    bonusMultiplier: 1.0,
    streakCount: 0
  },
  gamePhase: 'menu',
  isGameWon: false,
  isGameLost: false,
  totalRounds: 8,
  difficultyStake: 'apprentice',
  gameStarted: false,
  powerUps: [],
  isGameActive: false,
  difficulty: 'apprentice'
};

interface GameContextType {
  gameState: GameState;
  dispatch: React.Dispatch<GameAction>;
  // Helper functions
  startGame: (stake: DifficultyStake) => void;
  selectChallenge: (challenge: Challenge) => void;
  submitWord: (word: string, positions: number[], timeTaken: number) => void;
  skipChallenge: (challenge: Challenge) => void;
  purchaseItem: (item: ShopItem) => boolean;
  leaveShop: () => void;
  useConsumable: (boost: ConsumableBoost) => void;
  resetGame: () => void;
}

export const GameContext = createContext<GameContextType | undefined>(undefined);

interface GameProviderProps {
  children: ReactNode;
}

export function GameProvider({ children }: GameProviderProps) {
  const [gameState, dispatch] = useReducer(gameReducer, initialGameState);

  const startGame = (stake: DifficultyStake) => {
    dispatch({ type: 'START_GAME', payload: { stake } });
  };

  const selectChallenge = (challenge: Challenge) => {
    dispatch({ type: 'SELECT_CHALLENGE', payload: { challenge } });
  };

  const submitWord = (word: string, positions: number[], timeTaken: number) => {
    dispatch({ type: 'SUBMIT_WORD', payload: { word, positions, timeTaken } });
  };

  const skipChallenge = (challenge: Challenge) => {
    dispatch({ type: 'SKIP_CHALLENGE', payload: { challenge } });
  };

  const purchaseItem = (item: ShopItem): boolean => {
    if (gameState.coins >= item.cost) {
      dispatch({ type: 'PURCHASE_ITEM', payload: { item } });
      return true;
    }
    return false;
  };

  const leaveShop = () => {
    dispatch({ type: 'LEAVE_SHOP' });
  };

  const useConsumable = (boost: ConsumableBoost) => {
    dispatch({ type: 'USE_CONSUMABLE', payload: { boost } });
  };

  const resetGame = () => {
    dispatch({ type: 'RESET_GAME' });
  };

  const value: GameContextType = {
    gameState,
    dispatch,
    startGame,
    selectChallenge,
    submitWord,
    skipChallenge,
    purchaseItem,
    leaveShop,
    useConsumable,
    resetGame
  };

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
} 