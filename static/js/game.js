// Game State
let gameState = {
    level: 1,
    score: 0,
    coins: 15,
    target_score: 75,
    words_found: [],
    inventory: [],
    grid: [],
    word_count: 0,
    time_remaining: 120
};

let currentWord = '';
let selectedCells = [];
let isSelecting = false;

// DOM Elements
const elements = {
    coinsDisplay: document.getElementById('coinsDisplay'),
    scoreDisplay: document.getElementById('scoreDisplay'),
    levelDisplay: document.getElementById('levelDisplay'),
    powerCardsContainer: document.getElementById('powerCardsContainer'),
    letterGrid: document.getElementById('letterGrid'),
    currentWordDisplay: document.getElementById('currentWord'),

    shuffleBtn: document.getElementById('shuffleBtn'),
    shopBtn: document.getElementById('shopBtn'),
    progressFill: document.getElementById('progressFill'),
    targetScore: document.getElementById('targetScore'),
    messageContainer: document.getElementById('messageContainer'),
    shopModal: document.getElementById('shopModal'),
    shopItems: document.getElementById('shopItems'),
    closeShop: document.getElementById('closeShop'),
    levelCompleteModal: document.getElementById('levelCompleteModal'),
    nextLevelBtn: document.getElementById('nextLevelBtn'),
    loadingScreen: document.getElementById('loadingScreen')
};

// Initialize Game
document.addEventListener('DOMContentLoaded', function() {
    // Fix viewport height for mobile
    setVH();
    window.addEventListener('resize', setVH);
    
    initializeGame();
    setupEventListeners();
});

function setVH() {
    let vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
}

function initializeGame() {
    // Show loading screen
    elements.loadingScreen.classList.remove('hidden');
    
    fetch('/api/game_state')
        .then(response => response.json())
        .then(data => {
            gameState = data;
            updateDisplay();
            renderGrid();
            renderPowerCards();
            
            // Hide loading screen
            setTimeout(() => {
                elements.loadingScreen.classList.add('hidden');
            }, 1000);
        })
        .catch(error => {
            console.error('Error loading game state:', error);
            elements.loadingScreen.classList.add('hidden');
        });
}

function setupEventListeners() {
    // Submit word
    elements.submitBtn.addEventListener('click', submitWord);
    
    // Clear selection
    elements.clearBtn.addEventListener('click', clearSelection);
    
    // Shuffle grid
    elements.shuffleBtn.addEventListener('click', shuffleGrid);
    
    // Open shop
    elements.shopBtn.addEventListener('click', openShop);
    
    // Close shop
    elements.closeShop.addEventListener('click', closeShop);
    
    // Next level
    elements.nextLevelBtn.addEventListener('click', nextLevel);
    
    // Keyboard support
    document.addEventListener('keydown', handleKeyPress);
    
    // Prevent context menu on long press
    document.addEventListener('contextmenu', e => e.preventDefault());
    
    // Prevent zoom on double tap
    let lastTouchEnd = 0;
    document.addEventListener('touchend', function(event) {
        const now = (new Date()).getTime();
        if (now - lastTouchEnd <= 300) {
            event.preventDefault();
        }
        lastTouchEnd = now;
    }, false);
}

function updateDisplay() {
    elements.coinsDisplay.textContent = `🪙 ${gameState.coins}`;
    elements.scoreDisplay.textContent = gameState.score;
    elements.levelDisplay.textContent = `Lv.${gameState.level}`;
    elements.targetScore.textContent = `Target: ${gameState.target_score} points`;
    
    // Update progress bar
    const progress = Math.min((gameState.score / gameState.target_score) * 100, 100);
    elements.progressFill.style.width = `${progress}%`;
    
    // Update button states
    elements.shuffleBtn.disabled = gameState.coins < 10;
    elements.submitBtn.disabled = currentWord.length < 2;
}

