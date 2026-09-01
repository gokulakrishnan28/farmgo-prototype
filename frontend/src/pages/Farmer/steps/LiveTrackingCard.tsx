/**
 * LiveTrackingCard — Step 11: Live Tracking Map & Trip Status
 * Simulates a trip progressing through statuses.
 */
import { useState, useEffect, useRef } from "react";
import { Phone, MessageSquare, AlertCircle, Navigation } from "lucide-react";
import { type LangCode, getT } from "../../../utils/farmerTranslations";
import type { FleetVehicle } from "../../../services/farmgoStore";

interface LiveTrackingCardProps {
  lang: LangCode;
  truck: FleetVehicle;
  pickup: string;
  destination: string;
  distanceKm: number;
  requiredStorage: "Dry" | "Normal" | "Cold";
  onTripCompleted: () => void;
}

export default function LiveTrackingCard({
  lang,
  truck,
  pickup,
  destination,
  distanceKm,
  requiredStorage,
  onTripCompleted,
}: LiveTrackingCardProps) {
  const t = getT(lang);
  const mapRef = useRef<HTMLDivElement>(null);
  
  const [tripStatus, setTripStatus] = useState<
    "driver_arriving" | "at_pickup" | "loaded" | "in_transit" | "arriving_dest"
  >("driver_arriving");
  
  const [progress, setProgress] = useState(0); // 0 to 100%

  // Simulate trip progression
  useEffect(() => {
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += 2; // +2% every tick
      setProgress(Math.min(100, currentProgress));

      if (currentProgress < 15) setTripStatus("driver_arriving");
      else if (currentProgress < 25) setTripStatus("at_pickup");
      else if (currentProgress < 30) setTripStatus("loaded");
      else if (currentProgress < 90) setTripStatus("in_transit");
      else if (currentProgress < 100) setTripStatus("arriving_dest");
      else {
        clearInterval(interval);
        setTimeout(onTripCompleted, 1500);
      }
    }, 1000); // Fast simulation for demo

    return () => clearInterval(interval);
  }, [onTripCompleted]);

  // Mock map initialization (visual only)
  useEffect(() => {
    if (!mapRef.current) return;
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";

    const initMap = () => {
      const google = (window as any).google;
      if (!google || !mapRef.current) return;

      const map = new google.maps.Map(mapRef.current, {
        center: { lat: 10.79, lng: 78.7 },
        zoom: 7,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        styles: [{ featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] }]
      });

      // Just a mock display for tracking
      new google.maps.Marker({
        position: { lat: 10.79, lng: 78.7 }, // Mock center
        map,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: "#10b981",
          fillOpacity: 1,
          strokeWeight: 2,
          strokeColor: "#ffffff"
        },
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
        setTimeout(initMap, 1000);
      }
    } else {
      initMap();
    }
  }, []);

  const getStatusText = () => {
    switch(tripStatus) {
      case "driver_arriving": return t("status.driver_arriving");
      case "at_pickup": return t("status.driver_arriving"); // At pickup
      case "loaded": return t("status.crop_loaded");
      case "in_transit": return t("status.in_transit");
      case "arriving_dest": return t("status.destination");
      default: return "";
    }
  };

  const getRemainingDist = () => {
    if (progress < 30) return distanceKm;
    const remaining = distanceKm * (1 - ((progress - 30) / 70));
    return Math.max(0, Math.round(remaining));
  };

  const getEta = () => {
    if (progress < 30) return "Arriving";
    const mins = Math.max(1, Math.round((getRemainingDist() / 50) * 60)); // ~50km/h
    return `${mins} mins`;
  };

  return (
    <div className="w-full max-w-lg mx-auto h-[80vh] flex flex-col bg-slate-100 relative animate-fadeIn rounded-3xl overflow-hidden shadow-2xl mt-4">
      {/* Map Area */}
      <div className="flex-1 relative">
        <div ref={mapRef} className="absolute inset-0 bg-slate-200" />
        
        {/* Status Overlay */}
        <div className="absolute top-4 left-4 right-4 bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border border-slate-100 p-3">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-black text-slate-900">{getStatusText()}</h3>
            {requiredStorage === "Cold" && (
              <span className="flex items-center space-x-1 text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
                <span>❄️</span> <span>{t("track.cold_active")}</span>
              </span>
            )}
          </div>
          
          {/* Timeline Progress Bar */}
          <div className="relative h-1.5 bg-slate-200 rounded-full overflow-hidden mt-1">
            <div 
              className="absolute top-0 left-0 h-full bg-emerald-500 rounded-full transition-all duration-1000 ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between text-[9px] font-bold text-slate-400 mt-1 uppercase">
            <span>Pickup</span>
            <span>Transit</span>
            <span>Dest</span>
          </div>
        </div>
      </div>

      {/* Bottom Info Sheet */}
      <div className="bg-white rounded-t-3xl shadow-[0_-10px_40px_-10px_rgba(0,0,0,0.1)] z-10 p-5 space-y-4">
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t("track.remaining")}</div>
            <div className="font-black text-2xl text-slate-800">{getRemainingDist()} <span className="text-sm">km</span></div>
          </div>
          <div className="text-right">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t("track.eta")}</div>
            <div className="font-black text-2xl text-emerald-600">{getEta()}</div>
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-emerald-100 rounded-full overflow-hidden flex-shrink-0">
              <img src={`https://ui-avatars.com/api/?name=${truck.driver}&background=10b981&color=fff`} alt={truck.driver} className="w-full h-full object-cover" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm">{truck.driver}</h4>
              <p className="text-xs font-medium text-slate-500">{truck.name} • {truck.plateNumber || "TN-45-AB-1234"}</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <button type="button" className="w-10 h-10 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center hover:bg-emerald-200 transition-colors cursor-pointer border-0">
              <Phone className="w-4 h-4 fill-current" />
            </button>
            <button type="button" className="w-10 h-10 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center hover:bg-blue-200 transition-colors cursor-pointer border-0">
              <MessageSquare className="w-4 h-4 fill-current" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
