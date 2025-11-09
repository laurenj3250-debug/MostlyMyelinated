interface HeatMapBarProps {
  strength: number; // 0-100
  showPercentage?: boolean; // default true
  size?: 'small' | 'medium' | 'large'; // default medium
  animate?: boolean; // default true
}

/**
 * PET scan style heat map bar for visualizing strength/progress
 * 7-band color gradient representing neural strength states
 */
export default function HeatMapBar({
  strength,
  showPercentage = true,
  size = 'medium',
  animate = true,
}: HeatMapBarProps) {
  const heightMap = {
    small: 'h-2',
    medium: 'h-4',
    large: 'h-6',
  };
  const height = heightMap[size];
  const getHeatMapClass = () => {
    if (strength < 20) return 'heatmap-critical';
    if (strength < 40) return 'heatmap-weak';
    if (strength < 60) return 'heatmap-moderate';
    if (strength < 80) return 'heatmap-good';
    if (strength < 95) return 'heatmap-strong';
    return 'heatmap-mastered';
  };

  const getStatusLabel = () => {
    if (strength < 20) return 'CRITICAL';
    if (strength < 40) return 'WEAK';
    if (strength < 60) return 'MODERATE';
    if (strength < 80) return 'GOOD';
    if (strength < 95) return 'STRONG';
    return 'MASTERED';
  };

  return (
    <div className="relative">
      <div className={`${height} bg-black border border-lab-cyan/20 overflow-hidden relative`}>
        {/* Background grid */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0" style={{
            backgroundImage: `repeating-linear-gradient(90deg, transparent, transparent 9px, rgba(0, 217, 255, 0.2) 9px, rgba(0, 217, 255, 0.2) 10px)`,
          }}></div>
        </div>

        {/* Heat map fill */}
        <div
          className={`absolute inset-y-0 left-0 ${getHeatMapClass()} transition-all duration-700`}
          style={{ width: `${Math.min(strength, 100)}%` }}
        >
          {/* Pulse effect for high values */}
          {animate && strength >= 80 && (
            <div className="absolute inset-0 animate-pulse opacity-50 bg-gradient-to-r from-transparent via-white to-transparent"></div>
          )}
        </div>

        {/* Value display */}
        {showPercentage && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-lab-cyan drop-shadow-lg">
                {strength.toFixed(1)}%
              </span>
              <span className="text-xs font-mono text-lab-cyan/70 uppercase">
                {getStatusLabel()}
              </span>
            </div>
          </div>
        )}

        {/* Scan lines overlay */}
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0, 217, 255, 0.05) 3px, rgba(0, 217, 255, 0.05) 4px)`,
        }}></div>
      </div>

      {/* Tick marks */}
      <div className="absolute inset-x-0 top-0 bottom-0 flex pointer-events-none">
        {[20, 40, 60, 80, 95].map(tick => (
          <div
            key={tick}
            className="absolute top-0 bottom-0 w-px bg-lab-cyan/30"
            style={{ left: `${tick}%` }}
          />
        ))}
      </div>
    </div>
  );
}