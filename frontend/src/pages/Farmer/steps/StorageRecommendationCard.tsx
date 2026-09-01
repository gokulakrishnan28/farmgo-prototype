/**
 * StorageRecommendationCard — Step 6: AI Storage Recommendation
 * Recommends Dry, Normal, or Cold storage based on crop.
 */
import { type LangCode, getT } from "../../../utils/farmerTranslations";
import StepCard from "../components/StepCard";

interface StorageRecommendationCardProps {
  lang: LangCode;
  cropName: string;
  distanceKm: number;
  onContinue: (storageType: "Dry" | "Normal" | "Cold") => void;
}

export default function StorageRecommendationCard({ lang, cropName, distanceKm, onContinue }: StorageRecommendationCardProps) {
  const t = getT(lang);

  // Simple heuristic for demo purposes
  const getRecommendation = () => {
    const lowerCrop = cropName.toLowerCase();
    
    // Cold Storage
    if (
      lowerCrop.includes("tomato") || 
      lowerCrop.includes("apple") || 
      lowerCrop.includes("grapes") ||
      lowerCrop.includes("flower") ||
      lowerCrop.includes("rose") ||
      lowerCrop.includes("jasmine") ||
      lowerCrop.includes("meat") ||
      lowerCrop.includes("milk")
    ) {
      if (distanceKm > 50) return { type: "Cold", icon: "❄️", key: "storage.cold", desc: "storage.cold_desc", bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" };
    }
    
    // Dry Storage
    if (
      lowerCrop.includes("rice") || 
      lowerCrop.includes("wheat") || 
      lowerCrop.includes("maize") ||
      lowerCrop.includes("dal") ||
      lowerCrop.includes("spice") ||
      lowerCrop.includes("turmeric") ||
      lowerCrop.includes("cotton")
    ) {
      return { type: "Dry", icon: "🌾", key: "storage.dry", desc: "storage.dry_desc", bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" };
    }

    // Default Normal
    return { type: "Normal", icon: "📦", key: "storage.normal", desc: "storage.normal_desc", bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" };
  };

  const rec = getRecommendation();

  return (
    <StepCard title={t("storage.title")} subtitle={t("storage.subtitle")} icon="🧠">
      <div className="space-y-6 mt-2">
        
        {/* Recommendation highlight */}
        <div className={`rounded-3xl border-2 ${rec.border} ${rec.bg} p-6 flex flex-col items-center justify-center text-center relative overflow-hidden`}>
          <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-bl-xl">
            {t("storage.recommended")}
          </div>
          
          <span className="text-6xl mb-4 drop-shadow-md">{rec.icon}</span>
          <h3 className={`text-2xl font-black ${rec.text} mb-2`}>{t(rec.key)}</h3>
          <p className="text-sm font-medium text-slate-600 max-w-[250px]">
            {t(rec.desc)}
          </p>
        </div>

        {/* Why this recommendation */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            {t("storage.why")}
          </h4>
          <p className="text-sm font-medium text-slate-700 leading-relaxed">
            {rec.type === "Cold" && `Your selected crop (${cropName}) is temperature-sensitive and the estimated journey (${distanceKm} km) is long enough to require active cooling to preserve quality.`}
            {rec.type === "Dry" && `Your selected crop (${cropName}) requires a moisture-free environment to prevent spoilage during the ${distanceKm} km journey.`}
            {rec.type === "Normal" && `Your selected crop (${cropName}) is robust and normal covered transport is perfectly suitable for this ${distanceKm} km journey.`}
          </p>
        </div>

        {/* Continue Button */}
        <button
          type="button"
          onClick={() => onContinue(rec.type as "Dry" | "Normal" | "Cold")}
          className="w-full bg-gradient-to-r from-emerald-500 to-green-600 text-white py-4 rounded-2xl font-black text-base cursor-pointer border-0 shadow-lg shadow-emerald-200 hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] transition-all"
        >
          {t("storage.continue")} →
        </button>
      </div>
    </StepCard>
  );
}
