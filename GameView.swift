import SwiftUI

struct GameView: View {
    @StateObject private var gameManager = GameManager()
    @State private var wordStartTime: Date = Date()
    
    var body: some View {
        NavigationView {
            ZStack {
                // Background gradient
                LinearGradient(
                    colors: [Color.blue.opacity(0.1), Color.purple.opacity(0.1)],
                    startPoint: .topLeading,
                    endPoint: .bottomTrailing
                )
                .ignoresSafeArea()
                
                // Main content based on game phase
                switch gameManager.gameState.gamePhase {
                case .selectingChallenge:
                    ChallengeSelectionView(gameManager: gameManager)
                case .playingChallenge:
                    PlayingChallengeView(gameManager: gameManager, wordStartTime: $wordStartTime)
                case .shopping:
                    ShopView(gameManager: gameManager)
                case .gameOver:
                    GameOverView(gameManager: gameManager)
                case .victory:
                    VictoryView(gameManager: gameManager)
                }
            }
            .navigationTitle("Word Scramble Master")
            .navigationBarTitleDisplayMode(.inline)
        }
    }
}

// MARK: - Challenge Selection View
struct ChallengeSelectionView: View {
    @ObservedObject var gameManager: GameManager
    
    var body: some View {
        VStack(spacing: 20) {
            // Game status header
            GameStatusHeader(gameState: gameManager.gameState)
            
            // Active power-ups display
            if !gameManager.gameState.letterEnhancers.isEmpty || !gameManager.gameState.wordMultipliers.isEmpty {
                ActivePowerUpsView(gameState: gameManager.gameState)
            }
            
            // Challenge cards
            VStack(spacing: 15) {
                Text("Choose Your Challenge")
                    .font(.title2)
                    .fontWeight(.bold)
                
                ForEach(gameManager.availableChallenges, id: \.id) { challenge in
                    ChallengeCard(
                        challenge: challenge,
                        onSelect: { gameManager.selectChallenge(challenge) },
                        onSkip: challenge.canSkip ? { 
                            let tag = gameManager.skipChallenge(challenge)
                            // Show skip reward
                        } : nil
                    )
                }
            }
            
            Spacer()
        }
        .padding()
    }
}

// MARK: - Playing Challenge View
struct PlayingChallengeView: View {
    @ObservedObject var gameManager: GameManager
    @Binding var wordStartTime: Date
    
    var body: some View {
        VStack(spacing: 15) {
            // Challenge progress header
            ChallengeProgressHeader(
                challenge: gameManager.gameState.currentChallenge!,
                progress: gameManager.gameState.challengeProgress
            )
            
            // Letter grid
            EnhancedLetterGrid(
                letters: String(gameManager.currentLetterGrid),
                lockedPositions: gameManager.lockedPositions,
                onWordStart: { wordStartTime = Date() },
                onWordSubmit: { word, positions in
                    let timeTaken = Date().timeIntervalSince(wordStartTime)
                    gameManager.submitWord(word, positions: positions, timeTaken: timeTaken)
                }
            )
            
            // Found words display
            FoundWordsDisplay(words: gameManager.gameState.challengeProgress.wordsFound)
            
            // Consumable boosts
            if !gameManager.gameState.consumableBoosts.isEmpty {
                ConsumableBoostsView(
                    boosts: gameManager.gameState.consumableBoosts,
                    onUse: gameManager.useConsumable
                )
            }
        }
        .padding()
    }
}

// MARK: - Shop View
struct ShopView: View {
    @ObservedObject var gameManager: GameManager
    
    var body: some View {
        VStack(spacing: 20) {
            // Shop header
            VStack {
                Text("Power-Up Shop")
                    .font(.title)
                    .fontWeight(.bold)
                
                HStack {
                    Image(systemName: "bitcoinsign.circle.fill")
                        .foregroundColor(.yellow)
                    Text("\(gameManager.gameState.coins) Coins")
                        .font(.headline)
                }
            }
            
            // Shop items
            ScrollView {
                LazyVGrid(columns: [
                    GridItem(.adaptive(minimum: 150), spacing: 15)
                ], spacing: 15) {
                    ForEach(gameManager.shopItems, id: \.id) { item in
                        ShopItemCard(
                            item: item,
                            canAfford: gameManager.gameState.coins >= item.cost,
                            onPurchase: { 
                                let success = gameManager.purchaseItem(item)
                                // Show purchase feedback
                            }
                        )
                    }
                }
            }
            
            // Continue button
            Button("Continue to Next Round") {
                gameManager.leaveShop()
            }
            .font(.headline)
            .foregroundColor(.white)
            .padding()
            .background(Color.blue)
            .cornerRadius(12)
        }
        .padding()
    }
}

