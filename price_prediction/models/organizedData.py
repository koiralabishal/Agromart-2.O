import pandas as pd

# ==============================
# 1. READ CSV FILES
# ==============================

prices = pd.read_csv("../data/kalimati_prices_1.csv", parse_dates=["date"])
rain = pd.read_csv("../data/Pokhara_Rainfall_Data_1.csv", parse_dates=["date"])
holidays = pd.read_csv("../data/holiday_1.csv", parse_dates=["date"])

# ==============================
# 2. CLEAN COLUMN NAMES
# ==============================

prices.columns = prices.columns.str.strip().str.lower()
rain.columns = rain.columns.str.strip().str.lower()
holidays.columns = holidays.columns.str.strip().str.lower()

# ==============================
# 4. MERGE RAINFALL
# ==============================

df = prices.merge(rain, on="date", how="left")

# ==============================
# 5. ADD FESTIVAL FLAG
# ==============================

holidays["festival_flag"] = 1
df = df.merge(
    holidays[["date", "festival_flag"]],
    on="date",
    how="left"
)

# ==============================
# 6. FILL MISSING VALUES
# ==============================

df["festival_flag"] = df["festival_flag"].fillna(0)
df["rainfall_mm"] = df["rainfall_mm"].fillna(0)

# ==============================
# CLEAN PRICE COLUMNS
# ==============================

price_cols = ["min_price", "max_price", "avg_price"]

for col in price_cols:
    df[col] = (
        df[col]
        .astype(str)
        .str.replace("Rs", "", regex=False)
        .str.replace(",", "", regex=False)
        .str.strip()
    )
    df[col] = pd.to_numeric(df[col], errors="coerce")

# ==============================
# FEATURE ENGINEERING
# ==============================

# 1️⃣ Sort data (VERY IMPORTANT for time series)
df = df.sort_values(by=["vegetable", "date"])

# 2️⃣ Time-based features
df["month"] = df["date"].dt.month
df["day_of_week"] = df["date"].dt.weekday
df["is_monsoon"] = df["month"].isin([6, 7, 8, 9]).astype(int)

# 3️⃣ Lag features (historical price dependency)
for lag in [1, 3, 7, 14]:
    df[f"avg_price_lag_{lag}"] = (
        df.groupby("vegetable")["avg_price"]
        .shift(lag)
    )

# 4️⃣ Rolling price trend (weekly mean)
df["avg_price_7d_mean"] = (
    df.groupby("vegetable")["avg_price"]
    .rolling(7)
    .mean()
    .reset_index(level=0, drop=True)
)

# 5️⃣ Drop rows with NaN values (created by lag & rolling features)
df.dropna(inplace=True)

# 6️⃣ One-hot encode vegetable column (required for XGBoost)
df = pd.get_dummies(df, columns=["vegetable"])

# 7️⃣ Save final ML-ready dataset
df.to_csv("final_training_data.csv", index=False)

print("Feature engineering completed successfully!")
print("Output file: final_training_data.csv")
print("Final dataset shape:", df.shape)