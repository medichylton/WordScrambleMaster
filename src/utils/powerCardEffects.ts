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

  switch (effect.type) {
    // Letter manipulation effects - More impactful
    case 'letterTransform':
      if (effect.enabled) {
        // Allow transforming any letter into another (UI would handle this)
        result.messages.push('🔮 Letter transformation available');
      }
      break;

    case 'vowelTheft':
      if (Math.random() < effect.chance) {
        const vowels = ['A', 'E', 'I', 'O', 'U'];
        const stolenVowel = vowels[Math.floor(Math.random() * vowels.length)];
        result.wordModifications.push(`Stole vowel: ${stolenVowel}`);
        result.scoreModifier *= 2.0; // Increased from 1.5x to 2x
        result.messages.push(`🧛 Stole vowel ${stolenVowel} for 2x bonus!`);
      }
      break;

    case 'consonantMultiplier':
      const consonantCount = word.split('').filter(c => !['A', 'E', 'I', 'O', 'U'].includes(c)).length;
      if (consonantCount > 0) {
        result.scoreModifier *= effect.value;
        result.messages.push(`💪 Consonants worth ${effect.value}x (${consonantCount} consonants)`);
      }
      break;

    case 'goldenVowels':
      if (effect.enabled) {
        const vowelCount = word.split('').filter(c => ['A', 'E', 'I', 'O', 'U'].includes(c)).length;
        if (vowelCount > 0) {
          result.scoreModifier *= 4; // Increased from 3x to 4x
          result.messages.push(`✨ Golden vowels: ${vowelCount} vowels worth 4x!`);
        }
      }
      break;

    // Word length effects - More balanced
    case 'lengthBonus':
      const lengthBonus = 1 + (word.length * effect.value / 100);
      result.scoreModifier *= lengthBonus;
      result.messages.push(`📏 Length bonus: +${effect.value}% per letter (${Math.round((lengthBonus - 1) * 100)}% total)`);
      break;

    case 'shortWordMultiplier':
      if (word.length <= 3) {
        result.scoreModifier *= effect.value;
        result.messages.push(`📦 Short word bonus: ${effect.value}x for ${word.length}-letter word`);
      }
      break;

    case 'longWordMultiplier':
      if (word.length >= 8) {
        result.scoreModifier *= effect.value;
        result.messages.push(`🎯 Long word bonus: ${effect.value}x for ${word.length}-letter word`);
      }
      break;

    case 'perfectLength':
      if (word.length === 5) {
        result.scoreModifier *= effect.value;
        result.messages.push(`⭐ Perfect length: ${effect.value}x for 5-letter word`);
      }
      break;

    // Time manipulation effects - More generous
    case 'timeBonus':
      result.timeBonus += effect.seconds;
      result.messages.push(`⏰ Time bonus: +${effect.seconds}s`);
      break;

    case 'speedBonus':
      // This would be applied based on how fast the word was found
      result.scoreModifier *= effect.multiplier;
      result.messages.push(`⚡ Speed bonus: ${effect.multiplier}x`);
      break;

    case 'timeToCoins':
      const timeValue = Math.floor(context.timeRemaining * effect.ratio);
      result.coinBonus += timeValue;
      result.messages.push(`🏦 Time to coins: +${timeValue} coins`);
      break;

    case 'timeFreeze':
      if (effect.enabled) {
        result.messages.push(`❄️ Time freeze active`);
      }
      break;

    // Pattern effects - More rewarding
    case 'palindromeMultiplier':
      if (isPalindrome(word)) {
        result.scoreModifier *= effect.value;
        result.messages.push(`👑 Palindrome bonus: ${effect.value}x for "${word}"`);
      }
      break;

    case 'anagramMultiplier':
      if (hasAnagram(word, context.wordsFound)) {
        result.scoreModifier *= effect.value;
        result.messages.push(`🎭 Anagram bonus: ${effect.value}x - found anagram!`);
      }
      break;

    case 'rhymeMultiplier':
      if (hasRhyme(word, context.wordsFound)) {
        result.scoreModifier *= effect.value;
        result.messages.push(`🎵 Rhyme bonus: ${effect.value}x - rhyming words!`);
      }
      break;

    case 'alliterationMultiplier':
      if (isAlliteration(word)) {
        result.scoreModifier *= effect.value;
        result.messages.push(`🎪 Alliteration bonus: ${effect.value}x for "${word}"`);
      }
      break;

    // Movement effects - More impactful
    case 'diagonalBonus':
      // This would be applied based on the path taken
      result.scoreModifier *= effect.value;
      result.messages.push(`💃 Diagonal bonus: ${effect.value}x`);
      break;

    case 'pathBonus':
      if (effect.enabled) {
        result.messages.push(`🗺️ Path bonus active`);
      }
      break;

    case 'gridBonus':
      // This would be applied if the entire grid is used
      result.scoreModifier *= effect.value;
      result.messages.push(`🎮 Grid bonus: ${effect.value}x`);
      break;

    case 'spiralBonus':
      // This would be applied based on spiral path detection
      result.scoreModifier *= effect.value;
      result.messages.push(`🌀 Spiral bonus: ${effect.value}x`);
      break;

    // Scoring effects - More powerful
    case 'scoreMultiplier':
      result.scoreModifier *= effect.value;
      result.messages.push(`🎲 Score multiplier: ${effect.value}x`);
      break;

    case 'chainBonus':
      const chainBonus = 1 + (context.wordsFound.length * effect.value / 100);
      result.scoreModifier *= chainBonus;
      result.messages.push(`⛓️ Chain bonus: +${effect.value}% per word (${Math.round((chainBonus - 1) * 100)}% total)`);
      break;

    case 'comboMultiplier':
      if (effect.enabled) {
        result.messages.push(`👑 Combo system active`);
      }
      break;

    case 'streakBonus':
      if (effect.enabled) {
        result.messages.push(`🔥 Streak system active`);
      }
      break;

    // Word type effects - More rewarding
    case 'nounMultiplier':
      if (isNoun(word)) {
        result.scoreModifier *= effect.value;
        result.messages.push(`🏹 Noun bonus: ${effect.value}x for "${word}"`);
      }
      break;

    case 'verbMultiplier':
      if (isVerb(word)) {
        result.scoreModifier *= effect.value;
        result.messages.push(`🎭 Verb bonus: ${effect.value}x for "${word}"`);
      }
      break;

    case 'adjectiveMultiplier':
      if (isAdjective(word)) {
        result.scoreModifier *= effect.value;
        result.messages.push(`🎨 Adjective bonus: ${effect.value}x for "${word}"`);
      }
      break;

    case 'pluralMultiplier':
      if (isPlural(word)) {
        result.scoreModifier *= effect.value;
        result.messages.push(`📚 Plural bonus: ${effect.value}x for "${word}"`);
      }
      break;

    // Special effects - More impactful
    case 'wordEcho':
      if (Math.random() < effect.chance) {
        result.wordModifications.push(`Echo: ${word}`);
        result.scoreModifier *= 3; // Increased from 2x to 3x
        result.messages.push(`🔄 Word echo: "${word}" duplicated for 3x score!`);
      }
      break;

    case 'letterGod':
      if (effect.enabled) {
        result.messages.push(`👑 Letter God: All letters are wild`);
      }
      break;

    case 'infiniteLoop':
      if (effect.enabled) {
        result.messages.push(`♾️ Infinite loop: Words can be found multiple times`);
      }
      break;

    case 'ruleBreaker':
      if (effect.enabled) {
        result.messages.push(`💻 Reality hack: One rule broken`);
      }
      break;

    // Economy effects - More generous
    case 'coinPerWord':
      result.coinBonus += effect.value;
      result.messages.push(`🧲 Coin magnet: +${effect.value} coins`);
      break;

    case 'wordToCoins':
      const coinValue = Math.floor(word.length * effect.ratio);
      result.coinBonus += coinValue;
      result.messages.push(`💰 Rich words: +${coinValue} coins for ${word.length}-letter word`);
      break;

    case 'coinGrowth':
      if (effect.enabled) {
        result.messages.push(`🏛️ Investment banker: Coins multiply over time`);
      }
      break;

    case 'luckyCoins':
      if (Math.random() < effect.chance) {
        result.coinBonus += 15; // Increased from 10 to 15
        result.messages.push(`🍀 Lucky strike: +15 coins!`);
      }
      break;

    // Synergy effects - More powerful
    case 'synergyMultiplier':
      if (effect.enabled) {
        result.messages.push(`🔗 Synergy master: Matching power cards multiply`);
      }
      break;

    case 'jokerMultiplier':
      if (effect.enabled) {
        const powerCardCount = context.activePerks.length;
        const synergyBonus = 1 + powerCardCount * 0.3; // Increased from 0.5 to 0.3 for better balance
        result.scoreModifier *= synergyBonus;
        result.messages.push(`🃏 Power collector: +${powerCardCount * 0.3}x from ${powerCardCount} power cards`);
      }
      break;

    case 'pairBonus':
      // This would be applied if paired power cards are found
      result.scoreModifier *= effect.value;
      result.messages.push(`💕 Perfect pair: ${effect.value}x bonus`);
      break;

    case 'trinityBonus':
      // This would be applied if three power cards are found
      result.scoreModifier *= effect.value;
      result.messages.push(`☯️ Trinity force: ${effect.value}x bonus`);
      break;

    // Challenge effects - More helpful
    case 'riskReward':
      if (effect.enabled) {
        result.messages.push(`🎲 Risk taker: Harder challenges = bigger rewards`);
      }
      break;

    case 'speedReward':
      if (effect.enabled) {
        result.messages.push(`🏃 Speed runner: Fast completion = bonus`);
      }
      break;

    case 'perfectionBonus':
      // This would be applied for perfect scores
      result.scoreModifier *= effect.value;
      result.messages.push(`✨ Perfectionist: ${effect.value}x bonus`);
      break;

    case 'underdogBonus':
      if (effect.enabled) {
        result.messages.push(`🐕 Underdog: Low score = comeback bonus`);
      }
      break;

    // Wild effects - More useful
    case 'wildCard':
      if (effect.enabled) {
        result.messages.push(`🃏 Wild card: Any letter becomes wild`);
      }
      break;

    case 'jokerWild':
      if (effect.enabled) {
        result.messages.push(`🎭 Power wild: Power cards become wild letters`);
      }
      break;

    case 'chaosEffects':
      if (effect.enabled) {
        result.messages.push(`🌪️ Chaos theory: Random effects each word`);
      }
      break;

    case 'quantumLeap':
      if (effect.enabled) {
        result.messages.push(`🚀 Quantum leap: Teleport to any letter`);
      }
      break;

    // Meta effects - More interesting
    case 'metaJoker':
      if (effect.enabled) {
        result.messages.push(`🧠 Meta master: Power cards affect other power cards`);
      }
      break;

    case 'jokerJoker':
      if (effect.enabled) {
        result.messages.push(`🎪 Power power: Power cards can be power cards`);
      }
      break;

    case 'infiniteJoker':
      if (effect.enabled) {
        result.messages.push(`♾️ Infinite power: Power cards multiply themselves`);
      }
      break;

    case 'jokerGod':
      if (effect.enabled) {
        result.messages.push(`👑 Power God: All power cards become legendary`);
      }
      break;
  }

  return result;
};

