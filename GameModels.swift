import SwiftUI
import Foundation

// MARK: - Game State Models
struct GameState {
    var currentRound: Int = 1
    var coins: Int = 10
    var totalScore: Int = 0
    var currentChallenge: Challenge?
    var letterEnhancers: [LetterEnhancer] = []
    var wordMultipliers: [WordMultiplier] = []
    var consumableBoosts: [ConsumableBoost] = []
    var challengeProgress: ChallengeProgress = ChallengeProgress()
    var gamePhase: GamePhase = .selectingChallenge
    var isGameWon: Bool = false
    var isGameLost: Bool = false
    var totalRounds: Int = 8
    var difficultyStake: DifficultyStake = .apprentice
}

enum GamePhase {
    case selectingChallenge
    case playingChallenge  
    case shopping
    case gameOver
    case victory
}

// MARK: - Challenge System (Balatro's Blind equivalent)
struct Challenge {
    let id: UUID = UUID()
    let type: ChallengeType
    let name: String
    let description: String
    let targetScore: Int
    let maxWords: Int
    let timeLimit: TimeInterval?
    let coinReward: Int
    let specialRule: SpecialRule?
    let canSkip: Bool
    
    static func generateChallenges(for round: Int, stake: DifficultyStake) -> [Challenge] {
        let baseScore = round * 100 * stake.scoreMultiplier
        let coinReward = round * 2
        
        return [
            // Quick Challenge (Small Blind equivalent)
            Challenge(
                type: .quick,
                name: "Quick Words",
                description: "Find words quickly for bonus coins",
                targetScore: Int(baseScore * 0.6),
                maxWords: 12,
                timeLimit: 90,
                coinReward: coinReward,
                specialRule: .bonusForSpeed,
                canSkip: true
            ),
            
            // Standard Challenge (Big Blind equivalent)  
            Challenge(
                type: .standard,
                name: "Word Builder",
                description: "Build your vocabulary strength",
                targetScore: baseScore,
                maxWords: 10,
                timeLimit: 120,
                coinReward: coinReward * 2,
                specialRule: nil,
                canSkip: true
            ),
            
            // Boss Challenge (Boss Blind equivalent)
            Challenge(
                type: .boss,
                name: BossChallenge.allCases[round % BossChallenge.allCases.count].rawValue,
                description: BossChallenge.allCases[round % BossChallenge.allCases.count].description,
                targetScore: Int(baseScore * 1.5),
                maxWords: 8,
                timeLimit: 150,
                coinReward: coinReward * 3,
                specialRule: BossChallenge.allCases[round % BossChallenge.allCases.count].specialRule,
                canSkip: false
            )
        ]
    }
}

enum ChallengeType {
    case quick, standard, boss
    
    var color: Color {
        switch self {
        case .quick: return .green
        case .standard: return .blue  
        case .boss: return .red
        }
    }
}

enum BossChallenge: String, CaseIterable {
    case letterThief = "Letter Thief"
    case wordWeaver = "Word Weaver"
    case timeWarden = "Time Warden"
    case scoreScavenger = "Score Scavenger"
    case vowelVoid = "Vowel Void"
    case consonantCrush = "Consonant Crush"
    
    var description: String {
        switch self {
        case .letterThief: return "Some letters are locked and can't be used"
        case .wordWeaver: return "Only words with 5+ letters count"
        case .timeWarden: return "Timer speeds up with each word found"
        case .scoreScavenger: return "Must use uncommon letter combinations"
        case .vowelVoid: return "Fewer vowels in the grid"
        case .consonantCrush: return "Consonants score double points"
        }
    }
    
    var specialRule: SpecialRule {
        switch self {
        case .letterThief: return .lockedLetters
        case .wordWeaver: return .minWordLength(5)
        case .timeWarden: return .acceleratingTime
        case .scoreScavenger: return .uncommonBonus
        case .vowelVoid: return .reducedVowels
        case .consonantCrush: return .consonantBonus
        }
    }
}

enum SpecialRule {
    case bonusForSpeed
    case lockedLetters
    case minWordLength(Int)
    case acceleratingTime
    case uncommonBonus
    case reducedVowels
    case consonantBonus
}

// MARK: - Power-Up System (Balatro's Joker equivalent)
struct LetterEnhancer {
    let id: UUID = UUID()
    let name: String
    let description: String
    let rarity: Rarity
    let cost: Int
    let effect: LetterEffect
    let artwork: String
    
    static let availableEnhancers: [LetterEnhancer] = [
        LetterEnhancer(
            name: "Vowel Virtuoso",
            description: "Vowels are worth 2x points",
            rarity: .common,
            cost: 8,
            effect: .vowelMultiplier(2),
            artwork: "🎵"
        ),
        LetterEnhancer(
            name: "Rare Letter Collector",
            description: "Q, X, Z letters worth 5x points",
            rarity: .uncommon,
            cost: 15,
            effect: .rareLetterMultiplier(5),
            artwork: "💎"
        ),
        LetterEnhancer(
            name: "Word Wizard",
            description: "7+ letter words score 3x points",
            rarity: .rare,
            cost: 25,
            effect: .longWordMultiplier(7, 3),
            artwork: "🧙‍♂️"
        ),
        LetterEnhancer(
            name: "Letter Alchemist", 
            description: "Transform any letter into gold (+10 points)",
            rarity: .legendary,
            cost: 50,
            effect: .goldLetter,
            artwork: "⚡"
        )
    ]
}

