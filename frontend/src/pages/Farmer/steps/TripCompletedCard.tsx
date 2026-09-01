/**
 * TripCompletedCard — Step 12: Trip Completion & Rating (Combined)
 */
import { useState } from "react";
import { CheckCircle2, Star, ThumbsUp } from "lucide-react";
import { type LangCode, getT } from "../../../utils/farmerTranslations";
import StepCard from "../components/StepCard";
import type { FleetVehicle } from "../../../services/farmgoStore";

interface TripCompletedCardProps {
  lang: LangCode;
  truck: FleetVehicle;
  price: number;
  destination: string;
  onDashboard: () => void;
}

export default function TripCompletedCard({
  lang,
  truck,
  price,
  destination,
  onDashboard,
}: TripCompletedCardProps) {
  const t = getT(lang);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);

  const tags = [
    { id: "on_time", label: t("complete.tags.on_time") },
    { id: "good_driver", label: t("complete.tags.good_driver") },
    { id: "good_vehicle", label: t("complete.tags.good_vehicle") },
    { id: "fair_price", label: t("complete.tags.fair_price") },
    { id: "easy_booking", label: t("complete.tags.easy_booking") },
  ];

  const toggleTag = (id: string) => {
    setSelectedTags(prev => 
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    );
  };

  const handleSubmit = () => {
    setSubmitted(true);
    setTimeout(() => {
      onDashboard();
    }, 1500);
  };

  if (submitted) {
    return (
      <StepCard title="" className="max-w-md">
        <div className="flex flex-col items-center py-10 text-center space-y-4">
          <ThumbsUp className="w-20 h-20 text-emerald-500 mb-4 animate-bounce" />
          <h2 className="text-2xl font-black text-slate-800">Thank You!</h2>
          <p className="text-slate-500 font-medium">Your rating helps improve FarmGo.</p>
        </div>
      </StepCard>
    );
  }

  return (
    <StepCard title="" className="max-w-md">
      <div className="flex flex-col items-center py-6 text-center space-y-6">
        
        {/* Success Header */}
        <div className="relative">
          <div className="absolute inset-0 bg-emerald-100 rounded-full animate-ping opacity-60" />
          <CheckCircle2 className="relative w-20 h-20 text-emerald-500 drop-shadow-md" />
        </div>

        <div>
          <h2 className="text-2xl font-black text-slate-800">{t("complete.title")}</h2>
          <p className="text-sm font-medium text-slate-500 mt-1">{destination}</p>
        </div>

        {/* Price Info */}
        <div className="w-full bg-emerald-50 border border-emerald-100 rounded-2xl p-4">
          <div className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider mb-1">{t("complete.final_price")}</div>
          <div className="font-black text-3xl text-emerald-700">₹{price.toLocaleString()}</div>
        </div>

        {/* Divider */}
        <div className="w-full h-px bg-slate-100 my-2" />

        {/* Rating Section */}
        <div className="w-full space-y-4">
          <h3 className="font-black text-slate-800">{t("complete.rate_title")}</h3>
          
          <div className="flex justify-center space-x-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(star)}
                className="bg-transparent border-0 cursor-pointer p-1 transition-transform hover:scale-110 focus:outline-none"
              >
                <Star
                  className={`w-10 h-10 transition-colors ${
                    star <= (hoverRating || rating)
                      ? "fill-amber-400 text-amber-400"
                      : "fill-slate-100 text-slate-200"
                  }`}
                />
              </button>
            ))}
          </div>

          {rating > 0 && (
            <div className="flex flex-wrap gap-2 justify-center animate-fadeIn pt-2">
              {tags.map((tag) => (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => toggleTag(tag.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer border ${
                    selectedTags.includes(tag.id)
                      ? "bg-emerald-50 border-emerald-400 text-emerald-700"
                      : "bg-white border-slate-200 text-slate-500 hover:border-emerald-200"
                  }`}
                >
                  {tag.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="w-full space-y-3 pt-4">
          <button
            type="button"
            onClick={rating > 0 ? handleSubmit : onDashboard}
            className={`w-full py-4 rounded-2xl font-black text-base cursor-pointer border-0 transition-all ${
              rating > 0
                ? "bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-lg shadow-emerald-200 hover:shadow-xl hover:scale-[1.01]"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {rating > 0 ? t("complete.submit") : t("complete.go_dashboard")}
          </button>
        </div>
      </div>
    </StepCard>
  );
}
