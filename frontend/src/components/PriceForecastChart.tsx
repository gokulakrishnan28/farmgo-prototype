/**
 * PriceForecastChart
 * -------------------
 * Combined historical + forecast chart using Recharts.
 * 
 * Features:
 * - Line chart: Historical (solid blue) + Predicted (dashed green)
 * - Confidence band (area between min/max predicted)
 * - Trend indicator
 * - MAE/RMSE display
 * - Disclaimer always visible
 * - Source + last-updated
 */
import {
  Line, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, Area, ComposedChart
} from "recharts";
import { TrendingUp, TrendingDown, Minus, AlertCircle, Info } from "lucide-react";

interface HistoricalPoint {
  date: string;
  modal_price?: number;
  modal_price_per_kg?: number;
}

interface ForecastPoint {
  date: string;
  predicted_modal_price: number;
  predicted_min_price: number;
  predicted_max_price: number;
}

interface ForecastResult {
  status: string;
  model: string;
  forecasts: ForecastPoint[];
  trend?: string;
  confidence?: string;
  mae?: number | null;
  rmse?: number | null;
  r2?: number | null;
  horizon_days?: number;
  last_known_price?: number;
  last_known_date?: string;
  message?: string;
  disclaimer?: string;
}

interface PriceForecastChartProps {
  commodity: string;
  market: string;
  historical: HistoricalPoint[];
  forecast: ForecastResult | null;
  unit?: string;
  isDemo?: boolean;
  loading?: boolean;
}

const TrendIcon = ({ trend }: { trend?: string }) => {
  if (trend === "Increasing") return <TrendingUp size={16} style={{ color: "#16a34a" }} />;
  if (trend === "Decreasing") return <TrendingDown size={16} style={{ color: "#dc2626" }} />;
  return <Minus size={16} style={{ color: "#6b7280" }} />;
};

const ConfidenceBadge = ({ confidence }: { confidence?: string }) => {
  const colors: Record<string, { bg: string; color: string }> = {
    "High": { bg: "#dcfce7", color: "#166534" },
    "Medium": { bg: "#fef9c3", color: "#854d0e" },
    "Low": { bg: "#fee2e2", color: "#991b1b" },
  };
  const style = colors[confidence || "Low"] || colors["Low"];
  return (
    <span style={{
      background: style.bg,
      color: style.color,
      borderRadius: "8px",
      padding: "2px 10px",
      fontSize: "12px",
      fontWeight: 700,
    }}>
      {confidence || "Low"}
    </span>
  );
};

// Custom tooltip for chart
const CustomTooltip = ({ active, payload, label }: {
  active?: boolean;
  payload?: Array<{ color: string; name: string; value: number }>;
  label?: string;
}) => {
  if (!active || !payload || !payload.length) return null;
  return (
    <div style={{
      background: "white",
      border: "1px solid #e5e7eb",
      borderRadius: "12px",
      padding: "12px 16px",
      boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
      fontSize: "13px",
    }}>
      <p style={{ fontWeight: 700, color: "#1f2937", marginBottom: "6px" }}>{label}</p>
      {payload.map((entry, i) => (
        entry.value != null && (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "3px" }}>
            <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: entry.color }} />
            <span style={{ color: "#4b5563" }}>{entry.name}:</span>
            <span style={{ fontWeight: 700, color: "#1f2937" }}>₹{entry.value?.toFixed(0)}/qtl</span>
          </div>
        )
      ))}
    </div>
  );
};

