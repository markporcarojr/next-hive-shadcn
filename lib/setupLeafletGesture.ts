// lib/setupLeafletGesture.ts
"use client";

import { useEffect } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Import inside the effect so it never runs on the server
export function useLeafletGestureSetup() {
  useEffect(() => {
    // Only run on the client
    if (typeof window === "undefined") return;

    // Dynamically import plugin
    import("leaflet-gesture-handling").then(({ GestureHandling }) => {
      // Prevent re-initialization
      if (
        !(
          L.Map.prototype as unknown as {
            _gestureHandlingInitialized?: boolean;
          }
        )._gestureHandlingInitialized
      ) {
        L.Map.addInitHook("addHandler", "gestureHandling", GestureHandling);
        (
          L.Map.prototype as unknown as { _gestureHandlingInitialized: boolean }
        )._gestureHandlingInitialized = true;
      }
    });
  }, []);
}
