import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Compass, Camera, Utensils } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { LocationCard } from "@/components/LocationCard";
import { Button } from "@/components/ui/button";
import { buildCanonicalUrl } from "@/lib/seo";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Du Lịch Gia Lai — Khám phá vẻ đẹp cao nguyên Pleiku" },
      { name: "description", content: "Cẩm nang du lịch Gia Lai: 5 địa điểm nổi bật, lịch trình chi tiết, ẩm thực đặc sản. Biển Hồ, Chư Đăng Ya, thác Phú Cường, chùa Minh Thành." },
      { property: "og:title", content: "Du Lịch Gia Lai — Khám phá vẻ đẹp cao nguyên Pleiku" },
      { property: "og:description", content: "Cẩm nang du lịch Gia Lai đầy đủ nhất: địa điểm, lịch trình, ẩm thực, video & bản đồ." },
      { property: "og:image", content: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600&q=80" },
      { property: "og:url", content: buildCanonicalUrl("/") },
      { name: "twitter:title", content: "Du Lịch Gia Lai — Khám phá vẻ đẹp cao nguyên Pleiku" },
      { name: "twitter:description", content: "Cẩm nang du lịch Gia Lai đầy đủ nhất: địa điểm, lịch trình, ẩm thực, video & bản đồ." },
      { name: "twitter:image", content: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600&q=80" },
    ],
    links: [{ rel: "canonical", href: buildCanonicalUrl("/") }],
  }),
  component: HomePage,
});

function HomePage() {
  const { data: featured } = useQuery({
    queryKey: ["locations", "featured"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("locations")
        .select("slug,name,short_description,images")
        .eq("featured", true)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const { data: foods } = useQuery({
    queryKey: ["foods", "preview"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("foods")
        .select("id,name,description,image")
        .limit(4);
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      {/* Hero */}
      <section className="relative h-[80vh] min-h-[500px] w-full overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80"
          alt="Biển Hồ Pleiku Gia Lai"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/40 to-black/70" />
        <div className="container relative z-10 mx-auto flex h-full flex-col items-center justify-center px-4 text-center text-white">
          <span className="rounded-full border border-white/30 bg-white/10 px-4 py-1.5 text-xs font-medium uppercase tracking-widest backdrop-blur-sm">
            Cao nguyên Pleiku
          </span>
          <h1 className="mt-6 font-display text-5xl font-bold leading-tight md:text-7xl">
            Khám phá vẻ đẹp<br />
            <span className="text-sun">Gia Lai</span>
          </h1>
          <p className="mt-6 max-w-2xl text-base text-white/85 md:text-lg">
            Từ mặt hồ T'Nưng phẳng lặng đến những sườn núi lửa rực vàng dã quỳ,
            Gia Lai là vùng đất của thiên nhiên hoang sơ và văn hóa Tây Nguyên đậm đà.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg" className="bg-sun text-sun-foreground hover:bg-sun/90">
              <Link to="/dia-diem">
                Khám phá ngay <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white/40 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20 hover:text-white">
              <Link to="/lich-trinh">Xem lịch trình</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Quick highlights */}
      <section className="container mx-auto grid gap-4 px-4 py-12 md:grid-cols-3">
        {[
          { icon: Compass, title: "5 địa điểm nổi bật", desc: "Tổng hợp những điểm đến không thể bỏ lỡ ở Gia Lai." },
          { icon: Camera, title: "Video & bản đồ thực tế", desc: "Mỗi địa điểm có video YouTube và Google Maps tích hợp." },
          { icon: Utensils, title: "Ẩm thực đặc sản", desc: "Phở khô, bún mắm cua, bò một nắng và nhiều món hơn." },
        ].map((item) => (
          <div key={item.title} className="rounded-2xl border border-border bg-card p-6 shadow-card">
            <item.icon className="h-8 w-8 text-primary" />
            <h3 className="mt-4 font-display text-lg font-bold text-foreground">{item.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{item.desc}</p>
          </div>
        ))}
      </section>

      {/* Featured locations */}
      <section className="container mx-auto px-4 py-12">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-primary">Địa điểm nổi bật</p>
            <h2 className="mt-2 font-display text-3xl font-bold text-foreground md:text-4xl">
              Khám phá Gia Lai
            </h2>
          </div>
          <Link to="/dia-diem" className="hidden text-sm font-medium text-primary hover:underline md:inline">
            Xem tất cả →
          </Link>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featured?.map((loc) => <LocationCard key={loc.slug} location={loc} />)}
        </div>
      </section>

      {/* Itinerary CTA */}
      <section className="container mx-auto my-12 px-4">
        <div className="overflow-hidden rounded-3xl bg-gradient-hero p-8 text-white md:p-14">
          <div className="grid gap-8 md:grid-cols-2 md:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-sun">Lịch trình gợi ý</p>
              <h2 className="mt-2 font-display text-3xl font-bold md:text-4xl">
                1 ngày hay 2 ngày — chúng tôi đã lên sẵn cho bạn
              </h2>
              <p className="mt-4 text-white/85">
                Lịch trình chi tiết theo giờ, kết hợp tham quan và ẩm thực địa phương.
              </p>
              <Button asChild size="lg" className="mt-6 bg-sun text-sun-foreground hover:bg-sun/90">
                <Link to="/lich-trinh">Xem lịch trình</Link>
              </Button>
            </div>
            <div className="grid gap-4">
              <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-sm">
                <p className="text-xs text-white/70">1 NGÀY</p>
                <p className="mt-1 font-display text-lg font-bold">Pleiku tinh hoa phố núi</p>
              </div>
              <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-sm">
                <p className="text-xs text-white/70">2 NGÀY 1 ĐÊM</p>
                <p className="mt-1 font-display text-lg font-bold">Pleiku – Chư Păh trọn vẹn</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Food preview */}
      <section className="container mx-auto px-4 py-12">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-primary">Ẩm thực Gia Lai</p>
            <h2 className="mt-2 font-display text-3xl font-bold text-foreground md:text-4xl">Đặc sản phố núi</h2>
          </div>
          <Link to="/am-thuc" className="hidden text-sm font-medium text-primary hover:underline md:inline">
            Xem tất cả →
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {foods?.map((f) => (
            <div key={f.id} className="overflow-hidden rounded-2xl bg-card shadow-card">
              <div className="aspect-square overflow-hidden bg-muted">
                {f.image && <img src={f.image} alt={f.name} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 hover:scale-110" />}
              </div>
              <div className="p-4">
                <h3 className="font-display text-base font-bold text-foreground">{f.name}</h3>
                <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{f.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
