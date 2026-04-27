import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

interface Stop {
  day?: number;
  time: string;
  title: string;
  description: string;
  location_slug?: string | null;
}

export const Route = createFileRoute("/lich-trinh")({
  head: () => ({
    meta: [
      { title: "Lịch trình du lịch Gia Lai 1-2 ngày" },
      { name: "description", content: "Lịch trình chi tiết khám phá Gia Lai trong 1 ngày hoặc 2 ngày 1 đêm: từ Biển Hồ, Chư Đăng Ya đến hồ Ia Ly và ẩm thực phố núi." },
      { property: "og:title", content: "Lịch trình du lịch Gia Lai 1-2 ngày" },
      { property: "og:description", content: "Gợi ý lịch trình chi tiết theo giờ cho chuyến đi Gia Lai." },
    ],
  }),
  component: ItineraryPage,
});

function ItineraryPage() {
  const { data: itineraries } = useQuery({
    queryKey: ["itineraries"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("itineraries")
        .select("*")
        .order("duration_days");
      if (error) throw error;
      return data;
    },
  });

  const [active, setActive] = useState(0);
  const current = itineraries?.[active];
  const stops = (current?.content as unknown as Stop[]) ?? [];

  // Group by day if multi-day
  const byDay: Record<number, Stop[]> = {};
  for (const s of stops) {
    const d = s.day ?? 1;
    (byDay[d] ||= []).push(s);
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <section className="container mx-auto px-4 py-12">
        <p className="text-sm font-semibold uppercase tracking-widest text-primary">Gợi ý chuyến đi</p>
        <h1 className="mt-2 font-display text-4xl font-bold text-foreground md:text-5xl">
          Lịch trình du lịch Gia Lai
        </h1>

        {itineraries && itineraries.length > 0 && (
          <>
            <div className="mt-8 flex flex-wrap gap-2 border-b border-border">
              {itineraries.map((it, idx) => (
                <button
                  key={it.id}
                  onClick={() => setActive(idx)}
                  className={`relative px-5 py-3 font-display text-sm font-semibold transition-colors ${idx === active ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
                >
                  {it.duration_days} ngày
                  {idx === active && <span className="absolute inset-x-0 bottom-0 h-0.5 bg-primary" />}
                </button>
              ))}
            </div>

            {current && (
              <div className="mt-8">
                <h2 className="font-display text-2xl font-bold text-foreground md:text-3xl">{current.title}</h2>
                <p className="mt-2 text-muted-foreground">{current.summary}</p>

                <div className="mt-10 space-y-12">
                  {Object.keys(byDay).sort().map((dayKey) => {
                    const day = Number(dayKey);
                    const dayStops = byDay[day];
                    return (
                      <div key={day}>
                        {current.duration_days > 1 && (
                          <div className="mb-6 inline-block rounded-full bg-primary px-4 py-1.5 font-display text-sm font-bold text-primary-foreground">
                            Ngày {day}
                          </div>
                        )}
                        <div className="relative space-y-6 border-l-2 border-primary/30 pl-6 md:pl-10">
                          {dayStops.map((stop, idx) => (
                            <div key={idx} className="relative">
                              <div className="absolute -left-[33px] flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground md:-left-[49px] md:h-8 md:w-8 md:text-sm">
                                {idx + 1}
                              </div>
                              <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
                                <div className="flex items-center gap-2 text-sm text-primary">
                                  <Clock className="h-4 w-4" /> {stop.time}
                                </div>
                                <h3 className="mt-2 font-display text-lg font-bold text-foreground">{stop.title}</h3>
                                <p className="mt-1 text-sm text-muted-foreground">{stop.description}</p>
                                {stop.location_slug && (
                                  <Link
                                    to="/dia-diem/$slug"
                                    params={{ slug: stop.location_slug }}
                                    className="mt-3 inline-block text-sm font-medium text-primary hover:underline"
                                  >
                                    Xem chi tiết địa điểm →
                                  </Link>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </section>
      <SiteFooter />
    </div>
  );
}
