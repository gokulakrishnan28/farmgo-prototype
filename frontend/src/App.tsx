import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import FarmerDashboard from "./pages/Farmer/FarmerDashboard";
import FarmerFlow from "./pages/Farmer/FarmerFlow";
import TransporterDashboard from "./pages/Transporter/Dashboard";
import "./App.css";

function AdminRedirect() {
  const adminUrl = import.meta.env.VITE_ADMIN_PORTAL_URL || "http://localhost:5174";
  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col justify-center items-center p-6 text-center">
      <div className="bg-slate-800 border border-slate-700 p-8 rounded-3xl max-w-md shadow-2xl space-y-4">
        <span className="text-5xl">📊</span>
        <h2 className="text-2xl font-bold text-emerald-400">Admin Portal Host</h2>
        <p className="text-slate-300 text-sm leading-relaxed">
          The Admin Portal runs on a separate host for platform data management and analytics.
        </p>
        <a
          href={adminUrl}
          className="inline-flex items-center space-x-2 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 px-6 rounded-xl transition-all shadow-lg text-sm"
        >
          <span>Open Admin Portal ({adminUrl}) ↗</span>
        </a>
      </div>
    </div>
  );
}

function BuyerRedirect() {
  const buyerUrl = import.meta.env.VITE_BUYER_PORTAL_URL || "http://localhost:5175";
  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col justify-center items-center p-6 text-center">
      <div className="bg-slate-800 border border-slate-700 p-8 rounded-3xl max-w-md shadow-2xl space-y-4">
        <span className="text-5xl">🛒</span>
        <h2 className="text-2xl font-bold text-emerald-400">Buyer Portal Host</h2>
        <p className="text-slate-300 text-sm leading-relaxed">
          The Buyer Portal runs on a separate host for crop procurement and live market intelligence.
        </p>
        <a
          href={buyerUrl}
          className="inline-flex items-center space-x-2 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 px-6 rounded-xl transition-all shadow-lg text-sm"
        >
          <span>Open Buyer Portal ({buyerUrl}) ↗</span>
        </a>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/farmer/dashboard" element={<FarmerDashboard />} />
        <Route path="/farmer/book" element={<FarmerFlow />} />
        {/* Make the booking flow the primary landing page for farmers */}
        <Route path="/farmer" element={<FarmerFlow />} />
        <Route path="/transporter" element={<TransporterDashboard />} />
        <Route path="/admin" element={<AdminRedirect />} />
        <Route path="/buyer" element={<BuyerRedirect />} />
      </Routes>
    </Router>
  );
}

export default App;

