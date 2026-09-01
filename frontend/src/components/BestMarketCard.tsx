/**
 * BestMarketCard
 * ---------------
 * Displays the FarmGo best market recommendation with full
 * transparent net return breakdown.
 * 
 * Shows: Recommended market, expected price, transport cost,
 * APMC commission, net return, and reason.
 */
import { useState } from "react";
import { 
  Star, MapPin, Truck, TrendingUp, ChevronDown, ChevronUp,
  AlertCircle, CheckCircle2
} from "lucide-react";
// BestMarketCard

interface MarketRecommendation {
  recommended: {
    market_name: string;
    district: string;
    state: string;
    modal_price_per_kg: number;
    min_price_per_kg: number;
    max_price_per_kg: number;
    distance_km: number;
    transport_estimate: {
      recommended_vehicle: string;
      total_transport_cost: number;
      cost_per_kg: number;
      trips_required: number;
    };
    net_return_breakdown: {
      gross_revenue: number;
      transport_cost: number;
      commission: number;
      commission_pct: number;
      net_return: number;
      profit_margin_pct: number;
    };
    estimated_net_return: number;
    is_demo?: boolean;
  };
  reason: string;
  disclaimer: string;
  comparison_basis: string;
  is_demo?: boolean;
}

interface BestMarketCardProps {
  recommendation: MarketRecommendation | null;
  commodity: string;
  quantity_kg: number;
  loading?: boolean;
  onViewBuyers?: () => void;
  onViewDetails?: () => void;
}

