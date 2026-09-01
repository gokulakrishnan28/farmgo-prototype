/**
 * QuantityCard — Step 3: Enter weight/quantity
 * Large numeric input with unit selector and quick-select buttons.
 */
import { useState } from "react";
import { type LangCode, getT } from "../../../utils/farmerTranslations";
import StepCard from "../components/StepCard";

interface QuantityCardProps {
  lang: LangCode;
  cropName: string;
  onConfirm: (quantity: number, unit: string) => void;
}

const QUICK_AMOUNTS = [1, 5, 10, 20, 25, 50];

export default function QuantityCard({ lang, cropName, onConfirm }: QuantityCardProps) {
  const t = getT(lang);
  const [quantity, setQuantity] = useState<string>("");
  const [unit, setUnit] = useState<string>("Ton");

  const units = [
    { id: "Kg", label: t("qty.kg") },
    { id: "Quintal", label: t("qty.quintal") },
    { id: "Ton", label: t("qty.ton") },
  ];

  const handleContinue = () => {
    const num = parseFloat(quantity);
    if (!num || num <= 0) return;
    onConfirm(num, unit);
  };

  const numericValue = parseFloat(quantity) || 0;

  return (
    <StepCard title={t("qty.title")} subtitle={t("qty.subtitle")} icon="⚖️">
      {/* Selected crop indicator */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl px-4 py-3 mb-5 flex items-center space-x-3">
        <span className="text-2xl">🌱</span>
        <div>
          <div className="text-xs text-emerald-600 font-bold uppercase tracking-wide">Selected Crop</div>
          <div className="text-base font-black text-emerald-800">{cropName}</div>
        </div>
      </div>

      {/* Quantity input */}
      <div className="space-y-4">
        <div className="relative">
          <input
            type="number"
            inputMode="decimal"
            placeholder={t("qty.placeholder")}
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="w-full text-center text-4xl font-black py-6 bg-slate-50 border-2 border-slate-200 rounded-3xl outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all text-slate-900 placeholder:text-slate-300"
            min="0"
            step="0.5"
          />
        </div>

        {/* Unit selector */}
        <div className="flex space-x-2 justify-center">
          {units.map((u) => (
            <button
              key={u.id}
              type="button"
              onClick={() => setUnit(u.id)}
              className={`px-5 py-2.5 rounded-2xl font-bold text-sm transition-all cursor-pointer border-0 ${
                unit === u.id
                  ? "bg-emerald-500 text-white shadow-md shadow-emerald-200"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {u.label}
            </button>
          ))}
        </div>

        {/* Display */}
        {numericValue > 0 && (
          <div className="text-center py-2">
            <span className="text-2xl font-black text-emerald-700">
              {numericValue} {unit}
            </span>
          </div>
        )}

        {/* Quick amount buttons */}
        <div className="space-y-2">
          <p className="text-xs text-slate-400 font-bold text-center uppercase tracking-wide">Quick Select (Ton)</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {QUICK_AMOUNTS.map((amt) => (
              <button
                key={amt}
                type="button"
                onClick={() => { setQuantity(String(amt)); setUnit("Ton"); }}
                className={`px-4 py-2 rounded-xl font-bold text-sm transition-all cursor-pointer border ${
                  quantity === String(amt) && unit === "Ton"
                    ? "bg-emerald-50 border-emerald-400 text-emerald-700"
                    : "bg-white border-slate-200 text-slate-600 hover:border-emerald-300 hover:bg-emerald-50"
                }`}
              >
                {amt}T
              </button>
            ))}
          </div>
        </div>

        {/* Continue Button */}
        <button
          type="button"
          onClick={handleContinue}
          disabled={!numericValue || numericValue <= 0}
          className={`w-full py-4 rounded-2xl font-black text-base transition-all cursor-pointer border-0 mt-4 ${
            numericValue > 0
              ? "bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-lg shadow-emerald-200 hover:shadow-xl hover:scale-[1.01] active:scale-[0.99]"
              : "bg-slate-200 text-slate-400 cursor-not-allowed"
          }`}
        >
          {t("qty.continue")} →
        </button>
      </div>
    </StepCard>
  );
}
