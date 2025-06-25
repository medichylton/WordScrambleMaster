// Word Scramble Master - Roguelike Deckbuilder
let gameState = {};
let timer = null;
let selectedCells = [];
let isSelecting = false;
let currentWord = '';

// DOM Elements
const elements = {
    // Phases
    menuPhase: document.getElementById('menuPhase'),
    challengeSelectPhase: document.getElementById('challengeSelectPhase'),
    playingPhase: document.getElementById('playingPhase'),
    shopPhase: document.getElementById('shopPhase'),
    gameOverPhase: document.getElementById('gameOverPhase'),
    victoryPhase: document.getElementById('victoryPhase'),
    
    // Menu
    newGameBtn: document.getElementById('newGameBtn'),
    continueBtn: document.getElementById('continueBtn'),
    settingsBtn: document.getElementById('settingsBtn'),
    
    // Challenge Select
    anteDisplay: document.getElementById('anteDisplay'),
    roundDisplay: document.getElementById('roundDisplay'),
    goalScore: document.getElementById('goalScore'),
    timeLimit: document.getElementById('timeLimit'),
    attemptsLimit: document.getElementById('attemptsLimit'),
    coinReward: document.getElementById('coinReward'),
    startChallengeBtn: document.getElementById('startChallengeBtn'),
    
    // Playing Phase
    coinsDisplay: document.getElementById('coinsDisplay'),
    scoreDisplay: document.getElementById('scoreDisplay'),
    targetDisplay: document.getElementById('targetDisplay'),
    timerDisplay: document.getElementById('timerDisplay'),
    wordsRemainingDisplay: document.getElementById('wordsRemainingDisplay'),
    powerDeckContainer: document.getElementById('powerDeckContainer'),
    letterGrid: document.getElementById('letterGrid'),
    currentWordDisplay: document.getElementById('currentWord'),
    wordValidation: document.getElementById('wordValidation'),
    shuffleBtn: document.getElementById('shuffleBtn'),
    
    // Shop
    shopCoinsDisplay: document.getElementById('shopCoinsDisplay'),
    shopCardsContainer: document.getElementById('shopCardsContainer'),
    shopUpgradesContainer: document.getElementById('shopUpgradesContainer'),
    shopPacksContainer: document.getElementById('shopPacksContainer'),
    refreshShopBtn: document.getElementById('refreshShopBtn'),
    continueShopBtn: document.querySelector('#shopPhase #continueBtn'),
    
    // Messages
    messageContainer: document.getElementById('messageContainer'),
    effectsContainer: document.getElementById('effectsContainer')
};

// Initialize Game
document.addEventListener('DOMContentLoaded', () => {
    initializeGame();
    setupEventListeners();
});

function initializeGame() {
    loadGameState();
    showPhase(gameState.game_phase || 'menu');
}

function setupEventListeners() {
    // Menu buttons
    elements.newGameBtn.addEventListener('click', startNewGame);
    elements.startChallengeBtn.addEventListener('click', startChallenge);
    elements.shuffleBtn.addEventListener('click', shuffleGrid);
    elements.continueShopBtn.addEventListener('click', continueToNextRound);
    
    // Grid interaction (will be set when grid is rendered)
}

function loadGameState() {
    fetch('/api/game_state')
        .then(response => response.json())
        .then(data => {
            gameState = data;
            updateDisplay();
        })
        .catch(error => console.error('Error loading game state:', error));
}

function startNewGame() {
    fetch('/api/start_game', { method: 'POST' })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                gameState = data.game_state;
                showPhase('challenge_select');
                updateDisplay();
            }
        })
        .catch(error => console.error('Error starting game:', error));
}

function startChallenge() {
    fetch('/api/select_challenge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'standard' })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            gameState = data.game_state;
            showPhase('playing');
            updateDisplay();
            renderGrid();
            startTimer();
        }
    })
    .catch(error => console.error('Error starting challenge:', error));
}

function showPhase(phase) {
    // Hide all phases
    Object.values(elements).forEach(el => {
        if (el && el.classList && el.classList.contains('game-phase')) {
            el.classList.add('hidden');
        }
    });
    
    // Show current phase
    const phaseMap = {
        'menu': elements.menuPhase,
        'challenge_select': elements.challengeSelectPhase,
        'playing': elements.playingPhase,
        'shop': elements.shopPhase,
        'game_over': elements.gameOverPhase,
        'victory': elements.victoryPhase
    };
    
    const currentPhase = phaseMap[phase];
    if (currentPhase) {
        currentPhase.classList.remove('hidden');
    }
    
    // Stop timer if not in playing phase
    if (phase !== 'playing' && timer) {
        clearInterval(timer);
        timer = null;
    }
    
    // Load shop items if entering shop
    if (phase === 'shop') {
        loadShopItems();
    }
}