struct WordMultiplier {
    let id: UUID = UUID()
    let name: String
    let description: String
    let rarity: Rarity
    let cost: Int
    let effect: WordEffect
    let artwork: String
    
    static let availableMultipliers: [WordMultiplier] = [
        WordMultiplier(
            name: "Speed Demon",
            description: "Words found quickly get +50% score",
            rarity: .common,
            cost: 6,
            effect: .speedBonus(1.5),
            artwork: "⚡"
        ),
        WordMultiplier(
            name: "Chain Master",
            description: "Each consecutive word +20% multiplier",
            rarity: .uncommon,
            cost: 12,
            effect: .chainMultiplier(0.2),
            artwork: "⛓️"
        ),
        WordMultiplier(
            name: "Perfect Palindrome",
            description: "Palindromes worth 4x points",
            rarity: .rare,
            cost: 20,
            effect: .palindromeBonus(4),
            artwork: "🪞"
        )
    ]
}

struct ConsumableBoost {
    let id: UUID = UUID()
    let name: String
    let description: String
    let cost: Int
    let effect: ConsumableEffect
    let usesRemaining: Int
    let artwork: String
    
    static let availableBoosts: [ConsumableBoost] = [
        ConsumableBoost(
            name: "Letter Shuffle",
            description: "Shuffle the letter grid (3 uses)",
            cost: 4,
            effect: .shuffleGrid,
            usesRemaining: 3,
            artwork: "🔄"
        ),
        ConsumableBoost(
            name: "Extra Time",
            description: "Add 30 seconds to timer",
            cost: 6,
            effect: .addTime(30),
            usesRemaining: 1,
            artwork: "⏰"
        ),
        ConsumableBoost(
            name: "Score Multiplier",
            description: "Next 5 words worth 2x points",
            cost: 10,
            effect: .temporaryMultiplier(2, 5),
            usesRemaining: 1,
            artwork: "✨"
        )
    ]
}

enum Rarity {
    case common, uncommon, rare, legendary
    
    var color: Color {
        switch self {
        case .common: return .gray
        case .uncommon: return .green
        case .rare: return .blue
        case .legendary: return .purple
        }
    }
    
    var dropRate: Double {
        switch self {
        case .common: return 0.7
        case .uncommon: return 0.2
        case .rare: return 0.08
        case .legendary: return 0.02
        }
    }
}

enum LetterEffect {
    case vowelMultiplier(Int)
    case rareLetterMultiplier(Int)
    case longWordMultiplier(Int, Int) // min length, multiplier
    case goldLetter
}

enum WordEffect {
    case speedBonus(Double)
    case chainMultiplier(Double)
    case palindromeBonus(Int)
}

enum ConsumableEffect {
    case shuffleGrid
    case addTime(TimeInterval)
    case temporaryMultiplier(Int, Int) // multiplier, words remaining
}

// MARK: - Difficulty Stakes (Balatro's Stakes equivalent)
enum DifficultyStake: String, CaseIterable {
    case apprentice = "Apprentice"
    case scholar = "Scholar"
    case expert = "Expert"
    case master = "Master"
    case grandmaster = "Grandmaster"
    
    var description: String {
        switch self {
        case .apprentice: return "Perfect for learning the basics"
        case .scholar: return "Increased challenge requirements"
        case .expert: return "Reduced time limits and harder grids"
        case .master: return "Limited power-ups and higher stakes"
        case .grandmaster: return "Ultimate challenge for word masters"
        }
    }
    
    var scoreMultiplier: Int {
        switch self {
        case .apprentice: return 1
        case .scholar: return 2
        case .expert: return 3
        case .master: return 4
        case .grandmaster: return 5
        }
    }
    
    var timeMultiplier: Double {
        switch self {
        case .apprentice: return 1.0
        case .scholar: return 0.9
        case .expert: return 0.8
        case .master: return 0.7
        case .grandmaster: return 0.6
        }
    }
}

// MARK: - Challenge Progress Tracking
struct ChallengeProgress {
    var currentScore: Int = 0
    var wordsFound: [String] = []
    var timeRemaining: TimeInterval = 0
    var wordsRemaining: Int = 0
    var isCompleted: Bool = false
    var bonusMultiplier: Double = 1.0
    var streakCount: Int = 0
}

// MARK: - Shop System
struct ShopItem {
    let id: UUID = UUID()
    let type: ShopItemType
    let cost: Int
    let name: String
    let description: String
    let artwork: String
}

enum ShopItemType {
    case letterEnhancer(LetterEnhancer)
    case wordMultiplier(WordMultiplier)
    case consumableBoost(ConsumableBoost)
    case extraHandSlot // Allow more simultaneous power-ups
    case reroll // Reroll shop items
}

// MARK: - Tag System (Skip rewards like Balatro)
enum SkipTag {
    case coinBonus(Int)
    case extraShopSlot
    case nextChallengeDiscount(Double)
    case powerUpBonus
    
    var description: String {
        switch self {
        case .coinBonus(let amount): return "Gain \(amount) extra coins"
        case .extraShopSlot: return "Extra item in next shop"
        case .nextChallengeDiscount(let percent): return "\(Int(percent * 100))% off next purchase"
        case .powerUpBonus: return "Start next challenge with random power-up"
        }
    }
} 