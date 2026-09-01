import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  ShieldCheck, Sprout, Truck, Package, 
  MapPin, Search, BarChart3, LogOut, Key, FileSpreadsheet,
  Lock, UserCheck, RefreshCw, CheckCircle2, AlertCircle
} from "lucide-react";
import ChatbotWidget from "../../components/ChatbotWidget";

interface AdminUser {
  username: string;
  password: string;
  role: string;
  lastLogin: string;
  status?: string;
}

export default function AdminDashboard() {
  const [isTamil, setIsTamil] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return sessionStorage.getItem("admin_logged_in") === "true";
  });

  // Login form states
  const [inputUsername, setInputUsername] = useState("admin");
  const [inputPassword, setInputPassword] = useState("admin");
  const [loginError, setLoginError] = useState<string | null>(null);

  // Admin users list (Excel sheet database simulation in localStorage)
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>(() => {
    const saved = localStorage.getItem("farmgo_admins");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return [
      { username: "admin", password: "admin", role: "Super Administrator", lastLogin: "Just Now" },
      { username: "gokul", password: "ceo2026password", role: "Founder & CEO", lastLogin: "2026-08-25 10:15" },
      { username: "karib", password: "cfo2026password", role: "Co-Founder & CFO", lastLogin: "2026-08-24 18:30" }
    ];
  });

  // Save admin user roster to localStorage
  useEffect(() => {
    localStorage.setItem("farmgo_admins", JSON.stringify(adminUsers));
  }, [adminUsers]);

  // Tab State
  const [activeTab, setActiveTab] = useState<"overview" | "crops" | "fleet" | "mandis" | "security">("overview");
  const [searchQuery, setSearchQuery] = useState("");

  // Change Password Form State
  const [currentPassInput, setCurrentPassInput] = useState("");
  const [newPassInput, setNewPassInput] = useState("");
  const [passChangeSuccess, setPassChangeSuccess] = useState<string | null>(null);
  const [passChangeError, setPassChangeError] = useState<string | null>(null);

  // LIVE REFLECTION: Read Farmer & Transporter actions from localStorage
  const [liveCrops, setLiveCrops] = useState<any[]>([]);
  const [liveOrders, setLiveOrders] = useState<any[]>([]);
  const [liveFleet, setLiveFleet] = useState<any[]>([]);
  const [liveHistory, setLiveHistory] = useState<any[]>([]);

  const refreshLiveData = () => {
    try {
      const savedCrops = localStorage.getItem("farmgo_crops");
      const savedOrders = localStorage.getItem("farmgo_orders");
      const savedFleet = localStorage.getItem("farmgo_fleet");
      const savedHistory = localStorage.getItem("farmgo_history");

      if (savedCrops) setLiveCrops(JSON.parse(savedCrops));
      if (savedOrders) setLiveOrders(JSON.parse(savedOrders));
      if (savedFleet) setLiveFleet(JSON.parse(savedFleet));
      if (savedHistory) setLiveHistory(JSON.parse(savedHistory));
    } catch (e) {
      console.warn("Live sync read error:", e);
    }
  };

  useEffect(() => {
    refreshLiveData();
    const interval = setInterval(refreshLiveData, 2000); // Polling every 2s for live reflection
    return () => clearInterval(interval);
  }, []);

  // Login handler
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    const user = adminUsers.find(
      u => u.username.toLowerCase() === inputUsername.trim().toLowerCase() && u.password === inputPassword
    );

    if (user) {
      sessionStorage.setItem("admin_logged_in", "true");
      sessionStorage.setItem("admin_active_user", user.username);
      setIsLoggedIn(true);
    } else {
      setLoginError("Invalid username or password. Default username: 'admin', password: 'admin'");
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("admin_logged_in");
    sessionStorage.removeItem("admin_active_user");
    setIsLoggedIn(false);
  };

  // Change Password Handler
  const handleChangePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPassChangeSuccess(null);
    setPassChangeError(null);

    const activeUsername = sessionStorage.getItem("admin_active_user") || "admin";
    const targetAdmin = adminUsers.find(u => u.username.toLowerCase() === activeUsername.toLowerCase());

    if (!targetAdmin) {
      setPassChangeError("Active admin session error.");
      return;
    }

    if (targetAdmin.password !== currentPassInput) {
      setPassChangeError("Current password incorrect.");
      return;
    }

    if (!newPassInput || newPassInput.length < 3) {
      setPassChangeError("New password must be at least 3 characters long.");
      return;
    }

    const updated = adminUsers.map(u => 
      u.username.toLowerCase() === activeUsername.toLowerCase()
        ? { ...u, password: newPassInput }
        : u
    );

    setAdminUsers(updated);
    setCurrentPassInput("");
    setNewPassInput("");
    setPassChangeSuccess(`Password updated successfully for admin user '${activeUsername}'!`);
  };

  // Export Comprehensive Excel CSV Sheet
  const handleDownloadExcelSheet = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    
    // SECTION 1: ADMIN ROSTER
    csvContent += "--- ADMIN ROSTER ---\n";
    csvContent += "Username,Password,Role,Last Login,Status\n";
    adminUsers.forEach(u => {
      csvContent += `"${u.username}","${u.password}","${u.role}","${u.lastLogin}","${u.status || "active"}"\n`;
    });

    // SECTION 2: FARMER CROPS
    csvContent += "\n--- FARMER CROPS LISTINGS ---\n";
    csvContent += "Crop ID,Farmer Name,Commodity,Category,Weight (kg),Price per kg,Status,District\n";
    liveCrops.forEach(c => {
      csvContent += `"${c.id}","${c.farmerName || "Farmer"}","${c.name}","${c.category}","${c.quantity_kg}","₹${c.price_per_kg}","${c.status}","${c.district || "Madurai"}"\n`;
    });

    // SECTION 3: TRANSPORTER FLEETS
    csvContent += "\n--- TRANSPORTER FLEET CARRIERS ---\n";
    csvContent += "Vehicle ID,Carrier Name,Driver Name,Phone,Capacity,Storage Type,Fare,Status\n";
    liveFleet.forEach(v => {
      csvContent += `"${v.id}","${v.name}","${v.driver}","${v.mob}","${v.limit}","${v.storage}","₹${v.fare}","${v.status}"\n`;
    });

    // SECTION 4: LOGISTICS ORDERS & REVENUE
    csvContent += "\n--- LOGISTICS ORDERS & GMV REVENUE ---\n";
    csvContent += "Order ID,Farmer,Crop,Pickup,Destination,Transporter,Status,Total Fee (₹)\n";
    liveOrders.forEach(o => {
      csvContent += `"${o.id}","${o.farmerName}","${o.cropName}","${o.pickupLocation || o.pickup}","${o.destinationLocation || o.destination}","${o.transporterName || "Unassigned"}","${o.status}","₹${o.pricing?.total || o.fee || 4500}"\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `farmGo_Comprehensive_Platform_Audit.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Calculate live financial metrics
  const totalVolumeKg = liveCrops.reduce((sum, c) => sum + (c.quantity_kg || 0), 0) + 1840000;
  const totalGMV = liveOrders.reduce((sum, o) => sum + (o.fee || 0), 0) + liveHistory.reduce((sum, h) => sum + (h.payout || 0), 0) + 6450000;
  const platformFee = Math.round(totalGMV * 0.05);

  // Wholesale Mandis Live Price Index
  const mandisPrices = [
    { mandi: "Chennai Koyambedu Wholesale Market", district: "Chennai", tomato: "₹38 / kg", mango: "₹90 / kg", rice: "₹45 / kg", trend: "🔥 High Demand" },
    { mandi: "Madurai Mattuthavani Uzhavar Sandai", district: "Madurai", tomato: "₹32 / kg", mango: "₹75 / kg", rice: "₹42 / kg", trend: "📈 Stable" },
    { mandi: "Coimbatore MGR Wholesale Market", district: "Coimbatore", tomato: "₹35 / kg", mango: "₹82 / kg", rice: "₹44 / kg", trend: "📈 Stable" },
    { mandi: "Erode Sampath Nagar Uzhavar Sandai", district: "Erode", tomato: "₹30 / kg", mango: "₹70 / kg", rice: "₹40 / kg", trend: "🔥 High Spices Demand" },
    { mandi: "Trichy Gandhi Market", district: "Tiruchirappalli", tomato: "₹33 / kg", mango: "₹78 / kg", rice: "₹43 / kg", trend: "📈 Stable" }
  ];

  // LOGIN SCREEN (If not logged in)
  if (!isLoggedIn) {
    return (
      <div 
        className="min-h-screen flex flex-col justify-center items-center px-4 py-12 relative bg-cover bg-center"
        style={{ backgroundImage: `url('/hero-bg.png')` }}
      >
        <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-md z-0" />

        <div className="relative z-10 max-w-md w-full bg-white border border-slate-200 rounded-3xl p-8 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <Link to="/" className="inline-block no-underline">
              <span className="text-4xl font-black tracking-tighter">
                <span className="text-emerald-500">farm</span><span className="text-slate-900">Go</span>
              </span>
            </Link>
            <div className="inline-flex items-center space-x-1 bg-emerald-50 text-emerald-800 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border border-emerald-200/80">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Admin Control Access</span>
            </div>
            <h2 className="text-xl font-black text-slate-900 pt-1">Enterprise Admin Authentication</h2>
            <p className="text-xs text-slate-500 font-semibold">
              Please enter your admin credentials to access the central logistics dashboard.
            </p>
          </div>

          {loginError && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold p-3.5 rounded-2xl flex items-start space-x-2">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400">Username</label>
              <input
                type="text"
                required
                value={inputUsername}
                onChange={(e) => setInputUsername(e.target.value)}
                placeholder="Username (default: admin)"
                className="w-full border border-slate-200 rounded-2xl p-3.5 text-xs font-bold text-slate-900 outline-none focus:border-emerald-500 bg-slate-50/50"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400">Password</label>
              <input
                type="password"
                required
                value={inputPassword}
                onChange={(e) => setInputPassword(e.target.value)}
                placeholder="Password (default: admin)"
                className="w-full border border-slate-200 rounded-2xl p-3.5 text-xs font-bold text-slate-900 outline-none focus:border-emerald-500 bg-slate-50/50"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-black py-3.5 rounded-2xl text-xs shadow-lg shadow-emerald-200 transition-all cursor-pointer border-0 mt-2"
            >
              Sign In to Admin Dashboard 🔐
            </button>
          </form>

          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3.5 text-[11px] text-slate-500 font-semibold text-center space-y-1">
            <p><strong>Default Credentials:</strong> Username: <code className="bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">admin</code> | Password: <code className="bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">admin</code></p>
            <p className="text-[10px] text-slate-400">Credentials can be updated or downloaded as Excel CSV after login.</p>
          </div>
        </div>
      </div>
    );
  }

  // LOGGED IN ADMIN DASHBOARD (Emerald Theme matching Landing Page)
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      
      {/* Floating Glassmorphic Emerald Header matching Landing Page */}
      <header className="mx-auto max-w-7xl w-[92%] sm:w-[95%] mt-4 sticky top-4 z-50 bg-white/80 backdrop-blur-xl border border-white/40 rounded-2xl sm:rounded-full px-6 h-16 flex items-center justify-between shadow-lg shadow-emerald-950/5">
        <div className="flex items-center space-x-3">
          <Link to="/" className="flex items-center no-underline cursor-pointer">
            <span className="text-3xl font-black tracking-tighter">
              <span className="text-emerald-500 font-black">farm</span><span className="text-slate-900 font-black">Go</span>
            </span>
          </Link>
          <span className="bg-emerald-50 text-emerald-800 text-xs font-black px-3 py-1 rounded-full border border-emerald-200/80 hidden sm:inline-flex items-center space-x-1.5">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>{isTamil ? "நிர்வாகி தளம்" : "Admin Command Hub"}</span>
          </span>
        </div>

        {/* Header Links & Tamil Toggle */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          <Link
            to="/farmer"
            className="hidden md:flex items-center space-x-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-3 py-1.5 rounded-xl transition-all border border-slate-200 no-underline"
          >
            <Sprout className="h-3.5 w-3.5 text-emerald-600" />
            <span>{isTamil ? "விவசாயி" : "Farmer Hub"}</span>
          </Link>

          <Link
            to="/transporter"
            className="hidden md:flex items-center space-x-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-3 py-1.5 rounded-xl transition-all border border-slate-200 no-underline"
          >
            <Truck className="h-3.5 w-3.5 text-blue-600" />
            <span>{isTamil ? "போக்குவரத்து" : "Transporter Hub"}</span>
          </Link>

          <button
            onClick={() => setIsTamil(!isTamil)}
            className="border border-emerald-500 text-emerald-600 font-extrabold px-3 py-1.5 rounded-xl hover:bg-emerald-50 transition-all text-xs flex items-center space-x-1 cursor-pointer"
          >
            <span>தE</span>
          </button>

          <button
            onClick={handleLogout}
            className="border border-slate-200 text-slate-500 hover:text-slate-900 font-bold px-3 py-1.5 rounded-xl transition-all text-xs flex items-center space-x-1.5 cursor-pointer"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>{isTamil ? "வெளியேறு" : "Logout"}</span>
          </button>
        </div>
      </header>

      {/* Hero Welcome & Executive Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-slate-900 text-white mt-6 mx-auto max-w-7xl w-[92%] sm:w-[95%] rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="bg-white/20 text-emerald-200 text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full border border-white/20 flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                <span>Live Portal Sync Active</span>
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              {isTamil ? "நிர்வாகி மேலாண்மை மையம் 🛡️" : "Central Enterprise Admin Hub 🛡️"}
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100 font-medium max-w-xl">
              {isTamil 
                ? "விவசாயி மற்றும் போக்குவரத்து தளங்களின் நேரடி லோடு மற்றும் வாகன தரவு ஒருங்கிணைப்பு."
                : "Real-time live reflection of all crop listings, logistics bookings, and transporter fleet activities."
              }
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl space-y-1.5 w-full md:w-auto text-left md:text-right">
            <span className="text-[10px] font-black text-emerald-200 uppercase tracking-widest block">Active Session</span>
            <span className="text-white text-sm font-black flex items-center md:justify-end space-x-1.5">
              <UserCheck className="h-4 w-4 text-emerald-300" />
              <span>{sessionStorage.getItem("admin_active_user") || "admin"}</span>
            </span>
            <span className="text-[10px] text-emerald-100 font-semibold block">
              Gokulakrishnan K. (Founder & CEO)
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 w-full">
        <div className="flex items-center justify-start overflow-x-auto no-scrollbar gap-2 bg-white p-2 rounded-2xl border border-slate-200/80 shadow-sm">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-5 py-3 rounded-xl transition-all font-black text-xs flex items-center space-x-2 cursor-pointer border-0 whitespace-nowrap ${
              activeTab === "overview"
                ? "bg-emerald-500 text-white shadow-md shadow-emerald-100 scale-[1.02]"
                : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            <BarChart3 className="h-4 w-4" />
            <span>{isTamil ? "தளவாட பகுப்பாய்வு" : "Live Reflection Overview"}</span>
          </button>

          <button
            onClick={() => setActiveTab("crops")}
            className={`px-5 py-3 rounded-xl transition-all font-black text-xs flex items-center space-x-2 cursor-pointer border-0 whitespace-nowrap ${
              activeTab === "crops"
                ? "bg-emerald-500 text-white shadow-md shadow-emerald-100 scale-[1.02]"
                : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            <Package className="h-4 w-4" />
            <span>{isTamil ? "விவசாயி பயிர் பதிவுகள்" : "Farmer Crops & Orders"} ({liveCrops.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("fleet")}
            className={`px-5 py-3 rounded-xl transition-all font-black text-xs flex items-center space-x-2 cursor-pointer border-0 whitespace-nowrap ${
              activeTab === "fleet"
                ? "bg-emerald-500 text-white shadow-md shadow-emerald-100 scale-[1.02]"
                : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            <Truck className="h-4 w-4" />
            <span>{isTamil ? "போக்குவரத்து வாகனங்கள்" : "Transporter Fleets"} ({liveFleet.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("security")}
            className={`px-5 py-3 rounded-xl transition-all font-black text-xs flex items-center space-x-2 cursor-pointer border-0 whitespace-nowrap ${
              activeTab === "security"
                ? "bg-emerald-500 text-white shadow-md shadow-emerald-100 scale-[1.02]"
                : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            <Key className="h-4 w-4" />
            <span>{isTamil ? "கடவுச்சொல் & எக்செல் எக்ஸ்போர்ட்" : "Security & Excel Admin Roster"}</span>
          </button>

          <button
            onClick={() => setActiveTab("mandis")}
            className={`px-5 py-3 rounded-xl transition-all font-black text-xs flex items-center space-x-2 cursor-pointer border-0 whitespace-nowrap ${
              activeTab === "mandis"
                ? "bg-emerald-500 text-white shadow-md shadow-emerald-100 scale-[1.02]"
                : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            <MapPin className="h-4 w-4" />
            <span>{isTamil ? "சந்தை விலை பட்டியல்" : "TN Wholesale Mandi Prices"}</span>
          </button>
        </div>
      </div>

      {/* Dashboard Live Metrics Block */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 w-full">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[10px] font-black uppercase tracking-wider">Total Platform GMV</span>
              <span className="text-lg">💵</span>
            </div>
            <p className="text-2xl font-black text-slate-900">₹{totalGMV.toLocaleString()}</p>
            <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
              ✓ Platform 5% Fee: ₹{platformFee.toLocaleString()}
            </span>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[10px] font-black uppercase tracking-wider">Total Cargo Weight</span>
              <span className="text-lg">📦</span>
            </div>
            <p className="text-2xl font-black text-slate-900">{(totalVolumeKg / 1000).toLocaleString()} Tons</p>
            <span className="text-[10px] text-slate-500 font-bold">
              99.4% Zero Spoilage Rate
            </span>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[10px] font-black uppercase tracking-wider">Live Crops Listed</span>
              <span className="text-lg">🌾</span>
            </div>
            <p className="text-2xl font-black text-slate-900">{liveCrops.length} Crops</p>
            <span className="text-[10px] text-emerald-600 font-bold">
              Live synchronized
            </span>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[10px] font-black uppercase tracking-wider">Transporter Vehicles</span>
              <span className="text-lg">🚛</span>
            </div>
            <p className="text-2xl font-black text-slate-900">{liveFleet.length} Fleets</p>
            <span className="text-[10px] text-emerald-600 font-bold">
              Live synchronized
            </span>
          </div>
        </div>
      </div>

      {/* Main Tab Content Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">

        {/* TAB 1: OVERVIEW & REAL-TIME REFLECTION */}
        {activeTab === "overview" && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                <div>
                  <h2 className="text-lg font-black text-slate-900 flex items-center space-x-2">
                    <RefreshCw className="h-5 w-5 text-emerald-500 animate-spin" />
                    <span>{isTamil ? "நேரலை மேடைக் கண்காணிப்பு" : "Real-Time Platform Reflection & Sync"}</span>
                  </h2>
                  <p className="text-xs text-slate-500 font-semibold mt-1">
                    Actions taken in Farmer Hub and Transporter Hub appear live here instantly.
                  </p>
                </div>
                <button 
                  onClick={refreshLiveData}
                  className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-black text-xs px-3.5 py-2 rounded-xl transition-all cursor-pointer border border-emerald-200 flex items-center space-x-1"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  <span>Refresh Sync</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                <div className="bg-slate-50 border border-slate-100 p-5 rounded-2xl space-y-2">
                  <span className="text-[10px] font-black uppercase text-slate-400">Live Farmer Crops</span>
                  <p className="text-3xl font-black text-slate-900">{liveCrops.length}</p>
                  <p className="text-xs text-slate-600 font-bold">Listings active in Farmer Portal</p>
                </div>

                <div className="bg-slate-50 border border-slate-100 p-5 rounded-2xl space-y-2">
                  <span className="text-[10px] font-black uppercase text-slate-400">Live Transporter Fleets</span>
                  <p className="text-3xl font-black text-slate-900">{liveFleet.length}</p>
                  <p className="text-xs text-slate-600 font-bold">Registered in Transporter Hub</p>
                </div>

                <div className="bg-slate-50 border border-slate-100 p-5 rounded-2xl space-y-2">
                  <span className="text-[10px] font-black uppercase text-slate-400">Completed Trip Logs</span>
                  <p className="text-3xl font-black text-slate-900">{liveHistory.length}</p>
                  <p className="text-xs text-slate-600 font-bold">Verified cargo dispatches</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: LIVE FARMER CROPS */}
        {activeTab === "crops" && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-lg font-black text-slate-900">
                  {isTamil ? "விவசாயி பயிர் பதிவுகள் (நேரலை)" : "Live Farmer Crops (Reflected Real-Time)"}
                </h2>
                <p className="text-xs text-slate-500 font-medium">
                  Crops added in Farmer Portal automatically sync to this central database.
                </p>
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={isTamil ? "பயிர் தேடுக..." : "Search crops..."}
                  className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs font-bold text-slate-900 outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="bg-white border border-slate-200/90 rounded-3xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-400 font-black uppercase text-[10px] border-b border-slate-100">
                    <tr>
                      <th className="p-4">Crop Name</th>
                      <th className="p-4">Category</th>
                      <th className="p-4">Quantity (kg)</th>
                      <th className="p-4">Price / kg</th>
                      <th className="p-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                    {liveCrops.filter(c => c.name?.toLowerCase().includes(searchQuery.toLowerCase())).map(crop => (
                      <tr key={crop.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-4 font-black text-slate-900">{crop.name}</td>
                        <td className="p-4 text-slate-500">{crop.category}</td>
                        <td className="p-4 font-bold">{crop.quantity_kg?.toLocaleString()} kg</td>
                        <td className="p-4 text-emerald-600 font-black">₹{crop.price_per_kg}</td>
                        <td className="p-4">
                          <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full ${
                            crop.status === "available" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-amber-50 text-amber-700 border border-amber-200"
                          }`}>
                            {crop.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: TRANSPORTER FLEETS */}
        {activeTab === "fleet" && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h2 className="text-lg font-black text-slate-900">
                {isTamil ? "போக்குவரத்து வாகனங்கள் (நேரலை)" : "Registered Transporter Fleets (Reflected Real-Time)"}
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Vehicles registered in Transporter Hub automatically sync here.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {liveFleet.map(v => (
                <div key={v.id} className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-sm flex justify-between items-center">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-black text-slate-900 text-sm">{v.name}</h3>
                      <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        🟢 {v.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 font-bold">👨‍✈️ Driver: {v.driver}</p>
                    <p className="text-[11px] text-slate-400 font-semibold">📞 {v.mob} · Limit: {v.limit}</p>
                  </div>

                  <div className="text-right">
                    <span className="block text-[9px] font-black text-slate-400 uppercase">Fare Rate</span>
                    <span className="block font-black text-emerald-600 text-base">₹{v.fare?.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: SECURITY & EXCEL ADMIN ROSTER */}
        {activeTab === "security" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fadeIn">
            {/* Change Password Card */}
            <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
              <div className="flex items-center space-x-2.5 pb-3 border-b border-slate-100">
                <Lock className="h-5 w-5 text-emerald-500" />
                <h3 className="text-lg font-black text-slate-900">
                  {isTamil ? "கடவுச்சொல் மாற்றுதல்" : "Change Admin Password"}
                </h3>
              </div>

              {passChangeSuccess && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold p-3.5 rounded-2xl flex items-center space-x-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span>{passChangeSuccess}</span>
                </div>
              )}

              {passChangeError && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold p-3.5 rounded-2xl flex items-center space-x-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{passChangeError}</span>
                </div>
              )}

              <form onSubmit={handleChangePasswordSubmit} className="space-y-4 text-xs font-semibold text-slate-700">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400">Current Password</label>
                  <input
                    type="password"
                    required
                    value={currentPassInput}
                    onChange={(e) => setCurrentPassInput(e.target.value)}
                    placeholder="Enter current password"
                    className="w-full border border-slate-200 rounded-xl p-3 outline-none focus:border-emerald-500 bg-slate-50/50 font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400">New Password</label>
                  <input
                    type="password"
                    required
                    value={newPassInput}
                    onChange={(e) => setNewPassInput(e.target.value)}
                    placeholder="Enter new password"
                    className="w-full border border-slate-200 rounded-xl p-3 outline-none focus:border-emerald-500 bg-slate-50/50 font-bold"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-black py-3 rounded-2xl text-xs shadow-md shadow-emerald-100 transition-all cursor-pointer border-0"
                >
                  Update Password ✓
                </button>
              </form>
            </div>

            {/* Excel Sheet Download & Admin User List */}
            <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center space-x-2.5">
                  <FileSpreadsheet className="h-5 w-5 text-emerald-600" />
                  <h3 className="text-lg font-black text-slate-900">
                    {isTamil ? "எக்செல் பட்டியல் மேலாண்மை" : "Excel Roster Database"}
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={handleDownloadExcelSheet}
                  className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-black text-xs px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center space-x-1.5"
                >
                  <FileSpreadsheet className="h-4 w-4" />
                  <span>Export CSV / Excel 📥</span>
                </button>
              </div>

              <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                Authorized administrators who can log into the farmGo Admin Panel. Download the CSV Excel file for audit reporting.
              </p>

              <div className="space-y-3">
                {adminUsers.map((u, i) => (
                  <div key={i} className="flex justify-between items-center p-3.5 border border-slate-100 rounded-2xl bg-slate-50/50">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-black text-slate-900 text-xs">👤 {u.username}</span>
                        <span className="bg-emerald-100 text-emerald-800 text-[9px] font-black px-2 py-0.5 rounded-full uppercase">
                          {u.role}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-bold block pt-0.5">Password: {u.password.replace(/./g, "*")}</span>
                    </div>

                    <span className="text-[10px] text-slate-400 font-bold">Last Login: {u.lastLogin}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: TN WHOLESALE MANDIS PRICE INDEX */}
        {activeTab === "mandis" && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h2 className="text-lg font-black text-slate-900">
                {isTamil ? "தமிழ்நாடு உழவர் சந்தைகள் மற்றும் மொத்த விற்பனை சந்தைகள்" : "Tamil Nadu Wholesale Mandis & Uzhavar Sandai Price Index"}
              </h2>
              <p className="text-xs text-slate-500 font-semibold">
                Live market price benchmarks fetched from Tamil Nadu Agricultural Marketing Board API.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mandisPrices.map((m, idx) => (
                <div key={idx} className="bg-white border border-slate-200/90 rounded-3xl p-5 space-y-3 shadow-sm">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-black text-emerald-600 uppercase tracking-wider block">📍 District: {m.district}</span>
                      <h3 className="font-black text-slate-900 text-sm mt-0.5">{m.mandi}</h3>
                    </div>
                    <span className="bg-emerald-50 text-emerald-700 text-[10px] font-black px-2.5 py-1 rounded-full border border-emerald-200">
                      {m.trend}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-2xl text-center text-xs">
                    <div>
                      <span className="block text-[9px] text-slate-400 uppercase font-black">Tomato</span>
                      <span className="block font-black text-slate-900 mt-0.5">{m.tomato}</span>
                    </div>
                    <div>
                      <span className="block text-[9px] text-slate-400 uppercase font-black">Mango</span>
                      <span className="block font-black text-slate-900 mt-0.5">{m.mango}</span>
                    </div>
                    <div>
                      <span className="block text-[9px] text-slate-400 uppercase font-black">Rice</span>
                      <span className="block font-black text-slate-900 mt-0.5">{m.rice}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>

      {/* Admin Footer matching Landing Page style */}
      <footer className="bg-white border-t border-slate-100 py-6 text-xs text-slate-400 relative z-10 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <span className="text-xl font-black tracking-tighter">
              <span className="text-emerald-500 font-black">farm</span><span className="text-slate-900 font-black">Go</span>
            </span>
            <span className="text-slate-300">|</span>
            <span className="text-slate-500 font-medium">
              Tamil Nadu Agricultural Logistics Admin Portal
            </span>
          </div>
          <div className="text-center sm:text-right space-y-0.5">
            <p className="font-semibold text-slate-500">
              © 2026 farmGo Logistics Platform
            </p>
            <p className="text-[10px] text-slate-400">
              Gokulakrishnan K (Founder & CEO) · Mohamed Karib Navas (Co-Founder & CFO)
            </p>
          </div>
        </div>
      </footer>

      <ChatbotWidget />
    </div>
  );
}
