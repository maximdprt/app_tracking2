"use client";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card } from "@/components/ui/Card";
import { createClient } from "@/services/supabase/client";
import { getWeeklyVolume } from "@/services/supabase/queries/stats";
export default function StatsPage() {
  const statsQuery = useQuery({
    queryKey: ["weekly-volume"],
    queryFn: async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return [];
      return getWeeklyVolume(supabase, user.id);
    },
  });
  return (
    <div className="space-y-6">
      <PageHeader title="Statistiques" subtitle="Tendance performance et adherence" />
      <Card className="h-80">
        <p className="text-text-soft mb-3 text-sm">Volume</p>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={statsQuery.data ?? []}>
            <defs>
              <linearGradient id="vol" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#A3E635" stopOpacity={0.5} />
                <stop offset="95%" stopColor="#A3E635" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="rgba(255,255,255,0.06)" />
            <XAxis dataKey="week" tick={{ fill: "#B4B4B8", fontSize: 12 }} />
            <YAxis tick={{ fill: "#B4B4B8", fontSize: 12 }} />
            <Tooltip />
            <Area dataKey="volume" stroke="#A3E635" fill="url(#vol)" />
          </AreaChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}
