# Word Scramble Master - Pyxel Edition

🎮 **A retro word game combining Boggle mechanics with progressive difficulty!**

## 🚀 Quick Start

1. **Install Python 3.7+** on your system
2. **Install Pyxel**: `pip install pyxel`  
3. **Download the game**: `word_scramble_master.py`
4. **Run the game**: `python word_scramble_master.py`

## 🎯 Game Features

### ✅ Fixed Dictionary
- **"halves", "twelve", "eleven", "twenty"** and 1000+ words now recognized
- Comprehensive offline word validation
- No internet connection required

### ⚖️ Fair Game Balance  
- Smart grid generation ensures sufficient word availability
- Always enough words to progress through levels
- Balanced difficulty progression

### 📈 Progressive Difficulty
- **Levels 1-3:** Easier (8-12 words needed, 70-90 seconds)
- **Levels 4-6:** Harder (15-22 words needed, 40-60 seconds) 
- **Boss Level:** Ultimate challenge (30 words, 60 seconds)

### 🎨 Retro Aesthetics
- Authentic 16-bit graphics using Pyxel's classic color palette
- 256x192 resolution for that nostalgic feel
- Pixel-perfect UI design

### 💾 Persistent Progress
- Your scores, coins, and achievements automatically save
- Continue where you left off between gaming sessions
- Game data stored in `game_save.json`

## 🎮 Controls

### Menu Navigation
- **Arrow Keys:** Navigate menus
- **Enter/Space:** Select option
- **Q:** Quit game
- **Escape:** Go back

### Gameplay
- **Arrow Keys:** Move cursor on letter grid
- **Enter:** Select/deselect letter
- **Space:** Submit current word
- **N:** Generate new grid (costs coins)
- **Escape:** Clear current selection

## 📊 Scoring System

| Word Length | Base Points |
|-------------|-------------|
| 3-4 letters | 1 point     |
| 5 letters   | 2 points    |
| 6 letters   | 3 points    |
| 7 letters   | 5 points    |
| 8+ letters  | 11 points   |

**Difficulty Multipliers:**
- Easy: 1.0x
- Medium: 1.5x  
- Hard: 2.0x

## 🏆 Game Modes

### Challenge Progression
Complete increasingly difficult levels with:
- **Progressive word requirements**
- **Decreasing time limits**
- **Escalating point targets**

### Difficulty Settings
- **Easy:** Longer time, fewer words needed
- **Medium:** Balanced challenge
- **Hard:** Maximum difficulty with score multipliers

## 🛠️ Technical Details

- **Engine:** Pyxel (Python retro game engine)
- **Resolution:** 256x192 pixels
- **Colors:** 16-color palette
- **Grid:** Traditional 4x4 Boggle layout
- **Dictionary:** 1000+ common English words

## 🎯 How to Play

1. **Select Difficulty:** Choose Easy, Medium, or Hard
2. **Find Words:** Connect adjacent letters to form words (minimum 3 letters)
3. **Submit Words:** Press Space to submit your current word
4. **Beat the Clock:** Find enough words before time runs out
5. **Progress:** Complete levels to advance through the game
6. **Earn Coins:** Use coins to generate new grids when stuck

## 🔧 Troubleshooting

### Common Issues

**"No module named 'pyxel'"**
- Solution: `pip install pyxel`

**Game won't start**
- Ensure Python 3.7+ is installed
- Check that `word_scramble_master.py` is in your current directory

**Words not being accepted**
- The game uses a curated dictionary of common English words
- Words must be at least 3 letters long
- Letters must be adjacent (including diagonally)

## 📝 Game Data

The game automatically saves your progress to `game_save.json` including:
- High scores
- Coins earned
- Total words found
- Game statistics

## 🎨 Credits

- **Built with:** [Pyxel](https://github.com/kitao/pyxel) by Takashi Kitao
- **Inspired by:** Classic Boggle and modern roguelike progression
- **Game Design:** Combining word-finding with strategic progression

## 📄 License

This game is provided as-is for educational and entertainment purposes.

---

**Enjoy finding words and climbing the difficulty ladder! 🎮✨**