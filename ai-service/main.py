"""
KRISHILINK AI Service - Demand Forecasting
Architecture ready for future ML model integration (Python/scikit-learn/OR-Tools)
"""
from datetime import datetime, timedelta
from typing import Optional
import numpy as np
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(
    title="KRISHILINK AI Service",
    description="Demand forecasting and ML-ready API for agricultural supply chain",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class ForecastRequest(BaseModel):
    product: str
    location: str
    historical_orders: Optional[list[dict]] = None
    weeks: int = 4


class ForecastResponse(BaseModel):
    product: str
    location: str
    current_weekly_demand: float
    predicted_demand: float
    expected_change_percent: float
    potential_shortage: float
    season: str
    is_estimate: bool = True
    disclaimer: str
    model: str


SEASONAL_FACTORS = {
    "Summer": 1.1,
    "Monsoon": 0.95,
    "Post-Monsoon": 1.15,
    "Winter": 1.05,
}

BASE_DEMAND = {
    "Tomato": {"Mumbai": 12500, "Pune": 8000, "Nashik": 6000, "Delhi": 15000},
    "Onion": {"Mumbai": 8000, "Pune": 5000, "Nashik": 7000, "Delhi": 12000},
    "Potato": {"Mumbai": 10000, "Pune": 6000, "Delhi": 15000, "Indore": 8000},
}


def get_season() -> str:
    month = datetime.now().month
    if 3 <= month <= 5:
        return "Summer"
    if 6 <= month <= 9:
        return "Monsoon"
    if 10 <= month <= 11:
        return "Post-Monsoon"
    return "Winter"


def simple_forecast(product: str, location: str, historical: Optional[list] = None) -> dict:
    """Simple statistical forecast - replace with trained ML model in production."""
    product_data = BASE_DEMAND.get(product, {})
    base = product_data.get(location, 10000)

    if historical and len(historical) > 0:
        quantities = [h.get("quantity", h.get("totalQuantity", base)) for h in historical]
        base = float(np.mean(quantities))

    season = get_season()
    seasonal_factor = SEASONAL_FACTORS.get(season, 1.0)
    trend_factor = 1.0 + np.random.uniform(0.05, 0.15)
    predicted = base * seasonal_factor * trend_factor
    change = ((predicted - base) / base) * 100
    shortage = max(0, predicted - base * 0.75)

    return {
        "current_weekly_demand": round(base, 1),
        "predicted_demand": round(predicted, 1),
        "expected_change_percent": round(change, 1),
        "potential_shortage": round(shortage, 1),
        "season": season,
    }


@app.get("/health")
def health():
    return {"status": "ok", "service": "krishilink-ai", "timestamp": datetime.utcnow().isoformat()}


@app.post("/forecast", response_model=ForecastResponse)
def forecast(req: ForecastRequest):
    result = simple_forecast(req.product, req.location, req.historical_orders)
    return ForecastResponse(
        product=req.product,
        location=req.location,
        current_weekly_demand=result["current_weekly_demand"],
        predicted_demand=result["predicted_demand"],
        expected_change_percent=result["expected_change_percent"],
        potential_shortage=result["potential_shortage"],
        season=result["season"],
        is_estimate=True,
        disclaimer="This prediction is an ESTIMATE based on statistical modeling. Actual demand may vary significantly.",
        model="simple_seasonal_regression_v1",
    )


@app.get("/forecast/{product}/{location}")
def forecast_get(product: str, location: str):
    result = simple_forecast(product, location)
    return {
        "product": product,
        "location": location,
        **result,
        "is_estimate": True,
        "disclaimer": "This prediction is an ESTIMATE.",
        "model": "simple_seasonal_regression_v1",
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
