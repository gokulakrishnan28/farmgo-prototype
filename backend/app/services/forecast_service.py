"""
Price Forecast Service
-----------------------
XGBoost-based price forecasting for agricultural commodities.

Features used:
  - Day of week, month, day of year (seasonality)
  - Historical modal prices (lag 1, 3, 7, 14, 30 days)
  - Rolling mean/median (7-day, 14-day, 30-day)
  - Arrival quantity
  - Season encoding

Model: XGBoost Regression (fallback: RandomForestRegressor or rolling average)
Validation: Chronological (time-based) split — NOT random

Output:
  - predicted_modal_price (₹/quintal)
  - prediction_range (min, max)
  - trend: "Increasing" / "Decreasing" / "Stable"
  - confidence: "Low" / "Medium" / "High" (based on data availability and MAE)
  - model_name
  - MAE, RMSE, R² from last training
  - horizon: 1-7 days

IMPORTANT: Never claim 100% accuracy. Always show metrics and disclaimers.
"""
import os
import math
import pickle
from datetime import date, timedelta
from typing import Any, Dict, List, Optional

try:
    import numpy as np
    NUMPY_AVAILABLE = True
except ImportError:
    NUMPY_AVAILABLE = False

try:
    import xgboost as xgb
    XGB_AVAILABLE = True
except ImportError:
    XGB_AVAILABLE = False

try:
    from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
    from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
    SKLEARN_AVAILABLE = True
except ImportError:
    SKLEARN_AVAILABLE = False


MODEL_DIR = os.path.join(os.path.dirname(__file__), "..", "ml", "models")
os.makedirs(MODEL_DIR, exist_ok=True)


def _season(month: int) -> int:
    """Encode Indian agricultural seasons (1=Kharif, 2=Rabi, 3=Zaid)."""
    if month in (6, 7, 8, 9, 10):
        return 1  # Kharif
    elif month in (11, 12, 1, 2, 3):
        return 2  # Rabi
    else:
        return 3  # Zaid


def _engineer_features(prices: List[float], dates: List[date]) -> Optional[List[Dict]]:
    """
    Build feature vectors from a time-ordered price series.
    Minimum 30 data points required for meaningful features.
    """
    if not NUMPY_AVAILABLE:
        return None
    
    n = len(prices)
    if n < 7:
        return None
    
    rows = []
    for i in range(30, n):  # need at least 30 days of history
        d = dates[i]
        p = prices[i]
        
        row = {
            # Date features
            "day_of_week": d.weekday(),
            "month": d.month,
            "day_of_year": d.timetuple().tm_yday,
            "week_of_year": d.isocalendar()[1],
            "season": _season(d.month),
            # Lag features
            "price_lag1": prices[i - 1],
            "price_lag3": prices[i - 3] if i >= 3 else prices[0],
            "price_lag7": prices[i - 7] if i >= 7 else prices[0],
            "price_lag14": prices[i - 14] if i >= 14 else prices[0],
            "price_lag30": prices[i - 30] if i >= 30 else prices[0],
            # Rolling stats
            "rolling_mean_7": float(np.mean(prices[max(0, i - 7):i])),
            "rolling_mean_14": float(np.mean(prices[max(0, i - 14):i])),
            "rolling_mean_30": float(np.mean(prices[max(0, i - 30):i])),
            "rolling_median_7": float(np.median(prices[max(0, i - 7):i])),
            "rolling_std_7": float(np.std(prices[max(0, i - 7):i])),
            # Target
            "_target": p,
        }
        rows.append(row)
    
    return rows if rows else None


def _rolling_average_forecast(prices: List[float], horizon_days: int) -> List[float]:
    """Simple rolling average fallback when not enough data for ML."""
    if not prices:
        return [0.0] * horizon_days
    window = min(7, len(prices))
    avg = sum(prices[-window:]) / window
    
    # Add a small trend component
    if len(prices) >= 14:
        recent_avg = sum(prices[-7:]) / 7
        older_avg = sum(prices[-14:-7]) / 7
        trend_per_day = (recent_avg - older_avg) / 7
    else:
        trend_per_day = 0
    
    return [avg + trend_per_day * d for d in range(1, horizon_days + 1)]


