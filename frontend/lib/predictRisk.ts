const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export interface PredictResponse {
  success: boolean;
  prediction: {
    flood_probability: number;
    flood_probability_percent: number;
  };
  model: string;
}

export async function predictRisk(features: Record<string, number>): Promise<PredictResponse> {
  const url = `${API_BASE_URL}/predict`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
    },
    body: JSON.stringify({ features }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Prediction failed (${response.status}): ${errText}`);
  }

  return response.json();
}

export const FEATURE_GROUPS = {
  climate_rain: [
    "MonsoonIntensity",
    "ClimateChange",
    "TopographyDrainage",
    "Landslides",
  ],
  water_management: [
    "RiverManagement",
    "DamsQuality",
    "DrainageSystems",
    "Siltation",
    "Watersheds",
  ],
  land_people: [
    "Deforestation",
    "Urbanization",
    "AgriculturalPractices",
    "Encroachments",
    "WetlandLoss",
    "PopulationScore",
    "CoastalVulnerability",
  ],
  preparedness_planning: [
    "IneffectiveDisasterPreparedness",
    "InadequatePlanning",
    "DeterioratingInfrastructure",
    "PoliticalFactors",
  ],
} as const;

export type GroupKey = keyof typeof FEATURE_GROUPS;

export const GROUP_LABELS: Record<GroupKey, string> = {
  climate_rain: "Climate and rain",
  water_management: "Water management",
  land_people: "Land and people",
  preparedness_planning: "Preparedness and planning",
};

export function classifyRisk(prob: number): "Low" | "Moderate" | "High" {
  if (prob < 0.47) return "Low";
  if (prob <= 0.54) return "Moderate";
  return "High";
}

