"use client";

import React, { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Search, Loader2, Navigation, AlertCircle } from "lucide-react";

interface AreaMapProps {
  selectedLocation: { lat: number; lng: number } | null;
  onLocationSelect?: (loc: { lat: number; lng: number; name?: string }) => void;
  interactive?: boolean;
  className?: string;
  zoom?: number;
}

// Glowing outlined triangle custom divIcon
const createTriangleIcon = () =>
  L.divIcon({
    className: "triangulum-custom-marker",
    html: `
      <div style="position: relative; width: 36px; height: 36px; transform: translate(-18px, -18px); display: flex; align-items: center; justify-content: center; cursor: pointer;">
        <div style="position: absolute; width: 36px; height: 36px; background: radial-gradient(circle, rgba(59, 130, 246, 0.5) 0%, transparent 75%); border-radius: 50%; animation: pulse 2s infinite ease-in-out;"></div>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="filter: drop-shadow(0 0 8px rgba(96, 165, 250, 0.9));">
          <polygon points="12 2 22 20 2 20" />
        </svg>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  });

// Map controller for invalidating size, click-to-pin, and smooth flying
function MapController({
  selectedLocation,
  onLocationSelect,
  interactive,
}: {
  selectedLocation: { lat: number; lng: number } | null;
  onLocationSelect?: (loc: { lat: number; lng: number }) => void;
  interactive: boolean;
}) {
  const map = useMap();

  useEffect(() => {
    // Invalidate size on mount and window resize so tiles never break
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 250);

    const handleResize = () => {
      map.invalidateSize();
    };

    window.addEventListener("resize", handleResize);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", handleResize);
    };
  }, [map]);

  useEffect(() => {
    if (selectedLocation) {
      map.flyTo([selectedLocation.lat, selectedLocation.lng], map.getZoom(), {
        duration: 1.2,
      });
      // Invalidate size after animation
      setTimeout(() => map.invalidateSize(), 1300);
    }
  }, [selectedLocation, map]);

  useMapEvents({
    click(e) {
      if (!interactive || !onLocationSelect) return;
      // Enable scroll wheel zoom only once user has deliberately clicked the map
      map.scrollWheelZoom.enable();
      onLocationSelect({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });

  return null;
}

export default function AreaMap({
  selectedLocation,
  onLocationSelect,
  interactive = true,
  className = "",
  zoom = 4,
}: AreaMapProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [markerIcon, setMarkerIcon] = useState<L.DivIcon | null>(null);

  const defaultCenter = selectedLocation || { lat: 20.0, lng: 0.0 };

  useEffect(() => {
    setMarkerIcon(createTriangleIcon());
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim() || !interactive) return;

    setIsSearching(true);
    setSearchError(null);

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          searchQuery.trim()
        )}&limit=1`,
        {
          headers: {
            "Accept-Language": "en",
          },
        }
      );

      if (!response.ok) throw new Error("Search network error");
      const data = await response.json();

      if (data && data.length > 0) {
        const result = data[0];
        const newLoc = {
          lat: parseFloat(result.lat),
          lng: parseFloat(result.lon),
          name: result.display_name,
        };
        if (onLocationSelect) {
          onLocationSelect(newLoc);
        }
      } else {
        setSearchError("Location not found. Try another city or coordinates.");
      }
    } catch {
      setSearchError("Failed to search location. Check your internet connection.");
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className={`relative flex flex-col w-full pointer-events-auto ${className}`}>
      {/* Search Header Bar (Only if interactive) */}
      {interactive && onLocationSelect && (
        <div className="mb-3 w-full">
          <form onSubmit={handleSearch} className="relative flex items-center w-full">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search city, region, or coordinates..."
                className="w-full bg-slate-900/95 text-slate-100 placeholder-slate-500 text-xs sm:text-sm rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 pl-9 sm:pl-10 border border-slate-700/80 focus:outline-none focus:border-blue-500 transition shadow-lg"
              />
              <Search className="absolute left-2.5 sm:left-3 top-2.5 sm:top-3 w-4 h-4 text-slate-400" />
            </div>
            <button
              type="submit"
              disabled={isSearching || !searchQuery.trim()}
              className="ml-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-500 text-white text-xs sm:text-sm font-medium rounded-lg transition flex items-center shadow-md whitespace-nowrap"
            >
              {isSearching ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Navigation className="w-3.5 h-3.5 mr-1" />
                  <span>Locate</span>
                </>
              )}
            </button>
          </form>

          {searchError && (
            <div className="mt-2 text-xs text-rose-400 flex items-center bg-rose-950/40 border border-rose-900/60 rounded px-2.5 py-1">
              <AlertCircle className="w-3.5 h-3.5 mr-1.5 flex-shrink-0" />
              {searchError}
            </div>
          )}
        </div>
      )}

      {/* Map Canvas Wrapper with explicit responsive height */}
      <div className="relative w-full h-[52vh] sm:h-[65vh] min-h-[350px] sm:min-h-[420px] max-h-[700px] rounded-xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-950">
        <MapContainer
          center={[defaultCenter.lat, defaultCenter.lng]}
          zoom={selectedLocation ? 7 : zoom}
          scrollWheelZoom={false} // Disabled by default to protect page scrolling
          style={{ height: "100%", width: "100%", background: "#090d16" }}
          attributionControl={true}
        >
          {/* Dark map tiles: Mapbox if env token provided, CARTO dark baseline fallback (no API key required) */}
          {process.env.NEXT_PUBLIC_MAPBOX_TOKEN ? (
            <TileLayer
              url={`https://api.mapbox.com/styles/v1/mapbox/dark-v11/tiles/{z}/{x}/{y}@2x?access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}`}
              tileSize={512}
              zoomOffset={-1}
              maxZoom={22}
              attribution='&copy; <a href="https://www.mapbox.com/about/maps/">Mapbox</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            />
          ) : (
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
              maxZoom={19}
            />
          )}

          {/* Selected Location Pin */}
          {selectedLocation && markerIcon && (
            <Marker
              position={[selectedLocation.lat, selectedLocation.lng]}
              icon={markerIcon}
            />
          )}

          <MapController
            selectedLocation={selectedLocation}
            onLocationSelect={onLocationSelect}
            interactive={interactive}
          />
        </MapContainer>

        {/* Minimal Coordinates Overlay Badge */}
        {selectedLocation && (
          <div className="absolute bottom-3 left-3 z-[1000] bg-slate-900/90 backdrop-blur-md border border-slate-700/80 px-3 py-1.5 rounded-md text-xs font-mono text-slate-300 shadow-lg pointer-events-none">
            LAT: <span className="text-blue-400 font-semibold">{selectedLocation.lat.toFixed(4)}°</span> | LNG:{" "}
            <span className="text-blue-400 font-semibold">{selectedLocation.lng.toFixed(4)}°</span>
          </div>
        )}

        {interactive && (
          <div className="hidden sm:block absolute top-3 right-3 z-[1000] bg-slate-900/80 backdrop-blur-sm border border-slate-700/60 px-2.5 py-1 rounded text-[11px] text-slate-400 pointer-events-none">
            Click map to drop pin • Scroll zoom enabled on click
          </div>
        )}
      </div>
    </div>
  );
}