function renderGrid() {
    elements.letterGrid.innerHTML = '';
    
    gameState.grid.forEach((row, rowIndex) => {
        row.forEach((letter, colIndex) => {
            const cell = document.createElement('div');
            cell.className = 'letter-cell';
            cell.textContent = letter;
            cell.dataset.row = rowIndex;
            cell.dataset.col = colIndex;
            
            // Touch events for mobile
            cell.addEventListener('touchstart', handleCellTouchStart);
            cell.addEventListener('touchmove', handleTouchMove);
            cell.addEventListener('touchend', handleTouchEnd);
            
            // Mouse events for desktop
            cell.addEventListener('mousedown', handleCellMouseDown);
            cell.addEventListener('mouseenter', handleCellMouseEnter);
            cell.addEventListener('mouseup', handleMouseUp);
            
            elements.letterGrid.appendChild(cell);
        });
    });
}

function renderPowerCards() {
    elements.powerCardsContainer.innerHTML = '';
    
    // Show first 3 power cards
    const cardsToShow = gameState.inventory.slice(0, 3);
    
    cardsToShow.forEach(card => {
        const cardElement = document.createElement('div');
        cardElement.className = 'power-card';
        cardElement.textContent = card.emoji;
        cardElement.dataset.cardId = card.id;
        cardElement.title = `${card.name}: ${card.description}`;
        
        elements.powerCardsContainer.appendChild(cardElement);
    });
    
    // Add empty slots
    const emptySlots = 3 - cardsToShow.length;
    for (let i = 0; i < emptySlots; i++) {
        const emptySlot = document.createElement('div');
        emptySlot.className = 'power-card empty';
        elements.powerCardsContainer.appendChild(emptySlot);
    }
}

// Touch and Mouse Handling for Letter Selection
let touchStartPos = null;
let isMouseDown = false;

function handleCellTouchStart(e) {
    e.preventDefault();
    isSelecting = true;
    const cell = e.currentTarget;
    startSelection(cell);
    touchStartPos = { x: e.touches[0].clientX, y: e.touches[0].clientY };
}

function handleTouchMove(e) {
    e.preventDefault();
    if (!isSelecting) return;
    
    const touch = e.touches[0];
    const element = document.elementFromPoint(touch.clientX, touch.clientY);
    
    if (element && element.classList.contains('letter-cell')) {
        addToSelection(element);
    }
}

function handleTouchEnd(e) {
    e.preventDefault();
    isSelecting = false;
    touchStartPos = null;
    
    // Auto-submit word if it's valid (2+ letters)
    if (currentWord.length >= 2) {
        submitWord();
    } else {
        clearSelection();
    }
}

function handleCellMouseDown(e) {
    e.preventDefault();
    isMouseDown = true;
    isSelecting = true;
    startSelection(e.currentTarget);
}

function handleCellMouseEnter(e) {
    if (isSelecting && isMouseDown) {
        addToSelection(e.currentTarget);
    }
}

function handleMouseUp(e) {
    isMouseDown = false;
    isSelecting = false;
    
    // Auto-submit word if it's valid (2+ letters)
    if (currentWord.length >= 2) {
        submitWord();
    } else {
        clearSelection();
    }
}

function startSelection(cell) {
    clearSelection();
    selectedCells = [cell];
    updateWordDisplay();
    updateCellStyles();
}

function addToSelection(cell) {
    const row = parseInt(cell.dataset.row);
    const col = parseInt(cell.dataset.col);
    
    // Check if cell is adjacent to last selected cell
    if (selectedCells.length > 0) {
        const lastCell = selectedCells[selectedCells.length - 1];
        const lastRow = parseInt(lastCell.dataset.row);
        const lastCol = parseInt(lastCell.dataset.col);
        
        const rowDiff = Math.abs(row - lastRow);
        const colDiff = Math.abs(col - lastCol);
        
        // Allow adjacent cells (including diagonals)
        if (rowDiff <= 1 && colDiff <= 1 && (rowDiff + colDiff > 0)) {
            // Check if this cell is already in the path
            const cellIndex = selectedCells.indexOf(cell);
            
            if (cellIndex === -1) {
                // Add new cell
                selectedCells.push(cell);
            } else if (cellIndex === selectedCells.length - 2) {
                // Backtrack to previous cell
                selectedCells.pop();
            }
            
            updateWordDisplay();
            updateCellStyles();
        }
    }
}

