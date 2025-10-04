"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { IconArrowLeft, IconCalendar } from "@tabler/icons-react";
import { toast } from "sonner";

interface HarvestData {
  id: number;
  harvestAmount: number;
  harvestType: string;
  harvestDate: string;
}

export default function HarvestDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [harvest, setHarvest] = useState<HarvestData | null>(null);

  useEffect(() => {
    const fetchHarvest = async () => {
      try {
        const res = await fetch(`/api/harvest/${params.id}`);

        if (res.ok) {
          const data = await res.json();
          setHarvest(data);
        } else {
          toast.error("Failed to load harvest details");
          router.push("/harvest");
        }
      } catch {
        toast.error("Something went wrong");
        router.push("/harvest");
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchHarvest();
    }
  }, [params.id, router]);

  if (loading) {
    return (
      <Card className="max-w-md mx-auto mt-8">
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">Loading...</p>
        </CardContent>
      </Card>
    );
  }

  if (!harvest) {
    return null;
  }

  return (
    <Card className="max-w-md mx-auto mt-8">
      <CardHeader>
        <CardTitle>Harvest Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Harvest Amount */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Harvest Amount</label>
          <div className="text-lg">{harvest.harvestAmount} lbs</div>
        </div>

        {/* Harvest Type */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Harvest Type</label>
          <div className="text-lg">{harvest.harvestType}</div>
        </div>

        {/* Harvest Date */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Harvest Date</label>
          <div className="flex items-center text-lg">
            <IconCalendar className="mr-2 h-4 w-4 text-muted-foreground" />
            {format(new Date(harvest.harvestDate), "MM-dd-yyyy")}
          </div>
        </div>

        <Button
          variant="outline"
          onClick={() => router.push("/harvest")}
          className="w-full"
        >
          <IconArrowLeft className="mr-2 h-4 w-4" />
          Back to Harvests
        </Button>
      </CardContent>
    </Card>
  );
}
