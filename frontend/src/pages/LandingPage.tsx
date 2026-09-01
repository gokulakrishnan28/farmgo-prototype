import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Sprout, Truck, ArrowRight, Leaf, Apple, Package, Globe } from "lucide-react";
import ChatbotWidget from "../components/ChatbotWidget";
import LanguageModal, { type LanguageCode } from "../components/LanguageModal";

export default function LandingPage() {
  const navigate = useNavigate();

  const [currentLang, setCurrentLang] = useState<LanguageCode>(() => {
    const saved = sessionStorage.getItem("language_selected") || localStorage.getItem("language_selected");
    if (saved && ["en", "ta", "hi", "mr"].includes(saved)) {
      return saved as LanguageCode;
    }
    return "en";
  });

  const [showLanguageModal, setShowLanguageModal] = useState(() => {
    return !sessionStorage.getItem("language_selected");
  });
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Login Modal States
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginTarget, setLoginTarget] = useState<"farmer" | "transporter" | null>(null);
  const [loginName, setLoginName] = useState("");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPhone, setLoginPhone] = useState("");

  // Auto-open modal if redirected from Farmer Dashboard "Change Category"
  useEffect(() => {
    if (sessionStorage.getItem("show_category_modal_onload") === "true") {
      sessionStorage.removeItem("show_category_modal_onload");
      setShowCategoryModal(true);
    }
  }, []);

  const isTamil = currentLang === "ta";

  const handleCategorySelect = (categoryId: string) => {
    sessionStorage.setItem("farmer_category", categoryId);
    setShowCategoryModal(false);
    navigate("/farmer");
  };

  const cropCategories = [
    {
      id: "Vegetables", icon: Leaf, label: "Vegetables", tamil: "காய்கறிகள்",
      color: "emerald", bg: "#ecfdf5", accent: "#10b981",
      desc: "Tomato, Onion, Potato, Carrot...", tDesc: "தக்காளி, வெங்காயம், உருளை...",
      image: "/vegetables_category.png",
      emoji: "🥦"
    },
    {
      id: "Fruits", icon: Apple, label: "Fruits", tamil: "பழங்கள்",
      color: "orange", bg: "#fff7ed", accent: "#f97316",
      desc: "Mango, Banana, Coconut, Grapes...", tDesc: "மாம்பழம், வாழைப்பழம்...",
      image: "/fruits_category.png",
      emoji: "🥭"
    },
    {
      id: "Others", icon: Package, label: "Others", tamil: "மற்றவை",
      color: "slate", bg: "#f8fafc", accent: "#64748b",
      desc: "Grains, Spices, Flowers, Sugarcane...", tDesc: "தானியங்கள், மசாலா, பூக்கள்...",
      image: "/others_category.png",
      emoji: "🌾"
    },
  ];

  const handleSelectLanguage = (lang: LanguageCode) => {
    setCurrentLang(lang);
    sessionStorage.setItem("language_selected", lang);
    localStorage.setItem("language_selected", lang);
    setShowLanguageModal(false);
  };

  const handleEnterFarmerPortal = () => {
    navigate("/farmer");
  };

  const handleEnterTransporterPortal = () => {
    navigate("/transporter");
  };

  const translations: Record<LanguageCode, any> = {
    en: {
      tagline: "Smart Logistics for Modern Agriculture",
      title: <>Connecting Farms <br className="hidden sm:inline" /><span className="bg-gradient-to-r from-emerald-500 to-green-600 bg-clip-text text-transparent">to Freights Seamlessly</span></>,
      subtitle: "FarmGo bridges the gap between farmers looking to sell and transport crops, and transporters looking for logistics jobs.",
      farmerTitle: "Farmer Portal",
      farmerDesc: "List your harvested crops, set prices, and request secure transport deliveries to urban markets.",
      farmerBtn: "Enter Farmer Portal",
      transporterTitle: "Transporter Portal",
      transporterDesc: "Browse nearby crop listings, accept shipping contracts, and earn competitive payouts for fulfillment.",
      transporterBtn: "Enter Transporter Portal",
      securePayTitle: "Secure Payments",
      securePayDesc: "Milestone-based delivery verification ensures instant transporter payouts.",
      routingTitle: "Real-Time Routing",
      routingDesc: "AI-powered logistics suggestions for fuel-efficient pickup and drop paths.",
      wastageTitle: "Zero Wastage",
      wastageDesc: "Quick matches minimize farm-gate transit times, reducing crop spoilage risk.",
      leadershipTitle: "Leadership Team",
      leadershipSub: "The visionaries driving modern agricultural supply chains in Tamil Nadu.",
      ceoRole: "Founder & CEO",
      cfoRole: "Co-Founder & CFO",
    },
    ta: {
      tagline: "நவீன விவசாயத்திற்கான ஸ்மார்ட் லாஜிஸ்டிக்ஸ்",
      title: <>விவசாயத்தை <span className="bg-gradient-to-r from-emerald-500 to-green-600 bg-clip-text text-transparent">சரக்குகளுடன் தடையின்றி</span> இணைக்கிறது</>,
      subtitle: "பயிர்களை விற்க மற்றும் கொண்டு செல்ல விரும்பும் விவசாயிகள், மற்றும் போக்குவரத்து வேலைகளைத் தேடும் ஓட்டுநர்கள் இடையேயான இடைவெளியை ஃபார்ம்கோ குறைக்கிறது.",
      farmerTitle: "விவசாயி தளம்",
      farmerDesc: "அறுவடை செய்யப்பட்ட பயிர்களைப் பட்டியலிடுங்கள், விலைகளை நிர்ணயம் செய்யுங்கள், நகர்ப்புற சந்தைகளுக்குப் பாதுகாப்பான போக்குவரத்தைக் கோருங்கள்.",
      farmerBtn: "விவசாயி தளத்திற்குள் நுழையவும்",
      transporterTitle: "போக்குவரத்து தளம்",
      transporterDesc: "அருகிலுள்ள பயிர் பட்டியல்களைப் பார்க்கவும், கப்பல் ஒப்பந்தங்களை ஏற்கவும், நிறைவு செய்வதற்கான போட்டி ஊதியங்களைப் பெறவும்.",
      transporterBtn: "போக்குவரத்து தளத்திற்குள் நுழையவும்",
      securePayTitle: "பாதுகாப்பான கட்டணங்கள்",
      securePayDesc: "வழங்கப்பட்ட விநியோக சரிபார்ப்பு மூலம் ஓட்டுநர்களுக்கு உடனடி பணம் செலுத்தப்படுகிறது.",
      routingTitle: "நிகழ்நேர வழிகாட்டி",
      routingDesc: "குறைந்த எரிபொருள் மற்றும் சிறந்த பாதைகளுக்கான செயற்கை நுண்ணறிவு பரிந்துரைகள்.",
      wastageTitle: "பூஜ்ஜிய வீணடிப்பு",
      wastageDesc: "விரைவான மேட்சிங் மூலம் பயிர் வீணாகும் அபாயத்தை வெகுவாகக் குறைக்கிறது.",
      leadershipTitle: "தலைமை குழு",
      leadershipSub: "தமிழ்நாட்டில் நவீன விவசாய விநியோகச் சங்கிலியை இயக்கும் தொலைநோக்கு பார்வையாளர்கள்.",
      ceoRole: "நிறுவனர் மற்றும் முதன்மை நிர்வாக அதிகாரி",
      cfoRole: "இணை நிறுவனர் & நிதி அதிகாரி",
    },
    hi: {
      tagline: "आधुनिक कृषि के लिए स्मार्ट लॉजिस्टिक्स",
      title: <>खेतों को सीधे <span className="bg-gradient-to-r from-emerald-500 to-green-600 bg-clip-text text-transparent">बाजारों और परिवहन से जोड़ना</span></>,
      subtitle: "फार्मगो (FarmGo) फसल बेचने और परिवहन चाहने वाले किसानों और ट्रांसपोर्टरों के बीच की दूरी को मिटाता है।",
      farmerTitle: "किसान पोर्टल",
      farmerDesc: "अपनी फसलों को सूचीबद्ध करें, मूल्य तय करें और शहरी बाजारों के लिए सुरक्षित परिवहन का अनुरोध करें।",
      farmerBtn: "किसान पोर्टल में प्रवेश करें",
      transporterTitle: "ट्रांसपोर्टर पोर्टल",
      transporterDesc: "पास की फसलों की सूची देखें, शिपिंग अनुबंध स्वीकार करें और कमाई करें।",
      transporterBtn: "ट्रांसपोर्टर पोर्टल में प्रवेश करें",
      securePayTitle: "सुरक्षित भुगतान",
      securePayDesc: "सत्यापित डिलीवरी के साथ त्वरित भुगतान गारंटी।",
      routingTitle: "रियल-टाइम रूटिंग",
      routingDesc: "ईंधन की बचत और सर्वोत्तम मार्गों के लिए AI-आधारित सुझाव।",
      wastageTitle: "शून्य बर्बादी",
      wastageDesc: "त्वरित मिलान से फसल खराब होने का जोखिम कम होता है।",
      leadershipTitle: "नेतृत्व टीम",
      leadershipSub: "तमिलनाडु में आधुनिक कृषि आपूर्ति श्रृंखला को सशक्त बनाने वाले मार्गदर्शक।",
      ceoRole: "संस्थापक और सीईओ",
      cfoRole: "सह-संस्थापक और सीएफओ",
    },
    mr: {
      tagline: "आधुनिक शेतीसाठी स्मार्ट लॉजिस्टिक्स",
      title: <>शेतीला थेट <span className="bg-gradient-to-r from-emerald-500 to-green-600 bg-clip-text text-transparent">बाजारपेठ आणि वाहतुकीशी जोडणारे</span> व्यासपीठ</>,
      subtitle: "फार्मगो (FarmGo) शेतकरी आणि वाहतूकदार यांच्यातील अंतर कमी करून फायदेशीर व्यापार सुलभ करते.",
      farmerTitle: "शेतकरी पोर्टल",
      farmerDesc: "तुमच्या पिकांची नोंदणी करा, दर ठरवा आणि थेट बाजारपेठेसाठी सुरक्षित वाहतूक मिळवा.",
      farmerBtn: "शेतकरी पोर्टलवर जा",
      transporterTitle: "वाहतूकदार पोर्टल",
      transporterDesc: "जवळपासच्या पिकांची यादी पहा, वाहतूक करार स्वीकारा आणि उत्पन्न मिळवा.",
      transporterBtn: "वाहतूकदार पोर्टलवर जा",
      securePayTitle: "सुरक्षित पेमेंट",
      securePayDesc: "तपासणीनंतर त्वरित पेमेंटची खात्री.",
      routingTitle: "रिअल-टाइम मार्गदर्शक",
      routingDesc: "इंधन बचत आणि सर्वोत्तम मार्गांसाठी AI शिफारसी.",
      wastageTitle: "शून्य नासाडी",
      wastageDesc: "जलद वितरणामुळे पिकांचे नुकसान टळते.",
      leadershipTitle: "नेतृत्व टीम",
      leadershipSub: "तामिळनाडूतील आधुनिक शेती पुरवठा साखळीचे नेतृत्व करणारे मार्गदर्शक.",
      ceoRole: "संस्थापक आणि सीईओ",
      cfoRole: "सह-संस्थापक आणि सीएफओ",
    }
  };

  const t = translations[currentLang] || translations.en;

  const langNames: Record<LanguageCode, string> = {
    en: "English",
    ta: "தமிழ்",
    hi: "हिन्दी",
    mr: "मराठी",
  };

  return (
    <div 
      className="min-h-screen flex flex-col relative bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url('/hero-bg.png')` }}
    >
      <div className="absolute inset-0 bg-slate-50/85 backdrop-blur-[2px] z-0 pointer-events-none" />

      <header className="mx-auto max-w-7xl w-[92%] sm:w-[95%] mt-4 sticky top-4 z-50 bg-white/70 backdrop-blur-xl border border-white/40 rounded-2xl sm:rounded-full px-6 h-16 flex items-center justify-between shadow-lg shadow-emerald-950/5 relative z-50">
        <Link to="/" className="flex items-center no-underline cursor-pointer">
          <span className="text-3xl font-black tracking-tighter">
            <span className="text-emerald-500 font-black">farm</span><span className="text-slate-900 font-black">Go</span>
          </span>
        </Link>
        <div className="flex items-center space-x-3">
          <a
            href={import.meta.env.VITE_BUYER_PORTAL_URL || "http://localhost:5175"}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-extrabold text-emerald-700 hover:text-emerald-900 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 px-3.5 py-1.5 rounded-xl transition-all flex items-center space-x-1 shadow-2xs"
            title="Open Buyer Portal (Hosted on http://localhost:5175)"
          >
            <span>Buyer Portal</span>
            <span className="text-[10px]">↗</span>
          </a>
          <a
            href={import.meta.env.VITE_ADMIN_PORTAL_URL || "http://localhost:5174"}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-extrabold text-emerald-700 hover:text-emerald-900 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 px-3.5 py-1.5 rounded-xl transition-all flex items-center space-x-1 shadow-2xs"
            title="Open Admin Portal (Hosted on http://localhost:5174)"
          >
            <span>Admin Portal</span>
            <span className="text-[10px]">↗</span>
          </a>
          <div className="h-4 w-px bg-slate-200 hidden md:inline" />

          {/* Direct 1-Click 4-Language Selector */}
          <div className="flex items-center bg-slate-100/90 p-1 rounded-2xl border border-slate-200 text-xs shadow-xs">
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
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 py-16 relative z-10">
        <div className="max-w-3xl text-center space-y-6">
          <div className="inline-flex items-center space-x-2 bg-emerald-50 text-emerald-800 px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide uppercase">
            <Sprout className="h-3.5 w-3.5" />
            <span>{t.tagline}</span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-none">
            {t.title}
          </h1>
          
          <p className="text-lg text-slate-600 max-w-xl mx-auto font-medium">
            {t.subtitle}
          </p>

          {/* Cards for Farmer & Transporter portals */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-4xl mx-auto pt-10">
            {/* Farmer Card */}
            <div className="bg-white border border-slate-150 rounded-3xl p-6 text-left shadow-sm hover:shadow-md transition-all group flex flex-col justify-between">
              <div>
                <div className="overflow-hidden rounded-2xl mb-4 shadow-inner border border-slate-100">
                  <img src="/farmer.png?v=3" alt="Farmer" className="w-full h-48 object-cover object-top group-hover:scale-105 transition-all duration-300" />
                </div>
                <div className="flex items-center space-x-2">
                  <div className="bg-emerald-50 text-emerald-600 p-2 rounded-xl group-hover:bg-emerald-500 group-hover:text-white transition-all">
                    <Sprout className="h-5 w-5" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">{t.farmerTitle}</h3>
                </div>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                  {t.farmerDesc}
                </p>
              </div>
              <button
                onClick={handleEnterFarmerPortal}
                className="mt-6 flex items-center justify-center space-x-2 bg-emerald-500 hover:bg-emerald-600 text-white py-3 px-4 rounded-xl font-semibold transition-all text-xs w-full shadow-sm cursor-pointer border-0"
              >
                <span>{t.farmerBtn}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Transporter Card */}
            <div className="bg-white border border-slate-150 rounded-3xl p-6 text-left shadow-sm hover:shadow-md transition-all group flex flex-col justify-between">
              <div>
                <div className="overflow-hidden rounded-2xl mb-4 shadow-inner border border-slate-100">
                  <img src="/truck.png?v=3" alt="Truck" className="w-full h-48 object-cover object-center group-hover:scale-105 transition-all duration-300" />
                </div>
                <div className="flex items-center space-x-2">
                  <div className="bg-emerald-50 text-emerald-600 p-2 rounded-xl group-hover:bg-emerald-500 group-hover:text-white transition-all">
                    <Truck className="h-5 w-5" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">{t.transporterTitle}</h3>
                </div>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                  {t.transporterDesc}
                </p>
              </div>
              <button
                onClick={handleEnterTransporterPortal}
                className="mt-6 flex items-center justify-center space-x-2 bg-emerald-500 hover:bg-emerald-600 text-white py-3 px-4 rounded-xl font-semibold transition-all text-xs w-full shadow-sm cursor-pointer border-0"
              >
                <span>{t.transporterBtn}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Features / Trust signals */}
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 pt-20 border-t border-slate-200 mt-20 w-full text-center">
          <div className="flex flex-col items-center space-y-2">
            <div className="bg-slate-100 p-2.5 rounded-full text-slate-700">
              <Sprout className="h-5 w-5" />
            </div>
            <h4 className="font-semibold text-slate-900">{t.securePayTitle}</h4>
            <p className="text-xs text-slate-500">{t.securePayDesc}</p>
          </div>
          <div className="flex flex-col items-center space-y-2">
            <div className="bg-slate-100 p-2.5 rounded-full text-slate-700">
              <Truck className="h-5 w-5" />
            </div>
            <h4 className="font-semibold text-slate-900">{t.routingTitle}</h4>
            <p className="text-xs text-slate-500">{t.routingDesc}</p>
          </div>
          <div className="flex flex-col items-center space-y-2">
            <div className="bg-slate-100 p-2.5 rounded-full text-slate-700">
              <Sprout className="h-5 w-5" />
            </div>
            <h4 className="font-semibold text-slate-900">{t.wastageTitle}</h4>
            <p className="text-xs text-slate-500">{t.wastageDesc}</p>
          </div>
        </div>

        {/* Leadership Team Section */}
        <div className="max-w-4xl mx-auto pt-20 border-t border-slate-200 mt-20 w-full text-center space-y-8 animate-fadeIn">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">{t.leadershipTitle}</h2>
            <p className="text-sm text-slate-500 mt-2">{t.leadershipSub}</p>
            <div className="flex flex-col items-center space-y-2.5 mt-5 select-none">
              <span className="text-4xl font-black tracking-tighter text-slate-900 leading-none">
                <span className="text-emerald-500 font-black">farm</span><span className="text-slate-900 font-black">Go</span>
              </span>
              <span className="text-[11px] sm:text-xs font-black uppercase tracking-widest text-emerald-600 bg-white border border-slate-200/80 px-6 py-2 rounded-full shadow-sm">
                2026 Agriculture Logistic Startup
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-2xl mx-auto">
            {/* Founder Card */}
            <div className="bg-white/60 backdrop-blur-md border border-white/40 rounded-3xl p-8 shadow-xl shadow-emerald-950/5 hover:-translate-y-1 hover:bg-white/85 hover:shadow-2xl hover:shadow-emerald-950/10 transition-all duration-300 flex flex-col items-center text-center space-y-5 group cursor-pointer">
              <div className="bg-gradient-to-tr from-emerald-500 to-green-400 text-white font-black text-2xl h-20 w-20 rounded-full flex items-center justify-center shadow-lg shadow-emerald-200/60 border-4 border-white group-hover:scale-105 transition-transform duration-300">
                GK
              </div>
              <div className="space-y-1">
                <h4 className="font-extrabold text-slate-900 text-xl tracking-tight">Gokulakarishnan K</h4>
                <span className="bg-emerald-500/10 text-emerald-800 text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full mt-2 inline-block border border-emerald-500/15">{t.ceoRole}</span>
              </div>
            </div>

            {/* CFO Card */}
            <div className="bg-white/60 backdrop-blur-md border border-white/40 rounded-3xl p-8 shadow-xl shadow-emerald-950/5 hover:-translate-y-1 hover:bg-white/85 hover:shadow-2xl hover:shadow-emerald-950/10 transition-all duration-300 flex flex-col items-center text-center space-y-5 group cursor-pointer">
              <div className="bg-gradient-to-tr from-teal-500 to-emerald-400 text-white font-black text-2xl h-20 w-20 rounded-full flex items-center justify-center shadow-lg shadow-teal-200/60 border-4 border-white group-hover:scale-105 transition-transform duration-300">
                MK
              </div>
              <div className="space-y-1">
                <h4 className="font-extrabold text-slate-900 text-xl tracking-tight">Mohamed Karib Navas</h4>
                <span className="bg-emerald-500/10 text-emerald-800 text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full mt-2 inline-block border border-emerald-500/15">{t.cfoRole}</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white/95 backdrop-blur-md border-t border-slate-100 py-6 text-xs text-slate-400 relative z-10 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <span className="text-xl font-black tracking-tighter">
              <span className="text-emerald-500 font-black">farm</span><span className="text-slate-900 font-black">Go</span>
            </span>
            <span className="text-slate-300">|</span>
            <span className="text-slate-500 font-medium">
              {isTamil ? "தமிழ்நாடு விவசாய விநியோகச் சங்கிலி" : "Tamil Nadu Agricultural Supply Chain"}
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

      {/* Crop Category Selection — Full Screen */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-50 flex flex-col" style={{ background: "#f0fdf4" }}>

          {/* Top Header Bar — matches farmGo navbar */}
          <div className="bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between shadow-sm">
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-black tracking-tight">
                <span className="text-emerald-500 font-black">farm</span><span className="text-slate-900 font-black">Go</span>
              </span>
              <span className="ml-2 bg-emerald-50 text-emerald-700 text-xs font-bold px-2.5 py-0.5 rounded-full">
                {isTamil ? "விவசாயி தளம்" : "Farmer Portal"}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => { setShowCategoryModal(false); setSelectedCategory(null); }}
                className="text-slate-400 hover:text-slate-700 text-sm font-semibold transition-all flex items-center space-x-1 border border-slate-200 px-3 py-1.5 rounded-xl hover:bg-slate-50 cursor-pointer"
              >
                <span>✕</span>
                <span className="hidden sm:inline">{isTamil ? "திரும்பு" : "Back"}</span>
              </button>
              <button
                onClick={() => { setShowCategoryModal(false); navigate("/farmer"); }}
                className="bg-emerald-500 hover:bg-emerald-600 text-white text-xs sm:text-sm font-bold transition-all px-3 py-2 rounded-xl flex items-center space-x-1.5 cursor-pointer border-0 shadow-sm"
              >
                <span>🏠</span>
                <span>{isTamil ? "டாஷ்போர்டு" : "Dashboard"}</span>
              </button>
            </div>
          </div>

          {/* Page Content — compact padding on mobile */}
          <div className="flex-1 overflow-y-auto px-3 sm:px-8 py-4 sm:py-8 max-w-4xl mx-auto w-full">

            {/* Title — compact for mobile */}
            <div className="text-center mb-4 space-y-1">
              <div className="inline-flex items-center space-x-1.5 bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2.5 py-1 rounded-full mb-1">
                <Sprout className="h-3 w-3" />
                <span>{isTamil ? "AI மூலம் சரக்கு பொருத்தம்" : "AI-Powered Logistics Matching"}</span>
              </div>
              <h1 className="text-lg sm:text-2xl font-black text-slate-900">
                {isTamil ? "பயிர் வகையைத் தேர்வு செய்யவும்" : "What are you transporting?"}
              </h1>
              <p className="text-slate-500 text-xs max-w-sm mx-auto">
                {isTamil
                  ? "AI சிறந்த வாகனம் மற்றும் வெப்பநிலையை தேர்வு செய்யும்."
                  : "Select your crop — farmGo AI picks the ideal vehicle & cost instantly."}
              </p>
            </div>

            {/* Photo Category Grid — LARGE text and appropriate image size */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 my-4">
              {cropCategories.map((cat) => {
                const isSelected = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`group relative rounded-3xl overflow-hidden cursor-pointer transition-all duration-300 text-left ${
                      isSelected
                        ? "ring-4 ring-emerald-500 ring-offset-2 scale-[1.02] shadow-xl shadow-emerald-200"
                        : "ring-1 ring-slate-200 hover:ring-emerald-400 hover:scale-[1.01] shadow-md hover:shadow-lg"
                    }`}
                    style={{ background: "white" }}
                  >
                    {/* Crop Photo — clean, appropriate height */}
                    <div className="relative h-44 sm:h-52 w-full overflow-hidden bg-slate-100">
                      <img
                        src={cat.image}
                        alt={cat.label}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                      {/* Subtle gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent" />

                      {/* Emoji badge top-left */}
                      <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md h-9 w-9 rounded-2xl flex items-center justify-center text-lg shadow-md">
                        {cat.emoji}
                      </div>

                      {/* Selection checkmark */}
                      {isSelected && (
                        <div className="absolute top-3 right-3 bg-emerald-500 text-white h-8 w-8 rounded-full flex items-center justify-center shadow-lg">
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </div>

                    {/* Card Footer — LARGE text typography */}
                    <div className={`p-4 sm:p-5 transition-colors space-y-1 ${isSelected ? "bg-emerald-50/80" : "bg-white"}`}>
                      <div className="flex items-center justify-between">
                        <h3 className={`text-xl sm:text-2xl font-black tracking-tight ${isSelected ? "text-emerald-900" : "text-slate-900"}`}>
                          {isTamil ? cat.tamil : cat.label}
                        </h3>
                        {isSelected && (
                          <span className="bg-emerald-500 text-white text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full">
                            {isTamil ? "தேர்வுப்பட்டது" : "Selected"}
                          </span>
                        )}
                      </div>
                      <p className="text-xs sm:text-sm font-semibold text-slate-500 truncate">
                        {isTamil ? cat.tDesc : cat.desc}
                      </p>
                    </div>

                    {/* Selected bottom border accent */}
                    {isSelected && (
                      <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-emerald-500" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Fixed Bottom CTA — compact */}
          <div className="bg-white border-t border-slate-100 px-4 py-3 shadow-lg">
            <div className="max-w-4xl mx-auto flex items-center space-x-3">
              {selectedCategory && (
                <div className="flex items-center space-x-2 flex-1">
                  <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center text-base">
                    {cropCategories.find(c => c.id === selectedCategory)?.emoji}
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      {isTamil ? "தேர்ந்தெடுக்கப்பட்டது" : "Selected"}
                    </p>
                    <p className="text-sm font-bold text-slate-900">
                      {isTamil
                        ? cropCategories.find(c => c.id === selectedCategory)?.tamil
                        : cropCategories.find(c => c.id === selectedCategory)?.label}
                    </p>
                  </div>
                </div>
              )}
              {!selectedCategory && (
                <p className="flex-1 text-sm text-slate-400 font-medium">
                  {isTamil ? "ஒரு வகையைத் தேர்வு செய்யவும்" : "Select a crop category above to continue"}
                </p>
              )}
              <button
                onClick={() => selectedCategory && handleCategorySelect(selectedCategory)}
                disabled={!selectedCategory}
                className={`flex items-center space-x-2 py-3.5 px-8 rounded-2xl font-bold text-sm transition-all ${
                  selectedCategory
                    ? "bg-emerald-500 hover:bg-emerald-600 text-white cursor-pointer shadow-md shadow-emerald-100 hover:scale-105 active:scale-95"
                    : "bg-slate-100 text-slate-400 cursor-not-allowed"
                }`}
              >
                <span>{isTamil ? "விவரங்கள் உள்ளிடு →" : "Enter Details →"}</span>
              </button>
            </div>
          </div>

        </div>
      )}

      {/* LOGIN MODAL */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-fadeIn">
          <div className="bg-white border border-slate-200 rounded-3xl shadow-xl w-full max-w-md overflow-hidden p-6 space-y-6">
            
            {/* Header */}
            <div className="text-center space-y-2">
              <div className="bg-emerald-500 text-white p-3.5 rounded-2xl shadow-lg shadow-emerald-200 inline-block">
                <Sprout className="h-8 w-8" />
              </div>
              <h2 className="text-2xl font-black text-slate-900">
                {isTamil ? "farmGo-க்குள் நுழையவும்" : "Sign in to farmGo"}
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                {isTamil ? "உங்கள் விவரங்களை உள்ளிட்டு தொடரவும்" : "Enter your details to access your portal"}
              </p>
            </div>

            {/* Google Sign In Simulation */}
            <button
              type="button"
              onClick={() => {
                setLoginName(loginTarget === "farmer" ? "Gokulakrishnan K" : "Mohamed Karib Navas");
                setLoginEmail(loginTarget === "farmer" ? "gokul@gmail.com" : "karib@gmail.com");
                setLoginPhone("+91 98765 43210");
              }}
              className="w-full flex items-center justify-center space-x-3 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold py-3.5 px-4 rounded-2xl border border-slate-200 transition-all text-sm cursor-pointer shadow-sm"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.76c-.99.66-2.26 1.06-3.72 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <span>{isTamil ? "கூகுள் கணக்கு மூலம் நுழைய" : "Continue with Google Mail"}</span>
            </button>

            {/* Divider */}
            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-slate-200"></div>
              <span className="flex-shrink mx-4 text-slate-400 text-[10px] font-bold uppercase tracking-wider">{isTamil ? "அல்லது" : "Or enter manually"}</span>
              <div className="flex-grow border-t border-slate-200"></div>
            </div>

            {/* Form */}
            <form onSubmit={(e) => {
              e.preventDefault();
              if (!loginName || !loginEmail || !loginPhone) {
                alert("Please fill in all fields!");
                return;
              }
              sessionStorage.setItem("user_name", loginName);
              sessionStorage.setItem("user_email", loginEmail);
              sessionStorage.setItem("user_phone", loginPhone);
              sessionStorage.setItem("user_role", loginTarget || "farmer");
              setShowLoginModal(false);
              if (loginTarget === "farmer") {
                setShowCategoryModal(true);
              } else {
                navigate("/transporter");
              }
            }} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{isTamil ? "பெயர்" : "Full Name"}</label>
                <input
                  type="text"
                  placeholder={isTamil ? "உங்கள் பெயரை உள்ளிடவும்" : "e.g. Gokulakrishnan K"}
                  value={loginName}
                  onChange={(e) => setLoginName(e.target.value)}
                  className="w-full border border-slate-200 focus:border-emerald-500 rounded-2xl px-4 py-3.5 text-sm font-medium outline-none transition-all"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{isTamil ? "மின்னஞ்சல் (கூகுள் மெயில்)" : "Google Mail"}</label>
                <input
                  type="email"
                  placeholder="e.g. name@gmail.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full border border-slate-200 focus:border-emerald-500 rounded-2xl px-4 py-3.5 text-sm font-medium outline-none transition-all"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{isTamil ? "கைபேசி எண்" : "Phone Number"}</label>
                <input
                  type="tel"
                  placeholder="e.g. +91 98765 43210"
                  value={loginPhone}
                  onChange={(e) => setLoginPhone(e.target.value)}
                  className="w-full border border-slate-200 focus:border-emerald-500 rounded-2xl px-4 py-3.5 text-sm font-medium outline-none transition-all"
                  required
                />
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowLoginModal(false);
                    setLoginTarget(null);
                  }}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-3.5 rounded-2xl transition-all text-sm cursor-pointer border-0"
                >
                  {isTamil ? "ரத்து" : "Cancel"}
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3.5 rounded-2xl transition-all text-sm cursor-pointer border-0 shadow-md shadow-emerald-100"
                >
                  {isTamil ? "உள்நுழை" : "Sign In"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Floating AI Chatbot Widget */}
      <ChatbotWidget />
    </div>
  );
}
