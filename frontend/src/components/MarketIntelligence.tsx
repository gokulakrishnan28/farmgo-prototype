/**
 * MarketIntelligence
 * -------------------
 * Displays a comparison table of markets for a selected commodity.
 * Shows: Market, Distance, Min/Modal/Max Price, Transport Cost, Net Return
 * Sortable by: price, net return, distance, transport cost
 * 
 * Always shows data source and last update time.
 * Never mixes units silently: all prices shown in ₹/kg with ₹/quintal note.
 */
import { useState } from "react";
import { ArrowUpDown, MapPin, Truck, TrendingUp, Info, RefreshCw } from "lucide-react";
// MarketIntelligence

export interface MarketData {
  market_id: string;
  market_name: string;
  state: string;
  district: string;
  market_type?: string;
  min_price?: number;           // ₹/quintal
  modal_price?: number;          // ₹/quintal
  max_price?: number;            // ₹/quintal
  min_price_per_kg?: number;     // ₹/kg
  modal_price_per_kg?: number;   // ₹/kg
  max_price_per_kg?: number;     // ₹/kg
  arrival_quantity_tonnes?: number;
  distance_km?: number;
  transport_estimate?: {
    total_transport_cost: number;
    cost_per_kg: number;
    recommended_vehicle: string;
  };
  estimated_net_return?: number;
  price_date?: string;
  source?: string;
  is_demo?: boolean;
}

type SortKey = "modal_price" | "net_return" | "distance" | "transport";
type SortDir = "asc" | "desc";

interface MarketIntelligenceProps {
  markets: MarketData[];
  commodity: string;
  quantity_kg: number;
  loading?: boolean;
  onRefresh?: () => void;
  onSelectMarket?: (market: MarketData) => void;
  lastUpdated?: string;
}

