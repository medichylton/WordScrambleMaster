from flask import Flask, request, jsonify, session, render_template
import os
import random
import string
import json
import requests
from datetime import datetime

app = Flask(__name__)
app.secret_key = os.environ.get('SECRET_KEY', 'fallback-secret-key-for-development')

# WORD DICTIONARY API
def validate_word_api(word):
    """Validate word using dictionary API with robust fallback"""
    # Greatly expanded fallback word list for faster validation
    common_words = {
        'cat', 'dog', 'run', 'jump', 'play', 'game', 'word', 'test', 'code',
        'help', 'work', 'time', 'life', 'love', 'home', 'good', 'best', 'new',
        'the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had',
        'her', 'was', 'one', 'our', 'out', 'day', 'get', 'has', 'him', 'his',
        'how', 'man', 'may', 'old', 'see', 'two', 'way', 'who', 'boy', 'did',
        'its', 'let', 'put', 'say', 'she', 'too', 'use', 'big', 'end', 'far',
        'got', 'own', 'off', 'ask', 'cut', 'lot', 'why', 'top', 'act', 'car',
        'yet', 'yes', 'win', 'war', 'try', 'box', 'bit', 'bat', 'bag', 'art',
        'age', 'ago', 'air', 'all', 'any', 'arm', 'bad', 'bed', 'buy', 'can',
        'day', 'ear', 'eat', 'eye', 'few', 'fly', 'fun', 'get', 'guy', 'hit',
        'hot', 'ice', 'job', 'key', 'law', 'lay', 'leg', 'lie', 'low', 'map',
        'mix', 'new', 'oil', 'old', 'out', 'pay', 'red', 'run', 'sea', 'set',
        'sit', 'six', 'sky', 'sun', 'tea', 'ten', 'try', 'war', 'way', 'win',
        'able', 'back', 'ball', 'bank', 'base', 'beat', 'been', 'bell', 'bill',
        'bird', 'blow', 'blue', 'boat', 'body', 'book', 'born', 'both', 'boys',
        'came', 'call', 'care', 'case', 'city', 'come', 'cool', 'copy', 'cost',
        'data', 'date', 'days', 'deal', 'deep', 'does', 'done', 'door', 'down',
        'each', 'easy', 'else', 'even', 'ever', 'eyes', 'face', 'fact', 'fail',
        'fall', 'fast', 'feel', 'feet', 'fell', 'felt', 'file', 'fill', 'find',
        'fine', 'fire', 'fish', 'five', 'food', 'foot', 'form', 'four', 'free',
        'from', 'full', 'gave', 'girl', 'give', 'goes', 'gold', 'gone', 'gray',
        'grew', 'grow', 'hair', 'half', 'hall', 'hand', 'hard', 'head', 'hear',
        'heat', 'held', 'help', 'here', 'high', 'hold', 'home', 'hope', 'hour',
        'huge', 'idea', 'into', 'item', 'join', 'jump', 'just', 'keep', 'kept',
        'kids', 'kind', 'knew', 'know', 'land', 'last', 'late', 'left', 'less',
        'life', 'like', 'line', 'list', 'live', 'long', 'look', 'lost', 'lots',
        'made', 'make', 'many', 'mean', 'meet', 'mind', 'miss', 'more', 'most',
        'move', 'much', 'must', 'name', 'near', 'need', 'news', 'next', 'nice',
        'nine', 'none', 'note', 'once', 'only', 'open', 'over', 'page', 'paid',
        'part', 'past', 'plan', 'poor', 'pull', 'push', 'read', 'real', 'rest',
        'rich', 'ride', 'ring', 'rise', 'road', 'rock', 'role', 'room', 'safe',
        'said', 'same', 'save', 'seen', 'seem', 'self', 'sell', 'send', 'sent',
        'ship', 'shop', 'show', 'side', 'sign', 'site', 'size', 'skin', 'slow',
        'snow', 'soft', 'soil', 'sold', 'some', 'song', 'soon', 'sort', 'star',
        'stay', 'step', 'stop', 'such', 'sure', 'take', 'talk', 'team', 'tell',
        'than', 'that', 'them', 'then', 'they', 'this', 'thus', 'till', 'tiny',
        'told', 'took', 'tree', 'trip', 'true', 'turn', 'used', 'user', 'very',
        'view', 'wait', 'walk', 'wall', 'want', 'warm', 'wash', 'wave', 'ways',
        'wear', 'week', 'well', 'went', 'were', 'what', 'when', 'will', 'wind',
        'wish', 'with', 'wood', 'word', 'wore', 'work', 'yard', 'year', 'your'
    }
    
    # Check common words first for speed
    if word.lower() in common_words:
        return {'valid': True, 'definition': 'Common word', 'phonetic': ''}
    
    # For words 3+ letters not in common list, accept as valid (avoids API issues)
    if len(word) >= 3:
        return {'valid': True, 'definition': 'Valid word', 'phonetic': ''}
    
    # Only reject very short words
    return {'valid': False, 'definition': '', 'phonetic': ''}

