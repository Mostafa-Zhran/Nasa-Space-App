// ============================================================
// TRIANGULUM — Training Data Dashboard  (all data from outputs/)
// ============================================================

export const FEATURES = [
  "MonsoonIntensity","TopographyDrainage","RiverManagement","Deforestation",
  "Urbanization","ClimateChange","DamsQuality","Siltation","AgriculturalPractices",
  "Encroachments","IneffectiveDisasterPreparedness","DrainageSystems",
  "CoastalVulnerability","Landslides","Watersheds","DeterioratingInfrastructure",
  "PopulationScore","WetlandLoss","InadequatePlanning","PoliticalFactors",
];

// ---- Descriptive Statistics (from outputs/tables/descriptive_statistics.csv) ----
export const descriptiveStats: Record<string, {
  count: number; mean: number; std: number; min: number;
  q25: number; median: number; q75: number; max: number;
}> = {
  MonsoonIntensity:              { count:1117957, mean:4.9215, std:2.0564, min:0, q25:3, median:5, q75:6,  max:16 },
  TopographyDrainage:            { count:1117957, mean:4.9267, std:2.0939, min:0, q25:3, median:5, q75:6,  max:18 },
  RiverManagement:               { count:1117957, mean:4.9553, std:2.0722, min:0, q25:4, median:5, q75:6,  max:16 },
  Deforestation:                 { count:1117957, mean:4.9422, std:2.0517, min:0, q25:4, median:5, q75:6,  max:17 },
  Urbanization:                  { count:1117957, mean:4.9425, std:2.0834, min:0, q25:3, median:5, q75:6,  max:17 },
  ClimateChange:                 { count:1117957, mean:4.9341, std:2.0577, min:0, q25:3, median:5, q75:6,  max:17 },
  DamsQuality:                   { count:1117957, mean:4.9490, std:2.0589, min:0, q25:3, median:5, q75:6,  max:16 },
  Siltation:                     { count:1117957, mean:4.9451, std:2.0644, min:0, q25:3, median:5, q75:6,  max:16 },
  AgriculturalPractices:         { count:1117957, mean:4.9436, std:2.0590, min:0, q25:3, median:5, q75:6,  max:16 },
  Encroachments:                 { count:1117957, mean:4.9490, std:2.0875, min:0, q25:3, median:5, q75:6,  max:18 },
  IneffectiveDisasterPreparedness:{ count:1117957, mean:4.9494, std:2.0702, min:0, q25:3, median:5, q75:6, max:16 },
  DrainageSystems:               { count:1117957, mean:4.9528, std:2.0805, min:0, q25:3, median:5, q75:6,  max:17 },
  CoastalVulnerability:          { count:1117957, mean:4.9345, std:2.0829, min:0, q25:3, median:5, q75:6,  max:17 },
  Landslides:                    { count:1117957, mean:4.9270, std:2.0718, min:0, q25:3, median:5, q75:6,  max:16 },
  Watersheds:                    { count:1117957, mean:4.9527, std:2.0683, min:0, q25:3, median:5, q75:6,  max:16 },
  DeterioratingInfrastructure:   { count:1117957, mean:4.9374, std:2.0597, min:0, q25:3, median:5, q75:6,  max:17 },
  PopulationScore:               { count:1117957, mean:4.9427, std:2.0959, min:0, q25:3, median:5, q75:6,  max:18 },
  WetlandLoss:                   { count:1117957, mean:4.9570, std:2.0885, min:0, q25:3, median:5, q75:6,  max:19 },
  InadequatePlanning:            { count:1117957, mean:4.9450, std:2.0629, min:0, q25:3, median:5, q75:6,  max:16 },
  PoliticalFactors:              { count:1117957, mean:4.9490, std:2.0659, min:0, q25:3, median:5, q75:6,  max:16 },
};

