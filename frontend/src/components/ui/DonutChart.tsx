"use client";

import { useMemo, useState } from "react";

interface DonutSlice {
  id: string;
  label: string;
  value: number;
  color: string;
  onClick?: () => void;
}

export function DonutChart({
  slices,
  totalLabel,
  totalValue,
  size = 300,
  strokeWidth = 40
}: {
  slices: DonutSlice[];
  totalLabel: string;
  totalValue: string;
  size?: number;
  strokeWidth?: number;
}) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const data = useMemo(() => {
    const total = slices.reduce((acc, slice) => acc + slice.value, 0);
    if (total === 0) return [];

    let currentAngle = -90; // Start at top
    return slices.map(slice => {
      const percentage = slice.value / total;
      const angle = percentage * 360;
      
      const sliceData = {
        ...slice,
        startAngle: currentAngle,
        endAngle: currentAngle + angle,
        percentage: percentage * 100
      };
      
      currentAngle += angle;
      return sliceData;
    });
  }, [slices]);

  const radius = (size - strokeWidth) / 2;
  const center = size / 2;
  
  // Calculate SVG arc paths
  const getCoordinatesForPercent = (percent: number) => {
    const x = Math.cos(2 * Math.PI * percent);
    const y = Math.sin(2 * Math.PI * percent);
    return [x, y];
  };

  let cumulativePercent = 0;

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        {data.length === 0 ? (
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
             <circle cx={center} cy={center} r={radius} fill="transparent" stroke="#1e293b" strokeWidth={strokeWidth} />
          </svg>
        ) : (
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
            {data.map((slice) => {
              const startPercent = cumulativePercent;
              const slicePercent = slice.percentage / 100;
              cumulativePercent += slicePercent;
              const endPercent = cumulativePercent;

              const [startX, startY] = getCoordinatesForPercent(startPercent);
              const [endX, endY] = getCoordinatesForPercent(endPercent);

              const largeArcFlag = slicePercent > 0.5 ? 1 : 0;

              // Path data for the arc
              const pathData = [
                `M ${center + startX * radius} ${center + startY * radius}`,
                `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${center + endX * radius} ${center + endY * radius}`
              ].join(" ");

              const isHovered = hoveredId === slice.id;

              return (
                <path
                  key={slice.id}
                  d={pathData}
                  fill="none"
                  stroke={slice.color}
                  strokeWidth={isHovered ? strokeWidth + 4 : strokeWidth}
                  className="transition-all duration-300 cursor-pointer origin-center"
                  onMouseEnter={() => setHoveredId(slice.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  onClick={slice.onClick}
                />
              );
            })}
          </svg>
        )}
        
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          {hoveredId ? (() => {
            const hoveredSlice = data.find(s => s.id === hoveredId);
            if (!hoveredSlice) return null;
            return (
              <>
                <span className="text-xs text-slate-400 font-bold uppercase tracking-widest">{hoveredSlice.label}</span>
                <span className="text-xl font-bold text-white mt-1" style={{ color: hoveredSlice.color }}>{hoveredSlice.percentage.toFixed(1)}%</span>
              </>
            );
          })() : (
            <>
              <span className="text-xs text-slate-400 font-bold uppercase tracking-widest">{totalLabel}</span>
              <span className="text-xl font-bold text-white mt-1">{totalValue}</span>
            </>
          )}
        </div>
      </div>
      
      {/* Legend */}
      <div className="mt-8 flex flex-wrap justify-center gap-4">
        {data.map(slice => (
          <button
            key={slice.id}
            onClick={slice.onClick}
            onMouseEnter={() => setHoveredId(slice.id)}
            onMouseLeave={() => setHoveredId(null)}
            className={`flex items-center gap-2 text-xs transition-opacity ${hoveredId && hoveredId !== slice.id ? 'opacity-40' : 'opacity-100 hover:opacity-80'}`}
          >
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: slice.color }} />
            <span className="text-slate-300">{slice.label}</span>
            <span className="font-bold text-white">{slice.percentage.toFixed(1)}%</span>
          </button>
        ))}
      </div>
    </div>
  );
}
