import SwiftUI

@main
struct WordScrambleMasterApp: App {
    var body: some Scene {
        WindowGroup {
            ContentView()
        }
    }
}

struct ContentView: View {
    @State private var showingGameSetup = false
    @State private var selectedStake: DifficultyStake = .apprentice
    
    var body: some View {
        NavigationView {
            ZStack {
                // Animated background
                LinearGradient(
                    colors: [
                        Color.blue.opacity(0.3),
                        Color.purple.opacity(0.3),
                        Color.pink.opacity(0.2)
                    ],
                    startPoint: .topLeading,
                    endPoint: .bottomTrailing
                )
                .ignoresSafeArea()
                
                VStack(spacing: 30) {
                    // Game title
                    VStack(spacing: 10) {
                        Text("Word Scramble")
                            .font(.largeTitle)
                            .fontWeight(.bold)
                            .foregroundColor(.primary)
                        
                        Text("Master")
                            .font(.title)
                            .fontWeight(.medium)
                            .foregroundColor(.secondary)
                        
                        Text("A Boggle-Style Word Adventure")
                            .font(.subheadline)
                            .foregroundColor(.secondary)
                    }
                    
                    // Game description
                    VStack(alignment: .leading, spacing: 15) {
                        GameFeatureRow(
                            icon: "🎯",
                            title: "Strategic Challenges",
                            description: "Face three types of word challenges with escalating difficulty"
                        )
                        
                        GameFeatureRow(
                            icon: "⚡",
                            title: "Power-Up System",
                            description: "Collect letter enhancers and word multipliers to boost your score"
                        )
                        
                        GameFeatureRow(
                            icon: "🏪",
                            title: "Strategic Shopping",
                            description: "Spend coins between rounds to buy powerful upgrades"
                        )
                        
                        GameFeatureRow(
                            icon: "🏆",
                            title: "Progressive Difficulty",
                            description: "Choose your stake level and work through 8 challenging rounds"
                        )
                    }
                    .padding()
                    .background(Color.white.opacity(0.1))
                    .cornerRadius(16)
                    
                    // Difficulty selection
                    VStack(spacing: 15) {
                        Text("Choose Your Difficulty")
                            .font(.headline)
                            .fontWeight(.semibold)
                        
                        Picker("Difficulty Stake", selection: $selectedStake) {
                            ForEach(DifficultyStake.allCases, id: \.self) { stake in
                                VStack(alignment: .leading, spacing: 2) {
                                    Text(stake.rawValue)
                                        .font(.headline)
                                    Text(stake.description)
                                        .font(.caption)
                                        .foregroundColor(.secondary)
                                }
                                .tag(stake)
                            }
                        }
                        .pickerStyle(WheelPickerStyle())
                        .frame(height: 100)
                    }
                    .padding()
                    .background(Color.white.opacity(0.1))
                    .cornerRadius(16)
                    
                    // Start game button
                    NavigationLink(destination: GameView()) {
                        HStack {
                            Image(systemName: "play.fill")
                            Text("Start Adventure")
                                .fontWeight(.semibold)
                        }
                        .font(.headline)
                        .foregroundColor(.white)
                        .padding()
                        .frame(maxWidth: .infinity)
                        .background(
                            LinearGradient(
                                colors: [Color.blue, Color.purple],
                                startPoint: .leading,
                                endPoint: .trailing
                            )
                        )
                        .cornerRadius(12)
                        .shadow(radius: 5)
                    }
                    
                    Spacer()
                }
                .padding()
            }
            .navigationTitle("")
            .navigationBarHidden(true)
        }
    }
}

struct GameFeatureRow: View {
    let icon: String
    let title: String
    let description: String
    
    var body: some View {
        HStack(spacing: 15) {
            Text(icon)
                .font(.title2)
                .frame(width: 30)
            
            VStack(alignment: .leading, spacing: 2) {
                Text(title)
                    .font(.headline)
                    .fontWeight(.semibold)
                
                Text(description)
                    .font(.subheadline)
                    .foregroundColor(.secondary)
                    .lineLimit(nil)
            }
            
            Spacer()
        }
    }
}

// Preview
struct ContentView_Previews: PreviewProvider {
    static var previews: some View {
        ContentView()
    }
} 