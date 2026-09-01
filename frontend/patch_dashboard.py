"""
Patch Farmer/Dashboard.tsx:
1. Replace GoogleMapComponent with custom A/B pins version
2. Replace "Need Quick Logistics Matching?" banner with split-panel card + map preview
3. Apply all cosmetic fixes (language toggle, crop logo on AI loader)
"""
import re

filepath = "src/pages/Farmer/Dashboard.tsx"
with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

# ──────────────────────────────────────────────────────────────────────────────
# 1. Replace GoogleMapComponent
# ──────────────────────────────────────────────────────────────────────────────
old_map = r"""function GoogleMapComponent({ pickup, destination }: GoogleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";

    const initMap = () => {
      if (!mapRef.current) return;
      const google = (window as any).google;
      if (!google) return;
      
      const map = new google.maps.Map(mapRef.current, {
        center: { lat: 10.7905, lng: 78.7047 }, // Center of Tamil Nadu
        zoom: 7,
      });

      const directionsService = new google.maps.DirectionsService();
      const directionsRenderer = new google.maps.DirectionsRenderer({
        map: map,
        suppressMarkers: false
      });

      const cleanDestination = destination.split(" (")[0] + ", Tamil Nadu, India";

      const fallbackRoute = () => {
        const cleanPickup = pickup.split(" (")[0] + ", Tamil Nadu, India";
        directionsService.route(
          {
            origin: cleanPickup,
            destination: cleanDestination,
            travelMode: google.maps.TravelMode.DRIVING
          },
          (result: any, status: any) => {
            if (status === google.maps.DirectionsStatus.OK) {
              directionsRenderer.setDirections(result);
            } else {
              console.error("Directions request failed due to " + status);
            }
          }
        );
      };

      // Try live geolocation
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const userLatLng = new google.maps.LatLng(
              position.coords.latitude,
              position.coords.longitude
            );

            // Set marker for live position
            new google.maps.Marker({
              position: userLatLng,
              map: map,
              title: "Your Location",
              icon: {
                url: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png"
              }
            });

            directionsService.route(
              {
                origin: userLatLng,
                destination: cleanDestination,
                travelMode: google.maps.TravelMode.DRIVING
              },
              (result: any, status: any) => {
                if (status === google.maps.DirectionsStatus.OK) {
                  directionsRenderer.setDirections(result);
                } else {
                  console.warn("Directions request from live location failed, falling back to selected pickup city: " + status);
                  fallbackRoute();
                }
              }
            );
          },
          (error) => {
            console.warn("Geolocation permission denied or timed out, using fallback pickup city.", error);
            fallbackRoute();
          },
          { enableHighAccuracy: true, timeout: 5000 }
        );
      } else {
        fallbackRoute();
      }
    };

    if (!(window as any).google) {
      const script = document.createElement("script");
      script.id = "google-maps-script";
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        initMap();
      };
      document.head.appendChild(script);
    } else {
      initMap();
    }
  }, [pickup, destination]);

  return <div ref={mapRef} className="w-full h-full min-h-[350px] rounded-2xl overflow-hidden" />;
}"""

new_map = '''function GoogleMapComponent({ pickup, destination }: GoogleMapProps) {
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

      const cleanPickup = pickup.split(" (")[0] + ", Tamil Nadu, India";
      const cleanDestination = destination.split(" (")[0] + ", Tamil Nadu, India";
      const geocoder = new google.maps.Geocoder();

      const placeMarkersAndRoute = (originLatLng: any, destLatLng: any) => {
        new google.maps.Marker({ position: originLatLng, map, icon: makePin("#10b981", "A"), title: `Pickup: ${pickup}`, zIndex: 10 });
        new google.maps.Marker({ position: destLatLng, map, icon: makePin("#ef4444", "B"), title: `Destination: ${destination}`, zIndex: 10 });
        directionsService.route(
          { origin: originLatLng, destination: destLatLng, travelMode: google.maps.TravelMode.DRIVING },
          (result: any, status: any) => { if (status === google.maps.DirectionsStatus.OK) directionsRenderer.setDirections(result); }
        );
        const bounds = new google.maps.LatLngBounds();
        bounds.extend(originLatLng);
        bounds.extend(destLatLng);
        map.fitBounds(bounds, { top: 60, bottom: 60, left: 40, right: 40 });
      };

      geocoder.geocode({ address: cleanPickup }, (pr: any, ps: any) => {
        if (ps === "OK" && pr[0]) {
          const originLatLng = pr[0].geometry.location;
          geocoder.geocode({ address: cleanDestination }, (dr: any, ds: any) => {
            if (ds === "OK" && dr[0]) placeMarkersAndRoute(originLatLng, dr[0].geometry.location);
          });
        } else {
          directionsService.route(
            { origin: cleanPickup, destination: cleanDestination, travelMode: google.maps.TravelMode.DRIVING },
            (result: any, status: any) => { if (status === google.maps.DirectionsStatus.OK) directionsRenderer.setDirections(result); }
          );
        }
      });
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
      <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm rounded-xl px-3 py-2 shadow-md border border-slate-100 flex flex-col space-y-1 text-xs font-bold">
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
}'''

