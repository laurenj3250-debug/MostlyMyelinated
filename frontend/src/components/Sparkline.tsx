interface SparklineData {
  date: string;
  strength: number;
}

interface Props {
  data: SparklineData[];
  width?: number;
  height?: number;
  className?: string;
}

export default function Sparkline({ data, width = 100, height = 30, className = '' }: Props) {
  if (!data || data.length === 0) {
    return null;
  }

  // Find min and max for scaling
  const values = data.map(d => d.strength);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1; // Avoid division by zero

  // Scale points to fit in the viewBox
  const padding = 2;
  const scaleX = (width - padding * 2) / Math.max(data.length - 1, 1);
  const scaleY = (height - padding * 2) / range;

  // Generate SVG path
  const points = data.map((d, i) => {
    const x = padding + i * scaleX;
    const y = height - padding - ((d.strength - min) * scaleY);
    return `${x},${y}`;
  });

  const pathD = `M ${points.join(' L ')}`;

  // Determine stroke color based on trend
  const trend = data.length > 1 ? data[data.length - 1].strength - data[0].strength : 0;
  const strokeColor = trend > 0
    ? 'url(#gradient-up)'
    : trend < 0
    ? 'url(#gradient-down)'
    : 'url(#gradient-neutral)';

  return (
    <svg
      width={width}
      height={height}
      className={`inline-block ${className}`}
      viewBox={`0 0 ${width} ${height}`}
    >
      <defs>
        <linearGradient id="gradient-up" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#10b981" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#22c55e" stopOpacity="1" />
        </linearGradient>
        <linearGradient id="gradient-down" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#ef4444" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#dc2626" stopOpacity="1" />
        </linearGradient>
        <linearGradient id="gradient-neutral" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#6b7280" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#9ca3af" stopOpacity="1" />
        </linearGradient>
      </defs>

      {/* Fill area under the line */}
      <path
        d={`${pathD} L ${width - padding},${height - padding} L ${padding},${height - padding} Z`}
        fill={strokeColor}
        opacity="0.2"
      />

      {/* Line */}
      <path
        d={pathD}
        fill="none"
        stroke={strokeColor}
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
            r="1.5"
            fill={strokeColor}
            opacity="0.8"
          />
        );
      })}
    </svg>
  );
}
