// Enhanced word dictionary using Free Dictionary API
// Comprehensive Scrabble-eligible word list for offline/fast validation
const COMMON_WORDS = new Set([
  // 2-letter words (Scrabble legal)
  'aa', 'ab', 'ad', 'ae', 'ag', 'ah', 'ai', 'al', 'am', 'an', 'ar', 'as', 'at', 'aw', 'ax', 'ay',
  'ba', 'be', 'bi', 'bo', 'by', 'da', 'de', 'do', 'ed', 'ef', 'eh', 'el', 'em', 'en', 'er', 'es', 'et', 'ex',
  'fa', 'fe', 'go', 'ha', 'he', 'hi', 'hm', 'ho', 'id', 'if', 'in', 'is', 'it', 'jo', 'ka', 'ki', 'la', 'li', 'lo',
  'ma', 'me', 'mi', 'mm', 'mo', 'mu', 'my', 'na', 'ne', 'no', 'nu', 'od', 'oe', 'of', 'oh', 'oi', 'ok', 'om', 'on', 'op', 'or', 'os', 'ow', 'ox', 'oy',
  'pa', 'pe', 'pi', 'qi', 're', 'sh', 'si', 'so', 'ta', 'ti', 'to', 'uh', 'um', 'un', 'up', 'us', 'ut', 'we', 'wo', 'xi', 'xu', 'ya', 'ye', 'yo', 'za',
  
  // 3-letter words
  'the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had', 'her', 'was', 'one', 'our', 'out', 'day', 'get', 'has', 'him', 'his', 'how', 'man', 'new', 'now', 'old', 'see', 'two', 'way', 'who', 'boy', 'did', 'its', 'let', 'put', 'say', 'she', 'too', 'use',
  'cat', 'dog', 'run', 'big', 'red', 'top', 'hot', 'cut', 'yes', 'try', 'ask', 'own', 'sit', 'eat', 'far', 'sea', 'eye', 'car', 'got', 'lot', 'yet', 'arm', 'off', 'bad', 'bag', 'bed', 'box', 'buy', 'cup', 'end', 'few', 'fun', 'gun', 'job', 'key', 'kid', 'law', 'leg', 'lie', 'map', 'pay', 'pop', 'sun', 'tax', 'war', 'win', 'bit', 'die', 'due', 'ear', 'egg', 'fly', 'gas', 'hit', 'ice', 'joy', 'log', 'mix', 'oil', 'pan', 'pie', 'row', 'sad', 'sky', 'tip', 'toy', 'web', 'zoo',
  'age', 'air', 'art', 'bee', 'bet', 'bus', 'cry', 'dry', 'fat', 'fix', 'god', 'hug', 'ink', 'jam', 'lap', 'mad', 'net', 'oak', 'pet', 'rat', 'set', 'tap', 'van', 'wet', 'zip', 'eel', 'peel', 'feel', 'reel', 'heel', 'keel', 'teel', 'bell', 'cell', 'dell', 'fell', 'hell', 'jell', 'sell', 'tell', 'well', 'yell', 'ball', 'call', 'fall', 'gall', 'hall', 'mall', 'pall', 'tall', 'wall', 'bill', 'dill', 'fill', 'gill', 'hill', 'kill', 'mill', 'pill', 'sill', 'till', 'will', 'bull', 'cull', 'dull', 'full', 'gull', 'hull', 'lull', 'mull', 'null', 'pull',
  
  // 4-letter words  
  'that', 'with', 'have', 'this', 'will', 'your', 'from', 'they', 'know', 'want', 'been', 'good', 'much', 'some', 'time', 'very', 'when', 'come', 'here', 'just', 'like', 'long', 'make', 'many', 'over', 'such', 'take', 'than', 'them', 'well', 'were', 'what', 'year', 'work', 'back', 'call', 'came', 'each', 'even', 'find', 'give', 'hand', 'high', 'keep', 'kind', 'last', 'left', 'life', 'live', 'look', 'made', 'most', 'move', 'must', 'name', 'need', 'next', 'open', 'part', 'play', 'said', 'same', 'seem', 'show', 'side', 'tell', 'turn', 'used', 'ways', 'week', 'went', 'word',
  'book', 'case', 'door', 'face', 'fact', 'game', 'girl', 'help', 'home', 'hope', 'hour', 'idea', 'line', 'list', 'love', 'mind', 'news', 'only', 'page', 'plan', 'read', 'real', 'room', 'seen', 'sort', 'talk', 'team', 'test', 'then', 'tree', 'true', 'walk', 'wall', 'wife', 'yard', 'able', 'area', 'army', 'away', 'baby', 'ball', 'band', 'bank', 'base', 'beat', 'best', 'bill', 'bird', 'blue', 'boat', 'body', 'born', 'both', 'boys', 'busy', 'care', 'cars', 'city', 'club', 'cold', 'cool', 'cost', 'dark', 'data', 'days', 'dead', 'deal', 'dear', 'does', 'done', 'down', 'drop', 'drug', 'easy', 'else', 'eyes', 'fall', 'fast', 'feel', 'feet', 'fell', 'felt', 'file', 'fill', 'film', 'fire', 'fish', 'five', 'food', 'foot', 'form', 'four', 'free', 'full', 'gave', 'gets', 'goes', 'gold', 'gone', 'grew', 'grow', 'guys', 'half', 'hall', 'hard', 'head', 'hear', 'held', 'hell', 'hide', 'hold', 'hole', 'holy', 'huge', 'hurt', 'jobs', 'join', 'jump', 'june', 'kept', 'kids', 'kill', 'knew', 'land', 'late', 'lead', 'less', 'lies', 'live', 'load', 'loan', 'lock', 'lose', 'loss', 'lost', 'lots', 'luck', 'mail', 'main', 'male', 'mark', 'mass', 'mean', 'meet', 'miss', 'mode', 'moon', 'near', 'neck', 'nice', 'nine', 'none', 'nose', 'note', 'okay', 'once', 'park', 'pass', 'past', 'path', 'pick', 'pink', 'plus', 'poll', 'pool', 'poor', 'push', 'race', 'rain', 'rate', 'rich', 'ride', 'ring', 'rise', 'risk', 'rock', 'role', 'roll', 'rule', 'runs', 'safe', 'sale', 'save', 'seat', 'sell', 'send', 'sent', 'ship', 'shop', 'shot', 'sick', 'sign', 'size', 'skin', 'slip', 'slow', 'snow', 'soft', 'soil', 'sold', 'song', 'soon', 'soul', 'spot', 'star', 'stay', 'step', 'stop', 'sure', 'task', 'tend', 'term', 'text', 'thin', 'tied', 'ties', 'till', 'tiny', 'told', 'tone', 'took', 'tool', 'tops', 'town', 'trip', 'unit', 'upon', 'user', 'vary', 'vast', 'vote', 'wage', 'wait', 'wake', 'warm', 'wash', 'wave', 'ways', 'weak', 'wear', 'west', 'wide', 'wild', 'wind', 'wine', 'wins', 'wire', 'wise', 'wish', 'wood', 'wore', 'worn', 'yeah', 'zone',
  
  // 5+ letter words
  'about', 'after', 'again', 'alone', 'along', 'among', 'being', 'below', 'could', 'doing', 'every', 'first', 'found', 'great', 'group', 'house', 'large', 'might', 'never', 'other', 'place', 'right', 'small', 'sound', 'still', 'these', 'think', 'three', 'under', 'water', 'where', 'which', 'while', 'world', 'would', 'write', 'young', 'above', 'admit', 'agree', 'ahead', 'alive', 'allow', 'anger', 'angry', 'apart', 'apple', 'apply', 'arena', 'argue', 'arise', 'armed', 'array', 'aside', 'asset', 'avoid', 'awake', 'award', 'aware', 'badly', 'basic', 'beach', 'began', 'begin', 'belly', 'bench', 'birth', 'black', 'blame', 'blank', 'blind', 'block', 'blood', 'board', 'boost', 'booth', 'bound', 'brain', 'brand', 'brave', 'bread', 'break', 'breed', 'brief', 'bring', 'broad', 'broke', 'brown', 'build', 'built', 'buyer', 'cable', 'catch', 'cause', 'chain', 'chair', 'chaos', 'charm', 'chart', 'chase', 'cheap', 'check', 'chest', 'child', 'china', 'chose', 'civil', 'claim', 'class', 'clean', 'clear', 'click', 'climb', 'clock', 'close', 'cloud', 'coach', 'coast', 'count', 'court', 'cover', 'craft', 'crash', 'crazy', 'cream', 'crime', 'cross', 'crowd', 'crown', 'crude', 'curve', 'cycle', 'daily', 'dance', 'dated', 'dealt', 'death', 'debut', 'delay', 'depth', 'doubt', 'dozen', 'draft', 'drama', 'drank', 'dream', 'dress', 'drill', 'drink', 'drive', 'drove', 'dying', 'eager', 'early', 'earth', 'eight', 'elite', 'empty', 'enemy', 'enjoy', 'enter', 'entry', 'equal', 'error', 'event', 'exact', 'exist', 'extra', 'faith', 'false', 'fault', 'fiber', 'field', 'fifth', 'fifty', 'fight', 'final', 'fixed', 'flash', 'fleet', 'floor', 'fluid', 'focus', 'force', 'forth', 'forty', 'forum', 'frame', 'frank', 'fraud', 'fresh', 'front', 'fruit', 'fully', 'funny', 'giant', 'given', 'glass', 'globe', 'going', 'grace', 'grade', 'grand', 'grant', 'grass', 'grave', 'green', 'gross', 'grown', 'guard', 'guess', 'guest', 'guide', 'happy', 'heart', 'heavy', 'hence', 'horse', 'hotel', 'human', 'hurry', 'image', 'index', 'inner', 'input', 'issue', 'japan', 'joint', 'judge', 'known', 'label', 'laser', 'later', 'laugh', 'layer', 'learn', 'lease', 'least', 'leave', 'legal', 'level', 'light', 'limit', 'links', 'lives', 'local', 'loose', 'lower', 'lucky', 'lunch', 'lying', 'magic', 'major', 'maker', 'march', 'match', 'maybe', 'mayor', 'meant', 'media', 'metal', 'minor', 'minus', 'mixed', 'model', 'money', 'month', 'moral', 'motor', 'mount', 'mouse', 'mouth', 'moved', 'movie', 'music', 'needs', 'newly', 'night', 'noise', 'north', 'noted', 'novel', 'nurse', 'occur', 'ocean', 'offer', 'often', 'order', 'ought', 'paint', 'panel', 'paper', 'party', 'peace', 'phase', 'phone', 'photo', 'piano', 'piece', 'pilot', 'pitch', 'plain', 'plane', 'plant', 'plate', 'point', 'pound', 'power', 'press', 'price', 'pride', 'prime', 'print', 'prior', 'prize', 'proof', 'proud', 'prove', 'queen', 'quick', 'quiet', 'quite', 'radio', 'raise', 'range', 'rapid', 'ratio', 'reach', 'ready', 'realm', 'rebel', 'refer', 'relax', 'repay', 'reply', 'rigid', 'rival', 'river', 'robin', 'roger', 'roman', 'rough', 'round', 'route', 'royal', 'rural', 'scale', 'scene', 'scope', 'score', 'sense', 'serve', 'seven', 'shall', 'shape', 'share', 'sharp', 'sheet', 'shelf', 'shell', 'shift', 'shine', 'shirt', 'shock', 'shoot', 'short', 'shown', 'sides', 'sight', 'silly', 'since', 'sixth', 'sixty', 'sized', 'skill', 'sleep', 'slide', 'smart', 'smile', 'smith', 'smoke', 'snake', 'solid', 'solve', 'sorry', 'south', 'space', 'spare', 'speak', 'speed', 'spend', 'spent', 'split', 'spoke', 'sport', 'staff', 'stage', 'stake', 'stand', 'start', 'state', 'steam', 'steel', 'steep', 'steer', 'stick', 'stock', 'stone', 'stood', 'store', 'storm', 'story', 'strip', 'stuck', 'study', 'stuff', 'style', 'sugar', 'suite', 'super', 'sweet', 'swift', 'swing', 'swiss', 'table', 'taken', 'taste', 'taxes', 'teach', 'tends', 'terry', 'texas', 'thank', 'theft', 'their', 'theme', 'there', 'thick', 'thing', 'third', 'those', 'threw', 'throw', 'thumb', 'tight', 'tired', 'title', 'today', 'topic', 'total', 'touch', 'tough', 'tower', 'track', 'trade', 'train', 'treat', 'trend', 'trial', 'tribe', 'trick', 'tried', 'tries', 'truly', 'trunk', 'trust', 'truth', 'twice', 'twist', 'tyler', 'ultra', 'uncle', 'undue', 'union', 'unity', 'until', 'upper', 'upset', 'urban', 'usage', 'usual', 'valid', 'value', 'video', 'virus', 'visit', 'vital', 'vocal', 'voice', 'waste', 'watch', 'wheel', 'white', 'whole', 'whose', 'woman', 'women', 'worry', 'worse', 'worst', 'worth', 'write', 'wrong', 'wrote', 'yield', 'youth', 'should', 'around', 'through', 'during', 'follow', 'without', 'another', 'between', 'nothing', 'someone', 'something', 'because', 'before', 'against', 'thought', 'little', 'number', 'people', 'really', 'school', 'always', 'enough', 'almost', 'second', 'family', 'system', 'within', 'rather', 'across', 'change', 'course', 'action', 'figure', 'friend', 'ground', 'happen', 'better', 'cannot', 'common', 'create', 'degree', 'detail', 'either', 'father', 'finger', 'gather', 'govern', 'health', 'height', 'indeed', 'inside', 'itself', 'letter', 'listen', 'living', 'making', 'market', 'matter', 'member', 'method', 'middle', 'minute', 'modern', 'moment', 'mother', 'moving', 'nation', 'nature', 'nearly', 'notice', 'object', 'office', 'opened', 'option', 'others', 'parent', 'period', 'person', 'please', 'policy', 'pretty', 'public', 'reason', 'record', 'remain', 'remove', 'report', 'result', 'return', 'season', 'senior', 'simple', 'single', 'sister', 'social', 'source', 'spirit', 'spread', 'spring', 'square', 'street', 'strong', 'summer', 'supply', 'switch', 'taking', 'theory', 'things', 'though', 'thrown', 'toward', 'travel', 'trying', 'turned', 'unique', 'unless', 'unlike', 'update', 'useful', 'valley', 'volume', 'weight', 'winter', 'wonder', 'worked', 'worker', 'writer'
]);

