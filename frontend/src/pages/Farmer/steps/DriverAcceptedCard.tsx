/**
 * DriverAcceptedCard — Step 10: Driver Accepted Confirmation
 */
import { CheckCircle2, Star, Navigation } from "lucide-react";
import { type LangCode, getT } from "../../../utils/farmerTranslations";
import StepCard from "../components/StepCard";
import type { FleetVehicle } from "../../../services/farmgoStore";

interface DriverAcceptedCardProps {
  lang: LangCode;
  truck: FleetVehicle;
  price: number;
  onTrack: () => void;
}

export default function DriverAcceptedCard({ lang, truck, price, onTrack }: DriverAcceptedCardProps) {
  const t = getT(lang);

  return (
    <StepCard title="" className="max-w-md">
      <div className="flex flex-col items-center py-6 text-center space-y-6">
        
        <div className="relative">
          <div className="absolute inset-0 bg-emerald-100 rounded-full animate-ping opacity-60" />
          <CheckCircle2 className="relative w-24 h-24 text-emerald-500 drop-shadow-md" />
        </div>

        <div>
          <h2 className="text-2xl font-black text-slate-800">{t("accepted.title")}</h2>
        </div>

        <div className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
          
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 bg-slate-200 rounded-full overflow-hidden border-2 border-white shadow-sm flex-shrink-0">
              {/* Fallback avatar */}
              <img src={`https://ui-avatars.com/api/?name=${truck.driver}&background=10b981&color=fff`} alt={truck.driver} className="w-full h-full object-cover" />
            </div>
            <div className="text-left flex-1">
              <h3 className="font-black text-slate-900 text-lg">{truck.driver}</h3>
              <div className="flex items-center space-x-1.5 text-amber-500 text-xs font-bold bg-amber-50 inline-flex px-1.5 py-0.5 rounded">
                <Star className="w-3.5 h-3.5 fill-current" />
                <span>4.8</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-200 text-left">
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t("progress.truck")}</div>
              <div className="font-bold text-slate-800 text-sm truncate">{truck.name}</div>
              <div className="text-xs font-medium text-slate-500">{truck.plateNumber || "TN-45-AB-1234"}</div>
            </div>
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t("book.price")}</div>
              <div className="font-black text-emerald-700 text-lg">₹{price.toLocaleString()}</div>
            </div>
          </div>

          <div className="bg-emerald-50 rounded-xl p-3 flex items-center justify-between border border-emerald-100">
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">{t("accepted.pickup_eta")}</span>
            <span className="font-black text-emerald-800">12 mins</span>
          </div>

        </div>

        <button
          type="button"
          onClick={onTrack}
          className="w-full bg-gradient-to-r from-emerald-500 to-green-600 text-white py-4 rounded-2xl font-black text-lg cursor-pointer border-0 shadow-lg shadow-emerald-200 hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center space-x-2"
        >
          <Navigation className="w-5 h-5" />
          <span>{t("accepted.track")}</span>
        </button>
      </div>
    </StepCard>
  );
}
