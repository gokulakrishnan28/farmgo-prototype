/**
 * AiMatchedTrucksCard — Step 7: AI-Matched Trucks
 * Shows only the top 3 AI-recommended trucks based on crop/weight/storage.
 */
import { Star, ShieldCheck, MapPin } from "lucide-react";
import { type LangCode, getT } from "../../../utils/farmerTranslations";
import StepCard from "../components/StepCard";
import type { FleetVehicle } from "../../../services/farmgoStore";

interface AiMatchedTrucksCardProps {
  lang: LangCode;
  fleet: FleetVehicle[];
  requiredStorage: "Dry" | "Normal" | "Cold";
  weightTon: number;
  distanceKm: number;
  onSelectTruck: (truck: FleetVehicle, estimatedPrice: number) => void;
}

export default function AiMatchedTrucksCard({
  lang,
  fleet,
  requiredStorage,
  weightTon,
  distanceKm,
  onSelectTruck,
}: AiMatchedTrucksCardProps) {
  const t = getT(lang);

  // AI Filtering & Matching logic (simulated)
  const matchedTrucks = fleet
    .filter((v) => {
      // Basic filter: only show trucks that can handle the storage and weight
      // (For demo purposes, if fleet is small, we might be lenient)
      const storageMatch = v.storage.toLowerCase().includes(requiredStorage.toLowerCase()) || requiredStorage === "Normal";
      
      // Parse capacity (e.g. "1.5 Tons" -> 1.5)
      let capacity = parseFloat(v.limit);
      if (v.limit.toLowerCase().includes("kg")) {
        capacity = capacity / 1000;
      }
      
      // Relaxed capacity constraint for demo to ensure we show trucks
      return storageMatch && (capacity >= weightTon * 0.8 || fleet.length < 5);
    })
    .map((v) => {
      // Calculate estimated price based on farmgoStore logic
      const isCold = v.storage.toLowerCase().includes("cold");
      const ratePerKm = isCold ? 24 : 18;
      const weightKg = weightTon * 1000;
      const baseFare = 1500;
      const distanceFee = Math.round(Math.max(5, distanceKm) * ratePerKm);
      const loadingFee = Math.round(weightKg * 0.4);
      const unloadingFee = Math.round(weightKg * 0.4);
      const subtotal = baseFare + distanceFee + loadingFee + unloadingFee;
      const total = subtotal + Math.round(subtotal * 0.05);

      // AI Match score (simulated)
      const isCapacityPerfect = parseFloat(v.limit) >= weightTon ? 100 : 50;
      const rating = v.driver.length % 2 === 0 ? 4.8 : 4.6; // Mock rating

      return {
        ...v,
        estimatedPrice: total,
        matchScore: isCapacityPerfect,
        rating,
        distanceFromPickup: (Math.random() * 15 + 1).toFixed(1), // Mock distance
      };
    })
    .sort((a, b) => a.estimatedPrice - b.estimatedPrice)
    .slice(0, 3); // Only show top 3

  // Assign badges to top 3
  const badges = [t("trucks.ai_recommended"), t("trucks.best_price"), t("trucks.best_rated")];

  return (
    <StepCard title={t("trucks.title")} subtitle={t("trucks.subtitle")} icon="🚚">
      <div className="space-y-4 mt-2">
        {matchedTrucks.length === 0 ? (
          <div className="text-center py-10 bg-slate-50 rounded-2xl border border-slate-200">
            <span className="text-4xl mb-3 block">🚛</span>
            <p className="text-slate-500 font-medium px-4">{t("error.no_vehicles")}</p>
          </div>
        ) : (
          matchedTrucks.map((truck, idx) => (
            <div
              key={truck.id}
              className={`bg-white border-2 rounded-2xl p-4 transition-all hover:shadow-lg ${
                idx === 0 ? "border-emerald-400 ring-4 ring-emerald-50" : "border-slate-200 hover:border-emerald-300"
              }`}
            >
              {/* Badge */}
              <div className="flex items-center justify-between mb-3">
                <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg ${
                  idx === 0 ? "bg-emerald-100 text-emerald-700" :
                  idx === 1 ? "bg-blue-100 text-blue-700" :
                  "bg-amber-100 text-amber-700"
                }`}>
                  {badges[idx]}
                </span>
                
                <div className="flex items-center space-x-1 text-slate-500 text-xs font-bold">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{truck.distanceFromPickup} km</span>
                </div>
              </div>

              {/* Truck Info */}
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-16 h-16 bg-slate-100 rounded-xl overflow-hidden flex-shrink-0 border border-slate-200">
                  <img src={truck.image || "/truck.jpg"} alt={truck.name} className="w-full h-full object-cover" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 leading-tight mb-1">{truck.name}</h3>
                  <div className="flex items-center space-x-2 text-xs font-medium text-slate-500">
                    <span className="flex items-center text-amber-500 font-bold bg-amber-50 px-1.5 py-0.5 rounded">
                      <Star className="w-3 h-3 fill-current mr-1" />
                      {truck.rating}
                    </span>
                    <span>•</span>
                    <span>{truck.driver}</span>
                  </div>
                  <div className="text-xs font-bold text-slate-400 mt-1">
                    {t("trucks.capacity")}: {truck.limit} | {truck.storage}
                  </div>
                </div>
              </div>

              {/* Price & Action */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase">{t("trucks.est_price")}</div>
                  <div className="text-xl font-black text-slate-800">₹{truck.estimatedPrice.toLocaleString()}</div>
                </div>
                <button
                  type="button"
                  onClick={() => onSelectTruck(truck, truck.estimatedPrice)}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2.5 px-6 rounded-xl text-sm transition-all shadow-md shadow-emerald-200 border-0 cursor-pointer"
                >
                  {t("trucks.select")}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </StepCard>
  );
}