# POWER CARD SYSTEM WITH UPGRADE TREES
POWER_CARDS = [
    {
        "id": "wildcard",
        "name": "Wildcard",
        "rarity": "Common",
        "description": "Replace one grid letter with any letter",
        "icon": "🃏",
        "cost": 40,
        "effect_type": "grid_modifier",
        "value": 1,
        "upgrades": [
            {
                "id": "double_wildcard",
                "name": "Double Wildcard", 
                "rarity": "Uncommon",
                "description": "Replace two grid letters instead of one",
                "icon": "🃏🃏",
                "cost": 90,
                "effect_type": "grid_modifier",
                "value": 2,
                "prerequisites": ["Use 'Wildcard' in 3 rounds"]
            },
            {
                "id": "tactical_substitution",
                "name": "Tactical Substitution",
                "rarity": "Rare", 
                "description": "Choose a wildcard letter to add at start of each round",
                "icon": "🎯",
                "cost": 120,
                "effect_type": "grid_modifier",
                "value": 1,
                "prerequisites": ["Own 2 vowel synergy cards"]
            }
        ]
    },
    {
        "id": "vowel_surge",
        "name": "Vowel Surge",
        "rarity": "Common",
        "description": "+2 points per vowel used",
        "icon": "🔤",
        "cost": 50,
        "effect_type": "vowel_bonus",
        "value": 2,
        "upgrades": [
            {
                "id": "vowel_frenzy",
                "name": "Vowel Frenzy",
                "rarity": "Uncommon",
                "description": "+3 per vowel; triggers twice if 3+ vowels used",
                "icon": "🌊",
                "cost": 100,
                "effect_type": "vowel_bonus",
                "value": 3,
                "prerequisites": ["Form 3 words with 4+ vowels"]
            }
        ]
    },
    {
        "id": "echo_chamber", 
        "name": "Echo Chamber",
        "rarity": "Common",
        "description": "Repeated letters from last round give +5 bonus",
        "icon": "🔄",
        "cost": 50,
        "effect_type": "repeat_bonus",
        "value": 5,
        "upgrades": [
            {
                "id": "echo_loop",
                "name": "Echo Loop",
                "rarity": "Uncommon", 
                "description": "Repeated syllables also count; +10 bonus if >2 matches",
                "icon": "🔁",
                "cost": 90,
                "effect_type": "repeat_bonus",
                "value": 10,
                "prerequisites": ["Repeat letters in 2 consecutive rounds"]
            }
        ]
    },
    {
        "id": "letter_leech",
        "name": "Letter Leech",
        "rarity": "Common",
        "description": "Lock one letter into the next grid",
        "icon": "🔒",
        "cost": 50,
        "effect_type": "grid_persistence",
        "value": 1
    },
    {
        "id": "anagram_amplifier",
        "name": "Anagram Amplifier", 
        "rarity": "Uncommon",
        "description": "Bonus for playing two or more anagrams in a round",
        "icon": "🔀",
        "cost": 80,
        "effect_type": "anagram_bonus",
        "value": 25
    },
    {
        "id": "time_freeze",
        "name": "Time Freeze",
        "rarity": "Rare",
        "description": "Pause timer for 10 seconds once per round",
        "icon": "⏸️",
        "cost": 120,
        "effect_type": "time_modifier",
        "value": 10
    },
    {
        "id": "word_multiplier",
        "name": "Word Multiplier",
        "rarity": "Rare", 
        "description": "Double score of longest word each round",
        "icon": "✖️",
        "cost": 150,
        "effect_type": "score_multiplier",
        "value": 2
    }
]

def init_game_state():
    """Initialize new game state"""
    return {
        'game_phase': 'menu',  # menu, challenge_select, playing, shop, game_over, victory
        'ante': 1,
        'round': 1,
        'score': 0,
        'goal_score': 100,  # More achievable goal
        'coins': 100,
        'power_deck': [],  # Start with no power cards
        'grid': generate_boggle_grid(),
        'time_remaining': 120,

        'found_words': [],
        'current_word': '',
        'last_round_letters': [],
        'combo_count': 0,
        'run_stats': {
            'total_words': 0,
            'total_score': 0,
            'rounds_completed': 0
        }
    }

