/**
 * CropCategoryCard — Step 1: Select crop category
 * Large visual cards: Fruits, Vegetables, Grains, Spices, Flowers, Others
 */
import { type LangCode, getT } from "../../../utils/farmerTranslations";
import StepCard from "../components/StepCard";

interface CropCategoryCardProps {
  lang: LangCode;
  onSelect: (category: string) => void;
}

const CATEGORIES = [
  { id: "Fruits", emoji: "🍎", key: "cat.fruits", descKey: "cat.fruits_desc", color: "from-orange-400 to-amber-500", bg: "bg-orange-50", ring: "ring-orange-200", border: "border-orange-200" },
  { id: "Vegetables", emoji: "🥕", key: "cat.vegetables", descKey: "cat.vegetables_desc", color: "from-emerald-400 to-green-500", bg: "bg-emerald-50", ring: "ring-emerald-200", border: "border-emerald-200" },
  { id: "Grains", emoji: "🌾", key: "cat.grains", descKey: "cat.grains_desc", color: "from-amber-400 to-yellow-500", bg: "bg-amber-50", ring: "ring-amber-200", border: "border-amber-200" },
  { id: "Spices", emoji: "🌶️", key: "cat.spices", descKey: "cat.spices_desc", color: "from-red-400 to-rose-500", bg: "bg-red-50", ring: "ring-red-200", border: "border-red-200" },
  { id: "Flowers", emoji: "🌸", key: "cat.flowers", descKey: "cat.flowers_desc", color: "from-pink-400 to-fuchsia-500", bg: "bg-pink-50", ring: "ring-pink-200", border: "border-pink-200" },
  { id: "Others", emoji: "📦", key: "cat.others", descKey: "cat.others_desc", color: "from-slate-400 to-slate-500", bg: "bg-slate-50", ring: "ring-slate-200", border: "border-slate-200" },
];

export default function CropCategoryCard({ lang, onSelect }: CropCategoryCardProps) {
  const t = getT(lang);

  return (
    <StepCard title={t("cat.title")} subtitle={t("cat.subtitle")} icon="🚜">
      <div className="grid grid-cols-2 gap-3 mt-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => onSelect(cat.id)}
            className={`group relative ${cat.bg} border ${cat.border} hover:${cat.ring} rounded-2xl p-4 text-left transition-all duration-200 cursor-pointer hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 ${cat.ring}`}
          >
            {/* Emoji */}
            <span className="text-4xl block mb-2 group-hover:scale-110 transition-transform duration-200">
              {cat.emoji}
            </span>
            
            {/* Name */}
            <h3 className="font-black text-slate-900 text-base leading-tight">
              {t(cat.key)}
            </h3>
            
            {/* Description */}
            <p className="text-[11px] text-slate-500 font-medium mt-1 leading-snug line-clamp-2">
              {t(cat.descKey)}
            </p>

            {/* Hover arrow */}
            <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </button>
        ))}
      </div>
    </StepCard>
  );
}
