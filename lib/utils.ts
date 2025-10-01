import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export async function fetchWeather(lat: number, lon: number) {
  const apiKey = process.env.NEXT_PUBLIC_OPENWEATHER_KEY; // 👈 put this in .env
  const res = await fetch(
    `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=imperial`
  );

  if (!res.ok) throw new Error("Failed to fetch weather");
  const data = await res.json();

  return {
    condition: data.weather?.[0]?.main || "Unknown",
    temperature: `${Math.round(data.main?.temp)}°F`,
  };
}
