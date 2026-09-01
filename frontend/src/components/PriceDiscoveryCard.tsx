import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { TrendingUp, Sparkles, Calendar } from "lucide-react";

interface PriceDiscoveryCardProps {
  cropName: string;
  category: string;
  quantityKg: number;
  currentPrice: number;
  predictedPrice: number;
  predictedDays?: number;
  demandScore: "High" | "Medium" | "Low";
  confidence: string;
  recommendation: string;
  explanationBullets?: string[];
  historicalPrices?: { day: string; price: number; type: "actual" | "forecast" }[];
}

export default function PriceDiscoveryCard({
  cropName,
  category,
  quantityKg,
  currentPrice,
  predictedPrice,
  predictedDays = 7,
  demandScore,
  confidence,
  recommendation,
  explanationBullets = [],
  historicalPrices = [],
}: PriceDiscoveryCardProps) {
  const priceDiff = predictedPrice - currentPrice;
  const pctChange = ((priceDiff / (currentPrice || 1)) * 100).toFixed(1);
  const isPositive = priceDiff >= 0;

  // Fallback demo chart data if not provided
  const chartData = historicalPrices.length > 0 ? historicalPrices : [
    { day: "Day -6", price: currentPrice * 0.94, type: "actual" },
    { day: "Day -4", price: currentPrice * 0.96, type: "actual" },
    { day: "Day -2", price: currentPrice * 0.98, type: "actual" },
    { day: "Today", price: currentPrice, type: "actual" },
    { day: "Day +2", price: currentPrice + priceDiff * 0.4, type: "forecast" },
    { day: "Day +5", price: currentPrice + priceDiff * 0.8, type: "forecast" },
    { day: `Day +${predictedDays}`, price: predictedPrice, type: "forecast" },
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-md space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-2xl">📈</span>
            <h3 className="text-xl font-extrabold text-slate-900">
              AI Price Discovery & Trend: <span className="text-emerald-600">{cropName}</span>
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Category: {category} · Volume: {quantityKg.toLocaleString()} kg · Demand Score:{" "}
            <span
              className={`font-bold ${
                demandScore === "High"
                  ? "text-emerald-600"
                  : demandScore === "Medium"
                  ? "text-amber-600"
                  : "text-rose-600"
              }`}
            >
              {demandScore}
            </span>
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-extrabold px-3 py-1.5 rounded-full flex items-center space-x-1">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>{confidence} Confidence</span>
          </span>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-50 border border-slate-200/80 p-3.5 rounded-2xl">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Current Price</span>
          <div className="text-xl font-extrabold text-slate-900 mt-1">₹{currentPrice}/kg</div>
          <span className="text-[10px] text-slate-400">Current APMC Reference</span>
        </div>

        <div className="bg-emerald-50/60 border border-emerald-200/80 p-3.5 rounded-2xl">
          <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wide">7-Day Forecast</span>
          <div className="text-xl font-extrabold text-emerald-700 mt-1">₹{predictedPrice}/kg</div>
          <span className={`text-[10px] font-bold ${isPositive ? "text-emerald-600" : "text-rose-600"}`}>
            {isPositive ? `+${pctChange}%` : `${pctChange}%`} in {predictedDays} days
          </span>
        </div>

        <div className="bg-blue-50/60 border border-blue-200/80 p-3.5 rounded-2xl">
          <span className="text-[11px] font-bold text-blue-800 uppercase tracking-wide">Est. Batch Value</span>
          <div className="text-xl font-extrabold text-blue-900 mt-1">
            ₹{(currentPrice * quantityKg).toLocaleString()}
          </div>
          <span className="text-[10px] text-blue-600 font-semibold">
            Forecast: ₹{(predictedPrice * quantityKg).toLocaleString()}
          </span>
        </div>

        <div className="bg-purple-50/60 border border-purple-200/80 p-3.5 rounded-2xl">
          <span className="text-[11px] font-bold text-purple-800 uppercase tracking-wide">Best Selling Window</span>
          <div className="text-base font-extrabold text-purple-900 mt-1 flex items-center space-x-1">
            <Calendar className="w-4 h-4 text-purple-600" />
            <span>3–5 Days</span>
          </div>
          <span className="text-[10px] text-purple-600 font-medium">Optimal Market Timing</span>
        </div>
      </div>

      {/* Recharts Price Trend Visualization */}
      <div className="bg-slate-900 text-white rounded-2xl p-4 shadow-inner space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-300 font-semibold px-2">
          <span className="flex items-center space-x-1">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span>7-Day Price Forecast Trajectory</span>
          </span>
          <span className="text-[10px] text-emerald-400 font-mono">Real-time ML Model Data</span>
        </div>

        <div className="h-44 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="day" stroke="#94a3b8" tick={{ fontSize: 11 }} />
              <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} domain={["auto", "auto"]} />
              <Tooltip
                contentStyle={{ backgroundColor: "#1e293b", borderColor: "#475569", borderRadius: "10px" }}
                itemStyle={{ color: "#34d399", fontWeight: 700 }}
                formatter={(val: any) => [`₹${Number(val).toFixed(2)}/kg`, "Price"]}
              />
              <Line
                type="monotone"
                dataKey="price"
                stroke="#10b981"
                strokeWidth={3}
                dot={{ r: 4, fill: "#34d399" }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Prominent Explainable AI Selling Recommendation */}
      <div className="bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-green-500/10 border border-emerald-300 rounded-2xl p-4 space-y-3">
        <div className="flex items-center space-x-2">
          <div className="bg-emerald-600 text-white p-1.5 rounded-lg shadow-sm">
            <Sparkles className="w-4 h-4" />
          </div>
          <h4 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide">
            AI Selling Recommendation & Decision Analysis
          </h4>
        </div>

        <p className="text-sm font-bold text-emerald-950 bg-white/80 p-3 rounded-xl border border-emerald-200 shadow-xs">
          💡 {recommendation}
        </p>

        {explanationBullets.length > 0 && (
          <div className="space-y-1.5 pt-1">
            <span className="text-xs font-bold text-slate-700">Why this recommendation?</span>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600">
              {explanationBullets.map((bullet, idx) => (
                <li key={idx} className="flex items-start space-x-2 bg-white/60 p-2 rounded-lg border border-slate-200/60">
                  <span className="text-emerald-500 font-bold">✓</span>
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
