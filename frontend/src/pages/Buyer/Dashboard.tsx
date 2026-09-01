/**
 * Buyer Dashboard
 * ----------------
 * Full-featured buyer portal for FarmGo.
 * 
 * Sections:
 * 1. Active Requirements (procurement needs)
 * 2. Matching Crop Lots (from farmers)
 * 3. Offer Management
 * 4. Market Price Overview
 * 
 * Uses: FarmGo API (/buyer-matching, /crop-lots, /offers)
 */
import { useState, useEffect, useCallback } from "react";
import {
  ShoppingBag, Plus, Search, RefreshCw,
  MapPin, Package, CheckCircle2, Clock, X, LogOut
} from "lucide-react";
import LanguageSwitcher from "../../components/LanguageSwitcher";

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

// Demo buyer matching data (used when no crop lots exist)
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

export default function BuyerDashboard() {
  const [activeTab, setActiveTab] = useState<"find" | "requirements" | "offers">("find");
  const [cropLots, setCropLots] = useState<typeof DEMO_MATCHES>(DEMO_MATCHES);
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(false);
  const [showNewReq, setShowNewReq] = useState(false);
  const [offerModal, setOfferModal] = useState<(typeof DEMO_MATCHES)[0] | null>(null);
  const [filterCrop, setFilterCrop] = useState("Tomato");
  const [filterState, setFilterState] = useState("Maharashtra");

  // New requirement form state
  const [newReq, setNewReq] = useState({
    crop_name: "Tomato",
    quantity_kg_min: "",
    quantity_kg_max: "",
    quality_grade: "A",
    max_price_per_kg: "",
    preferred_state: "Maharashtra",
    preferred_district: "",
  });

  // Offer form
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

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = "/";
  };

  const CROPS = ["Tomato", "Onion", "Potato", "Brinjal", "Carrot", "Mango", "Banana", "Grapes"];
  const STATES = ["Maharashtra", "Tamil Nadu", "Karnataka", "Gujarat", "Punjab"];

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", fontFamily: "'Inter', sans-serif" }}>
      {/* Header */}
      <header style={{
        background: "linear-gradient(135deg, #1e3a5f 0%, #0f4c75 100%)",
        padding: "0 24px",
        height: "64px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{
            width: "36px",
            height: "36px",
            background: "rgba(255,255,255,0.2)",
            borderRadius: "10px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "18px",
          }}>🛒</div>
          <div>
            <div style={{ fontSize: "16px", fontWeight: 800, color: "white" }}>FarmGo</div>
            <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.7)" }}>Buyer Portal</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <LanguageSwitcher compact />
          <button
            onClick={handleLogout}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              background: "rgba(255,255,255,0.1)",
              border: "1px solid rgba(255,255,255,0.2)",
              borderRadius: "10px",
              padding: "7px 14px",
              color: "white",
              cursor: "pointer",
              fontSize: "13px",
            }}
          >
            <LogOut size={14} /> Logout
          </button>
        </div>
      </header>

      {/* Stats bar */}
      <div style={{
        background: "white",
        borderBottom: "1px solid #e5e7eb",
        padding: "12px 24px",
        display: "flex",
        gap: "24px",
        overflowX: "auto",
      }}>
        {[
          { label: "Available Lots", value: cropLots.length, icon: "🌾", color: "#16a34a" },
          { label: "My Requirements", value: requirements.length, icon: "📋", color: "#3b82f6" },
          { label: "Active Offers", value: offers.filter(o => o.status === "pending").length, icon: "📨", color: "#d97706" },
          { label: "Accepted", value: offers.filter(o => o.status === "accepted").length, icon: "✅", color: "#7c3aed" },
        ].map(stat => (
          <div key={stat.label} style={{ display: "flex", alignItems: "center", gap: "10px", flexShrink: 0 }}>
            <span style={{ fontSize: "24px" }}>{stat.icon}</span>
            <div>
              <div style={{ fontSize: "20px", fontWeight: 800, color: stat.color }}>{stat.value}</div>
              <div style={{ fontSize: "11px", color: "#6b7280" }}>{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "24px" }}>
        {/* Tab navigation */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "24px" }}>
          {[
            { id: "find", label: "🌾 Find Crop Lots", },
            { id: "requirements", label: "📋 My Requirements" },
            { id: "offers", label: "📨 My Offers" },
          ].map(tab => (
            <button
              key={tab.id}
              id={`tab-${tab.id}`}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              style={{
                padding: "10px 20px",
                background: activeTab === tab.id ? "#1e3a5f" : "white",
                color: activeTab === tab.id ? "white" : "#4b5563",
                border: activeTab === tab.id ? "none" : "1px solid #e5e7eb",
                borderRadius: "12px",
                fontWeight: 700,
                cursor: "pointer",
                fontSize: "14px",
                transition: "all 0.15s",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* === TAB: Find Crop Lots === */}
        {activeTab === "find" && (
          <div>
            {/* Filters */}
            <div style={{
              background: "white",
              borderRadius: "16px",
              padding: "16px 20px",
              marginBottom: "20px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
              display: "flex",
              gap: "12px",
              flexWrap: "wrap",
              alignItems: "center",
            }}>
              <Search size={16} style={{ color: "#6b7280" }} />
              <select
                id="filter-crop"
                value={filterCrop}
                onChange={e => setFilterCrop(e.target.value)}
                style={{ padding: "8px 12px", borderRadius: "10px", border: "1px solid #e5e7eb", fontSize: "14px", fontWeight: 600 }}
              >
                {CROPS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <select
                id="filter-state"
                value={filterState}
                onChange={e => setFilterState(e.target.value)}
                style={{ padding: "8px 12px", borderRadius: "10px", border: "1px solid #e5e7eb", fontSize: "14px" }}
              >
                {STATES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <button
                id="refresh-lots-btn"
                onClick={loadCropLots}
                style={{
                  padding: "8px 16px",
                  background: "#1e3a5f",
                  color: "white",
                  border: "none",
                  borderRadius: "10px",
                  cursor: "pointer",
                  fontSize: "13px",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <RefreshCw size={14} style={{ animation: loading ? "spin 1s linear infinite" : "none" }} />
                {loading ? "Loading..." : "Search"}
              </button>
              {cropLots.some(l => l.is_demo) && (
                <span style={{
                  background: "#fef9c3",
                  color: "#854d0e",
                  borderRadius: "8px",
                  padding: "4px 12px",
                  fontSize: "12px",
                  fontWeight: 600,
                }}>
                  📊 Showing Demo Data
                </span>
              )}
            </div>

            {/* Crop lot cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "16px" }}>
              {cropLots.map((lot) => (
                <div key={lot.id} style={{
                  background: "white",
                  borderRadius: "16px",
                  padding: "20px",
                  boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
                  border: "1px solid #f3f4f6",
                }}>
                  {lot.is_demo && (
                    <div style={{ float: "right", background: "#fef9c3", color: "#854d0e", borderRadius: "6px", padding: "2px 8px", fontSize: "10px", fontWeight: 700 }}>
                      Demo
                    </div>
                  )}
                  <div style={{ fontSize: "18px", fontWeight: 800, color: "#1f2937", marginBottom: "6px" }}>
                    🌾 {lot.crop_name}
                    <span style={{ marginLeft: "8px", background: "#dcfce7", color: "#166534", borderRadius: "6px", padding: "2px 8px", fontSize: "13px", fontWeight: 700 }}>
                      Grade {lot.quality_grade}
                    </span>
                  </div>
                  <div style={{ fontSize: "13px", color: "#6b7280", marginBottom: "12px" }}>
                    {lot.variety && <span>{lot.variety} · </span>}
                    <MapPin size={12} style={{ display: "inline", verticalAlign: "middle" }} /> {lot.district}, {lot.state}
                  </div>
                  <div style={{ display: "flex", gap: "12px", marginBottom: "16px" }}>
                    <div style={{ background: "#f9fafb", borderRadius: "10px", padding: "10px", flex: 1, textAlign: "center" }}>
                      <div style={{ fontSize: "11px", color: "#6b7280" }}>Quantity</div>
                      <div style={{ fontSize: "18px", fontWeight: 800, color: "#1f2937" }}>{lot.quantity_kg?.toLocaleString()} kg</div>
                    </div>
                    <div style={{ background: "#f0fdf4", borderRadius: "10px", padding: "10px", flex: 1, textAlign: "center" }}>
                      <div style={{ fontSize: "11px", color: "#166534" }}>Asking Price</div>
                      <div style={{ fontSize: "18px", fontWeight: 800, color: "#166534" }}>₹{lot.expected_price_per_kg}/kg</div>
                    </div>
                  </div>
                  {lot.packaging && (
                    <div style={{ fontSize: "12px", color: "#6b7280", marginBottom: "12px" }}>
                      <Package size={12} style={{ display: "inline", marginRight: "4px" }} />
                      Packaging: {lot.packaging}
                    </div>
                  )}
                  <div style={{ fontSize: "12px", color: "#6b7280", marginBottom: "14px" }}>
                    <span style={{ fontWeight: 600 }}>Farmer:</span> {lot.farmer_name || "—"} · Harvest: {lot.harvest_date}
                  </div>
                  <button
                    id={`offer-btn-${lot.id}`}
                    onClick={() => {
                      setOfferModal(lot);
                      setOfferQty(String(lot.quantity_kg));
                      setOfferPrice(String(lot.expected_price_per_kg));
                    }}
                    style={{
                      width: "100%",
                      padding: "12px",
                      background: "linear-gradient(135deg, #1e3a5f 0%, #0f4c75 100%)",
                      color: "white",
                      border: "none",
                      borderRadius: "12px",
                      fontWeight: 700,
                      cursor: "pointer",
                      fontSize: "14px",
                    }}
                  >
                    📨 Make Offer
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* === TAB: Requirements === */}
        {activeTab === "requirements" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h2 style={{ margin: 0, fontSize: "20px", fontWeight: 800, color: "#1f2937" }}>My Procurement Requirements</h2>
              <button
                id="add-requirement-btn"
                onClick={() => setShowNewReq(true)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "10px 20px",
                  background: "#1e3a5f",
                  color: "white",
                  border: "none",
                  borderRadius: "12px",
                  fontWeight: 700,
                  cursor: "pointer",
                  fontSize: "14px",
                }}
              >
                <Plus size={16} /> Add Requirement
              </button>
            </div>

            {/* New requirement form */}
            {showNewReq && (
              <div style={{
                background: "white",
                borderRadius: "16px",
                padding: "24px",
                marginBottom: "20px",
                boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                border: "2px solid #1e3a5f",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                  <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 800 }}>New Procurement Requirement</h3>
                  <button onClick={() => setShowNewReq(false)} style={{ background: "none", border: "none", cursor: "pointer" }}>
                    <X size={18} style={{ color: "#6b7280" }} />
                  </button>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  {[
                    { label: "Crop", key: "crop_name", type: "select", options: CROPS },
                    { label: "Quality Grade", key: "quality_grade", type: "select", options: ["A", "B", "C", "Any"] },
                    { label: "Min Quantity (kg)", key: "quantity_kg_min", type: "number" },
                    { label: "Max Quantity (kg)", key: "quantity_kg_max", type: "number" },
                    { label: "Max Price (₹/kg)", key: "max_price_per_kg", type: "number" },
                    { label: "Preferred State", key: "preferred_state", type: "select", options: STATES },
                  ].map(field => (
                    <div key={field.key}>
                      <label style={{ fontSize: "12px", fontWeight: 600, color: "#374151", display: "block", marginBottom: "4px" }}>
                        {field.label}
                      </label>
                      {field.type === "select" ? (
                        <select
                          value={(newReq as Record<string, string>)[field.key]}
                          onChange={e => setNewReq(r => ({ ...r, [field.key]: e.target.value }))}
                          style={{ width: "100%", padding: "8px 12px", borderRadius: "10px", border: "1px solid #d1d5db", fontSize: "14px" }}
                        >
                          {field.options?.map(o => <option key={o}>{o}</option>)}
                        </select>
                      ) : (
                        <input
                          type={field.type}
                          value={(newReq as Record<string, string>)[field.key]}
                          onChange={e => setNewReq(r => ({ ...r, [field.key]: e.target.value }))}
                          style={{ width: "100%", padding: "8px 12px", borderRadius: "10px", border: "1px solid #d1d5db", fontSize: "14px" }}
                        />
                      )}
                    </div>
                  ))}
                </div>
                <div style={{ display: "flex", gap: "10px", marginTop: "16px" }}>
                  <button
                    onClick={handleCreateRequirement}
                    style={{ padding: "10px 24px", background: "#1e3a5f", color: "white", border: "none", borderRadius: "10px", fontWeight: 700, cursor: "pointer" }}
                  >
                    Save Requirement
                  </button>
                  <button
                    onClick={() => setShowNewReq(false)}
                    style={{ padding: "10px 24px", background: "#f3f4f6", color: "#374151", border: "none", borderRadius: "10px", fontWeight: 600, cursor: "pointer" }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {requirements.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px", color: "#9ca3af" }}>
                <ShoppingBag size={48} style={{ margin: "0 auto 16px", opacity: 0.4 }} />
                <p style={{ fontWeight: 600, fontSize: "16px" }}>No Requirements Yet</p>
                <p style={{ fontSize: "14px" }}>Create requirements to get matched with farmers automatically.</p>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "16px" }}>
                {requirements.map(req => (
                  <div key={req.id} style={{
                    background: "white",
                    borderRadius: "16px",
                    padding: "20px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                  }}>
                    <div style={{ fontSize: "16px", fontWeight: 800, marginBottom: "8px" }}>🌾 {req.crop_name}</div>
                    <div style={{ fontSize: "13px", color: "#6b7280" }}>
                      {req.quantity_kg_min}–{req.quantity_kg_max} kg · Grade {req.quality_grade || "Any"} · ≤₹{req.max_price_per_kg}/kg
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* === TAB: Offers === */}
        {activeTab === "offers" && (
          <div>
            <h2 style={{ margin: "0 0 20px", fontSize: "20px", fontWeight: 800, color: "#1f2937" }}>My Offers</h2>
            {offers.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px", color: "#9ca3af" }}>
                <Clock size={48} style={{ margin: "0 auto 16px", opacity: 0.4 }} />
                <p style={{ fontWeight: 600 }}>No Offers Yet</p>
                <p style={{ fontSize: "14px" }}>Go to "Find Crop Lots" to make your first offer.</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {offers.map(offer => (
                  <div key={offer.id} style={{
                    background: "white",
                    borderRadius: "14px",
                    padding: "16px 20px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}>
                    <div>
                      <div style={{ fontSize: "14px", fontWeight: 700, color: "#1f2937" }}>Offer #{offer.id.slice(-6)}</div>
                      <div style={{ fontSize: "13px", color: "#6b7280" }}>
                        ₹{offer.offered_price_per_kg}/kg · {offer.offered_quantity_kg} kg
                      </div>
                      <div style={{ fontSize: "12px", color: "#9ca3af" }}>{new Date(offer.created_at).toLocaleDateString()}</div>
                    </div>
                    <span style={{
                      background: offer.status === "accepted" ? "#dcfce7" : offer.status === "rejected" ? "#fee2e2" : "#fef9c3",
                      color: offer.status === "accepted" ? "#166534" : offer.status === "rejected" ? "#991b1b" : "#854d0e",
                      borderRadius: "8px",
                      padding: "4px 12px",
                      fontSize: "13px",
                      fontWeight: 700,
                      textTransform: "capitalize",
                    }}>
                      {offer.status === "accepted" && <CheckCircle2 size={12} style={{ display: "inline", marginRight: "4px" }} />}
                      {offer.status}
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
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
          backdropFilter: "blur(4px)",
        }}>
          <div style={{
            background: "white",
            borderRadius: "20px",
            padding: "28px",
            width: "420px",
            maxWidth: "90vw",
            boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h3 style={{ margin: 0, fontSize: "18px", fontWeight: 800 }}>Make an Offer</h3>
              <button onClick={() => setOfferModal(null)} style={{ background: "none", border: "none", cursor: "pointer" }}>
                <X size={20} style={{ color: "#6b7280" }} />
              </button>
            </div>
            <div style={{ background: "#f9fafb", borderRadius: "12px", padding: "14px", marginBottom: "20px", fontSize: "14px" }}>
              <strong>{offerModal.crop_name}</strong> · {offerModal.quantity_kg?.toLocaleString()} kg · Grade {offerModal.quality_grade}
              <br />
              <span style={{ color: "#6b7280" }}>{offerModal.district}, {offerModal.state}</span>
              <br />
              <span style={{ color: "#16a34a", fontWeight: 600 }}>Farmer asking: ₹{offerModal.expected_price_per_kg}/kg</span>
            </div>
            {[
              { label: "Your Offer Price (₹/kg)", value: offerPrice, setter: setOfferPrice, type: "number", id: "offer-price-input" },
              { label: "Quantity (kg)", value: offerQty, setter: setOfferQty, type: "number", id: "offer-qty-input" },
            ].map(field => (
              <div key={field.label} style={{ marginBottom: "14px" }}>
                <label style={{ fontSize: "13px", fontWeight: 600, color: "#374151", display: "block", marginBottom: "4px" }}>
                  {field.label}
                </label>
                <input
                  id={field.id}
                  type={field.type}
                  value={field.value}
                  onChange={e => field.setter(e.target.value)}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid #d1d5db", fontSize: "15px", fontWeight: 600 }}
                />
              </div>
            ))}
            <div style={{ marginBottom: "20px" }}>
              <label style={{ fontSize: "13px", fontWeight: 600, color: "#374151", display: "block", marginBottom: "4px" }}>
                Message (optional)
              </label>
              <textarea
                value={offerMsg}
                onChange={e => setOfferMsg(e.target.value)}
                rows={3}
                placeholder="Any specific requirements..."
                style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid #d1d5db", fontSize: "14px", resize: "vertical" }}
              />
            </div>
            {offerPrice && offerQty && (
              <div style={{ background: "#dcfce7", borderRadius: "10px", padding: "10px 14px", marginBottom: "16px", fontSize: "14px" }}>
                <strong>Total offer: ₹{(Number(offerPrice) * Number(offerQty)).toLocaleString()}</strong>
                <span style={{ color: "#6b7280" }}> for {Number(offerQty).toLocaleString()} kg @ ₹{offerPrice}/kg</span>
              </div>
            )}
            <div style={{ display: "flex", gap: "10px" }}>
              <button
                id="submit-offer-btn"
                onClick={handleMakeOffer}
                disabled={!offerPrice || !offerQty}
                style={{
                  flex: 1,
                  padding: "12px",
                  background: "linear-gradient(135deg, #1e3a5f 0%, #0f4c75 100%)",
                  color: "white",
                  border: "none",
                  borderRadius: "12px",
                  fontWeight: 700,
                  cursor: !offerPrice || !offerQty ? "not-allowed" : "pointer",
                  fontSize: "14px",
                  opacity: !offerPrice || !offerQty ? 0.6 : 1,
                }}
              >
                Send Offer
              </button>
              <button
                onClick={() => setOfferModal(null)}
                style={{
                  padding: "12px 20px",
                  background: "#f3f4f6",
                  color: "#374151",
                  border: "none",
                  borderRadius: "12px",
                  fontWeight: 600,
                  cursor: "pointer",
                  fontSize: "14px",
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
      `}</style>
    </div>
  );
}
