const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export interface AreaDataResponse {
  location: {
    lat: number;
    lng: number;
    name?: string;
  };
  features: Record<string, number>;
  assumed: string[];
  estimated: string[];
  risk: {
    flood_probability: number;
    flood_probability_percent: number;
    level: "Low" | "Moderate" | "High";
    thresholds: {
      low: string;
      moderate: string;
      high: string;
    };
  };
  group_values: {
    climate_rain: number;
    water_management: number;
    land_people: number;
    preparedness_planning: number;
  };
  mock_data: {
    rainfall_mm: number;
    soil_moisture_pct: number;
    water_body_proximity_km: number;
    label: string;
  };
  disclaimer: string;
}

export async function getAreaData(lat: number, lng: number, locationName?: string): Promise<AreaDataResponse> {
  const url = `${API_BASE_URL}/area-data?lat=${lat}&lng=${lng}`;
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Accept": "application/json",
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch area data (${response.status}): ${errorText}`);
  }

  const data: AreaDataResponse = await response.json();
  if (locationName) {
    data.location.name = locationName;
  }
  return data;
}