// Cache for API results to avoid repeated calls
const wordCache = new Map<string, boolean>();
const definitionCache = new Map<string, string>();

// Rate limiting
let lastApiCall = 0;
const API_COOLDOWN = 100; // ms between API calls

// Letter frequency for generating realistic Boggle grids
const LETTER_FREQUENCY = {
  'A': 8.12, 'B': 1.49, 'C': 2.78, 'D': 4.25, 'E': 12.02, 'F': 2.23,
  'G': 2.02, 'H': 6.09, 'I': 6.97, 'J': 0.15, 'K': 0.77, 'L': 4.03,
  'M': 2.41, 'N': 6.75, 'O': 7.51, 'P': 1.93, 'Q': 0.10, 'R': 5.99,
  'S': 6.33, 'T': 9.06, 'U': 2.76, 'V': 0.98, 'W': 2.36, 'X': 0.15,
  'Y': 1.97, 'Z': 0.07
};

// Common Boggle dice configuration (16 dice for 4x4 grid)
const BOGGLE_DICE = [
  ['A', 'A', 'E', 'E', 'G', 'N'],
  ['E', 'L', 'R', 'T', 'T', 'Y'],
  ['A', 'O', 'O', 'T', 'T', 'W'],
  ['A', 'B', 'B', 'J', 'O', 'O'],
  ['E', 'H', 'R', 'T', 'V', 'W'],
  ['C', 'I', 'M', 'O', 'T', 'U'],
  ['D', 'I', 'S', 'T', 'T', 'Y'],
  ['E', 'I', 'O', 'S', 'S', 'T'],
  ['D', 'E', 'L', 'R', 'V', 'Y'],
  ['A', 'C', 'H', 'O', 'P', 'S'],
  ['H', 'I', 'M', 'N', 'Q', 'U'],
  ['E', 'E', 'I', 'N', 'S', 'U'],
  ['E', 'E', 'G', 'H', 'N', 'W'],
  ['A', 'F', 'F', 'K', 'P', 'S'],
  ['H', 'L', 'N', 'N', 'R', 'Z'],
  ['D', 'E', 'I', 'L', 'R', 'X']
];

