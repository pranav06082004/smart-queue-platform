from pydantic import BaseModel

class DemandRequest(BaseModel):
    timeOfDay: int
    dayOfWeek: int
    serviceType: str

class DemandResponse(BaseModel):
    demandLevel: str
    confidence: float