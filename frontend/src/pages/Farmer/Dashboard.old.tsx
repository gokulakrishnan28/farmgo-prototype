import { useState, useEffect, useRef, useMemo } from "react";
import { Link } from "react-router-dom";
import { 
  Sprout, LogOut, Plus, MapPin, Package, ShieldCheck,
  Phone, TrendingUp, Sparkles, ArrowLeft, Download, Trash2, Award, DollarSign, Globe
} from "lucide-react";
import ChatbotWidget from "../../components/ChatbotWidget";
import PriceDiscoveryCard from "../../components/PriceDiscoveryCard";
import NetReturnCalculator from "../../components/NetReturnCalculator";
import LanguageModal, { type LanguageCode } from "../../components/LanguageModal";
import { farmgoStore } from "../../services/farmgoStore";
import { printFarmGoReceipt } from "../../utils/receiptGenerator";

const TN_LOCATIONS = [
  "Chennai Koyambedu Market (சென்னை கோயம்பேடு சந்தை)",
  "Coimbatore MGR Market (கோயம்புத்தூர் எம்.ஜி.ஆர் சந்தை)",
  "Madurai Mattuthavani (மதுரை மாட்டுத்தாவணி)",
  "Kanchipuram Uzhavar Sandai (காஞ்சிபுரம் உழவர் சந்தை)",
  "Pallavaram Uzhavar Sandai (பல்லாவரம் உழவர் சந்தை)",
  "Chengelpet Uzhavar Sandai (செங்கல்பட்டு உழவர் சந்தை)",
  "Tiruthani Uzhavar Sandai (திருத்தணி உழவர் சந்தை)",
  "Tiruvallur Uzhavar Sandai (திருவள்ளூர் உழவர் சந்தை)",
  "Ambattur Uzhavar Sandai (அம்பத்தூர் உழவர் சந்தை)",
  "Vellore Uzhavar Sandai (வேலூர் உழவர் சந்தை)",
  "Katpadi Uzhavar Sandai (காட்பாடி உழவர் சந்தை)",
  "Vaniyampadi Uzhavar Sandai (வாணியம்பாடி உழவர் சந்தை)",
  "Gudiyatham Uzhavar Sandai (குடியாத்தம் உழவர் சந்தை)",
  "Kathithapattarai Uzhavar Sandai (காதிதாப்பட்டறை உழவர் சந்தை)",
  "Arcot Uzhavar Sandai (ஆற்காடு உழவர் சந்தை)",
  "Ranipettai Uzhavar Sandai (இராணிப்பேட்டை உழவர் சந்தை)",
  "Tiruvannamalai Uzhavar Sandai (திருவண்ணாமலை உழவர் சந்தை)",
  "Polur Uzhavar Sandai (போளூர் உழவர் சந்தை)",
  "Arani Uzhavar Sandai (ஆரணி உழவர் சந்தை)",
  "Cheyyar Uzhavar Sandai (செய்யாறு உழவர் சந்தை)",
  "Cuddalore Uzhavar Sandai (கடலூர் உழவர் சந்தை)",
  "Chidambaram Uzhavar Sandai (சிதம்பரம் உழவர் சந்தை)",
  "Viruthachalam Uzhavar Sandai (விருத்தாசலம் உழவர் சந்தை)",
  "Panruti Uzhavar Sandai (பண்ருட்டி உழவர் சந்தை)",
  "Dindivanam Uzhavar Sandai (திண்டிவனம் உழவர் சந்தை)",
  "Villupuram Uzhavar Sandai (விழுப்புரம் உழவர் சந்தை)",
  "Kallakurichi Uzhavar Sandai (கள்ளக்குறிச்சி உழவர் சந்தை)",
  "Sooramangalam Uzhavar Sandai (சூரமங்கலம் உழவர் சந்தை)",
  "Ammapet Uzhavar Sandai (அம்மாபேட்டை உழவர் சந்தை)",
  "Athur Uzhavar Sandai (ஆத்தூர் உழவர் சந்தை)",
  "Thathakapatti Uzhavar Sandai (தாதகாப்பட்டி உழவர் சந்தை)",
  "Mettur Uzhavar Sandai (மேட்டூர் உழவர் சந்தை)",
  "Attayampatti Uzhavar Sandai (ஆட்டையாம்பட்டி உழவர் சந்தை)",
  "Hasthampatti Uzhavar Sandai (அஸ்தம்பட்டி உழவர் சந்தை)",
  "Namakkal Uzhavar Sandai (நாமக்கல் உழவர் சந்தை)",
  "Tiruchengode Uzhavar Sandai (திருச்செங்கோடு உழவர் சந்தை)",
  "Rasipuram Uzhavar Sandai (இராசிபுரம் உழவர் சந்தை)",
  "Kumarapalayam Uzhavar Sandai (குமாரபாளையம் உழவர் சந்தை)",
  "Dharmapuri Uzhavar Sandai (தர்மபுரி உழவர் சந்தை)",
  "Hosur Uzhavar Sandai (ஓசூர் உழவர் சந்தை)",
  "Krishnagiri Uzhavar Sandai (கிருஷ்ணகிரி உழவர் சந்தை)",
  "Kovai R.S.Puram Uzhavar Sandai (கோவை ஆர்.எஸ்.புரம் உழவர் சந்தை)",
  "Singanallur Uzhavar Sandai (சிங்கநல்லூர் உழவர் சந்தை)",
  "Pollachi Uzhavar Sandai (பொள்ளாச்சி உழவர் சந்தை)",
  "Udumalpet Uzhavar Sandai (உடுமலைப்பேட்டை உழவர் சந்தை)",
  "Tiruppur (North) Uzhavar Sandai (திருப்பூர் (வடக்கு) உழவர் சந்தை)",
  "Mettupalayam Uzhavar Sandai (மேட்டுப்பாளையம் உழவர் சந்தை)",
  "Tiruppur (South) Uzhavar Sandai (திருப்பூர் (தெற்கு) உழவர் சந்தை)",
  "Kurichi Uzhavar Sandai (குறிச்சி உழவர் சந்தை)",
  "Ooty Uzhavar Sandai (ஊட்டி உழவர் சந்தை)",
  "Coonoor Uzhavar Sandai (குன்னூர் உழவர் சந்தை)",
  "Erode Sampath nagar Uzhavar Sandai (ஈரோடு சம்பத் நகர் உழவர் சந்தை)",
  "Gobichettipalayam Uzhavar Sandai (கோபிசெட்டிபாளையம் உழவர் சந்தை)",
  "Sathyamangalam Uzhavar Sandai (சத்தியமங்கலம் உழவர் சந்தை)",
  "Dharapuram Uzhavar Sandai (தாராபுரம் உழவர் சந்தை)",
  "Tiruchi Anna nagar Uzhavar Sandai (திருச்சி அண்ணா நகர் உழவர் சந்தை)",
  "Tiruchi K.K nagar Uzhavar Sandai (திருச்சி கே.கே நகர் உழவர் சந்தை)",
  "Thuraiyur Uzhavar Sandai (துறையூர் உழவர் சந்தை)",
  "Manaparai Uzhavar Sandai (மணப்பாறை உழவர் சந்தை)",
  "Perambalur Uzhavar Sandai (பெரம்பலூர் உழவர் சந்தை)",
  "Ariyalur Uzhavar Sandai (அரியலூர் உழவர் சந்தை)",
  "Karur Uzhavar Sandai (கரூர் உழவர் சந்தை)",
  "Kulithalai Uzhavar Sandai (குளித்தலை உழவர் சந்தை)",
  "Velayuthampalayam Uzhavar Sandai (வேலாயுதம்பாளையம் உழவர் சந்தை)",
  "Thanjavur Uzhavar Sandai (தஞ்சாவூர் உழவர் சந்தை)",
  "Kumbakonam Uzhavar Sandai (கும்பகோணம் உழவர் சந்தை)",
  "Pattukottai Uzhavar Sandai (பட்டுக்கோட்டை உழவர் சந்தை)",
  "Mayiladuthurai Uzhavar Sandai (மயிலாடுதுறை உழவர் சந்தை)",
  "Nagapattinam Uzhavar Sandai (நாகப்பட்டினம் உழவர் சந்தை)",
  "Tiruthuraipoondi Uzhavar Sandai (திருத்துறைப்பூண்டி உழவர் சந்தை)",
  "Mannarkudi Uzhavar Sandai (மன்னார்குடி உழவர் சந்தை)",
  "Tiruvarur Uzhavar Sandai (திருவாரூர் உழவர் சந்தை)",
  "Pudukottai Uzhavar Sandai (புதுக்கோட்டை உழவர் சந்தை)",
  "Aranthangi Uzhavar Sandai (அறந்தாங்கி உழவர் சந்தை)",
  "Alangudi Uzhavar Sandai (ஆலங்குடி உழவர் சந்தை)",
  "Madurai Anna nagar Uzhavar Sandai (மதுரை அண்ணா நகர் உழவர் சந்தை)",
  "Chokkikulam Uzhavar Sandai (சொக்கிகுளம் உழவர் சந்தை)",
  "Palanganatham Uzhavar Sandai (பழங்காநத்தம் உழவர் சந்தை)",
  "Usilampatti Uzhavar Sandai (உசிலம்பட்டி உழவர் சந்தை)",
  "Tirumangalam Uzhavar Sandai (திருமங்கலம் உழவர் சந்தை)",
  "Melur Uzhavar Sandai (மேலூர் உழவர் சந்தை)",
  "Dindigul Uzhavar Sandai (திண்டுக்கல் உழவர் சந்தை)",
  "Palani Uzhavar Sandai (பழனி உழவர் சந்தை)",
  "Chinnalapatti Uzhavar Sandai (சின்னாளப்பட்டி உழவர் சந்தை)",
  "Theni Uzhavar Sandai (தேனி உழவர் சந்தை)",
  "Cumbum Uzhavar Sandai (கம்பம் உழவர் சந்தை)",
  "Bodi Uzhavar Sandai (போடிநாயக்கனூர் உழவர் சந்தை)",
  "Periyakulam Uzhavar Sandai (பெரியகுளம் உழவர் சந்தை)",
  "Sivagangai Uzhavar Sandai (சிவகங்கை உழவர் சந்தை)",
  "Devakottai Uzhavar Sandai (தேவகோட்டை உழவர் சந்தை)",
  "Karaikudi Uzhavar Sandai (காரைக்குடி உழவர் சந்தை)",
  "Aruppukottai Uzhavar Sandai (அருப்புக்கோட்டை உழவர் சந்தை)",
  "Rajapalayam Uzhavar Sandai (இராஜபாளையம் உழவர் சந்தை)",
  "Srivilliputhur Uzhavar Sandai (ஸ்ரீவில்லிபுத்தூர் உழவர் சந்தை)",
  "Viruthunagar Uzhavar Sandai (விருதுநகர் உழவர் சந்தை)",
  "Sivakasi Uzhavar Sandai (சிவகாசி உழவர் சந்தை)",
  "Sathur Uzhavar Sandai (சாத்தூர் உழவர் சந்தை)",
  "Ramanathapuram Uzhavar Sandai (இராமநாதபுரம் உழவர் சந்தை)",
  "Paramakudi Uzhavar Sandai (பரமக்குடி உழவர் சந்தை)",
  "Sankarankovil Uzhavar Sandai (சங்கரன்கோவில் உழவர் சந்தை)",
  "Palayamkottai Uzhavar Sandai (பாளையங்கோட்டை உழவர் சந்தை)",
  "Tenkasi Uzhavar Sandai (தென்காசி உழவர் சந்தை)",
  "Kandiyaperi Uzhavar Sandai (கண்டியபேரி உழவர் சந்தை)",
  "Tuticorin Uzhavar Sandai (தூத்துக்குடி உழவர் சந்தை)",
  "Kovilpatti Uzhavar Sandai (கோவில்பட்டி உழவர் சந்தை)",
  "Vadaseri Uzhavar Sandai (வடாசேரி உழவர் சந்தை)",
  "Myladi Uzhavar Sandai (மயிலாடி உழவர் சந்தை)"
];