export default function BestMarketCard({
  recommendation,
  commodity,
  quantity_kg,
  loading = false,
  onViewBuyers,
  onViewDetails,
}: BestMarketCardProps) {
  const [showBreakdown, setShowBreakdown] = useState(false);

  if (loading) {
    return (
      <div style={{
        background: "linear-gradient(135deg, #166534 0%, #15803d 100%)",
        borderRadius: "20px",
        padding: "28px",
        color: "white",
        animation: "pulse 1.5s infinite",
      }}>
        <div style={{ height: "20px", background: "rgba(255,255,255,0.2)", borderRadius: "8px", marginBottom: "12px" }} />
        <div style={{ height: "40px", background: "rgba(255,255,255,0.15)", borderRadius: "8px", marginBottom: "12px" }} />
        <div style={{ height: "20px", background: "rgba(255,255,255,0.1)", borderRadius: "8px", width: "60%" }} />
      </div>
    );
  }

  if (!recommendation) {
    return (
      <div style={{
        background: "#f9fafb",
        border: "2px dashed #d1d5db",
        borderRadius: "20px",
        padding: "28px",
        textAlign: "center",
        color: "#6b7280",
      }}>
        <TrendingUp size={32} style={{ margin: "0 auto 12px", opacity: 0.5 }} />
        <p style={{ fontWeight: 600, marginBottom: "6px" }}>No Recommendation Yet</p>
        <p style={{ fontSize: "13px" }}>Select a crop and quantity, then click "Find Best Selling Option"</p>
      </div>
    );
  }

  const rec = recommendation.recommended;
  const breakdown = rec.net_return_breakdown;

  return (
    <div style={{
      background: "linear-gradient(135deg, #166534 0%, #15803d 100%)",
      borderRadius: "20px",
      padding: "24px",
      color: "white",
      position: "relative",
      overflow: "hidden",
      boxShadow: "0 12px 40px rgba(22,101,52,0.35)",
    }}>
      {/* Demo badge */}
      {(recommendation.is_demo || rec.is_demo) && (
        <div style={{
          position: "absolute",
          top: "12px",
          right: "12px",
          background: "rgba(255,255,255,0.2)",
          borderRadius: "20px",
          padding: "3px 10px",
          fontSize: "11px",
          fontWeight: 600,
          backdropFilter: "blur(8px)",
        }}>
          📊 Demo Data
        </div>
      )}

      {/* Background decoration */}
      <div style={{
        position: "absolute",
        top: "-30px",
        right: "-30px",
        width: "120px",
        height: "120px",
        background: "rgba(255,255,255,0.06)",
        borderRadius: "50%",
      }} />

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
        <Star size={18} style={{ color: "#fbbf24", fill: "#fbbf24" }} />
        <span style={{ fontSize: "12px", fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", opacity: 0.85 }}>
          FarmGo Recommendation
        </span>
      </div>

      {/* Market name */}
      <div style={{ marginBottom: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
          <MapPin size={16} style={{ opacity: 0.8 }} />
          <span style={{ fontSize: "22px", fontWeight: 800 }}>{rec.market_name}</span>
        </div>
        <span style={{ fontSize: "13px", opacity: 0.75 }}>
          {rec.district}, {rec.state} · {rec.distance_km} km away
        </span>
      </div>

      {/* Price row */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr 1fr",
        gap: "12px",
        marginBottom: "16px",
      }}>
        <div style={{
          background: "rgba(255,255,255,0.12)",
          borderRadius: "12px",
          padding: "12px",
          textAlign: "center",
        }}>
          <div style={{ fontSize: "11px", opacity: 0.75, marginBottom: "4px" }}>Expected Price</div>
          <div style={{ fontSize: "18px", fontWeight: 800 }}>₹{rec.modal_price_per_kg}/kg</div>
          <div style={{ fontSize: "10px", opacity: 0.6 }}>₹{rec.min_price_per_kg}–{rec.max_price_per_kg}/kg</div>
        </div>
        <div style={{
          background: "rgba(255,255,255,0.12)",
          borderRadius: "12px",
          padding: "12px",
          textAlign: "center",
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "4px", fontSize: "11px", opacity: 0.75, marginBottom: "4px" }}>
            <Truck size={11} /> Transport
          </div>
          <div style={{ fontSize: "18px", fontWeight: 800 }}>₹{(rec.transport_estimate?.total_transport_cost || 0).toLocaleString()}</div>
          <div style={{ fontSize: "10px", opacity: 0.6 }}>₹{(rec.transport_estimate?.cost_per_kg || 0).toFixed(2)}/kg</div>
        </div>
        <div style={{
          background: "rgba(255,255,255,0.18)",
          borderRadius: "12px",
          padding: "12px",
          textAlign: "center",
          border: "1px solid rgba(255,255,255,0.3)",
        }}>
          <div style={{ fontSize: "11px", opacity: 0.85, marginBottom: "4px" }}>Net Return</div>
          <div style={{ fontSize: "18px", fontWeight: 900, color: "#bbf7d0" }}>
            ₹{(rec.estimated_net_return || 0).toLocaleString()}
          </div>
          <div style={{ fontSize: "10px", opacity: 0.7 }}>{breakdown?.profit_margin_pct?.toFixed(1)}% margin</div>
        </div>
      </div>

      {/* Reason */}
      <div style={{
        background: "rgba(255,255,255,0.1)",
        borderRadius: "10px",
        padding: "10px 14px",
        fontSize: "12px",
        marginBottom: "12px",
        lineHeight: 1.5,
        opacity: 0.9,
      }}>
        <CheckCircle2 size={12} style={{ display: "inline", marginRight: "6px", verticalAlign: "middle" }} />
        {recommendation.reason}
      </div>

      {/* Breakdown toggle */}
      <button
        onClick={() => setShowBreakdown(!showBreakdown)}
        style={{
          background: "rgba(255,255,255,0.1)",
          border: "none",
          color: "rgba(255,255,255,0.85)",
          cursor: "pointer",
          fontSize: "12px",
          display: "flex",
          alignItems: "center",
          gap: "4px",
          padding: "6px 0",
          marginBottom: showBreakdown ? "12px" : "16px",
        }}
      >
        {showBreakdown ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        {showBreakdown ? "Hide" : "Show"} calculation breakdown
      </button>

      {/* Breakdown details */}
      {showBreakdown && breakdown && (
        <div style={{
          background: "rgba(0,0,0,0.2)",
          borderRadius: "12px",
          padding: "14px",
          marginBottom: "16px",
          fontSize: "13px",
        }}>
          <div style={{ fontWeight: 700, marginBottom: "10px", opacity: 0.9 }}>
            Net Return Calculation — {commodity} {quantity_kg} kg
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
            <span style={{ opacity: 0.8 }}>Gross Revenue ({rec.modal_price_per_kg}/kg × {quantity_kg} kg)</span>
            <span style={{ fontWeight: 600 }}>+ ₹{(breakdown.gross_revenue || 0).toLocaleString()}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
            <span style={{ opacity: 0.8 }}>Transport Cost (est.)</span>
            <span style={{ color: "#fca5a5" }}>− ₹{(breakdown.transport_cost || 0).toLocaleString()}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
            <span style={{ opacity: 0.8 }}>APMC Commission ({breakdown.commission_pct}%)</span>
            <span style={{ color: "#fca5a5" }}>− ₹{(breakdown.commission || 0).toLocaleString()}</span>
          </div>
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.2)", paddingTop: "8px", display: "flex", justifyContent: "space-between", fontWeight: 800 }}>
            <span>Estimated Net Return</span>
            <span style={{ color: "#bbf7d0", fontSize: "16px" }}>₹{(breakdown.net_return || 0).toLocaleString()}</span>
          </div>
          <div style={{ marginTop: "8px", fontSize: "11px", opacity: 0.6 }}>
            {recommendation.comparison_basis}
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div style={{ display: "flex", gap: "10px" }}>
        <button
          id="view-buyers-btn"
          onClick={onViewBuyers}
          style={{
            flex: 1,
            padding: "12px",
            background: "white",
            color: "#166534",
            border: "none",
            borderRadius: "12px",
            fontWeight: 700,
            cursor: "pointer",
            fontSize: "14px",
            transition: "transform 0.15s",
          }}
          onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.02)")}
          onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
        >
          👥 View Buyers
        </button>
        <button
          id="view-market-details-btn"
          onClick={onViewDetails}
          style={{
            flex: 1,
            padding: "12px",
            background: "rgba(255,255,255,0.15)",
            color: "white",
            border: "1px solid rgba(255,255,255,0.3)",
            borderRadius: "12px",
            fontWeight: 600,
            cursor: "pointer",
            fontSize: "14px",
            transition: "background 0.15s",
          }}
          onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.22)")}
          onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.15)")}
        >
          📊 Market Details
        </button>
      </div>

      {/* Disclaimer */}
      <div style={{ marginTop: "12px", fontSize: "10px", opacity: 0.55, display: "flex", alignItems: "flex-start", gap: "4px" }}>
        <AlertCircle size={11} style={{ flexShrink: 0, marginTop: "1px" }} />
        <span>{recommendation.disclaimer}</span>
      </div>
    </div>
  );
}
