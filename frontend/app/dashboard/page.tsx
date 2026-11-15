"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  FEATURES,
  descriptiveStats,
  featureCorrelation,
  permutationImportance,
  modelComparison,
  ridgeResidual,
  targetDistribution,
  lgbmTuning,
  worstPredictions,
} from "@/lib/dashboardData";

// ─── Plotly loaded lazily (client-only) ──────────────────────────────────────
type PlotlyType = typeof import("plotly.js-dist-min");
let Plotly: PlotlyType | null = null;

// Dark theme token palette
const C = {
  bg:        "#060911",
  panel:     "#0d1117",
  border:    "#1e2d3d",
  blue:      "#3b82f6",
  cyan:      "#22d3ee",
  indigo:    "#818cf8",
  emerald:   "#10b981",
  amber:     "#f59e0b",
  rose:      "#f43f5e",
  slate3:    "#94a3b8",
  slate5:    "#64748b",
  slate7:    "#334155",
  white:     "#f1f5f9",
  gridLine:  "rgba(51,65,85,0.5)",
};

const PLOTLY_LAYOUT_BASE = {
  paper_bgcolor: C.panel,
  plot_bgcolor:  C.panel,
  font: { color: C.slate3, family: "ui-monospace, monospace", size: 11 },
  margin: { t: 36, r: 20, b: 50, l: 60 },
  xaxis: { gridcolor: C.gridLine, zerolinecolor: C.gridLine, tickfont: { color: C.slate5, size: 10 } },
  yaxis: { gridcolor: C.gridLine, zerolinecolor: C.gridLine, tickfont: { color: C.slate5, size: 10 } },
  legend: { bgcolor: "rgba(0,0,0,0)", bordercolor: C.border, font: { color: C.slate3, size: 10 } },
};

// ─── Reusable chart container ─────────────────────────────────────────────────
function ChartBox({ title, subtitle, children, className = "" }: {
  title: string; subtitle?: string; children: React.ReactNode; className?: string;
}) {
  return (
    <div className={`bg-[#0d1117] rounded-2xl border border-slate-800 p-5 shadow-xl flex flex-col ${className}`}>
      <div className="mb-3">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">{title}</h3>
        {subtitle && <p className="text-[11px] text-slate-500 mt-0.5 font-mono">{subtitle}</p>}
      </div>
      <div className="flex-1 min-h-0">{children}</div>
    </div>
  );
}

// ─── Plotly wrapper component ─────────────────────────────────────────────────
function PlotDiv({ data, layout, config }: {
  data: object[];
  layout: object;
  config?: object;
}) {
  const divRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!Plotly || !divRef.current) return;
    const el = divRef.current;
    Plotly.newPlot(el, data as never, layout as never, {
      displayModeBar: false,
      responsive: true,
      ...(config || {}),
    }).then(() => setReady(true));
    return () => {
      if (Plotly) Plotly.purge(el);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [Plotly]);

  return (
    <div className="relative w-full h-full min-h-[260px]">
      {!ready && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      <div ref={divRef} style={{ width: "100%", height: "100%" }} />
    </div>
  );
}

