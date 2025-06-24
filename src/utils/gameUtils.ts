import { GameState, InventoryItem, PerkEffect, PerkEffectType } from '../types/game';

// Calculate total multiplier from all inventory items and perks
export function calculateTotalMultiplier(gameState: GameState, baseScore: number, word: string): number {
  let totalMultiplier = 1.0;
  
  // Apply inventory item multipliers
  gameState.inventory.forEach(item => {
    switch (item.effect.type) {
      case 'letterMultiplier':
        totalMultiplier *= (1 + (item.effect.value * word.length / baseScore));
        break;
      case 'vowelBonus':
        const vowelCount = (word.match(/[aeiou]/gi) || []).length;
        totalMultiplier *= (1 + (item.effect.value * vowelCount / baseScore));
        break;
      case 'longWordMultiplier':
        if (word.length >= item.effect.minLength) {
          totalMultiplier *= item.effect.multiplier;
        }
        break;
      case 'exponentialGrowth':
        // This would need to track word count, simplified for now
        totalMultiplier *= item.effect.multiplier;
        break;
      case 'omniMultiplier':
        totalMultiplier *= item.effect.value;
        break;
    }
  });
  
  // Apply perk multipliers
  gameState.activePerks.forEach(perk => {
    switch (perk.effect.type) {
      case 'scoreMultiplier':
        totalMultiplier *= perk.effect.value;
        break;
      case 'vowelBonus':
        const vowelCount = (word.match(/[aeiou]/gi) || []).length;
        totalMultiplier *= (1 + (perk.effect.multiplier * vowelCount / baseScore));
        break;
      case 'wordLengthBonus':
        if (word.length >= perk.effect.minLength) {
          totalMultiplier *= (1 + perk.effect.bonus / baseScore);
        }
        break;
    }
  });
  
  return totalMultiplier;
}

// Calculate word score with all multipliers applied
export function calculateWordScore(gameState: GameState, word: string): number {
  const baseScore = Math.max(3, word.length * 2); // Base scoring
  const multiplier = calculateTotalMultiplier(gameState, baseScore, word);
  
  // Apply chain multiplier if applicable
  let chainBonus = 0;
  const chainItems = gameState.inventory.filter(item => item.effect.type === 'chainMultiplier');
  if (chainItems.length > 0) {
    chainBonus = chainItems.reduce((total, item) => total + item.effect.value, 0);
  }
  
  return Math.floor((baseScore + chainBonus) * multiplier);
}

// Check if word echo should trigger
export function shouldTriggerWordEcho(gameState: GameState): boolean {
  const echoItems = gameState.inventory.filter(item => item.effect.type === 'wordEcho');
  if (echoItems.length === 0) return false;
  
  const totalChance = echoItems.reduce((total, item) => total + item.effect.chance, 0);
  return Math.random() < totalChance;
}

// Calculate coin reward with multipliers
export function calculateCoinReward(gameState: GameState, baseCoins: number): number {
  let coinMultiplier = 1.0;
  
  // Apply coin multipliers from inventory
  gameState.inventory.forEach(item => {
    if (item.effect.type === 'coinMultiplier') {
      coinMultiplier *= (1 + item.effect.value);
    }
  });
  
  // Apply coin multipliers from perks
  gameState.activePerks.forEach(perk => {
    if (perk.effect.type === 'coinMultiplier') {
      coinMultiplier *= (1 + perk.effect.value);
    }
  });
  
  return Math.floor(baseCoins * coinMultiplier);
}