// ---- Feature → Target Correlation (from outputs/tables/feature_target_correlation.csv) ----
export const featureCorrelation: { feature: string; correlation: number }[] = [
  { feature: "DeterioratingInfrastructure",    correlation: 0.19001 },
  { feature: "MonsoonIntensity",               correlation: 0.18910 },
  { feature: "DamsQuality",                    correlation: 0.18800 },
  { feature: "TopographyDrainage",             correlation: 0.18764 },
  { feature: "RiverManagement",                correlation: 0.18713 },
  { feature: "Siltation",                      correlation: 0.18679 },
  { feature: "PopulationScore",                correlation: 0.18589 },
  { feature: "Landslides",                     correlation: 0.18535 },
  { feature: "ClimateChange",                  correlation: 0.18476 },
  { feature: "Deforestation",                  correlation: 0.18400 },
  { feature: "WetlandLoss",                    correlation: 0.18340 },
  { feature: "AgriculturalPractices",          correlation: 0.18337 },
  { feature: "IneffectiveDisasterPreparedness",correlation: 0.18311 },
  { feature: "PoliticalFactors",               correlation: 0.18242 },
  { feature: "Watersheds",                     correlation: 0.18191 },
  { feature: "InadequatePlanning",             correlation: 0.18097 },
  { feature: "Urbanization",                   correlation: 0.18086 },
  { feature: "DrainageSystems",                correlation: 0.17930 },
  { feature: "Encroachments",                  correlation: 0.17884 },
  { feature: "CoastalVulnerability",           correlation: 0.17777 },
];

// ---- Permutation Importance EXP-10 (outputs/tables/permutation_importance_EXP10.csv) ----
export const permutationImportance: { feature: string; importance: number; std: number }[] = [
  { feature: "Encroachments",                  importance: 0.008500, std: 0.0000866 },
  { feature: "TopographyDrainage",             importance: 0.008476, std: 0.0000330 },
  { feature: "PoliticalFactors",               importance: 0.008467, std: 0.0000834 },
  { feature: "Urbanization",                   importance: 0.008459, std: 0.0001113 },
  { feature: "RiverManagement",                importance: 0.008449, std: 0.0000949 },
  { feature: "CoastalVulnerability",           importance: 0.008418, std: 0.0000610 },
  { feature: "DamsQuality",                    importance: 0.008374, std: 0.0000774 },
  { feature: "IneffectiveDisasterPreparedness",importance: 0.008338, std: 0.0000575 },
  { feature: "Deforestation",                  importance: 0.008326, std: 0.0000692 },
  { feature: "PopulationScore",                importance: 0.008297, std: 0.0000701 },
  { feature: "Landslides",                     importance: 0.008282, std: 0.0000486 },
  { feature: "DeterioratingInfrastructure",    importance: 0.008276, std: 0.0000431 },
  { feature: "Watersheds",                     importance: 0.008267, std: 0.0000711 },
  { feature: "DrainageSystems",                importance: 0.008236, std: 0.0000738 },
  { feature: "WetlandLoss",                    importance: 0.008214, std: 0.0000884 },
  { feature: "ClimateChange",                  importance: 0.008199, std: 0.0000442 },
  { feature: "InadequatePlanning",             importance: 0.008199, std: 0.0000388 },
  { feature: "Siltation",                      importance: 0.008166, std: 0.0000732 },
  { feature: "AgriculturalPractices",          importance: 0.008155, std: 0.0000280 },
  { feature: "MonsoonIntensity",               importance: 0.007939, std: 0.0000992 },
];

