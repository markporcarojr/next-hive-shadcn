"use client";

import { useLeafletGestureSetup } from "@/lib/setupLeafletGesture";

export default function ClientSetup() {
  useLeafletGestureSetup();
  return null; // no UI needed — this just runs once
}