// Generate 50+ unique power cards inspired by Balatro but for word games
export const generateRandomPowerCard = (currentLevel: number): PerkEffect => {
  const powerCards: Array<{ name: string; description: string; effect: PerkEffectType }> = [
    // Letter manipulation power cards
    { name: 'Letter Alchemist', description: 'Transform any letter into another', effect: { type: 'letterTransform', enabled: true } },
    { name: 'Vowel Vampire', description: 'Steal vowels from unused words', effect: { type: 'vowelTheft', chance: 0.3 } },
    { name: 'Consonant Crusher', description: 'Consonants worth 2x points', effect: { type: 'consonantMultiplier', value: 2 } },
    { name: 'Golden Vowels', description: 'All vowels become golden (3x points)', effect: { type: 'goldenVowels', enabled: true } },
    
    // Word length power cards
    { name: 'Length Lord', description: 'Each letter adds +5 points', effect: { type: 'lengthBonus', value: 5 } },
    { name: 'Short Stack', description: '2-3 letter words score 4x', effect: { type: 'shortWordMultiplier', value: 4 } },
    { name: 'Long Shot', description: '8+ letter words score 5x', effect: { type: 'longWordMultiplier', value: 5 } },
    { name: 'Perfect Length', description: '5-letter words score 10x', effect: { type: 'perfectLength', value: 10 } },
    
    // Time manipulation power cards
    { name: 'Time Warp', description: '+60 seconds to time limit', effect: { type: 'timeBonus', seconds: 60 } },
    { name: 'Speed Demon', description: 'Fast words get 2x bonus', effect: { type: 'speedBonus', multiplier: 2 } },
    { name: 'Time Bank', description: 'Unused time converts to coins', effect: { type: 'timeToCoins', ratio: 0.1 } },
    { name: 'Frozen Time', description: 'Time stops during word selection', effect: { type: 'timeFreeze', enabled: true } },
    
    // Pattern power cards
    { name: 'Palindrome Prince', description: 'Palindromes score 8x', effect: { type: 'palindromeMultiplier', value: 8 } },
    { name: 'Anagram King', description: 'Anagrams score 6x', effect: { type: 'anagramMultiplier', value: 6 } },
    { name: 'Rhyme Master', description: 'Rhyming words score 4x', effect: { type: 'rhymeMultiplier', value: 4 } },
    { name: 'Alliteration Ace', description: 'Alliterations score 5x', effect: { type: 'alliterationMultiplier', value: 5 } },
    
    // Movement power cards
    { name: 'Diagonal Dancer', description: 'Diagonal moves worth 2x', effect: { type: 'diagonalBonus', value: 2 } },
    { name: 'Pathfinder', description: 'Longest path gets bonus', effect: { type: 'pathBonus', enabled: true } },
    { name: 'Grid Master', description: 'Use entire grid for 3x bonus', effect: { type: 'gridBonus', value: 3 } },
    { name: 'Spiral Seeker', description: 'Spiral patterns score 4x', effect: { type: 'spiralBonus', value: 4 } },
    
    // Scoring power cards
    { name: 'Score Doubler', description: 'All scores doubled', effect: { type: 'scoreMultiplier', value: 2 } },
    { name: 'Chain Master', description: 'Each consecutive word +10 points', effect: { type: 'chainBonus', value: 10 } },
    { name: 'Combo King', description: 'Combos multiply scores', effect: { type: 'comboMultiplier', enabled: true } },
    { name: 'Streak Seeker', description: 'Streaks give exponential bonus', effect: { type: 'streakBonus', enabled: true } },
    
    // Word type power cards
    { name: 'Noun Hunter', description: 'Nouns score 3x', effect: { type: 'nounMultiplier', value: 3 } },
    { name: 'Verb Virtuoso', description: 'Verbs score 3x', effect: { type: 'verbMultiplier', value: 3 } },
    { name: 'Adjective Ace', description: 'Adjectives score 3x', effect: { type: 'adjectiveMultiplier', value: 3 } },
    { name: 'Plural Power', description: 'Plurals score 2x', effect: { type: 'pluralMultiplier', value: 2 } },
    
    // Special power cards
    { name: 'Word Echo', description: '25% chance to duplicate word', effect: { type: 'wordEcho', chance: 0.25 } },
    { name: 'Letter God', description: 'All letters become any letter', effect: { type: 'letterGod', enabled: true } },
    { name: 'Infinite Loop', description: 'Words can be found multiple times', effect: { type: 'infiniteLoop', enabled: true } },
    { name: 'Reality Hack', description: 'Break one game rule', effect: { type: 'ruleBreaker', enabled: true } },
    
    // Economy power cards
    { name: 'Coin Magnet', description: '+2 coins per word found', effect: { type: 'coinPerWord', value: 2 } },
    { name: 'Rich Words', description: 'Long words give bonus coins', effect: { type: 'wordToCoins', ratio: 0.5 } },
    { name: 'Investment Banker', description: 'Coins multiply over time', effect: { type: 'coinGrowth', enabled: true } },
    { name: 'Lucky Strike', description: '10% chance for +10 coins', effect: { type: 'luckyCoins', chance: 0.1 } },
    
    // Synergy power cards
    { name: 'Synergy Master', description: 'Matching power cards multiply', effect: { type: 'synergyMultiplier', enabled: true } },
    { name: 'Power Collector', description: 'Each power card adds +1x multiplier', effect: { type: 'jokerMultiplier', enabled: true } },
    { name: 'Perfect Pair', description: 'Paired power cards score 10x', effect: { type: 'pairBonus', value: 10 } },
    { name: 'Trinity Force', description: 'Three power cards = 20x bonus', effect: { type: 'trinityBonus', value: 20 } },
    
    // Challenge power cards
    { name: 'Risk Taker', description: 'Harder challenges = bigger rewards', effect: { type: 'riskReward', enabled: true } },
    { name: 'Speed Runner', description: 'Fast completion = bonus', effect: { type: 'speedReward', enabled: true } },
    { name: 'Perfectionist', description: 'Perfect score = 10x bonus', effect: { type: 'perfectionBonus', value: 10 } },
    { name: 'Underdog', description: 'Low score = comeback bonus', effect: { type: 'underdogBonus', enabled: true } },
    
    // Wild power cards
    { name: 'Wild Card', description: 'Any letter becomes wild', effect: { type: 'wildCard', enabled: true } },
    { name: 'Power Wild', description: 'Power cards become wild letters', effect: { type: 'jokerWild', enabled: true } },
    { name: 'Chaos Theory', description: 'Random effects each word', effect: { type: 'chaosEffects', enabled: true } },
    { name: 'Quantum Leap', description: 'Teleport to any letter', effect: { type: 'quantumLeap', enabled: true } },
    
    // Meta power cards
    { name: 'Meta Master', description: 'Power cards affect other power cards', effect: { type: 'metaJoker', enabled: true } },
    { name: 'Power Power', description: 'Power cards can be power cards', effect: { type: 'jokerJoker', enabled: true } },
    { name: 'Infinite Power', description: 'Power cards multiply themselves', effect: { type: 'infiniteJoker', enabled: true } },
    { name: 'Power God', description: 'All power cards become legendary', effect: { type: 'jokerGod', enabled: true } }
  ];
  
  const randomPowerCard = powerCards[Math.floor(Math.random() * powerCards.length)];
  return {
    id: `${randomPowerCard.name.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}`,
    name: randomPowerCard.name,
    description: randomPowerCard.description,
    effect: randomPowerCard.effect,
    levelAcquired: currentLevel
  };
};