export default function PriceForecastChart({
  commodity,
  market,
  historical,
  forecast,
  unit = "₹/quintal",
  isDemo = false,
  loading = false,
}: PriceForecastChartProps) {
  // Build combined dataset for chart
  const chartData: Array<{
    date: string;
    historical?: number;
    predicted?: number;
    pred_min?: number;
    pred_max?: number;
    type: "historical" | "forecast";
  }> = [];

  // Add historical (last 30 days)
  const histSlice = historical.slice(-30);
  histSlice.forEach(h => {
    chartData.push({
      date: h.date.slice(5), // MM-DD format
      historical: h.modal_price || (h.modal_price_per_kg ? h.modal_price_per_kg * 100 : undefined),
      type: "historical",
    });
  });

  // Add forecast
  if (forecast?.forecasts) {
    forecast.forecasts.forEach(f => {
      chartData.push({
        date: f.date.slice(5),
        predicted: f.predicted_modal_price,
        pred_min: f.predicted_min_price,
        pred_max: f.predicted_max_price,
        type: "forecast",
      });
    });
  }

  // Connect last historical to first forecast
  if (histSlice.length > 0 && forecast?.forecasts?.length) {
    const lastHist = histSlice[histSlice.length - 1];
    const lastHistPrice = lastHist.modal_price || (lastHist.modal_price_per_kg ? lastHist.modal_price_per_kg * 100 : null);
    if (lastHistPrice && chartData.length > 0) {
      // Mark the junction point with both values
      const junctionIdx = chartData.findIndex(d => d.type === "forecast");
      if (junctionIdx > 0) {
        chartData[junctionIdx - 1] = {
          ...chartData[junctionIdx - 1],
          predicted: lastHistPrice, // bridge gap
        };
      }
    }
  }

  const trendColor = forecast?.trend === "Increasing" ? "#16a34a" : forecast?.trend === "Decreasing" ? "#dc2626" : "#6b7280";

  if (loading) {
    return (
      <div style={{
        background: "white",
        borderRadius: "20px",
        padding: "24px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
        height: "320px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#9ca3af",
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "32px", marginBottom: "12px", animation: "pulse 1s infinite" }}>📈</div>
          <p>Generating price forecast...</p>
        </div>
      </div>
    );
  }

  if (!forecast || forecast.status === "no_data") {
    return (
      <div style={{
        background: "white",
        borderRadius: "20px",
        padding: "24px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
        textAlign: "center",
        color: "#6b7280",
      }}>
        <Info size={32} style={{ margin: "0 auto 12px", opacity: 0.5 }} />
        <p style={{ fontWeight: 600 }}>No Forecast Available</p>
        <p style={{ fontSize: "13px" }}>{forecast?.message || "Select a commodity and market to view forecast"}</p>
      </div>
    );
  }

  return (
    <div style={{ background: "white", borderRadius: "20px", overflow: "hidden", boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}>
      {/* Header */}
      <div style={{ padding: "18px 20px 14px", borderBottom: "1px solid #f3f4f6" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "10px" }}>
          <div>
            <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 800, color: "#1f2937" }}>
              📈 {commodity} — {market}
            </h3>
            <p style={{ margin: "3px 0 0", fontSize: "12px", color: "#6b7280" }}>
              Historical + {forecast.horizon_days ?? 7}-day Price Forecast · {unit}
            </p>
          </div>
          {isDemo && (
            <span style={{ background: "#fef9c3", color: "#854d0e", borderRadius: "8px", padding: "3px 10px", fontSize: "11px", fontWeight: 700 }}>
              📊 Demo
            </span>
          )}
        </div>

        {/* Stats row */}
        <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <TrendIcon trend={forecast.trend} />
            <span style={{ fontSize: "13px", fontWeight: 700, color: trendColor }}>{forecast.trend || "—"}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ fontSize: "12px", color: "#6b7280" }}>Confidence:</span>
            <ConfidenceBadge confidence={forecast.confidence} />
          </div>
          {forecast.mae != null && (
            <div style={{ fontSize: "12px", color: "#6b7280" }}>
              <span>MAE: </span><strong>₹{forecast.mae}</strong>
            </div>
          )}
          {forecast.rmse != null && (
            <div style={{ fontSize: "12px", color: "#6b7280" }}>
              <span>RMSE: </span><strong>₹{forecast.rmse}</strong>
            </div>
          )}
          {forecast.model && (
            <div style={{ fontSize: "12px", color: "#6b7280" }}>
              <span>Model: </span><strong>{forecast.model}</strong>
            </div>
          )}
        </div>
      </div>

      {/* Chart */}
      <div style={{ padding: "16px 8px 0" }}>
        <ResponsiveContainer width="100%" height={260}>
          <ComposedChart data={chartData} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="forecastGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#16a34a" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#16a34a" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: "#9ca3af" }}
              tickLine={false}
              axisLine={{ stroke: "#e5e7eb" }}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "#9ca3af" }}
              tickLine={false}
              axisLine={{ stroke: "#e5e7eb" }}
              tickFormatter={v => `₹${v}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }}
              iconType="line"
            />
            {/* Forecast confidence band */}
            <Area
              type="monotone"
              dataKey="pred_max"
              stroke="none"
              fill="url(#forecastGrad)"
              legendType="none"
            />
            <Area
              type="monotone"
              dataKey="pred_min"
              stroke="none"
              fill="white"
              legendType="none"
            />
            {/* Historical price line */}
            <Line
              type="monotone"
              dataKey="historical"
              stroke="#3b82f6"
              strokeWidth={2.5}
              dot={false}
              name="Historical Price"
              connectNulls={false}
            />
            {/* Forecast price line */}
            <Line
              type="monotone"
              dataKey="predicted"
              stroke="#16a34a"
              strokeWidth={2.5}
              strokeDasharray="6 3"
              dot={{ fill: "#16a34a", r: 3 }}
              name="Predicted Price"
              connectNulls={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Disclaimer */}
      <div style={{
        margin: "0 16px 16px",
        padding: "10px 14px",
        background: "#fef9c3",
        borderRadius: "10px",
        fontSize: "11px",
        color: "#854d0e",
        display: "flex",
        alignItems: "flex-start",
        gap: "6px",
      }}>
        <AlertCircle size={13} style={{ flexShrink: 0, marginTop: "1px" }} />
        <span>
          {forecast.disclaimer || "Price forecasts are estimates. Actual market prices may vary due to weather, supply conditions, and other factors."}
        </span>
      </div>
    </div>
  );
}