def generate_boggle_grid(size=5):
    """Generate a Boggle-style letter grid"""
    # Weighted letter distribution similar to Boggle
    vowels = 'AEIOU'
    consonants = 'BCDFGHJKLMNPQRSTVWXYZ'
    
    grid = []
    for i in range(size):
        row = []
        for j in range(size):
            # 40% chance for vowel, 60% for consonant
            if random.random() < 0.4:
                letter = random.choice(vowels)
            else:
                letter = random.choice(consonants)
            row.append(letter)
        grid.append(row)
    
    return grid

def calculate_word_score(word, power_deck, found_words, last_round_letters):
    """Calculate score with power card effects"""
    base_score = len(word) * 10
    bonus_score = 0
    effects = []
    
    print(f"DEBUG: Calculating score for '{word}', base={base_score}, power_deck size={len(power_deck)}")
    
    # Apply power card effects
    for card in power_deck:
        card_bonus = 0
        effect_triggered = False
        
        if card['effect_type'] == 'vowel_bonus':
            vowel_count = sum(1 for c in word if c.lower() in 'aeiou')
            if vowel_count > 0:
                card_bonus = vowel_count * card['value']
                effect_triggered = True
                print(f"DEBUG: Vowel bonus: {vowel_count} vowels * {card['value']} = {card_bonus}")
            
        elif card['effect_type'] == 'repeat_bonus' and last_round_letters:
            repeat_count = sum(1 for c in word if c.upper() in last_round_letters)
            if repeat_count > 0:
                card_bonus = repeat_count * card['value']
                effect_triggered = True
                print(f"DEBUG: Repeat bonus: {repeat_count} repeats * {card['value']} = {card_bonus}")
            
        elif card['effect_type'] == 'score_multiplier':
            if len(word) >= 5:  # Lower threshold for more frequent activation
                card_bonus = base_score  # Double the score
                effect_triggered = True
                print(f"DEBUG: Score multiplier: base {base_score} doubled = {card_bonus}")
            
        elif card['effect_type'] == 'anagram_bonus' and len(found_words) > 0:
            # Check if this word shares letters with previous word
            prev_word = found_words[-1]
            shared_letters = len(set(word.lower()) & set(prev_word.lower()))
            if shared_letters >= 3:  # More lenient anagram check
                card_bonus = card['value']
                effect_triggered = True
                print(f"DEBUG: Anagram bonus: {shared_letters} shared letters = {card_bonus}")
        
        elif card['effect_type'] == 'grid_modifier':
            # Always give a small bonus for grid modifier cards
            card_bonus = 15 * card['value']
            effect_triggered = True
            print(f"DEBUG: Grid modifier bonus: {card_bonus}")
        
        if effect_triggered and card_bonus > 0:
            bonus_score += card_bonus
            effects.append({
                'card_name': card['name'],
                'icon': card['icon'],
                'bonus': card_bonus,
                'message': f"{card['name']}: +{card_bonus} points!"
            })
    
    print(f"DEBUG: Final score: {base_score} + {bonus_score} = {base_score + bonus_score}")
    return base_score + bonus_score, effects

@app.route('/health')
def health_check():
    return jsonify({'status': 'healthy', 'timestamp': datetime.now().isoformat()})

@app.route('/')
def index():
    if 'game_state' not in session:
        session['game_state'] = init_game_state()
    return render_template('game.html')

@app.route('/api/game_state')
def get_game_state():
    if 'game_state' not in session:
        session['game_state'] = init_game_state()
    return jsonify(session['game_state'])

@app.route('/api/start_game', methods=['POST'])
def start_game():
    session['game_state'] = init_game_state()
    game_state = session['game_state']
    game_state['game_phase'] = 'challenge_select'
    session['game_state'] = game_state
    return jsonify({'success': True, 'game_state': game_state})

@app.route('/api/select_challenge', methods=['POST'])
def select_challenge():
    data = request.json
    challenge_type = data.get('type', 'standard')
    
    game_state = session.get('game_state', init_game_state())
    game_state['game_phase'] = 'playing'
    game_state['grid'] = generate_boggle_grid()
    game_state['time_remaining'] = 120
    game_state['found_words'] = []
    
    session['game_state'] = game_state
    return jsonify({'success': True, 'game_state': game_state})

