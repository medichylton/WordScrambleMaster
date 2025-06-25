from flask import Flask, request, jsonify, session, render_template
import os
import random
import string
import json
import requests
from datetime import datetime

app = Flask(__name__)
app.secret_key = 'your-secret-key-change-this'

# WORD DICTIONARY API
def validate_word_api(word):
    """Validate word using dictionary API"""
    try:
        # Using Free Dictionary API
        response = requests.get(f"https://api.dictionaryapi.dev/api/v2/entries/en/{word.lower()}", timeout=3)
        if response.status_code == 200:
            data = response.json()
            return {
                'valid': True,
                'definition': data[0]['meanings'][0]['definitions'][0]['definition'] if data else '',
                'phonetic': data[0]['phonetic'] if data and 'phonetic' in data[0] else ''
            }
        return {'valid': False, 'definition': '', 'phonetic': ''}
    except:
        # Fallback validation for basic words
        basic_words = {
            'cat', 'dog', 'run', 'jump', 'play', 'game', 'word', 'test', 'code',
            'help', 'work', 'time', 'life', 'love', 'home', 'good', 'best', 'new'
        }
        return {'valid': word.lower() in basic_words, 'definition': '', 'phonetic': ''}

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
    starter_deck = random.sample([card for card in POWER_CARDS if card['rarity'] == 'Common'], 3)
    
    return {
        'game_phase': 'menu',  # menu, challenge_select, playing, shop, game_over, victory
        'ante': 1,
        'round': 1,
        'score': 0,
        'goal_score': 300,
        'coins': 100,
        'power_deck': starter_deck,
        'grid': generate_boggle_grid(),
        'time_remaining': 120,
        'words_remaining': 3,
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
    
    # Apply power card effects
    for card in power_deck:
        card_bonus = 0
        
        if card['effect_type'] == 'vowel_bonus':
            vowel_count = sum(1 for c in word if c.lower() in 'aeiou')
            card_bonus = vowel_count * card['value']
            
        elif card['effect_type'] == 'repeat_bonus' and last_round_letters:
            repeat_count = sum(1 for c in word if c in last_round_letters)
            card_bonus = repeat_count * card['value']
            
        elif card['effect_type'] == 'score_multiplier' and len(word) >= 6:
            card_bonus = base_score  # Double the score
            
        elif card['effect_type'] == 'anagram_bonus':
            # Check if this word is anagram of previous word
            if found_words and sorted(word.lower()) == sorted(found_words[-1].lower()):
                card_bonus = card['value']
        
        if card_bonus > 0:
            bonus_score += card_bonus
            effects.append({
                'card_name': card['name'],
                'icon': card['icon'],
                'bonus': card_bonus,
                'message': f"{card['name']}: +{card_bonus} points!"
            })
    
    return base_score + bonus_score, effects

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
    game_state['words_remaining'] = 3
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
    game_state['words_remaining'] -= 1
    game_state['run_stats']['total_words'] += 1
    game_state['run_stats']['total_score'] += score
    
    # Check round completion
    round_complete = (game_state['score'] >= game_state['goal_score'] or 
                     game_state['words_remaining'] <= 0)
    
    if round_complete:
        if game_state['score'] >= game_state['goal_score']:
            game_state['game_phase'] = 'shop'
            game_state['coins'] += 50  # Round completion bonus
        else:
            game_state['game_phase'] = 'game_over'
    
    session['game_state'] = game_state
    
    return jsonify({
        'success': True,
        'word': word,
        'score': score,
        'total_score': game_state['score'],
        'effects': effects,
        'round_complete': round_complete,
        'words_remaining': game_state['words_remaining'],
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
    game_state['words_remaining'] = 3
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
    app.run(debug=debug, host='0.0.0.0', port=port) 