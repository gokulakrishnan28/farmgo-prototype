import type { LogisticsOrder } from "../services/farmgoStore";

export function printFarmGoReceipt(order: Partial<LogisticsOrder> | any) {
  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    alert("Please allow popups to download/print the receipt.");
    return;
  }

  const id = order.id || `FG-ORD-${Math.floor(1000 + Math.random() * 9000)}`;
  const dateStr = order.createdAt || order.date || new Date().toLocaleString();
  const crop = order.cropName || order.cargo || "Agricultural Cargo";
  const farmer = order.farmerName || sessionStorage.getItem("user_name") || "Gokulakrishnan K";
  const pickup = order.pickupLocation || order.pickup || "Origin Hub";
  const dest = order.destinationLocation || order.destination || "Destination Market";
  const driver = order.driverName || order.driver || "Senthil Kumar";
  const vehicle = order.vehicleName || "Tata Ace / Bolero Cargo";
  const weight = order.weightKg ? `${order.weightKg} kg` : (order.weight || "1,500 kg");
  const storage = order.preservationStorage || order.storage || "Normal storage";
  const status = (order.status || "BOOKED").replace("_", " ");

  const pricing = order.pricing || {
    baseFare: 1500,
    distanceFee: Math.round((order.fee || 4500) * 0.7),
    loadingFee: 400,
    unloadingFee: 400,
    platformFee: 200,
    total: order.fee || order.income || order.payout || 4500
  };

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Dispatch Receipt - farmGo Agricultural Logistics</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; padding: 40px; color: #0f172a; background: #f8fafc; margin: 0; }
          .receipt-card { max-width: 700px; margin: 0 auto; background: white; border: 1px solid #e2e8f0; border-radius: 24px; padding: 40px; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.05); position: relative; overflow: hidden; }
          .receipt-card::before { content: ""; position: absolute; top: 0; left: 0; right: 0; height: 8px; background: linear-gradient(90deg, #10b981 0%, #047857 100%); }
          .header { display: flex; align-items: center; justify-content: space-between; border-bottom: 2px dashed #e2e8f0; padding-bottom: 24px; margin-bottom: 24px; }
          .logo-text { font-size: 26px; font-weight: 900; color: #10b981; letter-spacing: -0.03em; }
          .logo-accent { color: #0f172a; }
          .badge { bg-emerald-50; color: #047857; background: #ecfdf5; font-size: 11px; font-weight: 800; padding: 6px 14px; border-radius: 9999px; border: 1px solid #a7f3d0; text-transform: uppercase; letter-spacing: 0.05em; }
          .receipt-title { font-size: 20px; font-weight: 800; color: #0f172a; margin: 0 0 16px 0; }
          .meta-grid { display: grid; grid-template-cols: 1fr 1fr 1fr; gap: 16px; margin-bottom: 24px; background: #f8fafc; padding: 18px; border-radius: 16px; border: 1px solid #f1f5f9; }
          .meta-item { display: flex; flex-direction: column; gap: 4px; }
          .meta-label { font-size: 10px; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; }
          .meta-val { font-size: 13px; font-weight: 700; color: #1e293b; }
          .details-table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
          .table-hdr { text-align: left; font-size: 11px; font-weight: 800; color: #94a3b8; text-transform: uppercase; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px; }
          .table-row td { padding: 12px 0; border-bottom: 1px solid #f1f5f9; font-size: 13px; font-weight: 600; color: #334155; }
          .table-row td.strong { font-weight: 700; color: #0f172a; text-align: right; }
          .pricing-box { background: #ecfdf5; border: 1px solid #a7f3d0; padding: 20px; border-radius: 16px; margin-bottom: 24px; }
          .pricing-row { display: flex; justify-content: space-between; font-size: 12px; font-weight: 600; color: #047857; margin-bottom: 8px; }
          .total-row { border-top: 2px solid #047857; padding-top: 12px; margin-top: 8px; display: flex; justify-content: space-between; align-items: center; }
          .total-label { font-size: 16px; font-weight: 900; color: #065f46; }
          .total-amount { font-size: 26px; font-weight: 900; color: #047857; }
          .stamp { text-align: center; margin-top: 24px; opacity: 0.85; font-size: 12px; font-weight: 800; color: #10b981; text-transform: uppercase; border: 2px solid #10b981; width: fit-content; margin-left: auto; margin-right: auto; padding: 6px 16px; border-radius: 8px; transform: rotate(-3deg); letter-spacing: 0.1em; }
          .footer { text-align: center; margin-top: 30px; font-size: 11px; color: #94a3b8; font-weight: 500; border-top: 1px solid #f1f5f9; padding-top: 16px; }
        </style>
      </head>
      <body>
        <div class="receipt-card">
          <div class="header">
            <div class="logo-text">farm<span class="logo-accent">Go</span></div>
            <div class="badge">Status: ${status}</div>
          </div>

          <h3 class="receipt-title">Agricultural Cargo Dispatch Manifest</h3>

          <div class="meta-grid">
            <div class="meta-item">
              <span class="meta-label">Booking ID</span>
              <span class="meta-val">${id}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">Booking Date</span>
              <span class="meta-val">${dateStr}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">Farmer Name</span>
              <span class="meta-val">${farmer}</span>
            </div>
          </div>

          <table class="details-table">
            <thead>
              <tr>
                <th class="table-hdr">Cargo & Route Itemization</th>
                <th class="table-hdr" style="text-align: right;">Details</th>
              </tr>
            </thead>
            <tbody>
              <tr class="table-row">
                <td>Harvest Crop Cargo</td>
                <td class="strong">${crop} (${weight})</td>
              </tr>
              <tr class="table-row">
                <td>Pickup Origin Hub</td>
                <td class="strong">${pickup}</td>
              </tr>
              <tr class="table-row">
                <td>Destination Wholesale Market</td>
                <td class="strong">${dest}</td>
              </tr>
              <tr class="table-row">
                <td>Assigned Transport Carrier</td>
                <td class="strong">${vehicle}</td>
              </tr>
              <tr class="table-row">
                <td>Assigned Driver</td>
                <td class="strong">${driver}</td>
              </tr>
              <tr class="table-row">
                <td>Preservation Requirement</td>
                <td class="strong">${storage}</td>
              </tr>
            </tbody>
          </table>

          <div class="pricing-box">
            <div class="pricing-row">
              <span>Base Booking Tariff</span>
              <span>₹${pricing.baseFare.toLocaleString()}</span>
            </div>
            <div class="pricing-row">
              <span>Transit Distance Fee</span>
              <span>₹${pricing.distanceFee.toLocaleString()}</span>
            </div>
            <div class="pricing-row">
              <span>Handling (Loading & Unloading)</span>
              <span>₹${(pricing.loadingFee + pricing.unloadingFee).toLocaleString()}</span>
            </div>
            <div class="pricing-row">
              <span>Platform Service Fee (5%)</span>
              <span>₹${pricing.platformFee.toLocaleString()}</span>
            </div>
            <div class="total-row">
              <span class="total-label">Total Verified Tariff</span>
              <span class="total-amount">₹${pricing.total.toLocaleString()}</span>
            </div>
          </div>

          <div class="stamp">Verified Logistics Order</div>

          <div class="footer">
            Direct Agricultural Logistics Network · Tamil Nadu<br>
            © 2026 farmGo Logistics Platform. Gokulakrishnan K. (CEO)
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
}
