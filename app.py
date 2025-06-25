from flask import Flask, render_template, request, jsonify, session
import json
import random
import os
from datetime import datetime

app = Flask(__name__)
app.secret_key = os.environ.get('SECRET_KEY', 'word-scramble-secret-key-2024')

# Power Card Templates
POWER_CARDS = [
    # COMMON CARDS (15-20 coins)
    {
        'name': 'Letter Alchemy',
        'description': 'Rare letters (J,Q,X,Z) add +50 points each',
        'effect_type': 'rareLetterBonus',
        'value': 50,
        'emoji': '🔮',
        'rarity': 'common',
        'base_cost': 15
    },
    {
        'name': 'Coin Storm',
        'description': 'Each word gives +5 coins + length bonus',
        'effect_type': 'coinMultiplier',
        'value': 2.0,
        'emoji': '💰',
        'rarity': 'common',
        'base_cost': 18
    },
    {
        'name': 'Time Warp',
        'description': 'Adds 45 seconds + freezes time for first 10 words',
        'effect_type': 'timeExtender',
        'value': 45,
        'emoji': '⏰',
        'rarity': 'common',
        'base_cost': 20
    },
    
    # UNCOMMON CARDS (25-40 coins)
    {
        'name': 'Perfect Storm',
        'description': 'Short words (3-4 letters) score 3x',
        'effect_type': 'shortWordMultiplier',
        'value': 3.0,
        'max_length': 4,
        'emoji': '🌪️',
        'rarity': 'uncommon',
        'base_cost': 25
    },
    {
        'name': 'Vowel Crusher',
        'description': 'Each vowel adds +25 points + 3x multiplier',
        'effect_type': 'vowelBonus',
        'value': 3.0,
        'emoji': '🎯',
        'rarity': 'uncommon',
        'base_cost': 30
    },
    {
        'name': 'Chain Lightning',
        'description': 'Each consecutive word: 1st=+50%, 2nd=+100%, 3rd=+200%',
        'effect_type': 'chainMultiplier',
        'value': 1.5,
        'emoji': '⛓️',
        'rarity': 'uncommon',
        'base_cost': 35
    },
    {
        'name': 'Golden Touch',
        'description': '40% chance for 3x score multiplier',
        'effect_type': 'goldenLetters',
        'value': 3.0,
        'chance': 0.4,
        'emoji': '✨',
        'rarity': 'uncommon',
        'base_cost': 40
    },
    
    # RARE CARDS (50-80 coins)
    {
        'name': 'Word Mirage',
        'description': '35% chance to score the word TWICE',
        'effect_type': 'wordEcho',
        'chance': 0.35,
        'emoji': '🔄',
        'rarity': 'rare',
        'base_cost': 50
    },
    {
        'name': 'Word Titan',
        'description': '6+ letter words score 4x points',
        'effect_type': 'longWordMultiplier',
        'value': 4.0,
        'min_length': 6,
        'emoji': '📚',
        'rarity': 'rare',
        'base_cost': 65
    },
    {
        'name': 'Score Doubler',
        'description': 'ALL word scores multiplied by 2.5x',
        'effect_type': 'letterMultiplier',
        'value': 2.5,
        'emoji': '⚡',
        'rarity': 'rare',
        'base_cost': 75
    },
    
    # LEGENDARY CARDS (100+ coins)
    {
        'name': 'Score Avalanche',
        'description': 'Every 3rd word scored gets 5x multiplier',
        'effect_type': 'avalancheBonus',
        'interval': 3,
        'value': 5.0,
        'emoji': '🏔️',
        'rarity': 'legendary',
        'base_cost': 100
    },
    {
        'name': 'Word God',
        'description': 'ALL words get +100 base points before multipliers',
        'effect_type': 'baseScoreBonus',
        'value': 100,
        'emoji': '👑',
        'rarity': 'legendary',
        'base_cost': 150
    }
]

def init_game_state():
    """Initialize a new game state"""
    return {
        'level': 1,
        'score': 0,
        'coins': 15,
        'target_score': 75,
        'words_found': [],
        'inventory': [],
        'grid': generate_grid(),
        'word_count': 0,
        'time_remaining': 120
    }

