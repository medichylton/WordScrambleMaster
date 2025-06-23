// Comprehensive English word dictionary for Boggle
const VALID_WORDS = new Set([
  // 3-letter words
  'the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had', 'her', 'was', 'one', 'our', 'out', 'day', 'get', 'has', 'him', 'his', 'how', 'man', 'new', 'now', 'old', 'see', 'two', 'way', 'who', 'boy', 'did', 'its', 'let', 'put', 'say', 'she', 'too', 'use',
  'cat', 'dog', 'run', 'big', 'red', 'top', 'hot', 'cut', 'yes', 'try', 'ask', 'own', 'sit', 'eat', 'far', 'sea', 'eye', 'car', 'got', 'lot', 'yet', 'arm', 'off', 'bad', 'bag', 'bed', 'box', 'buy', 'cup', 'end', 'few', 'fun', 'gun', 'job', 'key', 'kid', 'law', 'leg', 'lie', 'map', 'pay', 'pop', 'sun', 'tax', 'war', 'win', 'bit', 'die', 'due', 'ear', 'eat', 'egg', 'fly', 'gas', 'hit', 'ice', 'joy', 'log', 'mix', 'oil', 'pan', 'pie', 'row', 'sad', 'sky', 'tip', 'toy', 'web', 'zoo',
  
  // 4-letter words  
  'that', 'with', 'have', 'this', 'will', 'your', 'from', 'they', 'know', 'want', 'been', 'good', 'much', 'some', 'time', 'very', 'when', 'come', 'here', 'just', 'like', 'long', 'make', 'many', 'over', 'such', 'take', 'than', 'them', 'well', 'were', 'what', 'year', 'work', 'back', 'call', 'came', 'each', 'even', 'find', 'give', 'hand', 'high', 'keep', 'kind', 'last', 'left', 'life', 'live', 'look', 'made', 'most', 'move', 'must', 'name', 'need', 'next', 'open', 'part', 'play', 'said', 'same', 'seem', 'show', 'side', 'tell', 'turn', 'used', 'want', 'ways', 'week', 'went', 'word', 'work', 'year',
  'book', 'case', 'door', 'face', 'fact', 'game', 'girl', 'help', 'home', 'hope', 'hour', 'idea', 'kind', 'line', 'list', 'look', 'love', 'mind', 'news', 'only', 'page', 'plan', 'read', 'real', 'room', 'seen', 'sort', 'talk', 'team', 'test', 'then', 'tree', 'true', 'walk', 'wall', 'week', 'wife', 'word', 'yard', 'able', 'area', 'army', 'away', 'baby', 'ball', 'band', 'bank', 'base', 'beat', 'best', 'bill', 'bird', 'blue', 'boat', 'body', 'born', 'both', 'boys', 'busy', 'care', 'cars', 'city', 'club', 'cold', 'cool', 'cost', 'dark', 'data', 'days', 'dead', 'deal', 'dear', 'does', 'done', 'down', 'drop', 'drug', 'easy', 'else', 'eyes', 'fall', 'fast', 'feel', 'feet', 'fell', 'felt', 'file', 'fill', 'film', 'fire', 'fish', 'five', 'food', 'foot', 'form', 'four', 'free', 'full', 'gave', 'gets', 'goes', 'gold', 'gone', 'grew', 'grow', 'guys', 'half', 'hall', 'hard', 'head', 'hear', 'held', 'hell', 'hide', 'hold', 'hole', 'holy', 'hope', 'huge', 'hurt', 'jobs', 'join', 'jump', 'june', 'kept', 'kids', 'kill', 'knew', 'land', 'late', 'lead', 'learn', 'less', 'lies', 'live', 'load', 'loan', 'lock', 'lose', 'loss', 'lost', 'lots', 'luck', 'mail', 'main', 'male', 'mark', 'mass', 'mean', 'meet', 'mind', 'miss', 'mode', 'moon', 'near', 'neck', 'nice', 'nine', 'none', 'nose', 'note', 'okay', 'once', 'park', 'pass', 'past', 'path', 'pick', 'pink', 'plus', 'poll', 'pool', 'poor', 'push', 'race', 'rain', 'rate', 'rich', 'ride', 'ring', 'rise', 'risk', 'rock', 'role', 'roll', 'room', 'rule', 'runs', 'safe', 'sale', 'save', 'seat', 'sell', 'send', 'sent', 'ship', 'shop', 'shot', 'sick', 'sign', 'size', 'skin', 'slip', 'slow', 'snow', 'soft', 'soil', 'sold', 'song', 'soon', 'sort', 'soul', 'spot', 'star', 'stay', 'step', 'stop', 'sure', 'task', 'tend', 'term', 'text', 'thin', 'tied', 'ties', 'till', 'tiny', 'told', 'tone', 'took', 'tool', 'tops', 'town', 'trip', 'unit', 'upon', 'used', 'user', 'vary', 'vast', 'vote', 'wage', 'wait', 'wake', 'warm', 'wash', 'wave', 'ways', 'weak', 'wear', 'west', 'wide', 'wild', 'wind', 'wine', 'wins', 'wire', 'wise', 'wish', 'wood', 'wore', 'worn', 'yard', 'yeah', 'zone',
  
  // 5-letter words
  'about', 'after', 'again', 'alone', 'along', 'also', 'among', 'any', 'being', 'below', 'could', 'doing', 'every', 'first', 'found', 'great', 'group', 'house', 'large', 'might', 'never', 'other', 'place', 'right', 'small', 'sound', 'still', 'these', 'think', 'three', 'under', 'water', 'where', 'which', 'while', 'world', 'would', 'write', 'young',
  'above', 'admit', 'agree', 'ahead', 'alive', 'allow', 'alone', 'along', 'anger', 'angry', 'apart', 'apple', 'apply', 'arena', 'argue', 'arise', 'armed', 'array', 'aside', 'asset', 'avoid', 'awake', 'award', 'aware', 'badly', 'basic', 'beach', 'began', 'begin', 'being', 'belly', 'bench', 'birth', 'black', 'blame', 'blank', 'blind', 'block', 'blood', 'board', 'boost', 'booth', 'bound', 'brain', 'brand', 'brave', 'bread', 'break', 'breed', 'brief', 'bring', 'broad', 'broke', 'brown', 'build', 'built', 'buyer', 'cable', 'catch', 'cause', 'chain', 'chair', 'chaos', 'charm', 'chart', 'chase', 'cheap', 'check', 'chest', 'child', 'china', 'chose', 'civil', 'claim', 'class', 'clean', 'clear', 'click', 'climb', 'clock', 'close', 'cloud', 'coach', 'coast', 'could', 'count', 'court', 'cover', 'craft', 'crash', 'crazy', 'cream', 'crime', 'cross', 'crowd', 'crown', 'crude', 'curve', 'cycle', 'daily', 'dance', 'dated', 'dealt', 'death', 'debut', 'delay', 'depth', 'doing', 'doubt', 'dozen', 'draft', 'drama', 'drank', 'dream', 'dress', 'drill', 'drink', 'drive', 'drove', 'dying', 'eager', 'early', 'earth', 'eight', 'elite', 'empty', 'enemy', 'enjoy', 'enter', 'entry', 'equal', 'error', 'event', 'every', 'exact', 'exist', 'extra', 'faith', 'false', 'fault', 'fiber', 'field', 'fifth', 'fifty', 'fight', 'final', 'first', 'fixed', 'flash', 'fleet', 'floor', 'fluid', 'focus', 'force', 'forth', 'forty', 'forum', 'found', 'frame', 'frank', 'fraud', 'fresh', 'front', 'fruit', 'fully', 'funny', 'giant', 'given', 'glass', 'globe', 'going', 'grace', 'grade', 'grand', 'grant', 'grass', 'grave', 'great', 'green', 'gross', 'group', 'grown', 'guard', 'guess', 'guest', 'guide', 'happy', 'harry', 'heart', 'heavy', 'hence', 'henry', 'horse', 'hotel', 'house', 'human', 'hurry', 'image', 'index', 'inner', 'input', 'issue', 'japan', 'jimmy', 'joint', 'jones', 'judge', 'known', 'label', 'large', 'laser', 'later', 'laugh', 'layer', 'learn', 'lease', 'least', 'leave', 'legal', 'level', 'lewis', 'light', 'limit', 'links', 'lives', 'local', 'loose', 'lower', 'lucky', 'lunch', 'lying', 'magic', 'major', 'maker', 'march', 'maria', 'match', 'maybe', 'mayor', 'meant', 'media', 'metal', 'might', 'minor', 'minus', 'mixed', 'model', 'money', 'month', 'moral', 'motor', 'mount', 'mouse', 'mouth', 'moved', 'movie', 'music', 'needs', 'never', 'newly', 'night', 'noise', 'north', 'noted', 'novel', 'nurse', 'occur', 'ocean', 'offer', 'often', 'order', 'other', 'ought', 'paint', 'panel', 'paper', 'party', 'peace', 'peter', 'phase', 'phone', 'photo', 'piano', 'piece', 'pilot', 'pitch', 'place', 'plain', 'plane', 'plant', 'plate', 'point', 'pound', 'power', 'press', 'price', 'pride', 'prime', 'print', 'prior', 'prize', 'proof', 'proud', 'prove', 'queen', 'quick', 'quiet', 'quite', 'radio', 'raise', 'range', 'rapid', 'ratio', 'reach', 'ready', 'realm', 'rebel', 'refer', 'relax', 'repay', 'reply', 'right', 'rigid', 'rival', 'river', 'robin', 'roger', 'roman', 'rough', 'round', 'route', 'royal', 'rural', 'scale', 'scene', 'scope', 'score', 'sense', 'serve', 'seven', 'shall', 'shape', 'share', 'sharp', 'sheet', 'shelf', 'shell', 'shift', 'shine', 'shirt', 'shock', 'shoot', 'short', 'shown', 'sides', 'sight', 'silly', 'since', 'sixth', 'sixty', 'sized', 'skill', 'sleep', 'slide', 'small', 'smart', 'smile', 'smith', 'smoke', 'snake', 'snow', 'solid', 'solve', 'sorry', 'sound', 'south', 'space', 'spare', 'speak', 'speed', 'spend', 'spent', 'split', 'spoke', 'sport', 'staff', 'stage', 'stake', 'stand', 'start', 'state', 'steam', 'steel', 'steep', 'steer', 'steve', 'stick', 'still', 'stock', 'stone', 'stood', 'store', 'storm', 'story', 'strip', 'stuck', 'study', 'stuff', 'style', 'sugar', 'suite', 'super', 'sweet', 'swift', 'swing', 'swiss', 'table', 'taken', 'taste', 'taxes', 'teach', 'tends', 'terry', 'texas', 'thank', 'theft', 'their', 'theme', 'there', 'these', 'thick', 'thing', 'think', 'third', 'those', 'three', 'threw', 'throw', 'thumb', 'tight', 'tired', 'title', 'today', 'topic', 'total', 'touch', 'tough', 'tower', 'track', 'trade', 'train', 'treat', 'trend', 'trial', 'tribe', 'trick', 'tried', 'tries', 'truly', 'trunk', 'trust', 'truth', 'twice', 'twist', 'tyler', 'ultra', 'uncle', 'under', 'undue', 'union', 'unity', 'until', 'upper', 'upset', 'urban', 'usage', 'usual', 'valid', 'value', 'video', 'virus', 'visit', 'vital', 'vocal', 'voice', 'waste', 'watch', 'water', 'wheel', 'where', 'which', 'while', 'white', 'whole', 'whose', 'woman', 'women', 'world', 'worry', 'worse', 'worst', 'worth', 'would', 'write', 'wrong', 'wrote', 'yield', 'young', 'yours', 'youth',
  
  // 6+ letter words
  'should', 'around', 'through', 'during', 'follow', 'without', 'another', 'between', 'nothing', 'someone', 'something', 'because', 'before', 'against', 'thought', 'little', 'number', 'people', 'really', 'school', 'always', 'enough', 'almost', 'second', 'family', 'system', 'within', 'rather', 'across', 'change', 'course', 'action', 'figure', 'friend', 'ground', 'happen', 'better', 'cannot', 'common', 'create', 'degree', 'detail', 'either', 'father', 'finger', 'gather', 'govern', 'health', 'height', 'indeed', 'inside', 'itself', 'letter', 'listen', 'living', 'making', 'market', 'matter', 'member', 'method', 'middle', 'minute', 'modern', 'moment', 'mother', 'moving', 'nation', 'nature', 'nearly', 'notice', 'object', 'office', 'opened', 'option', 'others', 'parent', 'period', 'person', 'please', 'policy', 'pretty', 'public', 'reason', 'record', 'remain', 'remove', 'report', 'result', 'return', 'season', 'second', 'senior', 'should', 'simple', 'single', 'sister', 'social', 'source', 'spirit', 'spread', 'spring', 'square', 'street', 'strong', 'summer', 'supply', 'switch', 'taking', 'theory', 'things', 'though', 'thrown', 'toward', 'travel', 'trying', 'turned', 'unique', 'unless', 'unlike', 'update', 'useful', 'valley', 'volume', 'weight', 'winter', 'wonder', 'worked', 'worker', 'writer', 'accept', 'access', 'accord', 'across', 'acting', 'active', 'actual', 'advice', 'affair', 'affect', 'afford', 'afraid', 'agency', 'agenda', 'agreed', 'almost', 'amount', 'animal', 'annual', 'answer', 'anyone', 'appear', 'around', 'arrive', 'artist', 'assume', 'attack', 'attend', 'august', 'author', 'autumn', 'avenue', 'backed', 'battle', 'beauty', 'become', 'behalf', 'belong', 'beside', 'beyond', 'bishop', 'border', 'bottle', 'bottom', 'bought', 'branch', 'breath', 'bridge', 'bright', 'broken', 'budget', 'burden', 'bureau', 'button', 'camera', 'cancer', 'cannot', 'canvas', 'career', 'castle', 'casual', 'caught', 'center', 'centre', 'chance', 'change', 'charge', 'choice', 'choose', 'chosen', 'church', 'circle', 'client', 'closed', 'closer', 'coffee', 'column', 'combat', 'coming', 'commit', 'common', 'comply', 'copper', 'corner', 'county', 'couple', 'course', 'cousin', 'create', 'credit', 'crisis', 'custom', 'damage', 'danger', 'dealer', 'debate', 'decade', 'decide', 'defeat', 'defend', 'define', 'degree', 'demand', 'depend', 'deputy', 'desert', 'design', 'desire', 'detail', 'detect', 'device', 'differ', 'dinner', 'direct', 'doctor', 'dollar', 'domain', 'double', 'driven', 'driver', 'during', 'easily', 'eating', 'editor', 'effect', 'effort', 'eighth', 'either', 'eleven', 'empire', 'employ', 'enable', 'ending', 'energy', 'engage', 'engine', 'enough', 'ensure', 'entire', 'equity', 'escape', 'estate', 'ethnic', 'europe', 'even', 'events', 'exact', 'except', 'excuse', 'expand', 'expect', 'expert', 'export', 'extend', 'extent', 'fabric', 'facial', 'facing', 'factor', 'failed', 'fairly', 'fallen', 'family', 'famous', 'father', 'fellow', 'female', 'figure', 'filing', 'finger', 'finish', 'fiscal', 'flight', 'flying', 'follow', 'forest', 'forget', 'formal', 'format', 'former', 'foster', 'fought', 'fourth', 'french', 'friend', 'future', 'galaxy', 'garden', 'gather', 'gender', 'gentle', 'german', 'global', 'golden', 'ground', 'growth', 'guilty', 'handed', 'handle', 'happen', 'hardly', 'headed', 'health', 'hearing', 'height', 'helped', 'hidden', 'holder', 'honest', 'hoping', 'horror', 'housed', 'however', 'hunger', 'hunter', 'impact', 'import', 'income', 'indeed', 'injury', 'inside', 'intend', 'intent', 'invest', 'island', 'itself', 'jersey', 'joseph', 'junior', 'killed', 'labour', 'latest', 'latter', 'launch', 'lawyer', 'leader', 'league', 'learned', 'legacy', 'length', 'lesson', 'letter', 'liable', 'likely', 'linked', 'liquid', 'listen', 'little', 'living', 'locate', 'locked', 'london', 'longer', 'looked', 'losing', 'lovely', 'loving', 'luxury', 'mainly', 'making', 'manage', 'manner', 'manual', 'margin', 'marine', 'marked', 'market', 'martin', 'master', 'matter', 'mature', 'maybe', 'meadow', 'meaning', 'medium', 'member', 'memory', 'mental', 'merely', 'merger', 'method', 'middle', 'miller', 'mining', 'minute', 'mirror', 'missed', 'mobile', 'modern', 'modify', 'moment', 'monday', 'monkey', 'monthly', 'moral', 'moscow', 'mostly', 'mother', 'motion', 'moving', 'murder', 'muscle', 'museum', 'mutual', 'myself', 'narrow', 'nation', 'native', 'nature', 'nearby', 'nearly', 'needed', 'nephew', 'neural', 'never', 'nicely', 'normal', 'notice', 'notion', 'number', 'object', 'obtain', 'obviously', 'occur', 'office', 'online', 'option', 'orange', 'origin', 'output', 'oxford', 'packed', 'palace', 'panel', 'paper', 'parent', 'partly', 'passed', 'patent', 'patrol', 'paying', 'peace', 'people', 'period', 'permit', 'person', 'phrase', 'picked', 'piece', 'placed', 'planet', 'player', 'please', 'plenty', 'pocket', 'poetry', 'police', 'policy', 'polish', 'pool', 'popular', 'portal', 'potato', 'potter', 'powder', 'praise', 'prayer', 'prefer', 'pretty', 'prince', 'prison', 'profit', 'proper', 'proven', 'public', 'purple', 'purpose', 'pushed', 'puzzle', 'rabbit', 'racial', 'racing', 'radius', 'raised', 'random', 'rarely', 'rather', 'rating', 'reader', 'really', 'reason', 'rebel', 'recall', 'recent', 'record', 'reduce', 'reform', 'refuse', 'regard', 'region', 'relate', 'relief', 'remain', 'remote', 'remove', 'repair', 'repeat', 'reply', 'report', 'rescue', 'result', 'retail', 'return', 'reveal', 'review', 'reward', 'riding', 'rising', 'ritual', 'robust', 'rolled', 'rubber', 'ruling', 'running', 'sacred', 'safety', 'salary', 'sample', 'saving', 'saying', 'scheme', 'school', 'screen', 'script', 'search', 'season', 'second', 'secret', 'sector', 'secure', 'seeing', 'select', 'seller', 'senate', 'senior', 'series', 'server', 'settle', 'severe', 'sexual', 'shadow', 'shared', 'shield', 'should', 'showed', 'shower', 'signal', 'silent', 'silver', 'simple', 'simply', 'single', 'sister', 'sitting', 'smooth', 'soccer', 'social', 'sodium', 'solely', 'solved', 'source', 'soviet', 'speaker', 'spirit', 'spoken', 'spread', 'spring', 'square', 'stable', 'stands', 'statue', 'status', 'steady', 'stolen', 'stored', 'storm', 'strain', 'strand', 'stream', 'street', 'stress', 'strict', 'strike', 'string', 'stroke', 'strong', 'struck', 'studio', 'stupid', 'submit', 'sudden', 'suffer', 'sugar', 'summer', 'sunday', 'supply', 'surely', 'survey', 'switch', 'symbol', 'system', 'tackle', 'taking', 'talent', 'target', 'taught', 'temple', 'tenant', 'tender', 'tennis', 'terror', 'thanks', 'theory', 'thirty', 'though', 'thread', 'threat', 'threw', 'throne', 'thrown', 'ticket', 'timber', 'tissue', 'titled', 'toilet', 'tomato', 'tongue', 'toward', 'traded', 'travel', 'treaty', 'trying', 'tunnel', 'turned', 'twelve', 'twenty', 'typing', 'unable', 'unique', 'united', 'unless', 'unlike', 'update', 'upload', 'useful', 'valley', 'varied', 'vendor', 'versus', 'victim', 'viewer', 'violet', 'virtue', 'vision', 'visual', 'volume', 'walker', 'wanted', 'warned', 'wealth', 'weapon', 'weekly', 'weight', 'wholly', 'window', 'winner', 'winter', 'wisdom', 'within', 'wonder', 'wooden', 'worked', 'worker', 'worthy', 'writer', 'yellow'
]);

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

