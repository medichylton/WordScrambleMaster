import SwiftUI
import Foundation

class GameManager: ObservableObject {
    @Published var gameState = GameState()
    @Published var availableChallenges: [Challenge] = []
    @Published var shopItems: [ShopItem] = []
    @Published var currentLetterGrid: [Character] = []
    @Published var lockedPositions: Set<Int> = []
    
    private let dictionary = WordDictionary.shared
    private var challengeTimer: Timer?
    private var speedBonusTracker: [Date] = []
    
    init() {
        generateNewChallenges()
        generateLetterGrid()
    }
    
    // MARK: - Challenge Management
    func generateNewChallenges() {
        availableChallenges = Challenge.generateChallenges(
            for: gameState.currentRound,
            stake: gameState.difficultyStake
        )
    }
    
    func selectChallenge(_ challenge: Challenge) {
        gameState.currentChallenge = challenge
        gameState.gamePhase = .playingChallenge
        
        // Initialize challenge progress
        gameState.challengeProgress = ChallengeProgress()
        gameState.challengeProgress.wordsRemaining = challenge.maxWords
        gameState.challengeProgress.timeRemaining = (challenge.timeLimit ?? 300) * gameState.difficultyStake.timeMultiplier
        
        // Apply special rules
        applySpecialRules(challenge.specialRule)
        
        // Start timer if needed
        if let timeLimit = challenge.timeLimit {
            startChallengeTimer(timeLimit * gameState.difficultyStake.timeMultiplier)
        }
        
        generateLetterGrid()
    }
    
    func skipChallenge(_ challenge: Challenge) -> SkipTag {
        guard challenge.canSkip else { return .coinBonus(0) }
        
        // Generate skip reward based on challenge type
        let tag: SkipTag
        switch challenge.type {
        case .quick:
            tag = .coinBonus(challenge.coinReward / 2)
        case .standard:
            tag = .extraShopSlot
        case .boss:
            tag = .powerUpBonus // Boss challenges give better skip rewards
        }
        
        // Apply skip reward
        applySkipTag(tag)
        
        // Remove the skipped challenge
        availableChallenges.removeAll { $0.id == challenge.id }
        
        return tag
    }
    
    private func applySkipTag(_ tag: SkipTag) {
        switch tag {
        case .coinBonus(let amount):
            gameState.coins += amount
        case .extraShopSlot:
            // This will be handled when generating shop
            break
        case .nextChallengeDiscount:
            // This will be applied in shop
            break
        case .powerUpBonus:
            // Give a random common power-up
            if let randomEnhancer = LetterEnhancer.availableEnhancers.filter({ $0.rarity == .common }).randomElement() {
                gameState.letterEnhancers.append(randomEnhancer)
            }
        }
    }
    
    // MARK: - Word Processing
    func submitWord(_ word: String, positions: [Int], timeTaken: TimeInterval) {
        guard let challenge = gameState.currentChallenge else { return }
        guard dictionary.isValidWord(word.lowercased()) else { return }
        guard !gameState.challengeProgress.wordsFound.contains(word.uppercased()) else { return }
        
        // Check special rules
        if !meetsSpecialRules(word: word, challenge: challenge) {
            return
        }
        
        // Calculate base score
        var wordScore = calculateWordScore(word: word, positions: positions)
        
        // Apply power-up effects
        wordScore = applyPowerUpEffects(word: word, positions: positions, baseScore: wordScore, timeTaken: timeTaken)
        
        // Update progress
        gameState.challengeProgress.wordsFound.append(word.uppercased())
        gameState.challengeProgress.currentScore += wordScore
        gameState.challengeProgress.wordsRemaining -= 1
        gameState.challengeProgress.streakCount += 1
        gameState.totalScore += wordScore
        
        // Track speed for bonuses
        speedBonusTracker.append(Date())
        if speedBonusTracker.count > 5 {
            speedBonusTracker.removeFirst()
        }
        
        // Check completion
        checkChallengeCompletion()
        
        // Apply time acceleration if needed
        if case .acceleratingTime = challenge.specialRule {
            accelerateTimer()
        }
    }
    