// MARK: - Supporting Views
struct GameStatusHeader: View {
    let gameState: GameState
    
    var body: some View {
        HStack {
            VStack(alignment: .leading) {
                Text("Round \(gameState.currentRound)/\(gameState.totalRounds)")
                    .font(.headline)
                Text(gameState.difficultyStake.rawValue)
                    .font(.subheadline)
                    .foregroundColor(.secondary)
            }
            
            Spacer()
            
            VStack(alignment: .trailing) {
                HStack {
                    Image(systemName: "bitcoinsign.circle.fill")
                        .foregroundColor(.yellow)
                    Text("\(gameState.coins)")
                        .font(.headline)
                }
                
                Text("Score: \(gameState.totalScore)")
                    .font(.subheadline)
                    .foregroundColor(.secondary)
            }
        }
        .padding()
        .background(Color.gray.opacity(0.1))
        .cornerRadius(12)
    }
}

struct ChallengeCard: View {
    let challenge: Challenge
    let onSelect: () -> Void
    let onSkip: (() -> Void)?
    
    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack {
                Text(challenge.name)
                    .font(.headline)
                    .foregroundColor(challenge.type.color)
                
                Spacer()
                
                Text("\(challenge.coinReward) 🪙")
                    .font(.subheadline)
                    .fontWeight(.semibold)
            }
            
            Text(challenge.description)
                .font(.body)
                .foregroundColor(.secondary)
            
            HStack {
                Text("Target: \(challenge.targetScore) pts")
                Spacer()
                if let timeLimit = challenge.timeLimit {
                    Text("Time: \(Int(timeLimit))s")
                }
                Text("Words: \(challenge.maxWords)")
            }
            .font(.caption)
            
            HStack {
                Button("Play") {
                    onSelect()
                }
                .buttonStyle(.borderedProminent)
                .tint(challenge.type.color)
                
                if let onSkip = onSkip {
                    Button("Skip") {
                        onSkip()
                    }
                    .buttonStyle(.bordered)
                }
            }
        }
        .padding()
        .background(Color.gray.opacity(0.05))
        .cornerRadius(12)
        .overlay(
            RoundedRectangle(cornerRadius: 12)
                .stroke(challenge.type.color.opacity(0.3), lineWidth: 2)
        )
    }
}

struct ChallengeProgressHeader: View {
    let challenge: Challenge
    let progress: ChallengeProgress
    
    var body: some View {
        VStack(spacing: 10) {
            Text(challenge.name)
                .font(.title2)
                .fontWeight(.bold)
            
            HStack {
                // Score progress
                VStack {
                    Text("Score")
                        .font(.caption)
                        .foregroundColor(.secondary)
                    Text("\(progress.currentScore)/\(challenge.targetScore)")
                        .font(.headline)
                        .foregroundColor(progress.currentScore >= challenge.targetScore ? .green : .primary)
                }
                
                Spacer()
                
                // Time remaining
                if let timeLimit = challenge.timeLimit {
                    VStack {
                        Text("Time")
                            .font(.caption)
                            .foregroundColor(.secondary)
                        Text("\(Int(progress.timeRemaining))s")
                            .font(.headline)
                            .foregroundColor(progress.timeRemaining < 30 ? .red : .primary)
                    }
                }
                
                Spacer()
                
                // Words remaining
                VStack {
                    Text("Words Left")
                        .font(.caption)
                        .foregroundColor(.secondary)
                    Text("\(progress.wordsRemaining)")
                        .font(.headline)
                }
            }
            .padding()
            .background(Color.gray.opacity(0.1))
            .cornerRadius(8)
        }
    }
}

struct ActivePowerUpsView: View {
    let gameState: GameState
    
    var body: some View {
        VStack(alignment: .leading) {
            Text("Active Power-Ups")
                .font(.headline)
            
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 10) {
                    ForEach(gameState.letterEnhancers, id: \.id) { enhancer in
                        PowerUpBadge(name: enhancer.name, artwork: enhancer.artwork, rarity: enhancer.rarity)
                    }
                    
                    ForEach(gameState.wordMultipliers, id: \.id) { multiplier in
                        PowerUpBadge(name: multiplier.name, artwork: multiplier.artwork, rarity: multiplier.rarity)
                    }
                }
            }
        }
        .padding()
        .background(Color.gray.opacity(0.05))
        .cornerRadius(12)
    }
}

struct PowerUpBadge: View {
    let name: String
    let artwork: String
    let rarity: Rarity
    
