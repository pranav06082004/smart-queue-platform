import joblib
import pandas as pd
import os

MODEL_PATH = os.path.join(os.path.dirname(__file__), "..", "models", "demand_model.pkl")
_model = None

def load_model():
    global _model
    if _model is None:
        _model = joblib.load(MODEL_PATH)
    return _model

def predict_demand(time_of_day: int, day_of_week: int, service_type: str):
    model = load_model()
    input_df = pd.DataFrame([{
        "timeOfDay": time_of_day,
        "dayOfWeek": day_of_week,
        "serviceType": service_type,
    }])
    prediction = model.predict(input_df)[0]
    probabilities = model.predict_proba(input_df)[0]
    confidence = round(float(max(probabilities)), 2)
    return prediction, confidence