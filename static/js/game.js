// Word Scramble Master - Roguelike Deckbuilder
// Updated for pixel-art, mobile-optimized UI and new HTML structure

let gameState = {};
let timer = null;
let selectedCells = [];
let isSelecting = false;
let currentWord = '';

// DOM Elements
const elements = {
    // Phases
    menuPhase: document.getElementById('menu-phase'),
    challengeSelectPhase: document.getElementById('challenge-phase'),
    playingPhase: document.getElementById('playing-phase'),
    shopPhase: document.getElementById('shop-phase'),
    gameOverPhase: document.getElementById('game-over-phase'),
    victoryPhase: document.getElementById('victory-phase'),
    
    // Menu
    startGameBtn: document.getElementById('start-game'),
    viewStatsBtn: document.getElementById('view-stats'),
    settingsBtn: document.getElementById('settings'),
    bestScore: document.getElementById('best-score'),
    gamesWon: document.getElementById('games-won'),
    
    // Challenge Select
    currentAnte: document.getElementById('current-ante'),
    currentRound: document.getElementById('current-round'),
    gameScore: document.getElementById('game-score'),
    playerMoney: document.getElementById('player-money'),
    powerDeck: document.getElementById('power-deck'),
    startRoundBtn: document.getElementById('start-round'),
    backToMenuBtn: document.getElementById('back-to-menu'),
    
    // Playing Phase
    playingAnte: document.getElementById('playing-ante'),
    playingRound: document.getElementById('playing-round'),
    playingScore: document.getElementById('playing-score'),
    gameTimer: document.getElementById('game-timer'),
    attemptsLeft: document.getElementById('attempts-left'),
    currentWordDisplay: document.getElementById('current-word'),
    wordValidation: document.getElementById('word-validation'),
    letterGrid: document.getElementById('letter-grid'),
    submitWordBtn: document.getElementById('submit-word'),
    clearWordBtn: document.getElementById('clear-word'),
    forfeitRoundBtn: document.getElementById('forfeit-round'),
    activePowers: document.getElementById('active-powers'),
    
    // Shop
    shopMoney: document.getElementById('shop-money'),
    shopRoundStatus: document.getElementById('shop-round-status'),
    shopCards: document.getElementById('shop-cards'),
    shopUpgrades: document.getElementById('shop-upgrades'),
    shopPacks: document.getElementById('shop-packs'),
    continueAdventureBtn: document.getElementById('continue-adventure'),
    skipShopBtn: document.getElementById('skip-shop'),
    
    // Game Over / Victory
    finalScore: document.getElementById('final-score'),
    antesCompleted: document.getElementById('antes-completed'),
    bestWord: document.getElementById('best-word'),
    playAgainBtn: document.getElementById('play-again'),
    backToMenuOverBtn: document.getElementById('back-to-menu-over'),
    victoryScore: document.getElementById('victory-score'),
    victoryMoney: document.getElementById('victory-money'),
    cardsCollected: document.getElementById('cards-collected'),
    newGamePlusBtn: document.getElementById('new-game-plus'),
    backToMenuVictoryBtn: document.getElementById('back-to-menu-victory'),
    
    // Messages & Effects
    messageContainer: document.getElementById('message-container'),
    effectsContainer: document.getElementById('effects-container')
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
    // Menu
    if (elements.startGameBtn) elements.startGameBtn.addEventListener('click', startNewGame);
    if (elements.viewStatsBtn) elements.viewStatsBtn.addEventListener('click', showStats);
    if (elements.settingsBtn) elements.settingsBtn.addEventListener('click', showSettings);
    
    // Challenge
    if (elements.startRoundBtn) elements.startRoundBtn.addEventListener('click', startChallenge);
    if (elements.backToMenuBtn) elements.backToMenuBtn.addEventListener('click', () => showPhase('menu'));
    
    // Playing
    if (elements.submitWordBtn) elements.submitWordBtn.addEventListener('click', submitWord);
    if (elements.clearWordBtn) elements.clearWordBtn.addEventListener('click', clearSelection);
    if (elements.forfeitRoundBtn) elements.forfeitRoundBtn.addEventListener('click', forfeitRound);
    
    // Shop
    if (elements.continueAdventureBtn) elements.continueAdventureBtn.addEventListener('click', continueToNextRound);
    if (elements.skipShopBtn) elements.skipShopBtn.addEventListener('click', continueToNextRound);
    
    // Game Over / Victory
    if (elements.playAgainBtn) elements.playAgainBtn.addEventListener('click', startNewGame);
    if (elements.backToMenuOverBtn) elements.backToMenuOverBtn.addEventListener('click', () => showPhase('menu'));
    if (elements.newGamePlusBtn) elements.newGamePlusBtn.addEventListener('click', startNewGame);
    if (elements.backToMenuVictoryBtn) elements.backToMenuVictoryBtn.addEventListener('click', () => showPhase('menu'));
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
    
    // Update stats for end screens
    if (phase === 'game_over') updateGameOverStats();
    if (phase === 'victory') updateVictoryStats();
}