export async function isValidWord(word: string): Promise<boolean> {
  if (word.length < 2) return false;
  
  const normalizedWord = word.toLowerCase();
  
  // Check cache first
  if (wordCache.has(normalizedWord)) {
    return wordCache.get(normalizedWord)!;
  }
  
  // Check common words for instant validation
  if (COMMON_WORDS.has(normalizedWord)) {
    wordCache.set(normalizedWord, true);
    return true;
  }
  
  // Rate limiting
  const now = Date.now();
  if (now - lastApiCall < API_COOLDOWN) {
    await new Promise(resolve => setTimeout(resolve, API_COOLDOWN - (now - lastApiCall)));
  }
  lastApiCall = Date.now();
  
  try {
    // Use Free Dictionary API
    const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${normalizedWord}`);
    
    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        // Cache the result and definition
        wordCache.set(normalizedWord, true);
        if (data[0].meanings?.[0]?.definitions?.[0]?.definition) {
          definitionCache.set(normalizedWord, data[0].meanings[0].definitions[0].definition);
        }
        return true;
      }
    }
    
    // If API fails or word not found, cache as invalid
    wordCache.set(normalizedWord, false);
    return false;
  } catch (error) {
    console.warn('Dictionary API error:', error);
    // Fall back to common words only if API is unavailable
    const isCommon = COMMON_WORDS.has(normalizedWord);
    wordCache.set(normalizedWord, isCommon);
    return isCommon;
  }
}

// Synchronous version for immediate feedback (uses cache and common words only)
export function isValidWordSync(word: string): boolean | null {
  if (word.length < 2) return false;
  
  const normalizedWord = word.toLowerCase();
  
  // Check cache first
  if (wordCache.has(normalizedWord)) {
    return wordCache.get(normalizedWord)!;
  }
  
  // Check common words
  if (COMMON_WORDS.has(normalizedWord)) {
    return true;
  }
  
  // Return null if we need to check via API
  return null;
}

export async function getWordDefinition(word: string): Promise<string | null> {
  const normalizedWord = word.toLowerCase();
  
  // Check cache first
  if (definitionCache.has(normalizedWord)) {
    return definitionCache.get(normalizedWord)!;
  }
  
  try {
    const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${normalizedWord}`);
    
    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data) && data.length > 0 && data[0].meanings?.[0]?.definitions?.[0]?.definition) {
        const definition = data[0].meanings[0].definitions[0].definition;
        definitionCache.set(normalizedWord, definition);
        return definition;
      }
    }
    
    return null;
  } catch (error) {
    console.warn('Dictionary API error:', error);
    return null;
  }
}

