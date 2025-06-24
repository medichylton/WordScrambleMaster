export interface GameState {
  // Roguelike Run Progression
  currentRun: number;
  currentLevel: number;
  maxLevel: number;
  runStartTime: number;
  
  // Persistent Inventory
  inventory: InventoryItem[];
  activePerks: PerkEffect[];
  coins: number;
  totalScore: number;
  lifetimeCoins: number;
  
  // Current Challenge State
  currentChallenge: Challenge | null;
  challengeProgress: ChallengeProgress;
  
  // Game State Management
  gamePhase: GamePhase;
  isGameWon: boolean;
  isGameLost: boolean;
  difficultyStake: DifficultyStake;
  gameStarted: boolean;
  isGameActive: boolean;
  
  // Legacy Compatibility
  currentRound: number;
  letterEnhancers: LetterEnhancer[];
  wordMultipliers: WordMultiplier[];
  consumableBoosts: ConsumableBoost[];
  totalRounds: number;
  powerUps: PowerUp[];
  difficulty: DifficultyStake;
}

export type GamePhase = 
  | 'menu'
  | 'selectingChallenge' 
  | 'playingChallenge' 
  | 'shopping' 
  | 'gameOver' 
  | 'victory'
  | 'runComplete'
  | 'runSelection';

export interface InventoryItem {
  id: string;
  name: string;
  description: string;
  rarity: Rarity;
  cost: number;
  sellValue: number;
  effect: ItemEffect;
  emoji: string;
  purchaseLevel: number;
  timesUsed: number;
  stackCount: number;
}

export type ItemEffect = 
  | { type: 'letterMultiplier'; value: number }
  | { type: 'vowelBonus'; value: number }
  | { type: 'chainMultiplier'; value: number }
  | { type: 'longWordMultiplier'; minLength: number; multiplier: number }
  | { type: 'goldenLetters'; count: number }
  | { type: 'wordEcho'; chance: number }
  | { type: 'exponentialGrowth'; multiplier: number }
  | { type: 'letterGod'; enabled: boolean }
  | { type: 'scoreToHealth'; ratio: number }
  | { type: 'timeExtender'; seconds: number }
  | { type: 'coinMultiplier'; value: number }
  | { type: 'extraHands'; value: number };

export type ChallengeType = 'quick' | 'standard' | 'boss';

export type DifficultyStake = 
  | 'apprentice' 
  | 'scholar' 
  | 'expert' 
  | 'master' 
  | 'grandmaster';

export type Rarity = 'common' | 'uncommon' | 'rare' | 'legendary';

export interface Challenge {
  id: string;
  type: ChallengeType;
  name: string;
  description: string;
  targetScore: number;
  maxWords: number;
  timeLimit: number | null;
  coinReward: number;
  specialRule: SpecialRule | null;
  canSkip: boolean;
}

export type SpecialRule = 
  | 'bonusForSpeed'
  | 'lockedLetters'
  | { type: 'minWordLength'; value: number }
  | 'acceleratingTime'
  | 'uncommonBonus'
  | 'reducedVowels'
  | 'consonantBonus';

export type BossChallenge = 
  | 'letterThief'
  | 'wordWeaver' 
  | 'timeWarden'
  | 'scoreScavenger'
  | 'vowelVoid'
  | 'consonantCrush';

export interface LetterEnhancer {
  id: string;
  name: string;
  description: string;
  rarity: Rarity;
  cost: number;
  effect: LetterEffect;
  artwork: string;
}

export type LetterEffect = 
  | { type: 'vowelMultiplier'; value: number }
  | { type: 'rareLetterMultiplier'; value: number }
  | { type: 'longWordMultiplier'; minLength: number; multiplier: number }
  | { type: 'goldLetter' };

export interface WordMultiplier {
  id: string;
  name: string;
  description: string;
  rarity: Rarity;
  cost: number;
  effect: WordEffect;
  artwork: string;
}

export type WordEffect = 
  | { type: 'speedBonus'; value: number }
  | { type: 'chainMultiplier'; value: number }
  | { type: 'palindromeBonus'; value: number };

