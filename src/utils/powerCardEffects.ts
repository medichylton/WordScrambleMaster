import { PerkEffect, PerkEffectType, InventoryItem, ItemEffect } from '../types/game';

// Power Card Effect System
export interface PowerCardContext {
  currentWord: string;
  currentScore: number;
  totalScore: number;
  wordsFound: string[];
  timeRemaining: number;
  grid: string[][];
  coins: number;
  activePerks: InventoryItem[];
  level: number;
}

export interface PowerCardResult {
  scoreModifier: number;
  coinBonus: number;
  timeBonus: number;
  wordModifications: string[];
  gridModifications: string[][];
  messages: string[];
}

// Apply power card effects to word scoring
export const applyPowerCardEffects = (
  word: string, 
  baseScore: number, 
  context: PowerCardContext
): PowerCardResult => {
  let scoreModifier = 1;
  let coinBonus = 0;
  let timeBonus = 0;
  const wordModifications: string[] = [];
  const gridModifications: string[][] = [];
  const messages: string[] = [];

  // Apply each active power card from inventory
  context.activePerks.forEach(item => {
    const effect = applyInventoryItemEffect(item.effect, word, baseScore, context);
    
    scoreModifier *= effect.scoreModifier;
    coinBonus += effect.coinBonus;
    timeBonus += effect.timeBonus;
    wordModifications.push(...effect.wordModifications);
    gridModifications.push(...effect.gridModifications);
    messages.push(...effect.messages);
  });

  return {
    scoreModifier,
    coinBonus,
    timeBonus,
    wordModifications,
    gridModifications,
    messages
  };
};

// Apply inventory item effects
const applyInventoryItemEffect = (
  effect: ItemEffect,
  word: string,
  baseScore: number,
  context: PowerCardContext
): PowerCardResult => {
  const result: PowerCardResult = {
    scoreModifier: 1,
    coinBonus: 0,
    timeBonus: 0,
    wordModifications: [],
    gridModifications: [],
    messages: []
  };

  switch (effect.type) {
    case 'letterMultiplier':
      result.scoreModifier = effect.value;
      result.messages.push(`🎯 Letter multiplier: ${effect.value}x`);
      break;

    case 'vowelBonus':
      const vowelCount = word.split('').filter(c => ['A', 'E', 'I', 'O', 'U'].includes(c.toUpperCase())).length;
      if (vowelCount > 0) {
        const vowelMultiplier = 1 + (vowelCount * (effect.value - 1)); 
        result.scoreModifier = vowelMultiplier;
        result.messages.push(`✨ Vowel bonus: ${vowelCount} vowels (+${Math.round((vowelMultiplier - 1) * 100)}%)`);
      }
      break;

    case 'chainMultiplier':
      // Apply chain multiplier based on words found
      const chainLength = Math.min(context.wordsFound.length, 5); // Cap at 5
      if (chainLength > 0) {
        const chainBonus = 1 + (chainLength * (effect.value - 1));
        result.scoreModifier = chainBonus;
        result.messages.push(`⛓️ Chain bonus: ${chainLength} words (+${Math.round((chainBonus - 1) * 100)}%)`);
      }
      break;

    case 'longWordMultiplier':
      if (word.length >= effect.minLength) {
        result.scoreModifier = effect.multiplier;
        result.messages.push(`📚 Long word bonus: ${effect.multiplier}x for ${word.length}-letter word`);
      }
      break;

    case 'goldenLetters':
      // Golden letters effect - random bonus
      const goldenChance = Math.random();
      if (goldenChance < 0.3) { // 30% chance
        result.scoreModifier = 2;
        result.messages.push(`✨ Golden letter activated: 2x bonus!`);
      }
      break;

    case 'wordEcho':
      // Word echo effect - chance for bonus coins
      if (Math.random() < effect.chance) {
        result.coinBonus = Math.floor(baseScore / 10);
        result.messages.push(`🔄 Word echo: +${Math.floor(baseScore / 10)} coins`);
      }
      break;

    case 'exponentialGrowth':
      // Exponential growth based on words found
      const growthFactor = Math.pow(effect.multiplier, Math.min(context.wordsFound.length, 3));
      result.scoreModifier = growthFactor;
      result.messages.push(`📈 Exponential growth: ${growthFactor.toFixed(1)}x`);
      break;

    case 'letterGod':
      // Letter god - massive bonus
      if (effect.enabled) {
        result.scoreModifier = 3;
        result.messages.push(`👑 Letter God: 3x all scores!`);
      }
      break;

    case 'timeExtender':
      result.timeBonus = effect.seconds;
      result.messages.push(`⏰ Time bonus: +${effect.seconds}s`);
      break;

    case 'coinMultiplier':
      result.coinBonus = Math.floor(baseScore * effect.value / 10);
      result.messages.push(`💰 Coin multiplier: +${Math.floor(baseScore * effect.value / 10)} coins`);
      break;

    case 'extraHands':
      // Extra hands - bonus for longer words
      if (word.length >= 5) {
        result.scoreModifier = 1 + (effect.value * 0.5);
        result.messages.push(`🤲 Extra hands: +${Math.round(effect.value * 50)}% for long words`);
      }
      break;

    case 'scoreToHealth':
      // Score to health - convert score to coins
      result.coinBonus = Math.floor(baseScore * effect.ratio);
      result.messages.push(`❤️ Score to health: +${Math.floor(baseScore * effect.ratio)} coins`);
      break;

    default:
      // No effect for unknown types
      break;
  }

  return result;
};

// Calculate total power card multiplier
export const calculateTotalPowerCardMultiplier = (activePerks: PerkEffect[]): number => {
  let multiplier = 1;
  
  activePerks.forEach(perk => {
    if (perk.effect.type === 'scoreMultiplier') {
      multiplier *= perk.effect.value;
    }
  });
  
  return multiplier;
};

// Get power card description for UI
export const getPowerCardDescription = (perk: PerkEffect): string => {
  const effect = perk.effect;
  
  switch (effect.type) {
    case 'scoreMultiplier':
      return `All scores multiplied by ${effect.value}x`;
    case 'timeBonus':
      return `Adds ${effect.seconds} seconds to time limit`;
    case 'coinMultiplier':
      return `Coin rewards multiplied by ${effect.value}x`;
    case 'vowelBonus':
      return `Vowels worth ${effect.multiplier}x points`;
    case 'consonantMultiplier':
      return `Consonants worth ${effect.value}x points`;
    case 'goldenVowels':
      return `All vowels become golden (3x points)`;
    case 'lengthBonus':
      return `Each letter adds +${effect.value}% to score`;
    case 'shortWordMultiplier':
      return `${effect.value}x bonus for 2-3 letter words`;
    case 'longWordMultiplier':
      return `${effect.value}x bonus for 8+ letter words`;
    case 'perfectLength':
      return `${effect.value}x bonus for 5-letter words`;
    case 'palindromeMultiplier':
      return `Palindromes score ${effect.value}x`;
    case 'anagramMultiplier':
      return `Anagrams score ${effect.value}x`;
    case 'rhymeMultiplier':
      return `Rhyming words score ${effect.value}x`;
    case 'alliterationMultiplier':
      return `Alliterations score ${effect.value}x`;
    case 'wordEcho':
      return `${Math.floor(effect.chance * 100)}% chance to duplicate word`;
    case 'coinPerWord':
      return `+${effect.value} coins per word found`;
    case 'wordToCoins':
      return `Long words give bonus coins`;
    case 'luckyCoins':
      return `${Math.floor(effect.chance * 100)}% chance for +10 coins`;
    default:
      return perk.description;
  }
}; 