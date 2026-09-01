/**
 * LocationCard — Combined Step 4: Pickup + Destination + AI Mandi
 * Two paths:
 * 1. Manual: Farmer selects pickup → destination (AI Mandi optional)
 * 2. AI Mandi: Farmer clicks "Get Best Price" and AI recommends market
 */
import { useState, useEffect, useRef } from "react";
import { MapPin, Search, Navigation, Sparkles, Trophy, ArrowRight, ChevronDown } from "lucide-react";
import { type LangCode, getT } from "../../../utils/farmerTranslations";
import StepCard from "../components/StepCard";

interface LocationCardProps {
  lang: LangCode;
  cropName: string;
  quantity: number;
  unit: string;
  onConfirm: (pickup: string, destination: string, distanceKm: number) => void;
}

// Tamil Nadu + Maharashtra locations
const ALL_LOCATIONS = [
  // Tamil Nadu
  "Chennai Koyambedu Market (சென்னை கோயம்பேடு சந்தை)",
  "Coimbatore MGR Market (கோயம்புத்தூர் எம்.ஜி.ஆர் சந்தை)",
  "Madurai Mattuthavani (மதுரை மாட்டுத்தாவணி)",
  "Tiruchi Anna nagar Uzhavar Sandai (திருச்சி அண்ணா நகர்)",
  "Salem Uzhavar Sandai (சேலம் உழவர் சந்தை)",
  "Erode Sampath nagar Uzhavar Sandai (ஈரோடு)",
  "Thanjavur Uzhavar Sandai (தஞ்சாவூர்)",
  "Tiruppur Uzhavar Sandai (திருப்பூர்)",
  "Vellore Uzhavar Sandai (வேலூர்)",
  "Dindigul Uzhavar Sandai (திண்டுக்கல்)",
  "Pollachi Uzhavar Sandai (பொள்ளாச்சி)",
  "Kanchipuram Uzhavar Sandai (காஞ்சிபுரம்)",
  "Kumbakonam Uzhavar Sandai (கும்பகோணம்)",
  "Hosur Uzhavar Sandai (ஓசூர்)",
  "Krishnagiri Uzhavar Sandai (கிருஷ்ணகிரி)",
  "Dharmapuri Uzhavar Sandai (தர்மபுரி)",
  "Namakkal Uzhavar Sandai (நாமக்கல்)",
  "Karur Uzhavar Sandai (கரூர்)",
  "Sivagangai Uzhavar Sandai (சிவகங்கை)",
  "Ooty Uzhavar Sandai (ஊட்டி)",
  // Maharashtra
  "Mumbai APMC Market (मुंबई एपीएमसी मार्केट)",
  "Pune Market Yard (पुणे मार्केट यार्ड)",
  "Nashik Grape Market (नाशिक अंगूर बाजार)",
  "Nagpur Kalamna Market (नागपूर कळमना बाजार)",
  "Kolhapur Vegetable Market (कोल्हापूर भाजी बाजार)",
  "Aurangabad Market (औरंगाबाद बाजार)",
  "Solapur Market (सोलापूर बाजार)",
  "Sangli Turmeric Market (सांगली हळद बाजार)",
  "Satara Market Yard (सातारा मार्केट यार्ड)",
  "Ahmednagar Market (अहमदनगर बाजार)",
];

