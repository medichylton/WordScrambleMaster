import SwiftUI
import Combine

struct Position: Equatable {
    let row: Int
    let col: Int
    
    var index: Int {
        return row * 4 + col
    }
    
    init(row: Int, col: Int) {
        self.row = row
        self.col = col
    }
    
    init(index: Int) {
        self.row = index / 4
        self.col = index % 4
    }
}

enum Direction {
    case horizontal
    case vertical
    case diagonalUp
    case diagonalDown
    
    static func calculate(from pos1: Position, to pos2: Position) -> Direction? {
        let rowDiff = pos2.row - pos1.row
        let colDiff = pos2.col - pos1.col
        
        if rowDiff == 0 { return .horizontal }
        if colDiff == 0 { return .vertical }
        if rowDiff * colDiff > 0 { return .diagonalDown }
        if rowDiff * colDiff < 0 { return .diagonalUp }
        return nil
    }
}

class LetterGridViewModel: ObservableObject {
    @Published var selectedPositions: [Position] = []
    @Published var isDragging = false
    @Published var initialDirection: Direction?
    @Published var hasCompletedInitialMove = false
    
    let letters: String
    let onWordSubmit: (String, [Int]) -> Void
    
    init(letters: String, onWordSubmit: @escaping (String, [Int]) -> Void) {
        self.letters = letters
        self.onWordSubmit = onWordSubmit
    }
    
    func isAdjacent(_ pos1: Position, _ pos2: Position) -> Bool {
        return abs(pos1.row - pos2.row) <= 1 && abs(pos1.col - pos2.col) <= 1
    }
    
    func isValidNextPosition(_ lastPos: Position, _ newPos: Position) -> Bool {
        if hasCompletedInitialMove {
            return isAdjacent(lastPos, newPos) && !selectedPositions.contains(newPos)
        }
        
        let newDirection = Direction.calculate(from: lastPos, to: newPos)
        
        if selectedPositions.count == 1 {
            initialDirection = newDirection
            
            if case .diagonalUp? = newDirection || case .diagonalDown? = newDirection {
                hasCompletedInitialMove = false
                return isAdjacent(lastPos, newPos)
            }
            
            hasCompletedInitialMove = true
            return isAdjacent(lastPos, newPos)
        }
        
        if case .diagonalUp? = initialDirection || case .diagonalDown? = initialDirection {
            let isValidDiagonal = newDirection == initialDirection && isAdjacent(lastPos, newPos)
            if isValidDiagonal {
                hasCompletedInitialMove = true
            }
            return isValidDiagonal
        }
        
        return isAdjacent(lastPos, newPos)
    }
    
    func handleDragGesture(pos: Position) {
        guard isDragging else { return }
        guard let lastPos = selectedPositions.last else { return }
        
        if isValidNextPosition(lastPos, pos) {
            selectedPositions.append(pos)
        }
    }
    
    func startDrag(at pos: Position) {
        selectedPositions = [pos]
        isDragging = true
        initialDirection = nil
        hasCompletedInitialMove = false
    }
    
    func endDrag() {
        if selectedPositions.count >= 2 {
            let word = selectedPositions.map { letters[letters.index(letters.startIndex, offsetBy: $0.index)] }.joined()
            onWordSubmit(word, selectedPositions.map { $0.index })
        }
        selectedPositions = []
        isDragging = false
        initialDirection = nil
        hasCompletedInitialMove = false
    }
}

struct LetterGrid: View {
    @StateObject var viewModel: LetterGridViewModel
    
    init(letters: String, onWordSubmit: @escaping (String, [Int]) -> Void) {
        _viewModel = StateObject(wrappedValue: LetterGridViewModel(letters: letters, onWordSubmit: onWordSubmit))
    }
    
    var body: some View {
        GeometryReader { geometry in
            let gridSize = min(geometry.size.width, geometry.size.height)
            let cellSize = gridSize / 4
            
            ZStack {
                LazyVGrid(columns: Array(repeating: GridItem(.flexible(minimum: cellSize), spacing: 2), count: 4), spacing: 2) {
                    ForEach(0..<16) { index in
                        let position = Position(index: index)
                        LetterCell(
                            letter: String(viewModel.letters[viewModel.letters.index(viewModel.letters.startIndex, offsetBy: index)]),
                            isSelected: viewModel.selectedPositions.contains(position),
                            size: cellSize
                        )
                        .gesture(
                            DragGesture(minimumDistance: 0)
                                .onChanged { _ in
                                    if !viewModel.isDragging {
                                        viewModel.startDrag(at: position)
                                    }
                                    viewModel.handleDragGesture(pos: position)
                                }
                                .onEnded { _ in
                                    viewModel.endDrag()
                                }
                        )
                    }
                }
            }
            .frame(width: gridSize, height: gridSize)
        }
        .aspectRatio(1, contentMode: .fit)
        .padding(4)
    }
}

struct LetterCell: View {
    let letter: String
    let isSelected: Bool
    let size: CGFloat
    
    var body: some View {
        Text(letter.uppercased())
            .font(.system(size: size * 0.4, weight: .bold))
            .frame(width: size, height: size)
            .background(
                RoundedRectangle(cornerRadius: 8)
                    .fill(Color(.systemBackground))
                    .shadow(radius: 2)
            )
            .overlay(
                RoundedRectangle(cornerRadius: 8)
                    .stroke(isSelected ? Color.accentColor : Color.gray.opacity(0.3), lineWidth: 2)
            )
            .scaleEffect(isSelected ? 1.1 : 1.0)
            .offset(y: isSelected ? -4 : 0)
            .animation(.spring(response: 0.2), value: isSelected)
    }
}
