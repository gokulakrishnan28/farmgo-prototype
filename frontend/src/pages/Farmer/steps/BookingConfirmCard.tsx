/**
 * BookingConfirmCard — Step 8: Final trip summary before booking
 */
import { MapPin, Truck, Calendar } from "lucide-react";
import { type LangCode, getT } from "../../../utils/farmerTranslations";
import StepCard from "../components/StepCard";
import type { FleetVehicle } from "../../../services/farmgoStore";

interface BookingConfirmCardProps {
  lang: LangCode;
  cropName: string;
  quantity: number;
  unit: string;
  pickup: string;
  destination: string;
  distanceKm: number;
  truck: FleetVehicle;
  price: number;
  onBook: () => void;
  onChangeTruck: () => void;
}

export default function BookingConfirmCard({
  lang,
  cropName,
  quantity,
  unit,
  pickup,
  destination,
  distanceKm,
  truck,
  price,
  onBook,
  onChangeTruck,
}: BookingConfirmCardProps) {
  const t = getT(lang);
  const estTime = distanceKm ? `${Math.round(distanceKm / 50)} hrs` : "N/A";

  return (
    <StepCard title={t("book.title")} icon="📋">
      <div className="space-y-4">
        
        {/* Crop & Quantity */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex justify-between items-center">
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t("book.crop")}</div>
            <div className="font-black text-slate-800 text-lg">{cropName}</div>
          </div>
          <div className="text-right">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t("book.quantity")}</div>
            <div className="font-black text-emerald-700 text-lg">{quantity} {unit}</div>
          </div>
        </div>

        {/* Route */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
          <div className="flex items-start space-x-3">
            <div className="mt-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 block" />
            </div>
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t("book.pickup")}</div>
              <div className="text-sm font-bold text-slate-800">{pickup}</div>
            </div>
          </div>
          
          <div className="pl-1 border-l-2 border-slate-200 ml-1 h-4" />
          
          <div className="flex items-start space-x-3">
            <div className="mt-1">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 block" />
            </div>
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t("book.destination")}</div>
              <div className="text-sm font-bold text-slate-800">{destination}</div>
            </div>
          </div>

          <div className="flex justify-between text-xs font-bold text-slate-500 pt-3 border-t border-slate-200">
            <span>{t("book.est_distance")}: <span className="text-slate-700">{distanceKm} km</span></span>
            <span>{t("book.est_time")}: <span className="text-slate-700">{estTime}</span></span>
          </div>
        </div>

        {/* Truck Details */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
          <div className="flex justify-between items-start mb-2">
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t("book.truck")}</div>
              <div className="font-black text-slate-800">{truck.name}</div>
            </div>
            <div className="text-right">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t("book.price")}</div>
              <div className="font-black text-xl text-slate-900">₹{price.toLocaleString()}</div>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-xs font-bold text-slate-500">
            <span>{t("book.driver")}:</span>
            <span className="text-slate-700">{truck.driver}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="pt-2 space-y-3">
          <button
            type="button"
            onClick={onBook}
            className="w-full bg-gradient-to-r from-emerald-500 to-green-600 text-white py-4 rounded-2xl font-black text-lg cursor-pointer border-0 shadow-lg shadow-emerald-200 hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center space-x-2"
          >
            <Truck className="w-5 h-5" />
            <span>{t("book.book_truck")}</span>
          </button>
          
          <button
            type="button"
            onClick={onChangeTruck}
            className="w-full bg-white text-slate-500 font-bold py-3 rounded-2xl text-sm cursor-pointer border border-slate-200 hover:bg-slate-50 transition-all"
          >
            {t("book.change_truck")}
          </button>
        </div>
        
      </div>
    </StepCard>
  );
}
