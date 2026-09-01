// farmGo Centralized State Engine & Cross-Portal Synchronizer

export type ShipmentStatus = 
  | "BOOKED"
  | "ASSIGNED"
  | "DRIVER_ASSIGNED"
  | "ARRIVING_PICKUP"
  | "AT_PICKUP"
  | "LOADED"
  | "IN_TRANSIT"
  | "NEAR_DESTINATION"
  | "DELIVERED"
  | "CANCELLED";

export interface UserSession {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "farmer" | "transporter" | "admin";
  status: "active" | "suspended";
}

export interface CropListing {
  id: string;
  farmerId?: string;
  farmerName: string;
  name: string;
  category: "Vegetables" | "Fruits" | "Grains" | "Spices" | "Flowers" | "Others";
  quantity_kg: number;
  price_per_kg: number;
  status: "available" | "pending_transport" | "sold";
  district: string;
  createdAt: string;
}

export interface FleetVehicle {
  id: string;
  transporterId?: string;
  transporterName: string;
  name: string;
  driver: string;
  mob: string;
  limit: string;
  storage: "Normal storage" | "Dry storage" | "Cold storage";
  fare: number;
  status: "Standby Active" | "In Transit";
  plateNumber?: string;
  image?: string;
}

export interface PricingBreakdown {
  baseFare: number;
  distanceFee: number;
  loadingFee: number;
  unloadingFee: number;
  platformFee: number;
  total: number;
}

export interface ChatMessage {
  id: string;
  sender: string;
  role: "farmer" | "transporter" | "admin";
  text: string;
  timestamp: string;
}

export interface LogisticsOrder {
  id: string;
  cropId?: string;
  cropName: string;
  cropCategory: string;
  farmerName: string;
  farmerPhone: string;
  weightKg: number;
  pickupLocation: string;
  destinationLocation: string;
  distanceKm: number;
  preservationStorage: string;
  pricing: PricingBreakdown;
  transporterId?: string;
  transporterName?: string;
  driverName?: string;
  driverPhone?: string;
  vehicleName?: string;
  vehiclePlate?: string;
  status: ShipmentStatus;
  createdAt: string;
  updatedAt: string;
  proofOfDelivery?: {
    deliveredAt: string;
    receiverName: string;
    deliveredQty: string;
    notes?: string;
  };
  chatMessages: ChatMessage[];
}

export interface NotificationItem {
  id: string;
  targetRole: "farmer" | "transporter" | "admin" | "all";
  targetUser?: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  orderId?: string;
}

export interface AdminAccount {
  username: string;
  password: string;
  role: string;
  lastLogin: string;
  status: "active" | "suspended";
}

// -------------------------------------------------------------
// CONSTANTS & PRICING ENGINE
// -------------------------------------------------------------

export function calculateTransportPrice(
  weightKg: number,
  distanceKm: number,
  storageType: string
): PricingBreakdown {
  const safeWeight = Math.max(100, weightKg || 1000);
  const safeDistance = Math.max(5, distanceKm || 150);

  const baseFare = 1500;
  const isCold = storageType.toLowerCase().includes("cold") || storageType.toLowerCase().includes("reefer");
  const ratePerKm = isCold ? 24 : 18;
  const distanceFee = Math.round(safeDistance * ratePerKm);
  const loadingFee = Math.round(safeWeight * 0.4);
  const unloadingFee = Math.round(safeWeight * 0.4);
  const subtotal = baseFare + distanceFee + loadingFee + unloadingFee;
  const platformFee = Math.round(subtotal * 0.05); // 5% platform fee
  const total = subtotal + platformFee;

  return {
    baseFare,
    distanceFee,
    loadingFee,
    unloadingFee,
    platformFee,
    total
  };
}

