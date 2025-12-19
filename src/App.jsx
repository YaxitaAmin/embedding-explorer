import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import Scene from './Scene';
import { 
  generateEmbeddings, 
  clusters, 
  getClusterById, 
  searchWords 
} from './embeddingData';

const App = () => {
  // Generate embeddings on mount
  const embeddings = useMemo(() => generateEmbeddings(), []);
  
  // State
  const [selectedWord, setSelectedWord] = useState(null);
  const [hoveredWord, setHoveredWord] = useState(null);
  const [highlightedCluster, setHighlightedCluster] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [viewLevel, setViewLevel] = useState('galaxy'); // galaxy, cluster, word
  const [isLoading, setIsLoading] = useState(true);
  
  // Camera state
  const [cameraTarget, setCameraTarget] = useState([0, 0, 0]);
  const [cameraZoom, setCameraZoom] = useState(40);

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  // Search handler
  useEffect(() => {
    if (searchQuery.length > 0) {
      const results = searchWords(searchQuery, embeddings);
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, embeddings]);

  // Word click handler
  const handleWordClick = useCallback((word) => {
    const embedding = embeddings.find(e => e.word === word);
    if (embedding) {
      setSelectedWord(word);
      setViewLevel('word');
      setCameraTarget(embedding.position);
      setCameraZoom(12);
      setSearchQuery('');
      setSearchResults([]);
    }
  }, [embeddings]);

  // Cluster click handler
  const handleClusterClick = useCallback((clusterId) => {
    const clusterEmbeddings = embeddings.filter(e => e.cluster === clusterId);
    if (clusterEmbeddings.length > 0) {
      const center = clusterEmbeddings.reduce(
        (acc, e) => [
          acc[0] + e.position[0] / clusterEmbeddings.length,
          acc[1] + e.position[1] / clusterEmbeddings.length,
          acc[2] + e.position[2] / clusterEmbeddings.length
        ],
        [0, 0, 0]
      );
      setHighlightedCluster(clusterId);
      setViewLevel('cluster');
      setCameraTarget(center);
      setCameraZoom(20);
      setSelectedWord(null);
    }
  }, [embeddings]);

  // Back to galaxy view
  const handleBackToGalaxy = useCallback(() => {
    setViewLevel('galaxy');
    setSelectedWord(null);
    setHighlightedCluster(null);
    setCameraTarget([0, 0, 0]);
    setCameraZoom(40);
  }, []);

  // Get selected word details
  const selectedWordData = useMemo(() => {
    if (!selectedWord) return null;
    return embeddings.find(e => e.word === selectedWord);
  }, [selectedWord, embeddings]);

  // Word hover handler
  const handleWordHover = useCallback((word) => {
    setHoveredWord(word);
  }, []);

  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="loading-text">Mapping Embedding Space</div>
        <div className="loading-bar">
          <div className="loading-progress" />
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* 3D Canvas */}
      <div className="canvas-container">
        <Canvas
          camera={{ position: [40, 20, 40], fov: 60 }}
          gl={{ antialias: true, alpha: true }}
        >
          <Scene
            embeddings={embeddings}
            selectedWord={selectedWord}
            highlightedCluster={highlightedCluster}
            onWordClick={handleWordClick}
            onWordHover={handleWordHover}
            onClusterClick={handleClusterClick}
            viewLevel={viewLevel}
            cameraTarget={cameraTarget}
            cameraZoom={cameraZoom}
          />
        </Canvas>
      </div>

      {/* Header */}
      <div className="header">
        <div className="logo">
          Embedding<span>Explorer</span>
        </div>
        <div className="level-indicator">
          <div className={`level-dot ${viewLevel === 'galaxy' ? 'active' : ''}`} />
          <div className={`level-dot ${viewLevel === 'cluster' ? 'active' : ''}`} />
          <div className={`level-dot ${viewLevel === 'word' ? 'active' : ''}`} />
        </div>
      </div>

      {/* Search box */}
      <div className="search-container">
        <input
          type="text"
          className="search-box"
          placeholder="Search words..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchResults.length > 0 && (
          <div style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            marginTop: '8px',
            background: 'rgba(10, 10, 15, 0.95)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '12px',
            overflow: 'hidden',
            backdropFilter: 'blur(10px)'
          }}>
            {searchResults.map((result) => (
              <div
                key={result.word}
                onClick={() => handleWordClick(result.word)}
                style={{
                  padding: '12px 20px',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(99, 102, 241, 0.2)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <span style={{ color: '#fff', fontSize: '13px' }}>{result.word}</span>
                <span style={{ 
                  color: getClusterById(result.cluster)?.color,
                  fontSize: '10px',
                  textTransform: 'uppercase',
                  letterSpacing: '1px'
                }}>
                  {getClusterById(result.cluster)?.name}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Back button (when not in galaxy view) */}
      {viewLevel !== 'galaxy' && (
        <button className="back-btn" onClick={handleBackToGalaxy}>
          ← Back to Galaxy
        </button>
      )}

      {/* Info panel (galaxy view) */}
      {viewLevel === 'galaxy' && !selectedWord && (
        <div className="info-panel">
          <h1 className="info-title">
            Word Embedding Space
          </h1>
          <p className="info-description">
            Explore the 3D landscape of word meanings. Each point is a word, 
            positioned by its semantic relationships. Similar words cluster together.
            Click on clusters to explore, or search for specific words.
          </p>
          <div className="info-stats">
            <div className="stat">
              <div className="stat-value">{embeddings.length}</div>
              <div className="stat-label">Words</div>
            </div>
            <div className="stat">
              <div className="stat-value">{clusters.length}</div>
              <div className="stat-label">Clusters</div>
            </div>
            <div className="stat">
              <div className="stat-value">100</div>
              <div className="stat-label">Dimensions</div>
            </div>
          </div>
        </div>
      )}

      {/* Word detail panel */}
      {selectedWordData && (
        <div className="word-detail-panel">
          <div className="detail-word">{selectedWordData.word}</div>
          <div 
            className="detail-cluster"
            style={{ color: getClusterById(selectedWordData.cluster)?.color }}
          >
            {getClusterById(selectedWordData.cluster)?.name}
          </div>
          
          <div className="detail-section">
            <div className="detail-section-title">Nearest Neighbors</div>
            <div className="neighbors-list">
              {selectedWordData.neighbors.slice(0, 8).map((neighbor) => (
                <div
                  key={neighbor.word}
                  className="neighbor-tag"
                  onClick={() => handleWordClick(neighbor.word)}
                >
                  {neighbor.word}
                  <span style={{ 
                    marginLeft: '6px', 
                    opacity: 0.5,
                    fontSize: '10px'
                  }}>
                    {(neighbor.similarity * 100).toFixed(0)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="detail-section">
            <div className="detail-section-title">Embedding Visualization</div>
            <div className="embedding-viz">
              {selectedWordData.embedding.slice(0, 64).map((val, i) => (
                <div
                  key={i}
                  className="embedding-cell"
                  style={{
                    background: val > 0 
                      ? `rgba(99, 102, 241, ${Math.abs(val)})` 
                      : `rgba(251, 113, 133, ${Math.abs(val)})`
                  }}
                />
              ))}
            </div>
            <div style={{ 
              marginTop: '8px', 
              fontSize: '10px', 
              color: 'rgba(255,255,255,0.4)',
              display: 'flex',
              justifyContent: 'space-between'
            }}>
              <span>First 64 of 100 dimensions</span>
              <span>
                <span style={{ color: '#6366f1' }}>■</span> positive 
                <span style={{ color: '#fb7185', marginLeft: '8px' }}>■</span> negative
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Cluster legend */}
      <div className="cluster-legend">
        {clusters.map((cluster) => (
          <div
            key={cluster.id}
            className={`legend-item ${highlightedCluster === cluster.id ? 'active' : ''}`}
            style={{ borderColor: highlightedCluster === cluster.id ? cluster.color : 'transparent' }}
            onClick={() => handleClusterClick(cluster.id)}
          >
            <div 
              className="legend-dot"
              style={{ background: cluster.color }}
            />
            <span className="legend-label">{cluster.name}</span>
            <span className="legend-count">
              {embeddings.filter(e => e.cluster === cluster.id).length}
            </span>
          </div>
        ))}
      </div>

      {/* Instructions */}
      <div className="instructions">
        <div className="instruction">
          <span className="instruction-key">Drag</span>
          <span>Rotate</span>
        </div>
        <div className="instruction">
          <span className="instruction-key">Scroll</span>
          <span>Zoom</span>
        </div>
        <div className="instruction">
          <span className="instruction-key">Click</span>
          <span>Select</span>
        </div>
      </div>
    </div>
  );
};

export default App;