export function generateBoggleGrid(): string[][] {
  const grid: string[][] = [];
  const shuffledDice = [...BOGGLE_DICE].sort(() => Math.random() - 0.5);
  
  for (let i = 0; i < 4; i++) {
    grid[i] = [];
    for (let j = 0; j < 4; j++) {
      const diceIndex = i * 4 + j;
      const die = shuffledDice[diceIndex];
      const letter = die[Math.floor(Math.random() * die.length)];
      grid[i][j] = letter === 'Q' ? 'QU' : letter;
    }
  }
  
  return grid;
}

export function calculateWordScore(word: string, timeBonus: number = 1, difficulty: 'easy' | 'medium' | 'hard' = 'medium'): number {
  const length = word.length;
  
  // Traditional Boggle scoring system (from the repository)
  let baseScore = 0;
  if (length >= 3 && length <= 5) baseScore = 2;      // 3-5 letters: 2 points
  else if (length === 6) baseScore = 3;               // 6 letters: 3 points  
  else if (length === 7) baseScore = 5;               // 7 letters: 5 points
  else if (length >= 8) baseScore = 11;               // 8+ letters: 11 points
  else return 0; // Words less than 3 letters get 0 points
  
  // Difficulty multiplier
  const difficultyMultiplier = {
    'easy': 1,
    'medium': 1.5,
    'hard': 2
  }[difficulty];
  
  // Rarity bonus for uncommon letters
  const rarityBonus = getRarityBonus(word);
  
  // Final score calculation
  const finalScore = Math.floor(baseScore * difficultyMultiplier * rarityBonus * timeBonus);
  
  return Math.max(finalScore, 1); // Minimum 1 point
}

