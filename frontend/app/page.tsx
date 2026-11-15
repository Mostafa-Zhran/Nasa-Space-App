"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import dynamic from "next/dynamic";
import {
  ChevronDown,
  MapPin,
  ShieldAlert,
  Layers,
  Info,
  Droplets,
  ArrowRight,
  ArrowDown,
  CheckCircle2,
  HelpCircle,
  Compass,
  BarChart3,
  Menu,
  X,
} from "lucide-react";

import RiskGauge from "@/components/RiskGauge";
import WhatIfControls from "@/components/WhatIfControls";
import ContributionView from "@/components/ContributionView";
import {
  getAreaData,
  AreaDataResponse,
} from "@/lib/getAreaData";
import {
  predictRisk,
  classifyRisk,
  FEATURE_GROUPS,
  GroupKey,
} from "@/lib/predictRisk";

// Dynamic import of Leaflet map strictly with ssr: false and dark placeholder
const AreaMap = dynamic(() => import("@/components/AreaMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[65vh] min-h-[420px] rounded-xl bg-slate-950 border border-slate-800 flex flex-col items-center justify-center text-slate-500">
      <div className="w-8 h-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin mb-3"></div>
      <span className="text-xs font-mono uppercase tracking-widest text-slate-400">
        Loading Carto Geospatial Canvas...
      </span>
    </div>
  ),
});

// Dynamic import of 3D Galaxy Background
const GalaxyBackground = dynamic(() => import("@/components/GalaxyBackground"), {
  ssr: false,
  loading: () => null,
});

// Dynamic import of 3D Triangulation Representation
const Triangulum3D = dynamic(() => import("@/components/Triangulum3D"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[380px] flex items-center justify-center text-slate-500 font-mono text-xs">
      <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-3"></div>
      Rendering 3D Triangulation Geometry...
    </div>
  ),
});

