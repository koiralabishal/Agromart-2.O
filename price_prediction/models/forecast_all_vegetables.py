# import pandas as pd
# import numpy as np
# import joblib
# import matplotlib.pyplot as plt
# from datetime import timedelta
# import os

# # =====================
# # CONFIG
# # =====================
# MODEL_PATH = "xgboost_price_model.pkl"
# FEATURES_PATH = "model_features.pkl"
# DATA_PATH = "../data/final_training_data_1.csv"
# OUTPUT_PATH = "../data/forecasts/next_7_days_forecast.csv"
# PLOTS_DIR = "../plots/"

# FORECAST_DAYS = 7
# HISTORY_DAYS = 14   # You can reduce if many veggies have short history
# MIN_HISTORY = 7     # Minimum rows to forecast

# # Ensure plots directory exists
# os.makedirs(PLOTS_DIR, exist_ok=True)

# # =====================
# # LOAD MODEL
# # =====================
# model = joblib.load(MODEL_PATH)
# model_features = joblib.load(FEATURES_PATH)

# df = pd.read_csv(DATA_PATH)
# df["date"] = pd.to_datetime(df["date"])
# df.drop(columns=["unit"], errors="ignore", inplace=True)

# vegetable_cols = [c for c in df.columns if c.startswith("vegetable_")]
# print(f"Loaded {len(vegetable_cols)} vegetables")

# # =====================
# # FEATURE BUILDER
# # =====================
# def build_features(history, next_date, veg_col):
#     row = {}
#     prices = history["avg_price"].values

#     # ---- PRICE LAGS (safe for short history) ----
#     row["avg_price_lag_1"] = prices[-1] if len(prices) >= 1 else np.nan
#     row["avg_price_lag_3"] = prices[-3] if len(prices) >= 3 else prices[0] if len(prices) > 0 else np.nan
#     row["avg_price_lag_7"] = prices[-7] if len(prices) >= 7 else prices[0] if len(prices) > 0 else np.nan
#     row["avg_price_lag_14"] = prices[-14] if len(prices) >= 14 else prices[0] if len(prices) > 0 else np.nan
#     row["avg_price_7d_mean"] = history["avg_price"].tail(7).mean() if len(prices) > 0 else np.nan

#     # ---- PRICE RANGE ----
#     row["min_price"] = history["min_price"].tail(7).mean() if len(history) > 0 else np.nan
#     row["max_price"] = history["max_price"].tail(7).mean() if len(history) > 0 else np.nan

#     # ---- CALENDAR ----
#     row["month"] = next_date.month
#     row["day_of_week"] = next_date.dayofweek
#     row["is_monsoon"] = int(next_date.month in [6,7,8,9])

#     # ---- EXTERNAL ----
#     row["rainfall_mm"] = history["rainfall_mm"].tail(7).mean() if len(history) > 0 else 0
#     row["festival_flag"] = 0

#     # ---- ONE HOT VEGETABLE ----
#     for c in vegetable_cols:
#         row[c] = 1 if c == veg_col else 0

#     return row

# # =====================
# # FORECAST
# # =====================
# results = []

# for veg_col in vegetable_cols:
#     veg_name = veg_col.replace("vegetable_", "")
#     veg_df = df[df[veg_col] == 1].sort_values("date")

#     history = veg_df.tail(HISTORY_DAYS).copy()
#     if len(history) < MIN_HISTORY:
#         print(f"Skipping {veg_name}, not enough history ({len(history)} rows)")
#         continue

#     last_date = history["date"].iloc[-1]

#     print(f"Forecasting {veg_name}")

#     for _ in range(FORECAST_DAYS):
#         next_date = last_date + timedelta(days=1)
#         features = build_features(history, next_date, veg_col)

#         X = pd.DataFrame([features])
#         # Ensure all model features exist
#         for col in model_features:
#             if col not in X:
#                 X[col] = 0
#         X = X[model_features]

#         pred = float(model.predict(X)[0])

#         results.append({
#             "date": next_date,
#             "vegetable": veg_name,
#             "predicted_price": round(pred, 2)
#         })

#         # ---- STABILIZED HISTORY UPDATE ----
#         new_row = history.iloc[-1].copy()
#         new_row["date"] = next_date
#         new_row["avg_price"] = pred
#         history = pd.concat([history, pd.DataFrame([new_row])], ignore_index=True)

#         last_date = next_date

