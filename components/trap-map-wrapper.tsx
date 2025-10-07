"use client";

import dynamic from "next/dynamic";

// ✅ Dynamically import the Leaflet component (client-only)
const TrapMap = dynamic(() => import("./trap-map"), {
  ssr: false,
  loading: () => <p>Loading map...</p>,
});

interface TrapMapWrapperProps {
  zoom?: number;
  height?: string;
}

export default function TrapMapWrapper(props: TrapMapWrapperProps) {
  return <TrapMap {...props} />;
}
