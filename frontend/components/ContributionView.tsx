"use client";

import React from "react";
import { GROUP_LABELS, GroupKey } from "@/lib/predictRisk";

interface ContributionViewProps {
  contributions: Record<GroupKey, number>; // Delta relative to neutral 5.0 in probability points (e.g. +0.04 or -0.02)
}

export default function ContributionView({
  contributions,
}: ContributionViewProps) {
  const groups: GroupKey[] = [
    "climate_rain",
    "water_management",
    "land_people",
    "preparedness_planning",
  ];

  // Maximum scale for normalized visual bar (typically +/- 0.15 probability delta)
  const maxDelta = 0.12;

  return (
    <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-6 shadow-xl backdrop-blur-md">
      <div className="mb-4 border-b border-slate-800 pb-3">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">
          Factor Group Contribution
        </h3>
        <p className="text-xs text-slate-400 mt-0.5">
          Marginal impact compared to neutral baseline (Score 5.0)
        </p>
      </div>

      <div className="space-y-3.5">
        {groups.map((groupKey) => {
          const delta = contributions[groupKey] || 0;
          const deltaPercent = (delta * 100).toFixed(2);
          const isPositive = delta > 0.0005;
          const isNegative = delta < -0.0005;

          // Normalized width [0 to 100%]
          const barWidth = Math.min(Math.abs(delta) / maxDelta, 1.0) * 100;

          return (
            <div key={groupKey} className="text-xs">
              <div className="flex justify-between items-center mb-1">
                <span className="text-slate-300 font-medium">
                  {GROUP_LABELS[groupKey]}
                </span>
                <span
                  className={`font-mono font-bold ${
                    isPositive
                      ? "text-rose-400"
                      : isNegative
                      ? "text-emerald-400"
                      : "text-slate-400"
                  }`}
                >
                  {isPositive ? `+${deltaPercent}%` : `${deltaPercent}%`}
                </span>
              </div>

              {/* Thin outlined divergence bar */}
              <div className="relative w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800 flex items-center">
                {/* Center marker */}
                <div className="absolute left-1/2 top-0 bottom-0 w-px bg-slate-700 z-10"></div>

                {isNegative && (
                  <div
                    className="absolute right-1/2 top-0 bottom-0 bg-emerald-500 rounded-l transition-all duration-500"
                    style={{ width: `${barWidth / 2}%` }}
                  ></div>
                )}

                {isPositive && (
                  <div
                    className="absolute left-1/2 top-0 bottom-0 bg-rose-500 rounded-r transition-all duration-500"
                    style={{ width: `${barWidth / 2}%` }}
                  ></div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 pt-3 border-t border-slate-800/80 flex justify-between text-[10px] text-slate-500 font-mono">
        <span>← Mitigating Impact (-Risk)</span>
        <span>Baseline (0)</span>
        <span>Aggravating Impact (+Risk) →</span>
      </div>
    </div>
  );
}

