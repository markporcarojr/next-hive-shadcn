// lib/setupLeafletGesture.ts
"use client";

import { useEffect } from "react";

export function useLeafletGestureSetup() {
  useEffect(() => {
    let mounted = true;

    (async () => {
      if (typeof window === "undefined") return;

      // Import Leaflet ONLY in the browser
      const L = (await import("leaflet")).default;

      // Import plugin ONLY in the browser
      const { GestureHandling } = await import("leaflet-gesture-handling");

      // Prevent re-init across renders/hot reload
      const proto = L.Map.prototype as unknown as {
        _gestureHandlingInitialized?: boolean;
      };

      if (!proto._gestureHandlingInitialized) {
        L.Map.addInitHook("addHandler", "gestureHandling", GestureHandling);
        proto._gestureHandlingInitialized = true;
      }

      // optional guard if component unmounts mid-import
      if (!mounted) return;
    })();

    return () => {
      mounted = false;
    };
  }, []);
}
