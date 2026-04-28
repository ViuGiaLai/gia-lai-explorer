import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { MapPin, Calendar, Utensils, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
});

function AdminDashboard() {
  const { data: stats } = useQuery({
    queryKey: ["admin", "stats"],
    queryFn: async () => {
      const [loc, it, fd] = await Promise.all([
        supabase.from("locations").select("id", { count: "exact", head: true }),
        supabase.from("itineraries").select("id", { count: "exact", head: true }),
        supabase.from("foods").select("id", { count: "exact", head: true }),
      ]);
      return { locations: loc.count ?? 0, itineraries: it.count ?? 0, foods: fd.count ?? 0 };
    },
  });

  const { data: recent } = useQuery({
    queryKey: ["admin", "recent-locations"],
    queryFn: async () => {
      const { data } = await supabase
        .from("locations")
        .select("id,name,slug,featured,created_at")
        .order("created_at", { ascending: false })
        .limit(5);
      return data ?? [];
    },
  });

  const cards = [
    { label: "Địa điểm", value: stats?.locations ?? 0, icon: MapPin, color: "bg-primary/10 text-primary" },
    { label: "Lịch trình", value: stats?.itineraries ?? 0, icon: Calendar, color: "bg-sun/20 text-sun-foreground" },
    { label: "Món ăn", value: stats?.foods ?? 0, icon: Utensils, color: "bg-earth/15 text-earth" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">Tổng quan nội dung trên website</p>
        </div>
        <Button asChild>
          <Link to="/admin/dia-diem">Quản lý địa điểm</Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {cards.map((c) => (
          <div key={c.label} className="rounded-2xl border border-border bg-card p-6 shadow-card">
            <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${c.color}`}>
              <c.icon className="h-6 w-6" />
            </div>
            <p className="mt-4 text-sm text-muted-foreground">{c.label}</p>
            <p className="mt-1 font-display text-3xl font-bold text-foreground">{c.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-border bg-card shadow-card">
        <div className="flex items-center justify-between border-b border-border p-5">
          <h2 className="font-display text-lg font-bold text-foreground">Địa điểm mới nhất</h2>
          <Button asChild size="sm" variant="outline">
            <Link to="/admin/dia-diem/$id" params={{ id: "moi" }}><Plus className="mr-1 h-4 w-4" /> Thêm mới</Link>
          </Button>
        </div>
        <div className="divide-y divide-border">
          {recent?.length === 0 && <p className="p-5 text-sm text-muted-foreground">Chưa có địa điểm nào.</p>}
          {recent?.map((loc) => (
            <Link
              key={loc.id}
              to="/admin/dia-diem/$id"
              params={{ id: loc.id }}
              className="flex items-center justify-between p-5 transition hover:bg-muted/50"
            >
              <div>
                <p className="font-medium text-foreground">{loc.name}</p>
                <p className="text-xs text-muted-foreground">/{loc.slug}</p>
              </div>
              {loc.featured && <span className="rounded-full bg-sun/20 px-2 py-0.5 text-xs font-medium text-sun-foreground">Nổi bật</span>}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
