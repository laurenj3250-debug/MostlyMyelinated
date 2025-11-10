interface SparklineData {
  date: string;
  strength: number;
}

interface Props {
  data: SparklineData[];
  width?: number | string;
  height?: number;
  className?: string;
  color?: string;
  showGrid?: boolean;
}

export default function Sparkline({ data, width = 100, height = 30, className = '', color = '#00d9ff', showGrid = false }: Props) {
  if (!data || data.length === 0) {
    return null;
  }

  // Convert width to number if it's a string percentage
  const numericWidth = typeof width === 'string' ? 300 : width;

  // Find min and max for scaling
  const values = data.map(d => d.strength);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1; // Avoid division by zero

  // Scale points to fit in the viewBox
  const padding = 2;
  const scaleX = (numericWidth - padding * 2) / Math.max(data.length - 1, 1);
  const scaleY = (height - padding * 2) / range;

  // Generate SVG path
  const points = data.map((d, i) => {
    const x = padding + i * scaleX;
    const y = height - padding - ((d.strength - min) * scaleY);
    return `${x},${y}`;
  });

  const pathD = `M ${points.join(' L ')}`;

  return (
    <svg
      width={width}
      height={height}
      className={`inline-block ${className}`}
      viewBox={`0 0 ${numericWidth} ${height}`}
    >
      {/* Grid lines */}
      {showGrid && (
        <g opacity="0.1">
          <line x1="0" y1={height / 4} x2={numericWidth} y2={height / 4} stroke={color} strokeWidth="0.5" />
          <line x1="0" y1={height / 2} x2={numericWidth} y2={height / 2} stroke={color} strokeWidth="0.5" />
          <line x1="0" y1={(height * 3) / 4} x2={numericWidth} y2={(height * 3) / 4} stroke={color} strokeWidth="0.5" />
        </g>
      )}

      {/* Fill area under the line */}
      <path
        d={`${pathD} L ${numericWidth - padding},${height - padding} L ${padding},${height - padding} Z`}
        fill={color}
        opacity="0.15"
      />

      {/* Line */}
      <path
        d={pathD}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Points */}
      {data.map((d, i) => {
        const x = padding + i * scaleX;
        const y = height - padding - ((d.strength - min) * scaleY);
        return (
          <circle
            key={i}
            cx={x}
            cy={y}
            r="2"
            fill={color}
            opacity="0.9"
          />
        );
      })}
    </svg>
  );
}
