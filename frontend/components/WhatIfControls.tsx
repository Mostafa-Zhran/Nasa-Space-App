"use client";

import React from "react";
import { RotateCcw } from "lucide-react";
import { GROUP_LABELS, GroupKey } from "@/lib/predictRisk";

interface WhatIfControlsProps {
  groupValues: Record<GroupKey, number>;
  onChangeGroup: (group: GroupKey, value: number) => void;
  onReset: () => void;
  isUpdating?: boolean;
}

const GROUP_SUBTITLES: Record<GroupKey, string> = {
  climate_rain: "Monsoon, climate anomalies, topography drainage, landslides (4 factors)",
  water_management: "River management, dams, drainage systems, siltation, watersheds (5 factors)",
  land_people: "Deforestation, urbanization, agriculture, encroachments, wetlands, pop, coastal (7 factors)",
  preparedness_planning: "Disaster readiness, planning, deteriorating infrastructure, political (4 factors)",
};

export default function WhatIfControls({
  groupValues,
  onChangeGroup,
  onReset,
  isUpdating = false,
}: WhatIfControlsProps) {
  const groups: GroupKey[] = [
    "climate_rain",
    "water_management",
    "land_people",
    "preparedness_planning",
  ];

  return (
    <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-6 shadow-xl backdrop-blur-md">
      <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">
            What-If Scenario Simulation
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Adjustable assumptions, not measured values
          </p>
        </div>

        <button
          onClick={onReset}
          className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-mono text-slate-400 hover:text-white border border-slate-700/80 hover:border-slate-500 rounded-lg transition"
          title="Reset all assumptions to neutral score (5.0)"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>
      </div>

      <div className="space-y-4">
        {groups.map((groupKey) => {
          const value = groupValues[groupKey];
          return (
            <div
              key={groupKey}
              className="p-3 bg-slate-950/50 rounded-xl border border-slate-800/80 hover:border-slate-700 transition"
            >
              <div className="flex justify-between items-center mb-1">
                <div>
                  <span className="text-xs font-semibold text-slate-200">
                    {GROUP_LABELS[groupKey]}
                  </span>
                  <div className="text-[10px] text-slate-500 truncate max-w-[280px] sm:max-w-md">
                    {GROUP_SUBTITLES[groupKey]}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 bg-slate-800 border border-slate-700 rounded text-blue-400">
                    {value.toFixed(1)}
                  </span>
                </div>
              </div>

              {/* Thin interactive slider */}
              <div className="mt-2 flex items-center space-x-3">
                <span className="text-[10px] font-mono text-slate-600">0</span>
                <input
                  type="range"
                  min="0"
                  max="10"
                  step="0.5"
                  value={value}
                  onChange={(e) =>
                    onChangeGroup(groupKey, parseFloat(e.target.value))
                  }
                  className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500 focus:outline-none"
                />
                <span className="text-[10px] font-mono text-slate-600">10</span>
              </div>
            </div>
          );
        })}
      </div>

      {isUpdating && (
        <div className="mt-3 text-right">
          <span className="text-[11px] font-mono text-blue-400 animate-pulse">
            ● Evaluating model gradients...
          </span>
        </div>
      )}
    </div>
  );
}
