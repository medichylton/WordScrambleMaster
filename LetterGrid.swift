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
    let lockedPositions: Set<Int>
    let onWordStart: () -> Void
    let onWordSubmit: (String, [Int]) -> Void
    
    init(letters: String, lockedPositions: Set<Int> = [], onWordStart: @escaping () -> Void, onWordSubmit: @escaping (String, [Int]) -> Void) {
        self.letters = letters
        self.lockedPositions = lockedPositions
        self.onWordStart = onWordStart
        self.onWordSubmit = onWordSubmit
    }
    
    func isAdjacent(_ pos1: Position, _ pos2: Position) -> Bool {
        return abs(pos1.row - pos2.row) <= 1 && abs(pos1.col - pos2.col) <= 1
    }
    
    func isValidNextPosition(_ lastPos: Position, _ newPos: Position) -> Bool {
        // Check if position is locked
        if lockedPositions.contains(newPos.index) {
            return false
        }
        
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
        // Don't allow starting on locked positions
        if lockedPositions.contains(pos.index) {
            return
        }
        
        selectedPositions = [pos]
        isDragging = true
        initialDirection = nil
        hasCompletedInitialMove = false
        onWordStart()
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

// Enhanced Letter Grid for the Balatro-style game
struct EnhancedLetterGrid: View {
    @StateObject var viewModel: LetterGridViewModel
    
    init(letters: String, lockedPositions: Set<Int> = [], onWordStart: @escaping () -> Void, onWordSubmit: @escaping (String, [Int]) -> Void) {
        _viewModel = StateObject(wrappedValue: LetterGridViewModel(
            letters: letters,
            lockedPositions: lockedPositions,
            onWordStart: onWordStart,
            onWordSubmit: onWordSubmit
        ))
    }
    
    var body: some View {
        GeometryReader { geometry in
            let gridSize = min(geometry.size.width, geometry.size.height)
            let cellSize = gridSize / 4
            
            ZStack {
                // Selection path overlay
                SelectionPathOverlay(
                    selectedPositions: viewModel.selectedPositions,
                    cellSize: cellSize
                )
                
                LazyVGrid(columns: Array(repeating: GridItem(.flexible(minimum: cellSize), spacing: 2), count: 4), spacing: 2) {
                    ForEach(0..<16) { index in
                        let position = Position(index: index)
                        EnhancedLetterCell(
                            letter: String(viewModel.letters[viewModel.letters.index(viewModel.letters.startIndex, offsetBy: index)]),
                            isSelected: viewModel.selectedPositions.contains(position),
                            isLocked: viewModel.lockedPositions.contains(index),
                            selectionOrder: viewModel.selectedPositions.firstIndex(of: position),
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

struct EnhancedLetterCell: View {
    let letter: String
    let isSelected: Bool
    let isLocked: Bool
    let selectionOrder: Int?
    let size: CGFloat
    
    @State private var isAnimating = false
    
    var body: some View {
        ZStack {
            // Base cell
            RoundedRectangle(cornerRadius: 8)
                .fill(cellBackgroundColor)
                .shadow(radius: isSelected ? 4 : 2)
            
            // Border
            RoundedRectangle(cornerRadius: 8)
                .stroke(borderColor, lineWidth: borderWidth)
            
            // Letter text
            Text(letter.uppercased())
                .font(.system(size: size * 0.4, weight: .bold))
                .foregroundColor(textColor)
            
            // Selection order indicator
            if let order = selectionOrder, isSelected {
                VStack {
                    HStack {
                        Spacer()
                        Text("\(order + 1)")
                            .font(.system(size: size * 0.2, weight: .bold))
                            .foregroundColor(.white)
                            .padding(2)
                            .background(Circle().fill(Color.blue))
                    }
                    Spacer()
                }
                .padding(4)
            }
            
            // Lock indicator
            if isLocked {
                VStack {
                    Spacer()
                    HStack {
                        Image(systemName: "lock.fill")
                            .font(.system(size: size * 0.2))
                            .foregroundColor(.red)
                        Spacer()
                    }
                }
                .padding(4)
            }
        }
        .frame(width: size, height: size)
        .scaleEffect(isSelected ? 1.1 : 1.0)
        .offset(y: isSelected ? -4 : 0)
        .animation(.spring(response: 0.2), value: isSelected)
        .scaleEffect(isAnimating ? 1.2 : 1.0)
        .onChange(of: isSelected) { newValue in
            if newValue {
                withAnimation(.easeInOut(duration: 0.1)) {
                    isAnimating = true
                }
                DispatchQueue.main.asyncAfter(deadline: .now() + 0.1) {
                    withAnimation(.easeInOut(duration: 0.1)) {
                        isAnimating = false
                    }
                }
            }
        }
    }
    
    private var cellBackgroundColor: Color {
        if isLocked {
            return Color.red.opacity(0.3)
        } else if isSelected {
            return Color.blue.opacity(0.3)
        } else {
            return Color(.systemBackground)
        }
    }
    
    private var borderColor: Color {
        if isLocked {
            return Color.red
        } else if isSelected {
            return Color.blue
        } else {
            return Color.gray.opacity(0.3)
        }
    }
    
    private var borderWidth: CGFloat {
        if isLocked || isSelected {
            return 3
        } else {
            return 2
        }
    }
    
    private var textColor: Color {
        if isLocked {
            return Color.red
        } else {
            return Color.primary
        }
    }
}

struct SelectionPathOverlay: View {
    let selectedPositions: [Position]
    let cellSize: CGFloat
    
    var body: some View {
        if selectedPositions.count > 1 {
            Path { path in
                for i in 0..<selectedPositions.count - 1 {
                    let startPos = selectedPositions[i]
                    let endPos = selectedPositions[i + 1]
                    
                    let startPoint = CGPoint(
                        x: CGFloat(startPos.col) * cellSize + cellSize / 2,
                        y: CGFloat(startPos.row) * cellSize + cellSize / 2
                    )
                    let endPoint = CGPoint(
                        x: CGFloat(endPos.col) * cellSize + cellSize / 2,
                        y: CGFloat(endPos.row) * cellSize + cellSize / 2
                    )
                    
                    if i == 0 {
                        path.move(to: startPoint)
                    }
                    path.addLine(to: endPoint)
                }
            }
            .stroke(Color.blue, style: StrokeStyle(lineWidth: 4, lineCap: .round, lineJoin: .round))
            .opacity(0.7)
        }
    }
}

// Legacy LetterGrid for backward compatibility
struct LetterGrid: View {
    @StateObject var viewModel: LetterGridViewModel
    
    init(letters: String, onWordSubmit: @escaping (String, [Int]) -> Void) {
        _viewModel = StateObject(wrappedValue: LetterGridViewModel(
            letters: letters,
            onWordStart: {},
            onWordSubmit: onWordSubmit
        ))
    }
    
    var body: some View {
        EnhancedLetterGrid(
            letters: viewModel.letters,
            onWordStart: viewModel.onWordStart,
            onWordSubmit: viewModel.onWordSubmit
        )
    }
}

struct LetterCell: View {
    let letter: String
    let isSelected: Bool
    let size: CGFloat
    
    var body: some View {
        EnhancedLetterCell(
            letter: letter,
            isSelected: isSelected,
            isLocked: false,
            selectionOrder: nil,
            size: size
        )
    }
}
