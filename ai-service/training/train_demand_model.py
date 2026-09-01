import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.metrics import accuracy_score, classification_report
from sklearn.dummy import DummyClassifier
import joblib

df = pd.read_csv("data/demand_history.csv")

X = df[["timeOfDay", "dayOfWeek", "serviceType"]]
y = df["demandLevel"]

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=7, stratify=y)

# --- Baseline: always predict the most frequent class ---
baseline = DummyClassifier(strategy="most_frequent")
baseline.fit(X_train, y_train)
baseline_acc = accuracy_score(y_test, baseline.predict(X_test))

# --- Real model: Random Forest Classifier ---
preprocessor = ColumnTransformer(
    transformers=[("service_type", OneHotEncoder(), ["serviceType"])],
    remainder="passthrough",
)
model = Pipeline(steps=[
    ("preprocess", preprocessor),
    ("classifier", RandomForestClassifier(n_estimators=100, random_state=7)),
])
model.fit(X_train, y_train)
ml_pred = model.predict(X_test)
ml_acc = accuracy_score(y_test, ml_pred)

print(f"=== Baseline (most frequent class) ===\nAccuracy: {baseline_acc:.2%}")
print(f"\n=== ML Model (Random Forest) ===\nAccuracy: {ml_acc:.2%}")
print("\nDetailed report:")
print(classification_report(y_test, ml_pred))

improvement = (ml_acc - baseline_acc) * 100
print(f"Improvement over baseline: {improvement:.1f} percentage points")

joblib.dump(model, "models/demand_model.pkl")
print("Model saved to models/demand_model.pkl")