function updateDisplay() {
    if (!gameState) return;
    
    // Menu displays
    if (elements.bestScore) elements.bestScore.textContent = gameState.best_score || 0;
    if (elements.gamesWon) elements.gamesWon.textContent = gameState.games_won || 0;
    
    // Challenge select displays
    if (elements.currentAnte) elements.currentAnte.textContent = gameState.ante || 1;
    if (elements.currentRound) elements.currentRound.textContent = `${gameState.round || 1}/3`;
    if (elements.gameScore) elements.gameScore.textContent = gameState.score || 0;
    if (elements.playerMoney) elements.playerMoney.textContent = gameState.coins || 10;
    
    // Playing phase displays
    if (elements.playingAnte) elements.playingAnte.textContent = gameState.ante || 1;
    if (elements.playingRound) elements.playingRound.textContent = `${gameState.round || 1}/3`;
    if (elements.playingScore) elements.playingScore.textContent = gameState.score || 0;
    if (elements.attemptsLeft) elements.attemptsLeft.textContent = gameState.words_remaining || 3;
    
    // Shop displays
    if (elements.shopMoney) elements.shopMoney.textContent = gameState.coins || 0;
    if (elements.shopRoundStatus) elements.shopRoundStatus.textContent = `${gameState.round || 1}/3`;
    
    // Update power deck
    renderPowerDeck();
    
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
    if (!gameState.power_deck) return;
    
    // Render in challenge select phase
    if (elements.powerDeck) {
        elements.powerDeck.innerHTML = '';
        gameState.power_deck.forEach(card => {
            const cardElement = document.createElement('div');
            cardElement.className = 'power-card';
            cardElement.innerHTML = `
                <div class="power-card-icon">${card.icon || '⚡'}</div>
                <div class="power-card-name">${card.name}</div>
                <div class="power-card-description">${card.description}</div>
                <div class="power-card-level">Lv.${card.level || 1}</div>
            `;
            elements.powerDeck.appendChild(cardElement);
        });
    }
    
    // Render in playing phase
    if (elements.activePowers) {
        elements.activePowers.innerHTML = '';
        gameState.power_deck.forEach(card => {
            const cardElement = document.createElement('div');
            cardElement.className = 'power-card';
            cardElement.innerHTML = `
                <div class="power-card-icon">${card.icon || '⚡'}</div>
                <div class="power-card-name">${card.name}</div>
                <div class="power-card-description">${card.description}</div>
                <div class="power-card-level">Lv.${card.level || 1}</div>
            `;
            elements.activePowers.appendChild(cardElement);
        });
    }
}

function showStats() {
    showMessage('Stats feature coming soon!', 'info');
}

function showSettings() {
    showMessage('Settings feature coming soon!', 'info');
}

function forfeitRound() {
    if (confirm('Are you sure you want to forfeit this round?')) {
        fetch('/api/forfeit_round', { method: 'POST' })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    gameState = data.game_state;
                    showPhase('game_over');
                    updateDisplay();
                }
            })
            .catch(error => console.error('Error forfeiting round:', error));
    }
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
    
    if (elements.currentWordDisplay) {
        elements.currentWordDisplay.textContent = currentWord || 'Select letters...';
    }
    
    // Update validation display
    if (elements.wordValidation) {
        if (currentWord.length >= 2) {
            elements.wordValidation.textContent = 'Checking...';
            elements.wordValidation.className = 'word-validation checking';
        } else {
            elements.wordValidation.textContent = '';
            elements.wordValidation.className = 'word-validation';
        }
    }
    
    // Enable/disable submit button
    if (elements.submitWordBtn) {
        elements.submitWordBtn.disabled = currentWord.length < 2;
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
            if (elements.gameTimer) {
                elements.gameTimer.textContent = gameState.time_remaining;
                
                // Timer warning colors and classes
                if (gameState.time_remaining <= 10) {
                    elements.gameTimer.classList.add('warning');
                } else {
                    elements.gameTimer.classList.remove('warning');
                }
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
    if (!elements.shopCards) return;
    elements.shopCards.innerHTML = '';
    
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
        
        elements.shopCards.appendChild(cardElement);
    });
}

function renderShopUpgrades(upgrades) {
    if (!elements.shopUpgrades) return;
    elements.shopUpgrades.innerHTML = '';
    
    if (upgrades.length === 0) {
        elements.shopUpgrades.innerHTML = '<div class="no-upgrades">No upgrades available</div>';
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
        
        elements.shopUpgrades.appendChild(upgradeElement);
    });
}

function renderShopPacks(packs) {
    if (!elements.shopPacks) return;
    elements.shopPacks.innerHTML = '';
    
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
        
        elements.shopPacks.appendChild(packElement);
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

function updateGameOverStats() {
    if (elements.finalScore) elements.finalScore.textContent = gameState.run_stats?.total_score || 0;
    if (elements.finalWords) elements.finalWords.textContent = gameState.run_stats?.total_words || 0;
    if (elements.finalRounds) elements.finalRounds.textContent = gameState.run_stats?.rounds_completed || (gameState.ante - 1) * 3 + (gameState.round - 1);
}

function updateVictoryStats() {
    if (elements.victoryScore) elements.victoryScore.textContent = gameState.run_stats?.total_score || 0;
    if (elements.victoryWords) elements.victoryWords.textContent = gameState.run_stats?.total_words || 0;
} 