import { useState, useEffect } from "react";
import { 
  Sprout, Truck, Database, FileText, 
  Activity, Clock, RefreshCw, LogOut
} from "lucide-react";

// Mock Database fallback based on farmgo_crop_database.csv
const CROP_DATABASE_ROWS = [
  { crop: "Tomato", temp: "10-13°C", vehicle: "Normal/Reefer Truck", life: "14 days", humidity: "85-95%", storage: "Normal" },
  { crop: "Onion", temp: "0-2°C", vehicle: "Ventilated Truck", life: "30-180 days", humidity: "65-70%", storage: "Dry" },
  { crop: "Potato", temp: "7-10°C", vehicle: "Normal Truck", life: "60-180 days", humidity: "90-95%", storage: "Dry" },
  { crop: "Carrot", temp: "0-1°C", vehicle: "Reefer Truck", life: "30-180 days", humidity: "98-100%", storage: "Cold" },
  { crop: "Brinjal", temp: "10-12°C", vehicle: "Normal Truck", life: "7-10 days", humidity: "90-95%", storage: "Normal" },
  { crop: "Ladyfinger (Okra)", temp: "7-10°C", vehicle: "Normal Truck", life: "7-10 days", humidity: "90-95%", storage: "Normal" },
  { crop: "Spinach", temp: "0-5°C", vehicle: "Reefer Truck", life: "5-10 days", humidity: "95-100%", storage: "Cold" },
  { crop: "Cashew", temp: "5-10°C", vehicle: "Container Truck", life: "180-365 days", humidity: "60-70%", storage: "Dry" }
];