    private func calculateWordScore(word: String, positions: [Int]) -> Int {
        let baseScore = word.count * word.count // Quadratic scaling like Scrabble
        let letterBonus = word.compactMap { letterValue($0) }.reduce(0, +)
        return baseScore + letterBonus
    }
    
    private func letterValue(_ letter: Character) -> Int {
        let common = "ETAOINSHRDLU"
        let uncommon = "CMFYPWGBVKX"
        let rare = "JQZ"
        
        if common.contains(letter.uppercased()) { return 1 }
        if uncommon.contains(letter.uppercased()) { return 3 }
        if rare.contains(letter.uppercased()) { return 10 }
        return 2
    }
    
    private func applyPowerUpEffects(word: String, positions: [Int], baseScore: Int, timeTaken: TimeInterval) -> Int {
        var score = baseScore
        
        // Letter Enhancer effects
        for enhancer in gameState.letterEnhancers {
            switch enhancer.effect {
            case .vowelMultiplier(let multiplier):
                let vowelCount = word.filter { "AEIOU".contains($0.uppercased()) }.count
                score += (vowelCount * baseScore * (multiplier - 1)) / word.count
                
            case .rareLetterMultiplier(let multiplier):
                let rareCount = word.filter { "QXZ".contains($0.uppercased()) }.count
                score += rareCount * baseScore * (multiplier - 1)
                
            case .longWordMultiplier(let minLength, let multiplier):
                if word.count >= minLength {
                    score *= multiplier
                }
                
            case .goldLetter:
                score += 10 * word.count
            }
        }
        
        // Word Multiplier effects
        for multiplier in gameState.wordMultipliers {
            switch multiplier.effect {
            case .speedBonus(let bonus):
                if timeTaken < 3.0 { // Found within 3 seconds
                    score = Int(Double(score) * bonus)
                }
                
            case .chainMultiplier(let bonus):
                let chainBonus = 1.0 + (Double(gameState.challengeProgress.streakCount) * bonus)
                score = Int(Double(score) * chainBonus)
                
            case .palindromeBonus(let multiplier):
                if isPalindrome(word) {
                    score *= multiplier
                }
            }
        }
        
        return score
    }
    
    private func isPalindrome(_ word: String) -> Bool {
        let cleaned = word.lowercased()
        return cleaned == String(cleaned.reversed())
    }
    
    private func meetsSpecialRules(word: String, challenge: Challenge) -> Bool {
        guard let rule = challenge.specialRule else { return true }
        
        switch rule {
        case .minWordLength(let minLength):
            return word.count >= minLength
        case .bonusForSpeed:
            return true // Always valid, just affects scoring
        case .lockedLetters:
            // Check if word uses any locked positions
            return true // Implementation would check positions
        case .acceleratingTime:
            return true
        case .uncommonBonus:
            // Bonus for words with rare letter combinations
            return true
        case .reducedVowels:
            return true
        case .consonantBonus:
            return true
        }
    }
    
    // MARK: - Timer Management
    private func startChallengeTimer(_ duration: TimeInterval) {
        challengeTimer?.invalidate()
        gameState.challengeProgress.timeRemaining = duration
        
        challengeTimer = Timer.scheduledTimer(withTimeInterval: 1.0, repeats: true) { _ in
            self.gameState.challengeProgress.timeRemaining -= 1.0
            
            if self.gameState.challengeProgress.timeRemaining <= 0 {
                self.timeExpired()
            }
        }
    }
    
    private func accelerateTimer() {
        challengeTimer?.invalidate()
        let acceleratedInterval = max(0.5, 1.0 - (Double(gameState.challengeProgress.wordsFound.count) * 0.1))
        
        challengeTimer = Timer.scheduledTimer(withTimeInterval: acceleratedInterval, repeats: true) { _ in
            self.gameState.challengeProgress.timeRemaining -= 1.0
            
            if self.gameState.challengeProgress.timeRemaining <= 0 {
                self.timeExpired()
            }
        }
    }
    
