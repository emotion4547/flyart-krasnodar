import { useState, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';

interface WheelSegment {
  id: string;
  label: string;
  color: string;
  probability: number;
}

interface FortuneWheelProps {
  segments: WheelSegment[];
  onSpinEnd: (segment: WheelSegment) => void;
  isSpinning: boolean;
  setIsSpinning: (spinning: boolean) => void;
}

export function FortuneWheel({ segments, onSpinEnd, isSpinning, setIsSpinning }: FortuneWheelProps) {
  const [rotation, setRotation] = useState(0);
  const wheelRef = useRef<SVGGElement>(null);

  const spin = useCallback(() => {
    if (isSpinning || segments.length === 0) return;

    setIsSpinning(true);

    // Weighted random selection
    const totalWeight = segments.reduce((sum, s) => sum + s.probability, 0);
    let random = Math.random() * totalWeight;
    let selectedIndex = 0;

    for (let i = 0; i < segments.length; i++) {
      random -= segments[i].probability;
      if (random <= 0) {
        selectedIndex = i;
        break;
      }
    }

    const selectedSegment = segments[selectedIndex];
    const segmentAngle = 360 / segments.length;
    
    // Calculate target angle (center of segment, pointer at top = 0°)
    const targetAngle = 360 - (selectedIndex * segmentAngle + segmentAngle / 2);
    
    // Add 6-9 full rotations for dramatic effect
    const spins = 6 + Math.floor(Math.random() * 4);
    const finalRotation = rotation + (spins * 360) + targetAngle + (Math.random() * 10 - 5);

    setRotation(finalRotation);

    // Notify when done (match animation duration)
    setTimeout(() => {
      setIsSpinning(false);
      onSpinEnd(selectedSegment);
    }, 5000);
  }, [isSpinning, segments, rotation, onSpinEnd, setIsSpinning]);

  const segmentAngle = 360 / segments.length;
  const radius = 140;
  const centerX = 150;
  const centerY = 150;

  // Create SVG path for segment
  const createSegmentPath = (index: number) => {
    const startAngle = (index * segmentAngle - 90) * (Math.PI / 180);
    const endAngle = ((index + 1) * segmentAngle - 90) * (Math.PI / 180);

    const x1 = centerX + radius * Math.cos(startAngle);
    const y1 = centerY + radius * Math.sin(startAngle);
    const x2 = centerX + radius * Math.cos(endAngle);
    const y2 = centerY + radius * Math.sin(endAngle);

    const largeArc = segmentAngle > 180 ? 1 : 0;

    return `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;
  };

  // Calculate text position and rotation for segment (text along radius)
  const getTextTransform = (index: number) => {
    const midAngle = (index + 0.5) * segmentAngle - 90;
    const textRadius = radius * 0.6;
    const angleRad = midAngle * (Math.PI / 180);
    const x = centerX + textRadius * Math.cos(angleRad);
    const y = centerY + textRadius * Math.sin(angleRad);
    
    // Rotate text to be readable (flip if on left side)
    let textRotation = midAngle + 90;
    if (midAngle > 0 && midAngle < 180) {
      textRotation += 180;
    }
    
    return { x, y, rotation: textRotation };
  };

  // Truncate long labels
  const truncateLabel = (label: string, maxLen: number = 10) => {
    if (label.length <= maxLen) return label;
    return label.slice(0, maxLen - 1) + '…';
  };

  return (
    <div className="relative flex flex-col items-center">
      {/* Wheel container - fixed size to prevent movement */}
      <div className="relative w-[300px] h-[300px]">
        {/* Pointer - positioned outside the rotating area */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 z-10">
          <div className="w-0 h-0 border-l-[14px] border-l-transparent border-r-[14px] border-r-transparent border-t-[24px] border-t-gold drop-shadow-lg" />
        </div>

        {/* Outer glow ring - static */}
        <div className="absolute inset-[-8px] rounded-full bg-gradient-to-b from-gold/20 to-gold/5 blur-sm pointer-events-none" />
        
        {/* Outer ring - static */}
        <div className="absolute inset-0 rounded-full border-[6px] border-gold/40 shadow-xl pointer-events-none" />

        {/* SVG wheel - only this rotates */}
        <svg 
          width="300" 
          height="300" 
          viewBox="0 0 300 300"
          className="block"
          style={{ overflow: 'visible' }}
        >
          <defs>
            <filter id="wheelShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="4" floodOpacity="0.2" />
            </filter>
            <filter id="innerShadow">
              <feDropShadow dx="0" dy="1" stdDeviation="2" floodOpacity="0.3" />
            </filter>
          </defs>

          <motion.g
            ref={wheelRef}
            style={{ 
              transformOrigin: '150px 150px',
            }}
            animate={{ rotate: rotation }}
            transition={{
              duration: 5,
              ease: [0.33, 1, 0.68, 1], // easeOutCubic - starts fast, slows smoothly
            }}
            filter="url(#wheelShadow)"
          >
            {/* Segments */}
            {segments.map((segment, index) => {
              const textTransform = getTextTransform(index);
              return (
                <g key={segment.id}>
                  <path
                    d={createSegmentPath(index)}
                    fill={segment.color}
                    stroke="white"
                    strokeWidth="2"
                  />
                  <text
                    x={textTransform.x}
                    y={textTransform.y}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="white"
                    fontSize="11"
                    fontWeight="600"
                    style={{
                      textShadow: '1px 1px 2px rgba(0,0,0,0.6)',
                    }}
                    transform={`rotate(${textTransform.rotation}, ${textTransform.x}, ${textTransform.y})`}
                  >
                    {truncateLabel(segment.label)}
                  </text>
                </g>
              );
            })}

            {/* Center circle */}
            <circle cx={centerX} cy={centerY} r="28" fill="white" stroke="#e5e7eb" strokeWidth="3" filter="url(#innerShadow)" />
            <circle cx={centerX} cy={centerY} r="22" fill="#fafafa" />
            <text
              x={centerX}
              y={centerY}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="16"
            >
              🎡
            </text>
          </motion.g>
        </svg>
      </div>

      {/* Spin button */}
      <motion.button
        onClick={spin}
        disabled={isSpinning || segments.length === 0}
        className="mt-6 px-8 py-3 bg-gradient-to-r from-gold to-gold-dark text-white font-bold rounded-full shadow-lg disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-xl transition-all"
        whileHover={{ scale: isSpinning ? 1 : 1.05 }}
        whileTap={{ scale: isSpinning ? 1 : 0.95 }}
      >
        {isSpinning ? 'Крутится...' : 'Крутить!'}
      </motion.button>
    </div>
  );
}
