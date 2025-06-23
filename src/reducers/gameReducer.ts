import { GameState, GameAction } from '../types/game';

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'START_GAME':
      return {
        ...state,
        gamePhase: 'selectingChallenge',
        currentRound: 1,
        totalScore: 0,
        coins: 10,
        powerUps: [],
        currentChallenge: null,
        isGameActive: true,
        gameStarted: true,
        difficulty: action.payload.stake,
        difficultyStake: action.payload.stake
      };

    case 'SELECT_CHALLENGE':
      return {
        ...state,
        currentChallenge: action.payload.challenge,
        gamePhase: 'playingChallenge'
      };

    case 'COMPLETE_CHALLENGE':
      const { score, coins } = action.payload;
      return {
        ...state,
        totalScore: state.totalScore + score,
        coins: state.coins + coins,
        gamePhase: 'shopping'
      };

    case 'PURCHASE_POWERUP':
      const powerUp = action.payload;
      if (state.coins < powerUp.cost) return state;
      
      return {
        ...state,
        coins: state.coins - powerUp.cost,
        powerUps: [...state.powerUps, powerUp]
      };

    case 'NEXT_ROUND':
      const nextRound = state.currentRound + 1;
      if (nextRound > state.totalRounds) {
        return {
          ...state,
          gamePhase: 'victory'
        };
      }
      
      return {
        ...state,
        currentRound: nextRound,
        gamePhase: 'selectingChallenge'
      };

    case 'GAME_OVER':
      return {
        ...state,
        gamePhase: 'gameOver',
        isGameActive: false
      };

    case 'RESET_GAME':
      return {
        currentRound: 1,
        totalRounds: 8,
        gamePhase: 'menu',
        totalScore: 0,
        coins: 10,
        powerUps: [],
        currentChallenge: null,
        isGameActive: false,
        difficulty: 'apprentice',
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
        difficultyStake: 'apprentice',
        gameStarted: false
      };

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
      return {
        ...state,
        gamePhase: 'shopping'
      };

    case 'PURCHASE_ITEM':
      const item = action.payload.item;
      if (state.coins < item.cost) return state;
      
      return {
        ...state,
        coins: state.coins - item.cost
      };

    case 'LEAVE_SHOP':
      return {
        ...state,
        gamePhase: 'selectingChallenge'
      };

    case 'USE_CONSUMABLE':
      // Handle consumable usage logic here
      return state;

    default:
      return state;
  }
} 