export function isValidWord(word: string): boolean {
  return word.length >= 3 && VALID_WORDS.has(word.toLowerCase());
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

export function calculateWordScore(word: string, timeBonus: number = 1): number {
  const baseScore = word.length * word.length; // Exponential scoring
  const rarityBonus = getRarityBonus(word);
  return Math.floor(baseScore * rarityBonus * timeBonus);
}

function getRarityBonus(word: string): number {
  // Bonus for uncommon letters
  const rareLetters = ['Q', 'X', 'Z', 'J', 'K'];
  let bonus = 1;
  
  for (const letter of word.toUpperCase()) {
    if (rareLetters.includes(letter)) {
      bonus += 0.5;
    }
  }
  
  // Length bonus
  if (word.length >= 6) bonus += 0.5;
  if (word.length >= 8) bonus += 0.5;
  
  return bonus;
}

export function findAllPossibleWords(grid: string[][]): string[] {
  const words: string[] = [];
  const visited: boolean[][] = Array(4).fill(null).map(() => Array(4).fill(false));
  
  function dfs(row: number, col: number, currentWord: string, path: {row: number, col: number}[]) {
    if (row < 0 || row >= 4 || col < 0 || col >= 4 || visited[row][col]) {
      return;
    }
    
    visited[row][col] = true;
    const newWord = currentWord + grid[row][col];
    const newPath = [...path, {row, col}];
    
    if (newWord.length >= 3 && isValidWord(newWord)) {
      words.push(newWord);
    }
    
    // Continue if word could potentially be valid (not too long)
    if (newWord.length < 15) {
      // Check all 8 adjacent cells
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr === 0 && dc === 0) continue;
          dfs(row + dr, col + dc, newWord, newPath);
        }
      }
    }
    
    visited[row][col] = false;
  }
  
  // Start DFS from each cell
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      dfs(i, j, '', []);
    }
  }
  
  return [...new Set(words)]; // Remove duplicates
}

export function isValidPath(grid: string[][], path: {row: number, col: number}[]): boolean {
  if (path.length < 2) return false;
  
  for (let i = 1; i < path.length; i++) {
    const prev = path[i - 1];
    const curr = path[i];
    
    // Check if adjacent (including diagonally)
    const rowDiff = Math.abs(curr.row - prev.row);
    const colDiff = Math.abs(curr.col - prev.col);
    
    if (rowDiff > 1 || colDiff > 1 || (rowDiff === 0 && colDiff === 0)) {
      return false;
    }
  }
  
  return true;
}

export function pathToWord(grid: string[][], path: {row: number, col: number}[]): string {
  return path.map(pos => grid[pos.row][pos.col]).join('');
} 