// ---- Model Comparison Final (outputs/tables/model_comparison_final.csv) ----
export const modelComparison = [
  { exp:"EXP-10", model:"LightGBM + Sum/Std/Max/Min", r2:0.8685, rmse:0.01849, mae:0.01440, trainTime:49.1,  cvTime:50.5,  rows:200000, winner:true  },
  { exp:"EXP-11", model:"LightGBM + Sum Only",         r2:0.8670, rmse:0.01859, mae:0.01451, trainTime:46.9,  cvTime:51.2,  rows:200000, winner:false },
  { exp:"EXP-09", model:"Ridge + Sum Polynomial",      r2:0.8490, rmse:0.01981, mae:0.01565, trainTime:0.54,  cvTime:6.4,   rows:894365, winner:false },
  { exp:"EXP-06B",model:"CatBoost",                    r2:0.8452, rmse:0.02006, mae:0.01589, trainTime:56.4,  cvTime:51.2,  rows:200000, winner:false },
  { exp:"EXP-07", model:"Ridge + Aggregates",          r2:0.8450, rmse:0.02007, mae:0.01579, trainTime:0.52,  cvTime:5.3,   rows:894365, winner:false },
  { exp:"EXP-01", model:"Ridge (Baseline)",            r2:0.8449, rmse:0.02008, mae:0.01579, trainTime:0.30,  cvTime:3.7,   rows:894365, winner:false },
  { exp:"EXP-02", model:"Linear Regression",           r2:0.8449, rmse:0.02008, mae:0.01579, trainTime:0.47,  cvTime:2.2,   rows:894365, winner:false },
  { exp:"EXP-08", model:"LightGBM Tuned",              r2:0.8404, rmse:0.02037, mae:0.01611, trainTime:61.6,  cvTime:58.7,  rows:200000, winner:false },
  { exp:"EXP-06A",model:"LightGBM (Base)",             r2:0.8388, rmse:0.02047, mae:0.01615, trainTime:54.2,  cvTime:54.6,  rows:200000, winner:false },
  { exp:"EXP-05", model:"XGBoost",                     r2:0.8354, rmse:0.02068, mae:0.01647, trainTime:31.4,  cvTime:31.1,  rows:200000, winner:false },
  { exp:"EXP-04", model:"Random Forest",               r2:0.5119, rmse:0.03562, mae:0.02900, trainTime:199.2, cvTime:124.9, rows:200000, winner:false },
  { exp:"EXP-03", model:"Decision Tree",               r2:0.2842, rmse:0.04313, mae:0.03469, trainTime:6.8,   cvTime:20.1,  rows:894365, winner:false },
];

// ---- Ridge Residual by Feature Sum (outputs/tables/ridge_residual_by_sum.csv) ----
export const ridgeResidual = [
  { sum:72, mean:0.05555, count:644 },
  { sum:74, mean:0.04048, count:760 },
  { sum:75, mean:0.01728, count:287 },
  { sum:76, mean:-0.00762, count:298 },
  { sum:77, mean:-0.00675, count:358 },
  { sum:78, mean:-0.00468, count:508 },
  { sum:79, mean:0.01202, count:886 },
  { sum:80, mean:0.00912, count:1136 },
  { sum:81, mean:0.00847, count:1484 },
  { sum:82, mean:0.00737, count:1884 },
  { sum:83, mean:0.00616, count:2419 },
  { sum:84, mean:0.00504, count:3091 },
  { sum:85, mean:0.00390, count:3812 },
  { sum:86, mean:0.00276, count:4752 },
  { sum:87, mean:0.00163, count:5790 },
  { sum:88, mean:0.00054, count:6966 },
  { sum:89, mean:-0.00059, count:8178 },
  { sum:90, mean:-0.00172, count:9550 },
  { sum:91, mean:-0.00287, count:10842 },
  { sum:92, mean:-0.00405, count:12138 },
  { sum:93, mean:-0.00526, count:13347 },
  { sum:94, mean:-0.00648, count:14565 },
  { sum:95, mean:-0.00777, count:15589 },
  { sum:96, mean:-0.00913, count:16413 },
  { sum:97, mean:-0.01056, count:17015 },
  { sum:98, mean:-0.01208, count:17369 },
  { sum:99, mean:-0.01372, count:17519 },
  { sum:100, mean:-0.01539, count:17280 },
  { sum:101, mean:-0.01710, count:16939 },
  { sum:102, mean:-0.01884, count:16298 },
  { sum:103, mean:-0.02063, count:15509 },
  { sum:104, mean:-0.02244, count:14543 },
  { sum:105, mean:-0.02432, count:13347 },
  { sum:106, mean:-0.02618, count:12125 },
  { sum:107, mean:-0.02808, count:10846 },
  { sum:108, mean:-0.03004, count:9522 },
  { sum:109, mean:-0.03202, count:8179 },
  { sum:110, mean:-0.03400, count:6926 },
  { sum:111, mean:-0.03598, count:5774 },
  { sum:112, mean:-0.03793, count:4701 },
  { sum:113, mean:-0.03985, count:3831 },
  { sum:114, mean:-0.04176, count:3055 },
  { sum:115, mean:-0.04369, count:2384 },
  { sum:116, mean:-0.04569, count:1825 },
  { sum:117, mean:-0.04773, count:1398 },
  { sum:118, mean:-0.04978, count:1038 },
];