// Default Seed Data
const DEFAULT_CROPS: CropListing[] = [
  { id: "CROP-1", farmerName: "Gokulakrishnan K", name: "Thanjavur Ponni Rice", category: "Grains", quantity_kg: 2000, price_per_kg: 54, status: "available", district: "Thanjavur", createdAt: "2026-08-20 09:30" },
  { id: "CROP-2", farmerName: "Chinnasamy A", name: "Erode Turmeric (Grade A)", category: "Spices", quantity_kg: 800, price_per_kg: 140, status: "pending_transport", district: "Erode", createdAt: "2026-08-21 11:15" },
  { id: "CROP-3", farmerName: "Subramanian P", name: "Pollachi Tender Coconuts", category: "Fruits", quantity_kg: 3000, price_per_kg: 42, status: "sold", district: "Coimbatore", createdAt: "2026-08-22 14:00" },
  { id: "CROP-4", farmerName: "Muthu Kumar", name: "Salem Malgoa Mangoes", category: "Fruits", quantity_kg: 1200, price_per_kg: 95, status: "available", district: "Salem", createdAt: "2026-08-23 16:45" },
  { id: "CROP-5", farmerName: "Ranganathan K", name: "Nilgiris Fresh Carrots", category: "Vegetables", quantity_kg: 1500, price_per_kg: 60, status: "available", district: "Ooty", createdAt: "2026-08-24 08:20" }
];

const DEFAULT_FLEET: FleetVehicle[] = [
  { id: "v-1", transporterName: "Mohamed Karib Navas", name: "Tata Ace Agri-Mini", driver: "Senthil Kumar", mob: "+91 94441 23451", limit: "800 kg", storage: "Normal storage", fare: 3200, status: "Standby Active", plateNumber: "TN 59 AB 1024", image: "/truck.jpg" },
  { id: "v-2", transporterName: "Mohamed Karib Navas", name: "Mahindra Bolero Cargo Pickup", driver: "Ramachandran", mob: "+91 98845 10982", limit: "1.5 Tons", storage: "Dry storage", fare: 4500, status: "Standby Active", plateNumber: "TN 38 CX 4091", image: "/truck.jpg" },
  { id: "v-3", transporterName: "Mohamed Karib Navas", name: "Reefer Cold-Mini Truck", driver: "Annadurai P", mob: "+91 95530 11400", limit: "1.2 Tons", storage: "Cold storage", fare: 6400, status: "Standby Active", plateNumber: "TN 27 BL 8832", image: "/truck.jpg" },
  { id: "v-4", transporterName: "Mohamed Karib Navas", name: "Eicher Multi-Haul Veg Carrier", driver: "Karthikeyan", mob: "+91 94420 88310", limit: "3.5 Tons", storage: "Dry storage", fare: 9800, status: "Standby Active", plateNumber: "TN 45 FF 2210", image: "/truck.jpg" },
  { id: "v-5", transporterName: "Mohamed Karib Navas", name: "Premium Reefer Agro-King", driver: "Gokulraj S", mob: "+91 90021 77651", limit: "5.5 Tons", storage: "Cold storage", fare: 16500, status: "Standby Active", plateNumber: "TN 01 KK 9988", image: "/truck.jpg" }
];