const LOCATION_COORDS: Record<string, { lat: number; lng: number }> = {
  "Chennai": { lat: 13.0732, lng: 80.1912 },
  "Coimbatore": { lat: 11.0168, lng: 76.9558 },
  "Madurai": { lat: 9.9252, lng: 78.1198 },
  "Tiruchi": { lat: 10.7905, lng: 78.7047 },
  "Salem": { lat: 11.6643, lng: 78.1460 },
  "Erode": { lat: 11.3410, lng: 77.7172 },
  "Thanjavur": { lat: 10.7870, lng: 79.1378 },
  "Tiruppur": { lat: 11.1075, lng: 77.3398 },
  "Vellore": { lat: 12.9165, lng: 79.1325 },
  "Dindigul": { lat: 10.3673, lng: 77.9803 },
  "Pollachi": { lat: 10.6587, lng: 77.0082 },
  "Kanchipuram": { lat: 12.8342, lng: 79.7036 },
  "Kumbakonam": { lat: 10.9617, lng: 79.3788 },
  "Hosur": { lat: 12.7409, lng: 77.8253 },
  "Krishnagiri": { lat: 12.5186, lng: 78.2138 },
  "Dharmapuri": { lat: 12.1211, lng: 78.1582 },
  "Namakkal": { lat: 11.2189, lng: 78.1674 },
  "Karur": { lat: 10.9601, lng: 78.0766 },
  "Sivagangai": { lat: 9.8475, lng: 78.4806 },
  "Ooty": { lat: 11.4102, lng: 76.6950 },
  "Mumbai": { lat: 19.0760, lng: 72.8777 },
  "Pune": { lat: 18.5204, lng: 73.8567 },
  "Nashik": { lat: 19.9975, lng: 73.7898 },
  "Nagpur": { lat: 21.1458, lng: 79.0882 },
  "Kolhapur": { lat: 16.7050, lng: 74.2433 },
  "Aurangabad": { lat: 19.8762, lng: 75.3433 },
  "Solapur": { lat: 17.6599, lng: 75.9064 },
  "Sangli": { lat: 16.8524, lng: 74.5815 },
  "Satara": { lat: 17.6805, lng: 74.0183 },
  "Ahmednagar": { lat: 19.0948, lng: 74.7480 },
};

function getCoords(loc: string): { lat: number; lng: number } {
  for (const [key, val] of Object.entries(LOCATION_COORDS)) {
    if (loc.toLowerCase().includes(key.toLowerCase())) return val;
  }
  return { lat: 11.0, lng: 78.0 }; // Default TN center
}

function calcDistance(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const R = 6371; // km
  const dLat = (b.lat - a.lat) * Math.PI / 180;
  const dLng = (b.lng - a.lng) * Math.PI / 180;
  const s = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * Math.PI / 180) * Math.cos(b.lat * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return Math.round(R * 2 * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s)));
}

// Mock AI Mandi recommendation
function getAiMandiRecommendation(cropName: string, pickup: string, quantity: number) {
  const markets = [
    { name: "Chennai Koyambedu Market", price: 42, distance: 0 },
    { name: "Coimbatore MGR Market", price: 38, distance: 0 },
    { name: "Madurai Mattuthavani", price: 45, distance: 0 },
    { name: "Mumbai APMC Market", price: 55, distance: 0 },
    { name: "Pune Market Yard", price: 48, distance: 0 },
  ];

  const pickupCoords = getCoords(pickup);

  const scored = markets.map((m) => {
    const coords = getCoords(m.name);
    const dist = calcDistance(pickupCoords, coords);
    const transportCost = dist * 18; // ₹18/km approx
    const grossRevenue = m.price * quantity * 1000; // quantity in tons
    const netReturn = grossRevenue - transportCost;
    return { ...m, distance: dist, transportCost, grossRevenue, netReturn };
  });

  scored.sort((a, b) => b.netReturn - a.netReturn);
  return scored[0];
}

