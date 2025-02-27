import SwiftUI

struct GameView: View {
    @State private var score = 0
    @State private var foundWords: Set<String> = []
    
    let letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ" // Example letters
    
    var body: some View {
        VStack(spacing: 20) {
            Text("Score: \(score)")
                .font(.title)
            
            LetterGrid(letters: letters) { word, positions in
                // Handle word submission
                if !foundWords.contains(word) {
                    foundWords.insert(word)
                    score += word.count * 10
                }
            }
            .padding()
            
            ScrollView(.horizontal, showsIndicators: false) {
                HStack {
                    ForEach(Array(foundWords), id: \.self) { word in
                        Text(word)
                            .padding(.horizontal, 10)
                            .padding(.vertical, 5)
                            .background(Color.gray.opacity(0.2))
                            .cornerRadius(8)
                    }
                }
            }
            .padding()
        }
    }
}