export default function MarketIntelligence({
  markets,
  commodity,
  quantity_kg,
  loading = false,
  onRefresh,
  onSelectMarket,
  lastUpdated,
}: MarketIntelligenceProps) {
  const [sortKey, setSortKey] = useState<SortKey>("net_return");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const hasDemo = markets.some(m => m.is_demo);
  const dataSource = hasDemo ? "Demo Data (SIH Presentation)" : markets[0]?.source || "Government OGD / AGMARKNET";
  const priceDate = lastUpdated || markets[0]?.price_date || "Today";

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(d => d === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  const sorted = [...markets].sort((a, b) => {
    let aVal = 0, bVal = 0;
    if (sortKey === "modal_price") {
      aVal = a.modal_price_per_kg || a.modal_price || 0;
      bVal = b.modal_price_per_kg || b.modal_price || 0;
    } else if (sortKey === "net_return") {
      aVal = a.estimated_net_return || 0;
      bVal = b.estimated_net_return || 0;
    } else if (sortKey === "distance") {
      aVal = a.distance_km || 999;
      bVal = b.distance_km || 999;
      // Distance sorts ascending by default
      return sortDir === "asc" ? aVal - bVal : bVal - aVal;
    } else if (sortKey === "transport") {
      aVal = a.transport_estimate?.total_transport_cost || 0;
      bVal = b.transport_estimate?.total_transport_cost || 0;
    }
    return sortDir === "asc" ? aVal - bVal : bVal - aVal;
  });

  const SortButton = ({ label, sKey }: { label: string; sKey: SortKey }) => (
    <button
      onClick={() => handleSort(sKey)}
      style={{
        background: sortKey === sKey ? "#dcfce7" : "#f3f4f6",
        color: sortKey === sKey ? "#166534" : "#6b7280",
        border: "none",
        borderRadius: "8px",
        padding: "5px 10px",
        fontSize: "12px",
        fontWeight: sortKey === sKey ? 700 : 500,
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        gap: "4px",
        transition: "all 0.15s",
      }}
    >
      <ArrowUpDown size={11} />
      {label}
    </button>
  );

  return (
    <div style={{ background: "white", borderRadius: "20px", overflow: "hidden", boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}>
      {/* Header */}
      <div style={{
        background: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)",
        padding: "18px 20px 14px",
        borderBottom: "1px solid #d1fae5",
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
          <div>
            <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 800, color: "#166534" }}>
              🏪 Market Prices — {commodity}
            </h3>
            <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#4b5563" }}>
              {quantity_kg} kg · Comparing {markets.length} markets
            </p>
          </div>
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={loading}
              style={{
                background: "white",
                border: "1px solid #d1d5db",
                borderRadius: "10px",
                padding: "7px 10px",
                cursor: "pointer",
                color: "#4b5563",
              }}
            >
              <RefreshCw size={14} style={{ animation: loading ? "spin 1s linear infinite" : "none" }} />
            </button>
          )}
        </div>

        {/* Sort buttons */}
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
          <span style={{ fontSize: "11px", color: "#6b7280", display: "flex", alignItems: "center", marginRight: "4px" }}>
            Sort by:
          </span>
          <SortButton label="Net Return" sKey="net_return" />
          <SortButton label="Highest Price" sKey="modal_price" />
          <SortButton label="Nearest" sKey="distance" />
          <SortButton label="Transport" sKey="transport" />
        </div>
      </div>

      {/* Data provenance */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "8px 20px",
        background: hasDemo ? "#fef9c3" : "#f9fafb",
        borderBottom: "1px solid #f3f4f6",
        fontSize: "11px",
        color: hasDemo ? "#854d0e" : "#6b7280",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <Info size={11} />
          <span>
            <strong>Source:</strong> {dataSource}
            {hasDemo && " — NOT live government data"}
          </span>
        </div>
        <span><strong>Updated:</strong> {priceDate} · 1 quintal = 100 kg</span>
      </div>

      {/* Loading state */}
      {loading && (
        <div style={{ padding: "40px", textAlign: "center", color: "#6b7280" }}>
          <RefreshCw size={24} style={{ margin: "0 auto 10px", animation: "spin 1s linear infinite" }} />
          <p>Loading market prices...</p>
        </div>
      )}

      {/* Market list */}
      {!loading && (
        <div>
          {sorted.length === 0 && (
            <div style={{ padding: "40px", textAlign: "center", color: "#9ca3af" }}>
              <TrendingUp size={32} style={{ margin: "0 auto 12px", opacity: 0.4 }} />
              <p>No market data available. Enable Demo Mode or import OGD data.</p>
            </div>
          )}
          {sorted.map((market, index) => {
            const isSelected = selectedId === market.market_id;
            const isTop = index === 0;
            const modalPriceKg = market.modal_price_per_kg || (market.modal_price ? market.modal_price / 100 : 0);
            const minPriceKg = market.min_price_per_kg || (market.min_price ? market.min_price / 100 : 0);
            const maxPriceKg = market.max_price_per_kg || (market.max_price ? market.max_price / 100 : 0);

            return (
              <div
                key={market.market_id}
                onClick={() => {
                  setSelectedId(isSelected ? null : market.market_id);
                  onSelectMarket?.(market);
                }}
                style={{
                  padding: "16px 20px",
                  borderBottom: "1px solid #f3f4f6",
                  cursor: "pointer",
                  background: isSelected ? "#f0fdf4" : isTop ? "#fafff7" : "white",
                  borderLeft: isTop ? "4px solid #16a34a" : "4px solid transparent",
                  transition: "background 0.15s",
                }}
                onMouseEnter={e => { if (!isSelected) (e.currentTarget as HTMLDivElement).style.background = "#f9fafb"; }}
                onMouseLeave={e => { if (!isSelected) (e.currentTarget as HTMLDivElement).style.background = isTop ? "#fafff7" : "white"; }}
              >
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px" }}>
                  {/* Left: Market info */}
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                      {isTop && <span style={{ fontSize: "14px" }}>🥇</span>}
                      {index === 1 && <span style={{ fontSize: "14px" }}>🥈</span>}
                      {index === 2 && <span style={{ fontSize: "14px" }}>🥉</span>}
                      {index > 2 && <span style={{ fontSize: "13px", color: "#9ca3af", fontWeight: 700 }}>#{index + 1}</span>}
                      <span style={{ fontSize: "15px", fontWeight: 700, color: "#1f2937" }}>{market.market_name}</span>
                      {market.is_demo && (
                        <span style={{
                          background: "#fef9c3",
                          color: "#854d0e",
                          borderRadius: "6px",
                          padding: "1px 6px",
                          fontSize: "10px",
                          fontWeight: 600,
                        }}>DEMO</span>
                      )}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "12px", color: "#6b7280" }}>
                      <span style={{ display: "flex", alignItems: "center", gap: "3px" }}>
                        <MapPin size={11} /> {market.district}
                        {market.distance_km != null && ` · ${market.distance_km} km`}
                      </span>
                      {market.transport_estimate && (
                        <span style={{ display: "flex", alignItems: "center", gap: "3px" }}>
                          <Truck size={11} /> ₹{market.transport_estimate.total_transport_cost.toLocaleString()} transport
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Right: Price & Return */}
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div style={{ fontSize: "20px", fontWeight: 900, color: "#166534" }}>
                      ₹{modalPriceKg.toFixed(2)}/kg
                    </div>
                    <div style={{ fontSize: "11px", color: "#6b7280", marginBottom: "4px" }}>
                      ₹{minPriceKg.toFixed(0)}–{maxPriceKg.toFixed(0)}/kg
                    </div>
                    {market.estimated_net_return != null && (
                      <div style={{
                        fontSize: "13px",
                        fontWeight: 700,
                        color: market.estimated_net_return > 0 ? "#16a34a" : "#dc2626",
                        background: market.estimated_net_return > 0 ? "#dcfce7" : "#fee2e2",
                        borderRadius: "8px",
                        padding: "2px 8px",
                        display: "inline-block",
                      }}>
                        Net ₹{market.estimated_net_return.toLocaleString()}
                      </div>
                    )}
                  </div>
                </div>

                {/* Expanded: vehicle + arrival */}
                {isSelected && (
                  <div style={{
                    marginTop: "12px",
                    paddingTop: "12px",
                    borderTop: "1px solid #d1fae5",
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 1fr",
                    gap: "10px",
                    fontSize: "12px",
                  }}>
                    <div>
                      <div style={{ color: "#6b7280", marginBottom: "2px" }}>Recommended Vehicle</div>
                      <div style={{ fontWeight: 600, color: "#1f2937" }}>
                        🚛 {market.transport_estimate?.recommended_vehicle || "—"}
                      </div>
                    </div>
                    <div>
                      <div style={{ color: "#6b7280", marginBottom: "2px" }}>Arrival (yesterday)</div>
                      <div style={{ fontWeight: 600, color: "#1f2937" }}>
                        {market.arrival_quantity_tonnes ? `${market.arrival_quantity_tonnes} tonnes` : "—"}
                      </div>
                    </div>
                    <div>
                      <div style={{ color: "#6b7280", marginBottom: "2px" }}>Transport/kg</div>
                      <div style={{ fontWeight: 600, color: "#1f2937" }}>
                        ₹{market.transport_estimate?.cost_per_kg?.toFixed(2) || "—"}/kg
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Footer disclaimer */}
      <div style={{
        padding: "10px 20px",
        background: "#f9fafb",
        fontSize: "11px",
        color: "#9ca3af",
        borderTop: "1px solid #f3f4f6",
      }}>
        ℹ️ Prices in ₹/kg (converted from ₹/quintal). Transport costs are estimates only. Verify with local APMC before selling.
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