if old_map in content:
    content = content.replace(old_map, new_map)
    print("✅ GoogleMapComponent replaced")
else:
    print("❌ Could not find GoogleMapComponent to replace")

# ──────────────────────────────────────────────────────────────────────────────
# 2. Replace the "Need Quick Logistics Matching?" banner with split-panel card
# ──────────────────────────────────────────────────────────────────────────────
old_banner = '''          {/* Centered Logistics Matching Card */}
          <div className="bg-gradient-to-br from-emerald-500 to-green-600 text-white rounded-3xl p-8 shadow-sm flex flex-col items-center justify-center text-center space-y-6 max-w-4xl mx-auto w-full">
            <div className="space-y-2">
              <h3 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
                {isTamil ? "வேகமான சரக்கு பொருத்தம்" : "Need Quick Logistics Matching?"}
              </h3>
              <p className="text-sm text-emerald-100 max-w-2xl mx-auto font-medium">
                {isTamil ? "எங்களின் AI அல்காரிதம் மூலம் உங்கள் பழங்கள் அல்லது காய்கறிகளுக்கு சிறந்த குளிர்சாதன பெட்டிகளை உடனே தேர்வு செய்யலாம." : "Use our AI matching algorithm to immediately predict shelf life, refrigerator requirements, and dispatch vehicles."}
              </p>
            </div>

            <button
              onClick={() => {
                setShowWizard(true);
                setWizardStep(1);
              }}
              className="bg-white text-emerald-600 font-bold px-8 py-4 rounded-2xl hover:bg-emerald-50 transition-all text-sm flex items-center justify-center space-x-2 shadow-md w-full sm:w-auto"
            >
              <Plus className="h-5 w-5" />
              <span>{t.bookLogistics}</span>
            </button>
          </div>'''