export default function TriangulumApp() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  // Selected location state
  const [selectedLocation, setSelectedLocation] = useState<{
    lat: number;
    lng: number;
    name?: string;
  } | null>({
    lat: 23.8103,
    lng: 90.4125,
    name: "Dhaka, Bangladesh (Monsoon & Delta Belt)",
  });

  const [areaData, setAreaData] = useState<AreaDataResponse | null>(null);
  const [isLoadingArea, setIsLoadingArea] = useState<boolean>(false);
  const [areaError, setAreaError] = useState<string | null>(null);

  // Model features & What-If state
  const [currentFeatures, setCurrentFeatures] = useState<Record<string, number> | null>(null);
  const [groupValues, setGroupValues] = useState<Record<GroupKey, number>>({
    climate_rain: 5.0,
    water_management: 5.0,
    land_people: 5.0,
    preparedness_planning: 5.0,
  });

  const [floodProbability, setFloodProbability] = useState<number>(0.50);
  const [riskLevel, setRiskLevel] = useState<"Low" | "Moderate" | "High">("Moderate");
  const [isUpdatingModel, setIsUpdatingModel] = useState<boolean>(false);

  // Contribution view delta state for 4 groups
  const [contributions, setContributions] = useState<Record<GroupKey, number>>({
    climate_rain: 0.0,
    water_management: 0.0,
    land_people: 0.0,
    preparedness_planning: 0.0,
  });

  // Base neutral prediction reference (all 20 features = 5.0)
  const neutralProbRef = useRef<number>(0.505068);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch initial area data when location changes
  const fetchArea = useCallback(async (lat: number, lng: number, name?: string) => {
    setIsLoadingArea(true);
    setAreaError(null);

    try {
      const data = await getAreaData(lat, lng, name);
      setAreaData(data);
      setCurrentFeatures(data.features);
      setGroupValues(data.group_values);
      setFloodProbability(data.risk.flood_probability);
      setRiskLevel(data.risk.level);

      // Compute initial contribution deltas for the 4 groups
      computeContributions(data.group_values);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load area data";
      setAreaError(msg);
    } finally {
      setIsLoadingArea(false);
    }
  }, []);

  useEffect(() => {
    if (selectedLocation) {
      fetchArea(selectedLocation.lat, selectedLocation.lng, selectedLocation.name);
    }
  }, [selectedLocation, fetchArea]);

  // Compute contribution for each group by isolating its delta from neutral (5.0)
  const computeContributions = async (groups: Record<GroupKey, number>) => {
    const keys: GroupKey[] = [
      "climate_rain",
      "water_management",
      "land_people",
      "preparedness_planning",
    ];

    const deltas: Record<GroupKey, number> = {
      climate_rain: 0,
      water_management: 0,
      land_people: 0,
      preparedness_planning: 0,
    };

    try {
      // Evaluate each group change sequentially or in parallel
      await Promise.all(
        keys.map(async (key) => {
          const val = groups[key];
          if (Math.abs(val - 5.0) < 0.05) {
            deltas[key] = 0.0;
            return;
          }

          // Build features where ONLY this group has `val` and all others are 5.0
          const testFeatures: Record<string, number> = {};
          keys.forEach((g) => {
            const assigned = g === key ? val : 5.0;
            FEATURE_GROUPS[g].forEach((feat) => {
              testFeatures[feat] = assigned;
            });
          });

          const resp = await predictRisk(testFeatures);
          deltas[key] = resp.prediction.flood_probability - neutralProbRef.current;
        })
      );

      setContributions(deltas);
    } catch {
      // Graceful fallback
    }
  };

  // Handle What-If slider movement (debounced 300ms)
  const handleGroupSliderChange = (groupKey: GroupKey, newValue: number) => {
    const updatedGroups = { ...groupValues, [groupKey]: newValue };
    setGroupValues(updatedGroups);

    // Update the features state
    if (!currentFeatures) return;
    const updatedFeatures = { ...currentFeatures };
    FEATURE_GROUPS[groupKey].forEach((feat) => {
      updatedFeatures[feat] = newValue;
    });
    setCurrentFeatures(updatedFeatures);

    setIsUpdatingModel(true);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(async () => {
      try {
        const resp = await predictRisk(updatedFeatures);
        const newProb = resp.prediction.flood_probability;
        setFloodProbability(newProb);
        setRiskLevel(classifyRisk(newProb));

        // Recompute contribution bars
        computeContributions(updatedGroups);
      } catch (err) {
        console.error("Failed to predict risk on slider change:", err);
      } finally {
        setIsUpdatingModel(false);
      }
    }, 300);
  };

  // Reset What-If sliders to initial area defaults
  const handleResetSliders = () => {
    if (!areaData) return;
    setGroupValues({
      climate_rain: 5.0,
      water_management: 5.0,
      land_people: 5.0,
      preparedness_planning: 5.0,
    });

    const resetFeatures: Record<string, number> = {};
    Object.keys(areaData.features).forEach((f) => {
      resetFeatures[f] = 5.0;
    });
    setCurrentFeatures(resetFeatures);

    setIsUpdatingModel(true);
    predictRisk(resetFeatures)
      .then((res) => {
        setFloodProbability(res.prediction.flood_probability);
        setRiskLevel(classifyRisk(res.prediction.flood_probability));
        setContributions({
          climate_rain: 0,
          water_management: 0,
          land_people: 0,
          preparedness_planning: 0,
        });
      })
      .finally(() => setIsUpdatingModel(false));
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="relative min-h-screen bg-[#060911] text-slate-100 overflow-x-hidden">
      {/* 3D Galaxy Background (z-0, pointer-events: none) */}
      <GalaxyBackground />

      {/* Floating Vertical Screen Rail on Desktop */}
      <div className="hidden 2xl:flex fixed right-6 top-1/2 -translate-y-1/2 z-40 flex-col items-center space-y-4 bg-slate-950/60 backdrop-blur-md p-2.5 rounded-full border border-slate-800/80 shadow-2xl">
        {[
          { id: "screen-hero", num: "01", label: "Intro" },
          { id: "screen-context", num: "02", label: "Context" },
          { id: "screen-map", num: "03", label: "Select Area" },
          { id: "screen-result", num: "04", label: "Result" },
          { id: "screen-explanation", num: "05", label: "Explanation" },
          { id: "screen-action", num: "06", label: "Protocol" },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => scrollToSection(item.id)}
            className="group relative flex items-center justify-end p-1 focus:outline-none"
            title={`${item.num} ${item.label}`}
          >
            <span className="absolute right-8 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-700 text-[11px] font-mono text-slate-200 opacity-0 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none shadow-xl">
              {item.num} {item.label}
            </span>
            <span className="w-2.5 h-2.5 rounded-full bg-slate-700 group-hover:bg-blue-400 group-hover:scale-125 transition-all"></span>
          </button>
        ))}
      </div>

      {/* Navigation Header */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#060911]/95 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="relative w-7 h-7 flex items-center justify-center">
            <svg
              className="w-6 h-6 animate-[spin_20s_linear_infinite]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#60a5fa"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polygon points="12 2 22 20 2 20" />
            </svg>
            <div className="absolute w-1.5 h-1.5 rounded-full bg-blue-400 shadow-[0_0_8px_#60a5fa]"></div>
          </div>
          <span className="font-mono text-sm sm:text-base font-bold tracking-widest text-white">
            TRIANGULUM
          </span>
        </div>

        {/* Desktop Links */}
        <div className="hidden lg:flex items-center space-x-5 text-xs font-mono text-slate-400">
          <button onClick={() => scrollToSection("screen-hero")} className="hover:text-blue-400 transition">
            01 INTRO
          </button>
          <button onClick={() => scrollToSection("screen-context")} className="hover:text-blue-400 transition">
            02 CONTEXT
          </button>
          <button onClick={() => scrollToSection("screen-map")} className="hover:text-blue-400 transition">
            03 SELECT AREA
          </button>
          <button onClick={() => scrollToSection("screen-result")} className="hover:text-blue-400 transition">
            04 RESULT
          </button>
          <button onClick={() => scrollToSection("screen-explanation")} className="hover:text-blue-400 transition">
            05 EXPLANATION
          </button>
          <button onClick={() => scrollToSection("screen-action")} className="hover:text-blue-400 transition">
            06 PROTOCOL
          </button>
        </div>

        {/* Action Controls (Always visible on all screens) */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Direct Mobile & Desktop Dashboard Access */}
          <a
            href="/dashboard"
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-mono text-xs font-bold shadow-md shadow-blue-500/25 border border-blue-400/30 transition active:scale-95"
            title="Open Interactive Training Analytics Dashboard"
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span className="inline">DASHBOARD</span>
          </a>

          <span className="hidden xl:inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-mono bg-blue-950/60 text-blue-400 border border-blue-800/60">
            LightGBM EXP-10
          </span>

          {/* Mobile Hamburger Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 hover:text-white transition active:scale-95"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5 text-blue-400" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed top-[57px] left-0 right-0 z-40 bg-[#060911]/98 backdrop-blur-2xl border-b border-slate-800 px-6 py-5 flex flex-col space-y-3 shadow-2xl">
          <div className="flex items-center justify-between pb-2.5 border-b border-slate-800/80">
            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400">Navigation Menu</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-950 text-blue-400 border border-blue-800/60">
              LightGBM EXP-10
            </span>
          </div>

          {[
            { id: "screen-hero", label: "01 INTRO // MISSION" },
            { id: "screen-context", label: "02 CONTEXT // METHODOLOGY" },
            { id: "screen-map", label: "03 SELECT AREA // MAP TARGETING" },
            { id: "screen-result", label: "04 RESULT // SIMULATION DASHBOARD" },
            { id: "screen-explanation", label: "05 EXPLANATION // ASSUMPTIONS" },
            { id: "screen-action", label: "06 PROTOCOL // RESPONSE MATRIX" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => {
                scrollToSection(item.id);
                setMobileMenuOpen(false);
              }}
              className="text-left py-2 px-3 rounded-lg hover:bg-slate-900 text-xs font-mono text-slate-200 flex items-center justify-between transition"
            >
              <span>{item.label}</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
            </button>
          ))}

          <div className="pt-2">
            <a
              href="/dashboard"
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 text-white font-bold text-xs font-mono flex items-center justify-center space-x-2 shadow-lg shadow-blue-500/20 active:scale-98 transition"
            >
              <BarChart3 className="w-4 h-4" />
              <span>OPEN PLOTLY TRAINING DASHBOARD →</span>
            </a>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SCREEN 1: HERO                                                           */}
      {/* ========================================================================= */}
      <section
        id="screen-hero"
        className="relative z-10 min-h-screen flex flex-col justify-center px-4 sm:px-6 pt-24 pb-12 scroll-mt-24 max-w-7xl mx-auto"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Mission, Headlines, CTA controls */}
          <div className="lg:col-span-7 flex flex-col items-start text-left">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full text-xs font-mono uppercase tracking-widest text-blue-400 bg-blue-950/40 border border-blue-800/60 mb-5">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
              <span>PLANETARY FLOOD SYNTHESIS SYSTEM // NASA SPEC</span>
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-none">
              TRIANGULUM
            </h1>

            <p className="mt-4 text-base sm:text-lg text-slate-300 max-w-xl font-normal leading-relaxed">
              Planetary flood risk estimation modeled at the tripartite intersection of
              <strong className="text-blue-400 font-semibold"> Atmosphere</strong>,
              <strong className="text-cyan-400 font-semibold"> Hydrosphere</strong>, and
              <strong className="text-indigo-400 font-semibold"> Anthroposphere</strong>.
            </p>

            {/* Redesigned Control Deck: Select Geo Area & Explore */}
            <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto">
              {/* Primary CTA: Select Geographic Area */}
              <button
                onClick={() => scrollToSection("screen-map")}
                className="group relative px-6 py-4 rounded-2xl bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm tracking-wide shadow-xl shadow-blue-500/25 border border-blue-400/30 flex items-center justify-between sm:justify-start space-x-4 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-white group-hover:animate-bounce" />
                  </div>
                  <div className="text-left">
                    <div className="text-[10px] font-mono uppercase tracking-wider text-blue-200">Interactive Map</div>
                    <div className="text-sm font-extrabold text-white">Select Geographic Area</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </button>

              {/* Secondary CTA: Explore Methodology */}
              <button
                onClick={() => scrollToSection("screen-context")}
                className="group px-6 py-4 rounded-2xl bg-slate-900/90 hover:bg-slate-800/90 text-slate-200 font-semibold text-sm tracking-wide border border-slate-700/80 hover:border-slate-500 flex items-center justify-between sm:justify-start space-x-4 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-lg backdrop-blur-sm"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center text-blue-400 group-hover:rotate-45 transition-transform duration-300">
                    <Compass className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Scientific Framework</div>
                    <div className="text-sm font-bold text-slate-200">Explore Methodology</div>
                  </div>
                </div>
                <ArrowDown className="w-4 h-4 ml-2 group-hover:translate-y-1 transition-transform text-slate-400" />
              </button>
            </div>

            {/* Quick Stats Banner */}
            <div className="mt-8 pt-6 border-t border-slate-800/80 grid grid-cols-3 gap-4 w-full max-w-lg text-left">
              <div>
                <div className="text-[10px] font-mono text-slate-500 uppercase">Training Data</div>
                <div className="text-sm font-bold font-mono text-slate-200 mt-0.5">1.1M+ Records</div>
              </div>
              <div>
                <div className="text-[10px] font-mono text-slate-500 uppercase">Model Score</div>
                <div className="text-sm font-bold font-mono text-blue-400 mt-0.5">R² = 0.8685</div>
              </div>
              <div>
                <div className="text-[10px] font-mono text-slate-500 uppercase">Dimensions</div>
                <div className="text-sm font-bold font-mono text-indigo-400 mt-0.5">20 Physical Feats</div>
              </div>
            </div>
          </div>

          {/* Right Column: 3D Celestial Representation */}
          <div className="lg:col-span-5 w-full flex justify-center">
            <Triangulum3D />
          </div>
        </div>

        {/* Elegant Centered Scroll Prompt */}
        <div
          onClick={() => scrollToSection("screen-context")}
          className="mt-12 flex flex-col items-center justify-center cursor-pointer group text-slate-500 hover:text-blue-400 transition"
        >
          <div className="w-5 h-9 rounded-full border border-slate-700 group-hover:border-blue-500 flex items-start justify-center p-1 transition">
            <div className="w-1 h-2 rounded-full bg-blue-400 animate-bounce"></div>
          </div>
          <span className="text-[10px] font-mono tracking-widest uppercase mt-2 group-hover:text-slate-300 transition">
            Scroll to Explore
          </span>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SCREEN 2: CONTEXT                                                        */}
      {/* ========================================================================= */}
      <section
        id="screen-context"
        className="relative z-10 min-h-screen flex flex-col justify-center px-4 sm:px-6 py-20 sm:py-24 scroll-mt-24 max-w-6xl mx-auto border-t border-slate-900"
      >
        <div className="mb-12">
          <span className="text-xs font-mono uppercase tracking-widest text-blue-400">
            02 // PROBLEM SPACE & METHODOLOGY
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-2">
            Multi-Dimensional Risk Aggregation
          </h2>
          <p className="text-slate-400 mt-3 max-w-3xl leading-relaxed">
            Flooding is rarely a single-variable failure. Severe inundation occurs when atmospheric
            rain intensity coincides with compromised watershed buffers, urban impervious surfaces,
            and deteriorating floodgates.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-slate-900/60 rounded-2xl border border-slate-800 backdrop-blur-sm">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 mb-4">
              <Droplets className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">20 Indicator Dimensions</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Evaluating precipitation intensity, siltation, deforested catchments, coastal elevation,
              and drainage maintenance indices across over 1.1 million benchmark training regions.
            </p>
          </div>

          <div className="p-6 bg-slate-900/60 rounded-2xl border border-slate-800 backdrop-blur-sm">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-4">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Aggregate Transformers</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Standard decision trees struggle to isolate additive risk. Our custom NumPy feature transformer
              computes cumulative sum, variance, and extrema on the fly to capture nonlinear tipping points.
            </p>
          </div>

          <div className="p-6 bg-slate-900/60 rounded-2xl border border-slate-800 backdrop-blur-sm">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-4">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Transparent Honest AI</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Assumptions and mock sensor feeds are explicitly tagged. Predictions represent probabilistic
              risk likelihood ($R^2 = 0.8685$) rather than definitive weather alarms.
            </p>
          </div>
        </div>

        <div className="mt-12 text-center">
          <button
            onClick={() => scrollToSection("screen-map")}
            className="inline-flex items-center space-x-2 text-xs font-mono text-blue-400 hover:text-blue-300 transition"
          >
            <span>Proceed to Interactive Map Selection</span>
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SCREEN 3: SELECT AREA (THE MAP SCREEN)                                    */}
      {/* ========================================================================= */}
      <section
        id="screen-map"
        className="relative z-10 min-h-screen flex flex-col justify-center px-4 sm:px-6 py-16 sm:py-20 scroll-mt-24 max-w-6xl mx-auto border-t border-slate-900"
      >
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-4">
          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-blue-400">
              03 // GEOSPATIAL TARGETING
            </span>
            <h2 className="text-3xl font-extrabold text-white mt-1">
              Select Geographic Area {isLoadingArea && <span className="text-xs text-blue-400 font-mono animate-pulse font-normal">(Analyzing Location...)</span>}
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Search by territory name or click directly on the Carto dark map to drop a pin.
            </p>
          </div>

          {selectedLocation && (
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <div className="text-xs font-semibold text-slate-200">
                  {selectedLocation.name || "Target Pin Dropped"}
                </div>
                <div className="text-[11px] font-mono text-blue-400">
                  {selectedLocation.lat.toFixed(4)}°, {selectedLocation.lng.toFixed(4)}°
                </div>
              </div>
              <button
                onClick={() => scrollToSection("screen-result")}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold transition flex items-center space-x-1.5 shadow"
              >
                <span>View Analysis</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* The AreaMap Component with ssr: false */}
        <div className="relative z-20 w-full pointer-events-auto">
          <AreaMap
            selectedLocation={selectedLocation}
            onLocationSelect={(loc) => {
              setSelectedLocation(loc);
            }}
            interactive={true}
          />
        </div>

        {areaError && (
          <div className="mt-4 p-3 rounded-lg bg-rose-950/50 border border-rose-800 text-xs text-rose-300">
            {areaError}
          </div>
        )}
      </section>

      {/* ========================================================================= */}
      {/* SCREEN 4: RESULT (THE INTERACTIVE DASHBOARD)                              */}
      {/* ========================================================================= */}
      <section
        id="screen-result"
        className="relative z-10 min-h-screen flex flex-col justify-center px-4 sm:px-6 py-16 sm:py-20 scroll-mt-24 max-w-7xl mx-auto border-t border-slate-900"
      >
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-blue-400">
              04 // SYNTHESIS DASHBOARD
            </span>
            <h2 className="text-3xl font-extrabold text-white mt-1">Risk Evaluation & Simulation</h2>
            <p className="text-xs text-slate-400 mt-1">
              Active region:{" "}
              <span className="text-slate-200 font-medium">
                {selectedLocation?.name || `${selectedLocation?.lat.toFixed(4)}°, ${selectedLocation?.lng.toFixed(4)}°`}
              </span>
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-[11px] font-mono text-slate-400">
              Sensors: <span className="text-amber-400 font-semibold"> data</span>
            </span>
            <span className="text-slate-600">|</span>
            <span className="text-[11px] font-mono text-slate-400">
              Model: <span className="text-emerald-400 font-semibold">LightGBM Active</span>
            </span>
          </div>
        </div>

        {/* Main Dashboard Layout: Map Reused on Left, Interactive Widgets on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: Reused AreaMap showing selected location (4 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-slate-900/60 rounded-2xl border border-slate-800 p-4 shadow-xl">
              <div className="flex items-center justify-between mb-3 px-1">
                <span className="text-xs font-mono text-slate-300 uppercase tracking-wider flex items-center">
                  <MapPin className="w-3.5 h-3.5 mr-1.5 text-blue-400" />
                  Target Spatial Context
                </span>
                <span className="text-[10px] font-mono text-slate-500">
                  Mapbox Dark-v11 Tiles
                </span>
              </div>
              <div className="h-[380px] w-full rounded-xl overflow-hidden border border-slate-800">
                <AreaMap
                  selectedLocation={selectedLocation}
                  interactive={false}
                  zoom={6}
                />
              </div>
            </div>

            {/* Environmental Sensor Mock Data Cards */}
            {areaData && (
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                <div className="p-2.5 sm:p-3 bg-slate-900/60 rounded-xl border border-slate-800/80">
                  <div className="text-[9px] sm:text-[10px] font-mono text-slate-400 uppercase flex items-center justify-between">
                    <span>Rainfall</span>
                    <span className="text-amber-500/80 text-[9px]"></span>
                  </div>
                  <div className="text-sm sm:text-lg font-bold font-mono text-white mt-0.5 sm:mt-1">
                    {areaData.mock_data.rainfall_mm} <span className="text-[10px] sm:text-xs font-normal text-slate-400">mm</span>
                  </div>
                </div>

                <div className="p-2.5 sm:p-3 bg-slate-900/60 rounded-xl border border-slate-800/80">
                  <div className="text-[9px] sm:text-[10px] font-mono text-slate-400 uppercase flex items-center justify-between">
                    <span>Soil Moist.</span>
                    <span className="text-amber-500/80 text-[9px]"></span>
                  </div>
                  <div className="text-sm sm:text-lg font-bold font-mono text-white mt-0.5 sm:mt-1">
                    {areaData.mock_data.soil_moisture_pct} <span className="text-[10px] sm:text-xs font-normal text-slate-400">%</span>
                  </div>
                </div>

                <div className="p-2.5 sm:p-3 bg-slate-900/60 rounded-xl border border-slate-800/80">
                  <div className="text-[9px] sm:text-[10px] font-mono text-slate-400 uppercase flex items-center justify-between">
                    <span>River Dist.</span>
                    <span className="text-amber-500/80 text-[9px]"></span>
                  </div>
                  <div className="text-sm sm:text-lg font-bold font-mono text-white mt-0.5 sm:mt-1">
                    {areaData.mock_data.water_body_proximity_km} <span className="text-[10px] sm:text-xs font-normal text-slate-400">km</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right: Risk Gauge + What-If Controls + Contribution View (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
              {/* Widget 1: Circular Risk Gauge with rotating triangle motif */}
              <RiskGauge
                probability={floodProbability}
                level={riskLevel}
                isUpdating={isUpdatingModel}
              />

              {/* Widget 2: 4-Bar Marginal Contribution View */}
              <ContributionView contributions={contributions} />
            </div>

            {/* Widget 3: The What-If Interactive Controls */}
            <WhatIfControls
              groupValues={groupValues}
              onChangeGroup={handleGroupSliderChange}
              onReset={handleResetSliders}
              isUpdating={isUpdatingModel}
            />

            {/* Strict Honesty Text */}
            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-center">
              <p className="text-xs text-slate-400 font-mono">
                Estimate from a statistical model trained on a score-based dataset. Not an official flood warning.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SCREEN 5: EXPLANATION                                                    */}
      {/* ========================================================================= */}
      <section
        id="screen-explanation"
        className="relative z-10 min-h-screen flex flex-col justify-center px-4 sm:px-6 py-20 sm:py-24 max-w-5xl mx-auto border-t border-slate-900"
      >
        <div className="mb-10">
          <span className="text-xs font-mono uppercase tracking-widest text-blue-400">
            05 // INTERPRETABILITY & ASSUMPTIONS
          </span>
          <h2 className="text-3xl font-extrabold text-white mt-1">
            Model Explanation & Input Lineage
          </h2>
          <p className="text-slate-400 text-sm mt-2 max-w-2xl leading-relaxed">
            The result is an estimate, not an official warning. Training data relies on abstract numeric
            risk indices (range 0–19, average ~5.0). Here is the exact lineage of the parameters evaluated:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Estimated Features */}
          <div className="p-6 bg-slate-900/60 rounded-2xl border border-blue-900/40 backdrop-blur-sm">
            <div className="flex items-center space-x-2 text-blue-400 mb-3">
              <CheckCircle2 className="w-4 h-4" />
              <h3 className="text-sm font-bold uppercase tracking-wider">
                Geographically Estimated (3 Features)
              </h3>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Estimated from regional latitude/longitude coordinates (climate belt, coastal exposure, and topography):
            </p>
            <ul className="space-y-2 text-xs font-mono">
              <li className="flex justify-between p-2 rounded bg-slate-950/60 border border-slate-800">
                <span className="text-slate-300">MonsoonIntensity</span>
                <span className="text-blue-400 font-bold">{currentFeatures?.MonsoonIntensity ?? 5.0}</span>
              </li>
              <li className="flex justify-between p-2 rounded bg-slate-950/60 border border-slate-800">
                <span className="text-slate-300">CoastalVulnerability</span>
                <span className="text-blue-400 font-bold">{currentFeatures?.CoastalVulnerability ?? 5.0}</span>
              </li>
              <li className="flex justify-between p-2 rounded bg-slate-950/60 border border-slate-800">
                <span className="text-slate-300">Landslides</span>
                <span className="text-blue-400 font-bold">{currentFeatures?.Landslides ?? 5.0}</span>
              </li>
            </ul>
          </div>

          {/* Assumed Features */}
          <div className="p-6 bg-slate-900/60 rounded-2xl border border-slate-800 backdrop-blur-sm">
            <div className="flex items-center space-x-2 text-amber-400 mb-3">
              <HelpCircle className="w-4 h-4" />
              <h3 className="text-sm font-bold uppercase tracking-wider">
                Assumed Neutral Baseline (17 Features)
              </h3>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Not directly observable from raw coordinates without external GIS rasters. Set to neutral value 5.0:
            </p>
            <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto pr-1">
              {areaData?.assumed.map((feat) => (
                <span
                  key={feat}
                  className="px-2 py-1 rounded bg-slate-950/80 border border-slate-800 text-[11px] font-mono text-slate-400"
                >
                  {feat}: <strong className="text-slate-300">5.0</strong>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Callout Card */}
        <div className="p-5 rounded-2xl bg-blue-950/20 border border-blue-900/50 flex items-start space-x-4">
          <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-slate-300 leading-relaxed">
            <strong>Calibration Notice:</strong> The LightGBM model was calibrated with an additive feature engineering
            transformer (`add_aggregates`), achieving an $R^2$ of 0.8685 across cross-validation. Changing any What-If
            slider dynamically feeds all 20 numeric scores into the model pipeline.
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SCREEN 6: PROTOCOL & ACTIONS                                             */}
      {/* ========================================================================= */}
      <section
        id="screen-action"
        className="relative z-10 min-h-screen flex flex-col justify-center px-4 sm:px-6 py-20 sm:py-24 max-w-5xl mx-auto border-t border-slate-900"
      >
        <div className="mb-10 text-center">
          <span className="text-xs font-mono uppercase tracking-widest text-blue-400">
            06 // OPERATIONAL CONTINGENCY PROTOCOL
          </span>
          <h2 className="text-3xl font-extrabold text-white mt-1">Recommended Response Matrix</h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-xl mx-auto">
            Standard operating actions corresponding to the synthesized risk classification:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Low */}
          <div
            className={`p-6 rounded-2xl border transition-all ${riskLevel === "Low"
              ? "bg-emerald-950/40 border-emerald-500 shadow-xl shadow-emerald-500/10"
              : "bg-slate-900/50 border-slate-800 opacity-70"
              }`}
          >
            <div className="text-xs font-mono text-emerald-400 font-bold mb-2">TIER 1 // &lt;47%</div>
            <h3 className="text-lg font-bold text-white mb-2">🟢 Low Vulnerability</h3>
            <ul className="text-xs text-slate-300 space-y-2 mt-4">
              <li>• Routine seasonal drain inspections</li>
              <li>• Standard catchment basin monitoring</li>
              <li>• Regular culvert debris clearance</li>
            </ul>
          </div>

          {/* Moderate */}
          <div
            className={`p-6 rounded-2xl border transition-all ${riskLevel === "Moderate"
              ? "bg-amber-950/40 border-amber-500 shadow-xl shadow-amber-500/10"
              : "bg-slate-900/50 border-slate-800 opacity-70"
              }`}
          >
            <div className="text-xs font-mono text-amber-400 font-bold mb-2">TIER 2 // 47% - 54%</div>
            <h3 className="text-lg font-bold text-white mb-2">🟡 Moderate Vulnerability</h3>
            <ul className="text-xs text-slate-300 space-y-2 mt-4">
              <li>• Alert local hydrological response teams</li>
              <li>• Verify stormwater pumping station operability</li>
              <li>• Prepare temporary retention basins</li>
            </ul>
          </div>

          {/* High */}
          <div
            className={`p-6 rounded-2xl border transition-all ${riskLevel === "High"
              ? "bg-rose-950/40 border-rose-500 shadow-xl shadow-rose-500/10"
              : "bg-slate-900/50 border-slate-800 opacity-70"
              }`}
          >
            <div className="text-xs font-mono text-rose-400 font-bold mb-2">TIER 3 // &gt;54%</div>
            <h3 className="text-lg font-bold text-white mb-2">🔴 High Vulnerability</h3>
            <ul className="text-xs text-slate-300 space-y-2 mt-4">
              <li>• Pre-position mobile flood barriers & sandbags</li>
              <li>• Review emergency shelter & evacuation corridors</li>
              <li>• Broadcast cautionary advisories in floodplain zones</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-16 pt-8 border-t border-slate-800 text-center text-xs text-slate-500 font-mono">
          TRIANGULUM // Planetary Flood Synthesis • Powered by FastAPI & LightGBM EXP-10 Pipeline
        </footer>
      </section>
    </div>
  );
}