export interface ConsumableBoost {
  id: string;
  name: string;
  description: string;
  cost: number;
  effect: ConsumableEffect;
  usesRemaining: number;
  artwork: string;
}

export type ConsumableEffect = 
  | { type: 'shuffleGrid' }
  | { type: 'addTime'; seconds: number }
  | { type: 'temporaryMultiplier'; multiplier: number; words: number };

export interface ChallengeProgress {
  currentScore: number;
  wordsFound: string[];
  timeRemaining: number;
  wordsRemaining: number;
  isCompleted: boolean;
  bonusMultiplier: number;
  streakCount: number;
}

export interface ShopItem {
  id: string;
  type: ShopItemType;
  cost: number;
  name: string;
  description: string;
  artwork: string;
}

export type ShopItemType = 
  | { type: 'letterEnhancer'; item: LetterEnhancer }
  | { type: 'wordMultiplier'; item: WordMultiplier }
  | { type: 'consumableBoost'; item: ConsumableBoost }
  | { type: 'extraHandSlot' }
  | { type: 'reroll' };

export type SkipTag = 
  | { type: 'coinBonus'; amount: number }
  | { type: 'extraShopSlot' }
  | { type: 'nextChallengeDiscount'; percent: number }
  | { type: 'powerUpBonus' };

export interface Position {
  row: number;
  col: number;
  index: number;
}

// Game Constants
export const DIFFICULTY_STAKES: Record<DifficultyStake, {
  name: string;
  description: string;
  scoreMultiplier: number;
  timeMultiplier: number;
}> = {
  apprentice: {
    name: 'Apprentice',
    description: 'Perfect for learning the basics',
    scoreMultiplier: 1,
    timeMultiplier: 1.0
  },
  scholar: {
    name: 'Scholar', 
    description: 'Increased challenge requirements',
    scoreMultiplier: 2,
    timeMultiplier: 0.9
  },
  expert: {
    name: 'Expert',
    description: 'Reduced time limits and harder grids',
    scoreMultiplier: 3,
    timeMultiplier: 0.8
  },
  master: {
    name: 'Master',
    description: 'Limited power-ups and higher stakes',
    scoreMultiplier: 4,
    timeMultiplier: 0.7
  },
  grandmaster: {
    name: 'Grandmaster',
    description: 'Ultimate challenge for word masters',
    scoreMultiplier: 5,
    timeMultiplier: 0.6
  }
};

export const CHALLENGE_COLORS: Record<ChallengeType, string> = {
  quick: '#10b981', // green
  standard: '#3b82f6', // blue
  boss: '#ef4444' // red
};

export const RARITY_COLORS: Record<Rarity, string> = {
  common: '#6b7280', // gray
  uncommon: '#10b981', // green
  rare: '#3b82f6', // blue
  legendary: '#8b5cf6' // purple
};

// Game Actions for Reducer
export type GameAction = 
  | { type: 'START_GAME'; payload?: { stake: DifficultyStake } }
  | { type: 'START_NEW_RUN'; payload: { stake: DifficultyStake } }
  | { type: 'LOAD_GAME'; payload: GameState }
  | { type: 'SELECT_CHALLENGE'; payload: { challenge: Challenge } | Challenge }
  | { type: 'SUBMIT_WORD'; payload: { word: string; positions: number[]; timeTaken: number } }
  | { type: 'SKIP_CHALLENGE'; payload: { challenge: Challenge } }
  | { type: 'SKIP_LEVEL'; payload: { level: number; perk: PerkEffect } }
  | { type: 'PURCHASE_ITEM'; payload: { item: ShopItem } }
  | { type: 'PURCHASE_INVENTORY_ITEM'; payload: { item: InventoryItem } }
  | { type: 'SELL_INVENTORY_ITEM'; payload: { itemId: string } }
  | { type: 'LEAVE_SHOP' }
  | { type: 'USE_CONSUMABLE'; payload: { boost: ConsumableBoost } }
  | { type: 'RESET_GAME' }
  | { type: 'COMPLETE_CHALLENGE'; payload: { score: number; coins: number } }
  | { type: 'COMPLETE_LEVEL'; payload: { score: number; coins: number } }
  | { type: 'NEXT_LEVEL' }
  | { type: 'COMPLETE_RUN'; payload: { totalScore: number; levelsCompleted: number } }
  | { type: 'PURCHASE_POWERUP'; payload: PowerUp }
  | { type: 'SPEND_COINS'; payload: number }
  | { type: 'NEXT_ROUND' }
  | { type: 'GAME_OVER' }
  | { type: 'SET_DIFFICULTY'; payload: DifficultyStake };