function getRarityBonus(word: string): number {
  // Bonus for uncommon letters (traditional Scrabble values)
  const letterValues: { [key: string]: number } = {
    'A': 1, 'E': 1, 'I': 1, 'O': 1, 'U': 1, 'L': 1, 'N': 1, 'S': 1, 'T': 1, 'R': 1,
    'D': 2, 'G': 2,
    'B': 3, 'C': 3, 'M': 3, 'P': 3,
    'F': 4, 'H': 4, 'V': 4, 'W': 4, 'Y': 4,
    'K': 5,
    'J': 8, 'X': 8,
    'Q': 10, 'Z': 10
  };
  
  let totalValue = 0;
  for (const letter of word.toUpperCase()) {
    if (letter === 'U' && word.toUpperCase().includes('QU')) {
      // Don't double-count the U in QU
      continue;
    }
    totalValue += letterValues[letter] || 1;
  }
  
  // Convert to multiplier (higher letter values = higher bonus)
  return 1 + (totalValue / word.length / 10); // Normalized bonus
}

// Enhanced path validation with strict adjacency rules
export function isValidPath(grid: string[][], path: {row: number, col: number}[]): boolean {
  if (path.length < 2) return false;
  
  const usedPositions = new Set<string>();
  
  for (let i = 0; i < path.length; i++) {
    const { row, col } = path[i];
    
    // Check bounds
    if (row < 0 || row >= grid.length || col < 0 || col >= grid[0].length) {
      return false;
    }
    
    // Check for duplicate positions (can't reuse same letter)
    const positionKey = `${row},${col}`;
    if (usedPositions.has(positionKey)) {
      return false;
    }
    usedPositions.add(positionKey);
    
    // Check adjacency (except for first position)
    if (i > 0) {
      const prevPos = path[i - 1];
      if (!areAdjacent(prevPos, { row, col })) {
        return false;
      }
    }
  }
  
  return true;
}

