"use client";

import dynamic from "next/dynamic";

// ✅ Dynamically import the actual map component
const ApiaryMap = dynamic(() => import("./apiary-map"), {
  ssr: false,
  loading: () => <div className="h-[500px] w-full bg-muted animate-pulse" />,
});

export default function ApiaryMapWrapper() {
  return <ApiaryMap zoom={16} height="500px" />;
}
