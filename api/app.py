
import os
import sys
import json
import joblib
import numpy as np
import pandas as pd

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

# Import feature engineering before loading the model
import feature_engineering

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, List

MODEL_PATH = os.path.join(BASE_DIR, "flood_model.joblib")
METADATA_PATH = os.path.join(BASE_DIR, "metadata.json")

# Load metadata
with open(METADATA_PATH, "r") as f:
    metadata = json.load(f)

FEATURES = metadata["features"]

# Load model once when the API starts
model = joblib.load(MODEL_PATH)

app = FastAPI(
    title="Flood Probability Prediction API",
    description="Predicts flood probability using a trained LightGBM model.",
    version="1.0.0"
)

# Enable CORS for frontend UI clients (React, Vue, Streamlit, HTML/JS)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class PredictionRequest(BaseModel):
    features: Dict[str, float]


class BatchPredictionRequest(BaseModel):
    instances: List[Dict[str, float]]


def validate_and_prepare(data):
    if not isinstance(data, dict):
        raise ValueError("Input must be a dictionary of feature values.")

    missing = [f for f in FEATURES if f not in data]
    extra = [f for f in data if f not in FEATURES]

    if missing:
        raise ValueError(f"Missing features: {missing}")

    if extra:
        raise ValueError(f"Unexpected features: {extra}")

    try:
        values = {f: float(data[f]) for f in FEATURES}
    except (TypeError, ValueError):
        raise ValueError("All feature values must be numeric.")

    if not all(np.isfinite(v) for v in values.values()):
        raise ValueError("Feature values must be finite numbers.")

    return pd.DataFrame([values], columns=FEATURES)


def make_prediction(data):
    input_df = validate_and_prepare(data)

    prediction = float(model.predict(input_df)[0])
    prediction = float(np.clip(prediction, 0.0, 1.0))

    return {
        "flood_probability": round(prediction, 6),
        "flood_probability_percent": round(prediction * 100, 2)
    }


@app.get("/")
def root():
    return {
        "message": "Flood Prediction API is running",
        "docs": "/docs",
        "model": metadata["model_name"]
    }


@app.get("/health")
def health():
    return {
        "status": "healthy",
        "model_loaded": model is not None,
        "model_name": metadata["model_name"]
    }


@app.get("/schema")
def schema():
    return {
        "features": FEATURES,
        "number_of_features": len(FEATURES),
        "target": metadata["target"]
    }


@app.post("/predict")
def predict(request: PredictionRequest):
    try:
        result = make_prediction(request.features)

        return {
            "success": True,
            "prediction": result,
            "model": metadata["model_name"]
        }

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/predict/batch")
def predict_batch(request: BatchPredictionRequest):
    if not request.instances:
        raise HTTPException(
            status_code=400,
            detail="At least one instance is required."
        )

    if len(request.instances) > 1000:
        raise HTTPException(
            status_code=400,
            detail="Maximum batch size is 1000 instances."
        )

    try:
        rows = [
            validate_and_prepare(instance).iloc[0].to_dict()
            for instance in request.instances
        ]

        input_df = pd.DataFrame(rows, columns=FEATURES)
        predictions = np.clip(model.predict(input_df), 0.0, 1.0)

        results = [
            {
                "flood_probability": round(float(p), 6),
                "flood_probability_percent": round(float(p * 100), 2)
            }
            for p in predictions
        ]

        return {
            "success": True,
            "count": len(results),
            "predictions": results,
            "model": metadata["model_name"]
        }

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


FEATURE_GROUPS = {
    "climate_rain": [
        "MonsoonIntensity",
        "ClimateChange",
        "TopographyDrainage",
        "Landslides"
    ],
    "water_management": [
        "RiverManagement",
        "DamsQuality",
        "DrainageSystems",
        "Siltation",
        "Watersheds"
    ],
    "land_people": [
        "Deforestation",
        "Urbanization",
        "AgriculturalPractices",
        "Encroachments",
        "WetlandLoss",
        "PopulationScore",
        "CoastalVulnerability"
    ],
    "preparedness_planning": [
        "IneffectiveDisasterPreparedness",
        "InadequatePlanning",
        "DeterioratingInfrastructure",
        "PoliticalFactors"
    ]
}


