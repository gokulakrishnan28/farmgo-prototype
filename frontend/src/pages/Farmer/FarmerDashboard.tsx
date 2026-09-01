/**
 * FarmerDashboard — Simple entry point for farmers before starting the flow.
 */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PlusCircle, Clock, Truck, TrendingUp, Settings } from "lucide-react";
import { type LangCode, getT } from "../../utils/farmerTranslations";
import FarmerHeader from "./components/FarmerHeader";
import StepCard from "./components/StepCard";

export default function FarmerDashboard() {
  const navigate = useNavigate();
  const [lang, setLang] = useState<LangCode>("en");

  useEffect(() => {
    const saved = localStorage.getItem("farmgo_lang") as LangCode;
    if (saved && ["en", "ta", "hi", "mr"].includes(saved)) {
      setLang(saved);
    }
  }, []);

  const toggleLang = () => {
    const langs: LangCode[] = ["en", "ta", "hi", "mr"];
    const nextIdx = (langs.indexOf(lang) + 1) % langs.length;
    const nextLang = langs[nextIdx];
    setLang(nextLang);
    localStorage.setItem("farmgo_lang", nextLang);
  };

  const t = getT(lang);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <FarmerHeader
        lang={lang}
        onLanguageClick={toggleLang}
        onSignOut={() => navigate("/")}
        showBack={false}
      />

      <main className="flex-1 w-full max-w-xl mx-auto py-6">
        <StepCard title={t("dash.welcome")} subtitle="Mohamed Karib" className="!pt-2">
          
          <div className="space-y-4 mt-2">
            
            {/* Primary Action */}
            <button
              type="button"
              onClick={() => navigate("/farmer/book")}
              className="w-full group bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-3xl p-6 shadow-xl shadow-emerald-200 hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all border-0 text-left cursor-pointer flex flex-col"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="bg-white/20 p-3 rounded-2xl">
                  <Truck className="w-8 h-8 text-white" />
                </div>
                <div className="bg-white/90 text-emerald-700 px-3 py-1 rounded-full text-xs font-black shadow-sm">
                  NEW
                </div>
              </div>
              <h3 className="text-2xl font-black mb-1">{t("dash.book_transport")}</h3>
              <p className="text-emerald-100 font-medium text-sm">Ship your crops directly to market or let AI find the best price.</p>
              
              <div className="mt-4 flex items-center space-x-2 text-white font-bold group-hover:translate-x-1 transition-transform">
                <PlusCircle className="w-5 h-5" />
                <span>Start Booking →</span>
              </div>
            </button>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col justify-center shadow-sm">
                <div className="flex items-center space-x-2 text-slate-500 mb-2">
                  <TrendingUp className="w-4 h-4 text-emerald-500" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">{t("dash.ai_mandi")}</span>
                </div>
                <div className="font-black text-slate-800 text-lg">Market Trends</div>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col justify-center shadow-sm">
                <div className="flex items-center space-x-2 text-slate-500 mb-2">
                  <Clock className="w-4 h-4 text-blue-500" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">{t("dash.booking_history")}</span>
                </div>
                <div className="font-black text-slate-800 text-lg">Past Trips</div>
              </div>
            </div>

            {/* Recent Trip (Mock) */}
            <div className="bg-slate-100 border border-slate-200 rounded-3xl p-5 mt-4">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Recent Activity</h4>
              <div className="flex items-center justify-between bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
                <div className="flex items-center space-x-3">
                  <div className="text-3xl">🍅</div>
                  <div>
                    <div className="font-bold text-slate-900">Tomato • 5 Tons</div>
                    <div className="text-xs text-slate-500">Delivered • 2 days ago</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-black text-emerald-600">₹85,000</div>
                  <div className="text-[10px] font-bold text-slate-400">Net Return</div>
                </div>
              </div>
            </div>
            
          </div>

        </StepCard>
      </main>

      {/* Bottom Nav */}
      <div className="sticky bottom-0 z-40 bg-white border-t border-slate-200 pb-safe shadow-[0_-5px_20px_-10px_rgba(0,0,0,0.1)]">
        <div className="max-w-lg mx-auto flex justify-around p-3">
          <button className="flex flex-col items-center p-2 text-emerald-600 border-0 bg-transparent cursor-pointer">
            <TrendingUp className="w-6 h-6 mb-1" />
            <span className="text-[10px] font-bold">{t("nav.home")}</span>
          </button>
          <button onClick={() => navigate("/farmer/book")} className="flex flex-col items-center p-2 text-slate-400 hover:text-emerald-500 border-0 bg-transparent cursor-pointer transition-colors">
            <Truck className="w-6 h-6 mb-1" />
            <span className="text-[10px] font-bold">{t("nav.book")}</span>
          </button>
          <button className="flex flex-col items-center p-2 text-slate-400 hover:text-emerald-500 border-0 bg-transparent cursor-pointer transition-colors">
            <Clock className="w-6 h-6 mb-1" />
            <span className="text-[10px] font-bold">{t("nav.trips")}</span>
          </button>
          <button className="flex flex-col items-center p-2 text-slate-400 hover:text-emerald-500 border-0 bg-transparent cursor-pointer transition-colors">
            <Settings className="w-6 h-6 mb-1" />
            <span className="text-[10px] font-bold">{t("nav.profile")}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
