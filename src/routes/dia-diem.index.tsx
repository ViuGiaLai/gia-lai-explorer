import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { LocationCard } from "@/components/LocationCard";
import { buildCanonicalUrl } from "@/lib/seo";

export const Route = createFileRoute("/dia-diem/")({
  head: () => ({
    meta: [
      { title: "Tất cả địa điểm du lịch Gia Lai" },
      { name: "description", content: "Danh sách đầy đủ các địa điểm du lịch nổi bật ở Gia Lai: Biển Hồ, Chư Đăng Ya, thác Phú Cường, chùa Minh Thành, hồ Ia Ly và nhiều nơi khác." },
      { property: "og:title", content: "Tất cả địa điểm du lịch Gia Lai" },
      { property: "og:description", content: "Khám phá danh sách địa điểm du lịch ở Gia Lai với ảnh, video, bản đồ và mẹo du lịch chi tiết." },
      { property: "og:url", content: buildCanonicalUrl("/dia-diem") },
    ],
    links: [{ rel: "canonical", href: buildCanonicalUrl("/dia-diem") }],
  }),
  component: LocationsListPage,
});

function LocationsListPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["locations", "all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("locations")
        .select("slug,name,short_description,images")
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <section className="container mx-auto px-4 py-12">
        <p className="text-sm font-semibold uppercase tracking-widest text-primary">Khám phá</p>
        <h1 className="mt-2 font-display text-4xl font-bold text-foreground md:text-5xl">
          Tất cả địa điểm
        </h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Tổng hợp những điểm đến đẹp nhất Gia Lai — từ thiên nhiên hùng vĩ đến những công trình tâm linh độc đáo.
        </p>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {isLoading && Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="aspect-[4/5] animate-pulse rounded-2xl bg-muted" />
          ))}
          {data?.map((loc) => <LocationCard key={loc.slug} location={loc} />)}
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
