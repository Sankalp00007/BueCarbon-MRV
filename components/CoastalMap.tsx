
import React, { useEffect, useRef, useState } from 'react';
import { Submission } from '../types.ts';

interface CoastalMapProps {
  submissions: Submission[];
  onMarkerClick?: (submission: Submission) => void;
  center?: { lat: number; lng: number };
  zoom?: number;
  className?: string;
}

const CoastalMap: React.FC<CoastalMapProps> = ({ 
  submissions, 
  onMarkerClick, 
  center, 
  zoom = 12,
  className = "w-full h-full rounded-[2rem]"
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [googleMapsLoaded, setGoogleMapsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      setError("GOOGLE_MAPS_API_KEY is not configured in environment variables.");
      return;
    }

    // Fix: Access google property through window casting to bypass TypeScript errors
    if ((window as any).google) {
      setGoogleMapsLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=geometry`;
    script.async = true;
    script.defer = true;
    script.onload = () => setGoogleMapsLoaded(true);
    script.onerror = () => setError("Failed to load Google Maps SDK. Please check your API key and network.");
    document.head.appendChild(script);

    return () => {
      // Script cleanup is usually not necessary for Google Maps
    };
  }, []);

  useEffect(() => {
    // Fix: Use a local variable to hold the google object from window for better scope handling
    const google = (window as any).google;
    if (!googleMapsLoaded || !mapRef.current || !google) return;

    // Fix: Replace google.maps.MapOptions with 'any' to avoid namespace errors
    const mapOptions: any = {
      center: center || (submissions.length > 0 ? submissions[0].location : { lat: 0, lng: 0 }),
      zoom: zoom,
      mapTypeId: 'satellite',
      tilt: 45,
      disableDefaultUI: false,
      zoomControl: true,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: true,
      styles: [
        { "featureType": "all", "elementType": "labels.text.fill", "stylers": [{ "color": "#ffffff" }] },
        { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#021019" }] }
      ]
    };

    const map = new google.maps.Map(mapRef.current, mapOptions);
    const bounds = new google.maps.LatLngBounds();

    submissions.forEach(sub => {
      const position = new google.maps.LatLng(sub.location.lat, sub.location.lng);
      bounds.extend(position);

      const markerColor = sub.type === 'MANGROVE' ? '#10b981' : '#0ea5e9';
      
      const marker = new google.maps.Marker({
        position,
        map,
        title: `${sub.type} - ${sub.userName}`,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          fillColor: markerColor,
          fillOpacity: 0.9,
          strokeWeight: 4,
          strokeColor: '#ffffff',
          scale: 10,
        },
        animation: google.maps.Animation.DROP
      });

      marker.addListener('click', () => {
        if (onMarkerClick) onMarkerClick(sub);
        
        const infoWindow = new google.maps.InfoWindow({
          content: `
            <div style="padding: 12px; font-family: 'Inter', sans-serif;">
              <p style="font-size: 10px; font-weight: 900; color: ${markerColor}; text-transform: uppercase; margin-bottom: 4px;">${sub.type} NODE</p>
              <h4 style="font-size: 14px; font-weight: 700; color: #1e293b; margin: 0;">${sub.userName}</h4>
              <p style="font-size: 11px; color: #64748b; margin-top: 4px;">${sub.region}</p>
              <p style="font-size: 12px; font-weight: 800; color: #1e293b; margin-top: 8px;">${sub.creditsGenerated} tCO2e</p>
            </div>
          `
        });
        infoWindow.open(map, marker);
      });
    });

    if (submissions.length > 1 && !center) {
      map.fitBounds(bounds);
    }
  }, [googleMapsLoaded, submissions, center, zoom]);

  if (error) {
    return (
      <div className={`${className} bg-slate-900 flex flex-col items-center justify-center p-8 text-center border border-white/10`}>
        <div className="w-16 h-16 bg-red-500/20 text-red-500 rounded-2xl flex items-center justify-center text-3xl mb-6">⚠️</div>
        <h3 className="text-white font-bold text-lg mb-2 uppercase tracking-tight">Map Initialization Required</h3>
        <p className="text-slate-400 text-sm max-w-xs leading-relaxed mb-6">{error}</p>
        <div className="bg-white/5 p-4 rounded-xl border border-white/10 text-left w-full max-w-sm">
           <p className="text-[10px] font-black text-sky-400 uppercase mb-2">Setup Guide:</p>
           <ol className="text-[11px] text-slate-300 space-y-2 list-decimal list-inside">
             <li>Go to Render Dashboard</li>
             <li>Add Environment Variable: <code className="bg-slate-800 px-1 py-0.5 rounded">GOOGLE_MAPS_API_KEY</code></li>
             <li>Paste your key and redeploy.</li>
           </ol>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full overflow-hidden rounded-[2rem] group shadow-2xl">
      <div ref={mapRef} className={className} />
      {!googleMapsLoaded && (
        <div className="absolute inset-0 bg-slate-900 flex items-center justify-center">
           <div className="flex flex-col items-center space-y-4">
             <div className="w-10 h-10 border-4 border-sky-500/20 border-t-sky-500 rounded-full animate-spin"></div>
             <p className="text-sky-500 text-[10px] font-black uppercase tracking-[0.3em]">Synching Satellites...</p>
           </div>
        </div>
      )}
    </div>
  );
};

export default CoastalMap;
