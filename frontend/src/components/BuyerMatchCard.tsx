/**
 * BuyerMatchCard
 * ---------------
 * Shows a buyer/offer card with match score breakdown.
 * Used in: Farmer Dashboard (Find Buyers section) + Buyer Dashboard.
 */
import { useState } from "react";
import { Star, MapPin, CheckCircle2, ChevronDown, ChevronUp, ShieldCheck } from "lucide-react";
// BuyerMatchCard

interface MatchBreakdown {
  price_score: number;
  quantity_score: number;
  quality_score: number;
  distance_score: number;
  reliability_score: number;
}

interface BuyerMatch {
  id: string;
  full_name: string;
  organization_name?: string;
  buyer_type?: string;
  state?: string;
  district?: string;
  rating?: number;
  total_transactions?: number;
  is_verified?: boolean;
  match_score: number;
  match_breakdown?: MatchBreakdown;
  offered_price_per_kg?: number;
  required_quantity_kg?: number;
  quality_requirement?: string;
  distance_km?: number;
  is_demo?: boolean;
}

interface BuyerMatchCardProps {
  buyer: BuyerMatch;
  onMakeOffer?: (buyer: BuyerMatch) => void;
  onViewProfile?: (buyer: BuyerMatch) => void;
  rank?: number;
}

const ScoreBar = ({ label, value, color }: { label: string; value: number; color: string }) => (
  <div style={{ marginBottom: "8px" }}>
    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "3px", fontSize: "11px" }}>
      <span style={{ color: "#6b7280" }}>{label}</span>
      <span style={{ fontWeight: 700, color }}>{value.toFixed(0)}/100</span>
    </div>
    <div style={{ background: "#f3f4f6", borderRadius: "999px", height: "6px" }}>
      <div style={{
        background: color,
        borderRadius: "999px",
        height: "6px",
        width: `${value}%`,
        transition: "width 0.5s ease",
      }} />
    </div>
  </div>
);

