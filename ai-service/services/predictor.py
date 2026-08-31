import joblib
import pandas as pd
import os

MODEL_PATH = os.path.join(os.path.dirname(__file__), "..", "models", "wait_time_model.pkl")

_model = None

def load_model():
    global _model
    if _model is None:
        _model = joblib.load(MODEL_PATH)
    return _model

def predict_wait_time(people_ahead: int, active_counters: int, service_type: str, time_of_day: int, day_of_week: int):
    model = load_model()

    input_df = pd.DataFrame([{
        "peopleAhead": people_ahead,
        "activeCounters": active_counters,
        "serviceType": service_type,
        "timeOfDay": time_of_day,
        "dayOfWeek": day_of_week,
    }])

    prediction = model.predict(input_df)[0]
    prediction = max(0, round(float(prediction), 1))

    # Simple, honest confidence heuristic: less confident with more people ahead
    # (more accumulated uncertainty) — not a statistically rigorous interval,
    # just a reasonable signal for the UI to show alongside the number.
    confidence = max(0.4, 1.0 - (people_ahead * 0.02))

    return prediction, round(confidence, 2)