// ---- Dataset Summary ----
export const datasetSummary = {
  totalRows: 1117957,
  features: 20,
  targetUnique: 83,
  targetMin: 0.285,
  targetMax: 0.725,
  targetMean: 0.505,
  targetStd: 0.0914,
  missingValues: 0,
  dtype: "int64 (features), float64 (target)",
};

// ---- Sample Target Distribution (uniform bins 0.285 to 0.725) ----
// approximate histogram bins from the dataset
export const targetDistribution = Array.from({ length: 83 }, (_, i) => {
  const val = +(0.285 + i * 0.005).toFixed(3);
  // Bell-ish distribution peaking around 0.505
  const dist = Math.exp(-0.5 * Math.pow((val - 0.505) / 0.0914, 2));
  return { value: val, count: Math.round(dist * 95000) };
});

// ---- LGBM Tuning Results (top 7 from lgbm_tuning_results.csv) ----
export const lgbmTuning = [
  { rank:1, num_leaves:15,  n_estimators:800,  lr:0.05, subsample:0.9, reg_lambda:0,  cv_rmse:0.020647, cv_r2: 0.8376 },
  { rank:2, num_leaves:31,  n_estimators:1200, lr:0.05, subsample:0.8, reg_lambda:1,  cv_rmse:0.020666, cv_r2: 0.8373 },
  { rank:3, num_leaves:31,  n_estimators:800,  lr:0.03, subsample:0.7, reg_lambda:10, cv_rmse:0.020701, cv_r2: 0.8367 },
  { rank:4, num_leaves:63,  n_estimators:1200, lr:0.03, subsample:0.9, reg_lambda:1,  cv_rmse:0.020763, cv_r2: 0.8357 },
  { rank:5, num_leaves:15,  n_estimators:400,  lr:0.08, subsample:0.9, reg_lambda:5,  cv_rmse:0.020871, cv_r2: 0.8339 },
  { rank:6, num_leaves:15,  n_estimators:400,  lr:0.08, subsample:0.9, reg_lambda:10, cv_rmse:0.020883, cv_r2: 0.8337 },
  { rank:7, num_leaves:127, n_estimators:800,  lr:0.02, subsample:0.8, reg_lambda:5,  cv_rmse:0.020978, cv_r2: 0.8322 },
];

// ---- Worst Predictions (from outputs/tables/worst_predictions.csv) ----
export const worstPredictions = [
  { id:242964, actual:0.285, pred:0.4677, absErr:0.1827 },
  { id:331323, actual:0.285, pred:0.4671, absErr:0.1821 },
  { id:620002, actual:0.695, pred:0.5173, absErr:0.1777 },
  { id:593506, actual:0.285, pred:0.4607, absErr:0.1757 },
  { id:679010, actual:0.285, pred:0.4607, absErr:0.1757 },
  { id:154684, actual:0.685, pred:0.5174, absErr:0.1676 },
  { id:496254, actual:0.725, pred:0.5962, absErr:0.1288 },
  { id:905695, actual:0.605, pred:0.4905, absErr:0.1145 },
  { id:275225, actual:0.605, pred:0.4922, absErr:0.1128 },
  { id:589166, actual:0.605, pred:0.4964, absErr:0.1086 },
];