def train_and_forecast(
    prices: List[float],
    dates: List[date],
    horizon_days: int = 7,
    commodity: str = "",
    market: str = "",
) -> Dict[str, Any]:
    """
    Train a price forecasting model and generate predictions.
    
    Uses:
      1. XGBoost (if available)
      2. Random Forest (fallback)
      3. Rolling Average (final fallback)
    
    Uses chronological train/test split — NEVER random split for time series.
    """
    MIN_DATA_POINTS = 30
    
    if not prices or len(prices) < 7:
        return {
            "status": "insufficient_data",
            "message": "Insufficient historical data for reliable forecast. Need at least 7 days.",
            "model": "none",
            "forecasts": [],
            "confidence": "Low",
        }
    
    # Sort by date
    paired = sorted(zip(dates, prices), key=lambda x: x[0])
    sorted_dates = [p[0] for p in paired]
    sorted_prices = [p[1] for p in paired]
    
    # Fallback for very short series
    if len(sorted_prices) < MIN_DATA_POINTS or not NUMPY_AVAILABLE:
        forecasted = _rolling_average_forecast(sorted_prices, horizon_days)
        avg_recent = sum(sorted_prices[-7:]) / min(7, len(sorted_prices))
        trend = "Stable"
        if len(sorted_prices) >= 14:
            older = sum(sorted_prices[-14:-7]) / 7
            if avg_recent > older * 1.03:
                trend = "Increasing"
            elif avg_recent < older * 0.97:
                trend = "Decreasing"
        
        result_forecasts = []
        for i, fc in enumerate(forecasted):
            fc_date = sorted_dates[-1] + timedelta(days=i + 1)
            result_forecasts.append({
                "date": fc_date.isoformat(),
                "predicted_modal_price": round(max(fc, 0), 2),
                "predicted_min_price": round(max(fc * 0.92, 0), 2),
                "predicted_max_price": round(fc * 1.08, 2),
            })
        
        return {
            "status": "rolling_average",
            "message": f"Using 7-day rolling average (only {len(sorted_prices)} data points available, need {MIN_DATA_POINTS} for ML).",
            "model": "rolling_avg",
            "forecasts": result_forecasts,
            "trend": trend,
            "confidence": "Low",
            "mae": None,
            "rmse": None,
            "r2": None,
        }
    
    # Try ML approach
    import numpy as np
    
    feature_rows = _engineer_features(sorted_prices, sorted_dates)
    if not feature_rows:
        return {
            "status": "insufficient_data",
            "message": "Could not build features from available data.",
            "model": "none",
            "forecasts": [],
            "confidence": "Low",
        }
    
    feature_cols = [k for k in feature_rows[0].keys() if k != "_target"]
    X = np.array([[row[c] for c in feature_cols] for row in feature_rows])
    y = np.array([row["_target"] for row in feature_rows])
    
    # Chronological split: 80% train, 20% test
    split_idx = int(len(X) * 0.80)
    if split_idx < 10:
        split_idx = len(X) - 5
    
    X_train, X_test = X[:split_idx], X[split_idx:]
    y_train, y_test = y[:split_idx], y[split_idx:]
    
    model = None
    model_name = "rolling_avg"
    mae = rmse = r2 = None
    
    # Try XGBoost
    if XGB_AVAILABLE and len(X_train) >= 10:
        try:
            model = xgb.XGBRegressor(
                n_estimators=100,
                max_depth=5,
                learning_rate=0.1,
                subsample=0.8,
                colsample_bytree=0.8,
                random_state=42,
                verbosity=0,
            )
            model.fit(X_train, y_train)
            model_name = "xgboost"
        except Exception:
            model = None
    
    # Fallback: Random Forest
    if model is None and SKLEARN_AVAILABLE and len(X_train) >= 10:
        try:
            model = RandomForestRegressor(n_estimators=100, random_state=42, n_jobs=-1)
            model.fit(X_train, y_train)
            model_name = "random_forest"
        except Exception:
            model = None
    
    # Evaluate on test set
    if model is not None and SKLEARN_AVAILABLE and len(X_test) > 0:
        try:
            y_pred = model.predict(X_test)
            mae = round(float(mean_absolute_error(y_test, y_pred)), 2)
            rmse = round(float(math.sqrt(mean_squared_error(y_test, y_pred))), 2)
            r2 = round(float(r2_score(y_test, y_pred)), 3)
        except Exception:
            pass
    
    # Generate forecasts for next horizon_days
    forecasts_out = []
    last_prices = list(sorted_prices)
    last_date = sorted_dates[-1]
    
    for day in range(1, horizon_days + 1):
        fc_date = last_date + timedelta(days=day)
        
        if model is not None:
            # Build feature row for this forecast date
            n = len(last_prices)
            feat = {
                "day_of_week": fc_date.weekday(),
                "month": fc_date.month,
                "day_of_year": fc_date.timetuple().tm_yday,
                "week_of_year": fc_date.isocalendar()[1],
                "season": _season(fc_date.month),
                "price_lag1": last_prices[-1],
                "price_lag3": last_prices[-3] if n >= 3 else last_prices[0],
                "price_lag7": last_prices[-7] if n >= 7 else last_prices[0],
                "price_lag14": last_prices[-14] if n >= 14 else last_prices[0],
                "price_lag30": last_prices[-30] if n >= 30 else last_prices[0],
                "rolling_mean_7": float(np.mean(last_prices[-7:])),
                "rolling_mean_14": float(np.mean(last_prices[-14:])) if n >= 14 else float(np.mean(last_prices)),
                "rolling_mean_30": float(np.mean(last_prices[-30:])) if n >= 30 else float(np.mean(last_prices)),
                "rolling_median_7": float(np.median(last_prices[-7:])),
                "rolling_std_7": float(np.std(last_prices[-7:])),
            }
            feat_arr = np.array([[feat[c] for c in feature_cols]])
            predicted = float(model.predict(feat_arr)[0])
        else:
            # Rolling average
            predicted = _rolling_average_forecast(last_prices, 1)[0]
        
        predicted = max(predicted, 0)
        last_prices.append(predicted)
        
        # Uncertainty band: ±8% (±15% for rolling avg)
        band_pct = 0.15 if model is None else 0.08
        forecasts_out.append({
            "date": fc_date.isoformat(),
            "predicted_modal_price": round(predicted, 2),
            "predicted_min_price": round(predicted * (1 - band_pct), 2),
            "predicted_max_price": round(predicted * (1 + band_pct), 2),
        })
    
    # Trend
    recent_7 = float(np.mean(sorted_prices[-7:]))
    prev_7 = float(np.mean(sorted_prices[-14:-7])) if len(sorted_prices) >= 14 else recent_7
    next_pred = forecasts_out[0]["predicted_modal_price"] if forecasts_out else recent_7
    
    if next_pred > recent_7 * 1.03:
        trend = "Increasing"
    elif next_pred < recent_7 * 0.97:
        trend = "Decreasing"
    else:
        trend = "Stable"
    
    # Confidence
    if model is None or len(sorted_prices) < 60:
        confidence = "Low"
    elif mae is not None and mae < recent_7 * 0.05:
        confidence = "High"
    elif mae is not None and mae < recent_7 * 0.10:
        confidence = "Medium"
    else:
        confidence = "Low"
    
    return {
        "status": "success",
        "model": model_name,
        "forecasts": forecasts_out,
        "trend": trend,
        "confidence": confidence,
        "mae": mae,
        "rmse": rmse,
        "r2": r2,
        "training_samples": split_idx,
        "test_samples": len(X_test),
        "data_points_used": len(sorted_prices),
        "disclaimer": "Price forecasts are estimates based on historical patterns. Actual market prices may vary due to weather, supply shocks, and other factors. Do not rely solely on this forecast for selling decisions.",
    }


