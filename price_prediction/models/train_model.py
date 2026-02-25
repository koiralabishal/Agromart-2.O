import pandas as pd
import xgboost as xgb
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
import numpy as np
import joblib

# 1. LOAD TRAINING DATA
df = pd.read_csv("../data/final_training_data.csv")

# 2. TRAIN / TEST SPLIT
df["date"] = pd.to_datetime(df["date"])

# Split using a date inside your data range
train = df[df["date"] < "2023-07-01"]  # all rows before July 2023
test  = df[df["date"] >= "2023-07-01"] # all rows from July 2023 onwards

X_train = train.drop(columns=["date", "avg_price", "unit"])
y_train = train["avg_price"]

X_test = test.drop(columns=["date", "avg_price", "unit"])
y_test = test["avg_price"]

print("Train samples:", len(X_train))
print("Test samples:", len(X_test))

# 3. TRAIN XGBOOST REGRESSOR
model = xgb.XGBRegressor(
    objective="reg:squarederror",
    n_estimators=300,
    learning_rate=0.05,
    max_depth=6,
    subsample=0.8,
    colsample_bytree=0.8,
    random_state=42
)

model.fit(X_train, y_train)


# 4. EVALUATION
preds = model.predict(X_test)

mae = mean_absolute_error(y_test, preds)
rmse = np.sqrt(mean_squared_error(y_test, preds))  # version-independent RMSE
r2  = r2_score(y_test, preds)

print("Model Evaluation")
print("MAE :", round(mae, 2))
print("RMSE:", round(rmse, 2))
print("R²  :", round(r2, 4))

# SAVE MODEL
joblib.dump(model, "xgboost_price_model.pkl")
print("Model saved as xgboost_price_model.pkl")


# Save feature names for future prediction
joblib.dump(list(X_train.columns), "model_features.pkl")
print("model_features.pkl saved")