export default function App() {
  const [activeTab, setActiveTab] = useState<"shipments" | "listings" | "fleet" | "database" | "history">("shipments");
  const [selectedAuditManifest, setSelectedAuditManifest] = useState<any | null>(null);
  const [cropDb, setCropDb] = useState<any[]>(CROP_DATABASE_ROWS);
  const [completedShipments] = useState<any[]>([
    {
      id: "FG-ORD-5541",
      crop: "Pollachi Coconuts",
      weight: "3,000 kg",
      pickup: "Pollachi Coconut Farm, Coimbatore",
      destination: "Mattuthavani Market, Madurai",
      driver: "Muthu Kumar",
      storage: "Normal Storage",
      fee: 4200,
      carrier: "Large Truck (Ashok Leyland)",
      tempRange: "Ambient",
      badge: "Delivered Successfully",
      badgeType: "delivered",
      route: "Coimbatore ➔ Madurai",
      date: "16-07-2026, 02:15 PM"
    },
    {
      id: "FG-ORD-8821",
      crop: "Thanjavur Ponni Rice",
      weight: "2,000 kg",
      pickup: "Cauvery Delta Granary, Thanjavur",
      destination: "Gandhi Market, Trichy",
      driver: "Velmurugan A.",
      storage: "Normal Storage",
      fee: 2800,
      carrier: "Flatbed Truck",
      tempRange: "Ambient",
      badge: "Delivered Successfully",
      badgeType: "delivered",
      route: "Thanjavur ➔ Trichy",
      date: "15-07-2026, 04:30 PM"
    },
    {
      id: "FG-ORD-3120",
      crop: "Ooty Carrots",
      weight: "1.2 Tons",
      pickup: "Ooty Agricultural Coop",
      destination: "Chennai Koyambedu Market",
      driver: "Anbu Selvan",
      storage: "Cold Storage",
      fee: 9200,
      carrier: "Reefer Cold-Mini Truck",
      tempRange: "0-1°C (Cold)",
      badge: "Delivered Successfully",
      badgeType: "delivered",
      route: "Ooty ➔ Chennai",
      date: "15-07-2026, 11:15 AM"
    }
  ]);

  // Authentication State
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return sessionStorage.getItem("admin_logged_in") === "true";
  });
  const [currentUser, setCurrentUser] = useState<any>(() => {
    const saved = sessionStorage.getItem("admin_user");
    return saved ? JSON.parse(saved) : null;
  });

  const [usernameInput, setUsernameInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [loginError, setLoginError] = useState("");

  // Generate unique Booking IDs dynamically on component mount so each shipment has its own ID
  const [shipments, setShipments] = useState<any[]>([]);

  const fetchShipments = () => {
    const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";
    fetch(`${API_BASE}/api/v1/ai/active-dispatches`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          // Keep local progress if it was already incrementing
          setShipments(prevShipments => {
            return data.map(newShip => {
              const matched = prevShipments.find(p => p.id === newShip.id);
              if (matched && matched.progress !== undefined) {
                return { ...newShip, progress: matched.progress };
              }
              // If it's a new shipment and doesn't have progress, set starting progress to 6%
              if (newShip.progress === undefined) {
                newShip.progress = 6;
              }
              return newShip;
            });
          });
        }
      })
      .catch(err => {
        console.warn("[Admin Console] Failed to fetch active dispatches from backend.", err);
      });
  };

  useEffect(() => {
    fetchShipments();
    
    // Poll every 3 seconds for new dispatches
    const pollInterval = setInterval(fetchShipments, 3000);
    return () => clearInterval(pollInterval);
  }, []);

  // Fetch actual CSV crop database from FastAPI backend on mount
  useEffect(() => {
    const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";
    fetch(`${API_BASE}/api/v1/ai/crop-database`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          const formatted = data.map((row: any) => ({
            crop: row["crop name"] || row["crop_name"] || row["crop"] || "Unknown",
            temp: row["temperature"] || row["temperature_target"] || row["temp"] || "Ambient",
            vehicle: row["vehicle"] || row["vehicle_suggestion"] || "Normal Truck",
            life: row["shelf life"] || row["shelf_life"] || "N/A",
            humidity: row["humidity"] || "N/A",
            storage: row["storage"] || "Normal"
          }));
          setCropDb(formatted);
          console.log(`[Admin Console] Dynamically loaded ${formatted.length} crops from backend database.`);
        }
      })
      .catch(err => {
        console.warn("[Admin Console] Backend CSV API not reachable, falling back to offline crop profile database.", err);
      });
  }, []);

  // Auto-progress simulation for shipments in the admin list
  useEffect(() => {
    const progressInterval = setInterval(() => {
      setShipments(prevShipments => 
        prevShipments.map(ship => {
          if (ship.progress !== undefined && ship.progress < 100) {
            // Gradually increment progress
            const nextProgress = Math.min(100, ship.progress + 1.5);
            return { ...ship, progress: nextProgress };
          }
          return ship;
        })
      );
    }, 2500);
    return () => clearInterval(progressInterval);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const normalizedUser = usernameInput.trim();
    const pwd = passwordInput.trim();

    if (pwd !== "farmGo@2026") {
      setLoginError("Invalid username or password.");
      return;
    }

    let role = "";
    let welcomeName = "";

    if (normalizedUser === "Gokulakrishnan") {
      welcomeName = "Gokulakrishnan K";
      role = "CEO";
    } else if (normalizedUser === "Mohamed Karib Navas") {
      welcomeName = "Mohamed Karib Navas A";
      role = "CFO";
    } else {
      setLoginError("Access denied. Admin portal is restricted to authorized personnel.");
      return;
    }

    const userObj = { name: welcomeName, role: role };
    sessionStorage.setItem("admin_logged_in", "true");
    sessionStorage.setItem("admin_user", JSON.stringify(userObj));
    setCurrentUser(userObj);
    setIsLoggedIn(true);
    setLoginError("");
  };

  const handleLogout = () => {
    sessionStorage.removeItem("admin_logged_in");
    sessionStorage.removeItem("admin_user");
    setIsLoggedIn(false);
    setCurrentUser(null);
    setUsernameInput("");
    setPasswordInput("");
  };

  const handlePrintAudit = () => {
    window.print();
  };

  // Render Login Screen if not authenticated
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4 font-sans">
        <div className="bg-white border border-slate-200/80 rounded-3xl p-8 max-w-md w-full shadow-xl space-y-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 to-emerald-700" />
          
          <div className="flex flex-col items-center text-center space-y-2">
            <h2 className="text-3xl font-black tracking-tighter text-slate-900 mt-2">
              <span className="text-emerald-500 font-black">farm</span><span className="text-slate-900 font-black">Go</span> Admin Portal
            </h2>
             <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">
              Central Operations Login
            </p>
            <div className="w-full bg-emerald-50/50 border border-emerald-100/85 rounded-2xl p-3.5 text-left text-xs text-emerald-800 space-y-1.5 mt-2">
              <span className="font-bold block text-emerald-700 uppercase tracking-wide text-[10px]">Welcome Authorized Personnel:</span>
              <div className="flex justify-between font-semibold">
                <span>• Gokulakrishnan K</span>
                <span className="text-[10px] font-bold text-emerald-600 uppercase">CEO</span>
              </div>
              <div className="flex justify-between font-semibold">
                <span>• Mohamed Karib Navas A</span>
                <span className="text-[10px] font-bold text-emerald-600 uppercase">CFO</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {loginError && (
              <div className="bg-rose-50 border border-rose-100 text-rose-700 text-xs font-semibold p-3 rounded-xl flex items-center space-x-2">
                <span>⚠️</span>
                <span>{loginError}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Username</label>
              <input 
                type="text"
                placeholder="Gokulakrishnan or Mohamed Karib Navas"
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 font-semibold text-slate-800 transition-all placeholder:text-slate-400"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Password</label>
              <input 
                type="password"
                placeholder="••••••••"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 font-semibold text-slate-800 transition-all placeholder:text-slate-400"
                required
              />
            </div>

            <button 
              type="submit"
              className="w-full bg-emerald-500 hover:bg-emerald-600 active:scale-[0.99] text-white font-extrabold text-sm py-3 rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer border-0 mt-2"
            >
              Sign In to farmGo
            </button>
          </form>
          
          <div className="text-center pt-2 border-t border-slate-100 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
            Protected by farmGo security systems
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Header aligned with main website theme */}
      <header className="bg-white border-b border-slate-100 text-slate-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center">
            <div>
              <span className="text-2xl font-black tracking-tighter block text-slate-900">
                <span className="text-emerald-500 font-black">farm</span><span className="text-slate-900 font-black">Go</span>
              </span>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block -mt-1">
                Central Operations Console
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <a
              href={import.meta.env.VITE_MAIN_PORTAL_URL || "http://localhost:5173"}
              className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 px-3 py-1.5 rounded-xl transition-all flex items-center space-x-1"
              title="Open Farmer & Transporter Landing (http://localhost:5173)"
            >
              <span>Farmer/Transporter ↗</span>
            </a>
            <a
              href={import.meta.env.VITE_BUYER_PORTAL_URL || "http://localhost:5175"}
              className="text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 hover:bg-blue-100 px-3 py-1.5 rounded-xl transition-all flex items-center space-x-1"
              title="Open Buyer Portal (http://localhost:5175)"
            >
              <span>Buyer Portal ↗</span>
            </a>
            <div className="hidden sm:flex items-center space-x-1.5 bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-full text-xs font-semibold text-emerald-700">
              <span className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse" />
              <span>FastAPI Link Active</span>
            </div>
            <div className="hidden md:flex text-xs text-slate-500 items-center space-x-1 font-semibold border-r border-slate-200 pr-4">
              <Clock className="h-3.5 w-3.5" />
              <span>Host Port: <strong className="text-slate-700">5174</strong></span>
            </div>

            {/* Logged in User Profile welcome & Logout */}
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <span className="text-xs font-black text-emerald-500 block">Welcome, {currentUser?.name}</span>
                <span className="text-[10px] font-black uppercase tracking-wider block -mt-0.5 bg-gradient-to-r from-emerald-500 to-green-600 bg-clip-text text-transparent">
                  {currentUser?.role}
                </span>
              </div>
              <button 
                onClick={handleLogout}
                className="bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-800 p-1.5 rounded-xl border border-slate-200 transition-all cursor-pointer"
                title="Sign Out"
              >
                <LogOut className="h-4.5 w-4.5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Operations Block */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-8">
        
        {/* Metric Cards - SIH 2026 Platform Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white border border-slate-200/60 p-5 rounded-3xl shadow-sm space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Registered Farmers</span>
            <h3 className="text-2xl font-black text-slate-900">1,240</h3>
            <span className="text-[10px] text-emerald-600 font-bold">117 Mandis Connected</span>
          </div>

          <div className="bg-white border border-slate-200/60 p-5 rounded-3xl shadow-sm space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Verified Buyers</span>
            <h3 className="text-2xl font-black text-blue-600">318 Buyers</h3>
            <span className="text-[10px] text-blue-600 font-bold">14 Active Requirements</span>
          </div>

          <div className="bg-white border border-slate-200/60 p-5 rounded-3xl shadow-sm space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Crop Lots</span>
            <h3 className="text-2xl font-black text-purple-600">42 Lots</h3>
            <span className="text-[10px] text-purple-600 font-bold">Grade A & B Verified</span>
          </div>

          <div className="bg-white border border-slate-200/60 p-5 rounded-3xl shadow-sm space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">OGD Data Records</span>
            <h3 className="text-2xl font-black text-emerald-600">28,450</h3>
            <span className="text-[10px] text-emerald-600 font-bold">Synced Today (AGMARKNET)</span>
          </div>

          <div className="bg-white border border-slate-200/60 p-5 rounded-3xl shadow-sm space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">AI Service Health</span>
            <h3 className="text-2xl font-black text-amber-600">99.8%</h3>
            <span className="text-[10px] text-amber-600 font-bold">FastAPI + ML Active</span>
          </div>
        </div>

        {/* Tab Controls matching the Segmented Control theme of the main site */}
        <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
          <div className="flex items-center bg-slate-100 p-1 rounded-2xl text-xs font-bold text-slate-600 shadow-inner overflow-x-auto max-w-full whitespace-nowrap scrollbar-none">
            <button 
              onClick={() => setActiveTab("shipments")}
              className={`px-4 py-2.5 rounded-xl transition-all flex items-center space-x-1.5 ${activeTab === "shipments" ? "bg-emerald-500 text-white shadow-sm" : "hover:text-slate-900"}`}
            >
              <Activity className="h-3.5 w-3.5" />
              <span>Active Shipments</span>
            </button>
            <button 
              onClick={() => setActiveTab("listings")}
              className={`px-4 py-2.5 rounded-xl transition-all flex items-center space-x-1.5 ${activeTab === "listings" ? "bg-emerald-500 text-white shadow-sm" : "hover:text-slate-900"}`}
            >
              <Sprout className="h-3.5 w-3.5" />
              <span>Farmer Listings</span>
            </button>
            <button 
              onClick={() => setActiveTab("fleet")}
              className={`px-4 py-2.5 rounded-xl transition-all flex items-center space-x-1.5 ${activeTab === "fleet" ? "bg-emerald-500 text-white shadow-sm" : "hover:text-slate-900"}`}
            >
              <Truck className="h-3.5 w-3.5" />
              <span>Transporter Fleet</span>
            </button>
            <button 
              onClick={() => setActiveTab("database")}
              className={`px-4 py-2.5 rounded-xl transition-all flex items-center space-x-1.5 ${activeTab === "database" ? "bg-emerald-500 text-white shadow-sm" : "hover:text-slate-900"}`}
            >
              <Database className="h-3.5 w-3.5" />
              <span>AI Crop Database</span>
            </button>
            <button 
              onClick={() => setActiveTab("history")}
              className={`px-4 py-2.5 rounded-xl transition-all flex items-center space-x-1.5 ${activeTab === "history" ? "bg-emerald-500 text-white shadow-sm" : "hover:text-slate-900"}`}
            >
              <Clock className="h-3.5 w-3.5" />
              <span>History</span>
            </button>
          </div>

          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider hidden sm:block">
            SIH 2026 Central Operations Console
          </div>
        </div>

        {/* TAB 1: SHIPMENTS MONITOR */}
        {activeTab === "shipments" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fadeIn">
            {/* Live Shipments List */}
            <div className="lg:col-span-2 space-y-4">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Ongoing Logistics Dispatches</h3>
              
              {shipments.map((shipment) => (
                <div key={shipment.id} className="bg-white border border-slate-200/60 p-5 rounded-3xl shadow-sm space-y-4 hover:shadow-md transition-shadow duration-200">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-md border ${
                        shipment.badgeType === "cold" 
                          ? "bg-emerald-50 text-emerald-700 border-emerald-100" 
                          : "bg-indigo-50 text-indigo-700 border-indigo-100"
                      }`}>{shipment.badge}</span>
                      <h4 className="font-extrabold text-slate-900 text-base mt-1">{shipment.crop} Dispatch</h4>
                      <p className="text-xs text-slate-500">Route: <strong>{shipment.pickup.split(" ")[0]}</strong> &rarr; <strong>{shipment.destination.split(" ")[0]}</strong></p>
                    </div>
                    <div className="text-right">
                      <span className="block text-xs font-bold text-slate-400">MANIFEST FARE</span>
                      <span className="text-lg font-black text-slate-900">₹{shipment.fee.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-bold text-slate-600">
                      <span className={shipment.badgeType === "cold" ? "text-emerald-600" : "text-indigo-600"}>
                        {(shipment.progress !== undefined && shipment.progress < 100) ? "En Route (NH-38 Segment)" : "Loading Completed"}
                      </span>
                      <span>{Math.round(shipment.progress !== undefined ? shipment.progress : 100)}% Completed</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all duration-300 ${
                        shipment.badgeType === "cold" ? "bg-emerald-500" : "bg-indigo-500"
                      }`} style={{ width: `${shipment.progress !== undefined ? shipment.progress : 100}%` }} />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 pt-2 border-t border-slate-100 text-xs">
                    <div>
                      <span className="block text-slate-400 font-bold text-[9px] uppercase">CARRIER SUGGESTION</span>
                      <span className="font-semibold text-slate-700">{shipment.carrier}</span>
                    </div>
                    <div>
                      <span className="block text-slate-400 font-bold text-[9px] uppercase">THERMAL SENSITIVITY</span>
                      <span className={`font-semibold ${shipment.badgeType === "cold" ? "text-rose-600" : "text-slate-700"}`}>
                        {shipment.tempRange}
                      </span>
                    </div>
                    <div className="text-right flex items-end justify-end">
                      <button 
                        onClick={() => setSelectedAuditManifest({
                          id: shipment.id,
                          crop: shipment.crop,
                          weight: shipment.weight,
                          pickup: shipment.pickup,
                          destination: shipment.destination,
                          driver: shipment.driver,
                          storage: shipment.storage,
                          fee: shipment.fee,
                          date: new Date().toLocaleString()
                        })}
                        className="text-emerald-600 hover:text-emerald-700 font-extrabold flex items-center justify-end space-x-0.5 cursor-pointer bg-transparent border-0"
                      >
                        <FileText className="h-3.5 w-3.5" />
                        <span>Audit Invoice</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Tamil Nadu Map Outline */}
            <div className="bg-white border border-slate-200/60 p-6 rounded-3xl shadow-sm flex flex-col items-center justify-center space-y-4 hover:shadow-md transition-shadow duration-200">
              <div className="w-full pb-2 border-b border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tamil Nadu Route Stream</span>
                <span className="bg-emerald-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase">Live</span>
              </div>
              <svg className="w-full max-w-[280px] h-[280px]" viewBox="0 0 350 350">
                <circle cx="130" cy="310" r="40" fill="#10b981" fillOpacity="0.05" />
                <circle cx="260" cy="90" r="50" fill="#10b981" fillOpacity="0.05" />
                <path d="M 130 310 L 210 240 L 170 190 L 260 90" fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" strokeDasharray="6,6" />
                <circle cx="260" cy="90" r="5" fill="#ef4444" />
                <text x="270" y="85" fill="#475569" fontSize="9" fontWeight="bold">Chennai</text>
                <circle cx="170" cy="190" r="4" fill="#3b82f6" />
                <text x="180" y="195" fill="#475569" fontSize="8" fontWeight="bold">Salem</text>
                <circle cx="210" cy="240" r="4" fill="#64748b" />
                <text x="220" y="244" fill="#94a3b8" fontSize="8" fontWeight="medium">Trichy</text>
                <circle cx="130" cy="310" r="6" fill="#10b981" />
                <text x="100" y="325" fill="#1e293b" fontSize="9" fontWeight="bold">Madurai (Silo)</text>
              </svg>
            </div>
          </div>
        )}

        {/* TAB 2: FARMER LISTINGS */}
        {activeTab === "listings" && (
          <div className="bg-white border border-slate-200/60 rounded-3xl shadow-sm overflow-hidden animate-fadeIn">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 font-bold uppercase">
                  <th className="px-6 py-4">Crop Name</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Weight</th>
                  <th className="px-6 py-4">Expected Price</th>
                  <th className="px-6 py-4">Operations Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                <tr className="hover:bg-slate-50/50">
                  <td className="px-6 py-4 font-bold text-slate-900">Thanjavur Ponni Rice</td>
                  <td className="px-6 py-4">Grains</td>
                  <td className="px-6 py-4">2,000 kg</td>
                  <td className="px-6 py-4">₹54/kg</td>
                  <td className="px-6 py-4">
                    <span className="bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full border border-emerald-100">Ready for pickup</span>
                  </td>
                </tr>
                <tr className="hover:bg-slate-50/50">
                  <td className="px-6 py-4 font-bold text-slate-900">Erode Turmeric (Grade A)</td>
                  <td className="px-6 py-4">Vegetables</td>
                  <td className="px-6 py-4">800 kg</td>
                  <td className="px-6 py-4">₹140/kg</td>
                  <td className="px-6 py-4">
                    <span className="bg-amber-50 text-amber-700 px-2.5 py-1 rounded-full border border-amber-100">Pending Carrier</span>
                  </td>
                </tr>
                <tr className="hover:bg-slate-50/50">
                  <td className="px-6 py-4 font-bold text-slate-900">Pollachi Coconuts</td>
                  <td className="px-6 py-4">Fruits</td>
                  <td className="px-6 py-4">3,000 kg</td>
                  <td className="px-6 py-4">₹42/kg</td>
                  <td className="px-6 py-4">
                    <span className="bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full">Completed</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 3: TRANSPORTER FLEET */}
        {activeTab === "fleet" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fadeIn">
            <div className="bg-white border border-slate-200/60 p-5 rounded-3xl shadow-sm flex items-center justify-between hover:shadow-md transition-shadow duration-200">
              <div className="space-y-1">
                <h4 className="font-extrabold text-slate-900 text-sm">Mini Pickup (Tata Ace)</h4>
                <p className="text-xs text-slate-500">Driver: <strong>Senthil Kumar</strong></p>
                <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-100">Active</span>
              </div>
              <span className="text-2xl">🛻</span>
            </div>

            <div className="bg-white border border-slate-200/60 p-5 rounded-3xl shadow-sm flex items-center justify-between hover:shadow-md transition-shadow duration-200">
              <div className="space-y-1">
                <h4 className="font-extrabold text-slate-900 text-sm">Bolero Pickup</h4>
                <p className="text-xs text-slate-500">Driver: <strong>Rajan M.</strong></p>
                <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-100">Active</span>
              </div>
              <span className="text-2xl">🚐</span>
            </div>

            <div className="bg-white border border-slate-200/60 p-5 rounded-3xl shadow-sm flex items-center justify-between hover:shadow-md transition-shadow duration-200">
              <div className="space-y-1">
                <h4 className="font-extrabold text-slate-900 text-sm">Reefer Cold-Mini Truck</h4>
                <p className="text-xs text-slate-500">Driver: <strong>Anbu Selvan</strong></p>
                <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-100">Active</span>
              </div>
              <span className="text-2xl">🧊</span>
            </div>
          </div>
        )}

        {/* TAB 4: AI CROP DATABASE */}
        {activeTab === "database" && (
          <div className="bg-white border border-slate-200/60 rounded-3xl shadow-sm overflow-hidden animate-fadeIn">
            <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">Showing {cropDb.length} crop thermal profiles parsed from farmgo_crop_database.csv</span>
              <button 
                onClick={() => alert("Retraining model using newest weights...")}
                className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs px-3 py-1.5 rounded-xl transition-all cursor-pointer border-0 flex items-center space-x-1"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Retrain AI Models</span>
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 font-bold uppercase">
                    <th className="px-6 py-4">Crop name</th>
                    <th className="px-6 py-4">Temperature target</th>
                    <th className="px-6 py-4">Ideal vehicle suggestion</th>
                    <th className="px-6 py-4">Humidity Range</th>
                    <th className="px-6 py-4">Storage Category</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {cropDb.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="px-6 py-4 font-bold text-slate-900">{row.crop}</td>
                      <td className="px-6 py-4 text-emerald-600 font-bold">{row.temp}</td>
                      <td className="px-6 py-4">{row.vehicle}</td>
                      <td className="px-6 py-4 text-slate-500">{row.humidity}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          row.storage === "Cold" || row.storage === "Cold Storage" ? "bg-blue-50 text-blue-700 border border-blue-100" :
                          row.storage === "Dry" || row.storage === "Dry Storage" ? "bg-amber-50 text-amber-700 border border-amber-100" :
                          "bg-slate-100 text-slate-700"
                        }`}>{row.storage}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 5: DELIVERY HISTORY */}
        {activeTab === "history" && (
          <div className="space-y-6 animate-fadeIn">
            
            {/* Header Stats Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: "Total Deliveries", value: `${completedShipments.length + shipments.filter((s: any) => (s.progress || 0) >= 100).length}`, icon: "📦", color: "emerald" },
                { label: "Total Revenue", value: `₹${(completedShipments.reduce((sum: number, s: any) => sum + s.fee, 0) + shipments.filter((s: any) => (s.progress || 0) >= 100).reduce((sum: number, s: any) => sum + (s.fee || 0), 0)).toLocaleString()}`, icon: "💰", color: "green" },
                { label: "Cold Chain Jobs", value: `${completedShipments.filter((s: any) => s.storage === "Cold Storage").length}`, icon: "🧊", color: "blue" },
                { label: "Avg Delivery Time", value: "4.2 hrs", icon: "⏱️", color: "purple" },
              ].map((stat, i) => (
                <div key={i} className="bg-white border border-slate-200/60 rounded-2xl p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{stat.label}</span>
                    <span className="text-lg">{stat.icon}</span>
                  </div>
                  <p className="text-2xl font-black text-slate-900">{stat.value}</p>
                </div>
              ))}
            </div>

            {/* Completed Shipments from live session */}
            {shipments.filter((s: any) => (s.progress || 0) >= 100).length > 0 && (
              <div className="bg-white border border-slate-200/60 rounded-3xl shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center space-x-2">
                  <div className="h-2 w-2 rounded-full bg-emerald-500" />
                  <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Completed in This Session</span>
                </div>
                <div className="divide-y divide-slate-100">
                  {shipments.filter((s: any) => (s.progress || 0) >= 100).map((s: any) => (
                    <div key={s.id} className="px-6 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-start space-x-4">
                        <div className="h-10 w-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-lg shrink-0">🌾</div>
                        <div>
                          <p className="font-black text-slate-900 text-sm">{s.crop}</p>
                          <p className="text-xs text-slate-400 font-medium mt-0.5">{s.route}</p>
                          <p className="text-[10px] text-slate-300 mt-0.5">{s.id}</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-3 items-center">
                        <span className="text-xs font-bold text-slate-600">{s.weight}</span>
                        <span className="text-xs font-bold text-emerald-600">₹{(s.fee || 0).toLocaleString()}</span>
                        <span className="bg-emerald-100 text-emerald-700 text-[10px] font-black px-2.5 py-1 rounded-full border border-emerald-200">✅ Delivered</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Historical Deliveries */}
            <div className="bg-white border border-slate-200/60 rounded-3xl shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-slate-400" />
                  <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Past Deliveries — Tamil Nadu Operations</span>
                </div>
                <span className="text-xs text-slate-400 font-medium">{completedShipments.length} records</span>
              </div>

              <div className="divide-y divide-slate-100">
                {completedShipments.map((shipment: any) => (
                  <div key={shipment.id} className="p-6 hover:bg-slate-50/50 transition-all">
                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-5">
                      
                      {/* Left: Crop + Route */}
                      <div className="flex items-start space-x-4 flex-1">
                        <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-emerald-50 to-green-100 border border-emerald-100 flex items-center justify-center text-xl shrink-0">
                          🌾
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                            <p className="font-black text-slate-900">{shipment.crop}</p>
                            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${
                              shipment.storage === "Cold Storage" 
                                ? "bg-blue-50 text-blue-700 border-blue-100" 
                                : "bg-amber-50 text-amber-700 border-amber-100"
                            }`}>
                              {shipment.storage === "Cold Storage" ? "🧊 Cold Chain" : "📦 Normal Storage"}
                            </span>
                            <span className="bg-emerald-100 text-emerald-700 text-[10px] font-black px-2 py-0.5 rounded-full border border-emerald-200">
                              ✅ {shipment.badge}
                            </span>
                          </div>
                          
                          <div className="mt-2 flex items-center space-x-2 text-xs text-slate-500 font-medium">
                            <span className="text-emerald-600 font-bold">{shipment.pickup.split(",")[0]}</span>
                            <span>➔</span>
                            <span className="text-red-500 font-bold">{shipment.destination.split(",")[0]}</span>
                          </div>

                          <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-slate-400 font-medium">
                            <span>🪪 {shipment.id}</span>
                            <span>👤 {shipment.driver}</span>
                            <span>🚛 {shipment.carrier}</span>
                            <span>🌡️ {shipment.tempRange}</span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Weight, Fare, Date */}
                      <div className="flex flex-row lg:flex-col items-center lg:items-end gap-3 lg:gap-1 shrink-0">
                        <div className="text-right">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Cargo Fare</p>
                          <p className="text-lg font-black text-emerald-600">₹{shipment.fee.toLocaleString()}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] font-bold text-slate-400">Weight</p>
                          <p className="text-xs font-bold text-slate-700">{shipment.weight}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] font-bold text-slate-400">Completed</p>
                          <p className="text-xs font-semibold text-slate-500">{shipment.date}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                <p className="text-xs text-slate-400 font-medium">Showing all completed deliveries across Tamil Nadu Operations Zone</p>
                <button 
                  onClick={() => alert("Export CSV coming soon...")}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs px-3 py-1.5 rounded-xl transition-all flex items-center space-x-1 border-0 cursor-pointer"
                >
                  <FileText className="h-3.5 w-3.5" />
                  <span>Export Report</span>
                </button>
              </div>
            </div>

          </div>
        )}

      </main>

      {/* FOOTER */}
      <footer className="bg-white text-slate-400 py-8 text-center text-xs border-t border-slate-100">
        © 2026 farmGo Central Operations Console. Gokulakrishnan K, Founder & CEO. All Rights Reserved.
      </footer>

      {/* MANIFEST AUDIT MODAL */}
      {selectedAuditManifest && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-6 relative border border-slate-100">
            {/* Close Button */}
            <button 
              onClick={() => setSelectedAuditManifest(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 text-lg cursor-pointer bg-transparent border-0"
            >
              ✕
            </button>

            {/* Receipt Content */}
            <div className="receipt-card border border-slate-200/80 rounded-2xl p-6 space-y-5 bg-white relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 to-emerald-700" />
              
              <div className="flex justify-between items-center pb-4 border-b border-dashed border-slate-200">
              <div className="flex items-center">
                <div className="logo-text font-black text-slate-900 text-xl tracking-tighter">
                  <span className="text-emerald-500 font-black">farm</span><span className="text-slate-900 font-black">Go</span>
                </div>
              </div>
                <span className="bg-emerald-50 text-emerald-800 text-[10px] font-black uppercase px-3 py-1 rounded-full border border-emerald-100">
                  Audit Confirmed
                </span>
              </div>

              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Agricultural Booking Invoice</h3>

              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs">
                <div>
                  <span className="block text-slate-400 font-bold uppercase text-[9px] tracking-wide">Booking ID</span>
                  <span className="font-bold text-slate-800">{selectedAuditManifest.id}</span>
                </div>
                <div>
                  <span className="block text-slate-400 font-bold uppercase text-[9px] tracking-wide">Date & Time</span>
                  <span className="font-bold text-slate-800">{selectedAuditManifest.date}</span>
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500">Harvest Commodity</span>
                  <span className="font-bold text-slate-900">{selectedAuditManifest.crop}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500">Weight Payload</span>
                  <span className="font-bold text-slate-900">{selectedAuditManifest.weight}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500">Pickup Origin</span>
                  <span className="font-bold text-slate-900">{selectedAuditManifest.pickup}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500">Destination Market</span>
                  <span className="font-bold text-slate-900">{selectedAuditManifest.destination}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500">Assigned Driver</span>
                  <span className="font-bold text-slate-900">{selectedAuditManifest.driver}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500">Storage Class</span>
                  <span className="font-bold text-slate-900">{selectedAuditManifest.storage}</span>
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-slate-200">
                <span className="text-sm font-black text-slate-900">Total Booking Fee Paid</span>
                <span className="text-xl font-black text-emerald-600">₹{selectedAuditManifest.fee.toLocaleString()}</span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex space-x-3 justify-end text-xs">
              <button 
                onClick={() => setSelectedAuditManifest(null)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold px-4.5 py-2.5 rounded-xl transition-all border-0 cursor-pointer"
              >
                Close Audit
              </button>
              <button 
                onClick={handlePrintAudit}
                className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-4.5 py-2.5 rounded-xl transition-all border-0 cursor-pointer shadow flex items-center space-x-1"
              >
                <FileText className="h-4 w-4" />
                <span>Print manifest Invoice</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