# # =====================
# # SAVE FORECAST
# # =====================
# print("Number of forecast entries:", len(results))
# if not results:
#     raise ValueError("No forecasts were generated. Check your history data or MIN_HISTORY setting.")

# forecast_df = pd.DataFrame(results)
# forecast_df.to_csv(OUTPUT_PATH, index=False)
# print("Saved forecast to", OUTPUT_PATH)

# # =====================
# # PLOT
# # =====================
# for veg in forecast_df["vegetable"].unique():
#     veg_col_name = f"vegetable_{veg}"
#     if veg_col_name not in df.columns:
#         print(f"⚠️ Column {veg_col_name} missing in historical data. Skipping plot.")
#         continue

#     hist = df[df[veg_col_name] == 1].tail(60)
#     fut = forecast_df[forecast_df["vegetable"] == veg]

#     plt.figure(figsize=(10,5))
#     plt.plot(hist["date"], hist["avg_price"], label="Historical", linewidth=2)
#     plt.plot(fut["date"], fut["predicted_price"], "o--", label="Forecast")
#     plt.title(f"{veg} – Price Forecast")
#     plt.xlabel("Date")
#     plt.ylabel("Price")
#     plt.legend()
#     plt.grid(True)
#     plt.tight_layout()
#     plt.savefig(f"{PLOTS_DIR}/{veg}_forecast.png")
#     plt.close()

# print("📊 Forecast plots saved in", PLOTS_DIR)





# import pandas as pd
# import numpy as np
# import joblib
# import matplotlib.pyplot as plt
# from datetime import timedelta, datetime
# import os

# # =====================
# # CONFIG
# # =====================
# MODEL_PATH = "xgboost_price_model.pkl"
# FEATURES_PATH = "model_features.pkl"
# DATA_PATH = "../data/final_training_data_1.csv"
# OUTPUT_PATH = "../data/forecasts/next_7_days_forecast.csv"
# PLOTS_DIR = "../plots/"

# FORECAST_BLOCK_DAYS = 7   # Number of days per forecasting block
# HISTORY_DAYS = 14         # Days of historical data to use
# MIN_HISTORY = 7           # Minimum rows needed to forecast

# # Ensure plots directory exists
# os.makedirs(PLOTS_DIR, exist_ok=True)

# # =====================
# # LOAD MODEL
# # =====================
# model = joblib.load(MODEL_PATH)
# model_features = joblib.load(FEATURES_PATH)

# df = pd.read_csv(DATA_PATH)
# df["date"] = pd.to_datetime(df["date"])
# df.drop(columns=["unit"], errors="ignore", inplace=True)

# vegetable_cols = [c for c in df.columns if c.startswith("vegetable_")]
# print(f"Loaded {len(vegetable_cols)} vegetables")

# # =====================
# # FEATURE BUILDER
# # =====================
# def build_features(history, next_date, veg_col):
#     row = {}
#     prices = history["avg_price"].values

#     # Safe lag handling
#     row["avg_price_lag_1"] = prices[-1] if len(prices) >= 1 else np.nan
#     row["avg_price_lag_3"] = prices[-3] if len(prices) >= 3 else prices[0] if len(prices) > 0 else np.nan
#     row["avg_price_lag_7"] = prices[-7] if len(prices) >= 7 else prices[0] if len(prices) > 0 else np.nan
#     row["avg_price_lag_14"] = prices[-14] if len(prices) >= 14 else prices[0] if len(prices) > 0 else np.nan
#     row["avg_price_7d_mean"] = history["avg_price"].tail(7).mean() if len(prices) > 0 else np.nan

#     # Price range
#     row["min_price"] = history["min_price"].tail(7).mean() if len(history) > 0 else np.nan
#     row["max_price"] = history["max_price"].tail(7).mean() if len(history) > 0 else np.nan

#     # Calendar
#     row["month"] = next_date.month
#     row["day_of_week"] = next_date.dayofweek
#     row["is_monsoon"] = int(next_date.month in [6,7,8,9])

#     # External
#     row["rainfall_mm"] = history["rainfall_mm"].tail(7).mean() if len(history) > 0 else 0
#     row["festival_flag"] = 0

#     # One-hot vegetable
#     for c in vegetable_cols:
#         row[c] = 1 if c == veg_col else 0

#     return row

