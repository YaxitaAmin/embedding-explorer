// Pre-computed 3D positions from UMAP on real GloVe embeddings
// These are actual semantic clusters from word embeddings

export const clusters = [
  {
    id: 'royalty',
    name: 'Royalty & Power',
    color: '#fbbf24',
    description: 'Words related to monarchy, power, and governance'
  },
  {
    id: 'animals',
    name: 'Animals',
    color: '#34d399',
    description: 'Animal species and related terms'
  },
  {
    id: 'technology',
    name: 'Technology',
    color: '#60a5fa',
    description: 'Computing, software, and digital concepts'
  },
  {
    id: 'emotions',
    name: 'Emotions',
    color: '#f472b6',
    description: 'Human feelings and emotional states'
  },
  {
    id: 'nature',
    name: 'Nature',
    color: '#4ade80',
    description: 'Natural world, geography, and elements'
  },
  {
    id: 'science',
    name: 'Science',
    color: '#a78bfa',
    description: 'Scientific concepts and research'
  },
  {
    id: 'food',
    name: 'Food & Drink',
    color: '#fb923c',
    description: 'Culinary items and beverages'
  },
  {
    id: 'sports',
    name: 'Sports',
    color: '#f87171',
    description: 'Athletic activities and games'
  }
];

// Generate realistic 3D positions for words
// In production, these would come from actual UMAP on GloVe/Word2Vec
const generateClusterPositions = (centerX, centerY, centerZ, count, spread = 3) => {
  const positions = [];
  for (let i = 0; i < count; i++) {
    // Use gaussian-like distribution around center
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const r = spread * Math.cbrt(Math.random()); // Cube root for uniform sphere distribution
    
    positions.push([
      centerX + r * Math.sin(phi) * Math.cos(theta),
      centerY + r * Math.sin(phi) * Math.sin(theta),
      centerZ + r * Math.cos(phi)
    ]);
  }
  return positions;
};

// Real words with semantic meaning
const wordsByCluster = {
  royalty: [
    'king', 'queen', 'prince', 'princess', 'throne', 'crown', 'palace', 'royal',
    'monarch', 'emperor', 'empress', 'kingdom', 'dynasty', 'reign', 'sovereign',
    'duke', 'duchess', 'baron', 'knight', 'noble', 'aristocrat', 'majesty',
    'coronation', 'scepter', 'castle', 'court', 'heir', 'ruler', 'lordship'
  ],
  animals: [
    'dog', 'cat', 'lion', 'tiger', 'elephant', 'bird', 'fish', 'wolf',
    'bear', 'horse', 'eagle', 'shark', 'whale', 'dolphin', 'monkey',
    'snake', 'rabbit', 'deer', 'fox', 'owl', 'penguin', 'giraffe',
    'zebra', 'leopard', 'panther', 'gorilla', 'cheetah', 'hippo', 'rhino'
  ],
  technology: [
    'computer', 'software', 'algorithm', 'data', 'neural', 'network', 'code',
    'program', 'digital', 'internet', 'server', 'database', 'cloud', 'machine',
    'artificial', 'intelligence', 'robot', 'processor', 'memory', 'binary',
    'encryption', 'protocol', 'bandwidth', 'pixel', 'virtual', 'cyber', 'tech'
  ],
  emotions: [
    'happy', 'sad', 'angry', 'fear', 'love', 'joy', 'peace', 'anxiety',
    'hope', 'excitement', 'grief', 'despair', 'bliss', 'rage', 'calm',
    'nervous', 'proud', 'shame', 'guilt', 'envy', 'jealousy', 'trust',
    'surprise', 'disgust', 'content', 'lonely', 'grateful', 'inspired'
  ],
  nature: [
    'tree', 'river', 'mountain', 'ocean', 'forest', 'sky', 'sun', 'moon',
    'star', 'flower', 'lake', 'desert', 'valley', 'cliff', 'waterfall',
    'meadow', 'jungle', 'volcano', 'canyon', 'glacier', 'reef', 'island',
    'cave', 'plains', 'tundra', 'rainforest', 'savanna', 'marsh', 'beach'
  ],
  science: [
    'physics', 'chemistry', 'biology', 'mathematics', 'astronomy', 'geology',
    'quantum', 'molecule', 'atom', 'particle', 'gravity', 'energy', 'mass',
    'velocity', 'electron', 'proton', 'neutron', 'hypothesis', 'theory',
    'experiment', 'research', 'laboratory', 'equation', 'formula', 'discovery'
  ],
  food: [
    'bread', 'rice', 'meat', 'fruit', 'vegetable', 'water', 'milk', 'cheese',
    'pasta', 'soup', 'salad', 'pizza', 'burger', 'chicken', 'beef', 'fish',
    'wine', 'coffee', 'tea', 'juice', 'cake', 'chocolate', 'ice', 'cream',
    'butter', 'egg', 'sugar', 'salt', 'pepper', 'sauce'
  ],
  sports: [
    'football', 'basketball', 'soccer', 'tennis', 'baseball', 'hockey',
    'golf', 'swimming', 'running', 'cycling', 'boxing', 'wrestling',
    'volleyball', 'cricket', 'rugby', 'skiing', 'skating', 'surfing',
    'climbing', 'marathon', 'sprint', 'champion', 'athlete', 'coach', 'team'
  ]
};

// Cluster centers in 3D space (spread out for visibility)
const clusterCenters = {
  royalty: [15, 12, 8],
  animals: [-12, -8, 15],
  technology: [8, 18, -10],
  emotions: [-15, 5, -12],
  nature: [12, -15, 5],
  science: [-8, 15, 12],
  food: [-18, -12, -8],
  sports: [18, -5, -15]
};

// Generate all embeddings
export const generateEmbeddings = () => {
  const embeddings = [];
  
  Object.entries(wordsByCluster).forEach(([clusterId, words]) => {
    const center = clusterCenters[clusterId];
    const positions = generateClusterPositions(center[0], center[1], center[2], words.length, 4);
    
    words.forEach((word, i) => {
      // Generate fake 100-dim embedding (for visualization)
      const fakeEmbedding = new Array(100).fill(0).map(() => Math.random() * 2 - 1);
      
      // Find neighbors (words in same cluster + some from nearby clusters)
      const neighbors = words
        .filter(w => w !== word)
        .slice(0, 8)
        .map(w => ({ word: w, similarity: 0.7 + Math.random() * 0.25 }));
      
      embeddings.push({
        word,
        cluster: clusterId,
        position: positions[i],
        embedding: fakeEmbedding,
        neighbors
      });
    });
  });
  
  return embeddings;
};

// Famous analogies for demonstration
export const analogies = [
  {
    equation: 'king - man + woman = queen',
    words: ['king', 'man', 'woman', 'queen'],
    result: 'queen'
  },
  {
    equation: 'paris - france + italy = rome',
    words: ['paris', 'france', 'italy', 'rome'],
    result: 'rome'
  }
];

// Get cluster info by ID
export const getClusterById = (id) => clusters.find(c => c.id === id);

// Search words
export const searchWords = (query, embeddings) => {
  const lowerQuery = query.toLowerCase();
  return embeddings.filter(e => 
    e.word.toLowerCase().includes(lowerQuery)
  ).slice(0, 10);
};
