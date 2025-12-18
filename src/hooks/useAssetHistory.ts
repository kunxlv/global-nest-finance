import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

export interface AssetValuation {
  id: string;
  asset_id: string;
  valuation: number;
  currency: string;
  recorded_at: string;
  source: string;
}

export interface AssetHistoryData {
  valuations: AssetValuation[];
  isLoading: boolean;
  error: string | null;
  percentageChange: number | null;
  earliestValue: number | null;
  latestValue: number | null;
}

export function useAssetHistory(assetId: string): AssetHistoryData {
  const [valuations, setValuations] = useState<AssetValuation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user || !assetId) {
      setIsLoading(false);
      return;
    }

    const fetchHistory = async () => {
      setIsLoading(true);
      const { data, error: fetchError } = await supabase
        .from("asset_valuations")
        .select("*")
        .eq("asset_id", assetId)
        .eq("user_id", user.id)
        .order("recorded_at", { ascending: true });

      if (fetchError) {
        setError(fetchError.message);
        setValuations([]);
      } else {
        setValuations(data || []);
        setError(null);
      }
      setIsLoading(false);
    };

    fetchHistory();
  }, [assetId, user]);

  const earliestValue = valuations.length > 0 ? Number(valuations[0].valuation) : null;
  const latestValue = valuations.length > 0 ? Number(valuations[valuations.length - 1].valuation) : null;
  
  const percentageChange = earliestValue && latestValue && earliestValue !== 0
    ? ((latestValue - earliestValue) / earliestValue) * 100
    : null;

  return {
    valuations,
    isLoading,
    error,
    percentageChange,
    earliestValue,
    latestValue
  };
}

export interface PortfolioHistoryData {
  dataPoints: { date: string; value: number }[];
  isLoading: boolean;
  error: string | null;
}

export function usePortfolioHistory(period: "1M" | "3M" | "6M" | "1Y" | "ALL" = "ALL"): PortfolioHistoryData {
  const [dataPoints, setDataPoints] = useState<{ date: string; value: number }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    const fetchPortfolioHistory = async () => {
      setIsLoading(true);
      
      // Calculate date range based on period
      const now = new Date();
      let startDate: Date;
      
      switch (period) {
        case "1M":
          startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
          break;
        case "3M":
          startDate = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
          break;
        case "6M":
          startDate = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
          break;
        case "1Y":
          startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
          break;
        default:
          startDate = new Date(2020, 0, 1); // All time
      }

      let query = supabase
        .from("asset_valuations")
        .select("valuation, recorded_at, currency")
        .eq("user_id", user.id)
        .order("recorded_at", { ascending: true });

      if (period !== "ALL") {
        query = query.gte("recorded_at", startDate.toISOString());
      }

      const { data, error: fetchError } = await query;

      if (fetchError) {
        setError(fetchError.message);
        setDataPoints([]);
      } else {
        // Group by date and sum values (simplified - assumes same currency)
        const grouped = (data || []).reduce((acc, item) => {
          const date = new Date(item.recorded_at).toLocaleDateString();
          if (!acc[date]) {
            acc[date] = 0;
          }
          acc[date] += Number(item.valuation);
          return acc;
        }, {} as Record<string, number>);

        const points = Object.entries(grouped).map(([date, value]) => ({
          date,
          value
        }));

        setDataPoints(points);
        setError(null);
      }
      setIsLoading(false);
    };

    fetchPortfolioHistory();
  }, [user, period]);

  return {
    dataPoints,
    isLoading,
    error
  };
}