def generate_grid():
    """Generate a 4x4 letter grid"""
    vowels = "AEIOU"
    consonants = "BCDFGHJKLMNPQRSTVWXYZ"
    grid = []
    
    for i in range(4):
        row = []
        for j in range(4):
            # 30% chance for vowels
            if random.random() < 0.3:
                row.append(random.choice(vowels))
            else:
                row.append(random.choice(consonants))
        grid.append(row)
    
    return grid

def calculate_enhanced_score(word, power_cards, word_count):
    """Calculate word score with power card effects"""
    base_score = calculate_base_score(word)
    effects = []
    total_bonus = 0
    
    for card in power_cards:
        original_score = base_score
        card_bonus = 0
        
        if card['effect_type'] == 'letterMultiplier':
            base_score = int(base_score * card['value'])
            card_bonus = base_score - original_score
            
        elif card['effect_type'] == 'vowelBonus':
            vowel_count = sum(1 for c in word.upper() if c in 'AEIOU')
            if vowel_count > 0:
                base_score += vowel_count * 25
                base_score = int(base_score * card['value'])
                card_bonus = base_score - original_score
                
        elif card['effect_type'] == 'chainMultiplier':
            chain_length = min(word_count, 10)
            if chain_length > 0:
                multiplier = 1 + (chain_length * 0.5)
                base_score = int(base_score * multiplier)
                card_bonus = base_score - original_score
                
        elif card['effect_type'] == 'longWordMultiplier':
            if len(word) >= card.get('min_length', 6):
                base_score = int(base_score * card['value'])
                card_bonus = base_score - original_score
                
        elif card['effect_type'] == 'shortWordMultiplier':
            if len(word) <= card.get('max_length', 4):
                base_score = int(base_score * card['value'])
                card_bonus = base_score - original_score
                
        elif card['effect_type'] == 'goldenLetters':
            if random.random() < card.get('chance', 0.4):
                base_score = int(base_score * card['value'])
                card_bonus = base_score - original_score
                
        elif card['effect_type'] == 'wordEcho':
            if random.random() < card.get('chance', 0.35):
                base_score = int(base_score * 2)
                card_bonus = base_score - original_score
                
        elif card['effect_type'] == 'avalancheBonus':
            if (word_count + 1) % card.get('interval', 3) == 0:
                base_score = int(base_score * card['value'])
                card_bonus = base_score - original_score
                
        elif card['effect_type'] == 'rareLetterBonus':
            rare_count = sum(1 for c in word.upper() if c in 'JQXZ')
            if rare_count > 0:
                bonus = rare_count * card['value']
                base_score += bonus
                card_bonus = bonus
                
        elif card['effect_type'] == 'baseScoreBonus':
            base_score += card['value']
            card_bonus = card['value']
        
        # Track effects for animations
        if card_bonus > 0:
            effects.append({
                'card_id': card['id'],
                'card_name': card['name'],
                'emoji': card['emoji'],
                'bonus': card_bonus,
                'message': f"{card['name']}: +{card_bonus} points!"
            })
            total_bonus += card_bonus
    
    return base_score, effects

def calculate_base_score(word):
    """Calculate base word score based on length"""
    length = len(word)
    if length == 2:
        return 8
    elif length == 3:
        return 12
    elif length == 4:
        return 18
    elif length == 5:
        return 25
    elif length == 6:
        return 35
    elif length == 7:
        return 50
    else:  # 8+ letters
        return 70

def is_valid_word(word):
    """Simple word validation - in production, use a real dictionary API"""
    # For demo purposes, accept words 2+ letters
    return len(word) >= 2 and word.isalpha()

@app.route('/')
def index():
    if 'game_state' not in session:
        session['game_state'] = init_game_state()
    return render_template('game.html')

@app.route('/manifest.json')
def manifest():
    return app.send_static_file('manifest.json')

@app.route('/sw.js')
def service_worker():
    return app.send_static_file('sw.js')

@app.route('/api/game_state')
def get_game_state():
    if 'game_state' not in session:
        session['game_state'] = init_game_state()
    return jsonify(session['game_state'])