    var body: some View {
        VStack {
            Text(artwork)
                .font(.title2)
            Text(name)
                .font(.caption)
                .multilineTextAlignment(.center)
        }
        .padding(8)
        .background(rarity.color.opacity(0.2))
        .cornerRadius(8)
        .overlay(
            RoundedRectangle(cornerRadius: 8)
                .stroke(rarity.color, lineWidth: 1)
        )
    }
}

struct FoundWordsDisplay: View {
    let words: [String]
    
    var body: some View {
        if !words.isEmpty {
            VStack(alignment: .leading) {
                Text("Words Found (\(words.count))")
                    .font(.headline)
                
                ScrollView(.horizontal, showsIndicators: false) {
                    HStack {
                        ForEach(words, id: \.self) { word in
                            Text(word)
                                .padding(.horizontal, 8)
                                .padding(.vertical, 4)
                                .background(Color.green.opacity(0.2))
                                .cornerRadius(6)
                        }
                    }
                }
            }
            .padding()
            .background(Color.gray.opacity(0.05))
            .cornerRadius(12)
        }
    }
}

struct ShopItemCard: View {
    let item: ShopItem
    let canAfford: Bool
    let onPurchase: () -> Void
    
    var body: some View {
        VStack(spacing: 8) {
            Text(item.artwork)
                .font(.title)
            
            Text(item.name)
                .font(.headline)
                .multilineTextAlignment(.center)
            
            Text(item.description)
                .font(.caption)
                .foregroundColor(.secondary)
                .multilineTextAlignment(.center)
            
            Button("\(item.cost) 🪙") {
                onPurchase()
            }
            .font(.subheadline)
            .foregroundColor(canAfford ? .blue : .gray)
            .disabled(!canAfford)
        }
        .padding()
        .background(Color.gray.opacity(0.05))
        .cornerRadius(12)
        .overlay(
            RoundedRectangle(cornerRadius: 12)
                .stroke(canAfford ? Color.blue.opacity(0.3) : Color.gray.opacity(0.3), lineWidth: 1)
        )
    }
}

struct ConsumableBoostsView: View {
    let boosts: [ConsumableBoost]
    let onUse: (ConsumableBoost) -> Void
    
    var body: some View {
        VStack(alignment: .leading) {
            Text("Consumables")
                .font(.headline)
            
            ScrollView(.horizontal, showsIndicators: false) {
                HStack {
                    ForEach(boosts, id: \.id) { boost in
                        Button(action: { onUse(boost) }) {
                            VStack {
                                Text(boost.artwork)
                                    .font(.title2)
                                Text(boost.name)
                                    .font(.caption)
                                Text("(\(boost.usesRemaining))")
                                    .font(.caption2)
                                    .foregroundColor(.secondary)
                            }
                        }
                        .padding(8)
                        .background(Color.orange.opacity(0.2))
                        .cornerRadius(8)
                    }
                }
            }
        }
        .padding()
        .background(Color.gray.opacity(0.05))
        .cornerRadius(12)
    }
}

struct GameOverView: View {
    @ObservedObject var gameManager: GameManager
    
    var body: some View {
        VStack(spacing: 20) {
            Text("Game Over")
                .font(.largeTitle)
                .fontWeight(.bold)
                .foregroundColor(.red)
            
            Text("Final Score: \(gameManager.gameState.totalScore)")
                .font(.title2)
            
            Text("Reached Round \(gameManager.gameState.currentRound)")
                .font(.headline)
                .foregroundColor(.secondary)
            
            Button("Play Again") {
                gameManager.gameState = GameState()
                gameManager.generateNewChallenges()
            }
            .font(.headline)
            .foregroundColor(.white)
            .padding()
            .background(Color.blue)
            .cornerRadius(12)
        }
    }
}

struct VictoryView: View {
    @ObservedObject var gameManager: GameManager
    
    var body: some View {
        VStack(spacing: 20) {
            Text("Victory!")
                .font(.largeTitle)
                .fontWeight(.bold)
                .foregroundColor(.gold)
            
            Text("🎉 You've mastered all challenges! 🎉")
                .font(.title2)
                .multilineTextAlignment(.center)
            
            Text("Final Score: \(gameManager.gameState.totalScore)")
                .font(.title2)
            
            Button("Play Again") {
                // Could offer higher difficulty or endless mode
                gameManager.gameState = GameState()
                gameManager.generateNewChallenges()
            }
            .font(.headline)
            .foregroundColor(.white)
            .padding()
            .background(Color.gold)
            .cornerRadius(12)
        }
    }
}

// MARK: - Extensions
extension Color {
    static let gold = Color.yellow
}