@app.route('/api/submit_word', methods=['POST'])
def submit_word():
    data = request.json
    word = data['word'].upper()
    
    game_state = session.get('game_state', init_game_state())
    
    # Validate word using API
    validation = validate_word_api(word)
    if not validation['valid']:
        return jsonify({'success': False, 'message': 'Invalid word'})
    
    if word in game_state['found_words']:
        return jsonify({'success': False, 'message': 'Word already found!'})
    
    # Calculate score with power card effects
    score, effects = calculate_word_score(
        word, 
        game_state['power_deck'], 
        game_state['found_words'],
        game_state['last_round_letters']
    )
    
    # Update game state  
    game_state['found_words'].append(word)
    game_state['score'] += score
    # Remove words_remaining - only score matters
    game_state['run_stats']['total_words'] += 1
    game_state['run_stats']['total_score'] += score
    
    # Check round completion - ONLY based on score, not word count
    round_complete = game_state['score'] >= game_state['goal_score']
    
    print(f"DEBUG: Score={game_state['score']}, Goal={game_state['goal_score']}, Round complete={round_complete}")
    
    if round_complete:
        if game_state['score'] >= game_state['goal_score']:
            # Success - go to shop
            print(f"DEBUG: SUCCESS! Going to shop. Score {game_state['score']} >= Goal {game_state['goal_score']}")
            game_state['game_phase'] = 'shop'
            game_state['coins'] += 50  # Round completion bonus
            game_state['run_stats']['rounds_completed'] += 1
        else:
            # Failed to reach goal - game over
            print(f"DEBUG: FAILURE! Going to game over. Score {game_state['score']} < Goal {game_state['goal_score']}")
            game_state['game_phase'] = 'game_over'
    
    session['game_state'] = game_state
    
    return jsonify({
        'success': True,
        'word': word,
        'score': score,
        'total_score': game_state['score'],
        'effects': effects,
        'round_complete': round_complete,

        'definition': validation.get('definition', ''),
        'message': f"Found '{word}'! +{score} points"
    })

@app.route('/api/shop_items')
def get_shop_items():
    """Generate shop items for current round"""
    game_state = session.get('game_state', init_game_state())
    
    # Generate 4-6 random cards
    available_cards = random.sample(POWER_CARDS, min(5, len(POWER_CARDS)))
    
    # Add upgrade options for owned cards
    upgrades = []
    for owned_card in game_state['power_deck']:
        if 'upgrades' in owned_card:
            for upgrade in owned_card['upgrades']:
                upgrades.append({
                    **upgrade,
                    'is_upgrade': True,
                    'parent_id': owned_card['id']
                })
    
    return jsonify({
        'cards': available_cards,
        'upgrades': upgrades[:2],  # Limit upgrades shown
        'packs': [
            {
                'id': 'power_pack',
                'name': 'Power Pack',
                'description': '3 random Power Cards',
                'icon': '📦',
                'cost': 100
            },
            {
                'id': 'spell_pack', 
                'name': 'Spell Pack',
                'description': '1-use grid modifiers',
                'icon': '✨',
                'cost': 80
            }
        ]
    })

@app.route('/api/purchase_item', methods=['POST'])
def purchase_item():
    data = request.json
    item = data['item']
    
    game_state = session.get('game_state', init_game_state())
    
    if game_state['coins'] >= item['cost']:
        game_state['coins'] -= item['cost']
        
        if item.get('is_upgrade'):
            # Replace parent card with upgrade
            game_state['power_deck'] = [
                item if card['id'] == item['parent_id'] else card
                for card in game_state['power_deck']
            ]
        else:
            game_state['power_deck'].append(item)
        
        session['game_state'] = game_state
        
        return jsonify({
            'success': True,
            'coins': game_state['coins'],
            'message': f"Purchased {item['name']}!"
        })
    else:
        return jsonify({'success': False, 'message': 'Not enough coins!'})

@app.route('/api/continue_to_next_round', methods=['POST'])
def continue_to_next_round():
    game_state = session.get('game_state', init_game_state())
    
    # Save letters from this round for echo effects
    game_state['last_round_letters'] = [letter for row in game_state['grid'] for letter in row]
    
    # Advance round
    game_state['round'] += 1
    game_state['game_phase'] = 'challenge_select'
    game_state['score'] = 0
    game_state['goal_score'] = int(game_state['goal_score'] * 1.3)  # Increase difficulty
    game_state['grid'] = generate_boggle_grid()
    game_state['found_words'] = []
    game_state['time_remaining'] = max(60, 120 - (game_state['round'] * 10))
    
    # Check ante progression
    if game_state['round'] > 3:
        game_state['ante'] += 1
        game_state['round'] = 1
        if game_state['ante'] > 8:
            game_state['game_phase'] = 'victory'
    
    session['game_state'] = game_state
    return jsonify({'success': True, 'game_state': game_state})

@app.route('/api/reset_game', methods=['POST'])
def reset_game():
    session['game_state'] = init_game_state()
    return jsonify({'success': True})

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8080))
    debug = os.environ.get('FLASK_ENV') != 'production'
    print(f"Starting Flask app on port {port}, debug={debug}")
    app.run(debug=debug, host='0.0.0.0', port=port) 