@app.route('/api/submit_word', methods=['POST'])
def submit_word():
    data = request.json
    word = data['word'].upper()
    
    game_state = session.get('game_state', init_game_state())
    
    # Validate word
    if not is_valid_word(word):
        return jsonify({'success': False, 'message': 'Invalid word'})
    
    if word in game_state['words_found']:
        return jsonify({'success': False, 'message': 'Word already found!'})
    
    # Calculate score with power card effects
    score, effects = calculate_enhanced_score(word, game_state['inventory'], game_state['word_count'])
    
    # Update game state
    game_state['words_found'].append(word)
    game_state['score'] += score
    game_state['word_count'] += 1
    
    # Check level completion
    level_complete = game_state['score'] >= game_state['target_score']
    
    session['game_state'] = game_state
    
    return jsonify({
        'success': True,
        'word': word,
        'score': score,
        'total_score': game_state['score'],
        'effects': effects,
        'level_complete': level_complete,
        'message': f"Found '{word}'! +{score} points"
    })

@app.route('/api/shuffle_grid', methods=['POST'])
def shuffle_grid():
    game_state = session.get('game_state', init_game_state())
    
    if game_state['coins'] >= 10:
        game_state['coins'] -= 10
        game_state['grid'] = generate_grid()
        session['game_state'] = game_state
        
        return jsonify({
            'success': True,
            'grid': game_state['grid'],
            'coins': game_state['coins']
        })
    else:
        return jsonify({'success': False, 'message': 'Not enough coins!'})

@app.route('/api/shop_items')
def get_shop_items():
    """Generate 6 random shop items"""
    level = session.get('game_state', {}).get('level', 1)
    
    # Shuffle and select 6 cards
    available_cards = random.sample(POWER_CARDS, min(6, len(POWER_CARDS)))
    
    shop_items = []
    for card in available_cards:
        # Calculate cost with level scaling
        cost = int(card['base_cost'] * (1 + level * 0.1))
        
        item = {
            'id': f"{card['name'].lower().replace(' ', '_')}_{random.randint(1000, 9999)}",
            'name': card['name'],
            'description': card['description'],
            'effect_type': card['effect_type'],
            'value': card.get('value', 1),
            'emoji': card['emoji'],
            'rarity': card['rarity'],
            'cost': cost,
            'sell_value': int(cost * 0.6)
        }
        
        # Add additional properties
        for key in ['min_length', 'max_length', 'chance', 'interval']:
            if key in card:
                item[key] = card[key]
        
        shop_items.append(item)
    
    return jsonify(shop_items)

@app.route('/api/purchase_item', methods=['POST'])
def purchase_item():
    data = request.json
    item = data['item']
    
    game_state = session.get('game_state', init_game_state())
    
    if game_state['coins'] >= item['cost']:
        game_state['coins'] -= item['cost']
        game_state['inventory'].append(item)
        session['game_state'] = game_state
        
        return jsonify({
            'success': True,
            'coins': game_state['coins'],
            'message': f"Purchased {item['name']}!"
        })
    else:
        return jsonify({
            'success': False,
            'message': 'Not enough coins!'
        })

@app.route('/api/next_level', methods=['POST'])
def next_level():
    game_state = session.get('game_state', init_game_state())
    
    # Advance to next level
    game_state['level'] += 1
    game_state['target_score'] = int(75 * (1.6 ** (game_state['level'] - 1)))
    game_state['grid'] = generate_grid()
    game_state['words_found'] = []
    game_state['score'] = 0
    game_state['word_count'] = 0
    game_state['coins'] += 20  # Level completion bonus
    game_state['time_remaining'] = max(45, 120 - (game_state['level'] - 1) * 10)
    
    session['game_state'] = game_state
    
    return jsonify({
        'success': True,
        'level': game_state['level'],
        'target_score': game_state['target_score'],
        'grid': game_state['grid'],
        'coins': game_state['coins'],
        'time_remaining': game_state['time_remaining']
    })

@app.route('/api/reset_game', methods=['POST'])
def reset_game():
    session['game_state'] = init_game_state()
    return jsonify({'success': True})

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8080))
    debug = os.environ.get('FLASK_ENV') != 'production'
    app.run(debug=debug, host='0.0.0.0', port=port) 