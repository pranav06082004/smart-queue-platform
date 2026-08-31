from pydantic import BaseModel

class PredictRequest(BaseModel):
    queueId: str
    peopleAhead: int
    activeCounters: int
    serviceType: str
    timeOfDay: int
    dayOfWeek: int

class PredictResponse(BaseModel):
    predictedWaitMinutes: float
    confidence: float
    model: str