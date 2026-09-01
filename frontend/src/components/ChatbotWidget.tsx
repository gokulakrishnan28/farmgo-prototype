import { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, Bot, Mic } from "lucide-react";

interface Message {
  sender: "user" | "bot";
  text: string;
}

export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [language, setLanguage] = useState<"en" | "ta">("en");
  const [messages, setMessages] = useState<Message[]>([
    { sender: "bot", text: "Hello! I am your FarmGo Assistant. Ask me anything about crop pricing, transport fares, or vehicle choices in Tamil Nadu." }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Initialize Speech Recognition (Web Speech API)
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      
      rec.onstart = () => {
        setIsListening(true);
      };
      
      rec.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
      };
      
      rec.onerror = (e: any) => {
        console.error("Speech Recognition Error", e);
        setIsListening(false);
      };
      
      rec.onend = () => {
        setIsListening(false);
      };
      
      recognitionRef.current = rec;
    }
  }, []);

  const handleToggleMic = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition is not supported in this browser. Please use Google Chrome.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      // Configure language dialect for speech recognition
      recognitionRef.current.lang = language === "ta" ? "ta-IN" : "en-IN";
      recognitionRef.current.start();
    }
  };

  const handleToggleLanguage = () => {
    const nextLang = language === "en" ? "ta" : "en";
    setLanguage(nextLang);
    setMessages([
      {
        sender: "bot",
        text: nextLang === "en"
          ? "Hello! I am your FarmGo Assistant. Ask me anything about crop pricing, transport fares, or vehicle choices in Tamil Nadu."
          : "வணக்கம்! நான் உங்கள் FarmGo உதவியாளர். தக்காளி விலை, வண்டி விவரங்கள் அல்லது கோயம்பேடு சந்தை வழிகளைப் பற்றி என்னிடம் கேட்கலாம்."
      }
    ]);
  };

  // Smart offline knowledge base — responds even without backend
  const getOfflineResponse = (query: string): string => {
    const q = query.toLowerCase();
    const isTa = language === "ta";

    // Tomato / தக்காளி
    if (q.includes("tomato") || q.includes("தக்காளி")) {
      return isTa
        ? "தக்காளியை அனுப்ப 4°C முதல் 8°C வரை குளிர்சாதன வாகனம் பரிந்துரைக்கப்படுகிறது. கோயம்பேடு சந்தைக்கு ஒரு டன் சுமார் ₹3,500 – ₹5,000 கட்டணம் ஆகும். Tata Ace அல்லது Eicher Mini Truck சரியான வாகனம்."
        : "For tomatoes, a reefer vehicle at 4°C–8°C is recommended. Cost to Koyambedu Market: ₹3,500–₹5,000 per ton. Tata Ace or Eicher Mini Truck is ideal.";
    }
    // Mango / மாம்பழம்
    if (q.includes("mango") || q.includes("மாம்பழம்")) {
      return isTa
        ? "மாம்பழத்திற்கு 10°C முதல் 12°C வரை வெப்பநிலை தேவை. சேலம் இலிருந்து சென்னை வரை ஒரு டன் ₹4,000 – ₹6,500 ஆகும். Reefer van சிறந்தது."
        : "Mangoes need 10°C–12°C. Salem to Chennai per ton costs ₹4,000–₹6,500. A reefer van is best to prevent premature ripening.";
    }
    // Banana / வாழைப்பழம்
    if (q.includes("banana") || q.includes("வாழைப்பழம்")) {
      return isTa
        ? "வாழைக்கு 13°C – 15°C தேவை. குளிர்சாதன வாகனம் இல்லாவிட்டால் வழியிலேயே பழுத்து வீணாகும். Reefer truck கட்டாயம்."
        : "Bananas require 13°C–15°C. Without refrigeration they ripen prematurely in transit. A reefer truck is mandatory.";
    }
    // Onion / வெங்காயம்
    if (q.includes("onion") || q.includes("வெங்காயம்")) {
      return isTa
        ? "வெங்காயம் அறை வெப்பநிலையில் சாதாரண வாகனத்தில் அனுப்பலாம். மதுரை இலிருந்து சென்னைக்கு ₹2,500 – ₹3,500 வரை கட்டணம் ஆகும்."
        : "Onions are dry cargo and can be transported at ambient temperature. Cost from Madurai to Chennai: ₹2,500–₹3,500 per ton.";
    }
    // Rice / அரிசி
    if (q.includes("rice") || q.includes("அரிசி") || q.includes("ponni")) {
      return isTa
        ? "அரிசியை சாதாரண Truck அல்லது Tempo-இல் அனுப்பலாம். தஞ்சாவூரிலிருந்து திருச்சிக்கு ₹2,000 – ₹3,000 கட்டணம் ஆகும்."
        : "Rice is dry cargo. Use a standard truck or tempo. Thanjavur to Trichy: ₹2,000–₹3,000. Ponni and Sona Masoori are common varieties.";
    }
    // Price / fare / cost / கட்டணம்
    if (q.includes("price") || q.includes("fare") || q.includes("cost") || q.includes("கட்டணம்") || q.includes("விலை")) {
      return isTa
        ? "farmGo-இல் கட்டணங்கள்: Mini Pickup (Tata Ace) ₹2,400, Bolero ₹3,200, Reefer Truck ₹5,800, Large Truck ₹8,200. தூரம் மற்றும் பயிர் வகையின்படி மாறும்."
        : "farmGo fares: Mini Pickup ₹2,400 · Bolero ₹3,200 · Reefer Truck ₹5,800 · Large Truck ₹8,200 · Reefer Container ₹14,500. Exact price varies by distance and crop type.";
    }
    // Vehicle / வாகனம்
    if (q.includes("vehicle") || q.includes("truck") || q.includes("வாகனம்") || q.includes("வண்டி")) {
      return isTa
        ? "farmGo-இல் கிடைக்கும் வாகனங்கள்: 🛻 Mini Pickup (0.5–1T), 🚐 Bolero (1–1.5T), 🧊 Reefer Cold Truck (1–2T), 🚛 Eicher Tempo (2–4T), 🚚 Ashok Leyland (5–10T), ❄️ Reefer Container (8–15T), 🌸 Flower Van."
        : "Vehicles on farmGo: 🛻 Mini Pickup (0.5–1T) · 🚐 Bolero (1–1.5T) · 🧊 Reefer Truck (1–2T) · 🚛 Eicher Tempo (2–4T) · 🚚 Large Truck (5–10T) · ❄️ Reefer Container (8–15T) · 🌸 Flower Van.";
    }
    // Market / கோயம்பேடு / சந்தை
    if (q.includes("koyambedu") || q.includes("கோயம்பேடு") || q.includes("market") || q.includes("சந்தை")) {
      return isTa
        ? "கோயம்பேடு சந்தை தமிழ்நாட்டின் மிகப்பெரிய காய்கறி மொத்த சந்தை. தினமும் 10,000 டன் வரை வர்த்தகம் நடக்கிறது. Chennai, Coimbatore, Salem இலிருந்து நேரடி வாகன சேவை உள்ளது."
        : "Koyambedu is Tamil Nadu's largest wholesale vegetable market, handling 10,000+ tons daily. Direct logistics available from Chennai, Coimbatore, and Salem via farmGo.";
    }
    // Booking / Book / பதிவு
    if (q.includes("book") || q.includes("booking") || q.includes("பதிவு") || q.includes("book")) {
      return isTa
        ? "farmGo-இல் பதிவு செய்ய: 1) பயிர் வகையைத் தேர்வு செய்யவும் 2) விளைச்சல் விவரங்களை உள்ளிடவும் 3) AI மூலம் ஆய்வுசெய்யவும் 4) வாகனத்தை தேர்வு செய்யவும் 5) உறுதிப்படுத்தவும்."
        : "To book on farmGo: 1) Select crop category → 2) Enter harvest details → 3) AI analysis → 4) Pick a vehicle → 5) Confirm booking. The whole process takes under 2 minutes!";
    }
    // Hello / greeting
    if (q.includes("hello") || q.includes("hi") || q.includes("வணக்கம்") || q.includes("help")) {
      return isTa
        ? "வணக்கம்! நான் farmGo AI உதவியாளர். பயிர் விலை, வாகன கட்டணம், சந்தை தகவல்கள் அல்லது பதிவு செய்வது பற்றி என்னிடம் கேட்கலாம்."
        : "Hello! I'm the farmGo AI Assistant. Ask me about crop pricing, vehicle fares, market info, booking steps, or any agricultural logistics question!";
    }
    // Default
    return isTa
      ? "நான் பயிர் விலைகள், வாகன வகைகள், சந்தை தகவல்கள் பற்றி உங்களுக்கு உதவ முடியும். உதாரணம்: 'தக்காளி கட்டணம் என்ன?' அல்லது 'reefer truck தேவையா?' என்று கேளுங்கள்."
      : "I can help with crop prices, vehicle types, market info, and booking. Try asking: 'What vehicle for mangoes?', 'Cost from Salem to Chennai?', or 'How to book a truck?'";
  };

  const handleSendMessage = () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    setMessages(prev => [...prev, { sender: "user", text: userMessage }]);
    setInput("");
    setIsLoading(true);

    // Try backend first, fallback to local knowledge base
    const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";
    fetch(`${API_BASE}/api/v1/ai/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: userMessage }),
      signal: AbortSignal.timeout(4000)  // 4 second timeout
    })
      .then(res => res.json())
      .then(data => {
        setIsLoading(false);
        if (data && data.response) {
          setMessages(prev => [...prev, { sender: "bot", text: data.response }]);
        } else {
          setMessages(prev => [...prev, { sender: "bot", text: getOfflineResponse(userMessage) }]);
        }
      })
      .catch(() => {
        setIsLoading(false);
        // Use local knowledge base when backend is offline
        const offlineReply = getOfflineResponse(userMessage);
        setMessages(prev => [...prev, { sender: "bot", text: offlineReply }]);
      });
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {/* COLLAPSED BUTTON */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-emerald-500 hover:bg-emerald-600 text-white p-4 rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300 relative flex items-center justify-center border-0 cursor-pointer group"
        >
          <span className="absolute -inset-0.5 bg-emerald-500 rounded-full blur opacity-30 group-hover:opacity-50 transition duration-1000 group-hover:duration-200 animate-pulse"></span>
          <MessageSquare className="h-6 w-6 relative z-10" />
        </button>
      )}

      {/* EXPANDED CHAT DRAWER */}
      {isOpen && (
        <div className="w-80 sm:w-96 bg-white/95 backdrop-blur-md border border-slate-200 rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[480px] animate-fadeIn">
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-500 to-green-600 text-white px-5 py-4 flex items-center justify-between shadow-sm">
            <div className="flex items-center space-x-2.5">
              <div className="bg-white/20 p-2 rounded-xl">
                <Bot className="h-5 w-5 text-white" />
              </div>
              <div>
                <h4 className="font-extrabold text-sm tracking-tight leading-tight">FarmGo Assistant</h4>
                <div className="flex items-center space-x-1 mt-0.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-300 animate-ping" />
                  <span className="text-[10px] text-emerald-100 font-semibold uppercase tracking-wider">Online</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {/* Language Selector */}
              <button
                onClick={handleToggleLanguage}
                className="bg-white/25 hover:bg-white/35 text-white font-extrabold text-[10px] px-2.5 py-1 rounded-full transition-all uppercase tracking-wider border-0 cursor-pointer"
                title="Switch Language / மொழியை மாற்றுக"
              >
                🌐 {language === "en" ? "English" : "தமிழ்"}
              </button>

              <button
                onClick={() => setIsOpen(false)}
                className="text-white hover:text-slate-100 p-1.5 rounded-lg hover:bg-white/10 transition-all border-0 bg-transparent cursor-pointer flex items-center justify-center"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>
          </div>

          {/* Messages list */}
          <div className="flex-1 overflow-y-auto p-5 bg-slate-50/50 flex flex-col">
            <div className="space-y-4 flex-1">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-xs font-medium leading-relaxed shadow-sm ${
                      msg.sender === "user"
                        ? "bg-emerald-500 text-white rounded-br-none"
                        : "bg-white text-slate-800 border border-slate-100 rounded-bl-none"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start animate-fadeIn">
                  <div className="bg-white border border-slate-100 rounded-2xl rounded-bl-none px-4 py-2 flex items-center space-x-2 shadow-sm">
                    <span className="text-[10px] font-black tracking-tighter select-none animate-logo-loading">
                      <span className="text-emerald-500">farm</span><span className="text-slate-900">Go</span>
                    </span>
                    <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider animate-pulse">typing...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Scrolling Watermark Logo at the bottom of the list */}
            <div className="text-center py-6 select-none opacity-[0.12] flex items-center justify-center flex-shrink-0 mt-4 border-t border-slate-200/40">
              <span className="text-3xl font-black tracking-tighter">
                <span className="text-emerald-600 font-black">farm</span><span className="text-slate-900 font-black">Go</span>
              </span>
            </div>
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input Panel */}
          <div className="p-3 bg-white border-t border-slate-150 flex items-center space-x-2">
            {/* Mic Toggle Button */}
            <button
              onClick={handleToggleMic}
              className={`p-2.5 rounded-2xl transition-all border-0 cursor-pointer flex items-center justify-center ${
                isListening
                  ? "bg-red-500 text-white animate-pulse"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-500"
              }`}
              title={isListening ? "Listening... Speak now" : "Speak (Bilingual)"}
            >
              <Mic className="h-4.5 w-4.5" />
            </button>

            <input
              type="text"
              placeholder={language === "en" ? "Ask anything (e.g. Tomato pricing Madurai)" : "கேளுங்கள் (எ.கா. தக்காளி விலை மதுரை)"}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              className="flex-1 border border-slate-200 rounded-2xl px-4 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-slate-50 focus:bg-white transition-all"
            />
            
            <button
              onClick={handleSendMessage}
              className="bg-emerald-500 hover:bg-emerald-600 text-white p-2.5 rounded-2xl shadow-md active:scale-95 transition-all border-0 cursor-pointer flex items-center justify-center"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
