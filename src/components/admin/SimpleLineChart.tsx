"use client";

interface LineChartProps {
  data: { label: string; value: number }[];
  height?: number;
  color?: string;
  yLabel?: string;
}

function formatDateLabel(label: string): string {
  // "2026-03-08" → "3/8"
  const m = label.match(/^\d{4}-(\d{2})-(\d{2})$/);
  if (m) return `${parseInt(m[1])}/${parseInt(m[2])}`;
  return label;
}

export function SimpleLineChart({
  data,
  height = 200,
  color = "#8b5cf6",
  yLabel,
}: LineChartProps) {
  if (!data.length) return null;

  const max = Math.max(...data.map((d) => d.value), 1);
  const leftPadding = 44;
  const rightPadding = 10;
  const topPadding = 24;
  const bottomPadding = 28;
  const chartWidth = Math.max(data.length * 20, 300);
  const totalWidth = leftPadding + chartWidth + rightPadding;
  const totalHeight = height + bottomPadding;
  const chartHeight = height - topPadding;

  const getX = (i: number) =>
    leftPadding + (i / Math.max(data.length - 1, 1)) * chartWidth;
  const getY = (value: number) =>
    topPadding + chartHeight - (value / max) * chartHeight;

  const points = data.map((d, i) => `${getX(i)},${getY(d.value)}`).join(" ");
  const areaPoints = `${getX(0)},${getY(0)} ${points} ${getX(data.length - 1)},${getY(0)}`;

  // Y-axis: 3 ticks
  const yTicks = [0, Math.round(max / 2), max];

  // X-axis: pick ~5-6 date labels evenly
  const isDateData = data.length > 0 && /^\d{4}-/.test(data[0].label);
  const xLabelInterval = isDateData
    ? Math.max(1, Math.ceil(data.length / 6))
    : 1;

  return (
    <div className="w-full overflow-x-auto">
      <svg
        width="100%"
        height={totalHeight}
        viewBox={`0 0 ${totalWidth} ${totalHeight}`}
        preserveAspectRatio="none"
        className="min-w-[300px]"
      >
        {/* Y-axis label (horizontal, top-left) */}
        {yLabel && (
          <text
            x={leftPadding}
            y={12}
            textAnchor="start"
            className="fill-gray-400 dark:fill-zinc-500"
            fontSize={10}
          >
            {yLabel}
          </text>
        )}

        {/* Y-axis ticks + grid lines */}
        {yTicks.map((tick, i) => {
          const y = getY(tick);
          return (
            <g key={`ytick-${i}`}>
              <text
                x={leftPadding - 8}
                y={y + 3}
                textAnchor="end"
                className="fill-gray-400 dark:fill-zinc-500"
                fontSize={10}
              >
                {tick}
              </text>
              <line
                x1={leftPadding}
                y1={y}
                x2={totalWidth - rightPadding}
                y2={y}
                stroke="currentColor"
                strokeOpacity={0.07}
                strokeDasharray={tick === 0 ? "0" : "4 3"}
                className="text-gray-400 dark:text-zinc-600"
              />
            </g>
          );
        })}

        {/* Area fill */}
        <polygon points={areaPoints} fill={color} opacity={0.1} />

        {/* Line */}
        <polyline
          points={points}
          fill="none"
          stroke={color}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Data points */}
        {data.map((d, i) => (
          <circle key={i} cx={getX(i)} cy={getY(d.value)} r={3} fill={color}>
            <title>{`${d.label}: ${d.value}`}</title>
          </circle>
        ))}

        {/* X-axis date labels */}
        {data.map((d, i) => {
          if (isDateData && data.length > 10) {
            if (i % xLabelInterval !== 0 && i !== data.length - 1) return null;
          }
          const displayLabel = isDateData ? formatDateLabel(d.label) : d.label;
          return (
            <text
              key={`xlabel-${i}`}
              x={getX(i)}
              y={totalHeight - 6}
              textAnchor="middle"
              className="fill-gray-500 dark:fill-zinc-400"
              fontSize={10}
            >
              {displayLabel}
            </text>
          );
        })}
      </svg>
    </div>
  );
}