function updateDisplay() {
    if (!gameState) return;
    
    // Update common displays
    if (elements.coinsDisplay) elements.coinsDisplay.textContent = gameState.coins || 0;
    if (elements.scoreDisplay) elements.scoreDisplay.textContent = gameState.score || 0;
    if (elements.targetDisplay) elements.targetDisplay.textContent = gameState.goal_score || 0;
    if (elements.wordsRemainingDisplay) elements.wordsRemainingDisplay.textContent = gameState.words_remaining || 0;
    
    // Update challenge select displays
    if (elements.anteDisplay) elements.anteDisplay.textContent = `Ante ${gameState.ante || 1}`;
    if (elements.roundDisplay) elements.roundDisplay.textContent = `Round ${gameState.round || 1}`;
    if (elements.goalScore) elements.goalScore.textContent = gameState.goal_score || 300;
    if (elements.timeLimit) elements.timeLimit.textContent = gameState.time_remaining || 120;
    if (elements.attemptsLimit) elements.attemptsLimit.textContent = gameState.words_remaining || 3;
    
    // Update shop display
    if (elements.shopCoinsDisplay) elements.shopCoinsDisplay.textContent = gameState.coins || 0;
    
    // Update power deck
    renderPowerDeck();
}

function renderGrid() {
    if (!gameState.grid) return;
    
    elements.letterGrid.innerHTML = '';
    elements.letterGrid.className = 'letter-grid';
    
    const gridSize = gameState.grid.length;
    elements.letterGrid.style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`;
    
    gameState.grid.forEach((row, rowIndex) => {
        row.forEach((letter, colIndex) => {
            const cell = document.createElement('div');
            cell.className = 'letter-cell';
            cell.textContent = letter;
            cell.dataset.row = rowIndex;
            cell.dataset.col = colIndex;
            
            // Add event listeners for cell selection
            cell.addEventListener('mousedown', (e) => handleCellStart(e, rowIndex, colIndex));
            cell.addEventListener('mouseenter', (e) => handleCellEnter(e, rowIndex, colIndex));
            cell.addEventListener('touchstart', (e) => handleCellStart(e, rowIndex, colIndex));
            cell.addEventListener('touchmove', handleTouchMove);
            
            elements.letterGrid.appendChild(cell);
        });
    });
    
    // Add global mouse/touch end listeners
    document.addEventListener('mouseup', handleSelectionEnd);
    document.addEventListener('touchend', handleSelectionEnd);
}

function renderPowerDeck() {
    if (!gameState.power_deck || !elements.powerDeckContainer) return;
    
    elements.powerDeckContainer.innerHTML = '';
    
    gameState.power_deck.forEach(card => {
        const cardElement = document.createElement('div');
        cardElement.className = 'power-card';
        cardElement.innerHTML = `
            <div class="power-card-icon">${card.icon}</div>
            <div class="power-card-name">${card.name}</div>
            <div class="power-card-description">${card.description}</div>
        `;
        elements.powerDeckContainer.appendChild(cardElement);
    });
}

function handleCellStart(e, row, col) {
    e.preventDefault();
    isSelecting = true;
    selectedCells = [{row, col}];
    updateWordDisplay();
    updateCellStyles();
}

function handleCellEnter(e, row, col) {
    if (!isSelecting) return;
    
    const lastCell = selectedCells[selectedCells.length - 1];
    if (!lastCell) return;
    
    // Check if adjacent
    const rowDiff = Math.abs(row - lastCell.row);
    const colDiff = Math.abs(col - lastCell.col);
    
    if (rowDiff <= 1 && colDiff <= 1 && (rowDiff + colDiff > 0)) {
        // Check if already in path (for backtracking)
        const existingIndex = selectedCells.findIndex(cell => cell.row === row && cell.col === col);
        
        if (existingIndex === -1) {
            selectedCells.push({row, col});
        } else if (existingIndex === selectedCells.length - 2) {
            selectedCells.pop(); // Backtrack
        }
        
        updateWordDisplay();
        updateCellStyles();
    }
}

function handleTouchMove(e) {
    if (!isSelecting) return;
    e.preventDefault();
    
    const touch = e.touches[0];
    const element = document.elementFromPoint(touch.clientX, touch.clientY);
    
    if (element && element.classList.contains('letter-cell')) {
        const row = parseInt(element.dataset.row);
        const col = parseInt(element.dataset.col);
        handleCellEnter(e, row, col);
    }
}

function handleSelectionEnd(e) {
    if (!isSelecting) return;
    
    isSelecting = false;
    
    if (currentWord.length >= 2) {
        submitWord();
    } else {
        clearSelection();
    }
}

function updateWordDisplay() {
    currentWord = selectedCells.map(cell => 
        gameState.grid[cell.row][cell.col]
    ).join('');
    
    elements.currentWordDisplay.textContent = currentWord || 'TAP LETTERS TO SPELL';
    
    // Update validation display
    if (currentWord.length >= 2) {
        elements.wordValidation.textContent = 'Checking...';
        elements.wordValidation.className = 'word-validation checking';
    } else {
        elements.wordValidation.textContent = '';
        elements.wordValidation.className = 'word-validation';
    }
}

function updateCellStyles() {
    // Reset all cells
    document.querySelectorAll('.letter-cell').forEach(cell => {
        cell.classList.remove('selected', 'in-path');
    });
    
    // Style selected cells
    selectedCells.forEach((cellPos, index) => {
        const cell = document.querySelector(`[data-row="${cellPos.row}"][data-col="${cellPos.col}"]`);
        if (cell) {
            if (index === selectedCells.length - 1) {
                cell.classList.add('selected');
            } else {
                cell.classList.add('in-path');
            }
        }
    });
}

function clearSelection() {
    selectedCells = [];
    currentWord = '';
    updateWordDisplay();
    updateCellStyles();
}

function submitWord() {
    if (currentWord.length < 2) return;
    
    fetch('/api/submit_word', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ word: currentWord })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            gameState.score = data.total_score;
            gameState.found_words = gameState.found_words || [];
            gameState.found_words.push(data.word);
            gameState.words_remaining = data.words_remaining;
            
            // Show power card effects
            if (data.effects && data.effects.length > 0) {
                showPowerCardEffects(data.effects);
            }
            
            showMessage(data.message, 'success');
            
            // Check round completion
            if (data.round_complete) {
                setTimeout(() => {
                    loadGameState(); // Refresh state
                    showPhase(gameState.game_phase);
                }, 1000);
            }
            
            updateDisplay();
        } else {
            showMessage(data.message, 'error');
        }
        
        clearSelection();
    })
    .catch(error => {
        console.error('Error submitting word:', error);
        showMessage('Network error - try again', 'error');
        clearSelection();
    });
}

function startTimer() {
    if (timer) clearInterval(timer);
    
    timer = setInterval(() => {
        if (gameState.time_remaining > 0) {
            gameState.time_remaining--;
            elements.timerDisplay.textContent = gameState.time_remaining;
            
            // Timer warning colors
            if (gameState.time_remaining <= 10) {
                elements.timerDisplay.style.color = '#ff0000';
            } else if (gameState.time_remaining <= 30) {
                elements.timerDisplay.style.color = '#ff6600';
            }
        } else {
            clearInterval(timer);
            // Time's up - force game over
            gameState.game_phase = 'game_over';
            showPhase('game_over');
        }
    }, 1000);
}

function shuffleGrid() {
    if (gameState.coins < 30) {
        showMessage('Not enough coins! Need 30 coins.', 'error');
        return;
    }
    
    // Simple shuffle by regenerating grid (placeholder)
    fetch('/api/game_state')
        .then(response => response.json())
        .then(data => {
            gameState = data;
            gameState.coins -= 30;
            renderGrid();
            updateDisplay();
            showMessage('Grid shuffled!', 'success');
        });
}

function loadShopItems() {
    fetch('/api/shop_items')
        .then(response => response.json())
        .then(data => {
            renderShopCards(data.cards || []);
            renderShopUpgrades(data.upgrades || []);
            renderShopPacks(data.packs || []);
        })
        .catch(error => console.error('Error loading shop:', error));
}

function renderShopCards(cards) {
    elements.shopCardsContainer.innerHTML = '';
    
    cards.forEach(card => {
        const cardElement = document.createElement('div');
        cardElement.className = 'shop-card';
        cardElement.innerHTML = `
            <div class="shop-card-header">
                <span class="shop-card-icon">${card.icon}</span>
                <span class="shop-card-name">${card.name}</span>
                <span class="shop-card-rarity ${card.rarity.toLowerCase()}">${card.rarity}</span>
            </div>
            <div class="shop-card-description">${card.description}</div>
            <div class="shop-card-footer">
                <span class="shop-card-cost">💰 ${card.cost}</span>
                <button class="purchase-btn gb-button ${gameState.coins >= card.cost ? 'primary' : 'disabled'}" 
                        ${gameState.coins >= card.cost ? '' : 'disabled'}>
                    ${gameState.coins >= card.cost ? 'Buy' : 'Too Expensive'}
                </button>
            </div>
        `;
        
        if (gameState.coins >= card.cost) {
            cardElement.querySelector('.purchase-btn').addEventListener('click', () => purchaseItem(card));
        }
        
        elements.shopCardsContainer.appendChild(cardElement);
    });
}

function renderShopUpgrades(upgrades) {
    elements.shopUpgradesContainer.innerHTML = '';
    
    if (upgrades.length === 0) {
        elements.shopUpgradesContainer.innerHTML = '<div class="no-upgrades">No upgrades available</div>';
        return;
    }
    
    upgrades.forEach(upgrade => {
        const upgradeElement = document.createElement('div');
        upgradeElement.className = 'shop-upgrade';
        upgradeElement.innerHTML = `
            <div class="upgrade-header">
                <span class="upgrade-icon">${upgrade.icon}</span>
                <span class="upgrade-name">${upgrade.name}</span>
            </div>
            <div class="upgrade-description">${upgrade.description}</div>
            <div class="upgrade-footer">
                <span class="upgrade-cost">💰 ${upgrade.cost}</span>
                <button class="upgrade-btn gb-button ${gameState.coins >= upgrade.cost ? 'primary' : 'disabled'}" 
                        ${gameState.coins >= upgrade.cost ? '' : 'disabled'}>
                    ${gameState.coins >= upgrade.cost ? 'Upgrade' : 'Too Expensive'}
                </button>
            </div>
        `;
        
        if (gameState.coins >= upgrade.cost) {
            upgradeElement.querySelector('.upgrade-btn').addEventListener('click', () => purchaseItem(upgrade));
        }
        
        elements.shopUpgradesContainer.appendChild(upgradeElement);
    });
}

function renderShopPacks(packs) {
    elements.shopPacksContainer.innerHTML = '';
    
    packs.forEach(pack => {
        const packElement = document.createElement('div');
        packElement.className = 'shop-pack';
        packElement.innerHTML = `
            <div class="pack-header">
                <span class="pack-icon">${pack.icon}</span>
                <span class="pack-name">${pack.name}</span>
            </div>
            <div class="pack-description">${pack.description}</div>
            <div class="pack-footer">
                <span class="pack-cost">💰 ${pack.cost}</span>
                <button class="pack-btn gb-button ${gameState.coins >= pack.cost ? 'primary' : 'disabled'}" 
                        ${gameState.coins >= pack.cost ? '' : 'disabled'}>
                    ${gameState.coins >= pack.cost ? 'Open' : 'Too Expensive'}
                </button>
            </div>
        `;
        
        if (gameState.coins >= pack.cost) {
            packElement.querySelector('.pack-btn').addEventListener('click', () => purchaseItem(pack));
        }
        
        elements.shopPacksContainer.appendChild(packElement);
    });
}

function purchaseItem(item) {
    fetch('/api/purchase_item', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ item: item })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            gameState.coins = data.coins;
            showMessage(data.message, 'success');
            updateDisplay();
            loadShopItems(); // Refresh shop
        } else {
            showMessage(data.message, 'error');
        }
    })
    .catch(error => {
        console.error('Error purchasing item:', error);
        showMessage('Error purchasing item', 'error');
    });
}

function continueToNextRound() {
    fetch('/api/continue_to_next_round', { method: 'POST' })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                gameState = data.game_state;
                showPhase(gameState.game_phase);
                updateDisplay();
            }
        })
        .catch(error => console.error('Error continuing to next round:', error));
}

function showPowerCardEffects(effects) {
    effects.forEach((effect, index) => {
        setTimeout(() => {
            const effectElement = document.createElement('div');
            effectElement.className = 'power-effect';
            effectElement.innerHTML = `
                <div class="effect-icon">${effect.icon}</div>
                <div class="effect-text">+${effect.bonus}</div>
            `;
            
            elements.effectsContainer.appendChild(effectElement);
            
            // Add vibration on mobile
            if (navigator.vibrate) {
                navigator.vibrate([50, 50, 100]);
            }
            
            // Remove after animation
            setTimeout(() => {
                effectElement.remove();
            }, 2000);
        }, index * 300);
    });
}

function showMessage(text, type = 'info') {
    const message = document.createElement('div');
    message.className = `message message-${type}`;
    message.textContent = text;
    
    elements.messageContainer.appendChild(message);
    
    setTimeout(() => {
        message.remove();
    }, 3000);
} 