def simple_forecast_from_db_prices(
    price_records: List[Dict[str, Any]],
    horizon_days: int = 7,
    commodity: str = "",
    market: str = "",
) -> Dict[str, Any]:
    """
    Public interface: takes a list of MarketPrice-like dicts and runs forecast.
    
    Input dicts should have: price_date (str or date), modal_price (float)
    """
    if not price_records:
        return {
            "status": "no_data",
            "message": "No historical price data found for this commodity and market.",
            "confidence": "Low",
            "forecasts": [],
        }
    
    # Sort by date
    def to_date(d):
        if isinstance(d, date):
            return d
        try:
            return date.fromisoformat(str(d))
        except Exception:
            return date.today()
    
    records = sorted(price_records, key=lambda r: to_date(r.get("price_date", date.today())))
    dates = [to_date(r["price_date"]) for r in records]
    prices = [float(r.get("modal_price", 0) or 0) for r in records]
    
    # Filter out zero prices
    valid = [(d, p) for d, p in zip(dates, prices) if p > 0]
    if not valid:
        return {
            "status": "no_valid_data",
            "message": "All price records have zero or null modal price.",
            "confidence": "Low",
            "forecasts": [],
        }
    
    dates_clean = [v[0] for v in valid]
    prices_clean = [v[1] for v in valid]
    
    result = train_and_forecast(prices_clean, dates_clean, horizon_days, commodity, market)
    
    # Add last known price info
    result["last_known_price"] = prices_clean[-1]
    result["last_known_date"] = dates_clean[-1].isoformat()
    result["commodity"] = commodity
    result["market"] = market
    result["horizon_days"] = horizon_days
    
    return result
