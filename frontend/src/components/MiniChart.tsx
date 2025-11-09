import { LineChart, Line, AreaChart, Area, ResponsiveContainer, YAxis } from 'recharts';

interface MiniChartProps {
  data: Array<{ value: number }>;
  type?: 'line' | 'area';
  color?: string;
  height?: number;
  showAxis?: boolean;
  className?: string;
}

/**
 * Minimal sparkline/area chart for inline data visualization
 */
export default function MiniChart({
  data,
  type = 'line',
  color = '#00d9ff',
  height = 40,
  showAxis = false,
  className = '',
}: MiniChartProps) {
  const Chart = type === 'area' ? AreaChart : LineChart;
  const DataComponent = type === 'area' ? Area : Line;

  return (
    <div className={`${className}`}>
      <ResponsiveContainer width="100%" height={height}>
        <Chart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
          {showAxis && (
            <YAxis
              stroke={color}
              strokeOpacity={0.3}
              tick={{ fill: color, fontSize: 8 }}
              width={20}
            />
          )}
          <DataComponent
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            dot={false}
            fill={type === 'area' ? color : undefined}
            fillOpacity={type === 'area' ? 0.2 : undefined}
          />
        </Chart>
      </ResponsiveContainer>
    </div>
  );
}