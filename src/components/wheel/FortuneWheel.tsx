import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

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
    
    // Calculate target angle (center of segment)
    const targetAngle = 360 - (selectedIndex * segmentAngle + segmentAngle / 2);
    
    // Add 5-7 full rotations
    const spins = 5 + Math.floor(Math.random() * 3);
    const finalRotation = rotation + (spins * 360) + targetAngle + (Math.random() * 10 - 5);

    setRotation(finalRotation);

    // Notify when done
    setTimeout(() => {
      setIsSpinning(false);
      onSpinEnd(selectedSegment);
    }, 4500);
  }, [isSpinning, segments, rotation, onSpinEnd, setIsSpinning]);

  const segmentAngle = 360 / segments.length;
  const radius = 150;
  const centerX = 160;
  const centerY = 160;

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

  // Calculate text position for segment
  const getTextPosition = (index: number) => {
    const midAngle = ((index + 0.5) * segmentAngle - 90) * (Math.PI / 180);
    const textRadius = radius * 0.65;
    return {
      x: centerX + textRadius * Math.cos(midAngle),
      y: centerY + textRadius * Math.sin(midAngle),
      rotation: (index + 0.5) * segmentAngle,
    };
  };

  return (
    <div className="relative flex flex-col items-center">
      {/* Wheel */}
      <div className="relative">
        {/* Pointer */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-10">
          <div className="w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[20px] border-t-gold drop-shadow-lg" />
        </div>

        {/* Outer ring */}
        <div className="absolute inset-0 rounded-full border-8 border-gold/30 shadow-2xl" />

        <svg width="320" height="320" viewBox="0 0 320 320">
          <defs>
            <filter id="wheelShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="4" stdDeviation="8" floodOpacity="0.3" />
            </filter>
          </defs>

          <motion.g
            ref={wheelRef}
            style={{ originX: '160px', originY: '160px' }}
            animate={{ rotate: rotation }}
            transition={{
              duration: 4,
              ease: [0.17, 0.67, 0.12, 0.99],
            }}
            filter="url(#wheelShadow)"
          >
            {/* Segments */}
            {segments.map((segment, index) => {
              const textPos = getTextPosition(index);
              return (
                <g key={segment.id}>
                  <path
                    d={createSegmentPath(index)}
                    fill={segment.color}
                    stroke="white"
                    strokeWidth="2"
                  />
                  <text
                    x={textPos.x}
                    y={textPos.y}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="white"
                    fontSize="14"
                    fontWeight="bold"
                    style={{
                      textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
                    }}
                    transform={`rotate(${textPos.rotation}, ${textPos.x}, ${textPos.y})`}
                  >
                    {segment.label}
                  </text>
                </g>
              );
            })}

            {/* Center circle */}
            <circle cx={centerX} cy={centerY} r="30" fill="white" stroke="#e0e0e0" strokeWidth="2" />
            <circle cx={centerX} cy={centerY} r="25" fill="linear-gradient(135deg, #f8f8f8, #e0e0e0)" />
            <text
              x={centerX}
              y={centerY}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="12"
              fontWeight="bold"
              fill="#333"
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
        className="mt-6 px-8 py-3 bg-gradient-to-r from-gold to-gold-dark text-white font-bold rounded-full shadow-lg disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-xl transition-shadow"
        whileHover={{ scale: isSpinning ? 1 : 1.05 }}
        whileTap={{ scale: isSpinning ? 1 : 0.95 }}
      >
        {isSpinning ? 'Крутится...' : 'Крутить!'}
      </motion.button>
    </div>
  );
}
