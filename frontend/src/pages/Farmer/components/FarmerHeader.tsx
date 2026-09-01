/**
 * FarmerHeader — Persistent header across all farmer flow screens.
 * Shows: Back button, FarmGo logo, Language switcher, Sign-out button
 */
import { ArrowLeft, Globe, LogOut, Sprout } from "lucide-react";
import { type LangCode, getT } from "../../../utils/farmerTranslations";

interface FarmerHeaderProps {
  lang: LangCode;
  onBack?: () => void;
  onSignOut: () => void;
  onLanguageClick: () => void;
  showBack?: boolean;
}

export default function FarmerHeader({
  lang,
  onBack,
  onSignOut,
  onLanguageClick,
  showBack = true,
}: FarmerHeaderProps) {
  const t = getT(lang);

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-emerald-100 shadow-sm">
      <div className="max-w-lg mx-auto flex items-center justify-between px-4 py-3">
        {/* Left: Back button */}
        <div className="flex items-center space-x-2 min-w-[80px]">
          {showBack && onBack ? (
            <button
              type="button"
              onClick={onBack}
              className="flex items-center space-x-1.5 text-emerald-700 hover:text-emerald-900 font-bold text-sm transition-all cursor-pointer bg-emerald-50 hover:bg-emerald-100 px-3 py-2 rounded-xl border-0"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">{t("header.back")}</span>
            </button>
          ) : (
            <div className="w-10" />
          )}
        </div>

        {/* Center: Logo */}
        <div className="flex items-center space-x-2">
          <div className="bg-gradient-to-br from-emerald-500 to-green-600 p-1.5 rounded-xl shadow-md shadow-emerald-200">
            <Sprout className="w-5 h-5 text-white" />
          </div>
          <span className="font-black text-lg bg-gradient-to-r from-emerald-700 to-green-600 bg-clip-text text-transparent">
            FarmGo
          </span>
        </div>

        {/* Right: Language + Signout */}
        <div className="flex items-center space-x-1.5 min-w-[80px] justify-end">
          <button
            type="button"
            onClick={onLanguageClick}
            className="flex items-center space-x-1 text-slate-600 hover:text-emerald-700 bg-slate-50 hover:bg-emerald-50 px-2.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border-0"
            title={t("header.language")}
          >
            <Globe className="w-3.5 h-3.5" />
            <span className="uppercase">{lang}</span>
          </button>
          <button
            type="button"
            onClick={onSignOut}
            className="flex items-center space-x-1 text-slate-500 hover:text-red-600 bg-slate-50 hover:bg-red-50 px-2.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border-0"
            title={t("header.signout")}
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
}