const DEFAULT_ORDERS: LogisticsOrder[] = [
  {
    id: "ORD-9201",
    cropId: "CROP-2",
    cropName: "Erode Turmeric (Grade A)",
    cropCategory: "Spices",
    farmerName: "Chinnasamy A",
    farmerPhone: "+91 94431 88720",
    weightKg: 1200,
    pickupLocation: "Green Agros, Erode",
    destinationLocation: "Koyambedu Market, Chennai",
    distanceKm: 390,
    preservationStorage: "Normal Storage",
    pricing: calculateTransportPrice(1200, 390, "Normal Storage"),
    transporterName: "Mohamed Karib Navas",
    driverName: "Annadurai P",
    driverPhone: "+91 95530 11400",
    vehicleName: "Reefer Cold-Mini Truck",
    vehiclePlate: "TN 27 BL 8832",
    status: "IN_TRANSIT",
    createdAt: "2026-08-25 08:30",
    updatedAt: "2026-08-25 11:15",
    chatMessages: [
      { id: "m1", sender: "Chinnasamy A", role: "farmer", text: "Cargo loaded carefully in Erode hub. Please maintain ambient temp.", timestamp: "08:45 AM" },
      { id: "m2", sender: "Annadurai P", role: "transporter", text: "Received and verified weight 1.2 Tons. En-route to Chennai Koyambedu now.", timestamp: "09:00 AM" }
    ]
  },
  {
    id: "ORD-5541",
    cropId: "CROP-3",
    cropName: "Pollachi Tender Coconuts",
    cropCategory: "Fruits",
    farmerName: "Subramanian P",
    farmerPhone: "+91 98422 10984",
    weightKg: 800,
    pickupLocation: "Pollachi Coconut Farm, Coimbatore",
    destinationLocation: "Mattuthavani Market, Madurai",
    distanceKm: 180,
    preservationStorage: "Cold Storage",
    pricing: calculateTransportPrice(800, 180, "Cold Storage"),
    transporterName: "Mohamed Karib Navas",
    driverName: "Ramachandran",
    driverPhone: "+91 98845 10982",
    vehicleName: "Mahindra Bolero Cargo Pickup",
    vehiclePlate: "TN 38 CX 4091",
    status: "DELIVERED",
    createdAt: "2026-08-24 06:11",
    updatedAt: "2026-08-24 14:20",
    proofOfDelivery: {
      deliveredAt: "2026-08-24 14:20",
      receiverName: "Kariappa Mandi Traders",
      deliveredQty: "800 kg (Full Batch Verified)",
      notes: "Delivered in prime fresh condition without any damage."
    },
    chatMessages: []
  },
  {
    id: "ORD-8821",
    cropId: "CROP-1",
    cropName: "Thanjavur Ponni Rice",
    cropCategory: "Grains",
    farmerName: "Gokulakrishnan K",
    farmerPhone: "+91 98765 43210",
    weightKg: 2000,
    pickupLocation: "Cauvery Delta Granary, Thanjavur",
    destinationLocation: "Gandhi Market, Trichy",
    distanceKm: 55,
    preservationStorage: "Normal storage",
    pricing: calculateTransportPrice(2000, 55, "Normal storage"),
    status: "BOOKED",
    createdAt: "2026-08-25 10:00",
    updatedAt: "2026-08-25 10:00",
    chatMessages: []
  }
];

const DEFAULT_ADMINS: AdminAccount[] = [
  { username: "admin", password: "admin", role: "Super Administrator", lastLogin: "Just Now", status: "active" },
  { username: "gokul", password: "ceo2026password", role: "Founder & CEO", lastLogin: "2026-08-25 10:15", status: "active" },
  { username: "karib", password: "cfo2026password", role: "Co-Founder & CFO", lastLogin: "2026-08-24 18:30", status: "active" }
];

const DEFAULT_NOTIFICATIONS: NotificationItem[] = [
  { id: "n1", targetRole: "all", title: "Welcome to farmGo Logistics", message: "Platform fully connected across Farmer, Transporter, and Admin portals.", timestamp: "Just now", read: false },
  { id: "n2", targetRole: "transporter", title: "New Ride Request Alert", message: "Thanjavur Ponni Rice (2,000 kg) route Thanjavur to Trichy available.", timestamp: "10 mins ago", read: false, orderId: "ORD-8821" }
];

// -------------------------------------------------------------
// STORE CONTROLLER CLASS (SINGLE SOURCE OF TRUTH)
// -------------------------------------------------------------

