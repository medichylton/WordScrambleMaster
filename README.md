# Word Scramble Master - Python Flask PWA

A mobile-optimized Progressive Web App (PWA) word game built with Flask, featuring power cards with dopamine-inducing visual effects and challenging roguelike progression.

## 🎮 Features

### Core Gameplay
- **4x4 Letter Grid**: Swipe or drag to select adjacent letters
- **Progressive Difficulty**: Exponential target score scaling (75 → 150 → 275 → 450 → 700+)
- **Time Pressure**: Decreasing time limits as levels advance
- **Mobile-First**: Touch-optimized controls with haptic feedback

### Power Card System
- **12 Unique Power Cards**: Each with distinct visual and gameplay effects
- **Dopamine Effects**: Cards pulse, shake, and show floating bonus points when triggered
- **Strategic Depth**: Cards become essential for higher level progression
- **Fixed Pricing**: Consistent costs based on power level (Common: 15-20, Legendary: 100-150)

### PWA Features
- **Installable**: Can be installed on mobile home screen
- **Offline Support**: Service worker caching for offline play
- **Game Boy Aesthetic**: Retro green color scheme with pixel-perfect styling
- **Mobile Optimized**: Safe area support, viewport fixes, touch gestures

## 🚀 Quick Start

### Installation
```bash
# Clone or create the project directory
mkdir word-scramble-pwa
cd word-scramble-pwa

# Install dependencies
pip install -r requirements.txt

# Run the application
python app.py
```

### Local Development
```bash
# Run in development mode
export FLASK_ENV=development
python app.py
```

### Production Deployment
```bash
# Using Gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

## 📱 Mobile Preview

### On Local Network
1. Find your computer's IP address
2. Run the app: `python app.py`
3. On mobile, visit: `http://YOUR_IP:5000`
4. Add to home screen for full PWA experience

### Deploy Options
- **Heroku**: `git push heroku main`
- **Railway**: Connect GitHub repo
- **PythonAnywhere**: Upload files and configure WSGI
- **Vercel**: Deploy with `vercel` CLI

## 🎯 Power Card Effects

### Common Cards (15-20 coins)
- **Letter Alchemy**: Rare letters (J,Q,X,Z) add +50 points each
- **Coin Storm**: Word-length coin bonuses
- **Time Warp**: +45 seconds time extension

### Uncommon Cards (25-40 coins)  
- **Perfect Storm**: 3-4 letter words get 3x multiplier
- **Vowel Crusher**: +25 per vowel + 3x multiplier
- **Chain Lightning**: Consecutive word bonuses (50%/100%/200%)
- **Golden Touch**: 40% chance for 3x score

### Rare Cards (50-80 coins)
- **Word Mirage**: 35% chance to score twice
- **Word Titan**: 6+ letter words get 4x multiplier  
- **Score Doubler**: ALL scores multiplied by 2.5x

### Legendary Cards (100-150 coins)
- **Score Avalanche**: Every 3rd word gets 5x multiplier
- **Word God**: +100 base points to all words

## 🎨 Visual Effects

### Power Card Animations
- **Pulse & Shake**: Cards animate when triggered
- **Color Flip**: Background flips from dark to light green
- **Floating Points**: Bonus points float upward and fade
- **Haptic Feedback**: Mobile vibration patterns
- **Staggered Timing**: Multiple effects cascade beautifully

### Game Boy Styling
- **Authentic Colors**: #0f380f, #306230, #8bac0f, #9bbc0f
- **Pixel Perfect**: Crisp edges, no anti-aliasing
- **Retro Typography**: Monospace fonts throughout
- **Mobile Safe Areas**: Respects device notches and curves

## 🏗️ Project Structure

```
word-scramble-pwa/
├── app.py                 # Flask backend with all game logic
├── requirements.txt       # Python dependencies
├── sw.js                 # Service worker for PWA features
├── templates/
│   └── game.html         # Main game template
├── static/
│   ├── css/
│   │   └── style.css     # Game Boy styling + animations
│   ├── js/
│   │   └── game.js       # Frontend game logic + effects
│   ├── icons/
│   │   ├── icon-192.png  # PWA icons (create these)
│   │   └── icon-512.png
│   └── manifest.json     # PWA manifest
```

## 🔧 Technical Implementation

### Backend Features
- **Session Management**: Persistent game state across requests
- **Power Card Engine**: Dynamic effect calculation system
- **Shop Generation**: Randomized but balanced item selection
- **Difficulty Scaling**: Mathematical progression formulas

### Frontend Features
- **Touch Controls**: Drag-to-select letter paths
- **Visual Feedback**: Immediate response to all interactions
- **Responsive Design**: Works on all screen sizes
- **Progressive Enhancement**: Works without JavaScript (basic mode)

### PWA Features
- **Service Worker**: Caches game assets for offline play
- **App Manifest**: Enables installation on mobile devices
- **Install Prompts**: Smart installation suggestions
- **Background Sync**: Future-ready for offline actions

## 🎯 Gameplay Balance

### Difficulty Progression
```
Level 1: 75 points    (achievable without power cards)
Level 2: 150 points   (challenging, 1 power card helpful)
Level 3: 275 points   (requires strategy)
Level 4: 450 points   (need power card synergy)
Level 5: 700 points   (seriously challenging)
Level 6+: Exponential scaling (requires mastery)
```

### Scoring System
- 2-letter words: 8 points
- 3-letter words: 12 points  
- 4-letter words: 18 points
- 5-letter words: 25 points
- 6-letter words: 35 points
- 7-letter words: 50 points
- 8+ letter words: 70 points

## 🚀 Future Enhancements

- **Daily Challenges**: Special grid configurations
- **Leaderboards**: Social competition features
- **More Power Cards**: Expand the strategic depth
- **Sound Effects**: Audio feedback for enhanced dopamine
- **Achievements**: Progress tracking and rewards
- **Multiplayer**: Real-time competitive modes

## 🎮 Controls

### Desktop
- **Mouse**: Click and drag to select letters
- **Keyboard**: Enter to submit, Escape to clear

### Mobile
- **Touch**: Tap and drag across adjacent letters
- **Gestures**: Swipe patterns for word selection
- **Haptic**: Vibration feedback on power card triggers

## 📄 License

Open source - feel free to fork and modify!

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Add your enhancements
4. Test on multiple devices
5. Submit a pull request

---

**Ready to play?** Run `python app.py` and start building your power card collection! 🎮