export const getPerkEmoji = (perkName: string): string => {
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

export const convertPerkEffectToItemEffect = (perkEffect: PerkEffectType): any => {
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

// Level Progression Effects - These actually modify gameplay
export interface LevelEffects {
  vowelReduction: number; // Percentage of vowels to reduce (0-1)
  movementRestricted: boolean; // Only horizontal/vertical movement
  timeReduction: number; // Seconds to reduce from base time
  minWordLength: number; // Minimum word length required
  consonantBonus: number; // Extra points for consonant-heavy words
  palindromeBonus: number; // Multiplier for palindromes
  speedRequirement: boolean; // Requires fast word finding
  gridSymmetry: boolean; // Grid must be symmetrical
  diagonalBlocked: boolean; // No diagonal movement allowed
  letterFrequencyShift: { [key: string]: number }; // Modify letter frequencies
}

export const getLevelEffects = (level: number): LevelEffects => {
  const effects: LevelEffects = {
    vowelReduction: 0,
    movementRestricted: false,
    timeReduction: 0,
    minWordLength: 3,
    consonantBonus: 0,
    palindromeBonus: 1,
    speedRequirement: false,
    gridSymmetry: false,
    diagonalBlocked: false,
    letterFrequencyShift: {}
  };

  // Apply effects based on level
  switch (level % 16) { // Cycle through 16 different level types
    case 1: // WORD HUNT - Standard gameplay
      break;
    
    case 2: // VOWEL VOID - 30% fewer vowels
      effects.vowelReduction = 0.3;
      break;
    
    case 3: // LETTER LOCKDOWN - Only horizontal/vertical movement
      effects.movementRestricted = true;
      effects.diagonalBlocked = true;
      break;
    
    case 4: // CONSONANT CHAOS - 80% consonants, bonus for consonant words
      effects.vowelReduction = 0.6;
      effects.consonantBonus = 5;
      break;
    
    case 5: // TIME PRESSURE - Reduced time limit
      effects.timeReduction = 30;
      effects.speedRequirement = true;
      break;
    
    case 6: // LENGTH LIMIT - Minimum 4-letter words
      effects.minWordLength = 4;
      break;
    
    case 7: // DIAGONAL DENIAL - No diagonal connections
      effects.diagonalBlocked = true;
      break;
    
    case 8: // SYMMETRY SEEKER - Symmetrical patterns preferred
      effects.gridSymmetry = true;
      break;
    
    case 9: // PALINDROME PUSH - Palindromes worth 3x
      effects.palindromeBonus = 3;
      break;
    
    case 10: // ANAGRAM ATTACK - Anagram bonuses
      // This would be handled in scoring
      break;
    
    case 11: // RHYME TIME - Rhyming word bonuses
      // This would be handled in scoring
      break;
    
    case 12: // ALLITERATION ALLEY - Same letter start bonuses
      // This would be handled in scoring
      break;
    
    case 13: // SYLLABLE SURGE - Multi-syllable word bonuses
      effects.minWordLength = 5;
      break;
    
    case 14: // PREFIX POWER - Words with common prefixes
      effects.letterFrequencyShift = { 'U': 2, 'R': 2, 'P': 2 }; // UN-, RE-, PRE-
      break;
    
    case 15: // SUFFIX STORM - Words with common suffixes
      effects.letterFrequencyShift = { 'I': 2, 'E': 2, 'S': 2 }; // -ING, -ED, -S
      break;
    
    case 0: // COMPOUND CRAZE - Longer words preferred
      effects.minWordLength = 6;
      break;
  }

  return effects;
};

// Apply level effects to grid generation
export const generateLevelAdjustedGrid = (level: number): string[][] => {
  const effects = getLevelEffects(level);
  
  // Start with base letter frequencies
  const baseFrequencies = {
    'A': 8, 'B': 2, 'C': 3, 'D': 4, 'E': 12, 'F': 2, 'G': 3, 'H': 2, 'I': 9,
    'J': 1, 'K': 1, 'L': 4, 'M': 2, 'N': 6, 'O': 8, 'P': 2, 'Q': 1, 'R': 6,
    'S': 4, 'T': 6, 'U': 4, 'V': 2, 'W': 2, 'X': 1, 'Y': 2, 'Z': 1
  };
  
  // Apply vowel reduction
  if (effects.vowelReduction > 0) {
    const vowels = ['A', 'E', 'I', 'O', 'U'];
    vowels.forEach(vowel => {
      baseFrequencies[vowel] = Math.max(1, Math.floor(baseFrequencies[vowel] * (1 - effects.vowelReduction)));
    });
  }
  
  // Apply letter frequency shifts
  Object.entries(effects.letterFrequencyShift).forEach(([letter, multiplier]) => {
    baseFrequencies[letter] = Math.floor(baseFrequencies[letter] * multiplier);
  });
  
  // Generate weighted letter pool
  const letterPool: string[] = [];
  Object.entries(baseFrequencies).forEach(([letter, frequency]) => {
    for (let i = 0; i < frequency; i++) {
      letterPool.push(letter);
    }
  });
  
  // Generate 4x4 grid
  const grid: string[][] = [];
  for (let row = 0; row < 4; row++) {
    grid[row] = [];
    for (let col = 0; col < 4; col++) {
      const randomIndex = Math.floor(Math.random() * letterPool.length);
      grid[row][col] = letterPool[randomIndex];
    }
  }
  
  // Apply symmetry if required
  if (effects.gridSymmetry) {
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 4; col++) {
        if (col > row) {
          grid[row][col] = grid[col][row]; // Mirror across diagonal
        }
      }
    }
  }
  
  return grid;
};