const CROPS_BY_CATEGORY: Record<string, Array<{ name: string; tamil: string; img: string; emoji: string }>> = {
  Vegetables: [
    { name: "Tomato", tamil: "தக்காளி", img: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400&auto=format&fit=crop&q=80", emoji: "🍅" },
    { name: "Onion", tamil: "வெங்காயம்", img: "https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=400&auto=format&fit=crop&q=80", emoji: "🧅" },
    { name: "Potato", tamil: "உருளைக்கிழங்கு", img: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400&auto=format&fit=crop&q=80", emoji: "🥔" },
    { name: "Carrot", tamil: "கேரட்", img: "https://images.unsplash.com/photo-1582515073490-39981397c445?w=400&auto=format&fit=crop&q=80", emoji: "🥕" },
    { name: "Brinjal", tamil: "கத்திரிக்காய்", img: "https://images.unsplash.com/photo-1595855759920-86582396756a?w=400&auto=format&fit=crop&q=80", emoji: "🍆" },
    { name: "Ladyfinger", tamil: "வெண்டைக்காய்", img: "https://images.unsplash.com/photo-1425543103986-22abb7d7e8d2?w=400&auto=format&fit=crop&q=80", emoji: "🫛" },
    { name: "Drumstick", tamil: "முருங்கை", img: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&auto=format&fit=crop&q=80", emoji: "🌿" },
    { name: "Cucumber", tamil: "வெள்ளரிக்காய்", img: "https://images.unsplash.com/photo-1449300079323-02e209d9d3a6?w=400&auto=format&fit=crop&q=80", emoji: "🥒" },
    { name: "Cabbage", tamil: "முட்டைக்கோஸ்", img: "https://images.unsplash.com/photo-1594282486552-05b4d80fbb9f?w=400&auto=format&fit=crop&q=80", emoji: "🥬" },
    { name: "Other Veg", tamil: "மற்ற காய்கறிகள்", img: "https://images.unsplash.com/photo-1590779033100-9f60a05a013d?w=400&auto=format&fit=crop&q=80", emoji: "🥦" }
  ],
  Fruits: [
    { name: "Mango", tamil: "மாம்பழம்", img: "https://images.unsplash.com/photo-1553279768-865429fa0078?w=400&auto=format&fit=crop&q=80", emoji: "🥭" },
    { name: "Banana", tamil: "வாழைப்பழம்", img: "https://images.unsplash.com/photo-1528825871115-3581a5387919?w=400&auto=format&fit=crop&q=80", emoji: "🍌" },
    { name: "Coconut", tamil: "தேங்காய்", img: "https://images.unsplash.com/photo-1543362906-acfc16c67564?w=400&auto=format&fit=crop&q=80", emoji: "🥥" },
    { name: "Grapes", tamil: "திராட்சை", img: "https://images.unsplash.com/photo-1537640538966-79f369143f8f?w=400&auto=format&fit=crop&q=80", emoji: "🍇" },
    { name: "Papaya", tamil: "பப்பாளி", img: "https://images.unsplash.com/photo-1617112848923-cc2234396a8d?w=400&auto=format&fit=crop&q=80", emoji: "🍈" },
    { name: "Guava", tamil: "கொய்யா", img: "https://images.unsplash.com/photo-1536511132770-e5058c7e8c46?w=400&auto=format&fit=crop&q=80", emoji: "🍐" },
    { name: "Watermelon", tamil: "தர்பூசணி", img: "https://images.unsplash.com/photo-1563114773-84221bd62daa?w=400&auto=format&fit=crop&q=80", emoji: "🍉" },
    { name: "Pomegranate", tamil: "மாதுளை", img: "https://images.unsplash.com/photo-1541344999736-83eca272f6fc?w=400&auto=format&fit=crop&q=80", emoji: "🍎" },
    { name: "Jackfruit", tamil: "பலாப்பழம்", img: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&auto=format&fit=crop&q=80", emoji: "🍈" },
    { name: "Other Fruits", tamil: "மற்ற பழங்கள்", img: "https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=400&auto=format&fit=crop&q=80", emoji: "🍒" }
  ],
  Grains: [
    { name: "Ponni Rice", tamil: "பொன்னி அரிசி", img: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&auto=format&fit=crop&q=80", emoji: "🌾" },
    { name: "Paddy", tamil: "நெல் சாகுபடி", img: "https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?w=400&auto=format&fit=crop&q=80", emoji: "🌾" },
    { name: "Maize/Corn", tamil: "மக்காச்சோளம்", img: "https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=400&auto=format&fit=crop&q=80", emoji: "🌽" },
    { name: "Wheat", tamil: "கோதுமை", img: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&auto=format&fit=crop&q=80", emoji: "🌾" },
    { name: "Millets/Ragi", tamil: "கேழ்வரகு / ராகி", img: "https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=400&auto=format&fit=crop&q=80", emoji: "🥣" },
    { name: "Toor Dal", tamil: "துவரம் பருப்பு", img: "https://images.unsplash.com/photo-1515543904379-3d757afe72e4?w=400&auto=format&fit=crop&q=80", emoji: "🫘" },
    { name: "Groundnut", tamil: "நிலக்கடலை", img: "https://images.unsplash.com/photo-1567892336336-69d675662709?w=400&auto=format&fit=crop&q=80", emoji: "🥜" },
    { name: "Other Grains", tamil: "மற்ற தானியங்கள்", img: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&auto=format&fit=crop&q=80", emoji: "🌾" }
  ],
  Spices: [
    { name: "Turmeric", tamil: "மஞ்சள்", img: "https://images.unsplash.com/photo-1615529182904-14819c35db37?w=400&auto=format&fit=crop&q=80", emoji: "🟡" },
    { name: "Red Chilli", tamil: "சிவப்பு மிளகாய்", img: "https://images.unsplash.com/photo-1588252303782-cb80119abd6d?w=400&auto=format&fit=crop&q=80", emoji: "🌶️" },
    { name: "Ginger", tamil: "இஞ்சி", img: "https://images.unsplash.com/photo-1603048588665-791ca9571c9a?w=400&auto=format&fit=crop&q=80", emoji: "🫚" },
    { name: "Garlic", tamil: "பூண்டு", img: "https://images.unsplash.com/photo-1540148426945-6cf22a6b2383?w=400&auto=format&fit=crop&q=80", emoji: "🧄" },
    { name: "Cardamom", tamil: "ஏலக்காய்", img: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400&auto=format&fit=crop&q=80", emoji: "💚" },
    { name: "Black Pepper", tamil: "கருப்பு மிளகு", img: "https://images.unsplash.com/photo-1599909533731-0e5a0a702693?w=400&auto=format&fit=crop&q=80", emoji: "⚫" },
    { name: "Other Spices", tamil: "மற்ற மசாலா", img: "https://images.unsplash.com/photo-1532336414038-cf19250c5757?w=400&auto=format&fit=crop&q=80", emoji: "🧂" }
  ],
  Flowers: [
    { name: "Jasmine", tamil: "குண்டு மல்லிகை", img: "https://images.unsplash.com/photo-1592722212260-eb0c8742d4a2?w=400&auto=format&fit=crop&q=80", emoji: "🌸" },
    { name: "Rose", tamil: "சிவப்பு ரோஜா", img: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&auto=format&fit=crop&q=80", emoji: "🌹" },
    { name: "Marigold", tamil: "சாமந்தி பூ", img: "https://images.unsplash.com/photo-1597848212624-a19eb35e2651?w=400&auto=format&fit=crop&q=80", emoji: "🌼" },
    { name: "Lotus", tamil: "தாமரை பூ", img: "https://images.unsplash.com/photo-1508610048659-a06b669e3321?w=400&auto=format&fit=crop&q=80", emoji: "🪷" },
    { name: "Other Flowers", tamil: "மற்ற பூக்கள்", img: "https://images.unsplash.com/photo-1526047932273-341f2a7631f9?w=400&auto=format&fit=crop&q=80", emoji: "💐" }
  ],
  Others: [
    { name: "Sugarcane", tamil: "கரும்பு", img: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&auto=format&fit=crop&q=80", emoji: "🎋" },
    { name: "Cotton", tamil: "பருத்தி", img: "https://images.unsplash.com/photo-1603714228681-b39917d87d3e?w=400&auto=format&fit=crop&q=80", emoji: "☁️" },
    { name: "Cashew Nut", tamil: "முந்திரி", img: "https://images.unsplash.com/photo-1509358217973-885695ee9155?w=400&auto=format&fit=crop&q=80", emoji: "🥜" },
    { name: "Other Cargo", tamil: "மற்ற பயிர்கள்", img: "https://images.unsplash.com/photo-1574226516831-e1dff420e562?w=400&auto=format&fit=crop&q=80", emoji: "📦" }
  ]
};

interface GoogleMapProps {
  pickup: string;
  destination: string;
}

function GoogleMapComponent({ pickup, destination }: GoogleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";

    const initMap = () => {
      if (!mapRef.current) return;
      const google = (window as any).google;
      if (!google) return;

      const map = new google.maps.Map(mapRef.current, {
        center: { lat: 10.7905, lng: 78.7047 },
        zoom: 7,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        styles: [{ featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] }]
      });

      const directionsService = new google.maps.DirectionsService();
      const directionsRenderer = new google.maps.DirectionsRenderer({
        map: map,
        suppressMarkers: true,
        polylineOptions: { strokeColor: "#10b981", strokeWeight: 5, strokeOpacity: 0.85 }
      });

      const makePin = (color: string, label: string) => ({
        url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
          `<svg xmlns="http://www.w3.org/2000/svg" width="44" height="56" viewBox="0 0 44 56">
            <filter id="s"><feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="rgba(0,0,0,0.3)"/></filter>
            <path filter="url(#s)" d="M22 2C13.2 2 6 9.2 6 18c0 12 16 34 16 34s16-22 16-34C38 9.2 30.8 2 22 2z" fill="${color}"/>
            <circle cx="22" cy="18" r="9" fill="white" opacity="0.95"/>
            <text x="22" y="22" text-anchor="middle" font-size="10" font-weight="900" font-family="Arial" fill="${color}">${label}</text>
          </svg>`
        )}`,
        scaledSize: new google.maps.Size(44, 56),
        anchor: new google.maps.Point(22, 56)
      });

      const getLatLng = (addr: string) => {
        const lower = addr.toLowerCase();
        if (lower.includes("madurai")) return { lat: 9.9252, lng: 78.1198 };
        if (lower.includes("chennai") || lower.includes("koyambedu")) return { lat: 13.0732, lng: 80.1912 };
        if (lower.includes("coimbatore")) return { lat: 11.0168, lng: 76.9558 };
        if (lower.includes("salem")) return { lat: 11.6643, lng: 78.1460 };
        if (lower.includes("trichy") || lower.includes("tiruchirappalli") || lower.includes("gandhi market")) return { lat: 10.7905, lng: 78.7047 };
        if (lower.includes("erode")) return { lat: 11.3410, lng: 77.7172 };
        if (lower.includes("thanjavur")) return { lat: 10.7870, lng: 79.1378 };
        if (lower.includes("vellore")) return { lat: 12.9165, lng: 79.1325 };
        if (lower.includes("tiruvannamalai")) return { lat: 12.2253, lng: 79.0747 };
        if (lower.includes("cuddalore")) return { lat: 11.7480, lng: 79.7714 };
        if (lower.includes("villupuram")) return { lat: 11.9401, lng: 79.4861 };
        if (lower.includes("hosur")) return { lat: 12.7409, lng: 77.8253 };
        if (lower.includes("krishnagiri")) return { lat: 12.5186, lng: 78.2138 };
        if (lower.includes("dharmapuri")) return { lat: 12.1211, lng: 78.1582 };
        if (lower.includes("kanchipuram")) return { lat: 12.8342, lng: 79.7036 };
        if (lower.includes("tirunelveli")) return { lat: 8.7139, lng: 77.7567 };
        if (lower.includes("thoothukudi") || lower.includes("tuticorin")) return { lat: 8.7642, lng: 78.1348 };
        if (lower.includes("nagercoil") || lower.includes("kanyakumari")) return { lat: 8.1833, lng: 77.4119 };
        return { lat: 10.7905, lng: 78.7047 };
      };

      const originLatLng = getLatLng(pickup);
      const destLatLng = getLatLng(destination);

      new google.maps.Marker({
        position: originLatLng,
        map: map,
        icon: makePin("#10b981", "A"),
        title: `Pickup: ${pickup}`,
        zIndex: 10
      });

      new google.maps.Marker({
        position: destLatLng,
        map: map,
        icon: makePin("#ef4444", "B"),
        title: `Destination: ${destination}`,
        zIndex: 10
      });

      directionsService.route(
        { origin: originLatLng, destination: destLatLng, travelMode: google.maps.TravelMode.DRIVING },
        (result: any, status: any) => {
          if (status === google.maps.DirectionsStatus.OK) {
            directionsRenderer.setDirections(result);
          } else {
            new google.maps.Polyline({
              path: [originLatLng, destLatLng],
              geodesic: true,
              strokeColor: "#10b981",
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
      map.fitBounds(bounds, { top: 60, bottom: 60, left: 40, right: 40 });
    };

    if (!(window as any).google) {
      if (!document.getElementById("google-maps-script")) {
        const script = document.createElement("script");
        script.id = "google-maps-script";
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,geometry`;
        script.async = true;
        script.defer = true;
        script.onload = initMap;
        document.head.appendChild(script);
      }
    } else {
      initMap();
    }
  }, [pickup, destination]);

  return (
    <div className="relative w-full h-full min-h-[350px] rounded-2xl overflow-hidden">
      <div ref={mapRef} className="w-full h-full min-h-[350px]" />
      <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm rounded-xl px-3 py-2 shadow-md border border-slate-100 flex flex-col space-y-1 text-xs font-bold z-10">
        <div className="flex items-center space-x-2">
          <span className="h-3 w-3 rounded-full bg-emerald-500 flex-shrink-0" />
          <span className="text-slate-700 max-w-[160px] truncate">A: {pickup.split(" (")[0]}</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="h-3 w-3 rounded-full bg-red-500 flex-shrink-0" />
          <span className="text-slate-700 max-w-[160px] truncate">B: {destination.split(" (")[0]}</span>
        </div>
      </div>
    </div>
  );
}

// ── Comprehensive lat/lng map for all TN Uzhavar Sandai locations ──
const TN_LOCATION_COORDS: Record<string, { lat: number; lng: number }> = {
  "Chennai Koyambedu Market": { lat: 13.0732, lng: 80.1912 },
  "Coimbatore MGR Market": { lat: 11.0168, lng: 76.9558 },
  "Madurai Mattuthavani": { lat: 9.9252, lng: 78.1198 },
  "Kanchipuram Uzhavar Sandai": { lat: 12.8342, lng: 79.7036 },
  "Pallavaram Uzhavar Sandai": { lat: 12.9675, lng: 80.1491 },
  "Chengelpet Uzhavar Sandai": { lat: 12.6924, lng: 79.9752 },
  "Tiruthani Uzhavar Sandai": { lat: 13.1833, lng: 79.6167 },
  "Tiruvallur Uzhavar Sandai": { lat: 13.1431, lng: 79.9099 },
  "Ambattur Uzhavar Sandai": { lat: 13.0983, lng: 80.1666 },
  "Vellore Uzhavar Sandai": { lat: 12.9165, lng: 79.1325 },
  "Katpadi Uzhavar Sandai": { lat: 12.9710, lng: 79.1443 },
  "Vaniyambadi Uzhavar Sandai": { lat: 12.6801, lng: 78.6201 },
  "Gudiyatham Uzhavar Sandai": { lat: 12.9489, lng: 78.8741 },
  "Arcot Uzhavar Sandai": { lat: 12.9057, lng: 79.3163 },
  "Ranipettai Uzhavar Sandai": { lat: 12.9234, lng: 79.3329 },
  "Tiruvannamalai Uzhavar Sandai": { lat: 12.2253, lng: 79.0747 },
  "Polur Uzhavar Sandai": { lat: 12.5193, lng: 79.0418 },
  "Arani Uzhavar Sandai": { lat: 12.6665, lng: 79.2786 },
  "Cheyyar Uzhavar Sandai": { lat: 12.6559, lng: 79.5364 },
  "Cuddalore Uzhavar Sandai": { lat: 11.7480, lng: 79.7714 },
  "Chidambaram Uzhavar Sandai": { lat: 11.3990, lng: 79.6931 },
  "Viruthachalam Uzhavar Sandai": { lat: 11.5227, lng: 79.3122 },
  "Panruti Uzhavar Sandai": { lat: 11.7698, lng: 79.5548 },
  "Dindivanam Uzhavar Sandai": { lat: 11.8637, lng: 79.6540 },
  "Villupuram Uzhavar Sandai": { lat: 11.9401, lng: 79.4861 },
  "Kallakurichi Uzhavar Sandai": { lat: 11.7380, lng: 78.9595 },
  "Sooramangalam Uzhavar Sandai": { lat: 11.6790, lng: 78.1140 },
  "Ammapet Uzhavar Sandai": { lat: 11.6740, lng: 78.1460 },
  "Athur Uzhavar Sandai": { lat: 11.5720, lng: 78.5870 },
  "Mettur Uzhavar Sandai": { lat: 11.7899, lng: 77.8001 },
  "Attayampatti Uzhavar Sandai": { lat: 11.6150, lng: 78.0720 },
  "Hasthampatti Uzhavar Sandai": { lat: 11.6643, lng: 78.1460 },
  "Namakkal Uzhavar Sandai": { lat: 11.2189, lng: 78.1674 },
  "Tiruchengode Uzhavar Sandai": { lat: 11.3835, lng: 77.8934 },
  "Rasipuram Uzhavar Sandai": { lat: 11.4591, lng: 78.1740 },
  "Kumarapalayam Uzhavar Sandai": { lat: 11.4448, lng: 77.6892 },
  "Dharmapuri Uzhavar Sandai": { lat: 12.1211, lng: 78.1582 },
  "Hosur Uzhavar Sandai": { lat: 12.7409, lng: 77.8253 },
  "Krishnagiri Uzhavar Sandai": { lat: 12.5186, lng: 78.2138 },
  "Kovai R.S.Puram Uzhavar Sandai": { lat: 11.0030, lng: 76.9620 },
  "Singanallur Uzhavar Sandai": { lat: 10.9943, lng: 77.0190 },
  "Pollachi Uzhavar Sandai": { lat: 10.6587, lng: 77.0082 },
  "Udumalpet Uzhavar Sandai": { lat: 10.5800, lng: 77.2490 },
  "Tiruppur (North) Uzhavar Sandai": { lat: 11.1075, lng: 77.3398 },
  "Mettupalayam Uzhavar Sandai": { lat: 11.2981, lng: 76.9385 },
  "Tiruppur (South) Uzhavar Sandai": { lat: 11.0975, lng: 77.3298 },
  "Kurichi Uzhavar Sandai": { lat: 10.9840, lng: 76.9880 },
  "Ooty Uzhavar Sandai": { lat: 11.4102, lng: 76.6950 },
  "Coonoor Uzhavar Sandai": { lat: 11.3533, lng: 76.7942 },
  "Erode Sampath nagar Uzhavar Sandai": { lat: 11.3410, lng: 77.7172 },
  "Gobichettipalayam Uzhavar Sandai": { lat: 11.4547, lng: 77.4345 },
  "Sathyamangalam Uzhavar Sandai": { lat: 11.5027, lng: 77.2380 },
  "Dharapuram Uzhavar Sandai": { lat: 10.7357, lng: 77.5129 },
  "Tiruchi Anna nagar Uzhavar Sandai": { lat: 10.8050, lng: 78.6856 },
  "Tiruchi K.K nagar Uzhavar Sandai": { lat: 10.7950, lng: 78.7056 },
  "Thuraiyur Uzhavar Sandai": { lat: 11.1419, lng: 78.5936 },
  "Manaparai Uzhavar Sandai": { lat: 10.6105, lng: 78.4275 },
  "Perambalur Uzhavar Sandai": { lat: 11.2318, lng: 78.8793 },
  "Ariyalur Uzhavar Sandai": { lat: 11.1405, lng: 79.0765 },
  "Karur Uzhavar Sandai": { lat: 10.9601, lng: 78.0766 },
  "Kulithalai Uzhavar Sandai": { lat: 10.9347, lng: 78.4153 },
  "Thanjavur Uzhavar Sandai": { lat: 10.7870, lng: 79.1378 },
  "Kumbakonam Uzhavar Sandai": { lat: 10.9617, lng: 79.3788 },
  "Pattukottai Uzhavar Sandai": { lat: 10.4297, lng: 79.3178 },
  "Mayiladuthurai Uzhavar Sandai": { lat: 11.1037, lng: 79.6527 },
  "Nagapattinam Uzhavar Sandai": { lat: 10.7672, lng: 79.8449 },
  "Mannarkudi Uzhavar Sandai": { lat: 10.6673, lng: 79.8534 },
  "Tiruvarur Uzhavar Sandai": { lat: 10.7725, lng: 79.6343 },
  "Pudukottai Uzhavar Sandai": { lat: 10.3797, lng: 78.8201 },
  "Aranthangi Uzhavar Sandai": { lat: 10.1683, lng: 78.9905 },
  "Madurai Anna nagar Uzhavar Sandai": { lat: 9.9570, lng: 78.0805 },
  "Usilampatti Uzhavar Sandai": { lat: 9.9661, lng: 77.4903 },
  "Tirumangalam Uzhavar Sandai": { lat: 9.8198, lng: 77.9864 },
  "Melur Uzhavar Sandai": { lat: 10.0462, lng: 78.3370 },
  "Dindigul Uzhavar Sandai": { lat: 10.3673, lng: 77.9803 },
  "Palani Uzhavar Sandai": { lat: 10.4469, lng: 77.5240 },
  "Chinnalapatti Uzhavar Sandai": { lat: 10.4930, lng: 77.7130 },
  "Theni Uzhavar Sandai": { lat: 10.0103, lng: 77.4770 },
  "Cumbum Uzhavar Sandai": { lat: 9.7317, lng: 77.2826 },
  "Periyakulam Uzhavar Sandai": { lat: 10.1186, lng: 77.5400 },
  "Sivagangai Uzhavar Sandai": { lat: 9.8475, lng: 78.4806 },
  "Devakottai Uzhavar Sandai": { lat: 9.9502, lng: 78.8247 },
  "Karaikudi Uzhavar Sandai": { lat: 10.0763, lng: 78.7762 },
  "Aruppukottai Uzhavar Sandai": { lat: 9.5096, lng: 78.0969 },
  "Rajapalayam Uzhavar Sandai": { lat: 9.4535, lng: 77.5583 },
  "Srivilliputhur Uzhavar Sandai": { lat: 9.4940, lng: 77.6289 },
  "Viruthunagar Uzhavar Sandai": { lat: 9.5861, lng: 77.9040 },
  "Sivakasi Uzhavar Sandai": { lat: 9.4547, lng: 77.7979 },
  "Ramanathapuram Uzhavar Sandai": { lat: 9.3729, lng: 78.8308 },
  "Paramakudi Uzhavar Sandai": { lat: 9.5458, lng: 78.5958 },
  "Sankarankovil Uzhavar Sandai": { lat: 9.1698, lng: 77.5534 },
  "Palayamkottai Uzhavar Sandai": { lat: 8.7139, lng: 77.7567 },
  "Tenkasi Uzhavar Sandai": { lat: 8.9597, lng: 77.3151 },
  "Tuticorin Uzhavar Sandai": { lat: 8.7642, lng: 78.1348 },
  "Kovilpatti Uzhavar Sandai": { lat: 9.1752, lng: 77.8700 },
  "Vadaseri Uzhavar Sandai": { lat: 8.1833, lng: 77.4119 },
};

// Helper: find nearest TN location key to a given lat/lng
function findNearestLocation(lat: number, lng: number, locations: string[]): string {
  let minDist = Infinity;
  let nearest = locations[0];
  for (const loc of locations) {
    const key = Object.keys(TN_LOCATION_COORDS).find(k => loc.startsWith(k));
    if (!key) continue;
    const coord = TN_LOCATION_COORDS[key];
    const d = Math.sqrt((coord.lat - lat) ** 2 + (coord.lng - lng) ** 2);
    if (d < minDist) { minDist = d; nearest = loc; }
  }
  return nearest;
}

interface MapPickerProps {
  title: string;
  currentValue: string;
  allLocations: string[];
  onSelect: (loc: string) => void;
  onClose: () => void;
  isTamil: boolean;
}

function MapLocationPicker({ title, currentValue, allLocations, onSelect, onClose, isTamil }: MapPickerProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [gpsStatus, setGpsStatus] = useState<"idle" | "loading" | "found" | "error">("idle");
  const [gpsLocation, setGpsLocation] = useState<string>("");
  const [selectedLoc, setSelectedLoc] = useState(currentValue);

  useEffect(() => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";

    const initPickerMap = () => {
      if (!mapRef.current) return;
      const google = (window as any).google;
      if (!google) return;

      const map = new google.maps.Map(mapRef.current, {
        center: { lat: 10.9, lng: 78.4 },
        zoom: 7,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        styles: [{ featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] }]
      });

      const infoWindow = new google.maps.InfoWindow();

      // Place a marker for every known location
      allLocations.forEach((loc) => {
        const key = Object.keys(TN_LOCATION_COORDS).find(k => loc.startsWith(k));
        if (!key) return;
        const coord = TN_LOCATION_COORDS[key];
        const isCurrent = loc === selectedLoc;

        const markerSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="36" viewBox="0 0 28 36">
          <path d="M14 1C7.9 1 3 5.9 3 12c0 8.5 11 23 11 23s11-14.5 11-23C25 5.9 20.1 1 14 1z" fill="${isCurrent ? '#10b981' : '#3b82f6'}" stroke="white" stroke-width="1.5"/>
          <circle cx="14" cy="12" r="5" fill="white" opacity="0.9"/>
        </svg>`;

        const marker = new google.maps.Marker({
          position: coord,
          map,
          title: loc.split(" (")[0],
          icon: {
            url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(markerSvg)}`,
            scaledSize: new google.maps.Size(isCurrent ? 36 : 28, isCurrent ? 46 : 36),
            anchor: new google.maps.Point(isCurrent ? 18 : 14, isCurrent ? 46 : 36)
          },
          zIndex: isCurrent ? 100 : 1
        });

        marker.addListener("click", () => {
          infoWindow.setContent(`
            <div style="padding:8px 12px;font-family:system-ui;min-width:160px">
              <p style="font-weight:900;font-size:13px;color:#0f172a;margin:0 0 4px">${loc.split(" (")[0]}</p>
              ${loc.includes("(") ? `<p style="font-size:10px;color:#64748b;margin:0 0 8px">${loc.match(/\(([^)]+)\)/)?.[1] || ""}</p>` : ""}
              <button onclick="window.__farmgo_pick('${loc.replace(/'/g, "\\'")}')"
                style="background:#10b981;color:white;border:none;border-radius:8px;padding:6px 14px;font-size:11px;font-weight:900;cursor:pointer;width:100%">
                ✓ ${isTamil ? "இந்த சந்தையைத் தேர்வு செய்" : "Select this Market"}
              </button>
            </div>
          `);
          infoWindow.open(map, marker);
        });
      });

      // Global callback for InfoWindow button clicks
      (window as any).__farmgo_pick = (loc: string) => {
        setSelectedLoc(loc);
        infoWindow.close();
      };
    };

    if (!(window as any).google) {
      if (!document.getElementById("google-maps-script")) {
        const script = document.createElement("script");
        script.id = "google-maps-script";
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,geometry`;
        script.async = true;
        script.defer = true;
        script.onload = initPickerMap;
        document.head.appendChild(script);
      } else {
        // Script tag exists, wait for it
        const wait = setInterval(() => {
          if ((window as any).google) { clearInterval(wait); initPickerMap(); }
        }, 200);
      }
    } else {
      initPickerMap();
    }

    return () => { delete (window as any).__farmgo_pick; };
  }, []);

  const handleGPS = () => {
    if (!navigator.geolocation) {
      setGpsStatus("error");
      return;
    }
    setGpsStatus("loading");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const nearest = findNearestLocation(pos.coords.latitude, pos.coords.longitude, allLocations);
        setGpsStatus("found");
        setGpsLocation(nearest);
        setSelectedLoc(nearest);
      },
      () => setGpsStatus("error"),
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-3">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl flex flex-col overflow-hidden max-h-[92vh]">

        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-500 to-green-600 px-6 py-4 flex items-center justify-between flex-shrink-0">
          <div>
            <p className="text-[10px] font-black text-emerald-100 uppercase tracking-wider">
              {isTamil ? "📍 வரைபடத்தில் சந்தை தேர்வு" : "📍 Pick Market on Map"}
            </p>
            <h3 className="text-white font-black text-base">{title}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="bg-white/20 hover:bg-white/30 text-white font-black w-9 h-9 rounded-xl flex items-center justify-center text-lg cursor-pointer border-0 transition-all"
          >
            ✕
          </button>
        </div>

        {/* GPS Access Bar */}
        <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 flex items-center gap-3 flex-shrink-0">
          <button
            type="button"
            onClick={handleGPS}
            disabled={gpsStatus === "loading"}
            className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 text-white text-xs font-black px-4 py-2.5 rounded-xl cursor-pointer border-0 transition-all shadow-sm"
          >
            {gpsStatus === "loading" ? (
              <><span className="animate-spin">⟳</span> {isTamil ? "இடம் கண்டறிகிறது..." : "Detecting location..."}</>
            ) : (
              <><span>📡</span> {isTamil ? "என் இடத்தை அணுக" : "Access My Location"}</>
            )}
          </button>

          {gpsStatus === "found" && (
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
              ✓ {gpsLocation.split(" (")[0]}
            </span>
          )}
          {gpsStatus === "error" && (
            <span className="text-xs font-bold text-red-600 bg-red-50 border border-red-200 px-3 py-1.5 rounded-xl">
              {isTamil ? "⚠ இடம் கிடைக்கவில்லை" : "⚠ Location access denied"}
            </span>
          )}

          <span className="ml-auto text-[10px] text-slate-400 font-semibold hidden sm:block">
            {isTamil ? "கீழே உள்ள சந்தைகளை கிளிக் செய்யவும்" : "Click any market pin on map below"}
          </span>
        </div>

        {/* Map */}
        <div ref={mapRef} className="flex-1 min-h-[320px]" />

        {/* Selected + Confirm */}
        <div className="px-5 py-4 border-t border-slate-100 bg-white flex items-center justify-between gap-3 flex-shrink-0">
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-0.5">
              {isTamil ? "தேர்ந்தெடுக்கப்பட்ட சந்தை" : "Selected Market"}
            </p>
            <p className="text-sm font-black text-slate-900 truncate">
              {selectedLoc ? selectedLoc.split(" (")[0] : (isTamil ? "எந்த ஒரு சந்தையையும் தேர்வு செய்யவும்" : "Tap any market pin to select")}
            </p>
            {selectedLoc && selectedLoc.includes("(") && (
              <p className="text-[10px] text-slate-400 font-semibold truncate">
                {selectedLoc.match(/\(([^)]+)\)/)?.[1]}
              </p>
            )}
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-600 font-bold text-xs cursor-pointer border-0"
            >
              {isTamil ? "ரத்து" : "Cancel"}
            </button>
            <button
              type="button"
              onClick={() => { onSelect(selectedLoc); onClose(); }}
              disabled={!selectedLoc}
              className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-black text-xs cursor-pointer border-0 shadow-sm transition-all"
            >
              {isTamil ? "✓ உறுதிப்படுத்து" : "✓ Confirm Selection"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function FarmerDashboard() {
  const [currentLang, setCurrentLang] = useState<LanguageCode>(() => {
    const saved = sessionStorage.getItem("language_selected") || localStorage.getItem("language_selected");
    if (saved && ["en", "ta", "hi", "mr"].includes(saved)) {
      return saved as LanguageCode;
    }
    return "en";
  });

  const [showLanguageModal, setShowLanguageModal] = useState(false);

  const [isTamil, setIsTamil] = useState(() => currentLang === "ta");

  useEffect(() => {
    setIsTamil(currentLang === "ta");
  }, [currentLang]);

  const handleSelectLanguage = (lang: LanguageCode) => {
    setCurrentLang(lang);
    sessionStorage.setItem("language_selected", lang);
    localStorage.setItem("language_selected", lang);
  };

  const langNames: Record<LanguageCode, string> = {
    en: "English",
    ta: "தமிழ்",
    hi: "हिन्दी",
    mr: "मराठी",
  };

  // Mode: "dashboard" | "wizard" | "live_tracking"
  const [viewMode, setViewMode] = useState<"dashboard" | "wizard" | "live_tracking">(() => {
    const hasCategory = sessionStorage.getItem("farmer_category");
    if (hasCategory) {
      sessionStorage.removeItem("farmer_category"); // Clear so browser reload on /farmer lands on dashboard
      return "wizard";
    }
    return "dashboard";
  });

  // Wizard step state (Step 1: Category & Crop, Step 2: Payload, Step 3: Vehicle Prediction, Step 4: Confirm)
  const [wizardStep, setWizardStep] = useState<number>(1);

  const [waitingForDriver, setWaitingForDriver] = useState(false);
  const [trackingProgress, setTrackingProgress] = useState(6);
  const [mapTab, setMapTab] = useState<"vector" | "google">("vector");

  // Subscribe to farmgoStore single source of truth
  const [crops, setCrops] = useState<any[]>(() => farmgoStore.getCrops());
  const [orders, setOrders] = useState<any[]>(() => farmgoStore.getOrders());

  useEffect(() => {
    const sync = () => {
      setCrops(farmgoStore.getCrops());
      setOrders(farmgoStore.getOrders());
    };
    sync();
    window.addEventListener("farmgo_store_change", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("farmgo_store_change", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  // Wizard state values
  const [selectedCategory, setSelectedCategory] = useState<"Vegetables" | "Fruits" | "Grains" | "Spices" | "Flowers" | "Others">(() => {
    const saved = sessionStorage.getItem("farmer_category");
    if (saved && ["Vegetables","Fruits","Grains","Spices","Flowers","Others"].includes(saved)) {
      return saved as any;
    }
    return "Vegetables";
  });

  const [cropName, setCropName] = useState("");
  const [harvestWeight, setHarvestWeight] = useState("1500");
  const [weightUnit, setWeightUnit] = useState("kg");
  // Use valid TN_LOCATIONS entries for default state
  const [pickupLocation, setPickupLocation] = useState("Dindigul Uzhavar Sandai (திண்டுக்கல் உழவர் சந்தை)");
  const [destinationLocation, setDestinationLocation] = useState("Chennai Koyambedu Market (சென்னை கோயம்பேடு சந்தை)");

  // Add Crop Listing modal state
  const [showAddCropModal, setShowAddCropModal] = useState(false);
  const [newCropName, setNewCropName] = useState("");
  const [newCropCategory, setNewCropCategory] = useState("Vegetables");
  const [newCropQty, setNewCropQty] = useState("1000");
  const [newCropPrice, setNewCropPrice] = useState("45");

  // Map location picker state: which field is open ("pickup" | "destination" | null)
  const [mapPickerTarget, setMapPickerTarget] = useState<"pickup" | "destination" | null>(null);

  // Same Location validation — never allow pickup === destination
  useEffect(() => {
    if (!pickupLocation || !destinationLocation) return;
    if (pickupLocation === destinationLocation) {
      // Find a different location for destination
      const alternative = TN_LOCATIONS.find(loc => loc !== pickupLocation);
      if (alternative) setDestinationLocation(alternative);
    }
  }, [pickupLocation]);

  // Also guard when destination changes to match pickup
  useEffect(() => {
    if (!pickupLocation || !destinationLocation) return;
    if (destinationLocation === pickupLocation) {
      const alternative = TN_LOCATIONS.find(loc => loc !== destinationLocation);
      if (alternative) setPickupLocation(alternative);
    }
  }, [destinationLocation]);

  const [selectedCarrierId, setSelectedCarrierId] = useState<string>("carrier-3");

  // Real-time automatic live price discovery calculations based on crop name & harvest weight
  const livePriceData = useMemo(() => {
    const rawWeight = parseFloat(harvestWeight) || 1500;
    const qtyKg = weightUnit === "tons" ? rawWeight * 1000 : weightUnit === "quintals" ? rawWeight * 100 : rawWeight;
    const qtyQuintals = (qtyKg / 100).toFixed(1);
    const qtyTons = (qtyKg / 1000).toFixed(2);

    const crop = (cropName || "Tomato").trim();
    const lowerCrop = crop.toLowerCase();

    let bestMandi = "Chennai Koyambedu Market";
    let enamCode = "TN-KOY-001";
    let pricePerKg = 46;
    let pricePerQuintal = 4600;
    let minMaxRange = "₹4,100 – ₹4,850 / quintal";
    let demandScore = "High";
    let arrivalVolume = "145 Tonnes";
    let insight = `Selling ${crop} in ${bestMandi} (${enamCode}) yields peak market returns. Urban demand is 18% above supply.`;

    if (lowerCrop.includes("banana") || lowerCrop.includes("வாழை")) {
      bestMandi = "Trichy Gandhi Market";
      enamCode = "TN-TRI-003";
      pricePerKg = 58;
      pricePerQuintal = 5800;
      minMaxRange = "₹5,200 – ₹6,100 / quintal";
      arrivalVolume = "85 Tonnes";
      insight = "Bananas command peak wholesale rates in Trichy & Chennai mandis.";
    } else if (lowerCrop.includes("mango") || lowerCrop.includes("மாம்பழம்")) {
      bestMandi = "Salem Uzhavar Sandai";
      enamCode = "TN-SLM-009";
      pricePerKg = 110;
      pricePerQuintal = 11000;
      minMaxRange = "₹9,500 – ₹11,800 / quintal";
      arrivalVolume = "42 Tonnes";
      insight = "Malgoa and Alphonso mangoes fetch top auction bids in Salem and Chennai mandis.";
    } else if (lowerCrop.includes("turmeric") || lowerCrop.includes("மஞ்சள்")) {
      bestMandi = "Erode Turmeric Market Hub";
      enamCode = "TN-ERD-004";
      pricePerKg = 145;
      pricePerQuintal = 14500;
      minMaxRange = "₹13,200 – ₹15,200 / quintal";
      arrivalVolume = "210 Tonnes";
      insight = "Erode is India's leading turmeric trading hub on eNAM.";
    } else if (lowerCrop.includes("onion") || lowerCrop.includes("வெங்காயம்")) {
      bestMandi = "Dindigul Central Market";
      enamCode = "TN-DIN-007";
      pricePerKg = 38;
      pricePerQuintal = 3800;
      minMaxRange = "₹3,400 – ₹4,100 / quintal";
      arrivalVolume = "190 Tonnes";
      insight = "Dindigul onion auctions are operating with steady urban demand.";
    } else if (lowerCrop.includes("potato") || lowerCrop.includes("உருளை")) {
      bestMandi = "Mettupalayam Market";
      enamCode = "TN-MET-008";
      pricePerKg = 32;
      pricePerQuintal = 3200;
      minMaxRange = "₹2,900 – ₹3,500 / quintal";
      arrivalVolume = "160 Tonnes";
      insight = "Nilgiri potato harvests fetch premium rates at Mettupalayam hub.";
    }

    const grossRevenue = qtyKg * pricePerKg;
    const estTransport = 3200;
    const apmcFee = grossRevenue * 0.015;
    const netReturn = Math.max(0, grossRevenue - estTransport - apmcFee);

    return {
      crop,
      qtyKg,
      qtyQuintals,
      qtyTons,
      bestMandi,
      enamCode,
      pricePerKg,
      pricePerQuintal,
      minMaxRange,
      demandScore,
      arrivalVolume,
      grossRevenue,
      estTransport,
      apmcFee,
      netReturn,
      insight,
    };
  }, [cropName, harvestWeight, weightUnit]);

  const applyRecommendedMarket = (marketNameOrSearch: string) => {
    if (!marketNameOrSearch) return;
    const targetLower = marketNameOrSearch.toLowerCase();
    const exactMatch = TN_LOCATIONS.find(loc => loc.toLowerCase().includes(targetLower));
    if (!exactMatch) return;
    if (exactMatch === pickupLocation) {
      const alternative = TN_LOCATIONS.find(loc => loc !== pickupLocation && loc !== destinationLocation);
      if (alternative) setDestinationLocation(alternative);
      return;
    }
    setDestinationLocation(exactMatch);
  };



  const [predictions, setPredictions] = useState<any>({
    vehicle: "Mini Pickup Truck (Tata Ace)",
    temp: "Ambient",
    capacity: "1 – 1.5 Tons",
    suited: "Small farms, local markets, vegetables",
    distance: 165,
    cost: 3200,
    storageType: "Normal Storage"
  });

  const [carriers, setCarriers] = useState<any[]>([
    { id: "carrier-1", name: "Mini Pickup (Tata Ace)", driver: "Senthil Kumar", mob: "+91 94441 23451", rating: 4.8, count: 25, limit: "0.5 – 1 Ton", type: "Ambient", fare: 2400, ai: true, emoji: "🛻" },
    { id: "carrier-2", name: "Bolero Pickup", driver: "Rajan M.", mob: "+91 98432 11987", rating: 4.6, count: 40, limit: "1 – 1.5 Tons", type: "Ambient", fare: 3200, ai: false, emoji: "🚐" },
    { id: "carrier-3", name: "Reefer Cold-Mini Truck", driver: "Anbu Selvan", mob: "+91 97867 34512", rating: 4.9, count: 18, limit: "1 – 2 Tons", type: "Cold Chain (2–8°C)", fare: 5800, ai: false, emoji: "🧊" },
    { id: "carrier-4", name: "Tempo (Eicher 12 ft)", driver: "Karthik R.", mob: "+91 99401 55673", rating: 4.5, count: 32, limit: "2 – 4 Tons", type: "Ambient", fare: 4500, ai: false, emoji: "🚛" },
    { id: "carrier-5", name: "Large Truck (Ashok Leyland)", driver: "Muthu Kumar", mob: "+91 94875 22341", rating: 4.7, count: 55, limit: "5 – 10 Tons", type: "Ambient", fare: 8200, ai: false, emoji: "🚚" },
  ]);

  useEffect(() => {
    sessionStorage.removeItem("farmer_category");
    const query = new URLSearchParams({
      crop_name: cropName || "Tomato",
      category: selectedCategory,
      weight: harvestWeight || "1500",
      unit: weightUnit,
      pickup: pickupLocation,
      destination: destinationLocation
    }).toString();

    const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";
    fetch(`${API_BASE}/api/v1/ai/logistics-prediction?${query}`)
      .then(res => res.json())
      .then(data => {
        if (data && data.predicted_vehicle) {
          setPredictions({
            vehicle: data.predicted_vehicle,
            temp: data.predicted_temp,
            capacity: data.capacity_limit,
            suited: data.best_suited_for,
            distance: data.distance_km,
            cost: data.estimated_cost,
            storageType: data.storage_type
          });

          const profiles = [
            { name: "Mini Pickup (Tata Ace)", driver: "Senthil Kumar", mob: "+91 94441 23451", rating: 4.8, count: 25, type: "Ambient", baseFare: 2400, limit: "0.5 – 1 Ton", emoji: "🛻" },
            { name: "Bolero Pickup", driver: "Rajan M.", mob: "+91 98432 11987", rating: 4.6, count: 40, type: "Ambient", baseFare: 3200, limit: "1 – 1.5 Tons", emoji: "🚐" },
            { name: "Reefer Cold-Mini Truck", driver: "Anbu Selvan", mob: "+91 97867 34512", rating: 4.9, count: 18, type: "Cold Chain (2–8°C)", baseFare: 5800, limit: "1 – 2 Tons", emoji: "🧊" },
            { name: "Tempo (Eicher 12 ft)", driver: "Karthik R.", mob: "+91 99401 55673", rating: 4.5, count: 32, type: "Ambient", baseFare: 4500, limit: "2 – 4 Tons", emoji: "🚛" },
            { name: "Large Truck (Ashok Leyland)", driver: "Muthu Kumar", mob: "+91 94875 22341", rating: 4.7, count: 55, type: "Ambient", baseFare: 8200, limit: "5 – 10 Tons", emoji: "🚚" }
          ];

          const multiplier = (data.distance_km || 165.0) / 165.0;
          const carriersList = profiles.map((p, idx) => {
            const isAI = p.name === data.predicted_vehicle;
            return {
              id: `carrier-${idx + 1}`,
              name: p.name,
              driver: p.driver,
              mob: p.mob,
              rating: p.rating,
              count: p.count,
              limit: p.limit,
              type: p.type,
              fare: Math.round(p.baseFare * multiplier),
              ai: isAI,
              emoji: p.emoji
            };
          }).sort((a, b) => (a.ai ? -1 : b.ai ? 1 : a.fare - b.fare));

          setCarriers(carriersList);
          const matched = carriersList.find(c => c.ai);
          if (matched) setSelectedCarrierId(matched.id);
        }
      })
      .catch(err => {
        console.warn("Backend API query warning:", err);
      });
  }, [cropName, selectedCategory, harvestWeight, weightUnit, pickupLocation, destinationLocation]);

  useEffect(() => {
    if (viewMode !== "live_tracking") return;
    const interval = setInterval(() => {
      setTrackingProgress((prev: number) => (prev >= 100 ? 100 : prev + 1));
    }, 1200);
    return () => clearInterval(interval);
  }, [viewMode]);

  const chosenCarrier = carriers.find((c: any) => c.id === selectedCarrierId) || carriers[0];

  const handleFinishBooking = () => {
    const finalWeight = parseFloat(harvestWeight) * (weightUnit === "tons" ? 1000 : 1);
    const farmerName = sessionStorage.getItem("user_name") || "Gokulakrishnan K";
    const farmerPhone = sessionStorage.getItem("user_phone") || "+91 98765 43210";
    const finalCropName = cropName || (selectedCategory === "Vegetables" ? "Tomato" : "Mango");

    // Add crop listing if not already present
    farmgoStore.addCrop({
      farmerName,
      name: finalCropName,
      category: selectedCategory,
      quantity_kg: finalWeight,
      price_per_kg: selectedCategory === "Vegetables" ? 35 : 75,
      status: "pending_transport",
      district: pickupLocation.split(" ")[0] || "Madurai"
    });

    // Create central booking order
    farmgoStore.createBooking({
      cropName: finalCropName,
      cropCategory: selectedCategory,
      farmerName,
      farmerPhone,
      weightKg: finalWeight,
      pickupLocation,
      destinationLocation,
      distanceKm: predictions.distance || 165,
      preservationStorage: predictions.storageType || "Normal Storage"
    });

    setWaitingForDriver(true);

    setTimeout(() => {
      setWaitingForDriver(false);
      setViewMode("live_tracking");
      setTrackingProgress(12);
    }, 3000);
  };

  const handleAddCropSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCropName) return;
    const farmerName = sessionStorage.getItem("user_name") || "Gokulakrishnan K";

    farmgoStore.addCrop({
      farmerName,
      name: newCropName,
      category: newCropCategory as any,
      quantity_kg: parseFloat(newCropQty) || 500,
      price_per_kg: parseFloat(newCropPrice) || 40,
      status: "available",
      district: "Madurai"
    });

    setShowAddCropModal(false);
    setNewCropName("");
  };

  const downloadReceipt = (order: any) => {
    printFarmGoReceipt(order);
  };

  const getTruckCoords = (progress: number) => {
    const points = [
      { x: 130, y: 310 },
      { x: 210, y: 240 },
      { x: 170, y: 190 },
      { x: 260, y: 90 }
    ];
    if (progress <= 0) return points[0];
    if (progress >= 100) return points[points.length - 1];
    const segmentPercentage = 100 / (points.length - 1);
    const segmentIndex = Math.floor(progress / segmentPercentage);
    const segmentProgress = (progress % segmentPercentage) / segmentPercentage;
    const start = points[segmentIndex];
    const end = points[segmentIndex + 1];
    return {
      x: start.x + (end.x - start.x) * segmentProgress,
      y: start.y + (end.y - start.y) * segmentProgress
    };
  };

  const truckCoords = getTruckCoords(trackingProgress);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      
      {/* Floating Glassmorphic Header — matches Landing Page */}
      <header className="mx-auto max-w-7xl w-[92%] sm:w-[95%] mt-4 sticky top-4 z-50 bg-white/70 backdrop-blur-xl border border-white/40 rounded-2xl sm:rounded-full px-6 h-16 flex items-center justify-between shadow-lg shadow-emerald-950/5">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setViewMode("dashboard")}
            className="flex items-center no-underline cursor-pointer border-0 bg-transparent"
          >
            <span className="text-3xl font-black tracking-tighter">
              <span className="text-emerald-500 font-black">farm</span><span className="text-slate-900 font-black">Go</span>
            </span>
          </button>
          <span className="bg-emerald-50 text-emerald-700 text-xs font-black px-3 py-1 rounded-full border border-emerald-200/60 hidden sm:inline-flex items-center space-x-1">
            <Sprout className="h-3.5 w-3.5" />
            <span>{isTamil ? "விவசாயி தளம்" : "Farmer Portal"}</span>
          </span>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Platform label */}
          <span className="text-sm text-slate-500 hidden lg:inline font-semibold">
            {isTamil ? "விவசாய தளவாட தளம்" : "Agricultural Logistics Platform"}
          </span>
          <div className="h-4 w-px bg-slate-200 hidden lg:inline" />

          {viewMode !== "dashboard" && (
            <button
              onClick={() => setViewMode("dashboard")}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-3.5 py-2 rounded-xl transition-all text-xs flex items-center space-x-1.5 cursor-pointer border-0"
            >
              <span>🏠</span>
              <span>{isTamil ? "டாஷ்போர்டு" : "Dashboard"}</span>
            </button>
          )}

          <button
            onClick={() => { setViewMode("wizard"); setWizardStep(1); }}
            className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-4 py-2 rounded-xl transition-all text-xs flex items-center space-x-1.5 cursor-pointer border-0 shadow-sm shadow-emerald-200"
          >
            <Plus className="h-4 w-4" />
            <span>{isTamil ? "புதிய பதிவு" : "Book Logistics"}</span>
          </button>

          {/* Direct 1-Click 4-Language Selector */}
          <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200 text-xs">
            <button
              type="button"
              onClick={() => handleSelectLanguage("en")}
              className={`px-2.5 py-1 rounded-xl font-extrabold transition-all cursor-pointer border-0 ${
                currentLang === "en" ? "bg-slate-900 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              English
            </button>
            <button
              type="button"
              onClick={() => handleSelectLanguage("ta")}
              className={`px-2.5 py-1 rounded-xl font-extrabold transition-all cursor-pointer border-0 ${
                currentLang === "ta" ? "bg-emerald-600 text-white shadow-xs" : "text-slate-600 hover:text-emerald-700"
              }`}
            >
              தமிழ்
            </button>
            <button
              type="button"
              onClick={() => handleSelectLanguage("hi")}
              className={`px-2.5 py-1 rounded-xl font-extrabold transition-all cursor-pointer border-0 ${
                currentLang === "hi" ? "bg-orange-600 text-white shadow-xs" : "text-slate-600 hover:text-orange-700"
              }`}
            >
              हिन्दी
            </button>
            <button
              type="button"
              onClick={() => handleSelectLanguage("mr")}
              className={`px-2.5 py-1 rounded-xl font-extrabold transition-all cursor-pointer border-0 ${
                currentLang === "mr" ? "bg-purple-600 text-white shadow-xs" : "text-slate-600 hover:text-purple-700"
              }`}
            >
              मराठी
            </button>
          </div>

          <Link
            to="/"
            className="border border-slate-200 text-slate-500 hover:text-slate-900 font-bold px-3 py-2 rounded-xl transition-all text-xs flex items-center space-x-1.5 no-underline"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>{isTamil ? "வெளியேறு" : "Sign Out"}</span>
          </Link>
        </div>
      </header>

      {/* DRIVER SEARCHING MODAL OVERLAY */}
      {waitingForDriver && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center space-y-6 shadow-2xl animate-fadeIn border border-slate-100">
            <div className="relative h-20 w-20 mx-auto flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-emerald-100 animate-ping opacity-75" />
              <div className="relative bg-emerald-500 text-white h-16 w-16 rounded-full flex items-center justify-center text-3xl shadow-lg">
                🚚
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-black text-slate-900">
                {isTamil ? "அருகிலுள்ள ஓட்டுநர்களை தேடுகிறது..." : "Broadcasting to Nearby Transporters..."}
              </h3>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                {cropName || "Harvest"} ({harvestWeight} {weightUnit}) · {pickupLocation.split(" ")[0]} ➔ {destinationLocation.split(" ")[0]}
              </p>
            </div>

            <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 text-left space-y-2 text-xs font-semibold text-slate-700">
              <div className="flex justify-between">
                <span className="text-slate-400">Assigned Driver</span>
                <span className="font-bold text-emerald-700">{chosenCarrier.driver}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Carrier Vehicle</span>
                <span className="font-bold text-slate-900">{chosenCarrier.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Estimated Fare</span>
                <span className="font-bold text-emerald-700">₹{chosenCarrier.fare.toLocaleString()}</span>
              </div>
            </div>

            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full animate-pulse w-full" />
            </div>
          </div>
        </div>
      )}

      {/* VIEW 1: DASHBOARD MAIN VIEW */}
      {viewMode === "dashboard" && (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-8 animate-fadeIn">
          
          {/* Hero Logistics Booking Card */}
          <div className="bg-gradient-to-br from-emerald-500 via-green-600 to-emerald-700 rounded-3xl shadow-xl overflow-hidden text-white relative">
            <div className="grid grid-cols-1 lg:grid-cols-2">
              <div className="p-8 lg:p-10 flex flex-col justify-between space-y-6 relative z-10">
                <div className="space-y-3">
                  <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-md text-white text-xs font-extrabold px-3.5 py-1.5 rounded-full uppercase tracking-wider">
                    <Sprout className="h-4 w-4" />
                    <span>{isTamil ? "AI மூலம் உடனடி சரக்கு பொருத்தம்" : "AI Logistics Matcher"}</span>
                  </div>
                  <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
                    {sessionStorage.getItem("user_name") 
                      ? (isTamil ? `வணக்கம், ${sessionStorage.getItem("user_name")}! 🌾` : `Welcome, ${sessionStorage.getItem("user_name")}! 🌾`)
                      : (isTamil ? "வேகமான விவசாய சரக்கு போக்குவரத்து" : "Need Quick Crop Logistics?")}
                  </h1>
                  <p className="text-sm text-emerald-100 font-medium max-w-lg leading-relaxed">
                    {isTamil
                      ? "உங்கள் மாவட்டத்தைச் சேர்ந்த சந்தையைத் தேர்வு செய்து AI பரிந்துரைக்கும் சிறந்த வாகனத்தை உடனே பதிவு செய்யுங்கள்."
                      : "Pick your pickup hub and target market to book AI-matched reefer & ambient trucks instantly."}
                  </p>
                </div>

                {/* Direct Selector Bar */}
                <div className="space-y-3 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase tracking-wider text-emerald-100">
                        {isTamil ? "புறப்பாட்டு இடம்" : "Pickup Hub"}
                      </label>
                      <select
                        value={pickupLocation}
                        onChange={(e) => setPickupLocation(e.target.value)}
                        className="w-full bg-white text-slate-900 font-bold text-xs p-3 rounded-xl outline-none shadow-sm cursor-pointer"
                      >
                        {TN_LOCATIONS.map((loc) => (
                          <option key={loc} value={loc}>{loc}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase tracking-wider text-emerald-100">
                        {isTamil ? "சேருமிடம் (சந்தை)" : "Target Market"}
                      </label>
                      <select
                        value={destinationLocation}
                        onChange={(e) => setDestinationLocation(e.target.value)}
                        className="w-full bg-white text-slate-900 font-bold text-xs p-3 rounded-xl outline-none shadow-sm cursor-pointer truncate"
                      >
                        {TN_LOCATIONS.map((loc) => (
                          <option key={loc} value={loc}>{loc}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setViewMode("wizard");
                        setWizardStep(1);
                      }}
                      className="w-full bg-white hover:bg-emerald-50 text-emerald-900 font-black py-3.5 px-6 rounded-2xl text-xs sm:text-sm flex items-center justify-center space-x-2 transition-all cursor-pointer border-0 shadow-md shadow-emerald-900/20 hover:scale-[1.01]"
                    >
                      <Plus className="h-4 w-4 text-emerald-600" />
                      <span>{isTamil ? "+ பயிர் தளவாட பதிவு செய்ய →" : "+ Book Crop Logistics →"}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Side Map Preview */}
              <div className="relative h-72 lg:h-auto min-h-[300px]">
                <GoogleMapComponent pickup={pickupLocation} destination={destinationLocation} />
              </div>
            </div>
          </div>

          {/* Farmer KPI Overview Stats Bar (SIH Requirement #3A) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Total Crop Value</p>
                <p className="text-xl font-black text-slate-900 mt-1">₹52,500</p>
                <span className="text-[10px] text-emerald-600 font-bold">{crops.length} Listed Lots</span>
              </div>
              <div className="bg-emerald-50 text-emerald-600 p-3 rounded-2xl">
                <Package className="h-6 w-6" />
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Active Buyer Offers</p>
                <p className="text-xl font-black text-blue-600 mt-1">3 Offers</p>
                <span className="text-[10px] text-blue-600 font-bold">2 High Match (92%)</span>
              </div>
              <div className="bg-blue-50 text-blue-600 p-3 rounded-2xl">
                <Award className="h-6 w-6" />
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Best Offered Price</p>
                <p className="text-xl font-black text-purple-600 mt-1">₹38.0 / kg</p>
                <span className="text-[10px] text-purple-600 font-bold">+18% vs Local APMC</span>
              </div>
              <div className="bg-purple-50 text-purple-600 p-3 rounded-2xl">
                <TrendingUp className="h-6 w-6" />
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Est. Net Return</p>
                <p className="text-xl font-black text-emerald-600 mt-1">₹49,500</p>
                <span className="text-[10px] text-emerald-600 font-bold">After Transport</span>
              </div>
              <div className="bg-emerald-50 text-emerald-600 p-3 rounded-2xl">
                <DollarSign className="h-6 w-6" />
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Market Demand</p>
                <p className="text-sm font-black text-amber-600 mt-1">High Demand 🔥</p>
                <span className="text-[10px] text-slate-500 font-semibold">+12.8% 7-day trend</span>
              </div>
              <div className="bg-amber-50 text-amber-600 p-3 rounded-2xl">
                <ShieldCheck className="h-6 w-6" />
              </div>
            </div>
          </div>

          {/* SIH 2026 Core Feature 1: AI Price Discovery & Trend Dashboard */}
          <PriceDiscoveryCard
            cropName={cropName || "Tomato (தக்காளி)"}
            category={selectedCategory}
            quantityKg={Number(harvestWeight) || 1500}
            currentPrice={35.0}
            predictedPrice={39.5}
            predictedDays={7}
            demandScore="High"
            confidence="High (92%)"
            recommendation={isTamil 
              ? "குளிர்பதன சேமிப்பு வசதி இருந்தால் பயிரை 3-5 நாட்கள் வரை வைத்திருந்து விற்கலாம். நகர்ப்புற சந்தைகளில் வரத்து குறைவதால் +12.8% விலை உயர வாய்ப்புள்ளது."
              : "Consider holding your harvest for 3–5 days if cool storage is available. Market arrival rates are dropping in urban mandis, driving an expected +12.8% price increase."}
            explanationBullets={[
              "Urban APMC mandis report 18% lower daily crop arrival.",
              "Retail demand score remains high (+24% week-on-week).",
              "Transit cost to primary market is minimal (₹2.1/kg).",
              "Quality grade A commands a +₹4.5/kg premium over standard grade."
            ]}
          />

          {/* SIH 2026 Core Feature 2: Expected Net Return Comparator */}
          <NetReturnCalculator
            cropName={cropName || "Tomato"}
            quantityKg={Number(harvestWeight) || 1500}
          />

          {/* Section: My Listed Harvests */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-xl font-black text-slate-900 flex items-center space-x-2">
                  <Package className="h-5 w-5 text-emerald-500" />
                  <span>{isTamil ? "எனது பயிர் பட்டியல்கள்" : "My Listed Crops"}</span>
                </h2>
                <p className="text-xs text-slate-500 font-medium mt-1">
                  {isTamil ? "அறுவடை செய்யப்பட்ட பயிர்களின் விவரங்கள்" : "Manage your harvested commodities & direct buyers"}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowAddCropModal(true)}
                className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold px-4 py-2.5 rounded-2xl text-xs flex items-center space-x-2 transition-all cursor-pointer border border-emerald-200"
              >
                <Plus className="h-4 w-4" />
                <span>{isTamil ? "+ புதிய பயிர் சேர்" : "+ Add New Crop"}</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-[11px] font-black text-slate-400 uppercase tracking-wider">
                    <th className="py-3 px-4">Crop Name</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4 text-right">Quantity</th>
                    <th className="py-3 px-4 text-right">Price / kg</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
                  {crops.map((crop) => (
                    <tr key={crop.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 px-4 font-black text-slate-900">{crop.name}</td>
                      <td className="py-4 px-4 text-slate-500">{crop.category}</td>
                      <td className="py-4 px-4 text-right font-bold">{crop.quantity_kg.toLocaleString()} kg</td>
                      <td className="py-4 px-4 text-right font-black text-emerald-600">₹{crop.price_per_kg}</td>
                      <td className="py-4 px-4 text-center">
                        <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          crop.status === "available" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" :
                          crop.status === "pending_transport" ? "bg-amber-50 text-amber-700 border border-amber-200" :
                          "bg-slate-100 text-slate-600"
                        }`}>
                          {crop.status.replace("_", " ")}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            type="button"
                            onClick={() => {
                              setCropName(crop.name);
                              setSelectedCategory(crop.category as any);
                              setHarvestWeight(crop.quantity_kg.toString());
                              setWeightUnit("kg");
                              setViewMode("wizard");
                              setWizardStep(2);
                            }}
                            className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-3 py-1.5 rounded-xl text-[11px] transition-all cursor-pointer border-0 shadow-sm"
                          >
                            Book Transport
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`Delete crop listing for "${crop.name}"?`)) {
                                farmgoStore.deleteCrop(crop.id);
                              }
                            }}
                            className="bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold p-1.5 rounded-xl text-[11px] transition-all cursor-pointer border border-rose-200"
                            title="Delete Crop"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section: Logistics Orders */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <div>
              <h2 className="text-xl font-black text-slate-900 flex items-center space-x-2">
                <MapPin className="h-5 w-5 text-emerald-500" />
                <span>{isTamil ? "சரக்கு மற்றும் போக்குவரத்து பட்டியல்" : "Active Logistics & Shipments"}</span>
              </h2>
            </div>

            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order.id} className="border border-slate-150 rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:border-emerald-200 transition-all bg-white shadow-sm">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="bg-slate-100 text-slate-600 text-[10px] font-black px-2 py-0.5 rounded-md">{order.id}</span>
                      <span className="font-extrabold text-slate-900 text-sm">{order.cropName}</span>
                    </div>
                    <p className="text-xs text-slate-500 font-semibold">
                      {order.pickup} ➔ {order.destination}
                    </p>
                    <p className="text-[11px] text-slate-400 font-medium">
                      Driver: {order.transporterName || "Searching for available driver..."}
                    </p>
                  </div>

                  <div className="flex items-center space-x-3 self-end md:self-center">
                    <button
                      type="button"
                      onClick={() => downloadReceipt(order)}
                      className="border border-slate-200 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 font-bold px-3 py-2 rounded-xl text-xs transition-all cursor-pointer flex items-center space-x-1"
                    >
                      <Download className="h-3.5 w-3.5" />
                      <span>{isTamil ? "ரசீது" : "Receipt"}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setViewMode("live_tracking")}
                      className="bg-slate-900 hover:bg-emerald-600 text-white font-bold px-4 py-2 rounded-xl text-xs transition-all cursor-pointer border-0 shadow-sm"
                    >
                      📍 Track Dispatch
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </main>
      )}

      {/* VIEW 2: STEP-BY-STEP IN-PLACE LOGISTICS WIZARD */}
      {viewMode === "wizard" && (
        <main className="max-w-4xl mx-auto px-4 py-8 flex-1 w-full animate-fadeIn space-y-6">
          
          {/* Top Progress Bar & Back to Dashboard */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                if (wizardStep > 1) {
                  setWizardStep(prev => prev - 1);
                } else {
                  setViewMode("dashboard");
                }
              }}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-3.5 py-2 rounded-xl transition-all text-xs flex items-center space-x-1.5 cursor-pointer border-0"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>{isTamil ? "பின்செல்க" : "Back"}</span>
            </button>

            {/* Stepper Dots */}
            <div className="flex items-center space-x-2">
              {[
                { step: 1, label: isTamil ? "வகை/பயிர்" : "Crop" },
                { step: 2, label: isTamil ? "விவரங்கள்" : "Details" },
                { step: 3, label: isTamil ? "வாகனம்" : "Vehicle" },
                { step: 4, label: isTamil ? "உறுதிப்படுத்து" : "Confirm" }
              ].map((s) => (
                <div key={s.step} className="flex items-center space-x-1.5">
                  <button
                    type="button"
                    onClick={() => setWizardStep(s.step)}
                    className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-black transition-all cursor-pointer border-0 ${
                      wizardStep >= s.step ? "bg-emerald-500 text-white shadow-sm" : "bg-slate-100 text-slate-400"
                    }`}
                  >
                    {s.step}
                  </button>
                  <span className={`text-xs font-bold hidden sm:inline ${wizardStep === s.step ? "text-emerald-700" : "text-slate-400"}`}>
                    {s.label}
                  </span>
                  {s.step < 4 && <span className="text-slate-300 mx-1">/</span>}
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setViewMode("dashboard")}
              className="text-slate-400 hover:text-slate-700 font-bold text-xs border border-slate-200 px-3 py-2 rounded-xl transition-all cursor-pointer"
            >
              ✕ Exit Wizard
            </button>
          </div>

          {/* WIZARD STEP 1: SELECT CATEGORY & CROP */}
          {wizardStep === 1 && (
            <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden p-6 sm:p-8 space-y-6 animate-fadeIn">
              <div className="text-center space-y-2 max-w-xl mx-auto">
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full">
                  Step 1 of 4
                </span>
                <h2 className="text-2xl font-black text-slate-900">
                  {isTamil ? "பயிர் வகையைத் தேர்வு செய்யவும்" : "What crop are you transporting?"}
                </h2>
                <p className="text-xs text-slate-500 font-medium">
                  {isTamil
                    ? "பயிரைத் தேர்வு செய்யவும் — ஃபார்ம்கோ AI அதற்கு ஏற்ற வாகனத்தைக் கணிக்கும்."
                    : "Select a category & tap any crop card below to open harvest details immediately."}
                </p>
              </div>

              {/* Category Pills */}
              <div className="flex flex-wrap justify-center gap-2 pt-2">
                {([
                  { key: "Vegetables", emoji: "🥦", en: "Vegetables", ta: "காய்கறிகள்" },
                  { key: "Fruits", emoji: "🥭", en: "Fruits", ta: "பழங்கள்" },
                  { key: "Grains", emoji: "🌾", en: "Grains", ta: "தானியங்கள்" },
                  { key: "Spices", emoji: "🌶️", en: "Spices", ta: "மசாலா" },
                  { key: "Flowers", emoji: "🌸", en: "Flowers", ta: "பூக்கள்" },
                  { key: "Others", emoji: "📦", en: "Others", ta: "மற்றவை" },
                ] as const).map((cat) => (
                  <button
                    key={cat.key}
                    type="button"
                    onClick={() => setSelectedCategory(cat.key as any)}
                    className={`flex flex-col items-center px-4 py-2.5 rounded-2xl font-black text-xs transition-all cursor-pointer border leading-tight ${
                      selectedCategory === cat.key
                        ? "bg-emerald-500 text-white border-emerald-500 shadow-md shadow-emerald-200 scale-105"
                        : "bg-slate-50 text-slate-600 border-slate-200 hover:border-emerald-300 hover:bg-slate-100"
                    }`}
                  >
                    <span className="text-base">{cat.emoji}</span>
                    <span>{isTamil ? cat.ta : cat.en}</span>
                  </button>
                ))}
              </div>

              {/* Crop Photo Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3 pt-2">
                {(CROPS_BY_CATEGORY[selectedCategory] || CROPS_BY_CATEGORY["Vegetables"]).map((c) => {
                  const isSelected = cropName === c.name;
                  return (
                    <button
                      key={c.name}
                      type="button"
                      onClick={() => {
                        setCropName(c.name);
                        setWizardStep(2);
                      }}
                      className={`rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center overflow-hidden group ${
                        isSelected
                          ? "border-emerald-500 bg-emerald-50 ring-2 ring-emerald-500/30 shadow-md scale-[1.03]"
                          : "border-slate-200 bg-white hover:border-emerald-400 hover:shadow-md hover:scale-[1.02]"
                      }`}
                    >
                      {/* Square image area */}
                      <div className="w-full aspect-square bg-slate-100 flex items-center justify-center overflow-hidden relative">
                        <span className="absolute inset-0 flex items-center justify-center text-3xl select-none pointer-events-none z-0">{c.emoji}</span>
                        <img
                          src={c.img}
                          alt={c.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 relative z-10"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.visibility = "hidden";
                          }}
                        />
                      </div>
                      {/* Label area */}
                      <div className="px-2 py-2 w-full">
                        <p className="font-black text-slate-900 text-xs truncate">{isTamil ? c.tamil : c.name}</p>
                        <p className="text-[10px] text-slate-400 font-semibold truncate">{isTamil ? c.name : c.tamil}</p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Manual Crop Entry / Direct Next CTA */}
              <div className="pt-3 border-t border-slate-100">
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <div className="flex-1 w-full">
                    <input
                      type="text"
                      value={cropName}
                      onChange={(e) => setCropName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && cropName.trim()) {
                          e.preventDefault();
                          setWizardStep(2);
                        }
                      }}
                      placeholder={isTamil ? "அல்லது பயிர் பெயரை உள்ளிடவும்..." : "Or type crop name manually (e.g., Mango, Tomato, Paddy)..."}
                      className="w-full border border-slate-200 focus:border-emerald-500 rounded-2xl px-4 py-3.5 text-xs font-bold outline-none"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (!cropName.trim()) {
                        const defaultCrop = (CROPS_BY_CATEGORY[selectedCategory] || CROPS_BY_CATEGORY["Vegetables"])[0]?.name || "Tomato";
                        setCropName(defaultCrop);
                      }
                      setWizardStep(2);
                    }}
                    className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-600 text-white font-black py-3.5 px-8 rounded-2xl text-xs flex items-center justify-center space-x-2 transition-all cursor-pointer border-0 shadow-md shadow-emerald-100"
                  >
                    <span>{isTamil ? "அடுத்து: விவரங்கள் உள்ளிடுக →" : "Next: Enter Harvest Details →"}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* WIZARD STEP 2: HARVEST DETAILS & LOCATIONS */}
          {wizardStep === 2 && (
            <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden p-6 sm:p-8 space-y-6 animate-fadeIn">

              {/* Banner */}
              <div className="bg-gradient-to-r from-emerald-500 to-green-600 text-white p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
                <div className="flex items-center space-x-3">
                  <div className="bg-white/20 p-3 rounded-xl text-2xl">📦</div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-100">
                      {isTamil ? "படி 2 / 4 — அறுவடை விவரங்கள்" : "Step 2 of 4 — Harvest Details"}
                    </span>
                    <h2 className="text-xl font-black">
                      {cropName || selectedCategory} {isTamil ? "தளவாட பதிவு" : "Logistics Booking"}
                    </h2>
                  </div>
                </div>
              </div>

              {/* ── 1. CROP CATEGORY + CROP GRID (FIRST) ── */}
              <div className="border border-slate-200 rounded-2xl p-5 space-y-4 bg-slate-50/50">

                {/* Section header */}
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <p className="text-xs font-black text-slate-700 uppercase tracking-wider">
                    {isTamil ? "🌾 பயிர் வகை மற்றும் பயிர் தேர்வு" : "🌾 Select Category & Crop"}
                  </p>
                  {cropName && (
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-3 py-1 rounded-full flex items-center gap-1">
                      ✓ {isTamil ? "தேர்வு:" : "Picked:"} {cropName}
                    </span>
                  )}
                </div>

                {/* Category pills — click to filter the crop grid */}
                <div className="flex flex-wrap gap-2">
                  {([
                    { key: "Vegetables", emoji: "🥦", en: "Vegetables", ta: "காய்கறிகள்" },
                    { key: "Fruits",     emoji: "🥭", en: "Fruits",     ta: "பழங்கள்" },
                    { key: "Grains",     emoji: "🌾", en: "Grains",     ta: "தானியங்கள்" },
                    { key: "Spices",     emoji: "🌶️", en: "Spices",     ta: "மசாலா" },
                    { key: "Flowers",    emoji: "🌸", en: "Flowers",    ta: "பூக்கள்" },
                    { key: "Others",     emoji: "📦", en: "Others",     ta: "மற்றவை" },
                  ] as const).map((cat) => (
                    <button
                      key={cat.key}
                      type="button"
                      onClick={() => setSelectedCategory(cat.key as any)}
                      className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-black text-xs transition-all cursor-pointer border ${
                        selectedCategory === cat.key
                          ? "bg-emerald-500 text-white border-emerald-500 shadow-sm scale-105"
                          : "bg-white text-slate-600 border-slate-200 hover:border-emerald-300 hover:bg-emerald-50"
                      }`}
                    >
                      <span className="text-sm">{cat.emoji}</span>
                      <span>{isTamil ? cat.ta : cat.en}</span>
                    </button>
                  ))}
                </div>

                {/* Crop grid — shows ONLY crops of the selected category */}
                <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-7 gap-2">
                  {(CROPS_BY_CATEGORY[selectedCategory] || CROPS_BY_CATEGORY["Vegetables"]).map((c) => {
                    const isSelected = cropName === c.name;
                    return (
                      <button
                        key={c.name}
                        type="button"
                        onClick={() => setCropName(c.name)}
                        title={c.name}
                        className={`rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center overflow-hidden group ${
                          isSelected
                            ? "border-emerald-500 bg-emerald-50 ring-2 ring-emerald-500/30 shadow-md scale-[1.05]"
                            : "border-slate-200 bg-white hover:border-emerald-400 hover:shadow-sm hover:scale-[1.02]"
                        }`}
                      >
                        {/* Square image */}
                        <div className="w-full aspect-square bg-slate-100 flex items-center justify-center overflow-hidden relative">
                          <span className="absolute inset-0 flex items-center justify-center text-2xl select-none pointer-events-none z-0">{c.emoji}</span>
                          <img
                            src={c.img}
                            alt={c.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 relative z-10"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.visibility = "hidden";
                            }}
                          />
                        </div>
                        {/* Label */}
                        <div className="px-1 py-1.5 w-full text-center">
                          <p className="font-black text-slate-900 text-[10px] truncate leading-tight">
                            {isTamil ? c.tamil : c.name}
                          </p>
                          <p className="text-[9px] text-slate-400 font-semibold truncate leading-tight">
                            {isTamil ? c.name : c.tamil}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* ── 2. HARVEST DETAILS FORM (BELOW CATEGORIES) ── */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Crop Name */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                    {isTamil ? "பயிர் பொருட்டின் பெயர்" : "Crop Commodity Name"}
                  </label>
                  <input
                    type="text"
                    value={cropName}
                    onChange={(e) => setCropName(e.target.value)}
                    placeholder={isTamil ? "எ.கா. மல்கோவா மாம்பழம், பொன்னி அரிசி..." : "e.g. Malgoa Mango, Ponni Rice..."}
                    className="w-full border border-slate-200 focus:border-emerald-500 rounded-2xl p-3.5 text-xs font-bold outline-none"
                  />
                </div>

                {/* Weight */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                    {isTamil ? "அறுவடை எடை" : "Harvest Weight Payload"}
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      value={harvestWeight}
                      onChange={(e) => setHarvestWeight(e.target.value)}
                      className="flex-1 border border-slate-200 focus:border-emerald-500 rounded-2xl p-3.5 text-xs font-bold outline-none"
                    />
                    <select
                      value={weightUnit}
                      onChange={(e) => setWeightUnit(e.target.value)}
                      className="bg-slate-100 border border-slate-200 rounded-2xl px-4 text-xs font-bold text-slate-700 outline-none cursor-pointer"
                    >
                      <option value="kg">கிலோ / kg</option>
                      <option value="tons">டன் / tons</option>
                    </select>
                  </div>
                </div>

                {/* Pickup Location */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                    {isTamil ? "எடுக்கும் இடம் (மூல மையம்)" : "Pickup Location (Origin Hub)"}
                  </label>
                  <select
                    value={pickupLocation}
                    onChange={(e) => setPickupLocation(e.target.value)}
                    className="w-full border border-slate-200 focus:border-emerald-500 rounded-2xl p-3.5 text-xs font-bold text-slate-900 outline-none cursor-pointer"
                  >
                    {TN_LOCATIONS.map((loc) => (
                      <option key={loc} value={loc}>{loc}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setMapPickerTarget("pickup")}
                    className="flex items-center gap-1.5 text-emerald-600 hover:text-emerald-800 font-bold text-[10px] mt-1 cursor-pointer border-0 bg-transparent p-0 underline underline-offset-2"
                  >
                    📍 {isTamil ? "வரைபடத்தில் சந்தை தேர்வு செய்க" : "Pick Pickup Hub on Map"}
                  </button>
                </div>

                {/* Destination Market */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                    {isTamil ? "சந்தை இலக்கு" : "Destination Market"}
                  </label>
                  <select
                    value={destinationLocation}
                    onChange={(e) => setDestinationLocation(e.target.value)}
                    className="w-full border border-slate-200 focus:border-emerald-500 rounded-2xl p-3.5 text-xs font-bold text-slate-900 outline-none cursor-pointer"
                  >
                    {TN_LOCATIONS.map((loc) => (
                      <option key={loc} value={loc}>{loc}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setMapPickerTarget("destination")}
                    className="flex items-center gap-1.5 text-blue-600 hover:text-blue-800 font-bold text-[10px] mt-1 cursor-pointer border-0 bg-transparent p-0 underline underline-offset-2"
                  >
                    🗺️ {isTamil ? "வரைபடத்தில் சந்தை தேர்வு செய்க" : "Pick Destination Market on Map"}
                  </button>
                </div>
              </div>

              {/* ── 3. REAL-TIME AUTOMATIC eNAM LIVE PRICE DISCOVERY CARD ── */}
              <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 text-white rounded-3xl p-6 shadow-xl space-y-4 border border-slate-800 animate-fadeIn">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
                  <div className="flex items-center space-x-3">
                    <div className="bg-emerald-500/20 text-emerald-400 p-2.5 rounded-2xl border border-emerald-500/30">
                      <Sparkles className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400">
                        {isTamil ? "நேரலை eNAM & AGMARKNET சந்தை பகுப்பாய்வு" : "Live eNAM & AGMARKNET Market Analysis"}
                      </span>
                      <h3 className="text-base sm:text-lg font-black text-white">
                        {livePriceData.crop} · {livePriceData.qtyKg.toLocaleString()} kg ({livePriceData.qtyTons} Tons / {livePriceData.qtyQuintals} Quintals)
                      </h3>
                    </div>
                  </div>

                  <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-mono font-bold px-3 py-1 rounded-full">
                    {livePriceData.enamCode}
                  </span>
                </div>

                {/* Real-time KPI Stats Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="bg-slate-800/80 border border-slate-700/60 p-3.5 rounded-2xl">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Best Mandi Market</span>
                    <div className="text-xs sm:text-sm font-black text-emerald-400 mt-1 truncate">{livePriceData.bestMandi}</div>
                    <span className="text-[9px] text-slate-400 font-medium">Top eNAM Auction Bids</span>
                  </div>

                  <div className="bg-slate-800/80 border border-slate-700/60 p-3.5 rounded-2xl">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Modal Quintal Price</span>
                    <div className="text-base font-black text-white mt-1">₹{livePriceData.pricePerKg}/kg</div>
                    <span className="text-[10px] text-emerald-400 font-bold">₹{livePriceData.pricePerQuintal.toLocaleString()}/quintal</span>
                  </div>

                  <div className="bg-slate-800/80 border border-slate-700/60 p-3.5 rounded-2xl">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Gross Batch Value</span>
                    <div className="text-base font-black text-amber-400 mt-1">
                      ₹{livePriceData.grossRevenue.toLocaleString()}
                    </div>
                    <span className="text-[9px] text-slate-400">Total Unadjusted Revenue</span>
                  </div>

                  <div className="bg-emerald-950/70 border border-emerald-700/60 p-3.5 rounded-2xl">
                    <span className="text-[10px] font-bold text-emerald-300 uppercase">Est. Net Return</span>
                    <div className="text-base font-black text-emerald-300 mt-1">
                      ₹{Math.round(livePriceData.netReturn).toLocaleString()}
                    </div>
                    <span className="text-[9px] text-emerald-400 font-bold">After Logistics & APMC Tax</span>
                  </div>
                </div>

                {/* Insight & Auto Apply */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-800/50 p-3.5 rounded-2xl border border-slate-700/50">
                  <p className="text-xs text-slate-300 font-medium flex-1">
                    💡 <strong className="text-white">Live AI Insight:</strong> {livePriceData.insight}
                  </p>

                  <button
                    type="button"
                    onClick={() => applyRecommendedMarket(livePriceData.bestMandi)}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-xs px-4 py-2 rounded-xl transition-all cursor-pointer border-0 shadow-md shadow-emerald-900/40 whitespace-nowrap"
                  >
                    🎯 {isTamil ? "இவ்விலக்கு சந்தையைத் தேர்வாக்கு" : "Set as Logistics Destination"}
                  </button>
                </div>
              </div>

              {/* Navigation */}
              <div className="flex justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setWizardStep(1)}
                  className="bg-slate-100 text-slate-600 font-bold px-6 py-3.5 rounded-2xl text-xs cursor-pointer border-0"
                >
                  {isTamil ? "← திரும்பு" : "← Back"}
                </button>
                <button
                  type="button"
                  onClick={() => setWizardStep(3)}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white font-black py-3.5 px-8 rounded-2xl text-xs transition-all cursor-pointer border-0 shadow-md shadow-emerald-100"
                >
                  {isTamil ? "பொருத்தமான வாகனங்கள் காண்க →" : "View Matched Vehicles →"}
                </button>
              </div>
            </div>
          )}

          {/* Map Location Picker Modal */}
          {mapPickerTarget && (
            <MapLocationPicker
              title={mapPickerTarget === "pickup"
                ? (isTamil ? "எடுக்கும் இடம் தேர்வு செய்யவும்" : "Select Pickup Location")
                : (isTamil ? "சந்தை இலக்கு தேர்வு செய்யவும்" : "Select Destination Market")
              }
              currentValue={mapPickerTarget === "pickup" ? pickupLocation : destinationLocation}
              allLocations={TN_LOCATIONS}
              onSelect={(loc) => {
                if (mapPickerTarget === "pickup") setPickupLocation(loc);
                else setDestinationLocation(loc);
              }}
              onClose={() => setMapPickerTarget(null)}
              isTamil={isTamil}
            />
          )}

          {/* WIZARD STEP 3: PICK VEHICLE & CARRIER */}
          {wizardStep === 3 && (
            <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden p-6 sm:p-8 space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full">
                    {isTamil ? "படி 3 / 4 — வாகனம் தேர்வு" : "Step 3 of 4 — Select Transport Carrier"}
                  </span>
                  <h2 className="text-xl font-black text-slate-900 mt-2">
                    {isTamil ? "வாகனம் மற்றும் ஓட்டுநர் தேர்வு" : "Select Your Transport Carrier"}
                  </h2>
                </div>
              </div>

              {/* Carrier options */}
              <div className="space-y-3">
                {carriers.map((carrier) => {
                  const isSelected = selectedCarrierId === carrier.id;
                  return (
                    <button
                      key={carrier.id}
                      type="button"
                      onClick={() => setSelectedCarrierId(carrier.id)}
                      className={`w-full p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                        isSelected
                          ? "border-emerald-500 bg-emerald-50/90 ring-2 ring-emerald-500/20 shadow-md"
                          : "border-slate-200 bg-white hover:border-emerald-300"
                      }`}
                    >
                      <div className="flex items-center space-x-4">
                        <div className="text-3xl bg-slate-100 p-3 rounded-2xl">
                          {carrier.emoji}
                        </div>
                        <div className="space-y-0.5">
                          <div className="flex items-center space-x-2">
                            <span className="font-black text-slate-900 text-sm">{carrier.name}</span>
                            {carrier.ai && (
                              <span className="bg-emerald-500 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-full">
                                {isTamil ? "AI பரிந்துரை" : "AI Recommended Choice"}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 font-semibold">
                            {isTamil ? "ஓட்டுநர்:" : "Driver:"} {carrier.driver} · ⭐ {carrier.rating} ({carrier.count} {isTamil ? "பயணங்கள்" : "trips"})
                          </p>
                          <p className="text-[11px] text-slate-400 font-medium">
                            {isTamil ? "அளவு:" : "Capacity:"} {carrier.limit} · {isTamil ? "சேமிப்பு:" : "Storage:"} {carrier.type}
                          </p>
                        </div>
                      </div>

                      <div className="text-right self-end sm:self-center">
                        <p className="text-lg font-black text-emerald-700">₹{carrier.fare.toLocaleString()}</p>
                        <p className="text-[10px] text-slate-400 font-semibold">{isTamil ? "மதிப்பிடப்பட்ட கட்டணம்" : "Est. Total Tariff"}</p>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="flex justify-between pt-4">
                <button
                  type="button"
                  onClick={() => setWizardStep(2)}
                  className="bg-slate-100 text-slate-600 font-bold px-6 py-3.5 rounded-2xl text-xs cursor-pointer border-0"
                >
                  {isTamil ? "← விவரங்களுக்குத் திரும்பு" : "← Back to Details"}
                </button>

                <button
                  type="button"
                  onClick={handleFinishBooking}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white font-black py-3.5 px-8 rounded-2xl text-xs transition-all cursor-pointer border-0 shadow-md shadow-emerald-100"
                >
                  {isTamil ? "பதிவை உறுதிப்படுத்து & பயணத்தை தொடங்கு 🚀" : "Confirm Booking & Start Trip 🚀"}
                </button>
              </div>
            </div>
          )}

        </main>
      )}

      {/* VIEW 3: LIVE DISPATCH ROUTE TRACKING */}
      {viewMode === "live_tracking" && (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fadeIn">
          
          {/* Left Column: Live Map */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between h-full min-h-[500px]">
              
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 border-b border-slate-100">
                <h2 className="text-lg font-black text-slate-900 flex items-center space-x-2">
                  <span className="text-emerald-500 text-lg">🗺️</span>
                  <span>{isTamil ? "உண்மையான நேர வாகன வழித்தடம்" : "Live Agricultural Dispatch Route"}</span>
                </h2>
                
                <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-bold text-slate-600">
                  <button 
                    onClick={() => setMapTab("vector")}
                    className={`px-3 py-1.5 rounded-lg transition-all border-0 cursor-pointer ${mapTab === "vector" ? "bg-white text-slate-800 shadow-sm" : "hover:text-slate-800"}`}
                  >
                    📍 {isTamil ? "வெக்டார் மேப்" : "Vector Map"}
                  </button>
                  <button 
                    onClick={() => setMapTab("google")}
                    className={`px-3 py-1.5 rounded-lg transition-all border-0 cursor-pointer ${mapTab === "google" ? "bg-white text-slate-800 shadow-sm" : "hover:text-slate-800"}`}
                  >
                    🌐 {isTamil ? "கூகிள் மேப்" : "Google Map"}
                  </button>
                </div>
              </div>

              {mapTab === "vector" ? (
                <div className="relative flex-1 bg-emerald-50/20 border border-emerald-100/50 rounded-2xl my-4 overflow-hidden flex items-center justify-center p-4">
                  <div className="absolute top-4 left-4 text-[10px] font-bold text-emerald-800 tracking-wider bg-emerald-100/50 border border-emerald-200 px-2.5 py-1 rounded-full uppercase">
                    🟢 {isTamil ? "தமிழ்நாடு வழித்தடம் செயலில் உள்ளது" : "Tamil Nadu Route Vector Active"}
                  </div>

                  <svg className="w-full h-full max-w-[400px] max-h-[380px]" viewBox="0 0 350 350">
                    <circle cx="130" cy="310" r="40" fill="#10b981" fillOpacity="0.05" />
                    <circle cx="260" cy="90" r="50" fill="#10b981" fillOpacity="0.05" />

                    <path 
                      d="M 130 310 L 210 240 L 170 190 L 260 90" 
                      fill="none" 
                      stroke="#10b981" 
                      strokeWidth="3" 
                      strokeLinecap="round"
                      strokeDasharray="6,6" 
                    />

                    <circle cx="260" cy="90" r="5" fill="#ef4444" />
                    <text x="270" y="85" fill="#475569" fontSize="9" fontWeight="bold">Chennai</text>

                    <circle cx="170" cy="190" r="4" fill="#3b82f6" />
                    <text x="180" y="195" fill="#475569" fontSize="8" fontWeight="bold">Salem</text>
                    
                    <circle cx="90" cy="220" r="4" fill="#64748b" />
                    <text x="50" y="224" fill="#94a3b8" fontSize="8" fontWeight="medium">Coimbatore</text>
                    
                    <circle cx="210" cy="240" r="4" fill="#64748b" />
                    <text x="220" y="244" fill="#94a3b8" fontSize="8" fontWeight="medium">Trichy</text>

                    <circle cx="130" cy="310" r="6" fill="#10b981" />
                    <text x="100" y="325" fill="#1e293b" fontSize="9" fontWeight="bold">Madurai (Origin)</text>

                    <g transform={`translate(${truckCoords.x - 12}, ${truckCoords.y - 12})`}>
                      <circle cx="12" cy="12" r="10" fill="#10b981" fillOpacity="0.3" className="animate-ping" />
                      <circle cx="12" cy="12" r="6" fill="#047857" />
                      <text x="5" y="16" fontSize="11">🚚</text>
                    </g>
                  </svg>
                </div>
              ) : (
                <div className="relative flex-1 my-4 overflow-hidden rounded-2xl border border-slate-200">
                  <GoogleMapComponent pickup={pickupLocation} destination={destinationLocation} />
                </div>
              )}

              <div className="space-y-4 pt-4 border-t border-slate-100">
                <div className="flex justify-between items-center text-xs font-bold text-slate-500">
                  <div>
                    <span className="block text-slate-400">{isTamil ? "புறப்படும் இடம்" : "FROM"}</span>
                    <span className="text-slate-900 text-sm">{pickupLocation.split(" ")[0]}</span>
                  </div>
                  <div className="text-center bg-emerald-50 text-emerald-800 px-3 py-1 rounded-xl">
                    {trackingProgress}%
                  </div>
                  <div className="text-right">
                    <span className="block text-slate-400">{isTamil ? "இலக்கு" : "TO"}</span>
                    <span className="text-slate-900 text-sm">{destinationLocation.split(" ")[0]}</span>
                  </div>
                </div>

                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                    style={{ width: `${trackingProgress}%` }}
                  />
                </div>
              </div>

            </div>
          </div>

          {/* Right Column: Telemetry & Driver */}
          <div className="space-y-6">
            
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
                <span className="text-emerald-500">🌡️</span>
                <span>{isTamil ? "நேரடி வெப்பநிலை நிலை" : "Live Cold/Dry Safety Stream"}</span>
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl text-center">
                  <span className="block text-[10px] font-bold text-slate-400 uppercase">{isTamil ? "இலக்கு" : "Target"}</span>
                  <span className="block text-sm font-black text-slate-950 mt-1">{predictions.temp}</span>
                </div>
                <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl text-center">
                  <span className="block text-[10px] font-bold text-slate-400 uppercase font-black">{isTamil ? "செயலில் உள்ள வெப்பநிலை" : "Active Telemetry"}</span>
                  <span className="block text-lg font-black text-emerald-600 mt-1">
                    {predictions.temp.includes("Ambient") ? (isTamil ? "இயல்புநிலை" : "Ambient") : "10.5°C"}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm flex items-center justify-between">
              <div className="flex items-center space-x-3.5">
                <div className="bg-slate-100 text-slate-700 p-3 rounded-full text-lg">
                  👨‍✈️
                </div>
                <div className="space-y-0.5">
                  <span className="block text-[10px] font-bold text-slate-400 uppercase">{isTamil ? "ஒதுக்கப்பட்ட ஓட்டுநர்" : "Assigned Driver"}</span>
                  <span className="block font-extrabold text-slate-900">{chosenCarrier.driver}</span>
                  <span className="block text-xs text-slate-500 font-semibold">{chosenCarrier.mob}</span>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => downloadReceipt({
                    cropName: cropName || "Harvest",
                    pickup: pickupLocation,
                    destination: destinationLocation,
                    fee: chosenCarrier.fare,
                    transporterName: chosenCarrier.driver
                  })}
                  className="bg-slate-100 hover:bg-emerald-50 text-slate-600 p-3 rounded-2xl transition-all border border-slate-200 cursor-pointer"
                  title={isTamil ? "ரசீது பதிவிறக்குக" : "Receipt"}
                >
                  <Download className="h-4 w-4" />
                </button>
                <a 
                  href={`tel:${chosenCarrier.mob.replace(/\s+/g, "")}`}
                  className="bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white p-3 rounded-2xl shadow-sm transition-all"
                >
                  <Phone className="h-4 w-4" />
                </a>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
              <button
                type="button"
                onClick={() => setViewMode("dashboard")}
                className="w-full bg-slate-950 hover:bg-emerald-600 text-white rounded-2xl py-3.5 text-xs font-bold shadow-md transition-all cursor-pointer border-0"
              >
                {isTamil ? "டாஷ்போர்டிற்குத் திரும்பு" : "Return to Dashboard"}
              </button>
            </div>

          </div>

        </main>
      )}



      {/* MODAL: ADD NEW CROP */}
      {showAddCropModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4">
          <form onSubmit={handleAddCropSubmit} className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-5 shadow-2xl border border-slate-100">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h3 className="text-lg font-black text-slate-900">
                {isTamil ? "புதிய பயிர் பட்டியல் சேர்க்க" : "Add New Crop Listing"}
              </h3>
              <button
                type="button"
                onClick={() => setShowAddCropModal(false)}
                className="text-slate-400 hover:text-slate-700 font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs font-semibold text-slate-700">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400">
                  {isTamil ? "பயிர் பெயர்" : "Crop Name"}
                </label>
                <input
                  type="text"
                  required
                  value={newCropName}
                  onChange={(e) => setNewCropName(e.target.value)}
                  placeholder={isTamil ? "எ.கா. ஆர்கானிக் தக்காளி" : "e.g. Organic Tomato"}
                  className="w-full border border-slate-200 rounded-xl p-3 outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400">Category</label>
                <select
                  value={newCropCategory}
                  onChange={(e) => setNewCropCategory(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl p-3 outline-none focus:border-emerald-500 bg-white"
                >
                  <option value="Vegetables">Vegetables</option>
                  <option value="Fruits">Fruits</option>
                  <option value="Grains">Grains</option>
                  <option value="Spices">Spices</option>
                  <option value="Flowers">Flowers</option>
                  <option value="Others">Others</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400">Quantity (kg)</label>
                  <input
                    type="number"
                    value={newCropQty}
                    onChange={(e) => setNewCropQty(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl p-3 outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400">Price / kg (₹)</label>
                  <input
                    type="number"
                    value={newCropPrice}
                    onChange={(e) => setNewCropPrice(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl p-3 outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setShowAddCropModal(false)}
                className="flex-1 bg-slate-100 text-slate-600 font-bold py-3 rounded-xl cursor-pointer border-0"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 rounded-xl cursor-pointer border-0 shadow-sm"
              >
                Add Listing
              </button>
            </div>
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
              {isTamil ? "தமிழ்நாடு விவசாய விநியோகச் சங்கிலி" : "Tamil Nadu Agricultural Logistics Platform"}
            </span>
          </div>
          <div className="text-center sm:text-right space-y-0.5">
            <p className="font-semibold text-slate-500">
              {isTamil ? "© 2026 ஃபார்ம்கோ தளவாட தளம்" : "© 2026 farmGo Logistics Platform"}
            </p>
            <p className="text-[10px] text-slate-400">
              {isTamil ? "கோகுலக்கிருஷ்ணன் K (நிறுவனர் & CEO) · முகமது கரீப் நவாஸ் (CFO)" : "Gokulakrishnan K (Founder & CEO) · Mohamed Karib Navas (Co-Founder & CFO)"}
            </p>
          </div>
        </div>
      </footer>

      {/* Floating AI Chatbot Widget */}
      <ChatbotWidget />
    </div>
  );
}
