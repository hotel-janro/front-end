import React, { useEffect, useRef } from 'react';

// MapPicker.jsx - Luxury Draggable Map Picker using Leaflet
export function MapPicker({ coordinates, onChange, defaultCenter = [6.9458, 80.1250] }) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);

  useEffect(() => {
    if (!window.L || !mapContainerRef.current) return;

    const L = window.L;

    // Use current coordinates or default to Hotel Janro location
    const initialCenter = coordinates ? [coordinates.lat, coordinates.lng] : defaultCenter;
    const initialZoom = coordinates ? 15 : 13;

    // Initialize Leaflet Map
    const mapInstance = L.map(mapContainerRef.current, {
      zoomControl: true,
      attributionControl: false
    }).setView(initialCenter, initialZoom);
    mapRef.current = mapInstance;

    // Premium minimal tile style using CartoDB Positron (clean & luxury look)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      maxZoom: 20
    }).addTo(mapInstance);

    // Luxury SVG Pin Icon (matching hotel theme `#0F172A` & `#D4AF37`)
    const pinSvg = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="36" height="36" style="filter: drop-shadow(0px 3px 6px rgba(0,0,0,0.3));">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="#0F172A" stroke="#D4AF37" stroke-width="1.5" />
      </svg>
    `;

    const pinIcon = L.divIcon({
      html: pinSvg,
      className: 'luxury-map-pin',
      iconSize: [36, 36],
      iconAnchor: [18, 36]
    });

    // Create Marker
    const markerInstance = L.marker(initialCenter, {
      draggable: true,
      icon: pinIcon
    }).addTo(mapInstance);
    markerRef.current = markerInstance;

    // Handle marker drag events to capture exact latitude & longitude
    markerInstance.on('dragend', () => {
      const position = markerInstance.getLatLng();
      if (onChange) {
        onChange({ lat: position.lat, lng: position.lng });
      }
    });

    // Click on map to place pin
    mapInstance.on('click', (e) => {
      const { lat, lng } = e.latlng;
      markerInstance.setLatLng([lat, lng]);
      if (onChange) {
        onChange({ lat, lng });
      }
    });

    // Cleanup map on unmount
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Update marker position and center map when external coordinates (geolocation/geocode) change
  useEffect(() => {
    if (!window.L || !mapRef.current || !markerRef.current) return;

    if (coordinates) {
      const currentMarkerPos = markerRef.current.getLatLng();
      if (currentMarkerPos.lat !== coordinates.lat || currentMarkerPos.lng !== coordinates.lng) {
        markerRef.current.setLatLng([coordinates.lat, coordinates.lng]);
        mapRef.current.setView([coordinates.lat, coordinates.lng], 15);
      }
    }
  }, [coordinates]);

  return (
    <div className="relative w-full mt-3 overflow-hidden border-2 border-slate-100 rounded-3xl group shadow-inner">
      <div 
        ref={mapContainerRef} 
        className="w-full h-[220px]"
        style={{ zIndex: 1 }}
      />
      <div className="absolute bottom-3 left-3 bg-[#0F172A]/90 text-[7px] text-[#D4AF37] px-3 py-1.5 rounded-full font-black uppercase tracking-widest z-10 border border-[#D4AF37]/20 pointer-events-none">
        Drag pin to your exact house
      </div>
    </div>
  );
}