// Apply level effects to movement validation
export const isValidLevelMove = (level: number, fromPos: { row: number, col: number }, toPos: { row: number, col: number }): boolean => {
  const effects = getLevelEffects(level);
  
  const rowDiff = Math.abs(fromPos.row - toPos.row);
  const colDiff = Math.abs(fromPos.col - toPos.col);
  
  // Check if move is adjacent
  if (rowDiff > 1 || colDiff > 1) {
    return false;
  }
  
  // Check diagonal restrictions
  if (effects.diagonalBlocked && rowDiff === 1 && colDiff === 1) {
    return false;
  }
  
  // Check movement restrictions (only horizontal/vertical)
  if (effects.movementRestricted && rowDiff === 1 && colDiff === 1) {
    return false;
  }
  
  return true;
};

// Apply level effects to scoring
export const applyLevelScoring = (level: number, word: string, baseScore: number, wordsFound: string[]): number => {
  const effects = getLevelEffects(level);
  let finalScore = baseScore;
  
  // Minimum word length check
  if (word.length < effects.minWordLength) {
    return 0; // Invalid word for this level
  }
  
  // Consonant bonus
  if (effects.consonantBonus > 0) {
    const consonants = word.split('').filter(c => !'AEIOU'.includes(c.toUpperCase())).length;
    finalScore += consonants * effects.consonantBonus;
  }
  
  // Palindrome bonus
  if (effects.palindromeBonus > 1) {
    const isPalindrome = word.toLowerCase() === word.toLowerCase().split('').reverse().join('');
    if (isPalindrome) {
      finalScore *= effects.palindromeBonus;
    }
  }
  
  // Speed bonus for time pressure levels
  if (effects.speedRequirement) {
    // This would need timing data from the component
    finalScore *= 1.2; // Flat bonus for now
  }
  
  return Math.floor(finalScore);
};

// Get level time limit
export const getLevelTimeLimit = (level: number, baseTime: number = 120): number => {
  const effects = getLevelEffects(level);
  return baseTime - effects.timeReduction;
}; 