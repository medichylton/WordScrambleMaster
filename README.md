# Word Scramble Master

A modern Boggle-style word game that combines the satisfying word-finding mechanics of Boggle with the addictive progression system of Balatro. Built with React, TypeScript, and Vite for cross-platform deployment.

## 🎮 Game Features

### Core Mechanics
- **Boggle-style Word Finding**: Swipe through connected letters to form words
- **Balatro-inspired Progression**: Roguelike rounds with escalating difficulty
- **Strategic Power-ups**: Letter enhancers, word multipliers, and consumable boosts
- **Economic Decisions**: Coin management, shop phases, and upgrade choices

### Game Structure
- **8 Progressive Rounds**: Each round increases in difficulty
- **3 Challenge Types**:
  - **Quick Words**: Fast-paced word finding with time bonuses
  - **Standard Challenges**: Balanced gameplay with varied objectives
  - **Boss Challenges**: Unique mechanics and high-stakes gameplay
- **Shop Phases**: Purchase power-ups between challenges
- **5 Difficulty Stakes**: From Apprentice to Grandmaster

### Power-up System
- **Letter Enhancers**: Modify individual letters (Vowel Virtuoso, Golden Letters)
- **Word Multipliers**: Affect entire words (Speed Demon, Chain Master)
- **Consumable Boosts**: One-time use items (Grid Shuffle, Time Extensions)

## 🚀 Technology Stack

- **React 18** - Modern UI framework with hooks
- **TypeScript** - Type-safe development
- **Vite** - Fast development and building
- **Tailwind CSS** - Utility-first styling
- **Context API** - Global state management

## 🛠️ Development

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Getting Started
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Project Structure
```
src/
├── components/          # React components
│   ├── GameView.tsx    # Main game interface
│   └── MainMenu.tsx    # Start screen
├── contexts/           # React Context providers
│   └── GameContext.tsx # Game state management
├── hooks/              # Custom React hooks
│   └── useGame.ts      # Game logic hook
├── reducers/           # State reducers
│   └── gameReducer.ts  # Game state reducer
├── types/              # TypeScript definitions
│   └── game.ts         # Game interfaces
├── utils/              # Utility functions
│   └── wordDictionary.ts # Word validation
├── App.tsx             # Main app component
├── main.tsx            # React entry point
└── index.css           # Global styles
```

## 🎯 Game Design Philosophy

**Word Scramble Master** innovates on the classic Boggle formula by adding:

1. **Strategic Depth**: Power-ups create meaningful choices and build variety
2. **Progressive Difficulty**: Each round introduces new challenges and mechanics
3. **Economic Decisions**: Coin management adds another layer of strategy
4. **Replayability**: Randomized grids, power-up combinations, and difficulty stakes

## 🌐 Deployment

This React/TypeScript/Vite project can be deployed to:

- **Web**: Any static hosting service (Vercel, Netlify, GitHub Pages)
- **Mobile**: Using Capacitor or Cordova
- **Desktop**: Using Electron
- **PWA**: Progressive Web App with offline capabilities

### Build Commands
```bash
# Web deployment
npm run build

# Mobile (with Capacitor)
npm install @capacitor/core @capacitor/cli
npx cap init
npx cap add ios
npx cap add android

# Desktop (with Electron)
npm install electron electron-builder
npm run build
npm run electron
```

## 🎨 Game Mechanics

### Challenge Types
- **Quick Challenges**: 60-90 seconds, bonus for speed
- **Standard Challenges**: 2-3 minutes, balanced scoring
- **Boss Challenges**: Unique mechanics (Letter Thief, Time Warden, etc.)

### Power-up Categories
- **Common**: Basic bonuses (10-20% improvements)
- **Uncommon**: Moderate effects (25-50% bonuses)
- **Rare**: Significant advantages (2x multipliers, special abilities)
- **Legendary**: Game-changing effects (grid manipulation, massive bonuses)

### Difficulty Stakes
- **Apprentice**: Learning mode with generous time limits
- **Scholar**: Standard difficulty with increased requirements
- **Expert**: Reduced time and harder letter distributions
- **Master**: Limited power-ups and higher stakes
- **Grandmaster**: Ultimate challenge for word masters

## 🏆 Victory Conditions

Complete all 8 rounds to achieve victory! Each difficulty stake offers different rewards and unlocks new content.

---

Built with ❤️ using React, TypeScript, and Vite