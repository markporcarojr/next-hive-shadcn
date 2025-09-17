"use client";

import { IncomeInput, incomeSchema } from "@/lib/schemas/income";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function EditIncomePage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [formData, setFormData] = useState<IncomeInput | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchIncome = async () => {
      try {
        const res = await fetch(`/api/income/${id}`);
        if (!res.ok) throw new Error("Failed to fetch income");
        const data = await res.json();
        setFormData(data);
      } catch (err) {
        setError("Failed to load income record.");
      } finally {
        setLoading(false);
      }
    };

    fetchIncome();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;

    try {
      incomeSchema.parse(formData);
      const res = await fetch(`/api/income/${id}`, {
        method: "PATCH",
        body: JSON.stringify(formData),
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) throw new Error("Failed to update income");
      router.push("/finance");
    } catch (err) {
      setError("Something went wrong while saving.");
      console.error(err);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!formData) return null;

  return (
    <div className="max-w-md mx-auto p-6">
      <h3 className="text-2xl font-semibold mb-4">Edit Income</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="source">Source</Label>
          <Input
            id="source"
            placeholder="Sold honey or candles....."
            value={formData.source}
            onChange={(e) =>
              setFormData({ ...formData, source: e.target.value })
            }
            required
          />
        </div>
        <div>
          <Label htmlFor="amount">Amount</Label>
          <Input
            id="amount"
            type="number"
            value={formData.amount}
            onChange={(e) =>
              setFormData({ ...formData, amount: Number(e.target.value) })
            }
            required
            step={0.01}
            min={0}
          />
        </div>
        <div>
          <Label htmlFor="date">Date</Label>
          <Input
            id="date"
            type="date"
            value={formData.date.toString().slice(0, 10)}
            onChange={(e) =>
              setFormData({ ...formData, date: new Date(e.target.value) })
            }
            required
          />
        </div>
        <Button type="submit" className="w-full mt-2">
          Update Income
        </Button>
      </form>
    </div>
  );
}