new_banner = '''          {/* Quick Booking + Live Map Preview */}
          <div className="bg-gradient-to-br from-emerald-500 to-green-600 rounded-3xl shadow-lg overflow-hidden max-w-4xl mx-auto w-full">
            <div className="grid grid-cols-1 lg:grid-cols-2">
              <div className="p-8 flex flex-col justify-between space-y-5">
                <div className="space-y-2">
                  <div className="inline-flex items-center space-x-2 bg-white/20 text-white text-xs font-bold px-3 py-1.5 rounded-full">
                    <Sprout className="h-3.5 w-3.5" />
                    <span>{isTamil ? "AI சரக்கு பொருத்தி" : "AI Logistics Matcher"}</span>
                  </div>
                  <h3 className="text-2xl font-black text-white tracking-tight leading-tight">
                    {isTamil ? "வேகமான சரக்கு பொருத்தம்?" : "Need Quick Logistics?"}
                  </h3>
                  <p className="text-sm text-emerald-100 font-medium leading-relaxed">
                    {isTamil ? "இடத்தை தேர்வு செய்து AI மூலம் சிறந்த வாகனம் கண்டுபிடிக்கவும்." : "Pick your route and book the AI-matched vehicle instantly."}
                  </p>
                </div>
                <div className="space-y-3">
                  <div className="bg-white/10 border border-white/20 rounded-2xl p-3 flex items-center space-x-3">
                    <div className="bg-emerald-400 text-white h-6 w-6 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0">A</div>
                    <div className="flex-1">
                      <p className="text-[10px] text-emerald-100 font-bold uppercase tracking-wider mb-0.5">{isTamil ? "புறப்பாட்டு இடம்" : "Pickup Location"}</p>
                      <select value={pickupLocation} onChange={(e) => setPickupLocation(e.target.value)} className="bg-transparent text-white font-semibold text-sm w-full outline-none cursor-pointer">
                        {TN_LOCATIONS.map((loc) => (<option key={loc} value={loc} className="text-slate-900 bg-white">{loc}</option>))}
                      </select>
                    </div>
                  </div>
                  <div className="bg-white/10 border border-white/20 rounded-2xl p-3 flex items-center space-x-3">
                    <div className="bg-red-400 text-white h-6 w-6 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0">B</div>
                    <div className="flex-1">
                      <p className="text-[10px] text-emerald-100 font-bold uppercase tracking-wider mb-0.5">{isTamil ? "சேருமிடம் (சந்தை)" : "Destination Market"}</p>
                      <select value={destinationLocation} onChange={(e) => setDestinationLocation(e.target.value)} className="bg-transparent text-white font-semibold text-sm w-full outline-none cursor-pointer">
                        {TN_LOCATIONS.map((loc) => (<option key={loc} value={loc} className="text-slate-900 bg-white">{loc}</option>))}
                      </select>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => { setShowWizard(true); setWizardStep(1); }}
                  className="bg-white text-emerald-600 font-bold px-8 py-4 rounded-2xl hover:bg-emerald-50 transition-all text-sm flex items-center justify-center space-x-2 shadow-md w-full"
                >
                  <Plus className="h-5 w-5" />
                  <span>{t.bookLogistics}</span>
                </button>
              </div>
              <div className="relative h-72 lg:h-auto min-h-[260px] overflow-hidden">
                <div className="absolute inset-0">
                  <GoogleMapComponent pickup={pickupLocation} destination={destinationLocation} />
                </div>
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-emerald-700 text-[10px] font-black px-2.5 py-1.5 rounded-full border border-emerald-100 shadow">
                  \U0001f5fa\ufe0f {isTamil ? "உண்மை நேர வழிபடம்" : "Live Route Preview"}
                </div>
              </div>
            </div>
          </div>'''

if old_banner in content:
    content = content.replace(old_banner, new_banner)
    print("✅ Home booking banner replaced with split-panel map card")
else:
    print("❌ Could not find old banner to replace")
    # Show context around the expected location
    idx = content.find("Centered Logistics Matching Card")
    if idx >= 0:
        print("Found nearby text at char", idx)
        print(repr(content[idx:idx+200]))

# ──────────────────────────────────────────────────────────────────────────────
# 3. Fix language toggle: remove Chinese char, use Sprout + தE
# ──────────────────────────────────────────────────────────────────────────────
old_toggle = '''            <button
              onClick={() => setIsTamil(!isTamil)}
              className="border border-emerald-500 text-emerald-600 font-bold px-3 py-1.5 rounded-xl hover:bg-emerald-50 transition-all text-xs flex items-center space-x-1"
            >
              <span>文A தE</span>
            </button>'''

new_toggle = '''            <button
              onClick={() => setIsTamil(!isTamil)}
              className="border border-emerald-500 text-emerald-600 font-bold px-3 py-1.5 rounded-xl hover:bg-emerald-50 transition-all text-xs flex items-center space-x-2"
            >
              <Sprout className="h-3.5 w-3.5" />
              <span>தE</span>
            </button>'''

if old_toggle in content:
    content = content.replace(old_toggle, new_toggle)
    print("✅ Language toggle fixed")
else:
    print("⚠️ Language toggle already fixed or not found")

# ──────────────────────────────────────────────────────────────────────────────
# 4. Fix AI loader: replace robot emoji with Sprout crop icon
# ──────────────────────────────────────────────────────────────────────────────
old_robot = '                    <span className="text-3xl">\U0001f916</span>'
new_robot = '                    <Sprout className="h-10 w-10 text-emerald-500" />'

if old_robot in content:
    content = content.replace(old_robot, new_robot)
    print("✅ Robot emoji replaced with Sprout")
else:
    print("⚠️ Robot emoji already replaced or not found")

with open(filepath, "w", encoding="utf-8") as f:
    f.write(content)

print("\n✅ Patch complete. File written.")
