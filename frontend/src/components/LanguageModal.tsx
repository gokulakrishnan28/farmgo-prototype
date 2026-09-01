import { Globe, Check, X } from "lucide-react";

export type LanguageCode = "en" | "ta" | "hi" | "mr";

interface LanguageModalProps {
  isOpen: boolean;
  currentLang: LanguageCode;
  onSelectLanguage: (lang: LanguageCode) => void;
  onClose: () => void;
}

const LANGUAGES: Array<{ code: LanguageCode; name: string; nativeName: string; flag: string }> = [
  { code: "en", name: "English", nativeName: "English", flag: "🇬🇧" },
  { code: "ta", name: "Tamil", nativeName: "தமிழ்", flag: "🇮🇳" },
  { code: "hi", name: "Hindi", nativeName: "हिन्दी", flag: "🇮🇳" },
  { code: "mr", name: "Marathi", nativeName: "मराठी", flag: "🇮🇳" },
];

export default function LanguageModal({
  isOpen,
  currentLang,
  onSelectLanguage,
  onClose,
}: LanguageModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-md p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-md overflow-hidden space-y-5 p-6">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center space-x-2.5">
            <div className="bg-emerald-100 text-emerald-700 p-2.5 rounded-2xl">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 leading-tight">Select Language / மொழி தேர்வு</h3>
              <p className="text-xs text-slate-500 font-medium">Choose your preferred language for FarmGo</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 p-2 rounded-xl text-xs font-bold transition-all cursor-pointer border-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 4 Clickable Language Options */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {LANGUAGES.map((lang) => {
            const isSelected = currentLang === lang.code;
            return (
              <button
                key={lang.code}
                type="button"
                onClick={() => {
                  onSelectLanguage(lang.code);
                  onClose();
                }}
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between group ${
                  isSelected
                    ? "bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/20 shadow-sm"
                    : "bg-white border-slate-200 hover:border-emerald-300 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{lang.flag}</span>
                  <div>
                    <div className="font-extrabold text-slate-900 text-sm leading-tight">
                      {lang.nativeName}
                    </div>
                    <div className="text-[11px] text-slate-400 font-medium">
                      {lang.name}
                    </div>
                  </div>
                </div>

                {isSelected && (
                  <div className="bg-emerald-500 text-white p-1 rounded-full shadow-xs">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        <p className="text-[11px] text-slate-400 text-center font-medium pt-2">
          Languages supported: English, Tamil (தமிழ்), Hindi (हिन्दी), Marathi (मराठी).
        </p>
      </div>
    </div>
  );
}
