import { CheckCircle2, Award } from "lucide-react";

interface Opportunity {
  id: string;
  name: string; // e.g. "Buyer A (Local Wholesaler)", "Buyer B (Urban Processor)", "Coimbatore APMC Mandi"
  type: "buyer" | "market";
  pricePerKg: number;
  distanceKm: number;
  transportCost: number;
  commissionPct: number;
  otherCosts: number;
}

interface NetReturnCalculatorProps {
  cropName: string;
  quantityKg: number;
  opportunities?: Opportunity[];
}

export default function NetReturnCalculator({
  cropName,
  quantityKg,
  opportunities: initialOpportunities,
}: NetReturnCalculatorProps) {
  // Demo opportunities if not passed
  const opportunities: Opportunity[] = initialOpportunities || [
    {
      id: "opp-1",
      name: "Buyer A: Ramesh Traders (Local Mandi)",
      type: "buyer",
      pricePerKg: 30.0,
      distanceKm: 25,
      transportCost: 3000,
      commissionPct: 1.5,
      otherCosts: 500,
    },
    {
      id: "opp-2",
      name: "Buyer B: Metro Logistics (Urban Agro Hub)",
      type: "buyer",
      pricePerKg: 32.5,
      distanceKm: 140,
      transportCost: 7200,
      commissionPct: 2.0,
      otherCosts: 800,
    },
    {
      id: "opp-3",
      name: "APMC Uzhavar Sandai (Direct Market)",
      type: "market",
      pricePerKg: 28.5,
      distanceKm: 15,
      transportCost: 1800,
      commissionPct: 0.0,
      otherCosts: 200,
    },
  ];

  const calculated = opportunities.map(op => {
    const grossRevenue = op.pricePerKg * quantityKg;
    const commission = (grossRevenue * op.commissionPct) / 100;
    const totalDeductions = op.transportCost + commission + op.otherCosts;
    const netReturn = grossRevenue - totalDeductions;
    const netReturnPerKg = netReturn / (quantityKg || 1);
    return {
      ...op,
      grossRevenue,
      commission,
      totalDeductions,
      netReturn,
      netReturnPerKg,
    };
  });

  // Sort opportunities by highest Net Return
  const sorted = [...calculated].sort((a, b) => b.netReturn - a.netReturn);
  const bestOpportunity = sorted[0];

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-md space-y-6">
      {/* Title */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-2xl">💰</span>
            <h3 className="text-xl font-extrabold text-slate-900">
              Expected Net Return Comparator: <span className="text-emerald-600">{cropName}</span>
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Batch Quantity: <strong className="text-slate-700">{quantityKg.toLocaleString()} kg</strong> · Formula:{" "}
            <code className="bg-slate-100 px-2 py-0.5 rounded text-[11px] font-mono text-emerald-800">
              Gross Revenue − Transport − Commission − Other Costs = Net Return
            </code>
          </p>
        </div>

        <div className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-extrabold px-3.5 py-1.5 rounded-full flex items-center space-x-1.5">
          <Award className="w-4 h-4 text-emerald-600" />
          <span>Best Net Return Focus</span>
        </div>
      </div>

      {/* Prominent Winner Recommendation Box */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-2xl p-5 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center space-x-1.5 bg-white/20 px-3 py-1 rounded-full text-xs font-extrabold text-white">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Recommended Choice</span>
          </div>
          <h4 className="text-lg font-black text-white">{bestOpportunity.name}</h4>
          <p className="text-xs text-emerald-100">
            Yields the highest net profit of{" "}
            <strong className="text-yellow-300 font-extrabold text-sm">
              ₹{bestOpportunity.netReturn.toLocaleString()} (₹{bestOpportunity.netReturnPerKg.toFixed(2)}/kg)
            </strong>{" "}
            after all logistics & market expenses.
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-3 text-right flex-shrink-0">
          <span className="text-[10px] uppercase font-bold text-emerald-200 block">Est. Net Profit</span>
          <span className="text-2xl font-black text-white">₹{bestOpportunity.netReturn.toLocaleString()}</span>
        </div>
      </div>

      {/* Comparison Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {sorted.map((item, index) => {
          const isWinner = index === 0;
          return (
            <div
              key={item.id}
              className={`rounded-2xl p-5 transition-all relative flex flex-col justify-between ${
                isWinner
                  ? "bg-emerald-50/50 border-2 border-emerald-500 shadow-md"
                  : "bg-slate-50 border border-slate-200"
              }`}
            >
              {isWinner && (
                <span className="absolute -top-3 right-4 bg-emerald-600 text-white text-[10px] font-black uppercase tracking-wider px-3 py-0.5 rounded-full shadow-xs">
                  ★ Highest Net Return
                </span>
              )}

              <div className="space-y-3">
                <div className="font-extrabold text-slate-900 text-sm">{item.name}</div>

                <div className="space-y-1.5 text-xs text-slate-600 border-t border-slate-200/60 pt-3">
                  <div className="flex justify-between">
                    <span>Offered Price:</span>
                    <strong className="text-slate-900 font-bold">₹{item.pricePerKg}/kg</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Gross Revenue:</span>
                    <strong className="text-slate-900 font-bold">₹{item.grossRevenue.toLocaleString()}</strong>
                  </div>
                  <div className="flex justify-between text-rose-600">
                    <span>Transport ({item.distanceKm} km):</span>
                    <span>- ₹{item.transportCost.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-rose-600">
                    <span>Market Commission ({item.commissionPct}%):</span>
                    <span>- ₹{item.commission.toLocaleString()}</span>
                  </div>
                  {item.otherCosts > 0 && (
                    <div className="flex justify-between text-rose-600">
                      <span>Handling/Other:</span>
                      <span>- ₹{item.otherCosts.toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="border-t border-slate-200 pt-3 mt-4 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Expected Net Return</span>
                  <span className={`text-lg font-black ${isWinner ? "text-emerald-700" : "text-slate-800"}`}>
                    ₹{item.netReturn.toLocaleString()}
                  </span>
                </div>
                <span className="text-xs font-semibold text-slate-500">
                  (₹{item.netReturnPerKg.toFixed(2)}/kg)
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
