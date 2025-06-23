import { GameState, GameAction } from '../types/game';

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'START_GAME':
      const newGameState = {
        ...state,
        gamePhase: 'selectingChallenge' as const,
        currentRound: 1,
        totalScore: 0,
        coins: 10,
        powerUps: [],
        currentChallenge: null,
        isGameActive: true,
        gameStarted: true,
        difficulty: (action.payload?.stake || 'apprentice') as any,
        difficultyStake: (action.payload?.stake || 'apprentice') as any
      };
      
      // Save to localStorage
      localStorage.setItem('wordScrambleGameState', JSON.stringify(newGameState));
      return newGameState;

    case 'LOAD_GAME':
      // Load game state from payload
      return {
        ...action.payload,
        gameStarted: true,
        isGameActive: true
      };

    case 'SELECT_CHALLENGE':
      const challengeState = {
        ...state,
        currentChallenge: action.payload.challenge || action.payload,
        gamePhase: 'playingChallenge' as const
      };
      
      // Save to localStorage
      localStorage.setItem('wordScrambleGameState', JSON.stringify(challengeState));
      return challengeState;

    case 'COMPLETE_CHALLENGE':
      const { score, coins } = action.payload;
      const completedState = {
        ...state,
        totalScore: state.totalScore + score,
        coins: state.coins + coins,
        gamePhase: 'shopping' as const
      };
      
      // Save to localStorage
      localStorage.setItem('wordScrambleGameState', JSON.stringify(completedState));
      return completedState;

    case 'PURCHASE_POWERUP':
      const powerUp = action.payload;
      if (state.coins < powerUp.cost) return state;
      
      const powerUpState = {
        ...state,
        coins: state.coins - powerUp.cost,
        powerUps: [...state.powerUps, powerUp]
      };
      
      // Save to localStorage
      localStorage.setItem('wordScrambleGameState', JSON.stringify(powerUpState));
      return powerUpState;

    case 'NEXT_ROUND':
      const nextRound = state.currentRound + 1;
      let nextRoundState;
      
      if (nextRound > state.totalRounds) {
        nextRoundState = {
          ...state,
          gamePhase: 'victory' as const
        };
      } else {
        nextRoundState = {
          ...state,
          currentRound: nextRound,
          gamePhase: 'selectingChallenge' as const
        };
      }
      
      // Save to localStorage
      localStorage.setItem('wordScrambleGameState', JSON.stringify(nextRoundState));
      return nextRoundState;

    case 'GAME_OVER':
      const gameOverState = {
        ...state,
        gamePhase: 'gameOver' as const,
        isGameActive: false
      };
      
      // Clear saved game on game over
      localStorage.removeItem('wordScrambleGameState');
      return gameOverState;

    case 'RESET_GAME':
      const resetState = {
        currentRound: 1,
        totalRounds: 8,
        gamePhase: 'menu' as const,
        totalScore: 0,
        coins: 10,
        powerUps: [],
        currentChallenge: null,
        isGameActive: false,
        difficulty: 'apprentice' as any,
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
        isGameWon: false,
        isGameLost: false,
        difficultyStake: 'apprentice' as any,
        gameStarted: false
      };
      
      // Clear saved game
      localStorage.removeItem('wordScrambleGameState');
      return resetState;

    case 'SET_DIFFICULTY':
      return {
        ...state,
        difficulty: action.payload
      };

    case 'SUBMIT_WORD':
      // Handle word submission logic here
      return state;

    case 'SKIP_CHALLENGE':
      // Handle challenge skipping logic here
      const skipState = {
        ...state,
        gamePhase: 'shopping' as const
      };
      
      // Save to localStorage
      localStorage.setItem('wordScrambleGameState', JSON.stringify(skipState));
      return skipState;

    case 'PURCHASE_ITEM':
      const item = action.payload.item;
      if (state.coins < item.cost) return state;
      
      const itemState = {
        ...state,
        coins: state.coins - item.cost
      };
      
      // Save to localStorage
      localStorage.setItem('wordScrambleGameState', JSON.stringify(itemState));
      return itemState;

    case 'LEAVE_SHOP':
      const shopState = {
        ...state,
        gamePhase: 'selectingChallenge' as const
      };
      
      // Save to localStorage
      localStorage.setItem('wordScrambleGameState', JSON.stringify(shopState));
      return shopState;

    case 'USE_CONSUMABLE':
      // Handle consumable usage logic here
      return state;

    default:
      return state;
  }
} 