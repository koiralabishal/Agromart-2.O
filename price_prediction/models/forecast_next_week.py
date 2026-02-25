import pandas as pd
import numpy as np
import joblib
import matplotlib.pyplot as plt
import sys
from datetime import timedelta

# CONFIG
MODEL_PATH = "xgboost_price_model.pkl"
FEATURES_PATH = "model_features.pkl"
DATA_PATH = "../data/final_training_data_1.csv"
OUTPUT_PATH = "../data/predicted_price/next_7_days_forecast.csv"
FORECAST_DAYS = 7

# 1. INPUT: VEGETABLE NAME
if len(sys.argv) < 2:
    print("Usage: python forecast_next_week.py <vegetable_name>")
    sys.exit(1)

VEGETABLE_NAME = sys.argv[1]
VEG_COL = f"vegetable_{VEGETABLE_NAME}"

# 2. LOAD MODEL + FEATURES
model = joblib.load(MODEL_PATH)
model_features = joblib.load(FEATURES_PATH)

print("Model loaded")

# 3. LOAD DATA
df = pd.read_csv(DATA_PATH)
df["date"] = pd.to_datetime(df["date"])

if VEG_COL not in df.columns:
    raise ValueError(f"Vegetable '{VEGETABLE_NAME}' not found in dataset")

# Filter for one vegetable
df = df[df[VEG_COL] == 1].sort_values("date")

# Need at least 14 days
if len(df) < 14:
    raise ValueError("Not enough data (need at least 14 days)")

history = df.tail(30).copy()
print(f"Using {len(history)} days of history")

# 4. FEATURE CREATION FUNCTION
def create_features(history_df, next_date):
    row = {}

    # Lag features
    row["avg_price_lag_1"] = history_df["avg_price"].iloc[-1]
    row["avg_price_lag_3"] = history_df["avg_price"].iloc[-3]
    row["avg_price_lag_7"] = history_df["avg_price"].iloc[-7]
    row["avg_price_lag_14"] = history_df["avg_price"].iloc[-14]
    row["avg_price_7d_mean"] = history_df["avg_price"].iloc[-7:].mean()

    # Calendar features
    row["month"] = next_date.month
    row["day_of_week"] = next_date.dayofweek
    row["is_monsoon"] = int(next_date.month in [6,7,8,9])

    # External assumptions
    row["rainfall_mm"] = history_df["rainfall_mm"].iloc[-1]
    row["festival_flag"] = 0

    # Vegetable one-hot
    for col in model_features:
        if col.startswith("vegetable_"):
            row[col] = 1 if col == VEG_COL else 0

    return row

# 5. RECURSIVE FORECASTING
future = []
current_history = history.copy()
last_date = current_history["date"].iloc[-1]

for i in range(FORECAST_DAYS):
    next_date = last_date + timedelta(days=1)
    features = create_features(current_history, next_date)

    X = pd.DataFrame([features])

    # Align features
    for col in model_features:
        if col not in X.columns:
            X[col] = 0

    X = X[model_features]

    pred = model.predict(X)[0]

    future.append({
        "date": next_date,
        "vegetable": VEGETABLE_NAME,
        "predicted_price": round(pred, 2)
    })

    # Add prediction back for next step
    current_history = pd.concat([
        current_history,
        pd.DataFrame([{
            "date": next_date,
            "avg_price": pred,
            "rainfall_mm": features["rainfall_mm"]
        }])
    ], ignore_index=True)

    last_date = next_date

# 6. SAVE OUTPUT
forecast_df = pd.DataFrame(future)
forecast_df.to_csv(OUTPUT_PATH, index=False)

print("Forecast saved to:", OUTPUT_PATH)
print(forecast_df)

# 7. PLOT
plt.figure(figsize=(10,5))
plt.plot(forecast_df["date"], forecast_df["predicted_price"], marker="o")
plt.title(f"Next 7 Days Price Forecast – {VEGETABLE_NAME}")
plt.xlabel("Date")
plt.ylabel("Predicted Price")
plt.grid(True)
plt.show()