export default function BuyerMatchCard({
  buyer,
  onMakeOffer,
  onViewProfile,
  rank = 0,
}: BuyerMatchCardProps) {
  const [showBreakdown, setShowBreakdown] = useState(false);

  const scoreColor = buyer.match_score >= 75 ? "#16a34a" : buyer.match_score >= 50 ? "#d97706" : "#dc2626";
  const scoreBg = buyer.match_score >= 75 ? "#dcfce7" : buyer.match_score >= 50 ? "#fef9c3" : "#fee2e2";

  const rankEmoji = rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : `#${rank}`;

  return (
    <div style={{
      background: "white",
      borderRadius: "16px",
      padding: "18px",
      boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
      border: rank === 1 ? "2px solid #16a34a" : "1px solid #f3f4f6",
      transition: "transform 0.15s, box-shadow 0.15s",
      position: "relative",
    }}
    onMouseEnter={e => {
      (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)";
      (e.currentTarget as HTMLDivElement).style.boxShadow = "0 8px 24px rgba(0,0,0,0.1)";
    }}
    onMouseLeave={e => {
      (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
      (e.currentTarget as HTMLDivElement).style.boxShadow = "0 2px 12px rgba(0,0,0,0.07)";
    }}
    >
      {/* Rank badge */}
      {rank > 0 && (
        <div style={{
          position: "absolute",
          top: "-8px",
          left: "14px",
          fontSize: "18px",
        }}>
          {rankEmoji}
        </div>
      )}

      {/* Demo badge */}
      {buyer.is_demo && (
        <div style={{
          position: "absolute",
          top: "10px",
          right: "10px",
          background: "#fef9c3",
          color: "#854d0e",
          borderRadius: "8px",
          padding: "2px 8px",
          fontSize: "10px",
          fontWeight: 700,
        }}>
          Demo
        </div>
      )}

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "12px", marginTop: rank > 0 ? "8px" : 0 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "2px" }}>
            <span style={{ fontSize: "15px", fontWeight: 800, color: "#1f2937" }}>
              {buyer.organization_name || buyer.full_name}
            </span>
            {buyer.is_verified && (
              <ShieldCheck size={15} style={{ color: "#3b82f6", flexShrink: 0 }} />
            )}
          </div>
          <div style={{ display: "flex", gap: "10px", fontSize: "12px", color: "#6b7280", flexWrap: "wrap" }}>
            <span style={{
              background: "#f3f4f6",
              borderRadius: "6px",
              padding: "1px 8px",
              fontWeight: 600,
              color: "#374151",
            }}>
              {buyer.buyer_type || "Buyer"}
            </span>
            {buyer.district && (
              <span style={{ display: "flex", alignItems: "center", gap: "3px" }}>
                <MapPin size={11} /> {buyer.district}{buyer.distance_km != null ? ` · ${buyer.distance_km} km` : ""}
              </span>
            )}
          </div>
        </div>
        {/* Match score circle */}
        <div style={{
          width: "56px",
          height: "56px",
          borderRadius: "50%",
          background: scoreBg,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}>
          <span style={{ fontSize: "18px", fontWeight: 900, color: scoreColor }}>{buyer.match_score.toFixed(0)}</span>
          <span style={{ fontSize: "9px", color: scoreColor, fontWeight: 700 }}>MATCH</span>
        </div>
      </div>

      {/* Info chips */}
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "12px" }}>
        {buyer.offered_price_per_kg != null && (
          <div style={{
            background: "#dcfce7",
            borderRadius: "8px",
            padding: "6px 12px",
            textAlign: "center",
          }}>
            <div style={{ fontSize: "11px", color: "#166534" }}>Offers up to</div>
            <div style={{ fontSize: "16px", fontWeight: 800, color: "#166534" }}>₹{buyer.offered_price_per_kg}/kg</div>
          </div>
        )}
        {buyer.required_quantity_kg != null && (
          <div style={{
            background: "#f3f4f6",
            borderRadius: "8px",
            padding: "6px 12px",
            textAlign: "center",
          }}>
            <div style={{ fontSize: "11px", color: "#6b7280" }}>Needs up to</div>
            <div style={{ fontSize: "16px", fontWeight: 800, color: "#374151" }}>{buyer.required_quantity_kg?.toLocaleString()} kg</div>
          </div>
        )}
        {buyer.quality_requirement && (
          <div style={{
            background: "#f3f4f6",
            borderRadius: "8px",
            padding: "6px 12px",
            textAlign: "center",
          }}>
            <div style={{ fontSize: "11px", color: "#6b7280" }}>Quality</div>
            <div style={{ fontSize: "16px", fontWeight: 800, color: "#374151" }}>Grade {buyer.quality_requirement}</div>
          </div>
        )}
        {buyer.rating != null && (
          <div style={{
            background: "#fef9c3",
            borderRadius: "8px",
            padding: "6px 12px",
            textAlign: "center",
          }}>
            <div style={{ fontSize: "11px", color: "#854d0e", display: "flex", alignItems: "center", justifyContent: "center", gap: "2px" }}>
              <Star size={10} style={{ fill: "#d97706" }} /> Rating
            </div>
            <div style={{ fontSize: "16px", fontWeight: 800, color: "#854d0e" }}>
              {buyer.rating?.toFixed(1)} <span style={{ fontSize: "11px" }}>/ 5</span>
            </div>
          </div>
        )}
      </div>

      {/* Transactions */}
      {buyer.total_transactions != null && (
        <div style={{ fontSize: "12px", color: "#6b7280", marginBottom: "12px" }}>
          <CheckCircle2 size={11} style={{ display: "inline", marginRight: "4px", color: "#16a34a" }} />
          {buyer.total_transactions} successful transactions
        </div>
      )}

      {/* Match breakdown toggle */}
      {buyer.match_breakdown && (
        <button
          onClick={() => setShowBreakdown(!showBreakdown)}
          style={{
            background: "none",
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
            padding: "6px 12px",
            fontSize: "11px",
            color: "#6b7280",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "4px",
            marginBottom: "12px",
            width: "100%",
            justifyContent: "center",
          }}
        >
          {showBreakdown ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          {showBreakdown ? "Hide" : "Show"} match score breakdown
        </button>
      )}

      {/* Score breakdown */}
      {showBreakdown && buyer.match_breakdown && (
        <div style={{
          background: "#f9fafb",
          borderRadius: "12px",
          padding: "14px",
          marginBottom: "12px",
          fontSize: "12px",
        }}>
          <div style={{ fontWeight: 700, color: "#1f2937", marginBottom: "10px" }}>
            Match Score Breakdown
          </div>
          <ScoreBar label="Price Match (30%)" value={buyer.match_breakdown.price_score} color="#16a34a" />
          <ScoreBar label="Quantity Match (20%)" value={buyer.match_breakdown.quantity_score} color="#3b82f6" />
          <ScoreBar label="Quality Match (20%)" value={buyer.match_breakdown.quality_score} color="#8b5cf6" />
          <ScoreBar label="Distance (15%)" value={buyer.match_breakdown.distance_score} color="#f59e0b" />
          <ScoreBar label="Reliability (15%)" value={buyer.match_breakdown.reliability_score} color="#ec4899" />
          <div style={{ marginTop: "10px", fontSize: "11px", color: "#9ca3af", textAlign: "center" }}>
            Score = Price 30% + Qty 20% + Quality 20% + Distance 15% + Reliability 15%
          </div>
        </div>
      )}

      {/* Actions */}
      <div style={{ display: "flex", gap: "8px" }}>
        <button
          id={`make-offer-${buyer.id}`}
          onClick={() => onMakeOffer?.(buyer)}
          style={{
            flex: 1,
            padding: "11px",
            background: "linear-gradient(135deg, #166534 0%, #16a34a 100%)",
            color: "white",
            border: "none",
            borderRadius: "10px",
            fontWeight: 700,
            cursor: "pointer",
            fontSize: "13px",
            transition: "opacity 0.15s",
          }}
          onMouseEnter={e => (e.currentTarget.style.opacity = "0.9")}
          onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
        >
          📨 Make Offer
        </button>
        <button
          id={`view-profile-${buyer.id}`}
          onClick={() => onViewProfile?.(buyer)}
          style={{
            padding: "11px 16px",
            background: "#f3f4f6",
            color: "#374151",
            border: "none",
            borderRadius: "10px",
            fontWeight: 600,
            cursor: "pointer",
            fontSize: "13px",
            transition: "background 0.15s",
          }}
          onMouseEnter={e => (e.currentTarget.style.background = "#e5e7eb")}
          onMouseLeave={e => (e.currentTarget.style.background = "#f3f4f6")}
        >
          Profile
        </button>
      </div>
    </div>
  );
}
