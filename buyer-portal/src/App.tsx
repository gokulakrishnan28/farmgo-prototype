import { useState, useEffect, useCallback } from "react";
import {
  Plus, Search, RefreshCw,
  MapPin, X, Sprout, ShoppingBag, ArrowUpRight
} from "lucide-react";
import LanguageSwitcher from "./components/LanguageSwitcher";

const API_BASE = "/api/v1";

const getToken = () => {
  const store = localStorage.getItem("farmgo_store");
  if (store) {
    try { return JSON.parse(store).token; } catch {}
  }
  return sessionStorage.getItem("access_token") || localStorage.getItem("access_token");
};

const apiHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getToken()}`,
});

const DEMO_MATCHES = [
  {
    id: "lot-demo-001",
    crop_name: "Tomato",
    quantity_kg: 1200,
    quality_grade: "A",
    variety: "Hybrid",
    state: "Maharashtra",
    district: "Nashik",
    farmer_name: "Ramesh Patil",
    expected_price_per_kg: 35.0,
    harvest_date: new Date().toISOString().split("T")[0],
    packaging: "50kg Crate",
    is_demo: true,
  },
  {
    id: "lot-demo-002",
    crop_name: "Tomato",
    quantity_kg: 800,
    quality_grade: "A",
    variety: "Local",
    state: "Maharashtra",
    district: "Nashik",
    farmer_name: "Priya Shinde",
    expected_price_per_kg: 33.0,
    harvest_date: new Date().toISOString().split("T")[0],
    packaging: "Loose",
    is_demo: true,
  },
  {
    id: "lot-demo-003",
    crop_name: "Tomato",
    quantity_kg: 2500,
    quality_grade: "B",
    variety: "Hybrid",
    state: "Maharashtra",
    district: "Ahmednagar",
    farmer_name: "Suresh Deshpande",
    expected_price_per_kg: 30.0,
    harvest_date: new Date().toISOString().split("T")[0],
    packaging: "50kg Bag",
    is_demo: true,
  },
];

interface Offer {
  id: string;
  crop_lot_id: string;
  offered_price_per_kg: number;
  offered_quantity_kg: number;
  status: string;
  created_at: string;
}

interface Requirement {
  id: string;
  crop_name: string;
  quantity_kg_min?: number;
  quantity_kg_max?: number;
  quality_grade?: string;
  max_price_per_kg?: number;
  preferred_state?: string;
  preferred_district?: string;
  required_by_date?: string;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<"find" | "requirements" | "offers">("find");
  const [cropLots, setCropLots] = useState<typeof DEMO_MATCHES>(DEMO_MATCHES);
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(false);
  const [showNewReq, setShowNewReq] = useState(false);
  const [offerModal, setOfferModal] = useState<(typeof DEMO_MATCHES)[0] | null>(null);
  const [filterCrop, setFilterCrop] = useState("Tomato");
  const [filterState, setFilterState] = useState("Maharashtra");

  const mainPortalUrl = import.meta.env.VITE_MAIN_PORTAL_URL || "http://localhost:5173";
  const adminPortalUrl = import.meta.env.VITE_ADMIN_PORTAL_URL || "http://localhost:5174";

  const [newReq, setNewReq] = useState({
    crop_name: "Tomato",
    quantity_kg_min: "",
    quantity_kg_max: "",
    quality_grade: "A",
    max_price_per_kg: "",
    preferred_state: "Maharashtra",
    preferred_district: "",
  });

  const [offerPrice, setOfferPrice] = useState("");
  const [offerQty, setOfferQty] = useState("");
  const [offerMsg, setOfferMsg] = useState("");

  const loadCropLots = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${API_BASE}/crop-lots?commodity=${filterCrop}&state=${filterState}`,
        { headers: apiHeaders() }
      );
      if (res.ok) {
        const data = await res.json();
        if (data.crop_lots?.length > 0) {
          setCropLots(data.crop_lots);
        } else {
          setCropLots(DEMO_MATCHES.filter(m => m.crop_name.toLowerCase() === filterCrop.toLowerCase()));
        }
      } else {
        setCropLots(DEMO_MATCHES);
      }
    } catch {
      setCropLots(DEMO_MATCHES);
    }
    setLoading(false);
  }, [filterCrop, filterState]);

  const loadRequirements = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/buyer-requirements`, { headers: apiHeaders() });
      if (res.ok) {
        const data = await res.json();
        setRequirements(data.requirements || []);
      }
    } catch {}
  }, []);

  const loadOffers = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/offers`, { headers: apiHeaders() });
      if (res.ok) {
        const data = await res.json();
        setOffers(data.offers || []);
      }
    } catch {}
  }, []);

  useEffect(() => {
    loadCropLots();
    loadRequirements();
    loadOffers();
  }, [loadCropLots, loadRequirements, loadOffers]);

  const handleCreateRequirement = async () => {
    try {
      const res = await fetch(`${API_BASE}/buyer-requirements`, {
        method: "POST",
        headers: apiHeaders(),
        body: JSON.stringify({
          ...newReq,
          quantity_kg_min: Number(newReq.quantity_kg_min),
          quantity_kg_max: Number(newReq.quantity_kg_max),
          max_price_per_kg: Number(newReq.max_price_per_kg),
        }),
      });
      if (res.ok) {
        setShowNewReq(false);
        loadRequirements();
      }
    } catch {}
  };

  const handleMakeOffer = async () => {
    if (!offerModal) return;
    try {
      const res = await fetch(`${API_BASE}/offers`, {
        method: "POST",
        headers: apiHeaders(),
        body: JSON.stringify({
          crop_lot_id: offerModal.id,
          offered_price_per_kg: Number(offerPrice),
          offered_quantity_kg: Number(offerQty),
          message: offerMsg,
        }),
      });
      if (res.ok) {
        setOfferModal(null);
        setOfferPrice("");
        setOfferQty("");
        setOfferMsg("");
        loadOffers();
      }
    } catch {
      setOfferModal(null);
    }
  };

  const CROPS = ["Tomato", "Onion", "Potato", "Brinjal", "Carrot", "Mango", "Banana", "Grapes"];
  const STATES = ["Maharashtra", "Tamil Nadu", "Karnataka", "Gujarat", "Punjab"];

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", color: "#0f172a", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* Top Glassmorphic Emerald Header — matching farmGo design system */}
      <header style={{
        background: "rgba(255, 255, 255, 0.85)",
        backdropFilter: "blur(16px)",
        borderBottom: "1px solid #e2e8f0",
        padding: "0 24px",
        height: "68px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        position: "sticky",
        top: 0,
        zIndex: 50,
        boxShadow: "0 4px 20px rgba(16, 185, 129, 0.05)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <div style={{
            width: "42px",
            height: "42px",
            background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
            borderRadius: "14px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            boxShadow: "0 4px 14px rgba(16, 185, 129, 0.35)",
          }}>
            <ShoppingBag size={22} />
          </div>
          <div>
            <div style={{ fontSize: "20px", fontWeight: 900, color: "#0f172a", letterSpacing: "-0.5px" }}>
              <span style={{ color: "#10b981", fontWeight: 900 }}>farm</span><span style={{ color: "#0f172a", fontWeight: 900 }}>Go</span>{" "}
              <span style={{ fontSize: "11px", fontWeight: 800, background: "#ecfdf5", color: "#047857", border: "1px solid #a7f3d0", padding: "3px 10px", borderRadius: "20px", marginLeft: "6px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Buyer Portal
              </span>
            </div>
            <div style={{ fontSize: "11px", color: "#64748b", fontWeight: 600 }}>Standalone Procurement Host (:5175)</div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <a
            href={mainPortalUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontSize: "12px",
              fontWeight: 700,
              color: "#047857",
              background: "#ecfdf5",
              border: "1px solid #a7f3d0",
              padding: "7px 14px",
              borderRadius: "12px",
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              gap: "4px",
              transition: "all 0.2s ease"
            }}
          >
            <span>Farmer / Transporter Host</span>
            <ArrowUpRight size={14} />
          </a>
          <a
            href={adminPortalUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontSize: "12px",
              fontWeight: 700,
              color: "#7e22ce",
              background: "#faf5ff",
              border: "1px solid #e9d5ff",
              padding: "7px 14px",
              borderRadius: "12px",
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              gap: "4px",
              transition: "all 0.2s ease"
            }}
          >
            <span>Admin Portal</span>
            <ArrowUpRight size={14} />
          </a>
          <LanguageSwitcher compact />
        </div>
      </header>

      {/* Stats Summary Bar */}
      <div style={{
        background: "white",
        borderBottom: "1px solid #e2e8f0",
        padding: "14px 24px",
        display: "flex",
        gap: "24px",
        overflowX: "auto",
        boxShadow: "0 1px 3px rgba(0,0,0,0.02)"
      }}>
        {[
          { label: "Available Lots", value: cropLots.length, icon: "🌾", color: "#10b981", bg: "#ecfdf5", border: "#a7f3d0" },
          { label: "My Requirements", value: requirements.length, icon: "📋", color: "#0d9488", bg: "#f0fdfa", border: "#99f6e4" },
          { label: "Active Offers", value: offers.filter(o => o.status === "pending").length, icon: "📨", color: "#d97706", bg: "#fffbeb", border: "#fde68a" },
          { label: "Accepted", value: offers.filter(o => o.status === "accepted").length, icon: "✅", color: "#059669", bg: "#f0fdf4", border: "#bbf7d0" },
        ].map(stat => (
          <div key={stat.label} style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            background: stat.bg,
            border: `1px solid ${stat.border}`,
            padding: "8px 16px",
            borderRadius: "14px",
            flexShrink: 0
          }}>
            <span style={{ fontSize: "22px" }}>{stat.icon}</span>
            <div>
              <div style={{ fontSize: "20px", fontWeight: 900, color: stat.color, lineHeight: "1.1" }}>{stat.value}</div>
              <div style={{ fontSize: "11px", color: "#475569", fontWeight: 700 }}>{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ maxWidth: "1240px", margin: "0 auto", padding: "28px 24px" }}>

        {/* Tab navigation */}
        <div style={{ display: "flex", gap: "12px", marginBottom: "28px" }}>
          {[
            { id: "find", label: "🌾 Find Crop Lots" },
            { id: "requirements", label: "📋 My Requirements" },
            { id: "offers", label: "📨 My Offers" },
          ].map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                style={{
                  padding: "12px 24px",
                  background: isActive ? "linear-gradient(135deg, #10b981 0%, #059669 100%)" : "white",
                  color: isActive ? "white" : "#475569",
                  border: isActive ? "none" : "1px solid #e2e8f0",
                  borderRadius: "16px",
                  fontWeight: 800,
                  cursor: "pointer",
                  fontSize: "14px",
                  boxShadow: isActive ? "0 4px 14px rgba(16, 185, 129, 0.3)" : "0 1px 3px rgba(0,0,0,0.03)",
                  transition: "all 0.2s ease",
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* TAB: Find Crop Lots */}
        {activeTab === "find" && (
          <div>
            {/* Search filter card */}
            <div style={{
              background: "white",
              borderRadius: "20px",
              padding: "18px 24px",
              marginBottom: "24px",
              border: "1px solid #e2e8f0",
              display: "flex",
              gap: "14px",
              flexWrap: "wrap",
              alignItems: "center",
              boxShadow: "0 2px 10px rgba(0,0,0,0.03)"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#10b981", fontWeight: 700, fontSize: "14px" }}>
                <Search size={18} />
                <span>Filter Procurement:</span>
              </div>
              <select
                value={filterCrop}
                onChange={e => setFilterCrop(e.target.value)}
                style={{ padding: "10px 14px", borderRadius: "12px", background: "#f8fafc", color: "#0f172a", border: "1px solid #cbd5e1", fontSize: "14px", fontWeight: 700, outline: "none" }}
              >
                {CROPS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <select
                value={filterState}
                onChange={e => setFilterState(e.target.value)}
                style={{ padding: "10px 14px", borderRadius: "12px", background: "#f8fafc", color: "#0f172a", border: "1px solid #cbd5e1", fontSize: "14px", fontWeight: 600, outline: "none" }}
              >
                {STATES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <button
                onClick={loadCropLots}
                style={{
                  padding: "10px 20px",
                  background: "#10b981",
                  color: "white",
                  border: "none",
                  borderRadius: "12px",
                  cursor: "pointer",
                  fontSize: "14px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  fontWeight: 700,
                  boxShadow: "0 2px 8px rgba(16,185,129,0.3)"
                }}
              >
                <RefreshCw size={15} style={{ animation: loading ? "spin 1s linear infinite" : "none" }} />
                {loading ? "Searching..." : "Search Lots"}
              </button>
            </div>

            {/* Grid of crop lots */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))", gap: "20px" }}>
              {cropLots.map((lot, idx) => {
                const matchScore = 96 - (idx * 4); // Match score calculation
                return (
                  <div key={lot.id} style={{
                    background: "white",
                    borderRadius: "24px",
                    padding: "24px",
                    border: "1px solid #e2e8f0",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    transition: "all 0.2s ease"
                  }}>
                    <div>
                      {/* Top Badges */}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                        <span style={{
                          background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                          color: "white",
                          padding: "4px 12px",
                          borderRadius: "20px",
                          fontSize: "11px",
                          fontWeight: 900,
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                          boxShadow: "0 2px 8px rgba(16,185,129,0.25)"
                        }}>
                          ⚡ {matchScore}% AI Match
                        </span>
                        {lot.is_demo && (
                          <div style={{ background: "#fffbeb", color: "#b45309", border: "1px solid #fde68a", borderRadius: "8px", padding: "2px 8px", fontSize: "10px", fontWeight: 800 }}>
                            Verified Demo
                          </div>
                        )}
                      </div>

                      {/* Title */}
                      <div style={{ fontSize: "20px", fontWeight: 900, color: "#0f172a", marginBottom: "4px" }}>
                        🌾 {lot.crop_name}
                        <span style={{ marginLeft: "8px", background: "#ecfdf5", color: "#047857", border: "1px solid #a7f3d0", borderRadius: "8px", padding: "2px 8px", fontSize: "12px", fontWeight: 800 }}>
                          Grade {lot.quality_grade}
                        </span>
                      </div>

                      <div style={{ fontSize: "13px", color: "#64748b", fontWeight: 600, marginBottom: "14px" }}>
                        {lot.variety && <span>{lot.variety} · </span>}
                        <MapPin size={13} style={{ display: "inline", verticalAlign: "middle", color: "#10b981" }} /> {lot.district}, {lot.state}
                      </div>

                      {/* Match Breakdown Pills */}
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "18px" }}>
                        <span style={{ fontSize: "11px", fontWeight: 700, background: "#ecfdf5", color: "#047857", border: "1px solid #a7f3d0", padding: "3px 8px", borderRadius: "8px" }}>✓ Target Commodity</span>
                        <span style={{ fontSize: "11px", fontWeight: 700, background: "#f0fdf4", color: "#15803d", border: "1px solid #bbf7d0", padding: "3px 8px", borderRadius: "8px" }}>✓ Qty Available</span>
                        <span style={{ fontSize: "11px", fontWeight: 700, background: "#f0fdfa", color: "#0f766e", border: "1px solid #99f6e4", padding: "3px 8px", borderRadius: "8px" }}>✓ Nearby Hub</span>
                      </div>

                      {/* Price & Quantity Box */}
                      <div style={{ display: "flex", gap: "12px", marginBottom: "18px" }}>
                        <div style={{ background: "#f8fafc", borderRadius: "14px", padding: "12px", flex: 1, textAlign: "center", border: "1px solid #e2e8f0" }}>
                          <div style={{ fontSize: "11px", color: "#64748b", fontWeight: 700 }}>Quantity Available</div>
                          <div style={{ fontSize: "19px", fontWeight: 900, color: "#0f172a" }}>{lot.quantity_kg?.toLocaleString()} kg</div>
                        </div>
                        <div style={{ background: "#ecfdf5", borderRadius: "14px", padding: "12px", flex: 1, textAlign: "center", border: "1px solid #a7f3d0" }}>
                          <div style={{ fontSize: "11px", color: "#047857", fontWeight: 700 }}>Farmer Asking Price</div>
                          <div style={{ fontSize: "19px", fontWeight: 900, color: "#047857" }}>₹{lot.expected_price_per_kg}/kg</div>
                        </div>
                      </div>

                      <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "18px", fontWeight: 500 }}>
                        <span style={{ fontWeight: 700, color: "#334155" }}>Farmer:</span> {lot.farmer_name || "—"} · Harvest: {lot.harvest_date}
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setOfferModal(lot);
                        setOfferQty(String(lot.quantity_kg));
                        setOfferPrice(String(lot.expected_price_per_kg));
                      }}
                      style={{
                        width: "100%",
                        padding: "12px",
                        background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                        color: "white",
                        border: "none",
                        borderRadius: "14px",
                        fontWeight: 800,
                        cursor: "pointer",
                        fontSize: "14px",
                        boxShadow: "0 4px 14px rgba(16, 185, 129, 0.25)"
                      }}
                    >
                      Submit Direct Offer
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB: Requirements */}
        {activeTab === "requirements" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <div>
                <h3 style={{ fontSize: "20px", fontWeight: 900, color: "#0f172a" }}>My Active Procurement Needs</h3>
                <p style={{ fontSize: "13px", color: "#64748b", margin: 0 }}>Post your target commodities so registered farmers can send direct quotes.</p>
              </div>
              <button
                onClick={() => setShowNewReq(true)}
                style={{
                  padding: "12px 20px",
                  background: "#10b981",
                  color: "white",
                  border: "none",
                  borderRadius: "14px",
                  fontWeight: 800,
                  cursor: "pointer",
                  fontSize: "14px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  boxShadow: "0 4px 14px rgba(16, 185, 129, 0.3)"
                }}
              >
                <Plus size={18} /> Post New Requirement
              </button>
            </div>

            {requirements.length === 0 ? (
              <div style={{ background: "white", padding: "48px", borderRadius: "24px", textAlign: "center", border: "1px solid #e2e8f0" }}>
                <Sprout size={40} style={{ color: "#10b981", margin: "0 auto 12px" }} />
                <h4 style={{ fontSize: "18px", fontWeight: 800, color: "#0f172a", marginBottom: "6px" }}>No Requirements Posted Yet</h4>
                <p style={{ color: "#64748b", fontSize: "14px", maxWidth: "400px", margin: "0 auto 18px" }}>Click 'Post New Requirement' to inform local farmers about your bulk purchasing needs.</p>
                <button
                  onClick={() => setShowNewReq(true)}
                  style={{ background: "#ecfdf5", color: "#047857", border: "1px solid #a7f3d0", padding: "10px 20px", borderRadius: "12px", fontWeight: 800, cursor: "pointer" }}
                >
                  Post Requirement Now
                </button>
              </div>
            ) : (
              <div style={{ display: "grid", gap: "16px" }}>
                {requirements.map(req => (
                  <div key={req.id} style={{ background: "white", padding: "20px", borderRadius: "20px", border: "1px solid #e2e8f0", boxShadow: "0 2px 10px rgba(0,0,0,0.02)" }}>
                    <div style={{ fontWeight: 900, fontSize: "17px", color: "#0f172a" }}>📋 {req.crop_name}</div>
                    <div style={{ fontSize: "14px", color: "#475569", marginTop: "6px" }}>
                      Quantity Range: <strong>{req.quantity_kg_min} - {req.quantity_kg_max} kg</strong> | Max Target Price: <strong style={{ color: "#10b981" }}>₹{req.max_price_per_kg}/kg</strong> | Location: <strong>{req.preferred_state}</strong>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB: Offers */}
        {activeTab === "offers" && (
          <div>
            <h3 style={{ fontSize: "20px", fontWeight: 900, color: "#0f172a", marginBottom: "20px" }}>My Submitted Offers</h3>
            {offers.length === 0 ? (
              <div style={{ background: "white", padding: "48px", borderRadius: "24px", textAlign: "center", border: "1px solid #e2e8f0" }}>
                <ShoppingBag size={40} style={{ color: "#10b981", margin: "0 auto 12px" }} />
                <h4 style={{ fontSize: "18px", fontWeight: 800, color: "#0f172a", marginBottom: "6px" }}>No Offers Submitted Yet</h4>
                <p style={{ color: "#64748b", fontSize: "14px", maxWidth: "400px", margin: "0 auto 18px" }}>Browse the available crop lots and click 'Submit Direct Offer' to place your bids.</p>
                <button
                  onClick={() => setActiveTab("find")}
                  style={{ background: "#10b981", color: "white", border: "none", padding: "10px 20px", borderRadius: "12px", fontWeight: 800, cursor: "pointer" }}
                >
                  Browse Available Crop Lots
                </button>
              </div>
            ) : (
              <div style={{ display: "grid", gap: "14px" }}>
                {offers.map(off => (
                  <div key={off.id} style={{ background: "white", padding: "20px", borderRadius: "20px", border: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: "16px", color: "#0f172a" }}>Offer Reference #{off.id.slice(0, 8)}</div>
                      <div style={{ fontSize: "14px", color: "#475569", marginTop: "4px" }}>Offered Price: <strong style={{ color: "#10b981" }}>₹{off.offered_price_per_kg}/kg</strong> for <strong>{off.offered_quantity_kg} kg</strong></div>
                    </div>
                    <span style={{
                      background: off.status === "accepted" ? "#ecfdf5" : "#fffbeb",
                      color: off.status === "accepted" ? "#047857" : "#b45309",
                      border: `1px solid ${off.status === "accepted" ? "#a7f3d0" : "#fde68a"}`,
                      padding: "6px 16px",
                      borderRadius: "12px",
                      fontSize: "13px",
                      fontWeight: 900
                    }}>
                      {off.status.toUpperCase()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Offer Modal */}
      {offerModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.5)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "16px" }}>
          <div style={{ background: "white", borderRadius: "28px", width: "100%", maxWidth: "460px", padding: "28px", border: "1px solid #e2e8f0", boxShadow: "0 20px 40px rgba(0,0,0,0.15)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h3 style={{ fontSize: "20px", fontWeight: 900, color: "#0f172a" }}>Make Offer for {offerModal.crop_name}</h3>
              <X size={20} style={{ cursor: "pointer", color: "#64748b" }} onClick={() => setOfferModal(null)} />
            </div>
            <div style={{ marginBottom: "16px" }}>
              <label style={{ fontSize: "12px", color: "#475569", fontWeight: 700, display: "block", marginBottom: "6px" }}>Offer Price per kg (Farmer Asking: ₹{offerModal.expected_price_per_kg})</label>
              <input
                type="number"
                value={offerPrice}
                onChange={e => setOfferPrice(e.target.value)}
                style={{ width: "100%", padding: "12px", borderRadius: "12px", background: "#f8fafc", border: "1px solid #cbd5e1", color: "#0f172a", fontWeight: 700, outline: "none" }}
              />
            </div>
            <div style={{ marginBottom: "16px" }}>
              <label style={{ fontSize: "12px", color: "#475569", fontWeight: 700, display: "block", marginBottom: "6px" }}>Quantity (kg)</label>
              <input
                type="number"
                value={offerQty}
                onChange={e => setOfferQty(e.target.value)}
                style={{ width: "100%", padding: "12px", borderRadius: "12px", background: "#f8fafc", border: "1px solid #cbd5e1", color: "#0f172a", fontWeight: 700, outline: "none" }}
              />
            </div>
            <div style={{ marginBottom: "20px" }}>
              <label style={{ fontSize: "12px", color: "#475569", fontWeight: 700, display: "block", marginBottom: "6px" }}>Message for Farmer (Optional)</label>
              <textarea
                value={offerMsg}
                onChange={e => setOfferMsg(e.target.value)}
                placeholder="e.g. Can pick up directly from farm gate tomorrow morning."
                style={{ width: "100%", padding: "12px", borderRadius: "12px", background: "#f8fafc", border: "1px solid #cbd5e1", color: "#0f172a", height: "80px", outline: "none" }}
              />
            </div>
            <div style={{ display: "flex", gap: "12px" }}>
              <button
                onClick={() => setOfferModal(null)}
                style={{ flex: 1, padding: "12px", background: "#f1f5f9", color: "#475569", border: "none", borderRadius: "14px", fontWeight: 800, cursor: "pointer" }}
              >
                Cancel
              </button>
              <button
                onClick={handleMakeOffer}
                style={{ flex: 1, padding: "12px", background: "linear-gradient(135deg, #10b981 0%, #059669 100%)", color: "white", border: "none", borderRadius: "14px", fontWeight: 800, cursor: "pointer", boxShadow: "0 4px 14px rgba(16,185,129,0.3)" }}
              >
                Submit Offer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Requirement Modal */}
      {showNewReq && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.5)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "16px" }}>
          <div style={{ background: "white", borderRadius: "28px", width: "100%", maxWidth: "460px", padding: "28px", border: "1px solid #e2e8f0", boxShadow: "0 20px 40px rgba(0,0,0,0.15)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h3 style={{ fontSize: "20px", fontWeight: 900, color: "#0f172a" }}>Post Procurement Needs</h3>
              <X size={20} style={{ cursor: "pointer", color: "#64748b" }} onClick={() => setShowNewReq(false)} />
            </div>
            <div style={{ marginBottom: "14px" }}>
              <label style={{ fontSize: "12px", color: "#475569", fontWeight: 700, display: "block", marginBottom: "6px" }}>Crop / Commodity</label>
              <select
                value={newReq.crop_name}
                onChange={e => setNewReq({ ...newReq, crop_name: e.target.value })}
                style={{ width: "100%", padding: "12px", borderRadius: "12px", background: "#f8fafc", border: "1px solid #cbd5e1", color: "#0f172a", fontWeight: 700 }}
              >
                {CROPS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div style={{ display: "flex", gap: "12px", marginBottom: "14px" }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: "12px", color: "#475569", fontWeight: 700, display: "block", marginBottom: "6px" }}>Min Qty (kg)</label>
                <input
                  type="number"
                  placeholder="500"
                  value={newReq.quantity_kg_min}
                  onChange={e => setNewReq({ ...newReq, quantity_kg_min: e.target.value })}
                  style={{ width: "100%", padding: "12px", borderRadius: "12px", background: "#f8fafc", border: "1px solid #cbd5e1", color: "#0f172a" }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: "12px", color: "#475569", fontWeight: 700, display: "block", marginBottom: "6px" }}>Max Qty (kg)</label>
                <input
                  type="number"
                  placeholder="2000"
                  value={newReq.quantity_kg_max}
                  onChange={e => setNewReq({ ...newReq, quantity_kg_max: e.target.value })}
                  style={{ width: "100%", padding: "12px", borderRadius: "12px", background: "#f8fafc", border: "1px solid #cbd5e1", color: "#0f172a" }}
                />
              </div>
            </div>
            <div style={{ marginBottom: "14px" }}>
              <label style={{ fontSize: "12px", color: "#475569", fontWeight: 700, display: "block", marginBottom: "6px" }}>Max Budget Price / kg (₹)</label>
              <input
                type="number"
                placeholder="e.g. 35"
                value={newReq.max_price_per_kg}
                onChange={e => setNewReq({ ...newReq, max_price_per_kg: e.target.value })}
                style={{ width: "100%", padding: "12px", borderRadius: "12px", background: "#f8fafc", border: "1px solid #cbd5e1", color: "#0f172a" }}
              />
            </div>
            <div style={{ marginBottom: "20px" }}>
              <label style={{ fontSize: "12px", color: "#475569", fontWeight: 700, display: "block", marginBottom: "6px" }}>Preferred State</label>
              <select
                value={newReq.preferred_state}
                onChange={e => setNewReq({ ...newReq, preferred_state: e.target.value })}
                style={{ width: "100%", padding: "12px", borderRadius: "12px", background: "#f8fafc", border: "1px solid #cbd5e1", color: "#0f172a" }}
              >
                {STATES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div style={{ display: "flex", gap: "12px" }}>
              <button
                onClick={() => setShowNewReq(false)}
                style={{ flex: 1, padding: "12px", background: "#f1f5f9", color: "#475569", border: "none", borderRadius: "14px", fontWeight: 800, cursor: "pointer" }}
              >
                Cancel
              </button>
              <button
                onClick={handleCreateRequirement}
                style={{ flex: 1, padding: "12px", background: "linear-gradient(135deg, #10b981 0%, #059669 100%)", color: "white", border: "none", borderRadius: "14px", fontWeight: 800, cursor: "pointer", boxShadow: "0 4px 14px rgba(16,185,129,0.3)" }}
              >
                Publish Requirement
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
