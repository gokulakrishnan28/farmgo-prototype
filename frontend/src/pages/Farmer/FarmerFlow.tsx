/**
 * FarmerFlow — Central state machine orchestrator for the new Farmer UI.
 * Handles language, header, progress bar, and step transitions.
 */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { type LangCode } from "../../utils/farmerTranslations";
import { farmgoStore, type FleetVehicle } from "../../services/farmgoStore";

// Components
import FarmerHeader from "./components/FarmerHeader";
import ProgressBar from "./components/ProgressBar";

// Steps
import CropCategoryCard from "./steps/CropCategoryCard";
import CropSelectionCard from "./steps/CropSelectionCard";
import QuantityCard from "./steps/QuantityCard";
import LocationCard from "./steps/LocationCard";
import AiAnalysisCard from "./steps/AiAnalysisCard";
import StorageRecommendationCard from "./steps/StorageRecommendationCard";
import AiMatchedTrucksCard from "./steps/AiMatchedTrucksCard";
import BookingConfirmCard from "./steps/BookingConfirmCard";
import WaitingDriverCard from "./steps/WaitingDriverCard";
import DriverAcceptedCard from "./steps/DriverAcceptedCard";
import LiveTrackingCard from "./steps/LiveTrackingCard";
import TripCompletedCard from "./steps/TripCompletedCard";

type StepType =
  | "category"
  | "crop"
  | "quantity"
  | "location"
  | "ai_loading"
  | "storage"
  | "trucks"
  | "booking_confirm"
  | "waiting"
  | "driver_accepted"
  | "live_tracking"
  | "completed";