function updateWordDisplay() {
    currentWord = selectedCells.map(cell => cell.textContent).join('');
    elements.currentWordDisplay.textContent = currentWord || 'TAP LETTERS TO SPELL';
    elements.submitBtn.disabled = currentWord.length < 2;
}

function updateCellStyles() {
    // Reset all cells
    document.querySelectorAll('.letter-cell').forEach(cell => {
        cell.classList.remove('selected', 'in-path');
    });
    
    // Style selected cells
    selectedCells.forEach((cell, index) => {
        if (index === selectedCells.length - 1) {
            cell.classList.add('selected');
        } else {
            cell.classList.add('in-path');
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
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ word: currentWord })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            gameState.score = data.total_score;
            gameState.words_found.push(data.word);
            gameState.word_count++;
            
            // Trigger power card animations
            if (data.effects && data.effects.length > 0) {
                triggerPowerCardEffects(data.effects);
            }
            
            showMessage(data.message, 'success');
            
            // Check for level completion
            if (data.level_complete) {
                setTimeout(() => {
                    elements.levelCompleteModal.classList.remove('hidden');
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
    });
}

// POWER CARD DOPAMINE EFFECTS
function triggerPowerCardEffects(effects) {
    effects.forEach((effect, index) => {
        setTimeout(() => {
            const cardElement = document.querySelector(`[data-card-id="${effect.card_id}"]`);
            if (cardElement) {
                // Add active class for animation
                cardElement.classList.add('active');
                
                // Show bonus points
                showCardBonus(cardElement, effect.bonus);
                
                // Show effect message
                showMessage(effect.message, 'success');
                
                // Remove active class after animation
                setTimeout(() => {
                    cardElement.classList.remove('active');
                }, 600);
                
                // Add haptic feedback on mobile
                if (navigator.vibrate) {
                    navigator.vibrate([50, 50, 100]);
                }
            }
        }, index * 200); // Stagger animations
    });
}

function showCardBonus(cardElement, bonus) {
    // Remove existing bonus display
    const existingBonus = cardElement.querySelector('.power-card-bonus');
    if (existingBonus) {
        existingBonus.remove();
    }
    
    // Create new bonus display
    const bonusElement = document.createElement('div');
    bonusElement.className = 'power-card-bonus';
    bonusElement.textContent = `+${bonus}`;
    
    cardElement.appendChild(bonusElement);
    
    // Remove after animation
    setTimeout(() => {
        bonusElement.remove();
    }, 2000);
}

function shuffleGrid() {
    if (gameState.coins < 10) return;
    
    fetch('/api/shuffle_grid', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            gameState.grid = data.grid;
            gameState.coins = data.coins;
            renderGrid();
            updateDisplay();
            clearSelection();
            showMessage('Grid shuffled!', 'success');
        } else {
            showMessage(data.message, 'error');
        }
    })
    .catch(error => {
        console.error('Error shuffling grid:', error);
        showMessage('Network error - try again', 'error');
    });
}

function openShop() {
    fetch('/api/shop_items')
        .then(response => response.json())
        .then(items => {
            renderShopItems(items);
            elements.shopModal.classList.remove('hidden');
        })
        .catch(error => {
            console.error('Error loading shop:', error);
            showMessage('Error loading shop', 'error');
        });
}

function closeShop() {
    elements.shopModal.classList.add('hidden');
}

