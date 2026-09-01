/**
 * ProgressBar — Step progress indicator for the farmer booking flow.
 * Shows: 1 Crop → 2 Quantity → 3 Route → 4 AI Plan → 5 Truck → 6 Track
 */
import { type LangCode, getT } from "../../../utils/farmerTranslations";

interface ProgressBarProps {
  currentStep: number; // 1-6
  lang: LangCode;
}

const STEPS = [
  { num: 1, key: "progress.crop", icon: "🌱" },
  { num: 2, key: "progress.quantity", icon: "⚖️" },
  { num: 3, key: "progress.route", icon: "📍" },
  { num: 4, key: "progress.ai", icon: "🤖" },
  { num: 5, key: "progress.truck", icon: "🚚" },
  { num: 6, key: "progress.track", icon: "📡" },
];

export default function ProgressBar({ currentStep, lang }: ProgressBarProps) {
  const t = getT(lang);

  return (
    <div className="w-full bg-white border-b border-slate-100 px-4 py-3">
      <div className="max-w-lg mx-auto">
        {/* Step indicators */}
        <div className="flex items-center justify-between relative">
          {/* Connecting line */}
          <div className="absolute top-4 left-6 right-6 h-0.5 bg-slate-200 z-0" />
          <div
            className="absolute top-4 left-6 h-0.5 bg-emerald-500 z-0 transition-all duration-500"
            style={{
              width: `${Math.max(0, ((currentStep - 1) / (STEPS.length - 1)) * 100)}%`,
              maxWidth: "calc(100% - 48px)",
            }}
          />

          {STEPS.map((step) => {
            const isActive = step.num === currentStep;
            const isCompleted = step.num < currentStep;
            const isFuture = step.num > currentStep;

            return (
              <div key={step.num} className="flex flex-col items-center z-10 relative">
                {/* Circle */}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all duration-300 ${
                    isCompleted
                      ? "bg-emerald-500 text-white shadow-md shadow-emerald-200"
                      : isActive
                      ? "bg-emerald-500 text-white shadow-lg shadow-emerald-200 ring-4 ring-emerald-100 scale-110"
                      : "bg-slate-100 text-slate-400"
                  }`}
                >
                  {isCompleted ? "✓" : step.num}
                </div>
                {/* Label */}
                <span
                  className={`text-[10px] font-bold mt-1.5 transition-all ${
                    isActive
                      ? "text-emerald-700"
                      : isCompleted
                      ? "text-emerald-500"
                      : "text-slate-400"
                  }`}
                >
                  {t(step.key)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
