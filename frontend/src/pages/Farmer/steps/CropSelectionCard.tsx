/**
 * CropSelectionCard — Step 2: Select specific crop from chosen category
 * Grid of crop cards with emoji + image + crop name (bilingual)
 */
import { useState } from "react";
import { Search } from "lucide-react";
import { type LangCode, getT } from "../../../utils/farmerTranslations";
import StepCard from "../components/StepCard";

interface CropItem {
  name: string;
  tamil: string;
  img: string;
  emoji: string;
}

interface CropSelectionCardProps {
  lang: LangCode;
  category: string;
  onSelect: (cropName: string) => void;
}

const CROPS_BY_CATEGORY: Record<string, CropItem[]> = {
  Vegetables: [
    { name: "Tomato", tamil: "தக்காளி", img: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=200&auto=format&fit=crop&q=60", emoji: "🍅" },
    { name: "Onion", tamil: "வெங்காயம்", img: "https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=200&auto=format&fit=crop&q=60", emoji: "🧅" },
    { name: "Potato", tamil: "உருளைக்கிழங்கு", img: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=200&auto=format&fit=crop&q=60", emoji: "🥔" },
    { name: "Carrot", tamil: "கேரட்", img: "https://images.unsplash.com/photo-1582515073490-39981397c445?w=200&auto=format&fit=crop&q=60", emoji: "🥕" },
    { name: "Brinjal", tamil: "கத்திரிக்காய்", img: "https://images.unsplash.com/photo-1595855759920-86582396756a?w=200&auto=format&fit=crop&q=60", emoji: "🍆" },
    { name: "Lady's Finger", tamil: "வெண்டைக்காய்", img: "https://images.unsplash.com/photo-1425543103986-22abb7d7e8d2?w=200&auto=format&fit=crop&q=60", emoji: "🫛" },
    { name: "Cabbage", tamil: "முட்டைக்கோஸ்", img: "https://images.unsplash.com/photo-1594282486552-05b4d80fbb9f?w=200&auto=format&fit=crop&q=60", emoji: "🥬" },
    { name: "Cauliflower", tamil: "காலிஃபிளவர்", img: "https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=200&auto=format&fit=crop&q=60", emoji: "🥦" },
    { name: "Beans", tamil: "பீன்ஸ்", img: "https://images.unsplash.com/photo-1567375698348-5d9d5ae10c57?w=200&auto=format&fit=crop&q=60", emoji: "🫘" },
    { name: "Drumstick", tamil: "முருங்கை", img: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=200&auto=format&fit=crop&q=60", emoji: "🌿" },
  ],
  Fruits: [
    { name: "Apple", tamil: "ஆப்பிள்", img: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=200&auto=format&fit=crop&q=60", emoji: "🍎" },
    { name: "Orange", tamil: "ஆரஞ்சு", img: "https://images.unsplash.com/photo-1547514701-42782101795e?w=200&auto=format&fit=crop&q=60", emoji: "🍊" },
    { name: "Guava", tamil: "கொய்யா", img: "https://images.unsplash.com/photo-1536511132770-e5058c7e8c46?w=200&auto=format&fit=crop&q=60", emoji: "🍐" },
    { name: "Banana", tamil: "வாழைப்பழம்", img: "https://images.unsplash.com/photo-1528825871115-3581a5387919?w=200&auto=format&fit=crop&q=60", emoji: "🍌" },
    { name: "Mango", tamil: "மாம்பழம்", img: "https://images.unsplash.com/photo-1553279768-865429fa0078?w=200&auto=format&fit=crop&q=60", emoji: "🥭" },
    { name: "Grapes", tamil: "திராட்சை", img: "https://images.unsplash.com/photo-1537640538966-79f369143f8f?w=200&auto=format&fit=crop&q=60", emoji: "🍇" },
    { name: "Pomegranate", tamil: "மாதுளை", img: "https://images.unsplash.com/photo-1541344999736-83eca272f6fc?w=200&auto=format&fit=crop&q=60", emoji: "🍎" },
    { name: "Papaya", tamil: "பப்பாளி", img: "https://images.unsplash.com/photo-1617112848923-cc2234396a8d?w=200&auto=format&fit=crop&q=60", emoji: "🍈" },
    { name: "Pineapple", tamil: "அன்னாசி", img: "https://images.unsplash.com/photo-1490885578174-acda8905c2c6?w=200&auto=format&fit=crop&q=60", emoji: "🍍" },
    { name: "Watermelon", tamil: "தர்பூசணி", img: "https://images.unsplash.com/photo-1563114773-84221bd62daa?w=200&auto=format&fit=crop&q=60", emoji: "🍉" },
  ],
  Grains: [
    { name: "Rice", tamil: "அரிசி", img: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=200&auto=format&fit=crop&q=60", emoji: "🌾" },
    { name: "Wheat", tamil: "கோதுமை", img: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=200&auto=format&fit=crop&q=60", emoji: "🌾" },
    { name: "Maize", tamil: "மக்காச்சோளம்", img: "https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=200&auto=format&fit=crop&q=60", emoji: "🌽" },
    { name: "Millets", tamil: "கேழ்வரகு", img: "https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=200&auto=format&fit=crop&q=60", emoji: "🥣" },
    { name: "Pulses", tamil: "பருப்பு", img: "https://images.unsplash.com/photo-1515543904379-3d757afe72e4?w=200&auto=format&fit=crop&q=60", emoji: "🫘" },
    { name: "Groundnut", tamil: "நிலக்கடலை", img: "https://images.unsplash.com/photo-1567892336336-69d675662709?w=200&auto=format&fit=crop&q=60", emoji: "🥜" },
  ],
  Spices: [
    { name: "Turmeric", tamil: "மஞ்சள்", img: "https://images.unsplash.com/photo-1615529182904-14819c35db37?w=200&auto=format&fit=crop&q=60", emoji: "🟡" },
    { name: "Red Chilli", tamil: "மிளகாய்", img: "https://images.unsplash.com/photo-1588252303782-cb80119abd6d?w=200&auto=format&fit=crop&q=60", emoji: "🌶️" },
    { name: "Ginger", tamil: "இஞ்சி", img: "https://images.unsplash.com/photo-1603048588665-791ca9571c9a?w=200&auto=format&fit=crop&q=60", emoji: "🫚" },
    { name: "Garlic", tamil: "பூண்டு", img: "https://images.unsplash.com/photo-1540148426945-6cf22a6b2383?w=200&auto=format&fit=crop&q=60", emoji: "🧄" },
    { name: "Cardamom", tamil: "ஏலக்காய்", img: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=200&auto=format&fit=crop&q=60", emoji: "💚" },
    { name: "Black Pepper", tamil: "மிளகு", img: "https://images.unsplash.com/photo-1599909533731-0e5a0a702693?w=200&auto=format&fit=crop&q=60", emoji: "⚫" },
  ],
  Flowers: [
    { name: "Jasmine", tamil: "மல்லிகை", img: "https://images.unsplash.com/photo-1592722212260-eb0c8742d4a2?w=200&auto=format&fit=crop&q=60", emoji: "🌸" },
    { name: "Rose", tamil: "ரோஜா", img: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=200&auto=format&fit=crop&q=60", emoji: "🌹" },
    { name: "Marigold", tamil: "சாமந்தி", img: "https://images.unsplash.com/photo-1597848212624-a19eb35e2651?w=200&auto=format&fit=crop&q=60", emoji: "🌼" },
    { name: "Lotus", tamil: "தாமரை", img: "https://images.unsplash.com/photo-1508610048659-a06b669e3321?w=200&auto=format&fit=crop&q=60", emoji: "🪷" },
  ],
  Others: [
    { name: "Sugarcane", tamil: "கரும்பு", img: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=200&auto=format&fit=crop&q=60", emoji: "🎋" },
    { name: "Cotton", tamil: "பருத்தி", img: "https://images.unsplash.com/photo-1603714228681-b39917d87d3e?w=200&auto=format&fit=crop&q=60", emoji: "☁️" },
    { name: "Cashew Nut", tamil: "முந்திரி", img: "https://images.unsplash.com/photo-1509358217973-885695ee9155?w=200&auto=format&fit=crop&q=60", emoji: "🥜" },
    { name: "Other Cargo", tamil: "மற்ற சரக்கு", img: "https://images.unsplash.com/photo-1574226516831-e1dff420e562?w=200&auto=format&fit=crop&q=60", emoji: "📦" },
  ],
};

export default function CropSelectionCard({ lang, category, onSelect }: CropSelectionCardProps) {
  const t = getT(lang);
  const [search, setSearch] = useState("");
  const crops = CROPS_BY_CATEGORY[category] || [];
  const isTamil = lang === "ta";

  const filtered = search
    ? crops.filter(
        (c) =>
          c.name.toLowerCase().includes(search.toLowerCase()) ||
          c.tamil.includes(search)
      )
    : crops;

  return (
    <StepCard title={t("crop.title")} subtitle={t("crop.subtitle")} icon="🌿">
      {/* Search bar */}
      {crops.length > 6 && (
        <div className="relative mb-4">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder={t("crop.search")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all"
          />
        </div>
      )}

      {/* Crop grid */}
      <div className="grid grid-cols-3 gap-2.5">
        {filtered.map((crop) => (
          <button
            key={crop.name}
            type="button"
            onClick={() => onSelect(crop.name)}
            className="group bg-white border border-slate-200 hover:border-emerald-400 rounded-2xl p-3 text-center transition-all duration-200 cursor-pointer hover:shadow-lg hover:scale-[1.03] active:scale-[0.97] focus:outline-none focus:ring-2 focus:ring-emerald-200"
          >
            {/* Crop image */}
            <div className="w-full aspect-square rounded-xl overflow-hidden mb-2 bg-slate-100">
              <img
                src={crop.img}
                alt={crop.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                loading="lazy"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                  (e.target as HTMLImageElement).parentElement!.innerHTML = `<span class="text-3xl flex items-center justify-center h-full">${crop.emoji}</span>`;
                }}
              />
            </div>

            {/* Crop name */}
            <div className="font-bold text-xs text-slate-800 leading-tight">
              {isTamil ? crop.tamil : crop.name}
            </div>
            {isTamil && (
              <div className="text-[9px] text-slate-400 font-medium mt-0.5">{crop.name}</div>
            )}
            {!isTamil && (
              <div className="text-[9px] text-slate-400 font-medium mt-0.5">{crop.tamil}</div>
            )}
          </button>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-8 text-slate-400">
          <span className="text-3xl block mb-2">🔍</span>
          <p className="text-sm font-medium">No crops found</p>
        </div>
      )}
    </StepCard>
  );
}
