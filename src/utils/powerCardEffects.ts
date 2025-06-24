import { PerkEffect, PerkEffectType } from '../types/game';

// Power Card Effect System
export interface PowerCardContext {
  currentWord: string;
  currentScore: number;
  totalScore: number;
  wordsFound: string[];
  timeRemaining: number;
  grid: string[][];
  coins: number;
  activePerks: PerkEffect[];
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

  // Apply each active power card
  context.activePerks.forEach(perk => {
    const effect = applySinglePowerCardEffect(perk.effect, word, baseScore, context);
    
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

// Apply a single power card effect
const applySinglePowerCardEffect = (
  effect: PerkEffectType,
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

  // Handle different effect types based on the actual structure from inventory items
  const effectType = typeof effect === 'string' ? effect : effect.type;
  
  switch (effectType) {
    // Basic multipliers
    case 'scoreMultiplier':
      const multiplier = typeof effect === 'object' && effect.value ? effect.value : 1.5;
      result.scoreModifier *= multiplier;
      result.messages.push(`🎯 Score multiplier: ${multiplier}x`);
      break;

    case 'wordLengthBonus':
      const lengthBonus = 1 + (word.length * 0.1); // 10% per letter
      result.scoreModifier *= lengthBonus;
      result.messages.push(`📏 Length bonus: +${Math.round((lengthBonus - 1) * 100)}%`);
      break;

    case 'vowelBonus':
      const vowelCount = word.split('').filter(c => ['A', 'E', 'I', 'O', 'U'].includes(c.toUpperCase())).length;
      if (vowelCount > 0) {
        const vowelMultiplier = 1 + (vowelCount * 0.2); // 20% per vowel
        result.scoreModifier *= vowelMultiplier;
        result.messages.push(`✨ Vowel bonus: ${vowelCount} vowels (+${Math.round((vowelMultiplier - 1) * 100)}%)`);
      }
      break;

    case 'consonantBonus':
      const consonantCount = word.split('').filter(c => !['A', 'E', 'I', 'O', 'U'].includes(c.toUpperCase())).length;
      if (consonantCount > 0) {
        const consonantMultiplier = 1 + (consonantCount * 0.15); // 15% per consonant
        result.scoreModifier *= consonantMultiplier;
        result.messages.push(`💪 Consonant bonus: ${consonantCount} consonants (+${Math.round((consonantMultiplier - 1) * 100)}%)`);
      }
      break;

    case 'coinBonus':
      const coinAmount = typeof effect === 'object' && effect.value ? effect.value : Math.floor(word.length / 2);
      result.coinBonus += coinAmount;
      result.messages.push(`💰 Coin bonus: +${coinAmount} coins`);
      break;

    case 'timeBonus':
      const timeAmount = typeof effect === 'object' && effect.seconds ? effect.seconds : 5;
      result.timeBonus += timeAmount;
      result.messages.push(`⏰ Time bonus: +${timeAmount}s`);
      break;

    // Pattern bonuses
    case 'palindromeBonus':
      if (isPalindrome(word)) {
        result.scoreModifier *= 3;
        result.messages.push(`🔄 Palindrome bonus: 3x for "${word}"`);
      }
      break;

    case 'longWordBonus':
      if (word.length >= 6) {
        result.scoreModifier *= 2;
        result.messages.push(`📚 Long word bonus: 2x for ${word.length}-letter word`);
      }
      break;

    case 'shortWordBonus':
      if (word.length <= 4) {
        result.scoreModifier *= 1.5;
        result.messages.push(`🎯 Short word bonus: 1.5x for ${word.length}-letter word`);
      }
      break;

    // Advanced effects
    case 'alliterationBonus':
      if (isAlliteration(word)) {
        result.scoreModifier *= 2.5;
        result.messages.push(`🎪 Alliteration bonus: 2.5x for "${word}"`);
      }
      break;

    case 'rhymeBonus':
      if (hasRhyme(word, context.wordsFound)) {
        result.scoreModifier *= 2;
        result.messages.push(`🎵 Rhyme bonus: 2x - rhyming words!`);
      }
      break;

    case 'anagramBonus':
      if (hasAnagram(word, context.wordsFound)) {
        result.scoreModifier *= 2;
        result.messages.push(`🎭 Anagram bonus: 2x - found anagram!`);
      }
      break;

    // Economy effects
    case 'doubleCoins':
      result.coinBonus += Math.floor(baseScore / 10);
      result.messages.push(`💎 Double coins: +${Math.floor(baseScore / 10)} coins`);
      break;

    case 'scoreToCoins':
      const coinConversion = Math.floor(baseScore / 20);
      result.coinBonus += coinConversion;
      result.messages.push(`🏦 Score to coins: +${coinConversion} coins`);
      break;

    // Legacy effect types - handle old format
    case 'letterTransform':
    case 'vowelTheft':
    case 'consonantMultiplier':
    case 'goldenVowels':
    case 'lengthBonus':
    case 'shortWordMultiplier':
    case 'longWordMultiplier':
    case 'perfectLength':
    case 'speedBonus':
    case 'timeToCoins':
    case 'timeFreeze':
    case 'palindromeMultiplier':
    case 'anagramMultiplier':
    case 'rhymeMultiplier':
    case 'alliterationMultiplier':
    case 'diagonalBonus':
      // Handle legacy effects with their original logic
      return applySinglePowerCardEffectLegacy(effect, word, baseScore, context);

    default:
      // Try to handle as a generic multiplier effect
      if (typeof effect === 'object' && effect.value) {
        result.scoreModifier *= effect.value;
        result.messages.push(`⚡ Power effect: ${effect.value}x`);
      }
      break;
  }

  return result;
};

// Legacy effect handler for backwards compatibility
const applySinglePowerCardEffectLegacy = (
  effect: PerkEffectType,
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
    case 'consonantMultiplier':
      const consonantCount = word.split('').filter(c => !['A', 'E', 'I', 'O', 'U'].includes(c)).length;
      if (consonantCount > 0) {
        result.scoreModifier *= effect.value;
        result.messages.push(`💪 Consonants worth ${effect.value}x (${consonantCount} consonants)`);
      }
      break;

    case 'lengthBonus':
      const lengthBonus = 1 + (word.length * effect.value / 100);
      result.scoreModifier *= lengthBonus;
      result.messages.push(`📏 Length bonus: +${effect.value}% per letter (${Math.round((lengthBonus - 1) * 100)}% total)`);
      break;

    case 'palindromeMultiplier':
      if (isPalindrome(word)) {
        result.scoreModifier *= effect.value;
        result.messages.push(`👑 Palindrome bonus: ${effect.value}x for "${word}"`);
      }
      break;

    // Add other legacy effects as needed...
  }

  return result;
};

// Helper functions for pattern detection
const isPalindrome = (word: string): boolean {
  const clean = word.toUpperCase().replace(/[^A-Z]/g, '');
  return clean === clean.split('').reverse().join('');
};

const hasAnagram = (word: string, wordsFound: string[]): boolean {
  const sorted = word.split('').sort().join('');
  return wordsFound.some(found => 
    found !== word && found.split('').sort().join('') === sorted
  );
};

const hasRhyme = (word: string, wordsFound: string[]): boolean {
  const ending = word.slice(-2).toLowerCase();
  return wordsFound.some(found => 
    found !== word && found.slice(-2).toLowerCase() === ending
  );
};

const isAlliteration = (word: string): boolean {
  const words = word.split(' ');
  if (words.length < 2) return false;
  const firstLetter = words[0].charAt(0).toLowerCase();
  return words.every(w => w.charAt(0).toLowerCase() === firstLetter);
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