// Helper functions for pattern detection
const isPalindrome = (word: string): boolean => {
  const clean = word.toUpperCase().replace(/[^A-Z]/g, '');
  return clean === clean.split('').reverse().join('');
};

const hasAnagram = (word: string, wordsFound: string[]): boolean => {
  const sorted = word.split('').sort().join('');
  return wordsFound.some(found => 
    found !== word && found.split('').sort().join('') === sorted
  );
};

const hasRhyme = (word: string, wordsFound: string[]): boolean => {
  const ending = word.slice(-2).toLowerCase();
  return wordsFound.some(found => 
    found !== word && found.slice(-2).toLowerCase() === ending
  );
};

const isAlliteration = (word: string): boolean => {
  const words = word.split(' ');
  if (words.length < 2) return false;
  const firstLetter = words[0].charAt(0).toLowerCase();
  return words.every(w => w.charAt(0).toLowerCase() === firstLetter);
};

const isNoun = (word: string): boolean => {
  // Simplified noun detection - in a real game, you'd use a dictionary API
  const commonNouns = ['CAT', 'DOG', 'HOUSE', 'CAR', 'BOOK', 'TREE', 'WATER', 'FIRE', 'EARTH', 'AIR'];
  return commonNouns.includes(word.toUpperCase());
};

const isVerb = (word: string): boolean => {
  // Simplified verb detection
  const commonVerbs = ['RUN', 'WALK', 'JUMP', 'EAT', 'SLEEP', 'READ', 'WRITE', 'PLAY', 'WORK', 'TALK'];
  return commonVerbs.includes(word.toUpperCase());
};

const isAdjective = (word: string): boolean => {
  // Simplified adjective detection
  const commonAdjectives = ['BIG', 'SMALL', 'FAST', 'SLOW', 'HOT', 'COLD', 'GOOD', 'BAD', 'NEW', 'OLD'];
  return commonAdjectives.includes(word.toUpperCase());
};

const isPlural = (word: string): boolean => {
  return word.toUpperCase().endsWith('S') && word.length > 1;
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