// ─── Stat card ───────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, color = "text-blue-400" }: {
  label: string; value: string; sub?: string; color?: string;
}) {
  return (
    <div className="bg-[#0d1117] border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
      <div className="text-[10px] font-mono uppercase tracking-widest text-slate-500">{label}</div>
      <div className={`text-2xl font-black font-mono mt-1 ${color}`}>{value}</div>
      {sub && <div className="text-[11px] text-slate-500 mt-0.5">{sub}</div>}
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function DashboardPage() {
  const [plotlyLoaded, setPlotlyLoaded] = useState(false);

  // Load Plotly on client
  useEffect(() => {
    import("plotly.js-dist-min").then((mod) => {
      Plotly = mod.default as unknown as PlotlyType;
      setPlotlyLoaded(true);
    });
  }, []);

  if (!plotlyLoaded) {
    return (
      <div className="min-h-screen bg-[#060911] flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-slate-400 font-mono text-xs tracking-widest uppercase">Loading Plotly Engine...</span>
      </div>
    );
  }

  // ── 1. Target Distribution ────────────────────────────────────────────────
  const targetDistData = [{
    type: "bar",
    x: targetDistribution.map((d) => d.value),
    y: targetDistribution.map((d) => d.count),
    marker: {
      color: targetDistribution.map((d) =>
        d.value < 0.47 ? C.emerald : d.value <= 0.54 ? C.amber : C.rose
      ),
      line: { color: "transparent", width: 0 },
    },
    hovertemplate: "P=%{x:.3f}<br>Count≈%{y:,}<extra></extra>",
  }];
  const targetDistLayout = {
    ...PLOTLY_LAYOUT_BASE,
    title: { text: "", font: { size: 11 } },
    xaxis: {
      ...PLOTLY_LAYOUT_BASE.xaxis,
      title: { text: "FloodProbability", font: { size: 10, color: C.slate5 } },
    },
    yaxis: {
      ...PLOTLY_LAYOUT_BASE.yaxis,
      title: { text: "Approx. Count", font: { size: 10, color: C.slate5 } },
    },
    shapes: [
      { type: "line", x0: 0.47, x1: 0.47, y0: 0, y1: 1, yref: "paper", line: { color: C.amber, dash: "dot", width: 1.5 } },
      { type: "line", x0: 0.54, x1: 0.54, y0: 0, y1: 1, yref: "paper", line: { color: C.rose,  dash: "dot", width: 1.5 } },
    ],
    annotations: [
      { x: 0.38, y: 0.95, xref: "x", yref: "paper", text: "Low", showarrow: false, font: { color: C.emerald, size: 10 } },
      { x: 0.505, y: 0.95, xref: "x", yref: "paper", text: "Mod", showarrow: false, font: { color: C.amber, size: 10 } },
      { x: 0.63, y: 0.95, xref: "x", yref: "paper", text: "High", showarrow: false, font: { color: C.rose, size: 10 } },
    ],
  };

  // ── 2. Feature → Target Correlation (horizontal bar) ─────────────────────
  const sortedCorr = [...featureCorrelation].sort((a, b) => a.correlation - b.correlation);
  const corrData = [{
    type: "bar",
    orientation: "h",
    x: sortedCorr.map((d) => d.correlation),
    y: sortedCorr.map((d) => d.feature),
    marker: {
      color: sortedCorr.map((d) => {
        const t = (d.correlation - 0.177) / (0.190 - 0.177);
        return `rgba(${Math.round(59 + t * (99 - 59))},${Math.round(130 - t * 30)},${Math.round(246 - t * 50)},0.9)`;
      }),
      line: { color: "transparent", width: 0 },
    },
    hovertemplate: "%{y}: r = %{x:.5f}<extra></extra>",
  }];
  const corrLayout = {
    ...PLOTLY_LAYOUT_BASE,
    margin: { t: 10, r: 20, b: 50, l: 200 },
    xaxis: {
      ...PLOTLY_LAYOUT_BASE.xaxis,
      title: { text: "Pearson r", font: { size: 10, color: C.slate5 } },
      range: [0.173, 0.193],
    },
    yaxis: { ...PLOTLY_LAYOUT_BASE.yaxis, tickfont: { color: C.slate3, size: 9 } },
  };

  // ── 3. Permutation Importance (EXP-10) ────────────────────────────────────
  const sortedPerm = [...permutationImportance].sort((a, b) => a.importance - b.importance);
  const permData = [{
    type: "bar",
    orientation: "h",
    x: sortedPerm.map((d) => d.importance),
    y: sortedPerm.map((d) => d.feature),
    error_x: {
      type: "data",
      array: sortedPerm.map((d) => d.std),
      visible: true,
      color: C.slate5,
      thickness: 1,
      width: 3,
    },
    marker: {
      color: sortedPerm.map((_, i) => {
        const t = i / (sortedPerm.length - 1);
        const r = Math.round(59 + t * 139);
        const g = Math.round(130 - t * 50);
        const b = Math.round(246 - t * 100);
        return `rgba(${r},${g},${b},0.88)`;
      }),
      line: { color: "transparent", width: 0 },
    },
    hovertemplate: "%{y}: %{x:.6f} ± %{error_x.array:.6f}<extra></extra>",
  }];
  const permLayout = {
    ...PLOTLY_LAYOUT_BASE,
    margin: { t: 10, r: 20, b: 50, l: 200 },
    xaxis: {
      ...PLOTLY_LAYOUT_BASE.xaxis,
      title: { text: "Permutation Importance (Δ RMSE)", font: { size: 10, color: C.slate5 } },
    },
    yaxis: { ...PLOTLY_LAYOUT_BASE.yaxis, tickfont: { color: C.slate3, size: 9 } },
  };

  // ── 4. Model R² Comparison (bar) ──────────────────────────────────────────
  const modelsSorted = [...modelComparison].sort((a, b) => b.r2 - a.r2);
  const r2Data = [{
    type: "bar",
    x: modelsSorted.map((m) => m.exp),
    y: modelsSorted.map((m) => m.r2),
    marker: {
      color: modelsSorted.map((m) =>
        m.winner ? C.emerald : m.r2 > 0.84 ? C.blue : m.r2 > 0.5 ? C.amber : C.rose
      ),
      line: { color: "transparent", width: 0 },
    },
    text: modelsSorted.map((m) => m.r2.toFixed(4)),
    textposition: "outside",
    textfont: { color: C.slate3, size: 9 },
    hovertemplate: "<b>%{x}</b><br>Val R² = %{y:.4f}<extra></extra>",
  }];
  const r2Layout = {
    ...PLOTLY_LAYOUT_BASE,
    margin: { t: 36, r: 20, b: 60, l: 60 },
    yaxis: {
      ...PLOTLY_LAYOUT_BASE.yaxis,
      title: { text: "Validation R²", font: { size: 10, color: C.slate5 } },
      range: [0, 1.0],
    },
    xaxis: { ...PLOTLY_LAYOUT_BASE.xaxis, tickangle: -30 },
    shapes: [
      { type: "line", x0: -0.5, x1: 11.5, y0: 0.8685, y1: 0.8685, line: { color: C.emerald, dash: "dot", width: 1.5 } },
    ],
    annotations: [
      { x: 10.5, y: 0.875, xref: "x", yref: "y", text: "EXP-10 Best", showarrow: false, font: { color: C.emerald, size: 9 } },
    ],
  };

  // ── 5. Model RMSE Comparison ──────────────────────────────────────────────
  const rmseData = [{
    type: "bar",
    x: modelsSorted.map((m) => m.exp),
    y: modelsSorted.map((m) => m.rmse),
    marker: {
      color: modelsSorted.map((m) =>
        m.winner ? C.emerald : m.rmse < 0.020 ? C.blue : m.rmse < 0.025 ? C.amber : C.rose
      ),
      line: { color: "transparent", width: 0 },
    },
    hovertemplate: "<b>%{x}</b><br>Val RMSE = %{y:.5f}<extra></extra>",
  }];
  const rmseLayout = {
    ...PLOTLY_LAYOUT_BASE,
    margin: { t: 36, r: 20, b: 60, l: 60 },
    yaxis: {
      ...PLOTLY_LAYOUT_BASE.yaxis,
      title: { text: "Validation RMSE", font: { size: 10, color: C.slate5 } },
    },
    xaxis: { ...PLOTLY_LAYOUT_BASE.xaxis, tickangle: -30 },
  };

  // ── 6. Train Time vs R² scatter ───────────────────────────────────────────
  const scatterData = [{
    type: "scatter",
    mode: "markers+text",
    x: modelComparison.map((m) => m.trainTime),
    y: modelComparison.map((m) => m.r2),
    text: modelComparison.map((m) => m.exp),
    textposition: "top center",
    textfont: { size: 9, color: C.slate3 },
    marker: {
      size: modelComparison.map((m) => (m.winner ? 18 : 10)),
      color: modelComparison.map((m) =>
        m.winner ? C.emerald : m.r2 > 0.84 ? C.blue : m.r2 > 0.5 ? C.amber : C.rose
      ),
      line: { color: C.border, width: 1 },
      symbol: modelComparison.map((m) => (m.winner ? "star" : "circle")),
    },
    hovertemplate: "<b>%{text}</b><br>Train Time: %{x:.1f}s<br>R² = %{y:.4f}<extra></extra>",
  }];
  const scatterLayout = {
    ...PLOTLY_LAYOUT_BASE,
    xaxis: {
      ...PLOTLY_LAYOUT_BASE.xaxis,
      title: { text: "Training Time (seconds)", font: { size: 10, color: C.slate5 } },
      type: "log" as const,
    },
    yaxis: {
      ...PLOTLY_LAYOUT_BASE.yaxis,
      title: { text: "Validation R²", font: { size: 10, color: C.slate5 } },
    },
  };

  // ── 7. Feature Statistics box-like (mean ± std) ───────────────────────────
  const featureStatsData = [
    {
      type: "bar",
      name: "Mean",
      x: FEATURES,
      y: FEATURES.map((f) => descriptiveStats[f].mean),
      marker: { color: `${C.blue}cc`, line: { color: "transparent", width: 0 } },
      hovertemplate: "%{x}<br>Mean = %{y:.3f}<extra></extra>",
    },
    {
      type: "bar",
      name: "Std Dev",
      x: FEATURES,
      y: FEATURES.map((f) => descriptiveStats[f].std),
      marker: { color: `${C.indigo}99`, line: { color: "transparent", width: 0 } },
      hovertemplate: "%{x}<br>Std = %{y:.3f}<extra></extra>",
    },
  ];
  const featureStatsLayout = {
    ...PLOTLY_LAYOUT_BASE,
    barmode: "group",
    xaxis: { ...PLOTLY_LAYOUT_BASE.xaxis, tickangle: -40, tickfont: { color: C.slate5, size: 8 } },
    yaxis: {
      ...PLOTLY_LAYOUT_BASE.yaxis,
      title: { text: "Score Value", font: { size: 10, color: C.slate5 } },
    },
  };

  // ── 8. Feature Max Values ─────────────────────────────────────────────────
  const maxValData = [{
    type: "bar",
    x: FEATURES,
    y: FEATURES.map((f) => descriptiveStats[f].max),
    marker: {
      color: FEATURES.map((f) => {
        const v = descriptiveStats[f].max;
        return v >= 18 ? C.rose : v >= 16 ? C.amber : C.cyan;
      }),
      line: { color: "transparent", width: 0 },
    },
    hovertemplate: "%{x}<br>Max = %{y}<extra></extra>",
  }];
  const maxValLayout = {
    ...PLOTLY_LAYOUT_BASE,
    xaxis: { ...PLOTLY_LAYOUT_BASE.xaxis, tickangle: -40, tickfont: { color: C.slate5, size: 8 } },
    yaxis: {
      ...PLOTLY_LAYOUT_BASE.yaxis,
      title: { text: "Max Score", font: { size: 10, color: C.slate5 } },
    },
    shapes: [
      { type: "line", x0: -0.5, x1: 19.5, y0: 16, y1: 16, line: { color: C.amber, dash: "dot", width: 1 } },
    ],
  };

  // ── 9. Ridge Residual vs Feature Sum ─────────────────────────────────────
  const residualData = [
    {
      type: "scatter",
      mode: "lines",
      name: "Mean Residual",
      x: ridgeResidual.map((d) => d.sum),
      y: ridgeResidual.map((d) => d.mean),
      line: { color: C.amber, width: 2 },
      hovertemplate: "Sum=%{x}<br>Residual=%{y:.5f}<extra></extra>",
    },
    {
      type: "bar",
      name: "Count (÷1000)",
      x: ridgeResidual.map((d) => d.sum),
      y: ridgeResidual.map((d) => d.count / 1000),
      marker: { color: `${C.blue}44`, line: { color: "transparent", width: 0 } },
      yaxis: "y2",
      hovertemplate: "Sum=%{x}<br>Count=%{y:.1f}k<extra></extra>",
    },
  ];
  const residualLayout = {
    ...PLOTLY_LAYOUT_BASE,
    xaxis: {
      ...PLOTLY_LAYOUT_BASE.xaxis,
      title: { text: "Feature Sum (Σ of 20 scores)", font: { size: 10, color: C.slate5 } },
    },
    yaxis: {
      ...PLOTLY_LAYOUT_BASE.yaxis,
      title: { text: "Mean Residual", font: { size: 10, color: C.slate5 } },
    },
    yaxis2: {
      gridcolor: "transparent",
      tickfont: { color: C.slate5, size: 9 },
      title: { text: "Count (k)", font: { size: 10, color: C.slate5 } },
      overlaying: "y",
      side: "right",
    },
    shapes: [
      { type: "line", x0: 72, x1: 118, y0: 0, y1: 0, line: { color: C.slate5, dash: "dot", width: 1 } },
    ],
    legend: { x: 0.02, y: 0.98 },
  };

  // ── 10. LGBM Tuning: parallel coords ─────────────────────────────────────
  const parallelData = [{
    type: "parcoords",
    line: {
      color: lgbmTuning.map((d) => d.cv_rmse),
      colorscale: [[0, C.emerald], [0.5, C.blue], [1, C.rose]],
      reversescale: true,
      showscale: true,
      colorbar: { thickness: 8, len: 0.6, tickfont: { size: 9, color: C.slate3 }, title: { text: "CV RMSE", font: { size: 10, color: C.slate3 } } },
    },
    dimensions: [
      { label: "num_leaves", values: lgbmTuning.map((d) => d.num_leaves), range: [0, 140] },
      { label: "n_estimators", values: lgbmTuning.map((d) => d.n_estimators), range: [0, 1300] },
      { label: "lr ×100", values: lgbmTuning.map((d) => d.lr * 100), range: [0, 10] },
      { label: "subsample", values: lgbmTuning.map((d) => d.subsample), range: [0.6, 1.0] },
      { label: "λ (reg)", values: lgbmTuning.map((d) => d.reg_lambda), range: [0, 11] },
      { label: "CV RMSE", values: lgbmTuning.map((d) => d.cv_rmse), range: [0.0205, 0.0210] },
    ],
  }];
  const parallelLayout = { ...PLOTLY_LAYOUT_BASE, margin: { t: 60, r: 60, b: 20, l: 60 } };

  // ── 11. Worst Predictions scatter ─────────────────────────────────────────
  const worstData = [
    {
      type: "scatter",
      mode: "markers+lines",
      name: "Actual",
      x: worstPredictions.map((_, i) => i + 1),
      y: worstPredictions.map((d) => d.actual),
      marker: { color: C.emerald, size: 10, symbol: "diamond" },
      line: { color: `${C.emerald}66`, dash: "dot", width: 1 },
      hovertemplate: "Sample %{x}<br>Actual: %{y:.3f}<extra></extra>",
    },
    {
      type: "scatter",
      mode: "markers+lines",
      name: "Predicted",
      x: worstPredictions.map((_, i) => i + 1),
      y: worstPredictions.map((d) => d.pred),
      marker: { color: C.rose, size: 10, symbol: "circle" },
      line: { color: `${C.rose}66`, dash: "dot", width: 1 },
      hovertemplate: "Sample %{x}<br>Predicted: %{y:.3f}<extra></extra>",
    },
  ];
  const worstLayout = {
    ...PLOTLY_LAYOUT_BASE,
    xaxis: {
      ...PLOTLY_LAYOUT_BASE.xaxis,
      title: { text: "Sample Rank (worst → best error)", font: { size: 10, color: C.slate5 } },
    },
    yaxis: {
      ...PLOTLY_LAYOUT_BASE.yaxis,
      title: { text: "FloodProbability", font: { size: 10, color: C.slate5 } },
    },
    legend: { x: 0.5, y: 1.05, orientation: "h" },
  };

  // ── 12. Correlation radar (polar) ─────────────────────────────────────────
  const radarFeatures = featureCorrelation.map((f) => f.feature);
  const radarVals = featureCorrelation.map((f) => f.correlation);
  const radarData = [{
    type: "scatterpolar",
    r: [...radarVals, radarVals[0]],
    theta: [...radarFeatures, radarFeatures[0]],
    fill: "toself",
    fillcolor: `${C.blue}22`,
    line: { color: C.blue, width: 2 },
    name: "Pearson r",
    hovertemplate: "%{theta}<br>r = %{r:.5f}<extra></extra>",
  }];
  const radarLayout = {
    paper_bgcolor: C.panel,
    plot_bgcolor: C.panel,
    font: { color: C.slate3, family: "ui-monospace, monospace", size: 9 },
    margin: { t: 20, r: 20, b: 20, l: 20 },
    polar: {
      bgcolor: C.panel,
      radialaxis: {
        visible: true,
        range: [0.173, 0.192],
        tickfont: { size: 8, color: C.slate5 },
        gridcolor: C.gridLine,
      },
      angularaxis: { tickfont: { size: 8, color: C.slate3 }, gridcolor: C.gridLine, linecolor: C.border },
    },
  };

  // ── 13. CV R² evolution across experiments ────────────────────────────────
  const expOrder = ["EXP-01","EXP-02","EXP-03","EXP-04","EXP-05","EXP-06A","EXP-06B","EXP-07","EXP-08","EXP-09","EXP-10","EXP-11"];
  const expMap = Object.fromEntries(modelComparison.map((m) => [m.exp, m]));
  const evolutionData = [
    {
      type: "scatter",
      mode: "lines+markers",
      name: "Val R²",
      x: expOrder,
      y: expOrder.map((e) => expMap[e]?.r2 ?? null),
      line: { color: C.blue, width: 2.5 },
      marker: { size: 8, color: expOrder.map((e) => (expMap[e]?.winner ? C.emerald : C.blue)), symbol: expOrder.map((e) => (expMap[e]?.winner ? "star" : "circle")) },
      hovertemplate: "<b>%{x}</b><br>R² = %{y:.4f}<extra></extra>",
    },
    {
      type: "scatter",
      mode: "lines+markers",
      name: "Val RMSE ×10",
      x: expOrder,
      y: expOrder.map((e) => (expMap[e]?.rmse ?? 0) * 10),
      line: { color: C.rose, width: 2, dash: "dot" },
      marker: { size: 6, color: C.rose },
      hovertemplate: "<b>%{x}</b><br>RMSE×10 = %{y:.5f}<extra></extra>",
    },
  ];
  const evolutionLayout = {
    ...PLOTLY_LAYOUT_BASE,
    xaxis: { ...PLOTLY_LAYOUT_BASE.xaxis, tickangle: -30 },
    yaxis: {
      ...PLOTLY_LAYOUT_BASE.yaxis,
      title: { text: "Metric Value", font: { size: 10, color: C.slate5 } },
    },
    legend: { x: 0.02, y: 0.05 },
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#060911] text-slate-100" style={{ fontFamily: "ui-monospace, monospace" }}>

      {/* ── Top Nav ── */}
      <nav className="sticky top-0 z-50 bg-[#060911]/95 backdrop-blur-md border-b border-slate-800 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <svg className="w-5 h-5 animate-[spin_20s_linear_infinite]" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="1.8">
            <polygon points="12 2 22 20 2 20" />
          </svg>
          <span className="text-sm font-bold tracking-widest text-white">TRIANGULUM</span>
          <span className="text-slate-600">/</span>
          <span className="text-xs text-blue-400 font-mono">Training Dashboard</span>
        </div>
        <Link href="/" className="text-xs font-mono text-slate-400 hover:text-blue-400 transition flex items-center space-x-1.5">
          <span>← Back to App</span>
        </Link>
      </nav>

      <main className="relative z-10 max-w-screen-2xl mx-auto px-4 md:px-8 pb-20 pt-8 space-y-10">

        {/* ── Page Header ── */}
        <div className="border-b border-slate-800 pb-6">
          <span className="text-[10px] font-mono uppercase tracking-widest text-blue-400">
            00 // TRAINING DATA ANALYTICS
          </span>
          <h1 className="text-3xl font-black text-white mt-1">Model Training Dashboard</h1>
          <p className="text-sm text-slate-400 mt-2 max-w-3xl">
            Full analytical view of the TRIANGULUM LightGBM flood risk model — dataset statistics,
            feature analysis, experiment results, and error diagnostics.
            Dataset: <span className="text-slate-200">1,117,957 samples · 20 features · 11 experiments</span>.
          </p>
        </div>

        {/* ── KPI Row ── */}
        <section>
          <div className="text-[10px] font-mono uppercase tracking-widest text-blue-400 mb-3">
            01 // DATASET OVERVIEW
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            <StatCard label="Total Samples"    value="1.12M"   sub="1,117,957 rows"           color="text-blue-400" />
            <StatCard label="Features"         value="20"      sub="int64, score 0–19"         color="text-cyan-400" />
            <StatCard label="Missing Values"   value="0"       sub="Complete dataset"           color="text-emerald-400" />
            <StatCard label="Target Range"     value="0.44"    sub="0.285 → 0.725"             color="text-amber-400" />
            <StatCard label="Best R²"          value="0.8685"  sub="EXP-10 LightGBM+Sum"       color="text-emerald-400" />
            <StatCard label="Best RMSE"        value="0.0185"  sub="EXP-10 Validation"         color="text-indigo-400" />
            <StatCard label="Experiments"      value="11"      sub="EXP-01 → EXP-11"           color="text-rose-400" />
          </div>
        </section>

        {/* ── Target Distribution + Radar ── */}
        <section>
          <div className="text-[10px] font-mono uppercase tracking-widest text-blue-400 mb-3">
            02 // TARGET DISTRIBUTION &amp; FEATURE CORRELATIONS
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <ChartBox title="FloodProbability Distribution"
              subtitle="Approx. histogram · 83 unique values · range 0.285–0.725"
              className="lg:col-span-2 h-[340px]"
            >
              <PlotDiv data={targetDistData} layout={targetDistLayout} />
            </ChartBox>

            <ChartBox title="Feature Correlation Radar"
              subtitle="Pearson r to FloodProbability — all features tightly clustered"
              className="h-[340px]"
            >
              <PlotDiv data={radarData} layout={radarLayout} />
            </ChartBox>
          </div>
        </section>

        {/* ── Feature Stats ── */}
        <section>
          <div className="text-[10px] font-mono uppercase tracking-widest text-blue-400 mb-3">
            03 // FEATURE DESCRIPTIVE STATISTICS
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <ChartBox title="Mean ± Std per Feature"
              subtitle="All features tightly centered around 5.0 (dataset design)"
              className="h-[320px]"
            >
              <PlotDiv data={featureStatsData} layout={featureStatsLayout} />
            </ChartBox>

            <ChartBox title="Maximum Observed Score per Feature"
              subtitle="Scores are integers 0–19; most max out between 16–19"
              className="h-[320px]"
            >
              <PlotDiv data={maxValData} layout={maxValLayout} />
            </ChartBox>
          </div>
        </section>

        {/* ── Correlation + Importance ── */}
        <section>
          <div className="text-[10px] font-mono uppercase tracking-widest text-blue-400 mb-3">
            04 // FEATURE IMPORTANCE ANALYSIS
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <ChartBox title="Pearson Correlation to Target"
              subtitle="Sorted ascending · range 0.177–0.190 — features are roughly equi-important"
              className="h-[480px]"
            >
              <PlotDiv data={corrData} layout={corrLayout} />
            </ChartBox>

            <ChartBox title="Permutation Importance (EXP-10)"
              subtitle="Δ RMSE when each feature is shuffled · error bars = std across folds"
              className="h-[480px]"
            >
              <PlotDiv data={permData} layout={permLayout} />
            </ChartBox>
          </div>
        </section>

        {/* ── Model Comparison ── */}
        <section>
          <div className="text-[10px] font-mono uppercase tracking-widest text-blue-400 mb-3">
            05 // EXPERIMENT COMPARISON (12 MODELS)
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <ChartBox title="Validation R² by Experiment"
              subtitle="Green = winner (EXP-10). Dashed line marks R² = 0.8685"
              className="h-[360px]"
            >
              <PlotDiv data={r2Data} layout={r2Layout} />
            </ChartBox>

            <ChartBox title="Validation RMSE by Experiment"
              subtitle="Lower is better · EXP-10 achieves 0.01849"
              className="h-[360px]"
            >
              <PlotDiv data={rmseData} layout={rmseLayout} />
            </ChartBox>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
            <ChartBox title="R² vs Training Time (log scale)"
              subtitle="★ = winner · bubble size proportional to model complexity"
              className="h-[360px]"
            >
              <PlotDiv data={scatterData} layout={scatterLayout} />
            </ChartBox>

            <ChartBox title="Experiment Performance Evolution"
              subtitle="R² (blue solid) and RMSE×10 (rose dashed) across EXP-01 to EXP-11"
              className="h-[360px]"
            >
              <PlotDiv data={evolutionData} layout={evolutionLayout} />
            </ChartBox>
          </div>
        </section>

        {/* ── LGBM Tuning ── */}
        <section>
          <div className="text-[10px] font-mono uppercase tracking-widest text-blue-400 mb-3">
            06 // HYPERPARAMETER TUNING — LGBM (EXP-08)
          </div>
          <ChartBox title="Parallel Coordinates — Hyperparameter Search"
            subtitle="Color = CV RMSE · green = lower (better) · 7 top candidates from RandomizedSearchCV"
            className="h-[380px]"
          >
            <PlotDiv data={parallelData} layout={parallelLayout} />
          </ChartBox>
        </section>

        {/* ── Residual + Worst ── */}
        <section>
          <div className="text-[10px] font-mono uppercase tracking-widest text-blue-400 mb-3">
            07 // ERROR DIAGNOSTICS
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <ChartBox title="Ridge Residual vs Feature Sum"
              subtitle="Systematic bias: ridge under-predicts high-sum, over-predicts low-sum samples"
              className="h-[360px]"
            >
              <PlotDiv data={residualData} layout={residualLayout} />
            </ChartBox>

            <ChartBox title="Top-10 Worst Predictions (EXP-10)"
              subtitle="Actual vs Predicted · extreme outliers cluster near 0.285 and 0.725"
              className="h-[360px]"
            >
              <PlotDiv data={worstData} layout={worstLayout} />
            </ChartBox>
          </div>
        </section>

        {/* ── Summary Table ── */}
        <section>
          <div className="text-[10px] font-mono uppercase tracking-widest text-blue-400 mb-3">
            08 // FULL MODEL COMPARISON TABLE
          </div>
          <div className="bg-[#0d1117] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-xs font-mono text-left">
                <thead className="bg-slate-900/80 border-b border-slate-800">
                  <tr>
                    {["Experiment","Model","Training Rows","Val R²","Val RMSE","Val MAE","Train Time (s)","Notes"].map((h) => (
                      <th key={h} className="px-4 py-3 text-[10px] uppercase tracking-wider text-slate-400 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900">
                  {modelComparison.map((m) => (
                    <tr
                      key={m.exp}
                      className={`transition-colors ${m.winner ? "bg-emerald-950/20 border-l-2 border-emerald-500" : "hover:bg-slate-900/40"}`}
                    >
                      <td className="px-4 py-3 font-bold text-blue-400">{m.exp}</td>
                      <td className="px-4 py-3 text-slate-200 whitespace-nowrap">{m.model}</td>
                      <td className="px-4 py-3 text-slate-400">{m.rows.toLocaleString()}</td>
                      <td className={`px-4 py-3 font-bold ${m.r2 > 0.86 ? "text-emerald-400" : m.r2 > 0.84 ? "text-blue-400" : m.r2 > 0.5 ? "text-amber-400" : "text-rose-400"}`}>
                        {m.r2.toFixed(4)}
                      </td>
                      <td className="px-4 py-3 text-slate-300">{m.rmse.toFixed(5)}</td>
                      <td className="px-4 py-3 text-slate-300">{m.mae.toFixed(5)}</td>
                      <td className="px-4 py-3 text-slate-400">{m.trainTime.toFixed(1)}s</td>
                      <td className="px-4 py-3 text-slate-500 italic">
                        {m.winner ? "🏆 Final Model" : m.r2 > 0.84 && !m.winner ? "Top tier" : ""}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* ── Footer ── */}
        <footer className="pt-10 border-t border-slate-800 text-center text-[11px] text-slate-600 font-mono">
          TRIANGULUM // Training Analytics · LightGBM EXP-10 · R² = 0.8685 · 1,117,957 Samples
        </footer>
      </main>
    </div>
  );
}

