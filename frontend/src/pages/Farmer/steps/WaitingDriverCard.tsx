/**
 * WaitingDriverCard — Step 9: Waiting for Driver Acceptance
 * Simulates the time it takes for a driver to accept the ride request.
 */
import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { type LangCode, getT } from "../../../utils/farmerTranslations";
import StepCard from "../components/StepCard";
import type { FleetVehicle } from "../../../services/farmgoStore";

interface WaitingDriverCardProps {
  lang: LangCode;
  truck: FleetVehicle;
  price: number;
  pickup: string;
  destination: string;
  onAccepted: () => void;
  onCancel: () => void;
}

export default function WaitingDriverCard({
  lang,
  truck,
  price,
  pickup,
  destination,
  onAccepted,
  onCancel,
}: WaitingDriverCardProps) {
  const t = getT(lang);

  // Simulate waiting for driver to accept (5-8 seconds)
  useEffect(() => {
    const timeout = setTimeout(() => {
      onAccepted();
    }, 5000 + Math.random() * 3000);

    return () => clearTimeout(timeout);
  }, [onAccepted]);

  return (
    <StepCard title={t("wait.title")} subtitle={t("wait.subtitle")} icon="⏳" className="max-w-md">
      <div className="flex flex-col items-center py-6 text-center space-y-6">
        
        {/* Radar / Loading Animation */}
        <div className="relative w-32 h-32 flex items-center justify-center">
          <div className="absolute inset-0 border-4 border-amber-200 rounded-full animate-ping opacity-75" />
          <div className="absolute inset-2 border-4 border-amber-300 rounded-full animate-pulse opacity-80" />
          <div className="relative bg-amber-100 rounded-full p-4 shadow-inner">
            <span className="text-4xl block animate-bounce">🚚</span>
          </div>
        </div>

        {/* Status Text */}
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-2 bg-amber-50 text-amber-700 px-3 py-1.5 rounded-full text-xs font-bold border border-amber-200">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span>{t("wait.status")}</span>
          </div>
        </div>

        {/* Booking Details Card */}
        <div className="w-full bg-slate-50 rounded-2xl border border-slate-200 p-4 text-left space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-black text-slate-800">{truck.driver}</span>
            <span className="text-sm font-black text-emerald-700">₹{price.toLocaleString()}</span>
          </div>
          
          <div className="text-xs font-medium text-slate-500 flex items-center space-x-2">
            <span>{truck.name}</span>
            <span>•</span>
            <span>{truck.plateNumber || "TN-XX-XXXX"}</span>
          </div>

          <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs font-bold text-slate-400">
            <span className="truncate max-w-[120px]">{pickup.split(" (")[0]}</span>
            <span>→</span>
            <span className="truncate max-w-[120px]">{destination.split(" (")[0]}</span>
          </div>
        </div>

        {/* Action */}
        <button
          type="button"
          onClick={onCancel}
          className="text-red-500 hover:text-red-600 font-bold text-sm bg-red-50 hover:bg-red-100 px-6 py-2.5 rounded-xl transition-all cursor-pointer border-0"
        >
          {t("wait.cancel")}
        </button>
      </div>
    </StepCard>
  );
}