# # =====================
# # FORECAST FUNCTION
# # =====================
# def forecast_vegetable(veg_col, history, forecast_days=FORECAST_BLOCK_DAYS):
#     """Forecast rolling days using previously predicted prices."""
#     veg_name = veg_col.replace("vegetable_", "")
#     last_date = history["date"].iloc[-1]
#     results = []

#     for _ in range(forecast_days):
#         next_date = last_date + timedelta(days=1)
#         features = build_features(history, next_date, veg_col)

#         X = pd.DataFrame([features])
#         for col in model_features:
#             if col not in X:
#                 X[col] = 0
#         X = X[model_features]

#         pred = float(model.predict(X)[0])

#         results.append({
#             "date": next_date,
#             "vegetable": veg_name,
#             "predicted_price": round(pred, 2)
#         })

#         # Add prediction to history for next iteration
#         new_row = history.iloc[-1].copy()
#         new_row["date"] = next_date
#         new_row["avg_price"] = pred
#         history = pd.concat([history, pd.DataFrame([new_row])], ignore_index=True)

#         last_date = next_date

#     return pd.DataFrame(results), history

# # =====================
# # MAIN FORECAST LOOP
# # =====================
# results_all = []
# today = datetime.today()
# print("Today is:", today.date())

# for veg_col in vegetable_cols:
#     veg_name = veg_col.replace("vegetable_", "")
#     veg_df = df[df[veg_col] == 1].sort_values("date")

#     history = veg_df.tail(HISTORY_DAYS).copy()
#     if len(history) < MIN_HISTORY:
#         print(f"Skipping {veg_name}, not enough history ({len(history)} rows)")
#         continue

#     # Set last_date as today for forecasting
#     if history["date"].max() < today:
#         # Add a "dummy row" for today if last historical date < today
#         last_row = history.iloc[-1].copy()
#         last_row["date"] = today
#         history = pd.concat([history, pd.DataFrame([last_row])], ignore_index=True)

#     print(f"Forecasting next {FORECAST_BLOCK_DAYS} days for {veg_name}")
#     forecast_df, history = forecast_vegetable(veg_col, history, forecast_days=FORECAST_BLOCK_DAYS)
#     results_all.append(forecast_df)

# # Combine all forecasts
# forecast_df = pd.concat(results_all, ignore_index=True)
# forecast_df.to_csv(OUTPUT_PATH, index=False)
# print("Saved forecast to", OUTPUT_PATH)

# # =====================
# # PLOTS
# # =====================
# for veg in forecast_df["vegetable"].unique():
#     veg_col_name = f"vegetable_{veg}"
#     if veg_col_name not in df.columns:
#         continue
#     hist = df[df[veg_col_name] == 1].tail(60)
#     fut = forecast_df[forecast_df["vegetable"] == veg]

#     plt.figure(figsize=(10,5))
#     plt.plot(hist["date"], hist["avg_price"], label="Historical", linewidth=2)
#     plt.plot(fut["date"], fut["predicted_price"], "o--", label="Forecast")
#     plt.title(f"{veg} – Price Forecast")
#     plt.xlabel("Date")
#     plt.ylabel("Price")
#     plt.legend()
#     plt.grid(True)
#     plt.tight_layout()
#     plt.savefig(f"{PLOTS_DIR}/{veg}_forecast.png")
#     plt.close()

# print("📊 Forecast plots saved in", PLOTS_DIR)




import pandas as pd
import numpy as np
import joblib
import matplotlib.pyplot as plt
from datetime import timedelta, datetime
import os

# =====================
# CONFIG
# =====================
MODEL_PATH = "xgboost_price_model.pkl"
FEATURES_PATH = "model_features.pkl"
DATA_PATH = "../data/final_training_data_1.csv"
FORECAST_CSV = "../data/forecasts/next_7_days_forecast.csv"
PLOTS_DIR = "../plots/"

FORECAST_DAYS = 7
HISTORY_DAYS = 14
MIN_HISTORY = 7

os.makedirs(PLOTS_DIR, exist_ok=True)

# =====================
# LOAD MODEL & DATA
# =====================
model = joblib.load(MODEL_PATH)
model_features = joblib.load(FEATURES_PATH)

df = pd.read_csv(DATA_PATH)
df["date"] = pd.to_datetime(df["date"])
df.drop(columns=["unit"], errors="ignore", inplace=True)

vegetable_cols = [c for c in df.columns if c.startswith("vegetable_")]
print(f"Loaded {len(vegetable_cols)} vegetables")

