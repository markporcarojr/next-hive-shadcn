// lib/fetchData.ts
export async function fetchData<T>(url: string): Promise<T> {
  const res = await fetch(url);

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Error fetching ${url}: ${res.status} ${errorText}`);
  }

  const data: T = await res.json();
  return data;
}