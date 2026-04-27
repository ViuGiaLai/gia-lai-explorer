import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { LocationCard } from "@/components/LocationCard";
import { getSaved } from "@/lib/saved-locations";

export const Route = createFileRoute("/da-luu")({
  head: () => ({
    meta: [
      { title: "Địa điểm đã lưu — Du Lịch Gia Lai" },
      { name: "description", content: "Danh sách những địa điểm Gia Lai bạn đã lưu để xem lại sau." },
    ],
  }),
  ssr: false,
  component: SavedPage,
});

interface Loc {
  slug: string;
  name: string;
  short_description: string;
  images: string[];
}

function SavedPage() {
  const [locations, setLocations] = useState<Loc[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const slugs = getSaved();
    if (slugs.length === 0) {
      setLoading(false);
      return;
    }
    supabase
      .from("locations")
      .select("slug,name,short_description,images")
      .in("slug", slugs)
      .then(({ data }) => {
        setLocations(data ?? []);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <section className="container mx-auto px-4 py-12">
        <p className="text-sm font-semibold uppercase tracking-widest text-primary">Bộ sưu tập của bạn</p>
        <h1 className="mt-2 font-display text-4xl font-bold text-foreground md:text-5xl">
          Địa điểm đã lưu
        </h1>

        {loading ? (
          <p className="mt-8 text-muted-foreground">Đang tải...</p>
        ) : locations.length === 0 ? (
          <div className="mt-12 rounded-2xl border border-dashed border-border bg-card p-12 text-center">
            <Heart className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <p className="mt-4 text-lg text-muted-foreground">Bạn chưa lưu địa điểm nào.</p>
            <Link
              to="/dia-diem"
              className="mt-6 inline-block rounded-md bg-primary px-5 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Khám phá địa điểm
            </Link>
          </div>
        ) : (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {locations.map((loc) => <LocationCard key={loc.slug} location={loc} />)}
          </div>
        )}
      </section>
      <SiteFooter />
    </div>
  );
}
