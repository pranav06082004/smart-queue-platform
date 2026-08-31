import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.metrics import mean_absolute_error, mean_squared_error
import joblib

df = pd.read_csv("data/queue_history.csv")

X = df[["peopleAhead", "activeCounters", "serviceType", "timeOfDay", "dayOfWeek"]]
y = df["actualWaitMinutes"]

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# --- Baseline: naive average service time, ignoring all other features ---
baseline_pred = np.full(len(y_test), y_train.mean())
baseline_mae = mean_absolute_error(y_test, baseline_pred)
baseline_rmse = mean_squared_error(y_test, baseline_pred) ** 0.5

# --- Real model: Linear Regression with one-hot encoded serviceType ---
preprocessor = ColumnTransformer(
    transformers=[("service_type", OneHotEncoder(), ["serviceType"])],
    remainder="passthrough",
)
model = Pipeline(steps=[("preprocess", preprocessor), ("regressor", LinearRegression())])
model.fit(X_train, y_train)

ml_pred = model.predict(X_test)
ml_mae = mean_absolute_error(y_test, ml_pred)
ml_rmse = mean_squared_error(y_test, ml_pred) ** 0.5

print("=== Baseline (naive average) ===")
print(f"MAE:  {baseline_mae:.2f} minutes")
print(f"RMSE: {baseline_rmse:.2f} minutes")

print("\n=== ML Model (Linear Regression) ===")
print(f"MAE:  {ml_mae:.2f} minutes")
print(f"RMSE: {ml_rmse:.2f} minutes")

improvement = (1 - ml_mae / baseline_mae) * 100
print(f"\nImprovement over baseline: {improvement:.1f}%")

joblib.dump(model, "models/wait_time_model.pkl")
print("\nModel saved to models/wait_time_model.pkl")