// Helper type for power-ups (union of all power-up types)
export type PowerUp = LetterEnhancer | WordMultiplier | ConsumableBoost;

export interface PerkEffect {
  id: string;
  name: string;
  description: string;
  effect: PerkEffectType;
  levelAcquired: number;
}

export type PerkEffectType = 
  | { type: 'timeBonus'; seconds: number }
  | { type: 'vowelBonus'; multiplier: number }
  | { type: 'unlockDiagonal'; enabled: boolean }
  | { type: 'scoreMultiplier'; value: number }
  | { type: 'coinMultiplier'; value: number }
  | { type: 'wordLengthBonus'; minLength: number; bonus: number }
  | { type: 'letterTransform'; enabled: boolean }
  | { type: 'vowelTheft'; chance: number }
  | { type: 'consonantMultiplier'; value: number }
  | { type: 'goldenVowels'; enabled: boolean }
  | { type: 'lengthBonus'; value: number }
  | { type: 'shortWordMultiplier'; value: number }
  | { type: 'longWordMultiplier'; value: number }
  | { type: 'perfectLength'; value: number }
  | { type: 'speedBonus'; multiplier: number }
  | { type: 'timeToCoins'; ratio: number }
  | { type: 'timeFreeze'; enabled: boolean }
  | { type: 'palindromeMultiplier'; value: number }
  | { type: 'anagramMultiplier'; value: number }
  | { type: 'rhymeMultiplier'; value: number }
  | { type: 'alliterationMultiplier'; value: number }
  | { type: 'diagonalBonus'; value: number }
  | { type: 'pathBonus'; enabled: boolean }
  | { type: 'gridBonus'; value: number }
  | { type: 'spiralBonus'; value: number }
  | { type: 'chainBonus'; value: number }
  | { type: 'comboMultiplier'; enabled: boolean }
  | { type: 'streakBonus'; enabled: boolean }
  | { type: 'nounMultiplier'; value: number }
  | { type: 'verbMultiplier'; value: number }
  | { type: 'adjectiveMultiplier'; value: number }
  | { type: 'pluralMultiplier'; value: number }
  | { type: 'wordEcho'; chance: number }
  | { type: 'letterGod'; enabled: boolean }
  | { type: 'infiniteLoop'; enabled: boolean }
  | { type: 'ruleBreaker'; enabled: boolean }
  | { type: 'coinPerWord'; value: number }
  | { type: 'wordToCoins'; ratio: number }
  | { type: 'coinGrowth'; enabled: boolean }
  | { type: 'luckyCoins'; chance: number }
  | { type: 'synergyMultiplier'; enabled: boolean }
  | { type: 'jokerMultiplier'; enabled: boolean }
  | { type: 'pairBonus'; value: number }
  | { type: 'trinityBonus'; value: number }
  | { type: 'riskReward'; enabled: boolean }
  | { type: 'speedReward'; enabled: boolean }
  | { type: 'perfectionBonus'; value: number }
  | { type: 'underdogBonus'; enabled: boolean }
  | { type: 'wildCard'; enabled: boolean }
  | { type: 'jokerWild'; enabled: boolean }
  | { type: 'chaosEffects'; enabled: boolean }
  | { type: 'quantumLeap'; enabled: boolean }
  | { type: 'metaJoker'; enabled: boolean }
  | { type: 'jokerJoker'; enabled: boolean }
  | { type: 'infiniteJoker'; enabled: boolean }
  | { type: 'jokerGod'; enabled: boolean }; 