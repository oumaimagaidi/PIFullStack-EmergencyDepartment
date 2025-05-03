import { useState, useEffect } from 'react';
import './Hexagon.css';

// Configuration des directions hexagonales (voisins)
const hexDirections = [
  [1, 0], [1, -1], [0, -1],
  [-1, 0], [-1, 1], [0, 1]
];

const HexGrid = () => {
  const [animatingHexes, setAnimatingHexes] = useState({});
  
  const generateHexGrid = () => {
    const hexagons = [];
    for(let q = -2; q <= 2; q++) {
      for(let r = -2; r <= 2; r++) {
        if (Math.abs(q + r) <= 2) {
          hexagons.push({ q, r });
        }
      }
    }
    return hexagons;
  };

  const getNeighbors = (q, r) => {
    return hexDirections.map(([dq, dr]) => [q + dq, r + dr]);
  };

  const animateHexagon = (q, r, delay) => {
    setAnimatingHexes(prev => ({
      ...prev,
      [`${q},${r}`]: delay
    }));
    
    setTimeout(() => {
      setAnimatingHexes(prev => {
        const newState = { ...prev };
        delete newState[`${q},${r}`];
        return newState;
      });
    }, delay + 500);
  };

  const triggerWave = (originQ, originR) => {
    const visited = new Set();
    const queue = [[originQ, originR, 0]];
    
    while (queue.length > 0) {
      const [q, r, delay] = queue.shift();
      const key = `${q},${r}`;
      
      if (!visited.has(key)) {
        visited.add(key);
        animateHexagon(q, r, delay);
        
        getNeighbors(q, r).forEach(([nq, nr]) => {
          queue.push([nq, nr, delay + 100]);
        });
      }
    }
  };

  const handleHexClick = (q, r) => {
    triggerWave(q, r);
  };

  return (
    <div className="hex-grid">
      {generateHexGrid().map(({ q, r }) => (
        <Hexagon
          key={`${q}-${r}`}
          q={q}
          r={r}
          delay={animatingHexes[`${q},${r}`]}
          onClick={handleHexClick}
        />
      ))}
    </div>
  );
};

const Hexagon = ({ q, r, delay, onClick }) => {
  const xPosition = q * 100 + r * 50;
  const yPosition = r * 87; // 87 ≈ 100 * √3/2

  return (
    <div 
      className={`hexagon ${delay !== undefined ? 'animating' : ''}`}
      style={{
        left: `${xPosition}px`,
        top: `${yPosition}px`,
        '--delay': `${delay}ms`
      }}
      onClick={() => onClick(q, r)}
    >
      <div className="hexagon-inner"></div>
    </div>
  );
};

export default HexGrid;