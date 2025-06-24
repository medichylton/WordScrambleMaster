import { GameState, GameAction, InventoryItem } from '../types/game';

// Helper function to calculate level target score based on progression
function calculateLevelTargetScore(level: number, difficulty: string): number {
  const baseScore = 30;
  const difficultyMultiplier = {
    'apprentice': 1,
    'scholar': 1.3,
    'expert': 1.6,
    'master': 2.0,
    'grandmaster': 2.5
  }[difficulty] || 1;
  
  // Exponential scaling: each level increases by ~15%
  return Math.floor(baseScore * Math.pow(1.15, level - 1) * difficultyMultiplier);
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'START_GAME':
      const newGameState = {
        ...state,
        gamePhase: 'selectingChallenge' as const,
        currentRound: 1,
        currentLevel: 1,
        totalScore: 0,
        coins: 15,
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

    case 'START_NEW_RUN':
      const stake = action.payload.stake;
      const newRunState = {
        ...state,
        currentRun: state.currentRun + 1,
        currentLevel: 1,
        totalScore: 0,
        coins: 15,
        runStartTime: Date.now(),
        gamePhase: 'selectingChallenge' as const,
        currentChallenge: null,
        isGameActive: true,
        gameStarted: true,
        difficulty: stake,
        difficultyStake: stake,
        // Keep inventory persistent across runs
        powerUps: state.inventory.map(item => ({
          ...item,
          cost: item.sellValue // For compatibility
        }))
      };
      
      localStorage.setItem('wordScrambleGameState', JSON.stringify(newRunState));
      return newRunState;

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
        lifetimeCoins: state.lifetimeCoins + coins,
        gamePhase: 'shopping' as const
      };
      
      // Save to localStorage
      localStorage.setItem('wordScrambleGameState', JSON.stringify(completedState));
      return completedState;

    case 'COMPLETE_LEVEL':
      const levelReward = action.payload;
      const nextLevel = state.currentLevel + 1;
      
      if (nextLevel > state.maxLevel) {
        // Run completed!
        const runCompleteState = {
          ...state,
          totalScore: state.totalScore + levelReward.score,
          coins: state.coins + levelReward.coins,
          lifetimeCoins: state.lifetimeCoins + levelReward.coins,
          gamePhase: 'runComplete' as const
        };
        localStorage.setItem('wordScrambleGameState', JSON.stringify(runCompleteState));
        return runCompleteState;
      } else {
        // Next level
        const nextLevelState = {
          ...state,
          currentLevel: nextLevel,
          totalScore: state.totalScore + levelReward.score,
          coins: state.coins + levelReward.coins,
          lifetimeCoins: state.lifetimeCoins + levelReward.coins,
          gamePhase: 'shopping' as const
        };
        localStorage.setItem('wordScrambleGameState', JSON.stringify(nextLevelState));
        return nextLevelState;
      }

    case 'NEXT_LEVEL':
      const levelUpState = {
        ...state,
        gamePhase: 'selectingChallenge' as const
      };
      localStorage.setItem('wordScrambleGameState', JSON.stringify(levelUpState));
      return levelUpState;

    case 'COMPLETE_RUN':
      const runData = action.payload;
      const runCompletedState = {
        ...state,
        gamePhase: 'runSelection' as const,
        isGameActive: false
      };
      localStorage.setItem('wordScrambleGameState', JSON.stringify(runCompletedState));
      return runCompletedState;

    case 'PURCHASE_INVENTORY_ITEM':
      const inventoryItem = action.payload.item;
      if (state.coins < inventoryItem.cost) return state;
      
      // Check if item already exists in inventory (stackable)
      const existingItemIndex = state.inventory.findIndex(item => item.id === inventoryItem.id);
      
      let newInventory;
      if (existingItemIndex >= 0) {
        // Stack the item
        newInventory = [...state.inventory];
        newInventory[existingItemIndex] = {
          ...newInventory[existingItemIndex],
          stackCount: newInventory[existingItemIndex].stackCount + 1
        };
      } else {
        // Add new item
        newInventory = [...state.inventory, { ...inventoryItem, purchaseLevel: state.currentLevel, timesUsed: 0, stackCount: 1 }];
      }
      
      const purchaseState = {
        ...state,
        coins: state.coins - inventoryItem.cost,
        inventory: newInventory,
        // Also update powerUps for compatibility
        powerUps: newInventory.map(item => ({ ...item, cost: item.sellValue }))
      };
      
      localStorage.setItem('wordScrambleGameState', JSON.stringify(purchaseState));
      return purchaseState;

    case 'SELL_INVENTORY_ITEM':
      const itemId = action.payload.itemId;
      const itemToSell = state.inventory.find(item => item.id === itemId);
      
      if (!itemToSell) return state;
      
      let updatedInventory;
      if (itemToSell.stackCount > 1) {
        // Reduce stack count
        updatedInventory = state.inventory.map(item => 
          item.id === itemId 
            ? { ...item, stackCount: item.stackCount - 1 }
            : item
        );
      } else {
        // Remove item completely
        updatedInventory = state.inventory.filter(item => item.id !== itemId);
      }
      
      const sellState = {
        ...state,
        coins: state.coins + itemToSell.sellValue,
        inventory: updatedInventory,
        powerUps: updatedInventory.map(item => ({ ...item, cost: item.sellValue }))
      };
      
      localStorage.setItem('wordScrambleGameState', JSON.stringify(sellState));
      return sellState;

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

    case 'SPEND_COINS':
      const amount = action.payload;
      if (state.coins < amount) return state;
      
      const spendState = {
        ...state,
        coins: state.coins - amount
      };
      
      // Save to localStorage
      localStorage.setItem('wordScrambleGameState', JSON.stringify(spendState));
      return spendState;

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
        // Roguelike Run Progression
        currentRun: 1,
        currentLevel: 1,
        maxLevel: 15,
        runStartTime: Date.now(),
        
        // Persistent Inventory (reset on full game reset)
        inventory: [],
        coins: 15,
        totalScore: 0,
        lifetimeCoins: 0,
        
        // Current Challenge State
        currentChallenge: null,
        challengeProgress: {
          currentScore: 0,
          wordsFound: [],
          timeRemaining: 0,
          wordsRemaining: 0,
          isCompleted: false,
          bonusMultiplier: 1.0,
          streakCount: 0
        },
        
        // Game State Management
        gamePhase: 'menu' as const,
        isGameWon: false,
        isGameLost: false,
        difficultyStake: 'apprentice' as any,
        gameStarted: false,
        isGameActive: false,
        
        // Legacy Compatibility
        currentRound: 1,
        letterEnhancers: [],
        wordMultipliers: [],
        consumableBoosts: [],
        totalRounds: 15,
        powerUps: [],
        difficulty: 'apprentice' as any
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