function renderShopItems(items) {
    elements.shopItems.innerHTML = '';
    
    items.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.className = 'shop-item';
        
        itemElement.innerHTML = `
            <div class="shop-item-header">
                <div class="shop-item-emoji">${item.emoji}</div>
                <div class="shop-item-info">
                    <div class="shop-item-name">${item.name}</div>
                    <div class="shop-item-description">${item.description}</div>
                </div>
            </div>
            <div class="shop-item-footer">
                <div class="shop-item-cost">🪙 ${item.cost}</div>
                <div class="shop-item-rarity ${item.rarity}">${item.rarity}</div>
            </div>
        `;
        
        // Add click handler for purchase
        itemElement.addEventListener('click', () => purchaseItem(item));
        
        // Add purchase button
        const purchaseBtn = document.createElement('button');
        purchaseBtn.className = 'gb-button primary';
        purchaseBtn.textContent = gameState.coins >= item.cost ? 'BUY' : 'TOO EXPENSIVE';
        purchaseBtn.disabled = gameState.coins < item.cost;
        purchaseBtn.style.marginTop = '8px';
        purchaseBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            purchaseItem(item);
        });
        
        itemElement.appendChild(purchaseBtn);
        elements.shopItems.appendChild(itemElement);
    });
}

function purchaseItem(item) {
    if (gameState.coins < item.cost) {
        showMessage('Not enough coins!', 'error');
        return;
    }
    
    fetch('/api/purchase_item', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ item: item })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            gameState.coins = data.coins;
            gameState.inventory.push(item);
            updateDisplay();
            renderPowerCards();
            closeShop();
            showMessage(data.message, 'success');
        } else {
            showMessage(data.message, 'error');
        }
    })
    .catch(error => {
        console.error('Error purchasing item:', error);
        showMessage('Network error - try again', 'error');
    });
}

function nextLevel() {
    fetch('/api/next_level', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            gameState.level = data.level;
            gameState.target_score = data.target_score;
            gameState.grid = data.grid;
            gameState.coins = data.coins;
            gameState.score = 0;
            gameState.words_found = [];
            gameState.word_count = 0;
            
            updateDisplay();
            renderGrid();
            clearSelection();
            
            elements.levelCompleteModal.classList.add('hidden');
            showMessage(`Welcome to Level ${data.level}!`, 'success');
        }
    })
    .catch(error => {
        console.error('Error advancing level:', error);
        showMessage('Network error - try again', 'error');
    });
}

function showMessage(text, type = 'info') {
    const message = document.createElement('div');
    message.className = `message ${type}`;
    message.textContent = text;
    
    elements.messageContainer.appendChild(message);
    
    // Remove message after animation
    setTimeout(() => {
        message.remove();
    }, 3000);
}

function handleKeyPress(e) {
    switch(e.key) {
        case 'Enter':
            if (currentWord.length >= 2) {
                submitWord();
            }
            break;
        case 'Escape':
        case 'Backspace':
            clearSelection();
            break;
    }
}

// PWA Installation prompt
let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    
    // Show install banner after a delay
    setTimeout(() => {
        if (deferredPrompt) {
            showInstallPrompt();
        }
    }, 30000); // Show after 30 seconds
});

function showInstallPrompt() {
    const installBanner = document.createElement('div');
    installBanner.className = 'message success';
    installBanner.innerHTML = `
        📱 Install this app for a better experience! 
        <button class="gb-button" style="margin-left: 8px; padding: 4px 8px; font-size: 12px;" onclick="promptInstall()">
            INSTALL
        </button>
    `;
    
    elements.messageContainer.appendChild(installBanner);
    
    setTimeout(() => {
        installBanner.remove();
    }, 10000);
}

function promptInstall() {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
                console.log('PWA installed');
            }
            deferredPrompt = null;
        });
    }
}

// Expose for HTML onclick
window.promptInstall = promptInstall; 