    private func timeExpired() {
        challengeTimer?.invalidate()
        checkChallengeCompletion()
    }
    
    // MARK: - Challenge Completion
    private func checkChallengeCompletion() {
        guard let challenge = gameState.currentChallenge else { return }
        
        let timeUp = gameState.challengeProgress.timeRemaining <= 0
        let wordsUp = gameState.challengeProgress.wordsRemaining <= 0
        let targetMet = gameState.challengeProgress.currentScore >= challenge.targetScore
        
        if targetMet || timeUp || wordsUp {
            completeChallenge(success: targetMet)
        }
    }
    
    private func completeChallenge(success: Bool) {
        challengeTimer?.invalidate()
        gameState.challengeProgress.isCompleted = true
        
        if success {
            // Award coins
            gameState.coins += gameState.currentChallenge?.coinReward ?? 0
            
            // Add interest (like Balatro)
            let interest = gameState.coins / 5
            gameState.coins += interest
            
            // Remove completed challenge
            if let challenge = gameState.currentChallenge {
                availableChallenges.removeAll { $0.id == challenge.id }
            }
            
            // Check if round is complete
            if availableChallenges.isEmpty {
                completeRound()
            } else {
                gameState.gamePhase = .selectingChallenge
            }
        } else {
            // Game over
            gameState.isGameLost = true
            gameState.gamePhase = .gameOver
        }
        
        gameState.currentChallenge = nil
    }
    
    private func completeRound() {
        gameState.currentRound += 1
        
        if gameState.currentRound > gameState.totalRounds {
            // Game won!
            gameState.isGameWon = true
            gameState.gamePhase = .victory
        } else {
            // Go to shop
            gameState.gamePhase = .shopping
            generateShop()
        }
    }
    
    // MARK: - Shop System
    private func generateShop() {
        shopItems = []
        let itemCount = 3 // Base shop size
        
        for _ in 0..<itemCount {
            let randomType = Int.random(in: 0...2)
            
            switch randomType {
            case 0:
                if let enhancer = LetterEnhancer.availableEnhancers.randomElement() {
                    shopItems.append(ShopItem(
                        type: .letterEnhancer(enhancer),
                        cost: enhancer.cost,
                        name: enhancer.name,
                        description: enhancer.description,
                        artwork: enhancer.artwork
                    ))
                }
            case 1:
                if let multiplier = WordMultiplier.availableMultipliers.randomElement() {
                    shopItems.append(ShopItem(
                        type: .wordMultiplier(multiplier),
                        cost: multiplier.cost,
                        name: multiplier.name,
                        description: multiplier.description,
                        artwork: multiplier.artwork
                    ))
                }
            case 2:
                if let boost = ConsumableBoost.availableBoosts.randomElement() {
                    shopItems.append(ShopItem(
                        type: .consumableBoost(boost),
                        cost: boost.cost,
                        name: boost.name,
                        description: boost.description,
                        artwork: boost.artwork
                    ))
                }
            default:
                break
            }
        }
    }
    
    func purchaseItem(_ item: ShopItem) -> Bool {
        guard gameState.coins >= item.cost else { return false }
        
        gameState.coins -= item.cost
        
        switch item.type {
        case .letterEnhancer(let enhancer):
            gameState.letterEnhancers.append(enhancer)
        case .wordMultiplier(let multiplier):
            gameState.wordMultipliers.append(multiplier)
        case .consumableBoost(let boost):
            gameState.consumableBoosts.append(boost)
        case .extraHandSlot:
            // Implement hand slot expansion
            break
        case .reroll:
            generateShop()
        }
        
        shopItems.removeAll { $0.id == item.id }
        return true
    }
    
    func leaveShop() {
        gameState.gamePhase = .selectingChallenge
        generateNewChallenges()
    }
    