export default function LocationCard({ lang, cropName, quantity, unit, onConfirm }: LocationCardProps) {
  const t = getT(lang);
  const [pickup, setPickup] = useState("");
  const [destination, setDestination] = useState("");
  const [pickupSearch, setPickupSearch] = useState("");
  const [destSearch, setDestSearch] = useState("");
  const [showPickupList, setShowPickupList] = useState(false);
  const [showDestList, setShowDestList] = useState(false);
  const [showAiMandi, setShowAiMandi] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<ReturnType<typeof getAiMandiRecommendation> | null>(null);
  const [showMap, setShowMap] = useState<"pickup" | "dest" | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);

  const filterLocations = (query: string) =>
    ALL_LOCATIONS.filter(
      (l) => l.toLowerCase().includes(query.toLowerCase())
    );

  const distance = pickup && destination ? calcDistance(getCoords(pickup), getCoords(destination)) : 0;
  const estTime = distance ? `${Math.round(distance / 50)} hrs` : "";

  const handleAiMandi = () => {
    if (!pickup) return;
    setAiLoading(true);
    setShowAiMandi(true);
    setTimeout(() => {
      const quantityTons = unit === "Ton" ? quantity : unit === "Quintal" ? quantity / 10 : quantity / 1000;
      const result = getAiMandiRecommendation(cropName, pickup, quantityTons);
      setAiResult(result);
      setAiLoading(false);
    }, 2000);
  };

  const handleUseMarket = () => {
    if (!aiResult) return;
    const fullName = ALL_LOCATIONS.find((l) => l.includes(aiResult.name)) || aiResult.name;
    setDestination(fullName);
    setShowAiMandi(false);
  };

  const handleContinue = () => {
    if (!pickup || !destination) return;
    onConfirm(pickup, destination, distance);
  };

  // Initialize map
  useEffect(() => {
    if (!showMap || !mapRef.current) return;
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";

    const initMap = () => {
      const google = (window as any).google;
      if (!google || !mapRef.current) return;

      const center = showMap === "pickup" && pickup ? getCoords(pickup) : { lat: 11.0, lng: 78.0 };
      const map = new google.maps.Map(mapRef.current, {
        center,
        zoom: 7,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
      });

      // Add markers for all locations
      ALL_LOCATIONS.forEach((loc) => {
        const coords = getCoords(loc);
        const marker = new google.maps.Marker({
          position: coords,
          map,
          title: loc.split(" (")[0],
        });
        marker.addListener("click", () => {
          if (showMap === "pickup") {
            setPickup(loc);
            setPickupSearch(loc.split(" (")[0]);
          } else {
            setDestination(loc);
            setDestSearch(loc.split(" (")[0]);
          }
          setShowMap(null);
        });
      });

      // Click anywhere on map
      map.addListener("click", (e: any) => {
        const lat = e.latLng.lat();
        const lng = e.latLng.lng();
        // Find nearest known location
        let minDist = Infinity;
        let nearest = ALL_LOCATIONS[0];
        for (const loc of ALL_LOCATIONS) {
          const c = getCoords(loc);
          const d = Math.sqrt((c.lat - lat) ** 2 + (c.lng - lng) ** 2);
          if (d < minDist) { minDist = d; nearest = loc; }
        }
        if (showMap === "pickup") {
          setPickup(nearest);
          setPickupSearch(nearest.split(" (")[0]);
        } else {
          setDestination(nearest);
          setDestSearch(nearest.split(" (")[0]);
        }
        setShowMap(null);
      });
    };

    if (!(window as any).google) {
      if (!document.getElementById("google-maps-script")) {
        const script = document.createElement("script");
        script.id = "google-maps-script";
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,geometry`;
        script.async = true;
        script.defer = true;
        script.onload = initMap;
        document.head.appendChild(script);
      } else {
        // Script already loading
        const check = setInterval(() => {
          if ((window as any).google) { clearInterval(check); initMap(); }
        }, 200);
      }
    } else {
      initMap();
    }
  }, [showMap]);

  return (
    <>
      <StepCard title={t("loc.title")} subtitle={t("loc.subtitle")} icon="📍">
        <div className="space-y-5">
          {/* ── PICKUP ── */}
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-500 uppercase tracking-wider flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
              <span>{t("loc.pickup_label")}</span>
            </label>

            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={pickupSearch}
                placeholder={t("loc.search_placeholder")}
                onChange={(e) => { setPickupSearch(e.target.value); setShowPickupList(true); }}
                onFocus={() => setShowPickupList(true)}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all"
              />
            </div>

            {/* Select on map button */}
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={() => setShowMap("pickup")}
                className="flex-1 flex items-center justify-center space-x-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold py-2.5 rounded-xl text-xs cursor-pointer border border-emerald-200 transition-all"
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>{t("loc.select_on_map")}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition((pos) => {
                      const { latitude, longitude } = pos.coords;
                      let minDist = Infinity;
                      let nearest = ALL_LOCATIONS[0];
                      for (const loc of ALL_LOCATIONS) {
                        const c = getCoords(loc);
                        const d = Math.sqrt((c.lat - latitude) ** 2 + (c.lng - longitude) ** 2);
                        if (d < minDist) { minDist = d; nearest = loc; }
                      }
                      setPickup(nearest);
                      setPickupSearch(nearest.split(" (")[0]);
                    });
                  }
                }}
                className="flex items-center justify-center space-x-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold py-2.5 px-3 rounded-xl text-xs cursor-pointer border border-blue-200 transition-all"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>{t("loc.use_current")}</span>
              </button>
            </div>

            {/* Dropdown list */}
            {showPickupList && (
              <div className="max-h-40 overflow-y-auto bg-white border border-slate-200 rounded-2xl shadow-lg">
                {filterLocations(pickupSearch).map((loc) => (
                  <button
                    key={loc}
                    type="button"
                    onClick={() => {
                      setPickup(loc);
                      setPickupSearch(loc.split(" (")[0]);
                      setShowPickupList(false);
                    }}
                    className={`w-full text-left px-4 py-2.5 text-sm font-medium hover:bg-emerald-50 transition-all cursor-pointer border-0 border-b border-slate-100 last:border-0 ${
                      pickup === loc ? "bg-emerald-50 text-emerald-700" : "text-slate-700"
                    }`}
                  >
                    <MapPin className="w-3 h-3 inline mr-2 text-slate-400" />
                    {loc}
                  </button>
                ))}
              </div>
            )}

            {/* Confirmed pickup */}
            {pickup && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2 flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-xs font-bold text-emerald-700 truncate">{pickup.split(" (")[0]}</span>
                <button type="button" onClick={() => { setPickup(""); setPickupSearch(""); }} className="ml-auto text-emerald-400 hover:text-red-500 text-xs cursor-pointer border-0 bg-transparent">✕</button>
              </div>
            )}
          </div>

          {/* ── DESTINATION ── */}
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-500 uppercase tracking-wider flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" />
              <span>{t("loc.dest_label")}</span>
            </label>

            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={destSearch}
                placeholder={t("loc.search_placeholder")}
                onChange={(e) => { setDestSearch(e.target.value); setShowDestList(true); }}
                onFocus={() => setShowDestList(true)}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all"
              />
            </div>

            <button
              type="button"
              onClick={() => setShowMap("dest")}
              className="w-full flex items-center justify-center space-x-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold py-2.5 rounded-xl text-xs cursor-pointer border border-emerald-200 transition-all"
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>{t("loc.select_on_map")}</span>
            </button>

            {/* Dropdown list */}
            {showDestList && (
              <div className="max-h-40 overflow-y-auto bg-white border border-slate-200 rounded-2xl shadow-lg">
                {filterLocations(destSearch).map((loc) => (
                  <button
                    key={loc}
                    type="button"
                    onClick={() => {
                      setDestination(loc);
                      setDestSearch(loc.split(" (")[0]);
                      setShowDestList(false);
                    }}
                    className={`w-full text-left px-4 py-2.5 text-sm font-medium hover:bg-emerald-50 transition-all cursor-pointer border-0 border-b border-slate-100 last:border-0 ${
                      destination === loc ? "bg-emerald-50 text-emerald-700" : "text-slate-700"
                    }`}
                  >
                    <MapPin className="w-3 h-3 inline mr-2 text-slate-400" />
                    {loc}
                  </button>
                ))}
              </div>
            )}

            {/* Confirmed destination */}
            {destination && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-3 py-2 flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-red-500" />
                <span className="text-xs font-bold text-red-700 truncate">{destination.split(" (")[0]}</span>
                <button type="button" onClick={() => { setDestination(""); setDestSearch(""); }} className="ml-auto text-red-400 hover:text-red-600 text-xs cursor-pointer border-0 bg-transparent">✕</button>
              </div>
            )}
          </div>

          {/* ── ROUTE PREVIEW ── */}
          {pickup && destination && (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span className="text-xs font-bold text-slate-600 truncate max-w-[100px]">{pickup.split(" (")[0]}</span>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400" />
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                  <span className="text-xs font-bold text-slate-600 truncate max-w-[100px]">{destination.split(" (")[0]}</span>
                </div>
              </div>
              <div className="flex justify-between text-xs text-slate-500 font-medium">
                <span>📏 {t("loc.distance")}: <strong className="text-slate-700">{distance} km</strong></span>
                <span>⏱️ {t("loc.est_time")}: <strong className="text-slate-700">{estTime}</strong></span>
              </div>
            </div>
          )}

          {/* ── AI MANDI DIVIDER ── */}
          {pickup && !showAiMandi && (
            <>
              <div className="relative flex items-center py-2">
                <div className="flex-grow border-t border-slate-200" />
                <span className="flex-shrink mx-3 text-slate-400 text-[10px] font-bold uppercase tracking-wider">{t("loc.or_use_ai")}</span>
                <div className="flex-grow border-t border-slate-200" />
              </div>

              <button
                type="button"
                onClick={handleAiMandi}
                className="w-full bg-gradient-to-r from-violet-500 to-purple-600 text-white py-4 rounded-2xl font-black text-sm cursor-pointer border-0 shadow-lg shadow-purple-200 hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center space-x-2"
              >
                <Sparkles className="w-5 h-5" />
                <span>{t("loc.ai_mandi")}</span>
              </button>
            </>
          )}

          {/* ── AI MANDI RESULT ── */}
          {showAiMandi && (
            <div className="bg-gradient-to-br from-purple-50 to-violet-50 border border-purple-200 rounded-2xl p-5 space-y-4">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-purple-500" />
                <h3 className="font-black text-purple-800">{t("loc.ai_mandi")}</h3>
              </div>

              {aiLoading ? (
                <div className="text-center py-6">
                  <div className="inline-block w-10 h-10 border-4 border-purple-200 border-t-purple-500 rounded-full animate-spin mb-3" />
                  <p className="text-sm font-bold text-purple-600">{t("loc.ai_mandi_desc")}</p>
                </div>
              ) : aiResult ? (
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Trophy className="w-5 h-5 text-amber-500" />
                    <div>
                      <div className="text-[10px] text-purple-500 font-bold uppercase">{t("loc.recommended_market")}</div>
                      <div className="font-black text-slate-900">{aiResult.name}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-white/80 rounded-xl p-3">
                      <div className="text-slate-500 font-medium">{t("loc.market_price")}</div>
                      <div className="font-black text-emerald-700 text-lg">₹{aiResult.price}/kg</div>
                    </div>
                    <div className="bg-white/80 rounded-xl p-3">
                      <div className="text-slate-500 font-medium">{t("loc.transport_cost")}</div>
                      <div className="font-black text-orange-600 text-lg">₹{aiResult.transportCost.toLocaleString()}</div>
                    </div>
                    <div className="bg-white/80 rounded-xl p-3">
                      <div className="text-slate-500 font-medium">{t("loc.distance")}</div>
                      <div className="font-black text-slate-700">{aiResult.distance} km</div>
                    </div>
                    <div className="bg-white/80 rounded-xl p-3">
                      <div className="text-slate-500 font-medium">{t("loc.net_return")}</div>
                      <div className="font-black text-emerald-700 text-lg">₹{aiResult.netReturn.toLocaleString()}</div>
                    </div>
                  </div>

                  <p className="text-[10px] text-purple-500 font-medium italic">
                    ⚠️ Demo estimate only. Actual prices may vary based on market conditions.
                  </p>

                  <div className="flex space-x-2">
                    <button
                      type="button"
                      onClick={handleUseMarket}
                      className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-xl text-sm cursor-pointer border-0 transition-all shadow-md"
                    >
                      {t("loc.use_market")}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAiMandi(false)}
                      className="flex-1 bg-white text-purple-700 font-bold py-3 rounded-xl text-sm cursor-pointer border border-purple-200 transition-all hover:bg-purple-50"
                    >
                      {t("loc.choose_another")}
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          )}

          {/* ── CONTINUE ── */}
          <button
            type="button"
            onClick={handleContinue}
            disabled={!pickup || !destination}
            className={`w-full py-4 rounded-2xl font-black text-base transition-all cursor-pointer border-0 ${
              pickup && destination
                ? "bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-lg shadow-emerald-200 hover:shadow-xl hover:scale-[1.01] active:scale-[0.99]"
                : "bg-slate-200 text-slate-400 cursor-not-allowed"
            }`}
          >
            {t("loc.continue")} →
          </button>
        </div>
      </StepCard>

      {/* ── MAP MODAL ── */}
      {showMap && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-lg h-[70vh] sm:h-[500px] overflow-hidden shadow-2xl flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h3 className="font-black text-slate-900">
                {showMap === "pickup" ? t("loc.pickup_label") : t("loc.dest_label")}
              </h3>
              <button
                type="button"
                onClick={() => setShowMap(null)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer border-0 transition-all"
              >
                ✕ Close
              </button>
            </div>
            <div ref={mapRef} className="flex-1 w-full bg-slate-100" />
            <div className="px-5 py-3 text-xs text-slate-400 text-center border-t border-slate-100">
              Tap a marker or click anywhere on the map to select a location
            </div>
          </div>
        </div>
      )}
    </>
  );
}
