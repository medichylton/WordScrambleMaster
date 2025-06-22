# Word Scramble Master

A revolutionary word game that combines the best of Boggle and Balatro, creating an addictive roguelike word-finding experience for iOS.

## Game Concept

**Word Scramble Master** reimagines the classic Boggle word-finding gameplay through the lens of Balatro's innovative roguelike progression system. Instead of poker hands, you form words from a letter grid to defeat increasingly challenging word puzzles, purchasing powerful upgrades between rounds to enhance your vocabulary prowess.

## Core Gameplay Loop

### 1. Challenge Selection (Inspired by Balatro's Blinds)
Each round presents three distinct challenge types:
- **Quick Challenge** ⚡ - Fast-paced word finding with time bonuses
- **Standard Challenge** 🎯 - Balanced difficulty with solid rewards  
- **Boss Challenge** 👑 - Unique rule modifiers and high stakes

### 2. Word Formation
- Swipe through adjacent letters on a 4x4 grid to form words
- Visual path overlay shows your word selection
- Dynamic scoring based on word length, letter rarity, and power-ups
- Special boss challenges introduce unique mechanics like locked letters or vowel scarcity

### 3. Power-Up System (Inspired by Balatro's Jokers)

#### Letter Enhancers
- **Vowel Virtuoso**: Vowels worth 2x points
- **Rare Letter Collector**: Q, X, Z letters worth 5x points  
- **Word Wizard**: 7+ letter words score 3x points
- **Letter Alchemist**: Transform letters into gold (+10 points each)

#### Word Multipliers  
- **Speed Demon**: Quick words get +50% score
- **Chain Master**: Consecutive words build multiplier
- **Perfect Palindrome**: Palindromes worth 4x points

#### Consumable Boosts
- **Letter Shuffle**: Reorganize the grid (3 uses)
- **Extra Time**: Add 30 seconds to timer
- **Score Multiplier**: Next 5 words worth 2x points

### 4. Shop System
Between rounds, spend coins earned from challenges to:
- Purchase new power-ups
- Buy consumable items
- Upgrade existing abilities
- Unlock new challenge modifiers

### 5. Progressive Difficulty Stakes
Choose your challenge level:
- **Apprentice**: Perfect for learning the basics
- **Scholar**: Increased challenge requirements  
- **Expert**: Reduced time limits and harder grids
- **Master**: Limited power-ups and higher stakes
- **Grandmaster**: Ultimate challenge for word masters

## Unique Features

### Boss Challenge Mechanics
- **Letter Thief**: Some letters are locked and unusable
- **Word Weaver**: Only words with 5+ letters count
- **Time Warden**: Timer accelerates with each word found
- **Vowel Void**: Reduced vowels in the grid
- **Consonant Crush**: Consonants score double points

### Skip System (Inspired by Balatro's Tags)
Skip challenges (when allowed) to receive alternative rewards:
- Bonus coins
- Extra shop slots
- Purchase discounts
- Free power-ups

### Visual Excellence
- Smooth letter grid animations with visual feedback
- Power-up effects with particle systems
- Color-coded rarity system for upgrades
- Intuitive UI inspired by modern mobile game design

## Technical Implementation

Built entirely in **Swift** using **SwiftUI** for iOS, featuring:
- Reactive architecture with ObservableObject pattern
- Custom gesture handling for smooth word selection
- Timer-based challenge mechanics
- Persistent game state management
- Extensible power-up effect system

## Game Flow

1. **Main Menu**: Choose difficulty stake and view game features
2. **Challenge Selection**: Pick from three available challenges
3. **Word Finding**: Form words on the letter grid to reach target score
4. **Shop Phase**: Purchase upgrades with earned coins
5. **Round Progression**: Advance through 8 rounds of increasing difficulty
6. **Victory/Endless**: Win after round 8 or continue in endless mode

## Development Philosophy

This game demonstrates how successful gameplay mechanics from different genres can be thoughtfully combined. By taking Balatro's brilliant progression and upgrade systems and applying them to word puzzle mechanics, we create something that feels both familiar and entirely fresh.

The game respects both source inspirations while forging its own identity in the crowded word game market.

## Target Audience

- **Boggle enthusiasts** looking for deeper progression mechanics
- **Balatro fans** who enjoy strategic upgrade systems
- **Word game players** seeking more engaging meta-progression
- **Mobile gamers** who appreciate polished, strategic gameplay

---

*Word Scramble Master - Where vocabulary meets strategy in an endless word adventure.*