// Strict adjacency check (8-directional including diagonals)
export function areAdjacent(pos1: {row: number, col: number}, pos2: {row: number, col: number}): boolean {
  const rowDiff = Math.abs(pos1.row - pos2.row);
  const colDiff = Math.abs(pos1.col - pos2.col);
  
  // Adjacent means within 1 step in any direction (including diagonals)
  // But not the same position
  return (rowDiff <= 1 && colDiff <= 1) && !(rowDiff === 0 && colDiff === 0);
}

export function pathToWord(grid: string[][], path: {row: number, col: number}[]): string {
  return path.map(({ row, col }) => grid[row][col]).join('').toLowerCase();
}

// Enhanced word finding with proper path validation
export async function findAllPossibleWords(grid: string[][], minLength: number = 3): Promise<{word: string, path: {row: number, col: number}[], score: number}[]> {
  const foundWords: {word: string, path: {row: number, col: number}[], score: number}[] = [];
  const visited = new Set<string>();
  
  async function dfs(row: number, col: number, currentWord: string, path: {row: number, col: number}[]) {
    // Check bounds
    if (row < 0 || row >= 4 || col < 0 || col >= 4) return;
    
    const newPath = [...path, { row, col }];
    const newWord = currentWord + grid[row][col].toLowerCase();
    
    // Prevent revisiting same cell in current path
    const pathKey = newPath.map(p => `${p.row},${p.col}`).join('-');
    if (visited.has(pathKey)) return;
    visited.add(pathKey);
    
    // Check if current word is valid and meets minimum length
    if (newWord.length >= minLength) {
      const isValid = await isValidWord(newWord);
      if (isValid) {
        const existingWord = foundWords.find(w => w.word === newWord);
        if (!existingWord) {
          foundWords.push({
            word: newWord,
            path: newPath,
            score: calculateWordScore(newWord)
          });
        }
      }
    }
    
    // Continue search in all 8 directions (if not too long)
    if (newWord.length < 12) { // Reasonable max length
      const directions = [
        [-1, -1], [-1, 0], [-1, 1],
        [0, -1],           [0, 1],
        [1, -1],  [1, 0],  [1, 1]
      ];
      
      for (const [dRow, dCol] of directions) {
        const nextRow = row + dRow;
        const nextCol = col + dCol;
        
        // Check if next position is already in current path
        const isInPath = newPath.some(p => p.row === nextRow && p.col === nextCol);
        if (!isInPath) {
          await dfs(nextRow, nextCol, newWord, newPath);
        }
      }
    }
  }
  
  // Start DFS from each cell
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 4; col++) {
      visited.clear();
      await dfs(row, col, '', []);
    }
  }
  
  return foundWords.sort((a, b) => b.score - a.score); // Sort by score descending
}

// Test function to verify API connectivity
export async function testDictionaryAPI(): Promise<{ success: boolean; message: string }> {
  try {
    // Test with a common word
    const testWord = 'test';
    const result = await isValidWord(testWord);
    
    if (result) {
      const definition = await getWordDefinition(testWord);
      return {
        success: true,
        message: `API working! "${testWord}" is valid. Definition: ${definition || 'No definition available'}`
      };
    } else {
      return {
        success: false,
        message: 'API responded but word validation failed'
      };
    }
  } catch (error) {
    return {
      success: false,
      message: `API test failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

// Clear caches (useful for testing or memory management)
export function clearWordCache(): void {
  wordCache.clear();
  definitionCache.clear();
} 