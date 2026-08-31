from fastapi import FastAPI, HTTPException
from schemas.predict import PredictRequest, PredictResponse
from services.predictor import predict_wait_time

app = FastAPI(title="Smart Queue AI Service")

@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/predict/wait-time", response_model=PredictResponse)
def predict(req: PredictRequest):
    try:
        predicted, confidence = predict_wait_time(
            req.peopleAhead, req.activeCounters, req.serviceType, req.timeOfDay, req.dayOfWeek
        )
        return PredictResponse(predictedWaitMinutes=predicted, confidence=confidence, model="ml")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))