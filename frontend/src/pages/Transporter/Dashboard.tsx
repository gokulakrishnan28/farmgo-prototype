import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { 
  Truck, LogOut, MapPin, Plus, Fuel, Calendar, Trash2
} from "lucide-react";
import ChatbotWidget from "../../components/ChatbotWidget";
import { farmgoStore } from "../../services/farmgoStore";

interface ShipmentRequest {
  id: string;
  cropName: string;
  priority: "High" | "Immediate (Needs Air-lock)" | "Normal";
  pickup: string;
  destination: string;
  farmer: string;
  weight: string;
  storage: string;
  income: number;
}

interface TransporterMapProps {
  pickup?: string;
  destination?: string;
}

function GoogleMapTransporterComponent({ pickup, destination }: TransporterMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";

    const initMap = () => {
      if (!mapRef.current) return;
      const google = (window as any).google;
      if (!google) return;
      
      const map = new google.maps.Map(mapRef.current, {
        center: { lat: 11.1271, lng: 78.6569 }, // Center of Tamil Nadu
        zoom: pickup && destination ? 8 : 7.5,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false
      });

      const directionsService = new google.maps.DirectionsService();

      const getLatLng = (addr: string) => {
        const lower = addr.toLowerCase();
        if (lower.includes("madurai") || lower.includes("mattuthavani")) return { lat: 9.9252, lng: 78.1198 };
        if (lower.includes("chennai") || lower.includes("koyambedu")) return { lat: 13.0732, lng: 80.1912 };
        if (lower.includes("coimbatore")) return { lat: 11.0168, lng: 76.9558 };
        if (lower.includes("salem")) return { lat: 11.6643, lng: 78.1460 };
        if (lower.includes("trichy") || lower.includes("tiruchirappalli")) return { lat: 10.7905, lng: 78.7047 };
        if (lower.includes("erode")) return { lat: 11.3410, lng: 77.7172 };
        if (lower.includes("pollachi")) return { lat: 10.6587, lng: 77.0082 };
        if (lower.includes("theni")) return { lat: 10.0103, lng: 77.4770 };
        if (lower.includes("dindigul")) return { lat: 10.3673, lng: 77.9803 };
        if (lower.includes("thanjavur")) return { lat: 10.7870, lng: 79.1378 };
        return { lat: 10.7905, lng: 78.7047 };
      };

      const makePin = (color: string, label: string) => ({
        url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
          `<svg xmlns="http://www.w3.org/2000/svg" width="34" height="42" viewBox="0 0 34 42">
            <filter id="shadow"><feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="rgba(0,0,0,0.3)"/></filter>
            <path filter="url(#shadow)" d="M17 2C9.8 2 4 7.8 4 15c0 10.5 13 25 13 25s13-14.5 13-25C30 7.8 24.2 2 17 2z" fill="${color}"/>
            <circle cx="17" cy="15" r="6" fill="white"/>
            <text x="17" y="19" text-anchor="middle" font-size="9" font-weight="900" font-family="sans-serif" fill="${color}">${label}</text>
          </svg>`
        )}`,
        scaledSize: new google.maps.Size(34, 42),
        anchor: new google.maps.Point(17, 42)
      });

      const renderTrip = (originStr: string, destStr: string, color: string, indexLabel?: string) => {
        const originLatLng = getLatLng(originStr);
        const destLatLng = getLatLng(destStr);

        new google.maps.Marker({
          position: originLatLng,
          map: map,
          icon: makePin(color, indexLabel ? `${indexLabel}A` : "A"),
          title: `Pickup Origin: ${originStr}`
        });

        new google.maps.Marker({
          position: destLatLng,
          map: map,
          icon: makePin("#ef4444", indexLabel ? `${indexLabel}B` : "B"),
          title: `Destination Market: ${destStr}`
        });

        const directionsRenderer = new google.maps.DirectionsRenderer({
          map: map,
          suppressMarkers: true,
          polylineOptions: {
            strokeColor: color,
            strokeWeight: 5,
            strokeOpacity: 0.85
          }
        });

        directionsService.route(
          {
            origin: originLatLng,
            destination: destLatLng,
            travelMode: google.maps.TravelMode.DRIVING
          },
          (result: any, status: any) => {
            if (status === google.maps.DirectionsStatus.OK) {
              directionsRenderer.setDirections(result);
            } else {
              new google.maps.Polyline({
                path: [originLatLng, destLatLng],
                geodesic: true,
                strokeColor: color,
                strokeOpacity: 0.85,
                strokeWeight: 5,
                map: map
              });
            }
          }
        );

        const bounds = new google.maps.LatLngBounds();
        bounds.extend(originLatLng);
        bounds.extend(destLatLng);
        map.fitBounds(bounds, { top: 50, bottom: 50, left: 30, right: 30 });
      };

      if (pickup && destination) {
        renderTrip(pickup, destination, "#10b981");
      } else {
        // Multi-trip overview default
        renderTrip("Erode, Tamil Nadu", "Koyambedu, Chennai, Tamil Nadu", "#10b981", "1");
        renderTrip("Pollachi, Tamil Nadu", "Mattuthavani, Madurai, Tamil Nadu", "#3b82f6", "2");
      }
    };

    if (!(window as any).google) {
      if (!document.getElementById("google-maps-script")) {
        const script = document.createElement("script");
        script.id = "google-maps-script";
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
        script.async = true;
        script.defer = true;
        script.onload = initMap;
        document.head.appendChild(script);
      }
    } else {
      initMap();
    }
  }, [pickup, destination]);

  return <div ref={mapRef} className="w-full h-full min-h-[320px] rounded-2xl overflow-hidden shadow-inner border border-slate-100" />;
}

export default function TransporterDashboard() {
  const [isTamil, setIsTamil] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "fleet" | "nearby" | "history">("nearby");

  // Subscribe to farmgoStore single source of truth
  const [fleet, setFleet] = useState<any[]>(() => farmgoStore.getFleet());
  const [allOrders, setAllOrders] = useState<any[]>(() => farmgoStore.getOrders());

  const refreshTransporterState = () => {
    setFleet(farmgoStore.getFleet());
    setAllOrders(farmgoStore.getOrders());
  };

  useEffect(() => {
    refreshTransporterState();
    window.addEventListener("farmgo_store_change", refreshTransporterState);
    window.addEventListener("storage", refreshTransporterState);
    return () => {
      window.removeEventListener("farmgo_store_change", refreshTransporterState);
      window.removeEventListener("storage", refreshTransporterState);
    };
  }, []);

  // Filter requests (open jobs booked by farmers)
  const requests = allOrders.filter(o => o.status === "BOOKED" || o.status === "ASSIGNED").map(o => ({
    id: o.id,
    cropName: o.cropName.toUpperCase(),
    priority: o.preservationStorage.toLowerCase().includes("cold") ? ("Immediate (Needs Air-lock)" as const) : ("High" as const),
    pickup: o.pickupLocation.split(" ")[0] || "Origin",
    destination: o.destinationLocation.split(" ")[0] || "Destination",
    farmer: o.farmerName,
    weight: `${o.weightKg} kg`,
    storage: o.preservationStorage,
    income: o.pricing?.total || 4500
  }));

  // Filter completed history
  const history = allOrders.filter(o => o.status === "DELIVERED").map(o => ({
    id: o.id,
    date: o.updatedAt || o.createdAt,
    cargo: o.cropName,
    weight: `${o.weightKg} kg`,
    route: `${o.pickupLocation.split(" ")[0]} to ${o.destinationLocation.split(" ")[0]}`,
    driver: o.driverName || "Senthil Kumar",
    payout: o.pricing?.total || 4500
  }));

  // Calculated metrics
  const grossIncome = history.reduce((sum, h) => sum + h.payout, 0) + 45600;
  const deliveriesCount = history.length + 6;
  const activeCount = allOrders.filter(o => o.status !== "DELIVERED" && o.status !== "CANCELLED").length;

  // Modal 1: Live Trip Route & Confirmation Modal state
  const [activeTripModal, setActiveTripModal] = useState<ShipmentRequest | null>(null);
  const [selectedDriver, setSelectedDriver] = useState<string>("Senthil Kumar");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modal 2: Register New Vehicle state
  const [showRegisterVehicleModal, setShowRegisterVehicleModal] = useState(false);
  const [regName, setRegName] = useState("");
  const [regDriver, setRegDriver] = useState("");
  const [regMob, setRegMob] = useState("");
  const [regLimit, setRegLimit] = useState("1.5 Tons");
  const [regStorage, setRegStorage] = useState("Normal storage");
  const [regFare, setRegFare] = useState("4500");

  // Step A: Driver clicks "Accept Ride" -> Opens Map & Confirmation Modal
  const handleAcceptRide = (id: string) => {
    const targetReq = requests.find(r => r.id === id);
    if (!targetReq) return;
    setActiveTripModal(targetReq);
  };

  // Step B: Driver clicks "Confirm & Dispatch Ride 🚚" in Modal
  const handleConfirmDispatch = () => {
    if (!activeTripModal) return;

    const req = activeTripModal;
    const transporterName = sessionStorage.getItem("user_name") || "Mohamed Karib Navas";

    // Update order status in central store
    farmgoStore.updateOrderStatus(req.id, "DRIVER_ASSIGNED", {
      transporterName,
      driverName: selectedDriver,
      driverPhone: "+91 94441 23451",
      vehicleName: "Reefer Cold-Mini Truck"
    });

    setActiveTripModal(null);
    setToastMessage(isTamil 
      ? `✅ பயணம் உறுதிப்படுத்தப்பட்டது! ${selectedDriver} ஓட்டுநர் ${req.pickup} லிருந்து ${req.destination} க்கு புறப்படுகிறார்!`
      : `✅ Dispatch Confirmed! Driver ${selectedDriver} is en-route from ${req.pickup} to ${req.destination}!`
    );

    setTimeout(() => setToastMessage(null), 5000);
  };

  // Handle Reject Ride
  const handleRejectRide = (id: string) => {
    farmgoStore.updateOrderStatus(id, "CANCELLED");
  };

  // Handle New Vehicle Registration Submit
  const handleRegisterVehicleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim() || !regDriver.trim()) return;

    const transporterName = sessionStorage.getItem("user_name") || "Mohamed Karib Navas";

    farmgoStore.addVehicle({
      transporterName,
      name: regName,
      driver: regDriver,
      mob: regMob || "+91 98400 12345",
      limit: regLimit,
      storage: regStorage as any,
      fare: parseFloat(regFare) || 4500,
      status: "Standby Active",
      image: "/truck.jpg"
    });

    setShowRegisterVehicleModal(false);
    setRegName("");
    setRegDriver("");
    setRegMob("");
    setActiveTab("fleet");

    setToastMessage(isTamil 
      ? `🎉 புதிய வாகனம் "${regName}" வெற்றிகரமாக பதிவு செய்யப்பட்டது!`
      : `🎉 New Vehicle "${regName}" successfully registered into active fleet!`
    );
    setTimeout(() => setToastMessage(null), 5000);
  };

  const handleDeleteVehicle = (id: string, name: string) => {
    if (confirm(`Remove vehicle "${name}" from fleet?`)) {
      farmgoStore.deleteVehicle(id);
    }
  };

  const downloadReceipt = (order: any) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Please allow popups to download/print the receipt.");
      return;
    }
    
    const id = order.id || `FG-TRIP-${Math.floor(1000 + Math.random() * 9000)}`;
    const dateStr = order.date || new Date().toLocaleString();
    const crop = order.cargo || order.cropName || "Agri Cargo";
    const pickup = order.pickup || order.route?.split(" to ")[0] || "Origin Hub";
    const dest = order.destination || order.route?.split(" to ")[1] || "Destination Hub";
    const priceVal = order.payout || order.income || order.fee || 0;
    const driverName = order.driver || order.transporterName || "Assigned Carrier";
    const weight = order.weight || "1.5 Tons";
    const storage = order.storage || "Controlled Temp Cargo";
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Dispatch Receipt - farmGo Transporter</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 30px; color: #334155; background: #f8fafc; }
            .receipt-card { max-width: 650px; margin: 0 auto; background: white; border: 1px solid #e2e8f0; border-radius: 24px; padding: 40px; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05); position: relative; overflow: hidden; }
            .receipt-card::before { content: ""; position: absolute; top: 0; left: 0; right: 0; height: 8px; background: linear-gradient(90deg, #10b981 0%, #059669 100%); }
            .header { display: flex; align-items: center; justify-content: space-between; border-bottom: 2px dashed #f1f5f9; padding-bottom: 24px; margin-bottom: 24px; }
            .logo-section { display: flex; align-items: center; gap: 10px; }
            .logo-box { width: 36px; height: 36px; border-radius: 10px; background-color: #10b981; display: flex; align-items: center; justify-content: center; color: white; font-weight: 900; font-size: 18px; box-shadow: 0 4px 6px -1px rgba(16, 185, 129, 0.2); }
            .logo-text { font-size: 22px; font-weight: 800; color: #10b981; font-family: sans-serif; }
            .logo-accent { color: #0f172a; }
            .badge { background: #ecfdf5; color: #047857; font-size: 11px; font-weight: 800; padding: 6px 14px; border-radius: 9999px; border: 1px solid #a7f3d0; text-transform: uppercase; letter-spacing: 0.05em; font-family: sans-serif; }
            .receipt-title { font-size: 18px; font-weight: 800; color: #0f172a; margin-top: 0; font-family: sans-serif; }
            .meta-grid { display: grid; grid-template-cols: 1fr 1fr; gap: 20px; margin-bottom: 24px; background: #f8fafc; padding: 18px; border-radius: 16px; border: 1px solid #f1f5f9; }
            .meta-item { display: flex; flex-direction: column; gap: 4px; }
            .meta-label { font-size: 10px; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; font-family: sans-serif; }
            .meta-val { font-size: 13px; font-weight: 700; color: #1e293b; font-family: sans-serif; }
            .details-table { width: 100%; border-collapse: collapse; margin-bottom: 28px; }
            .table-hdr { text-align: left; font-size: 11px; font-weight: 800; color: #94a3b8; text-transform: uppercase; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px; font-family: sans-serif; }
            .table-row td { padding: 14px 0; border-bottom: 1px solid #f1f5f9; font-size: 13px; font-weight: 600; color: #334155; font-family: sans-serif; }
            .table-row td.strong { font-weight: 700; color: #0f172a; }
            .total-row { border-top: 2px solid #e2e8f0; padding-top: 18px; display: flex; justify-content: space-between; align-items: center; }
            .total-label { font-size: 15px; font-weight: 800; color: #0f172a; font-family: sans-serif; }
            .total-amount { font-size: 24px; font-weight: 900; color: #047857; font-family: sans-serif; }
            .stamp { text-align: center; margin-top: 30px; opacity: 0.8; font-size: 12px; font-weight: 700; color: #10b981; text-transform: uppercase; border: 2px solid #10b981; width: fit-content; margin-left: auto; margin-right: auto; padding: 6px 14px; border-radius: 8px; transform: rotate(-5deg); letter-spacing: 0.1em; font-family: sans-serif; }
            .footer { text-align: center; margin-top: 40px; font-size: 11px; color: #94a3b8; font-weight: 500; border-top: 1px solid #f1f5f9; padding-top: 20px; font-family: sans-serif; }
          </style>
        </head>
        <body>
          <div class="receipt-card">
            <div class="header">
              <div class="logo-section">
                <div class="logo-box" style="padding: 6px; box-sizing: border-box;">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width: 100%; height: 100%;"><path d="m7 9 2.5-2.5C10.6 5.4 12.4 5 14 5v4"/><path d="M7 9C5.4 9 5 10.8 5 12.5L7.5 15h4v-4"/><path d="M7.5 15 10 12.5C11.1 11.4 11.5 9.6 11.5 8h4v4"/><path d="m14 9 2.5-2.5c1.1-1.1 2.9-1.5 4.5-1.5v4"/><path d="M14 9c-1.6 0-2 .8-2 2.5l2.5 2.5h4v-4"/><path d="M14.5 15 17 12.5c1.1-1.1 1.5-2.9 1.5-4.5h4v4"/><path d="M2 22h20"/><path d="M12 22V9"/></svg>
                </div>
                <div class="logo-text">farm<span class="logo-accent">Go</span></div>
              </div>
              <div class="badge">Dispatch Manifest</div>
            </div>

            <h3 class="receipt-title">Agricultural Cargo Dispatch Order</h3>

            <div class="meta-grid">
              <div class="meta-item">
                <span class="meta-label">Trip Log Ref</span>
                <span class="meta-val">${id}</span>
              </div>
              <div class="meta-item">
                <span class="meta-label">Date & Time</span>
                <span class="meta-val">${dateStr}</span>
              </div>
            </div>

            <table class="details-table">
              <thead>
                <tr>
                  <th class="table-hdr">Cargo & Route Details</th>
                  <th class="table-hdr" style="text-align: right;">Specification</th>
                </tr>
              </thead>
              <tbody>
                <tr class="table-row">
                  <td>Transporter Name</td>
                  <td style="text-align: right;" class="strong">${sessionStorage.getItem("user_name") || "Mohamed Karib Navas"}</td>
                </tr>
                <tr class="table-row">
                  <td>Transporter Phone</td>
                  <td style="text-align: right;" class="strong">${sessionStorage.getItem("user_phone") || "+91 98765 43210"}</td>
                </tr>
                <tr class="table-row">
                  <td>Transporter Email</td>
                  <td style="text-align: right;" class="strong">${sessionStorage.getItem("user_email") || "karib@gmail.com"}</td>
                </tr>
                <tr class="table-row">
                  <td>Harvest Cargo</td>
                  <td style="text-align: right;" class="strong">${crop}</td>
                </tr>
                <tr class="table-row">
                  <td>Weight Payload</td>
                  <td style="text-align: right;" class="strong">${weight}</td>
                </tr>
                <tr class="table-row">
                  <td>Pickup Origin Hub</td>
                  <td style="text-align: right;" class="strong">${pickup}</td>
                </tr>
                <tr class="table-row">
                  <td>Destination Market</td>
                  <td style="text-align: right;" class="strong">${dest}</td>
                </tr>
                <tr class="table-row">
                  <td>Assigned Driver</td>
                  <td style="text-align: right;" class="strong">${driverName}</td>
                </tr>
                <tr class="table-row">
                  <td>Preservation Requirement</td>
                  <td style="text-align: right;" class="strong">${storage}</td>
                </tr>
              </tbody>
            </table>

            <div class="total-row">
              <span class="total-label">Total Transporter Payout</span>
              <span class="total-amount">₹${priceVal.toLocaleString()}</span>
            </div>

            <div class="stamp">Accepted by Transporter</div>

            <div class="footer">
              Thank you for supporting direct agricultural trade in Tamil Nadu.<br>
              © 2026 farmGo Logistics Technologies Ltd. Gokulakrishnan K, Founder & CEO.
            </div>
          </div>

          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Translations
  const t = {
    title: isTamil ? "சரக்கு தளம்" : "Transporter Control Hub",
    signOut: isTamil ? "வெளியேறு" : "Sign Out",
    subtitle: isTamil ? "கோகுலகிருஷ்ணன் கே. (CEO) க்கான ஸ்டார்ட்அப் நிர்வாகி தளம்" : "Startup administrator portal for Gokulakrishnan K. (CEO)",
    overview: isTamil ? "டாஷ்போர்டு கண்ணோட்டம்" : "Dashboard Overview",
    registeredCarriers: isTamil ? "எனது பதிவுசெய்யப்பட்ட வாகனங்கள்" : "My Registered Carriers",
    nearbyShipments: isTamil ? "அருகிலுள்ள பயிர் சரக்குகள்" : "Nearby Crop Shipments (Tamil Nadu)",
    tripHistory: isTamil ? "பயண வரலாறு" : "Trip History",
    grossIncome: isTamil ? "மொத்த வருமானம்" : "Gross Agro-Income",
    deliveriesMade: isTamil ? "வழங்கப்பட்ட சரக்குகள்" : "Deliveries Made",
    enRoute: isTamil ? "வழியில் இருப்பவை" : "En-Route Now",
    standbyFleet: isTamil ? "தயார் நிலை வாகனங்கள்" : "Standby Fleet",
    fuelIndex: isTamil ? "எரிபொருள் விலை குறியீடு" : "Fuel Station & Price Index",
    estimatedOutlets: isTamil ? "வழியில் உள்ள எரிபொருள் நிலையங்கள்" : "Estimated Fuel Outlets Along Path"
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Floating Glassmorphic Header — matches Landing Page */}
      <header className="mx-auto max-w-7xl w-[92%] sm:w-[95%] mt-4 sticky top-4 z-50 bg-white/80 backdrop-blur-xl border border-white/40 rounded-2xl sm:rounded-full px-6 h-16 flex items-center justify-between shadow-lg shadow-emerald-950/5">
        <div className="flex items-center space-x-3">
          <Link to="/" className="flex items-center no-underline cursor-pointer">
            <span className="text-3xl font-black tracking-tighter">
              <span className="text-emerald-500 font-black">farm</span><span className="text-slate-900 font-black">Go</span>
            </span>
          </Link>
          <span className="bg-blue-50 text-blue-700 text-xs font-black px-3 py-1 rounded-full border border-blue-200/60 hidden sm:inline-flex items-center space-x-1">
            <Truck className="h-3.5 w-3.5" />
            <span>{isTamil ? "போக்குவரத்து தளம்" : "Transporter Hub"}</span>
          </span>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-3">
          <span className="text-sm text-slate-500 hidden lg:inline font-semibold">
            {isTamil ? "விவசாய தளவாட தளம்" : "Agricultural Logistics Platform"}
          </span>
          <div className="h-4 w-px bg-slate-200 hidden lg:inline" />

          {/* Tamil Toggle */}
          <button
            onClick={() => setIsTamil(!isTamil)}
            className="border border-emerald-500 text-emerald-600 font-bold px-3 py-1.5 rounded-xl hover:bg-emerald-50 transition-all text-xs flex items-center space-x-1 cursor-pointer"
          >
            <span>தE</span>
          </button>

          <Link to="/" className="flex items-center space-x-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition-all border border-slate-200 px-3 py-1.5 rounded-xl no-underline">
            <LogOut className="h-4 w-4" />
            <span>{t.signOut}</span>
          </Link>
        </div>
      </header>

      {/* Hero Welcome & Quick Action Bar */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white mt-6 mx-auto max-w-7xl w-[92%] sm:w-[95%] rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        {/* Background glow effect */}
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full border border-emerald-500/30">
                🟢 {isTamil ? "ஆன்லைன் தயாரிப்பில் உள்ளது" : "Transporter Live Portal"}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              {isTamil ? `வணக்கம், ${sessionStorage.getItem("user_name") || "முகமது கரிப் நவாஸ்"} 🚛` : `Welcome Back, ${sessionStorage.getItem("user_name") || "Mohamed Karib Navas"} 🚛`}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 font-medium max-w-xl">
              {isTamil 
                ? "தமிழ்நாட்டின் விவசாயிகளுக்கு வேகமான மற்றும் பாதுகாப்பான சரக்கு போக்குவரத்தை வழங்கவும்."
                : "Manage cargo dispatches, track active transit routes, and onboard new fleet vehicles seamlessly."
              }
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <button
              type="button"
              onClick={() => setShowRegisterVehicleModal(true)}
              className="flex-1 md:flex-initial bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs px-5 py-3.5 rounded-2xl shadow-lg shadow-emerald-950/20 transition-all flex items-center justify-center space-x-2 cursor-pointer border-0"
            >
              <Plus className="h-4 w-4" />
              <span>{isTamil ? "+ புதிய வாகனம் சேர்க்க" : "+ Register Vehicle"}</span>
            </button>
            
            <button
              type="button"
              onClick={() => setActiveTab("nearby")}
              className="flex-1 md:flex-initial bg-white/10 hover:bg-white/20 text-white font-bold text-xs px-5 py-3.5 rounded-2xl border border-white/20 transition-all flex items-center justify-center space-x-2 cursor-pointer"
            >
              <span>⚡ {isTamil ? "சரக்குகள் காண்க" : "View Shipments"} ({requests.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 w-full">
        <div className="flex items-center justify-start overflow-x-auto no-scrollbar gap-2 bg-white p-2 rounded-2xl border border-slate-200/80 shadow-sm">
          <button
            onClick={() => setActiveTab("nearby")}
            className={`px-5 py-3 rounded-xl transition-all font-black text-xs flex items-center space-x-2 cursor-pointer border-0 whitespace-nowrap ${
              activeTab === "nearby"
                ? "bg-emerald-500 text-white shadow-md shadow-emerald-100 scale-[1.02]"
                : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            <span>⚡</span>
            <span>{isTamil ? "அருகிலுள்ள சரக்கு கோரிக்கைகள்" : "Nearby Shipment Requests"}</span>
            {requests.length > 0 && (
              <span className="bg-rose-500 text-white text-[10px] h-5 px-1.5 rounded-full flex items-center justify-center font-black animate-pulse ml-1">
                {requests.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("fleet")}
            className={`px-5 py-3 rounded-xl transition-all font-black text-xs flex items-center space-x-2 cursor-pointer border-0 whitespace-nowrap ${
              activeTab === "fleet"
                ? "bg-emerald-500 text-white shadow-md shadow-emerald-100 scale-[1.02]"
                : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            <span>🚛</span>
            <span>{isTamil ? "எனது வாகனங்கள்" : "Registered Fleet"}</span>
            <span className="bg-slate-100 text-slate-700 text-[10px] h-5 px-1.5 rounded-full flex items-center justify-center font-bold ml-1">
              {fleet.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("overview")}
            className={`px-5 py-3 rounded-xl transition-all font-black text-xs flex items-center space-x-2 cursor-pointer border-0 whitespace-nowrap ${
              activeTab === "overview"
                ? "bg-emerald-500 text-white shadow-md shadow-emerald-100 scale-[1.02]"
                : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            <span>📊</span>
            <span>{isTamil ? "வரைபட கண்ணோட்டம்" : "Route & Fuel Map"}</span>
          </button>

          <button
            onClick={() => setActiveTab("history")}
            className={`px-5 py-3 rounded-xl transition-all font-black text-xs flex items-center space-x-2 cursor-pointer border-0 whitespace-nowrap ${
              activeTab === "history"
                ? "bg-emerald-500 text-white shadow-md shadow-emerald-100 scale-[1.02]"
                : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            <span>📜</span>
            <span>{isTamil ? "பயண வரலாறு" : "Trip History"}</span>
          </button>
        </div>
      </div>

      {/* Dashboard Metrics Block */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 w-full">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[10px] font-black uppercase tracking-wider">{t.grossIncome}</span>
              <span className="text-lg">💵</span>
            </div>
            <p className="text-2xl font-black text-slate-900">₹{grossIncome.toLocaleString()}</p>
            <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
              ✓ {isTamil ? "நேரடி வங்கி பரிமாற்றம்" : "Direct payouts"}
            </span>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[10px] font-black uppercase tracking-wider">{t.deliveriesMade}</span>
              <span className="text-lg">📦</span>
            </div>
            <p className="text-2xl font-black text-slate-900">{deliveriesCount} {isTamil ? "பயணங்கள்" : "Trips"}</p>
            <span className="text-[10px] text-slate-500 font-bold">
              {isTamil ? "பூஜ்ஜிய வீணடிப்பு பதிவு" : "Zero spoilage logs"}
            </span>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[10px] font-black uppercase tracking-wider">{t.enRoute}</span>
              <span className="text-lg">🚚</span>
            </div>
            <p className="text-2xl font-black text-slate-900">{activeCount} {isTamil ? "செயலில்" : "Active"}</p>
            <span className="text-[10px] text-indigo-600 font-bold">
              📡 {isTamil ? "GPS கண்காணிப்பு" : "GPS Live Telemetry"}
            </span>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[10px] font-black uppercase tracking-wider">{t.standbyFleet}</span>
              <span className="text-lg">🚜</span>
            </div>
            <p className="text-2xl font-black text-slate-900">{fleet.length} {isTamil ? "வாகனங்கள்" : "Vehicles"}</p>
            <span className="text-[10px] text-emerald-600 font-bold">
              ✓ {isTamil ? "தயார் நிலையில் உள்ளது" : "Ready for dispatch"}
            </span>
          </div>
        </div>
      </div>

      {/* CONDITIONAL TAB RENDERING */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        
        {/* TAB 1: OVERVIEW */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fadeIn">
            
            {/* Left Columns - Fuel pricing index */}
            <div className="lg:col-span-1">
              <div className="bg-slate-900 border border-slate-800 text-white rounded-3xl p-6 shadow-sm space-y-6">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-sm font-bold tracking-wider flex items-center space-x-1.5">
                    <Fuel className="h-4.5 w-4.5 text-emerald-500" />
                    <span>{t.fuelIndex}</span>
                  </h3>
                  <span className="bg-emerald-500/20 text-emerald-400 text-[9px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider border border-emerald-500/30">
                    Live TN Index
                  </span>
                </div>

                <div className="space-y-4">
                  <div className="bg-slate-950 border border-slate-800/80 p-4 rounded-2xl">
                    <span className="text-[9px] text-slate-400 font-bold uppercase">Petrol (Regular Unlead)</span>
                    <span className="block text-xl font-black text-white mt-1">₹102.63 / L</span>
                    <span className="block text-[9px] text-rose-500 font-semibold mt-1">🪱 -0.12% vs yesterday</span>
                  </div>

                  <div className="bg-slate-950 border border-slate-800/80 p-4 rounded-2xl">
                    <span className="text-[9px] text-slate-400 font-bold uppercase">Diesel (High Speed)</span>
                    <span className="block text-xl font-black text-white mt-1">₹94.24 / L</span>
                    <span className="block text-[9px] text-emerald-500 font-semibold mt-1">📈 +0.05% vs yesterday</span>
                  </div>
                </div>

                <p className="text-[10px] text-slate-400 leading-normal">
                  Direct fuel index rates averages across Tamil Nadu stations. Updated hourly via direct API feed to avoid operational variance.
                </p>
              </div>
            </div>

            {/* Right Columns - Estimated Fuel outlets */}
            <div className="lg:col-span-2">
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
                <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                  <h3 className="text-sm font-black text-slate-900 flex items-center space-x-1.5">
                    <span>⛽</span>
                    <span>{t.estimatedOutlets}</span>
                  </h3>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Route Safe Instruments</span>
                </div>

                <div className="space-y-3">
                  {[
                    { name: "IndianOil Station", loc: "On Highway Bypass", dist: "2 km", wait: "5 min wait" },
                    { name: "Bharat Petroleum", loc: "National Highway Junction", dist: "3 km", wait: "8 min wait" },
                    { name: "HP Station", loc: "West Ring Road Bypass", dist: "4 km", wait: "2 min wait" }
                  ].map((outlet, i) => (
                    <div key={i} className="flex justify-between items-center p-3.5 border border-slate-100 rounded-2xl hover:bg-slate-50 transition-all">
                      <div className="flex items-center space-x-3">
                        <div className="bg-orange-50 text-orange-700 h-9 w-9 rounded-xl flex items-center justify-center font-black text-[10px] uppercase">
                          BP
                        </div>
                        <div>
                          <h4 className="font-extrabold text-slate-900 text-xs">{outlet.name}</h4>
                          <span className="text-[10px] text-slate-400 font-semibold">{outlet.loc}</span>
                        </div>
                      </div>
                      <div className="text-right text-xs">
                        <span className="block font-black text-slate-800">{outlet.dist}</span>
                        <span className="block text-[9px] text-emerald-600 font-bold">{outlet.wait}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Full Width Section: Live Fleet Tracking Map */}
            <div className="lg:col-span-3 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                <h3 className="text-sm font-black text-slate-900 flex items-center space-x-1.5">
                  <span>🗺️</span>
                  <span>{isTamil ? "செயலில் உள்ள வாகன வரைபடம்" : "Live Fleet Tracking Map"}</span>
                </h3>
                <span className="bg-emerald-500/20 text-emerald-700 text-[9px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider border border-emerald-500/30">
                  Active Telemetry & API Enabled
                </span>
              </div>
              <div className="relative h-[380px] rounded-2xl overflow-hidden border border-slate-100">
                <GoogleMapTransporterComponent />
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: REGISTERED FLEET CARRIERS */}
        {activeTab === "fleet" && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-lg font-black text-slate-900">
                  {isTamil ? "பதிவு செய்யப்பட்ட சரக்கு வாகனங்கள்" : "Registered Transport Fleet"}
                </h2>
                <p className="text-xs text-slate-500 font-medium">
                  {isTamil ? "உங்களது செயலில் உள்ள சரக்கு வாகனங்களின் பட்டியல் மற்றும் விவரங்கள்." : "Active carriers ready for agricultural crop dispatch."}
                </p>
              </div>

              <button 
                onClick={() => setShowRegisterVehicleModal(true)}
                className="bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs px-5 py-3 rounded-2xl shadow-md shadow-emerald-100 transition-all flex items-center space-x-2 cursor-pointer border-0"
              >
                <Plus className="h-4 w-4" />
                <span>{isTamil ? "+ புதிய வாகனம் சேர்க்க" : "+ Add New Vehicle"}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {fleet.map((vehicle) => (
                <div key={vehicle.id} className="bg-white border border-slate-200/80 rounded-3xl p-5 hover:shadow-md transition-all flex justify-between items-center group">
                  <div className="flex items-center space-x-4">
                    <div className="h-16 w-16 rounded-2xl overflow-hidden shadow-inner border border-slate-100 bg-slate-100 shrink-0 flex items-center justify-center text-3xl">
                      🚛
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-black text-slate-900 text-sm group-hover:text-emerald-600 transition-colors">{vehicle.name}</h3>
                        <span className="text-[9px] text-emerald-700 font-black uppercase bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                          🟢 {vehicle.status}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 font-semibold flex items-center space-x-2">
                        <span>👨‍✈️ {vehicle.driver}</span>
                        <span className="text-slate-300">•</span>
                        <a href={`tel:${vehicle.mob.replace(/\s+/g, "")}`} className="text-emerald-600 hover:underline font-bold">
                          📞 {vehicle.mob}
                        </a>
                      </div>
                      <div className="text-[10px] text-slate-400 font-extrabold flex space-x-3 pt-0.5">
                        <span>⚖️ {vehicle.limit}</span>
                        <span>•</span>
                        <span className="text-emerald-700 uppercase">{vehicle.storage}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right space-y-1 pl-2 flex flex-col items-end justify-between">
                    <div>
                      <span className="block text-[9px] font-black text-slate-400 uppercase">{isTamil ? "கட்டணம்" : "Fare Rate"}</span>
                      <span className="block font-black text-slate-900 text-base">₹{vehicle.fare.toLocaleString()}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteVehicle(vehicle.id, vehicle.name)}
                      className="bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold p-1.5 rounded-xl text-xs transition-all cursor-pointer border border-rose-200 mt-1"
                      title="Delete Vehicle"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: NEARBY SHIPMENTS */}
        {activeTab === "nearby" && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div>
                <h2 className="text-lg font-black text-slate-900 flex items-center space-x-2">
                  <span>⚡</span>
                  <span>{isTamil ? "அருகிலுள்ள பயிர் சரக்கு கோரிக்கைகள்" : "Pending Nearby Crop Requests"}</span>
                </h2>
                <p className="text-slate-500 text-xs font-medium mt-0.5">
                  {isTamil ? "தமிழ்நாட்டின் விவசாயிகளிடமிருந்து நேரடி லோடு கோரிக்கைகள்." : "Live request alerts from surrounding farms in Tamil Nadu matching your fleet."}
                </p>
              </div>

              <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-black px-3 py-1.5 rounded-xl">
                {requests.length} {isTamil ? "கோரிக்கைகள் தயார்" : "Available Requests"}
              </span>
            </div>

            {requests.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center text-slate-500 font-bold text-sm space-y-3">
                <div className="text-4xl">🌾</div>
                <p>{isTamil ? "தற்போது நிலுவையில் உள்ள கோரிக்கைகள் எதுவும் இல்லை." : "No nearby requests currently pending. New listings will appear live!"}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {requests.map((req) => (
                  <div key={req.id} className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all space-y-4 border-l-4 border-l-emerald-500">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                      <div className="flex items-center space-x-2">
                        <span className="bg-emerald-500 text-white text-xs font-black uppercase tracking-wider px-3 py-1 rounded-xl">
                          🌾 {req.cropName}
                        </span>
                        <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-xl ${req.priority.includes("Immediate") ? "bg-rose-50 text-rose-700 border border-rose-200" : "bg-amber-50 text-amber-700 border border-amber-200"}`}>
                          🔥 {req.priority}
                        </span>
                      </div>

                      <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 px-4 py-1.5 rounded-2xl flex items-center space-x-2">
                        <span className="text-[10px] font-black uppercase text-emerald-700">{isTamil ? "வருமானம்" : "Income"}:</span>
                        <span className="text-lg font-black text-emerald-700">₹{req.income.toLocaleString()}</span>
                      </div>
                    </div>

                    {/* Route Visual Stepper */}
                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                      <div className="flex items-center space-x-3">
                        <div className="bg-emerald-500 text-white h-8 w-8 rounded-xl flex items-center justify-center font-black">
                          📍
                        </div>
                        <div>
                          <span className="block text-[9px] font-black text-slate-400 uppercase">{isTamil ? "எடுக்கும் இடம்" : "Pickup Origin"}</span>
                          <span className="font-black text-slate-900 text-sm">{req.pickup}</span>
                        </div>
                      </div>

                      <div className="hidden sm:flex items-center text-slate-300 font-black text-lg">
                        ➔
                      </div>

                      <div className="flex items-center space-x-3">
                        <div className="bg-red-500 text-white h-8 w-8 rounded-xl flex items-center justify-center font-black">
                          🏁
                        </div>
                        <div>
                          <span className="block text-[9px] font-black text-slate-400 uppercase">{isTamil ? "சந்தை இலக்கு" : "Destination Market"}</span>
                          <span className="font-black text-slate-900 text-sm">{req.destination}</span>
                        </div>
                      </div>
                    </div>

                    {/* Details & Actions Bar */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-1">
                      <div className="text-xs text-slate-600 font-semibold flex flex-wrap gap-x-4 gap-y-1">
                        <span>👨‍🌾 {isTamil ? "விவசாயி" : "Farmer"}: <strong className="text-slate-900">{req.farmer}</strong></span>
                        <span>•</span>
                        <span>⚖️ {isTamil ? "எடை" : "Weight"}: <strong className="text-slate-900">{req.weight}</strong></span>
                        <span>•</span>
                        <span>📦 {isTamil ? "சேமிப்பு" : "Storage"}: <strong className="text-emerald-700">{req.storage}</strong></span>
                      </div>

                      <div className="flex space-x-2 w-full sm:w-auto">
                        <button
                          type="button"
                          onClick={() => handleAcceptRide(req.id)}
                          className="flex-1 sm:flex-initial bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs py-3 px-6 rounded-2xl shadow-md shadow-emerald-100 transition-all cursor-pointer border-0 flex items-center justify-center space-x-1.5"
                        >
                          <span>{isTamil ? "✓ சவாரியை ஏற்றுக்கொள் & மேப் காண் 🗺️" : "✓ Accept & View Route Map 🗺️"}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRejectRide(req.id)}
                          className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs py-3 px-4 rounded-2xl transition-all cursor-pointer border-0"
                        >
                          {isTamil ? "நிராகரி" : "Reject"}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: TRIP HISTORY */}
        {activeTab === "history" && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h2 className="text-lg font-black text-slate-900">
                {isTamil ? "போக்குவரத்து பயண வரலாறு" : "Completed Logistics History"}
              </h2>
              <p className="text-slate-500 text-xs mt-1">
                Verified logs of agricultural cargo voyages completed across Tamil Nadu districts.
              </p>
            </div>

            {/* Sub-summaries */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-emerald-600 text-white rounded-3xl p-6 shadow-sm flex items-center justify-between">
                <div>
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-emerald-200">Total Revenue Earned</span>
                  <span className="block text-2xl font-black mt-2">₹{(45600).toLocaleString()}</span>
                  <span className="block text-[9px] text-emerald-100 font-medium mt-1">All-time dynamic platform billing</span>
                </div>
                <div className="text-3xl text-emerald-400 opacity-60">₹</div>
              </div>

              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex items-center justify-between">
                <div>
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Completed Trips</span>
                  <span className="block text-2xl font-black mt-2">6 Trips</span>
                  <span className="block text-[9px] text-slate-500 font-medium mt-1">Verified completed milestones</span>
                </div>
                <div className="text-3xl text-emerald-500 opacity-60">🏅</div>
              </div>
            </div>

            {/* Trip logs */}
            <div className="space-y-4">
              {history.map((trip) => (
                <div key={trip.id} className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-3.5">
                      <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-md border border-slate-200">
                        {trip.id}
                      </span>
                      <span className="text-xs text-slate-400 font-bold flex items-center space-x-1">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>{trip.date}</span>
                      </span>
                    </div>

                    <div className="space-y-1">
                      <h4 className="font-extrabold text-slate-900 text-sm">
                        📦 CARGO: {trip.cargo} ({trip.weight})
                      </h4>
                      <div className="text-xs text-slate-500 font-semibold flex items-center space-x-1">
                        <MapPin className="h-3.5 w-3.5 text-slate-400" />
                        <span>ROUTE: {trip.route}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-6 w-full md:w-auto border-t md:border-t-0 border-slate-100 pt-3 md:pt-0">
                    <button
                      type="button"
                      onClick={() => downloadReceipt(trip)}
                      className="border border-slate-200 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 font-bold px-3 py-2 rounded-xl text-xs transition-all flex items-center space-x-1.5 cursor-pointer"
                    >
                      <span>📄 {isTamil ? "ரசீது" : "Receipt"}</span>
                    </button>

                    <div className="bg-slate-50 border border-slate-100 px-4 py-2.5 rounded-2xl flex items-center space-x-2 text-xs">
                      <span>👤 DRIVER:</span>
                      <span className="font-bold text-slate-800">{trip.driver}</span>
                    </div>

                    <div className="text-right">
                      <span className="block text-[9px] font-bold text-slate-400 uppercase">Final Payout</span>
                      <span className="block font-black text-emerald-600 text-base">₹{trip.payout.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* TOAST NOTIFICATION BANNER */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-slate-700 text-xs font-black flex items-center space-x-3 animate-fadeIn">
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="text-slate-400 hover:text-white font-bold ml-2">✕</button>
        </div>
      )}

      {/* MODAL 1: LIVE TRIP ROUTE & CONFIRMATION MODAL */}
      {activeTripModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full flex flex-col overflow-hidden max-h-[92vh] animate-fadeIn border border-slate-100">
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-500 to-green-600 px-6 py-4 flex items-center justify-between text-white flex-shrink-0">
              <div>
                <p className="text-[10px] font-black text-emerald-100 uppercase tracking-wider">
                  {isTamil ? "🟢 சவாரி உறுதிப்படுத்தல் & நேரலை மேப்" : "🟢 Confirm Ride & Dispatch Route"}
                </p>
                <h3 className="text-white font-black text-lg">
                  {activeTripModal.cropName} ({activeTripModal.weight})
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveTripModal(null)}
                className="bg-white/20 hover:bg-white/30 text-white font-black w-8 h-8 rounded-xl flex items-center justify-center text-base cursor-pointer border-0 transition-all"
              >
                ✕
              </button>
            </div>

            {/* Route Map Preview */}
            <div className="h-60 sm:h-72 w-full relative flex-shrink-0">
              <GoogleMapTransporterComponent pickup={activeTripModal.pickup} destination={activeTripModal.destination} />
              <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-100 shadow-md text-xs font-black text-slate-800 flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                <span>{activeTripModal.pickup} ➔ {activeTripModal.destination}</span>
              </div>
            </div>

            {/* Details & Driver Assignment Form */}
            <div className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1 bg-white">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs">
                <div>
                  <span className="block text-[9px] font-black text-slate-400 uppercase">{isTamil ? "விவசாயி" : "Farmer"}</span>
                  <span className="font-extrabold text-slate-900">{activeTripModal.farmer}</span>
                </div>
                <div>
                  <span className="block text-[9px] font-black text-slate-400 uppercase">{isTamil ? "பாதுகாப்பு" : "Storage"}</span>
                  <span className="font-extrabold text-emerald-600">{activeTripModal.storage}</span>
                </div>
                <div>
                  <span className="block text-[9px] font-black text-slate-400 uppercase">{isTamil ? "முன்னுரிமை" : "Priority"}</span>
                  <span className="font-extrabold text-amber-600">{activeTripModal.priority}</span>
                </div>
                <div>
                  <span className="block text-[9px] font-black text-slate-400 uppercase">{isTamil ? "வருமானம்" : "Income"}</span>
                  <span className="font-black text-emerald-700 text-sm">₹{activeTripModal.income.toLocaleString()}</span>
                </div>
              </div>

              {/* Select Driver */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                  {isTamil ? "ஒதுக்கப்படும் ஓட்டுநர் & வாகனம்" : "Select Assignee Driver & Vehicle"}
                </label>
                <select
                  value={selectedDriver}
                  onChange={(e) => setSelectedDriver(e.target.value)}
                  className="w-full border border-slate-200 focus:border-emerald-500 rounded-2xl p-3.5 text-xs font-bold text-slate-900 outline-none cursor-pointer bg-white"
                >
                  {fleet.map((v) => (
                    <option key={v.id} value={v.driver}>
                      👨‍✈️ {v.driver} — {v.name} ({v.limit})
                    </option>
                  ))}
                </select>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTripModal(null)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-3.5 rounded-2xl text-xs cursor-pointer border-0"
                >
                  {isTamil ? "ரத்து செய்யு" : "Cancel"}
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDispatch}
                  className="flex-[2] bg-emerald-500 hover:bg-emerald-600 text-white font-black py-3.5 rounded-2xl text-xs transition-all cursor-pointer border-0 shadow-md shadow-emerald-100 flex items-center justify-center space-x-2"
                >
                  <span>{isTamil ? "✓ சவாரியை உறுதிப்படுத்து & புறப்படு 🚚" : "✓ Confirm & Start Dispatch 🚚"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: REGISTER NEW VEHICLE MODAL */}
      {showRegisterVehicleModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-4">
          <form onSubmit={handleRegisterVehicleSubmit} className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-5 shadow-2xl border border-slate-100 max-h-[92vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-black text-emerald-600 uppercase tracking-wider">
                  🚜 {isTamil ? "வாகன பதிவு" : "Carrier Fleet Onboarding"}
                </span>
                <h3 className="text-lg font-black text-slate-900 mt-0.5">
                  {isTamil ? "புதிய வாகனம் பதிவுசெய்யவும்" : "Register New Fleet Vehicle"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowRegisterVehicleModal(false)}
                className="text-slate-400 hover:text-slate-700 font-black text-sm border border-slate-200 px-2.5 py-1 rounded-xl cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs font-semibold text-slate-700">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400">
                  {isTamil ? "வாகனத்தின் பெயர் & மாதிரி" : "Vehicle Name & Model"}
                </label>
                <input
                  type="text"
                  required
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder={isTamil ? "எ.கா. டாடா ஏஸ் மேக்ஸ், போரோ கெய்ன்" : "e.g. Tata Ace Gold / Leyland Dost"}
                  className="w-full border border-slate-200 rounded-xl p-3 outline-none focus:border-emerald-500 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400">
                    {isTamil ? "ஓட்டுநர் பெயர்" : "Driver Name"}
                  </label>
                  <input
                    type="text"
                    required
                    value={regDriver}
                    onChange={(e) => setRegDriver(e.target.value)}
                    placeholder={isTamil ? "எ.கா. முருகன் எஸ்" : "e.g. Murugan S"}
                    className="w-full border border-slate-200 rounded-xl p-3 outline-none focus:border-emerald-500 font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400">
                    {isTamil ? "தொடர்பு எண்" : "Mobile Phone"}
                  </label>
                  <input
                    type="text"
                    value={regMob}
                    onChange={(e) => setRegMob(e.target.value)}
                    placeholder="+91 98400 12345"
                    className="w-full border border-slate-200 rounded-xl p-3 outline-none focus:border-emerald-500 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400">
                    {isTamil ? "அதிகபட்ச அளவு" : "Max Payload Limit"}
                  </label>
                  <select
                    value={regLimit}
                    onChange={(e) => setRegLimit(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl p-3 outline-none focus:border-emerald-500 bg-white font-bold"
                  >
                    <option value="800 kg">800 kg</option>
                    <option value="1.5 Tons">1.5 Tons</option>
                    <option value="3.5 Tons">3.5 Tons</option>
                    <option value="5.5 Tons">5.5 Tons</option>
                    <option value="10+ Tons">10+ Tons</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400">
                    {isTamil ? "சேமிப்பு வகை" : "Preservation Storage"}
                  </label>
                  <select
                    value={regStorage}
                    onChange={(e) => setRegStorage(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl p-3 outline-none focus:border-emerald-500 bg-white font-bold"
                  >
                    <option value="Normal storage">Normal storage</option>
                    <option value="Dry storage">Dry storage</option>
                    <option value="Cold storage">Cold storage (2–8°C)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400">
                  {isTamil ? "அடிப்படை கட்டணம் (₹)" : "Base Fare Tariff (₹)"}
                </label>
                <input
                  type="number"
                  value={regFare}
                  onChange={(e) => setRegFare(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl p-3 outline-none focus:border-emerald-500 font-bold"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-black py-3.5 rounded-2xl text-xs shadow-md cursor-pointer border-0 transition-all mt-2"
            >
              {isTamil ? "✓ வாகனத்தை ஆன்லைனில் சேர்" : "✓ Register Vehicle to Fleet"}
            </button>
          </form>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-white border-t border-slate-100 py-6 text-xs text-slate-400 relative z-10 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <span className="text-xl font-black tracking-tighter">
              <span className="text-emerald-500 font-black">farm</span><span className="text-slate-900 font-black">Go</span>
            </span>
            <span className="text-slate-300">|</span>
            <span className="text-slate-500 font-medium">
              Tamil Nadu Agricultural Logistics Platform
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
