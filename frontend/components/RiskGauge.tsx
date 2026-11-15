"use client";

import React from "react";

interface RiskGaugeProps {
  probability: number; // 0.0 to 1.0 (typical range 0.28 to 0.73)
  level: "Low" | "Moderate" | "High";
  isUpdating?: boolean;
}

export default function RiskGauge({
  probability,
  level,
  isUpdating = false,
}: RiskGaugeProps) {
  const percent = Math.round(probability * 100);
  const radius = 64;
  const strokeWidth = 3;
  const circumference = 2 * Math.PI * radius;

  // We map the active model range [0.25, 0.75] onto the circular arc or use direct percent
  const clampedProb = Math.min(Math.max(probability, 0.0), 1.0);
  const strokeDashoffset = circumference - clampedProb * circumference;

  const colorConfig = {
    Low: {
      stroke: "#10b981", // emerald-500
      glow: "rgba(16, 185, 129, 0.35)",
      bgBadge: "bg-emerald-950/60 border-emerald-500/40 text-emerald-300",
      triangleStroke: "#34d399",
    },
    Moderate: {
      stroke: "#f59e0b", // amber-500
      glow: "rgba(245, 158, 11, 0.35)",
      bgBadge: "bg-amber-950/60 border-amber-500/40 text-amber-300",
      triangleStroke: "#fbbf24",
    },
    High: {
      stroke: "#f43f5e", // rose-500
      glow: "rgba(244, 63, 94, 0.35)",
      bgBadge: "bg-rose-950/60 border-rose-500/40 text-rose-300",
      triangleStroke: "#fb7185",
    },
  }[level];

  return (
    <div className="relative flex flex-col items-center justify-center p-4 sm:p-6 bg-slate-900/80 rounded-2xl border border-slate-800 shadow-xl backdrop-blur-md">
      {/* Updating indicator */}
      <div className="absolute top-3 right-3 h-4 flex items-center">
        {isUpdating && (
          <span className="text-[10px] font-mono text-blue-400 animate-pulse tracking-wide uppercase">
            updating...
          </span>
        )}
      </div>

      <div className="relative w-44 h-44 flex items-center justify-center">
        {/* SVG Circular Track and Progress */}
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
          {/* Subtle background track */}
          <circle
            cx="80"
            cy="80"
            r={radius}
            fill="transparent"
            stroke="#1e293b"
            strokeWidth={strokeWidth}
          />
          {/* Active progress arc */}
          <circle
            cx="80"
            cy="80"
            r={radius}
            fill="transparent"
            stroke={colorConfig.stroke}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-700 ease-out"
            style={{
              filter: `drop-shadow(0 0 8px ${colorConfig.glow})`,
            }}
          />
        </svg>

        {/* Center rotating triangle motif & probability */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          {/* Rotating Triangle Motif */}
          <div className="relative w-12 h-12 flex items-center justify-center mb-1">
            <svg
              className="w-10 h-10 animate-[spin_12s_linear_infinite]"
              viewBox="0 0 24 24"
              fill="none"
              stroke={colorConfig.triangleStroke}
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                filter: `drop-shadow(0 0 6px ${colorConfig.glow})`,
              }}
            >
              <polygon points="12 2 22 20 2 20" />
            </svg>
            <div className="absolute w-2 h-2 rounded-full bg-blue-400/80 shadow-[0_0_8px_#60a5fa]"></div>
          </div>

          <div className="text-3xl font-black font-mono tracking-tight text-white">
            {percent}%
          </div>
          <div className="text-[11px] font-mono text-slate-400">
            {probability.toFixed(4)}
          </div>
        </div>
      </div>

      {/* Level Badge and Scale */}
      <div className="mt-3 flex flex-col items-center space-y-1">
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase border ${colorConfig.bgBadge}`}
        >
          {level} Flood Risk
        </span>
        <span className="text-[11px] text-slate-500 font-mono">
          Thresholds: Low &lt;47% | Mod 47-54% | High &gt;54%
        </span>
      </div>
    </div>
  );
}

