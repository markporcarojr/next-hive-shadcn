"use client";

import { useEffect } from "react";

export default function GoogleMapsScript() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    // If already loaded, fire event and skip
    if (window.google && window.google.maps) {
      window.dispatchEvent(new Event("google-maps-loaded"));
      return;
    }

    const script = document.createElement("script");
    script.id = "google-maps-script";
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places&v=weekly&loading=async`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      window.dispatchEvent(new Event("google-maps-loaded"));
    };

    script.onerror = (err) => {
      console.error("❌ Failed to load Google Maps script:", err);
    };

    document.body.appendChild(script);
  }, []);

  return null;
}
