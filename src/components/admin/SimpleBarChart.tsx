"use client";

interface BarChartProps {
  data: { label: string; value: number }[];
  height?: number;
  color?: string;
  formatValue?: (v: number) => string;
  yLabel?: string;
}

function formatDateLabel(label: string): string {
  // "2026-03-08" → "3/8"
  const m = label.match(/^\d{4}-(\d{2})-(\d{2})$/);
  if (m) return `${parseInt(m[1])}/${parseInt(m[2])}`;
  return label;
}

export function SimpleBarChart({
  data,
  height = 200,
  color = "#3b82f6",
  formatValue = (v) => String(v),
  yLabel,
}: BarChartProps) {
  if (!data.length) return null;

  const max = Math.max(...data.map((d) => d.value), 1);
  const leftPadding = 56;
  const rightPadding = 16;
  const gap = 8;
  const barWidth = Math.max(
    12,
    (600 - leftPadding - rightPadding - gap * (data.length - 1)) / data.length
  );
  const totalWidth =
    leftPadding + rightPadding + data.length * barWidth + (data.length - 1) * gap;
  const bottomPadding = 32;

  // Y-axis: 3 ticks
  const yTicks = [0, max / 2, max];

  // X-axis: pick ~5-6 date labels evenly
  const isDateData = data.length > 0 && /^\d{4}-/.test(data[0].label);
  const xLabelInterval = isDateData
    ? Math.max(1, Math.ceil(data.length / 6))
    : 1;

  return (
    <div className="w-full overflow-x-auto">
      <svg
        width="100%"
        viewBox={`0 0 ${totalWidth} ${height + bottomPadding}`}
        preserveAspectRatio="xMidYMid meet"
        className="min-w-[300px]"
      >
        {/* Y-axis label (horizontal, top-left) */}
        {yLabel && (
          <text
            x={leftPadding}
            y={10}
            textAnchor="start"
            className="fill-gray-400 dark:fill-zinc-500"
            fontSize={10}
          >
            {yLabel}
          </text>
        )}

        {/* Y-axis ticks + grid lines */}
        {yTicks.map((tick, i) => {
          const y = 20 + (height - 20) - (tick / max) * (height - 20);
          return (
            <g key={`ytick-${i}`}>
              <text
                x={leftPadding - 8}
                y={y + 3}
                textAnchor="end"
                className="fill-gray-400 dark:fill-zinc-500"
                fontSize={10}
              >
                {formatValue(tick)}
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

        {/* Bars */}
        {data.map((d, i) => {
          const barH = Math.max(((d.value / max) * (height - 20)), 2);
          const x = leftPadding + i * (barWidth + gap);
          const y = height - barH;
          return (
            <g key={i}>
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={barH}
                rx={3}
                fill={color}
                opacity={0.85}
              >
                <title>{`${d.label}: ${formatValue(d.value)}`}</title>
              </rect>
            </g>
          );
        })}

        {/* X-axis date/label ticks */}
        {data.map((d, i) => {
          if (isDateData && data.length > 15) {
            // Show only every Nth label for date data
            if (i % xLabelInterval !== 0 && i !== data.length - 1) return null;
          } else if (data.length > 15) {
            return null;
          }
          const x = leftPadding + i * (barWidth + gap) + barWidth / 2;
          const displayLabel = isDateData ? formatDateLabel(d.label) : d.label;
          return (
            <text
              key={`xlabel-${i}`}
              x={x}
              y={height + 16}
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