    // MARK: - Letter Grid Management
    private func generateLetterGrid() {
        guard let challenge = gameState.currentChallenge else {
            currentLetterGrid = generateRandomGrid()
            return
        }
        
        // Apply special rules to grid generation
        switch challenge.specialRule {
        case .reducedVowels:
            currentLetterGrid = generateReducedVowelGrid()
        case .lockedLetters:
            currentLetterGrid = generateRandomGrid()
            generateLockedPositions()
        default:
            currentLetterGrid = generateRandomGrid()
        }
    }
    
    private func generateRandomGrid() -> [Character] {
        let commonLetters = "ETAOINSHRDLU"
        let uncommonLetters = "CMFYPWGBVKX"
        let rareLetters = "JQZ"
        
        var grid: [Character] = []
        
        for _ in 0..<16 {
            let roll = Double.random(in: 0...1)
            let letter: Character
            
            if roll < 0.7 {
                letter = commonLetters.randomElement()!
            } else if roll < 0.95 {
                letter = uncommonLetters.randomElement()!
            } else {
                letter = rareLetters.randomElement()!
            }
            
            grid.append(letter)
        }
        
        return grid
    }
    
    private func generateReducedVowelGrid() -> [Character] {
        let vowels = "AEIOU"
        let consonants = "BCDFGHJKLMNPQRSTVWXYZ"
        
        var grid: [Character] = []
        
        // Ensure only 2-3 vowels in the grid
        let vowelCount = Int.random(in: 2...3)
        
        for i in 0..<16 {
            if i < vowelCount {
                grid.append(vowels.randomElement()!)
            } else {
                grid.append(consonants.randomElement()!)
            }
        }
        
        return grid.shuffled()
    }
    
    private func generateLockedPositions() {
        let lockCount = Int.random(in: 2...4)
        lockedPositions = Set((0..<16).shuffled().prefix(lockCount))
    }
    
    func useConsumable(_ boost: ConsumableBoost) {
        switch boost.effect {
        case .shuffleGrid:
            currentLetterGrid = generateRandomGrid()
        case .addTime(let seconds):
            gameState.challengeProgress.timeRemaining += seconds
        case .temporaryMultiplier(let multiplier, let words):
            gameState.challengeProgress.bonusMultiplier = Double(multiplier)
            // This would need to be tracked per word
        }
        
        // Reduce uses and remove if depleted
        if let index = gameState.consumableBoosts.firstIndex(where: { $0.id == boost.id }) {
            if gameState.consumableBoosts[index].usesRemaining > 1 {
                gameState.consumableBoosts[index] = ConsumableBoost(
                    name: boost.name,
                    description: boost.description,
                    cost: boost.cost,
                    effect: boost.effect,
                    usesRemaining: boost.usesRemaining - 1,
                    artwork: boost.artwork
                )
            } else {
                gameState.consumableBoosts.remove(at: index)
            }
        }
    }
    
    private func applySpecialRules(_ rule: SpecialRule?) {
        // Reset any previous special rule effects
        lockedPositions.removeAll()
        
        // Apply new rule
        if let rule = rule {
            switch rule {
            case .lockedLetters:
                generateLockedPositions()
            default:
                break
            }
        }
    }
}

// MARK: - Word Dictionary
class WordDictionary {
    static let shared = WordDictionary()
    private var words: Set<String> = []
    
    private init() {
        loadDictionary()
    }
    
    private func loadDictionary() {
        // Load from embedded word list or API
        // For now, we'll use a basic set
        words = Set([
            "cat", "dog", "word", "game", "play", "code", "swift", "hello", "world",
            "apple", "orange", "house", "music", "happy", "smile", "phone", "computer",
            "amazing", "beautiful", "wonderful", "fantastic", "incredible", "awesome"
        ])
    }
    
    func isValidWord(_ word: String) -> Bool {
        return words.contains(word.lowercased()) && word.count >= 3
    }
} 