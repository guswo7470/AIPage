"use client";

interface PieChartProps {
  data: { label: string; value: number; color: string }[];
  size?: number;
}

export function SimplePieChart({ data, size = 180 }: PieChartProps) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  if (!total) return null;

  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 10;
  const innerR = r * 0.55;

  let startAngle = -90;

  const paths = data.map((d) => {
    const angle = (d.value / total) * 360;
    const endAngle = startAngle + angle;
    const largeArc = angle > 180 ? 1 : 0;

    const x1 = cx + r * Math.cos((startAngle * Math.PI) / 180);
    const y1 = cy + r * Math.sin((startAngle * Math.PI) / 180);
    const x2 = cx + r * Math.cos((endAngle * Math.PI) / 180);
    const y2 = cy + r * Math.sin((endAngle * Math.PI) / 180);
    const ix1 = cx + innerR * Math.cos((endAngle * Math.PI) / 180);
    const iy1 = cy + innerR * Math.sin((endAngle * Math.PI) / 180);
    const ix2 = cx + innerR * Math.cos((startAngle * Math.PI) / 180);
    const iy2 = cy + innerR * Math.sin((startAngle * Math.PI) / 180);

    const path = `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} L ${ix1} ${iy1} A ${innerR} ${innerR} 0 ${largeArc} 0 ${ix2} ${iy2} Z`;

    startAngle = endAngle;
    return { ...d, path, pct: Math.round((d.value / total) * 100) };
  });

  return (
    <div className="flex items-center gap-6">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {paths.map((p, i) => (
          <path key={i} d={p.path} fill={p.color}>
            <title>{`${p.label}: ${p.value} (${p.pct}%)`}</title>
          </path>
        ))}
      </svg>
      <div className="space-y-2">
        {paths.map((p, i) => (
          <div key={i} className="flex items-center gap-2 text-sm">
            <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: p.color }} />
            <span className="text-gray-600 dark:text-zinc-400">{p.label}</span>
            <span className="font-semibold text-gray-900 dark:text-white">{p.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
