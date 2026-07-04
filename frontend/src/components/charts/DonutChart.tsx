import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, TooltipProps } from 'recharts';
import { cn } from '@/lib/utils';

interface PieData {
  name: string;
  value: number;
  color: string;
}

interface DonutChartProps {
  data: PieData[];
  height?: number;
  innerRadius?: number;
  outerRadius?: number;
  showLabels?: boolean;
  className?: string;
}

const CustomTooltip = ({ active, payload }: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload as PieData;
    return (
      <div className="custom-tooltip">
        <p className="text-xs text-muted-foreground mb-1">{data.name}</p>
        <p className="text-sm font-semibold text-white">{data.value.toLocaleString()}</p>
      </div>
    );
  }
  return null;
};

export function DonutChart({
  data,
  height = 200,
  innerRadius = 60,
  outerRadius = 80,
  showLabels = false,
  className,
}: DonutChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className={cn('relative', className)} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            paddingAngle={2}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
      {showLabels && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <p className="text-2xl font-bold text-white">{total.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Total</p>
          </div>
        </div>
      )}
    </div>
  );
}

export function JobStatusChart({ data }: { data: { status: string; count: number }[] }) {
  const colorMap: Record<string, string> = {
    completed: '#00BFA6',
    running: '#22D3EE',
    pending: '#A855F7',
    failed: '#FF6584',
    retrying: '#F59E0B',
  };

  const chartData = data.map((item) => ({
    name: item.status.charAt(0).toUpperCase() + item.status.slice(1),
    value: item.count,
    color: colorMap[item.status] || '#4B5563',
  }));

  return <DonutChart data={chartData} height={220} showLabels />;
}