class FarmGoStore {
  private notifyListeners() {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("farmgo_store_change"));
    }
  }

  // --- CROPS ---
  getCrops(): CropListing[] {
    const raw = localStorage.getItem("farmgo_crops");
    if (!raw) {
      this.saveCrops(DEFAULT_CROPS);
      return DEFAULT_CROPS;
    }
    try { return JSON.parse(raw); } catch { return DEFAULT_CROPS; }
  }

  saveCrops(crops: CropListing[]) {
    localStorage.setItem("farmgo_crops", JSON.stringify(crops));
    this.notifyListeners();
  }

  addCrop(crop: Omit<CropListing, "id" | "createdAt">): CropListing {
    const crops = this.getCrops();
    const newCrop: CropListing = {
      ...crop,
      id: `CROP-${Date.now()}`,
      createdAt: new Date().toISOString().replace("T", " ").substring(0, 16)
    };
    this.saveCrops([newCrop, ...crops]);
    this.addNotification({
      targetRole: "all",
      title: `🌾 New Crop Listed: ${newCrop.name}`,
      message: `${newCrop.farmerName} listed ${newCrop.quantity_kg} kg of ${newCrop.name} in ${newCrop.district}.`
    });
    return newCrop;
  }

  updateCrop(id: string, updates: Partial<CropListing>) {
    const crops = this.getCrops().map(c => c.id === id ? { ...c, ...updates } : c);
    this.saveCrops(crops);
  }

  deleteCrop(id: string) {
    const crops = this.getCrops().filter(c => c.id !== id);
    this.saveCrops(crops);
  }

  // --- FLEET ---
  getFleet(): FleetVehicle[] {
    const raw = localStorage.getItem("farmgo_fleet");
    if (!raw) {
      this.saveFleet(DEFAULT_FLEET);
      return DEFAULT_FLEET;
    }
    try { return JSON.parse(raw); } catch { return DEFAULT_FLEET; }
  }

  saveFleet(fleet: FleetVehicle[]) {
    localStorage.setItem("farmgo_fleet", JSON.stringify(fleet));
    this.notifyListeners();
  }

  addVehicle(vehicle: Omit<FleetVehicle, "id">): FleetVehicle {
    const fleet = this.getFleet();
    const newV: FleetVehicle = {
      ...vehicle,
      id: `v-${Date.now()}`
    };
    this.saveFleet([newV, ...fleet]);
    this.addNotification({
      targetRole: "admin",
      title: `🚜 New Vehicle Registered: ${newV.name}`,
      message: `Carrier ${newV.transporterName} registered ${newV.name} (Driver: ${newV.driver}).`
    });
    return newV;
  }

  updateVehicle(id: string, updates: Partial<FleetVehicle>) {
    const fleet = this.getFleet().map(v => v.id === id ? { ...v, ...updates } : v);
    this.saveFleet(fleet);
  }

  deleteVehicle(id: string) {
    const fleet = this.getFleet().filter(v => v.id !== id);
    this.saveFleet(fleet);
  }

  // --- ORDERS / SHIPMENTS ---
  getOrders(): LogisticsOrder[] {
    const raw = localStorage.getItem("farmgo_orders");
    if (!raw) {
      this.saveOrders(DEFAULT_ORDERS);
      return DEFAULT_ORDERS;
    }
    try { return JSON.parse(raw); } catch { return DEFAULT_ORDERS; }
  }

  saveOrders(orders: LogisticsOrder[]) {
    localStorage.setItem("farmgo_orders", JSON.stringify(orders));
    this.notifyListeners();
  }

  createBooking(data: {
    cropId?: string;
    cropName: string;
    cropCategory: string;
    farmerName: string;
    farmerPhone: string;
    weightKg: number;
    pickupLocation: string;
    destinationLocation: string;
    distanceKm: number;
    preservationStorage: string;
  }): LogisticsOrder {
    const orders = this.getOrders();
    const pricing = calculateTransportPrice(data.weightKg, data.distanceKm, data.preservationStorage);
    const newOrder: LogisticsOrder = {
      ...data,
      id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
      pricing,
      status: "BOOKED",
      createdAt: new Date().toISOString().replace("T", " ").substring(0, 16),
      updatedAt: new Date().toISOString().replace("T", " ").substring(0, 16),
      chatMessages: []
    };

    this.saveOrders([newOrder, ...orders]);
    this.addNotification({
      targetRole: "transporter",
      title: `🚚 New Ride Request: ${newOrder.cropName}`,
      message: `${newOrder.farmerName} requested transport for ${newOrder.weightKg} kg from ${newOrder.pickupLocation.split(",")[0]} to ${newOrder.destinationLocation.split(",")[0]}.`,
      orderId: newOrder.id
    });

    return newOrder;
  }

  updateOrderStatus(orderId: string, status: ShipmentStatus, extra?: Partial<LogisticsOrder>) {
    const orders = this.getOrders();
    const updated = orders.map(o => {
      if (o.id === orderId) {
        const next: LogisticsOrder = {
          ...o,
          ...extra,
          status,
          updatedAt: new Date().toISOString().replace("T", " ").substring(0, 16)
        };
        return next;
      }
      return o;
    });

    this.saveOrders(updated);

    const target = updated.find(o => o.id === orderId);
    if (target) {
      this.addNotification({
        targetRole: "farmer",
        targetUser: target.farmerName,
        title: `📦 Order ${orderId} Status Updated`,
        message: `Your shipment for ${target.cropName} is now: ${status.replace("_", " ")}.`,
        orderId
      });
    }
  }

  addChatMessage(orderId: string, message: Omit<ChatMessage, "id" | "timestamp">) {
    const orders = this.getOrders();
    const updated = orders.map(o => {
      if (o.id === orderId) {
        const msg: ChatMessage = {
          ...message,
          id: `msg-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        return {
          ...o,
          chatMessages: [...(o.chatMessages || []), msg]
        };
      }
      return o;
    });
    this.saveOrders(updated);
  }

  // --- NOTIFICATIONS ---
  getNotifications(): NotificationItem[] {
    const raw = localStorage.getItem("farmgo_notifications");
    if (!raw) {
      localStorage.setItem("farmgo_notifications", JSON.stringify(DEFAULT_NOTIFICATIONS));
      return DEFAULT_NOTIFICATIONS;
    }
    try { return JSON.parse(raw); } catch { return DEFAULT_NOTIFICATIONS; }
  }

  addNotification(item: Omit<NotificationItem, "id" | "timestamp" | "read">) {
    const notifications = this.getNotifications();
    const newN: NotificationItem = {
      ...item,
      id: `n-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      read: false
    };
    localStorage.setItem("farmgo_notifications", JSON.stringify([newN, ...notifications]));
    this.notifyListeners();
  }

  markNotificationRead(id: string) {
    const notifications = this.getNotifications().map(n => n.id === id ? { ...n, read: true } : n);
    localStorage.setItem("farmgo_notifications", JSON.stringify(notifications));
    this.notifyListeners();
  }

  // --- ADMIN & USERS ---
  getAdmins(): AdminAccount[] {
    const raw = localStorage.getItem("farmgo_admins");
    if (!raw) {
      localStorage.setItem("farmgo_admins", JSON.stringify(DEFAULT_ADMINS));
      return DEFAULT_ADMINS;
    }
    try { return JSON.parse(raw); } catch { return DEFAULT_ADMINS; }
  }

  saveAdmins(admins: AdminAccount[]) {
    localStorage.setItem("farmgo_admins", JSON.stringify(admins));
    this.notifyListeners();
  }

  updateAdminPassword(username: string, newPass: string) {
    const admins = this.getAdmins().map(a => 
      a.username.toLowerCase() === username.toLowerCase() ? { ...a, password: newPass } : a
    );
    this.saveAdmins(admins);
  }

  updateAdminStatus(username: string, status: "active" | "suspended") {
    const admins = this.getAdmins().map(a => 
      a.username.toLowerCase() === username.toLowerCase() ? { ...a, status } : a
    );
    this.saveAdmins(admins);
  }
}

export const farmgoStore = new FarmGoStore();
