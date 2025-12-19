import React, { useRef, useState, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Text, Html, Stars, Line, Sphere } from '@react-three/drei';
import * as THREE from 'three';
import { clusters, getClusterById } from './embeddingData';

// Individual word point in 3D space
const WordPoint = ({ position, word, cluster, isHighlighted, isSelected, onClick, onHover }) => {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);
  const clusterInfo = getClusterById(cluster);
  const color = clusterInfo?.color || '#ffffff';
  
  useFrame((state) => {
    if (meshRef.current) {
      // Gentle floating animation
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime + position[0]) * 0.05;
      
      // Scale on hover
      const targetScale = hovered || isSelected ? 1.8 : isHighlighted ? 1.3 : 1;
      meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
    }
  });

  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        onClick={(e) => {
          e.stopPropagation();
          onClick(word);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          onHover(word, e);
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          setHovered(false);
          onHover(null);
          document.body.style.cursor = 'default';
        }}
      >
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={hovered || isSelected ? 0.8 : isHighlighted ? 0.5 : 0.2}
          transparent
          opacity={isHighlighted || hovered || isSelected ? 1 : 0.7}
        />
      </mesh>
      
      {/* Word label - show on hover or if selected */}
      {(hovered || isSelected) && (
        <Html
          position={[0, 0.4, 0]}
          center
          style={{
            pointerEvents: 'none',
            whiteSpace: 'nowrap'
          }}
        >
          <div style={{
            background: 'rgba(10, 10, 15, 0.95)',
            border: `1px solid ${color}`,
            borderRadius: '8px',
            padding: '6px 12px',
            fontFamily: 'Space Mono, monospace',
            fontSize: '12px',
            color: '#fff',
            boxShadow: `0 0 20px ${color}40`
          }}>
            {word}
          </div>
        </Html>
      )}
    </group>
  );
};

// Cluster label in 3D space
const ClusterLabel = ({ position, name, color, count, onClick }) => {
  const [hovered, setHovered] = useState(false);
  
  return (
    <Html
      position={position}
      center
      style={{ pointerEvents: 'auto' }}
    >
      <div
        onClick={() => onClick()}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          background: hovered ? `${color}30` : 'rgba(10, 10, 15, 0.8)',
          border: `1px solid ${color}`,
          borderRadius: '12px',
          padding: '10px 16px',
          fontFamily: 'Syne, sans-serif',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          transform: hovered ? 'scale(1.05)' : 'scale(1)',
          boxShadow: hovered ? `0 0 30px ${color}50` : 'none'
        }}
      >
        <div style={{
          fontSize: '14px',
          fontWeight: '700',
          color: '#fff',
          marginBottom: '4px'
        }}>
          {name}
        </div>
        <div style={{
          fontSize: '10px',
          color: color,
          textTransform: 'uppercase',
          letterSpacing: '1px'
        }}>
          {count} words
        </div>
      </div>
    </Html>
  );
};

// Connection lines between related words
const ConnectionLines = ({ connections, color }) => {
  return connections.map((conn, i) => (
    <Line
      key={i}
      points={[conn.from, conn.to]}
      color={color}
      lineWidth={1}
      transparent
      opacity={0.3}
    />
  ));
};

// Camera controller for smooth transitions
const CameraController = ({ target, zoom }) => {
  const { camera } = useThree();
  const targetVec = useMemo(() => new THREE.Vector3(...target), [target]);
  
  useFrame(() => {
    // Smooth camera movement
    camera.position.lerp(
      new THREE.Vector3(
        targetVec.x + zoom,
        targetVec.y + zoom * 0.5,
        targetVec.z + zoom
      ),
      0.02
    );
    camera.lookAt(targetVec);
  });
  
  return null;
};

// Main 3D scene
const Scene = ({ 
  embeddings, 
  selectedWord, 
  highlightedCluster,
  onWordClick, 
  onWordHover,
  onClusterClick,
  viewLevel,
  cameraTarget,
  cameraZoom
}) => {
  // Calculate cluster centers and counts
  const clusterData = useMemo(() => {
    const data = {};
    clusters.forEach(c => {
      const clusterEmbeddings = embeddings.filter(e => e.cluster === c.id);
      if (clusterEmbeddings.length > 0) {
        const center = clusterEmbeddings.reduce(
          (acc, e) => [
            acc[0] + e.position[0] / clusterEmbeddings.length,
            acc[1] + e.position[1] / clusterEmbeddings.length,
            acc[2] + e.position[2] / clusterEmbeddings.length
          ],
          [0, 0, 0]
        );
        data[c.id] = { center, count: clusterEmbeddings.length, ...c };
      }
    });
    return data;
  }, [embeddings]);

  // Get connections for selected word
  const connections = useMemo(() => {
    if (!selectedWord) return [];
    const selected = embeddings.find(e => e.word === selectedWord);
    if (!selected) return [];
    
    return selected.neighbors.slice(0, 5).map(n => {
      const neighbor = embeddings.find(e => e.word === n.word);
      if (!neighbor) return null;
      return { from: selected.position, to: neighbor.position };
    }).filter(Boolean);
  }, [selectedWord, embeddings]);

  const selectedEmbedding = embeddings.find(e => e.word === selectedWord);
  const connectionColor = selectedEmbedding 
    ? getClusterById(selectedEmbedding.cluster)?.color 
    : '#6366f1';

  return (
    <>
      {/* Ambient lighting */}
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#6366f1" />
      
      {/* Stars background */}
      <Stars radius={100} depth={50} count={3000} factor={4} saturation={0} fade speed={1} />
      
      {/* Camera controller */}
      <CameraController target={cameraTarget} zoom={cameraZoom} />
      
      {/* Word points */}
      {embeddings.map((embedding) => (
        <WordPoint
          key={embedding.word}
          position={embedding.position}
          word={embedding.word}
          cluster={embedding.cluster}
          isHighlighted={highlightedCluster === embedding.cluster}
          isSelected={selectedWord === embedding.word}
          onClick={onWordClick}
          onHover={onWordHover}
        />
      ))}
      
      {/* Connection lines for selected word */}
      {connections.length > 0 && (
        <ConnectionLines connections={connections} color={connectionColor} />
      )}
      
      {/* Cluster labels (only in galaxy view) */}
      {viewLevel === 'galaxy' && Object.values(clusterData).map((cluster) => (
        <ClusterLabel
          key={cluster.id}
          position={[cluster.center[0], cluster.center[1] + 5, cluster.center[2]]}
          name={cluster.name}
          color={cluster.color}
          count={cluster.count}
          onClick={() => onClusterClick(cluster.id)}
        />
      ))}
      
      {/* Orbit controls */}
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        autoRotate={viewLevel === 'galaxy' && !selectedWord}
        autoRotateSpeed={0.3}
        minDistance={5}
        maxDistance={80}
      />
    </>
  );
};

export default Scene;