export default function FarmerFlow() {
  const navigate = useNavigate();
  const fleet = farmgoStore.getFleet();

  // Global State
  const [lang, setLang] = useState<LangCode>("en");
  const [currentStep, setCurrentStep] = useState<StepType>("category");

  // Booking Data State
  const [category, setCategory] = useState(() => sessionStorage.getItem("farmer_category") || "");
  const [crop, setCrop] = useState("");
  const [quantity, setQuantity] = useState(0);
  const [unit, setUnit] = useState("Ton");
  const [pickup, setPickup] = useState("");
  const [destination, setDestination] = useState("");
  const [distanceKm, setDistanceKm] = useState(0);
  const [storageReq, setStorageReq] = useState<"Dry" | "Normal" | "Cold">("Normal");
  const [selectedTruck, setSelectedTruck] = useState<FleetVehicle | null>(null);
  const [finalPrice, setFinalPrice] = useState(0);

  // If a category was pre-selected from the landing page, jump to crop selection
  useEffect(() => {
    if (category && currentStep === "category") {
      setCurrentStep("crop");
      // Optional: clear it so if they go back it works normally
      // sessionStorage.removeItem("farmer_category"); 
    }
  }, []);

  // Initialize language from local storage (mock)
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

  const handleSignOut = () => {
    navigate("/");
  };

  const getProgressNum = () => {
    switch (currentStep) {
      case "category":
      case "crop": return 1;
      case "quantity": return 2;
      case "location": return 3;
      case "ai_loading":
      case "storage": return 4;
      case "trucks":
      case "booking_confirm": return 5;
      case "waiting":
      case "driver_accepted":
      case "live_tracking":
      case "completed": return 6;
      default: return 1;
    }
  };

  const handleBack = () => {
    switch (currentStep) {
      case "crop": setCurrentStep("category"); break;
      case "quantity": setCurrentStep("crop"); break;
      case "location": setCurrentStep("quantity"); break;
      case "storage": setCurrentStep("location"); break;
      case "trucks": setCurrentStep("storage"); break;
      case "booking_confirm": setCurrentStep("trucks"); break;
      // Waiting, tracking, etc. should not have a simple back button to prevent breaking state
      case "category": navigate("/"); break;
      default: break;
    }
  };

  // Prevent back button on active trip steps
  const showBack = !["ai_loading", "waiting", "driver_accepted", "live_tracking", "completed"].includes(currentStep);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <FarmerHeader
        lang={lang}
        onLanguageClick={toggleLang}
        onSignOut={handleSignOut}
        onBack={handleBack}
        showBack={showBack}
      />
      
      {/* Show progress bar only in booking phase */}
      {getProgressNum() < 6 && (
        <ProgressBar currentStep={getProgressNum()} lang={lang} />
      )}

      <main className="flex-1 w-full max-w-xl mx-auto pb-20 relative">
        {/* Step Routing */}
        {currentStep === "category" && (
          <CropCategoryCard lang={lang} onSelect={(cat) => { setCategory(cat); setCurrentStep("crop"); }} />
        )}
        
        {currentStep === "crop" && (
          <CropSelectionCard lang={lang} category={category} onSelect={(c) => { setCrop(c); setCurrentStep("quantity"); }} />
        )}

        {currentStep === "quantity" && (
          <QuantityCard lang={lang} cropName={crop} onConfirm={(qty, un) => { setQuantity(qty); setUnit(un); setCurrentStep("location"); }} />
        )}

        {currentStep === "location" && (
          <LocationCard lang={lang} cropName={crop} quantity={quantity} unit={unit} onConfirm={(pick, dest, dist) => {
            setPickup(pick); setDestination(dest); setDistanceKm(dist); setCurrentStep("ai_loading");
          }} />
        )}

        {currentStep === "ai_loading" && (
          <AiAnalysisCard lang={lang} onComplete={() => setCurrentStep("storage")} />
        )}

        {currentStep === "storage" && (
          <StorageRecommendationCard lang={lang} cropName={crop} distanceKm={distanceKm} onContinue={(type) => {
            setStorageReq(type); setCurrentStep("trucks");
          }} />
        )}

        {currentStep === "trucks" && (
          <AiMatchedTrucksCard lang={lang} fleet={fleet} requiredStorage={storageReq} weightTon={unit === "Ton" ? quantity : quantity / 1000} distanceKm={distanceKm} onSelectTruck={(t, p) => {
            setSelectedTruck(t); setFinalPrice(p); setCurrentStep("booking_confirm");
          }} />
        )}

        {currentStep === "booking_confirm" && selectedTruck && (
          <BookingConfirmCard
            lang={lang}
            cropName={crop}
            quantity={quantity}
            unit={unit}
            pickup={pickup}
            destination={destination}
            distanceKm={distanceKm}
            truck={selectedTruck}
            price={finalPrice}
            onBook={() => setCurrentStep("waiting")}
            onChangeTruck={() => setCurrentStep("trucks")}
          />
        )}

        {currentStep === "waiting" && selectedTruck && (
          <WaitingDriverCard
            lang={lang}
            truck={selectedTruck}
            price={finalPrice}
            pickup={pickup}
            destination={destination}
            onAccepted={() => setCurrentStep("driver_accepted")}
            onCancel={() => setCurrentStep("category")}
          />
        )}

        {currentStep === "driver_accepted" && selectedTruck && (
          <DriverAcceptedCard lang={lang} truck={selectedTruck} price={finalPrice} onTrack={() => setCurrentStep("live_tracking")} />
        )}

        {currentStep === "live_tracking" && selectedTruck && (
          <LiveTrackingCard
            lang={lang}
            truck={selectedTruck}
            pickup={pickup}
            destination={destination}
            distanceKm={distanceKm}
            requiredStorage={storageReq}
            onTripCompleted={() => setCurrentStep("completed")}
          />
        )}

        {currentStep === "completed" && selectedTruck && (
          <TripCompletedCard
            lang={lang}
            truck={selectedTruck}
            price={finalPrice}
            destination={destination}
            onDashboard={() => navigate("/")}
          />
        )}
      </main>
    </div>
  );
}