def estimate_features_from_coords(lat: float, lng: float):
    """
    Estimates 3 features based on approved Option 2 geographic heuristics.
    Remaining 17 features default to neutral dataset value 5.0 and are listed as assumed.
    """
    features = {f: 5.0 for f in FEATURES}
    assumed = list(FEATURES)
    estimated = []

    # 1. MonsoonIntensity (Monsoon/tropical latitude & longitude bands)
    if (-10.0 <= lat <= 30.0) and (60.0 <= lng <= 140.0):
        features["MonsoonIntensity"] = 8.0
        estimated.append("MonsoonIntensity")
        assumed.remove("MonsoonIntensity")
    elif -15.0 <= lat <= 20.0:
        features["MonsoonIntensity"] = 7.0
        estimated.append("MonsoonIntensity")
        assumed.remove("MonsoonIntensity")
    elif abs(lat) > 50.0:
        features["MonsoonIntensity"] = 3.0
        estimated.append("MonsoonIntensity")
        assumed.remove("MonsoonIntensity")

    # 2. CoastalVulnerability (Low-lying coastal & maritime regions vs continental interiors)
    is_coastal_region = (
        (24.0 <= lat <= 32.0 and -90.0 <= lng <= -75.0) or
        (50.0 <= lat <= 54.0 and 2.0 <= lng <= 7.0) or
        (-10.0 <= lat <= 20.0 and 95.0 <= lng <= 130.0) or
        (10.0 <= lat <= 25.0 and 70.0 <= lng <= 90.0) or
        (-35.0 <= lat <= -20.0 and 150.0 <= lng <= 155.0)
    )
    is_deep_inland = (
        (35.0 <= lat <= 50.0 and -105.0 <= lng <= -88.0) or
        (45.0 <= lat <= 60.0 and 40.0 <= lng <= 80.0)
    )
    if is_coastal_region:
        features["CoastalVulnerability"] = 8.0
        estimated.append("CoastalVulnerability")
        if "CoastalVulnerability" in assumed:
            assumed.remove("CoastalVulnerability")
    elif is_deep_inland:
        features["CoastalVulnerability"] = 2.0
        estimated.append("CoastalVulnerability")
        if "CoastalVulnerability" in assumed:
            assumed.remove("CoastalVulnerability")

    # 3. Landslides (Mountainous or steep relief corridors)
    is_mountainous = (
        (25.0 <= lat <= 38.0 and 70.0 <= lng <= 100.0) or
        (-55.0 <= lat <= 10.0 and -80.0 <= lng <= -65.0) or
        (43.0 <= lat <= 48.0 and 5.0 <= lng <= 16.0) or
        (32.0 <= lat <= 60.0 and -125.0 <= lng <= -105.0)
    )
    if is_mountainous:
        features["Landslides"] = 8.0
        estimated.append("Landslides")
        if "Landslides" in assumed:
            assumed.remove("Landslides")
    else:
        features["Landslides"] = 4.0
        estimated.append("Landslides")
        if "Landslides" in assumed:
            assumed.remove("Landslides")

    return features, assumed, estimated


@app.get("/area-data")
def get_area_data(lat: float, lng: float):
    if not (-90.0 <= lat <= 90.0 and -180.0 <= lng <= 180.0):
        raise HTTPException(
            status_code=400,
            detail="Latitude must be between -90 and 90, and longitude between -180 and 180."
        )

    features, assumed, estimated = estimate_features_from_coords(lat, lng)
    prediction_dict = make_prediction(features)
    prob = prediction_dict["flood_probability"]
    pct = prediction_dict["flood_probability_percent"]

    # Thresholds: low < 0.47, moderate 0.47 to 0.54, high > 0.54
    if prob < 0.47:
        risk_level = "Low"
    elif prob <= 0.54:
        risk_level = "Moderate"
    else:
        risk_level = "High"

    # Deterministic mock environmental sensor data
    seed = int((abs(lat) * 1000 + abs(lng) * 100)) % 10000
    mock_rain = round(15.0 + (seed % 140) * 0.8, 1)
    mock_soil = round(20.0 + (seed % 60) * 0.9, 1)
    mock_water = round(0.4 + (seed % 35) * 0.2, 1)

    group_values = {
        "climate_rain": round(sum(features[f] for f in FEATURE_GROUPS["climate_rain"]) / len(FEATURE_GROUPS["climate_rain"]), 1),
        "water_management": round(sum(features[f] for f in FEATURE_GROUPS["water_management"]) / len(FEATURE_GROUPS["water_management"]), 1),
        "land_people": round(sum(features[f] for f in FEATURE_GROUPS["land_people"]) / len(FEATURE_GROUPS["land_people"]), 1),
        "preparedness_planning": round(sum(features[f] for f in FEATURE_GROUPS["preparedness_planning"]) / len(FEATURE_GROUPS["preparedness_planning"]), 1),
    }

    return {
        "location": {"lat": lat, "lng": lng},
        "features": features,
        "assumed": assumed,
        "estimated": estimated,
        "risk": {
            "flood_probability": prob,
            "flood_probability_percent": pct,
            "level": risk_level,
            "thresholds": {"low": "< 0.47", "moderate": "0.47 - 0.54", "high": "> 0.54"}
        },
        "group_values": group_values,
        "mock_data": {
            "rainfall_mm": mock_rain,
            "soil_moisture_pct": mock_soil,
            "water_body_proximity_km": mock_water,
            "label": "Mock data"
        },
        "disclaimer": "Estimate from a statistical model trained on a score-based dataset. Not an official flood warning."
    }