# =====================
# FEATURE BUILDER
# =====================
def build_features(history, next_date, veg_col):
    row = {}
    prices = history["avg_price"].values

    row["avg_price_lag_1"] = prices[-1] if len(prices) >= 1 else np.nan
    row["avg_price_lag_3"] = prices[-3] if len(prices) >= 3 else prices[0] if len(prices) > 0 else np.nan
    row["avg_price_lag_7"] = prices[-7] if len(prices) >= 7 else prices[0] if len(prices) > 0 else np.nan
    row["avg_price_lag_14"] = prices[-14] if len(prices) >= 14 else prices[0] if len(prices) > 0 else np.nan
    row["avg_price_7d_mean"] = history["avg_price"].tail(7).mean() if len(prices) > 0 else np.nan

    row["min_price"] = history["min_price"].tail(7).mean() if len(history) > 0 else np.nan
    row["max_price"] = history["max_price"].tail(7).mean() if len(history) > 0 else np.nan

    row["month"] = next_date.month
    row["day_of_week"] = next_date.dayofweek
    row["is_monsoon"] = int(next_date.month in [6,7,8,9])

    row["rainfall_mm"] = history["rainfall_mm"].tail(7).mean() if len(history) > 0 else 0
    row["festival_flag"] = 0

    for c in vegetable_cols:
        row[c] = 1 if c == veg_col else 0

    return row

# =====================
# FORECAST FUNCTION
# =====================
def forecast_vegetable(veg_col, history, start_date, forecast_days=FORECAST_DAYS):
    results = []
    last_date = history["date"].max()
    # If last_date < start_date, add last row with start_date
    if last_date < start_date:
        last_row = history.iloc[-1].copy()
        last_row["date"] = start_date - timedelta(days=1)
        history = pd.concat([history, pd.DataFrame([last_row])], ignore_index=True)
        last_date = history["date"].max()

    for _ in range(forecast_days):
        next_date = last_date + timedelta(days=1)
        features = build_features(history, next_date, veg_col)

        X = pd.DataFrame([features])
        for col in model_features:
            if col not in X:
                X[col] = 0
        X = X[model_features]

        pred = float(model.predict(X)[0])

        results.append({
            "date": next_date,
            "vegetable": veg_col.replace("vegetable_", ""),
            "predicted_price": round(pred, 2)
        })

        new_row = history.iloc[-1].copy()
        new_row["date"] = next_date
        new_row["avg_price"] = pred
        history = pd.concat([history, pd.DataFrame([new_row])], ignore_index=True)
        last_date = next_date

    return pd.DataFrame(results)

# =====================
# MAIN LOOP
# =====================
results_all = []
today = pd.Timestamp(datetime.today().date())
print("Forecasting 7 days starting from today:", today)

for veg_col in vegetable_cols:
    veg_name = veg_col.replace("vegetable_", "")
    veg_df = df[df[veg_col] == 1].sort_values("date")
    history = veg_df.tail(HISTORY_DAYS).copy()

    if len(history) < MIN_HISTORY:
        print(f"Skipping {veg_name}, not enough history ({len(history)} rows)")
        continue

    forecast_df = forecast_vegetable(veg_col, history, start_date=today, forecast_days=FORECAST_DAYS)
    results_all.append(forecast_df)

# Combine all forecasts
forecast_df = pd.concat(results_all, ignore_index=True)
forecast_df.to_csv(FORECAST_CSV, index=False)
print("Saved forecast to", FORECAST_CSV)

# =====================
# PLOTS
# =====================
for veg in forecast_df["vegetable"].unique():
    veg_col_name = f"vegetable_{veg}"
    if veg_col_name not in df.columns:
        continue
    hist = df[df[veg_col_name] == 1].tail(60)
    fut = forecast_df[forecast_df["vegetable"] == veg]

    plt.figure(figsize=(10,5))
    plt.plot(hist["date"], hist["avg_price"], label="Historical", linewidth=2)
    plt.plot(fut["date"], fut["predicted_price"], "o--", label="Forecast")
    plt.title(f"{veg} – Price Forecast")
    plt.xlabel("Date")
    plt.ylabel("Price")
    plt.legend()
    plt.grid(True)
    plt.tight_layout()
    plt.savefig(f"{PLOTS_DIR}/{veg}_forecast.png")
    plt.close()

print("📊 Forecast plots saved in", PLOTS_DIR)