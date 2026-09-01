/**
 * AiAnalysisCard — Step 5: Loading/analysis screen
 * Shows animated sequence of FarmGo AI analyzing the trip details
 */
import { useEffect, useState } from "react";
import { Sparkles, CheckCircle2 } from "lucide-react";
import { type LangCode, getT } from "../../../utils/farmerTranslations";
import StepCard from "../components/StepCard";

interface AiAnalysisCardProps {
  lang: LangCode;
  onComplete: () => void;
}

export default function AiAnalysisCard({ lang, onComplete }: AiAnalysisCardProps) {
  const t = getT(lang);
  const [progress, setProgress] = useState(0);

  const steps = [
    { key: "ai.crop_identified" },
    { key: "ai.quantity_calculated" },
    { key: "ai.destination_confirmed" },
    { key: "ai.storage_analyzed" },
    { key: "ai.vehicles_identified" },
  ];

  useEffect(() => {
    // Simulate AI loading steps
    let currentStep = 0;
    const interval = setInterval(() => {
      currentStep++;
      setProgress(currentStep);
      
      if (currentStep >= steps.length + 1) {
        clearInterval(interval);
        setTimeout(onComplete, 800);
      }
    }, 700); // 700ms per step

    return () => clearInterval(interval);
  }, [onComplete, steps.length]);

  return (
    <StepCard title="" className="max-w-md">
      <div className="flex flex-col items-center justify-center py-10 px-4 space-y-8 text-center">
        {/* Animated AI Icon */}
        <div className="relative">
          <div className="absolute inset-0 bg-emerald-200 rounded-full animate-ping opacity-50" />
          <div className="relative bg-gradient-to-br from-emerald-400 to-green-600 w-24 h-24 rounded-full flex items-center justify-center shadow-xl shadow-emerald-200">
            <Sparkles className="w-10 h-10 text-white animate-pulse" />
          </div>
        </div>

        <h2 className="text-xl font-black text-slate-800 leading-tight">
          {t("ai.title")}
        </h2>

        {/* Progress Checklist */}
        <div className="w-full space-y-3 pt-4 text-left px-4">
          {steps.map((step, index) => {
            const isCompleted = progress > index;
            const isCurrent = progress === index;
            const isPending = progress < index;

            return (
              <div
                key={step.key}
                className={`flex items-center space-x-3 transition-all duration-500 ${
                  isCompleted ? "opacity-100" : isCurrent ? "opacity-100 animate-pulse" : "opacity-30"
                }`}
              >
                {isCompleted ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                ) : (
                  <div className={`w-5 h-5 rounded-full flex-shrink-0 border-2 ${
                    isCurrent ? "border-emerald-400 border-t-emerald-600 animate-spin" : "border-slate-200"
                  }`} />
                )}
                <span className={`text-sm font-bold ${
                  isCompleted ? "text-slate-800" : isCurrent ? "text-emerald-700" : "text-slate-400"
                }`}>
                  {t(step.key)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </StepCard>
  );
}
